"use strict";
/**
 * Final hybrid polish — closes last residual gaps
 * Branch: feature/ringgags-port
 *
 * 1) Path cache clear on map / floor change
 * 2) Draw visual enforcement (sync visual_* every frame for all entities)
 * 3) RT enemy attack signal → AdvanceTime nudge when wantAttack + engaged
 * 4) Struggle unlock hardened group resolution
 * 5) Registers onto unified pump when available
 */
(function KDHybridFinalizeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_HYBRID_FINALIZE === "undefined") g.KD_HYBRID_FINALIZE = true;
	if (typeof g.KD_DRAW_VISUAL_ENFORCE === "undefined") g.KD_DRAW_VISUAL_ENFORCE = true;
	if (typeof g.KD_RT_ATTACK_NUDGE === "undefined") g.KD_RT_ATTACK_NUDGE = true;
	if (typeof g.KD_RT_ATTACK_NUDGE_MS === "undefined") g.KD_RT_ATTACK_NUDGE_MS = 600;

	var lastMapId: any = null;
	var lastFloor: any = null;
	var lastNudge = 0;
	var struggleCooldown: Record<string, number> = {};

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function isGameActive(): boolean {
		try {
			if (typeof KinkyDungeonState !== "undefined" && KinkyDungeonState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

	function isEngaged(): boolean {
		try {
			if (typeof KDTimeIsEngaged === "function") return !!KDTimeIsEngaged();
		} catch (_e) {}
		return false;
	}

	function mapFingerprint(): { id: any; floor: any } {
		var id: any = null;
		var floor: any = null;
		try {
			if (typeof KDMapData !== "undefined" && KDMapData) {
				id = KDMapData.id != null ? KDMapData.id : (KDMapData.Seed || KDMapData.Title || null);
			}
		} catch (_e) {}
		try {
			if (typeof MiniGameKinkyDungeonLevel !== "undefined") floor = MiniGameKinkyDungeonLevel;
			else if (typeof KinkyDungeonCurrentLevel !== "undefined") floor = KinkyDungeonCurrentLevel;
		} catch (_e2) {}
		return { id: id, floor: floor };
	}

	/** Clear path cache + entity paths on floor/map change */
	function checkMapChange(): void {
		var fp = mapFingerprint();
		var changed = (lastMapId != null && fp.id != null && fp.id !== lastMapId) ||
			(lastFloor != null && fp.floor != null && fp.floor !== lastFloor);
		if (lastMapId == null && lastFloor == null) {
			lastMapId = fp.id;
			lastFloor = fp.floor;
			return;
		}
		if (!changed) {
			lastMapId = fp.id != null ? fp.id : lastMapId;
			lastFloor = fp.floor != null ? fp.floor : lastFloor;
			return;
		}
		lastMapId = fp.id;
		lastFloor = fp.floor;
		try {
			if (typeof g.KDFindPathClearCache === "function") g.KDFindPathClearCache();
		} catch (_e) {}
		try {
			if (typeof KDMotionSnapAll === "function") KDMotionSnapAll();
		} catch (_e2) {}
		try {
			var list = (typeof KDMapData !== "undefined" && KDMapData && KDMapData.Entities) ? KDMapData.Entities : [];
			for (var i = 0; i < list.length; i++) {
				var e = list[i];
				if (!e) continue;
				e.path = null;
				if (typeof e.x === "number") {
					e.visual_x = e.x;
					e.visual_y = e.y;
				}
			}
		} catch (_e3) {}
		try {
			if (typeof console !== "undefined" && console.log)
				console.log("[KDHybridFinalize] map/floor change → path cache + visuals cleared");
		} catch (_c) {}
	}

	/** Ensure every entity has visual_* initialized and tracking logical x,y when not lerping hard */
	function enforceVisuals(): void {
		if (!g.KD_DRAW_VISUAL_ENFORCE) return;
		if (!isGameActive()) return;
		try {
			var list = (typeof KDMapData !== "undefined" && KDMapData && KDMapData.Entities) ? KDMapData.Entities : [];
			var pl = typeof KinkyDungeonPlayerEntity !== "undefined" ? KinkyDungeonPlayerEntity : null;
			if (pl) list = list.concat ? list : list;
			var all = list.slice ? list.slice() : [];
			if (pl && all.indexOf(pl) < 0) all.push(pl);
			for (var i = 0; i < all.length && i < 100; i++) {
				var e = all[i];
				if (!e || typeof e.x !== "number") continue;
				if (typeof e.visual_x !== "number" || !isFinite(e.visual_x)) e.visual_x = e.x;
				if (typeof e.visual_y !== "number" || !isFinite(e.visual_y)) e.visual_y = e.y;
			}
		} catch (_e) {}
		// Global helper always present
		if (typeof g.KDEntityVisualPos !== "function") {
			g.KDEntityVisualPos = function (e: any) {
				if (!e) return { x: 0, y: 0 };
				return {
					x: typeof e.visual_x === "number" ? e.visual_x : (e.x || 0),
					y: typeof e.visual_y === "number" ? e.visual_y : (e.y || 0),
				};
			};
		}
	}

	/** When enemies mark wantAttack while engaged, nudge world time so vanilla can resolve */
	function tickAttackNudge(): void {
		if (!g.KD_RT_ATTACK_NUDGE) return;
		if (!isGameActive() || !isEngaged()) return;
		var t = nowMs();
		if (t - lastNudge < (Number(g.KD_RT_ATTACK_NUDGE_MS) || 600)) return;
		var list: any[] = [];
		try {
			if (typeof KDMapData !== "undefined" && KDMapData && KDMapData.Entities) list = KDMapData.Entities;
		} catch (_e) {}
		var any = false;
		for (var i = 0; i < list.length; i++) {
			if (list[i] && list[i].__kd_wantAttack) {
				any = true;
				list[i].__kd_wantAttack = false;
			}
		}
		if (!any) return;
		lastNudge = t;
		try {
			if (typeof KinkyDungeonAdvanceTime === "function") KinkyDungeonAdvanceTime(1, true, true);
		} catch (_e2) {
			try { if (typeof KinkyDungeonAdvanceTime === "function") KinkyDungeonAdvanceTime(1); } catch (_e3) {}
		}
	}

	/** Hardened struggle unlock: resolve group from multiple shapes */
	function tickStruggleUnlockHard(): void {
		if (!g.KD_STRUGGLE_RT_UNLOCK) return;
		if (!isGameActive()) return;
		var thr = Number(g.KD_STRUGGLE_UNLOCK_THRESHOLD) || 0.92;
		var t = nowMs();
		try {
			if (typeof KinkyDungeonAllRestraint !== "function") return;
			var list = KinkyDungeonAllRestraint();
			if (!list || !list.length) return;
			for (var i = 0; i < list.length; i++) {
				var it = list[i];
				var item = it && (it.item || it);
				if (!item) continue;
				var prog = typeof item.struggleProgress === "number" ? item.struggleProgress
					: (typeof item.progress === "number" ? item.progress : -1);
				if (!(prog >= thr)) continue;
				var group = item.group || it.group || item.lockGroup ||
					(item.name && String(item.name)) || ("idx" + i);
				if (struggleCooldown[group] && t - struggleCooldown[group] < 1500) continue;
				struggleCooldown[group] = t;
				try {
					var send = g.KDSendInput;
					// Prefer unwrapped if master stored original on hybrid complete — use public send
					if (typeof send === "function") {
						send("struggle", { group: group, struggleType: "Struggle" }, undefined, undefined, true);
					}
					if (typeof item.struggleProgress === "number") item.struggleProgress = 0;
					if (typeof item.progress === "number") item.progress = 0;
				} catch (_e) {}
			}
		} catch (_e2) {}
	}

	function tick(dt: number): void {
		if (!g.KD_HYBRID_FINALIZE) return;
		checkMapChange();
		enforceVisuals();
		tickAttackNudge();
		tickStruggleUnlockHard();
	}

	function attach(): void {
		if (typeof g.KDHybridPumpRegister === "function") {
			g.KDHybridPumpRegister("finalize", tick, 0);
			return;
		}
		// fallback own pump
		var last = 0;
		function p(): void {
			var t = nowMs();
			if (!last) last = t;
			var dt = Math.min(0.1, (t - last) / 1000);
			last = t;
			try { tick(dt); } catch (_e) {}
			if (typeof requestAnimationFrame === "function") requestAnimationFrame(p);
			else setTimeout(p, 16);
		}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(p);
		else setTimeout(p, 16);
	}
	setTimeout(attach, 0);

	g.KDHybridFinalizeGetState = function () {
		return {
			mapId: lastMapId,
			floor: lastFloor,
			visualEnforce: !!g.KD_DRAW_VISUAL_ENFORCE,
			attackNudge: !!g.KD_RT_ATTACK_NUDGE,
		};
	};

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDHybridFinalize] polish layer online (map cache clear, visual enforce, attack nudge, struggle harden).");
	} catch (_c) {}
})();
