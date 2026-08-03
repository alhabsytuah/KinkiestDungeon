"use strict";
/**
 * Phase 5d — Struggle as per-second physics (item 4)
 *
 * While KD_STRUGGLE_PHYS_ENABLED and player is in a "struggling" intent window,
 * accumulate progress and SP cost over real time (not only on button clicks).
 *
 * Safe: disabled in hard engage by default; small rates; uses existing progress fields.
 *
 * Enable:
 *   KD_STRUGGLE_PHYS_ENABLED = true;
 *   KDStrugglePhysStart("ItemArms"); // or auto from last struggle group
 */
(function KDStruggleRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_STRUGGLE_PHYS_ENABLED === "undefined") g.KD_STRUGGLE_PHYS_ENABLED = false;
	if (typeof g.KD_STRUGGLE_PHYS_IN_COMBAT === "undefined") g.KD_STRUGGLE_PHYS_IN_COMBAT = false;
	if (typeof g.KD_STRUGGLE_PHYS_RATE === "undefined") g.KD_STRUGGLE_PHYS_RATE = 0.08; // progress / second
	if (typeof g.KD_STRUGGLE_PHYS_SP_PER_SEC === "undefined") g.KD_STRUGGLE_PHYS_SP_PER_SEC = 0.6; // internal SP units/sec
	if (typeof g.KD_STRUGGLE_PHYS_WINDOW_MS === "undefined") g.KD_STRUGGLE_PHYS_WINDOW_MS = 2500;

	var activeGroup: string = "";
	var activeUntil = 0;
	var lastNow = 0;
	var totalProgress = 0;
	var totalSp = 0;

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function isEngaged(): boolean {
		try {
			if (typeof KDTimeIsEngaged === "function") return !!KDTimeIsEngaged();
		} catch (_e) {}
		return false;
	}

	function isGameActive(): boolean {
		try {
			if (typeof KinkyDungeonState !== "undefined" && KinkyDungeonState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

	function KDStrugglePhysStart(group?: string): void {
		activeGroup = group || activeGroup || "ItemArms";
		activeUntil = nowMs() + (Number(g.KD_STRUGGLE_PHYS_WINDOW_MS) || 2500);
	}

	function KDStrugglePhysStop(): void {
		activeGroup = "";
		activeUntil = 0;
	}

	function applyProgress(amount: number): void {
		if (!(amount > 0)) return;
		try {
			if (typeof KinkyDungeonGetRestraintItem === "function" && activeGroup) {
				var item = KinkyDungeonGetRestraintItem(activeGroup);
				if (item) {
					if (typeof item.struggleProgress === "number") {
						item.struggleProgress = Math.min(0.99, item.struggleProgress + amount);
						totalProgress += amount;
						return;
					}
				}
			}
		} catch (_e) {}
		try {
			if (typeof KinkyDungeonAllRestraint === "function") {
				var list = KinkyDungeonAllRestraint();
				for (var i = 0; i < (list && list.length) || 0; i++) {
					var it = list[i];
					var item2 = it && (it.item || it);
					if (!item2) continue;
					if (typeof item2.struggleProgress === "number") {
						item2.struggleProgress = Math.min(0.99, item2.struggleProgress + amount);
						totalProgress += amount;
						return;
					}
				}
			}
		} catch (_e2) {}
	}

	function drainSP(amount: number): void {
		if (!(amount > 0)) return;
		try {
			if (typeof KDChangeStamina === "function") {
				KDChangeStamina("struggle", "phys", "tick", -amount);
				totalSp += amount;
				return;
			}
		} catch (_e) {}
		try {
			if (typeof KinkyDungeonStatStamina !== "undefined") {
				// best-effort direct (may be shadowed)
				var g2: any = g;
				if (typeof g2.KinkyDungeonStatStamina === "number") {
					g2.KinkyDungeonStatStamina = Math.max(0, g2.KinkyDungeonStatStamina - amount);
					totalSp += amount;
				}
			}
		} catch (_e2) {}
	}

	function tick(dt: number): void {
		if (!g.KD_STRUGGLE_PHYS_ENABLED) return;
		if (!isGameActive()) return;
		if (isEngaged() && !g.KD_STRUGGLE_PHYS_IN_COMBAT) return;
		var t = nowMs();
		if (t > activeUntil || !activeGroup) return;

		var rate = Number(g.KD_STRUGGLE_PHYS_RATE) || 0.08;
		var spRate = Number(g.KD_STRUGGLE_PHYS_SP_PER_SEC) || 0.6;

		// Fatigue / bind soft scaling from Phase 4 if present
		try {
			if (typeof KDCombatRTReadPressure === "function") {
				var p = KDCombatRTReadPressure();
				if (p && p.struggleHard) rate *= Math.max(0.35, 1 - p.struggleHard);
			}
		} catch (_e) {}

		applyProgress(rate * dt);
		drainSP(spRate * dt);
	}

	// Auto-start window when struggle input is sent
	function hookSend(): void {
		var original = g.KDSendInput;
		if (typeof original !== "function") {
			setTimeout(hookSend, 500);
			return;
		}
		if ((original as any).__kdStrugglePhys) return;
		var wrapped = function (type: string, data: any) {
			var args = arguments;
			if (type === "struggle" || type === "struggleCurse") {
				try {
					KDStrugglePhysStart(data && data.group);
				} catch (_e) {}
			}
			return original.apply(null, args as any);
		};
		(wrapped as any).__kdStrugglePhys = true;
		// Preserve action econ wrap if already installed
		g.KDSendInput = wrapped;
	}
	hookSend();

	function pump(): void {
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = Math.min(0.1, Math.max(0, (t - lastNow) / 1000));
		lastNow = t;
		try { tick(dt); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDStrugglePhysStart = KDStrugglePhysStart;
	g.KDStrugglePhysStop = KDStrugglePhysStop;
	g.KDStrugglePhysGetState = function () {
		return {
			enabled: !!g.KD_STRUGGLE_PHYS_ENABLED,
			activeGroup: activeGroup,
			active: nowMs() < activeUntil,
			totalProgress: totalProgress,
			totalSp: totalSp,
		};
	};

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDStrugglePhys] Phase 5d per-second struggle online (default OFF). KD_STRUGGLE_PHYS_ENABLED=true");
	} catch (_c) {}
})();
