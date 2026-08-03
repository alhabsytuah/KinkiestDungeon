"use strict";
/** Phase 5d — Struggle per-second physics (TS-safe) */
(function KDStruggleRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_STRUGGLE_PHYS_ENABLED === "undefined") g.KD_STRUGGLE_PHYS_ENABLED = false;
	if (typeof g.KD_STRUGGLE_PHYS_IN_COMBAT === "undefined") g.KD_STRUGGLE_PHYS_IN_COMBAT = false;
	if (typeof g.KD_STRUGGLE_PHYS_RATE === "undefined") g.KD_STRUGGLE_PHYS_RATE = 0.08;
	if (typeof g.KD_STRUGGLE_PHYS_SP_PER_SEC === "undefined") g.KD_STRUGGLE_PHYS_SP_PER_SEC = 0.6;
	if (typeof g.KD_STRUGGLE_PHYS_WINDOW_MS === "undefined") g.KD_STRUGGLE_PHYS_WINDOW_MS = 2500;

	var activeGroup = "";
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
			if (typeof g.KDTimeIsEngaged === "function") return !!g.KDTimeIsEngaged();
		} catch (_e) {}
		return false;
	}

	function isGameActive(): boolean {
		try {
			if (typeof g.KinkyDungeonState !== "undefined" && g.KinkyDungeonState !== "Game") return false;
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
			if (typeof g.KinkyDungeonGetRestraintItem === "function" && activeGroup) {
				var item = g.KinkyDungeonGetRestraintItem(activeGroup);
				if (item && typeof item.struggleProgress === "number") {
					item.struggleProgress = Math.min(0.99, item.struggleProgress + amount);
					totalProgress += amount;
					return;
				}
			}
		} catch (_e) {}
		try {
			if (typeof g.KinkyDungeonAllRestraint === "function") {
				var list = g.KinkyDungeonAllRestraint();
				for (var i = 0; i < (list && list.length) || 0; i++) {
					var it: any = list[i];
					var item2: any = it && (it.item || it);
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
			if (typeof g.KDChangeStamina === "function") {
				g.KDChangeStamina("struggle", "phys", "tick", -amount);
				totalSp += amount;
				return;
			}
		} catch (_e) {}
		try {
			if (typeof g.KinkyDungeonStatStamina === "number") {
				g.KinkyDungeonStatStamina = Math.max(0, g.KinkyDungeonStatStamina - amount);
				totalSp += amount;
			}
		} catch (_e2) {}
	}

	function tick(dt: number): void {
		if (!g.KD_STRUGGLE_PHYS_ENABLED || !isGameActive()) return;
		if (isEngaged() && !g.KD_STRUGGLE_PHYS_IN_COMBAT) return;
		var t = nowMs();
		if (t > activeUntil || !activeGroup) return;
		var rate = Number(g.KD_STRUGGLE_PHYS_RATE) || 0.08;
		var spRate = Number(g.KD_STRUGGLE_PHYS_SP_PER_SEC) || 0.6;
		try {
			if (typeof g.KDCombatRTReadPressure === "function") {
				var p = g.KDCombatRTReadPressure();
				if (p && p.struggleHard) rate *= Math.max(0.35, 1 - p.struggleHard);
			}
		} catch (_e) {}
		applyProgress(rate * dt);
		drainSP(spRate * dt);
	}

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

	try { console.log("[KDStrugglePhys] Phase 5d online (default OFF)."); } catch (_c) {}
})();
