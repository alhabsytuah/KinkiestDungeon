"use strict";
/**
 * Phase 5b — Per-frame path following (+ soft attack readiness)
 * Branch: feature/ringgags-port
 *
 * Item 2 from hybrid gap list.
 *
 * Path following:
 *  - If enemy has a path / gx,gy goal, visual smoothly tracks next cell
 *  - Optional movePoints drip boost while chasing a goal (explore only)
 *
 * Attack readiness:
 *  - Tracks a 0–1 charge toward "ready to act" per hostile near player
 *  - Does NOT fire attacks per-frame; charge only informs UI / future hooks
 *  - When engaged, readiness resets — actual attacks stay turn-based
 *
 * Enable:
 *   KD_PATH_FOLLOW_ENABLED = true;
 *   KD_ATTACK_READY_ENABLED = true;  // soft meter only
 */
(function KDAIPathFollowBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_PATH_FOLLOW_ENABLED === "undefined") g.KD_PATH_FOLLOW_ENABLED = false;
	if (typeof g.KD_PATH_FOLLOW_SPEED === "undefined") g.KD_PATH_FOLLOW_SPEED = 10;
	if (typeof g.KD_PATH_MOVEPOINTS_BOOST === "undefined") g.KD_PATH_MOVEPOINTS_BOOST = 0.15;
	if (typeof g.KD_ATTACK_READY_ENABLED === "undefined") g.KD_ATTACK_READY_ENABLED = false;
	if (typeof g.KD_ATTACK_READY_RATE === "undefined") g.KD_ATTACK_READY_RATE = 0.35; // per second toward 1.0

	var lastNow = 0;
	var readyMap: Record<string, number> = {};

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

	function playerXY(): { x: number; y: number } {
		try {
			if (typeof KDPlayerPos === "function") {
				var p = KDPlayerPos();
				if (p && typeof p.x === "number") return { x: p.x, y: p.y };
			}
		} catch (_e) {}
		try {
			if (typeof KinkyDungeonPlayerEntity !== "undefined" && KinkyDungeonPlayerEntity)
				return { x: KinkyDungeonPlayerEntity.x || 0, y: KinkyDungeonPlayerEntity.y || 0 };
		} catch (_e2) {}
		return { x: 0, y: 0 };
	}

	function entityList(): any[] {
		try {
			if (typeof KDMapData !== "undefined" && KDMapData && KDMapData.Entities) return KDMapData.Entities;
		} catch (_e) {}
		return [];
	}

	function nextWaypoint(e: any): { x: number; y: number } | null {
		try {
			if (e.path && e.path.length) {
				var n = e.path[0];
				if (n && typeof n.x === "number") return { x: n.x, y: n.y };
				if (Array.isArray(n) && n.length >= 2) return { x: n[0], y: n[1] };
			}
		} catch (_e) {}
		if (typeof e.gx === "number" && typeof e.gy === "number") {
			if (e.gx !== e.x || e.gy !== e.y) return { x: e.gx, y: e.gy };
		}
		return null;
	}

	function followPathVisual(e: any, dt: number): void {
		if (!g.KD_PATH_FOLLOW_ENABLED) return;
		var wp = nextWaypoint(e);
		if (!wp) return;
		if (typeof e.visual_x !== "number") e.visual_x = e.x;
		if (typeof e.visual_y !== "number") e.visual_y = e.y;
		// Bias visual slightly toward waypoint while still anchored by KDContinuousMotion to tile
		var speed = Number(g.KD_PATH_FOLLOW_SPEED) || 10;
		var a = 1 - Math.exp(-speed * dt);
		var mx = (e.x + wp.x) * 0.5;
		var my = (e.y + wp.y) * 0.5;
		e.visual_x = e.visual_x + (mx - e.visual_x) * a * 0.35;
		e.visual_y = e.visual_y + (my - e.visual_y) * a * 0.35;

		// Explore: small movePoints help so path progresses on next world tick
		if (!isEngaged() && typeof e.movePoints === "number") {
			var boost = Number(g.KD_PATH_MOVEPOINTS_BOOST) || 0.15;
			e.movePoints = Math.max(0, e.movePoints - boost * dt * 3);
		}
	}

	function tickAttackReady(e: any, dt: number, me: { x: number; y: number }): void {
		if (!g.KD_ATTACK_READY_ENABLED) return;
		var id = String(e.id != null ? e.id : (e.x + "," + e.y));
		if (isEngaged()) {
			readyMap[id] = 0;
			e.__kd_attackReady = 0;
			return;
		}
		var d = Math.max(Math.abs((e.x || 0) - me.x), Math.abs((e.y || 0) - me.y));
		if (d > 8) {
			readyMap[id] = Math.max(0, (readyMap[id] || 0) - dt * 0.5);
			e.__kd_attackReady = readyMap[id];
			return;
		}
		var rate = Number(g.KD_ATTACK_READY_RATE) || 0.35;
		var r = (readyMap[id] || 0) + rate * dt * (d <= 2 ? 1.4 : 1);
		if (r > 1) r = 1;
		readyMap[id] = r;
		e.__kd_attackReady = r;
		// Intentionally no auto-attack — turns own attack resolution
	}

	function KDAIPathFollowTick(dt?: number): void {
		if (!isGameActive()) return;
		if (!g.KD_PATH_FOLLOW_ENABLED && !g.KD_ATTACK_READY_ENABLED) return;
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var d = typeof dt === "number" && dt > 0 ? dt : Math.min(0.05, (t - lastNow) / 1000);
		lastNow = t;
		var me = playerXY();
		var list = entityList();
		var n = Math.min(list.length, 60);
		for (var i = 0; i < n; i++) {
			var e = list[i];
			if (!e || e.player) continue;
			try {
				followPathVisual(e, d);
				tickAttackReady(e, d, me);
			} catch (_e) {}
		}
	}

	function KDAIPathFollowGetState(): any {
		return {
			pathFollow: !!g.KD_PATH_FOLLOW_ENABLED,
			attackReady: !!g.KD_ATTACK_READY_ENABLED,
			engaged: isEngaged(),
			readySample: readyMap,
		};
	}

	function pump(): void {
		try { KDAIPathFollowTick(); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 16);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 16);

	g.KDAIPathFollowTick = KDAIPathFollowTick;
	g.KDAIPathFollowGetState = KDAIPathFollowGetState;

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDAIPathFollow] Phase 5b path follow + soft attack ready (default OFF).");
	} catch (_c) {}
})();
