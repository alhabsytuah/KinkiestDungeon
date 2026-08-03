"use strict";
/** Phase 2 — Enemy AI soft realtime (TS-safe) */
(function KDAIRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_AI_RT_ENABLED === "undefined") g.KD_AI_RT_ENABLED = false;
	if (typeof g.KD_AI_RT_MOVEPOINTS_DRIP === "undefined") g.KD_AI_RT_MOVEPOINTS_DRIP = 0.35;
	if (typeof g.KD_AI_RT_BUDGET === "undefined") g.KD_AI_RT_BUDGET = 8;
	if (typeof g.KD_AI_RT_COOLDOWN_MS === "undefined") g.KD_AI_RT_COOLDOWN_MS = 180;

	var lastNow = 0;
	var cursor = 0;
	var cdMap: any = {};

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function isGameActive(): boolean {
		try {
			if (typeof g.KinkyDungeonState !== "undefined" && g.KinkyDungeonState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

	function isEngaged(): boolean {
		try {
			if (typeof g.KDTimeIsEngaged === "function") return !!g.KDTimeIsEngaged();
		} catch (_e) {}
		return false;
	}

	function playerXY(): any {
		try {
			if (typeof g.KDPlayerPos === "function") {
				var p = g.KDPlayerPos();
				if (p && typeof p.x === "number") return p;
			}
		} catch (_e) {}
		try {
			if (g.KinkyDungeonPlayerEntity)
				return { x: g.KinkyDungeonPlayerEntity.x || 0, y: g.KinkyDungeonPlayerEntity.y || 0 };
		} catch (_e2) {}
		return { x: 0, y: 0 };
	}

	function entityList(): any[] {
		try {
			if (g.KDMapData && g.KDMapData.Entities) return g.KDMapData.Entities;
		} catch (_e) {}
		try {
			if (g.KinkyDungeonEntities) return g.KinkyDungeonEntities;
		} catch (_e2) {}
		return [];
	}

	function isHostile(e: any): boolean {
		try {
			if (typeof g.KinkyDungeonHostile === "function") return !!g.KinkyDungeonHostile(e);
		} catch (_e) {}
		if (e && (e.hostile === false || e.allied)) return false;
		return true;
	}

	function tick(): void {
		if (!g.KD_AI_RT_ENABLED || !isGameActive() || isEngaged()) return;
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = Math.min(0.2, (t - lastNow) / 1000);
		lastNow = t;
		var me = playerXY();
		var list = entityList();
		if (!list.length) return;
		var budget = Math.max(1, Number(g.KD_AI_RT_BUDGET) || 8);
		var drip = Number(g.KD_AI_RT_MOVEPOINTS_DRIP) || 0.35;
		var cdMs = Number(g.KD_AI_RT_COOLDOWN_MS) || 180;
		var n = list.length;

		for (var b = 0; b < budget; b++) {
			cursor = (cursor + 1) % n;
			var e = list[cursor];
			if (!e || e.player) continue;
			var id = String(e.id != null ? e.id : cursor);
			if (cdMap[id] && t - cdMap[id] < cdMs) continue;
			cdMap[id] = t;

			if (typeof e.movePoints === "number") {
				e.movePoints = Math.max(0, e.movePoints - drip * dt * 5);
			}

			if (isHostile(e)) {
				var d = Math.max(Math.abs((e.x || 0) - me.x), Math.abs((e.y || 0) - me.y));
				if (d <= 12) {
					e.gx = me.x;
					e.gy = me.y;
				}
			}

			try {
				if (typeof g.KDSoundPresenceLastHeard === "function") {
					var h = g.KDSoundPresenceLastHeard();
					if (h && typeof h.x === "number" && Math.random() < 0.05) {
						e.gx = h.x;
						e.gy = h.y;
					}
				}
			} catch (_s) {}
		}
	}

	function pump(): void {
		try { tick(); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDAIRealtimeGetState = function () {
		return { enabled: !!g.KD_AI_RT_ENABLED, engaged: isEngaged(), budget: g.KD_AI_RT_BUDGET };
	};

	try { console.log("[KDAIRealtime] Phase 2 online (default OFF)."); } catch (_c) {}
})();
