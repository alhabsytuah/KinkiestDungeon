"use strict";
/** Phase 5a — Continuous sub-tile visual positions (TS-safe) */
(function KDContinuousMotionBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_MOTION_LERP_ENABLED === "undefined") g.KD_MOTION_LERP_ENABLED = false;
	if (typeof g.KD_MOTION_LERP_SPEED === "undefined") g.KD_MOTION_LERP_SPEED = 12;
	if (typeof g.KD_MOTION_INCLUDE_ENEMIES === "undefined") g.KD_MOTION_INCLUDE_ENEMIES = true;
	if (typeof g.KD_MOTION_SNAP_DIST === "undefined") g.KD_MOTION_SNAP_DIST = 2.5;
	if (typeof g.KD_MOTION_PLAYER === "undefined") g.KD_MOTION_PLAYER = true;

	var lastNow = 0;
	var velPlayer = { vx: 0, vy: 0 };

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function isGameActive(): boolean {
		try {
			if (typeof g.KinkyDungeonState !== "undefined" && g.KinkyDungeonState !== "Game") return false;
			if (g.KinkyDungeonDrawState && g.KinkyDungeonDrawState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

	function ensureVisual(ent: any): void {
		if (!ent) return;
		if (typeof ent.x !== "number" || typeof ent.y !== "number") return;
		if (typeof ent.visual_x !== "number" || !isFinite(ent.visual_x)) ent.visual_x = ent.x;
		if (typeof ent.visual_y !== "number" || !isFinite(ent.visual_y)) ent.visual_y = ent.y;
	}

	function getPlayer(): any {
		try {
			if (g.KinkyDungeonPlayerEntity) return g.KinkyDungeonPlayerEntity;
		} catch (_e) {}
		try {
			if (typeof g.KDPlayer === "function") return g.KDPlayer();
		} catch (_e2) {}
		return null;
	}

	function lerpEntity(ent: any, dt: number, speed: number): void {
		if (!ent) return;
		if (typeof ent.x !== "number" || typeof ent.y !== "number") return;
		ensureVisual(ent);
		var tx = ent.x;
		var ty = ent.y;
		var dx = tx - ent.visual_x;
		var dy = ty - ent.visual_y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		var snap = Number(g.KD_MOTION_SNAP_DIST) || 2.5;
		if (dist > snap) {
			ent.visual_x = tx;
			ent.visual_y = ty;
			if (ent === getPlayer()) { velPlayer.vx = 0; velPlayer.vy = 0; }
			return;
		}
		if (dist < 0.001) {
			ent.visual_x = tx;
			ent.visual_y = ty;
			if (ent === getPlayer()) { velPlayer.vx *= 0.5; velPlayer.vy *= 0.5; }
			return;
		}
		var k = Math.max(1, speed);
		var a = 1 - Math.exp(-k * Math.max(0, dt));
		if (a > 1) a = 1;
		var nx = ent.visual_x + dx * a;
		var ny = ent.visual_y + dy * a;
		if (ent === getPlayer()) {
			velPlayer.vx = (nx - ent.visual_x) / Math.max(0.0001, dt);
			velPlayer.vy = (ny - ent.visual_y) / Math.max(0.0001, dt);
		}
		ent.visual_x = nx;
		ent.visual_y = ny;
		ent.__kd_vx = (tx - ent.visual_x) * k;
		ent.__kd_vy = (ty - ent.visual_y) * k;
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

	function KDMotionTick(dt?: number): void {
		if (!g.KD_MOTION_LERP_ENABLED) return;
		if (!isGameActive()) return;
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var d = typeof dt === "number" && dt > 0 ? dt : Math.min(0.05, Math.max(0, (t - lastNow) / 1000));
		lastNow = t;
		var speed = Number(g.KD_MOTION_LERP_SPEED) || 12;

		if (g.KD_MOTION_PLAYER) {
			var pl = getPlayer();
			if (pl) lerpEntity(pl, d, speed);
		}
		if (g.KD_MOTION_INCLUDE_ENEMIES) {
			var list = entityList();
			var n = Math.min(list.length, 80);
			for (var i = 0; i < n; i++) {
				var e = list[i];
				if (!e || e.player) continue;
				lerpEntity(e, d, speed * 0.9);
			}
		}
	}

	function KDMotionGetState(): any {
		var pl = getPlayer();
		return {
			enabled: !!g.KD_MOTION_LERP_ENABLED,
			speed: g.KD_MOTION_LERP_SPEED,
			includeEnemies: !!g.KD_MOTION_INCLUDE_ENEMIES,
			player: pl ? {
				x: pl.x, y: pl.y,
				visual_x: pl.visual_x, visual_y: pl.visual_y,
				vx: velPlayer.vx, vy: velPlayer.vy,
			} : null,
		};
	}

	function KDMotionSnapAll(): void {
		var pl = getPlayer();
		if (pl && typeof pl.x === "number") {
			pl.visual_x = pl.x;
			pl.visual_y = pl.y;
		}
		var list = entityList();
		for (var i = 0; i < list.length; i++) {
			var e = list[i];
			if (!e || typeof e.x !== "number") continue;
			e.visual_x = e.x;
			e.visual_y = e.y;
		}
	}

	function pump(): void {
		try { KDMotionTick(); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 16);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 16);

	g.KDMotionTick = KDMotionTick;
	g.KDMotionGetState = KDMotionGetState;
	g.KDMotionSnapAll = KDMotionSnapAll;
	g.KDMotionPlayerVel = velPlayer;

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDMotion] Phase 5a continuous visual_x/y lerp online (default OFF).");
	} catch (_c) {}
})();
