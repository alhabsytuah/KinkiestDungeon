"use strict";
/**
 * Phase 2 — Enemy AI & Pathfinding (hybrid / realtime prep)
 * Branch: feature/ringgags-port
 *
 * Does NOT replace KDAIType or KinkyDungeonFindPath.
 * Layers on top of Ada's turn AI:
 *  - Priority / budget so nearby enemies update first under rapid ticks
 *  - Explore-mode movePoints drip (feel livelier when idle-tick is on)
 *  - Soft path goal refresh for stuck / far wander targets
 *  - Optional investigate toward last player noise (if SoundPresence exists)
 *  - Engage gate: full aggressive behaviour stays turn-based in combat range
 *
 * Enable:
 *   KD_AI_RT_ENABLED = true;
 *   KD_TIME_IDLE_TICK_ENABLED = true;  // Phase 1 — recommended together
 */
(function KDAIRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_AI_RT_ENABLED === "undefined") g.KD_AI_RT_ENABLED = false;
	/** Max enemy AI soft-touches per realtime frame budget */
	if (typeof g.KD_AI_RT_BUDGET === "undefined") g.KD_AI_RT_BUDGET = 12;
	/** Prefer enemies within this Chebyshev distance of player */
	if (typeof g.KD_AI_RT_FOCUS_RANGE === "undefined") g.KD_AI_RT_FOCUS_RANGE = 14;
	/** Chance per touch to refresh a stale wander goal */
	if (typeof g.KD_AI_RT_GOAL_REFRESH === "undefined") g.KD_AI_RT_GOAL_REFRESH = 0.08;
	/** Explore: subtract this from movePoints each soft-tick (0 = off) */
	if (typeof g.KD_AI_RT_MOVEPOINTS_DRIP === "undefined") g.KD_AI_RT_MOVEPOINTS_DRIP = 0.35;
	/** Follow sound / noise trails when available */
	if (typeof g.KD_AI_RT_FOLLOW_NOISE === "undefined") g.KD_AI_RT_FOLLOW_NOISE = true;

	var cursor = 0;
	var lastNoiseHint: { x: number; y: number; t: number } = null;

	function chebyshev(ax: number, ay: number, bx: number, by: number): number {
		return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
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
		try {
			if (typeof KinkyDungeonEntities !== "undefined" && KinkyDungeonEntities) return KinkyDungeonEntities;
		} catch (_e2) {}
		return [];
	}

	function isHostile(e: any): boolean {
		if (!e || e.player) return false;
		try {
			if (typeof KinkyDungeonHostile === "function") return !!KinkyDungeonHostile(e);
		} catch (_e) {}
		if (e.hostile === false || e.allied) return false;
		return true;
	}

	function isEngaged(): boolean {
		try {
			if (typeof KDTimeIsEngaged === "function") return !!KDTimeIsEngaged();
		} catch (_e) {}
		var range = Number(g.KD_TIME_ENGAGE_RANGE) || 6;
		var me = playerXY();
		var list = entityList();
		for (var i = 0; i < list.length; i++) {
			var e = list[i];
			if (!isHostile(e)) continue;
			if (chebyshev(me.x, me.y, e.x || 0, e.y || 0) <= range) return true;
		}
		return false;
	}

	function isExploreMode(): boolean {
		if (!g.KD_AI_RT_ENABLED) return false;
		if (isEngaged()) return false;
		// Prefer pairing with Phase 1 idle tick; still allow soft AI if only RT AI is on
		return true;
	}

	function getAIName(enemy: any): string {
		try {
			if (typeof KDGetAI === "function") return String(KDGetAI(enemy) || "wander");
		} catch (_e) {}
		try {
			if (enemy && enemy.Enemy && enemy.Enemy.AI) return String(enemy.Enemy.AI);
		} catch (_e2) {}
		return "wander";
	}

	/** Soft priority: closer + hostile first */
	function priorityScore(e: any, me: { x: number; y: number }): number {
		var d = chebyshev(me.x, me.y, e.x || 0, e.y || 0);
		var h = isHostile(e) ? 0 : 50;
		return d + h;
	}

	function pickBudgetSlice(list: any[], budget: number): any[] {
		var me = playerXY();
		var focus = Number(g.KD_AI_RT_FOCUS_RANGE) || 14;
		var scored: { e: any; s: number }[] = [];
		for (var i = 0; i < list.length; i++) {
			var e = list[i];
			if (!e || e.player) continue;
			var s = priorityScore(e, me);
			if (s > focus + 20 && !isHostile(e)) continue;
			scored.push({ e: e, s: s });
		}
		scored.sort(function (a, b) { return a.s - b.s; });
		var out: any[] = [];
		var n = Math.min(budget, scored.length);
		// Rotate so far enemies still get occasional attention
		var start = cursor % Math.max(1, scored.length);
		for (var k = 0; k < n; k++) {
			var idx = (start + k) % scored.length;
			out.push(scored[idx].e);
		}
		cursor += Math.max(1, Math.floor(budget / 2));
		return out;
	}

	function refreshWanderGoal(enemy: any): boolean {
		var ai = getAIName(enemy);
		if (ai === "guard" || ai === "ambush") return false;
		var gx = enemy.gx, gy = enemy.gy;
		var stuck = (typeof gx !== "number") || (typeof gy !== "number");
		if (!stuck) {
			var distGoal = chebyshev(enemy.x || 0, enemy.y || 0, gx, gy);
			if (distGoal < 1) stuck = true;
			if (distGoal > 40) stuck = true;
		}
		if (!stuck && Math.random() > Number(g.KD_AI_RT_GOAL_REFRESH)) return false;
		try {
			var pt: any = null;
			if (typeof KinkyDungeonGetNearbyPoint === "function") {
				pt = KinkyDungeonGetNearbyPoint(enemy.x || 0, enemy.y || 0, true, undefined, false, false);
			}
			if (!pt && typeof KinkyDungeonGetRandomEnemyPoint === "function") {
				pt = KinkyDungeonGetRandomEnemyPoint(false, false);
			}
			if (pt && typeof pt.x === "number") {
				enemy.gx = pt.x;
				enemy.gy = pt.y;
				return true;
			}
		} catch (_e) {}
		return false;
	}

	function applyNoiseInvestigate(enemy: any): boolean {
		if (!g.KD_AI_RT_FOLLOW_NOISE) return false;
		var ai = getAIName(enemy);
		if (ai === "guard" && Math.random() > 0.15) return false;
		// Prefer SoundPresence / trails if present
		var hx: number = null;
		var hy: number = null;
		try {
			if (typeof KDSoundPresenceLastHeard === "function") {
				var h = KDSoundPresenceLastHeard();
				if (h && typeof h.x === "number") { hx = h.x; hy = h.y; }
			}
		} catch (_e) {}
		if (hx == null && lastNoiseHint && (Date.now() - lastNoiseHint.t) < 8000) {
			hx = lastNoiseHint.x;
			hy = lastNoiseHint.y;
		}
		if (hx == null) return false;
		var d = chebyshev(enemy.x || 0, enemy.y || 0, hx, hy);
		if (d < 2 || d > 18) return false;
		if (Math.random() > 0.25) return false;
		enemy.gx = hx;
		enemy.gy = hy;
		try {
			if (typeof enemy.path !== "undefined") enemy.path = undefined;
		} catch (_p) {}
		return true;
	}

	function dripMovePoints(enemy: any): void {
		var drip = Number(g.KD_AI_RT_MOVEPOINTS_DRIP);
		if (!(drip > 0)) return;
		if (typeof enemy.movePoints !== "number") return;
		// Only drip when not engaged — combat keeps vanilla movePoints
		if (isEngaged()) return;
		enemy.movePoints = Math.max(0, enemy.movePoints - drip);
	}

	function softTouchEnemy(enemy: any): void {
		if (!enemy) return;
		applyNoiseInvestigate(enemy);
		refreshWanderGoal(enemy);
		dripMovePoints(enemy);
		// Mark for path recompute next vanilla tick if far from goal
		try {
			if (typeof enemy.gx === "number" && typeof enemy.gy === "number") {
				var dg = chebyshev(enemy.x || 0, enemy.y || 0, enemy.gx, enemy.gy);
				if (dg > 1 && enemy.path && enemy.path.length === 0) enemy.path = undefined;
			}
		} catch (_e) {}
	}

	/** Record player noise for investigate (callable from elsewhere). */
	function KDAINotifyNoise(x: number, y: number): void {
		if (typeof x !== "number" || typeof y !== "number") return;
		lastNoiseHint = { x: x, y: y, t: Date.now() };
	}

	/**
	 * One soft AI pass — call from rAF or after idle turn.
	 * Safe no-op when flag off or in combat engage range.
	 */
	function KDAIRealtimeTick(): void {
		if (!g.KD_AI_RT_ENABLED) return;
		try {
			if (typeof KinkyDungeonState !== "undefined" && KinkyDungeonState !== "Game") return;
		} catch (_e) {}
		if (isEngaged()) return;

		var list = entityList();
		if (!list.length) return;
		var budget = Math.max(1, Number(g.KD_AI_RT_BUDGET) || 12);
		var slice = pickBudgetSlice(list, budget);
		for (var i = 0; i < slice.length; i++) softTouchEnemy(slice[i]);
	}

	function KDAIRealtimeGetState(): any {
		return {
			enabled: !!g.KD_AI_RT_ENABLED,
			explore: isExploreMode() && !isEngaged(),
			engaged: isEngaged(),
			budget: g.KD_AI_RT_BUDGET,
			focusRange: g.KD_AI_RT_FOCUS_RANGE,
			movePointsDrip: g.KD_AI_RT_MOVEPOINTS_DRIP,
			followNoise: !!g.KD_AI_RT_FOLLOW_NOISE,
			lastNoise: lastNoiseHint,
			cursor: cursor,
		};
	}

	// Hook Phase 1 idle advances: after world tick, soft-touch AI
	var _adv = g.KDTimeAdvanceTurn;
	if (typeof _adv === "function") {
		g.KDTimeAdvanceTurn = function (reason?: string) {
			var ok = _adv(reason);
			try { if (ok) KDAIRealtimeTick(); } catch (_e) {}
			return ok;
		};
	}

	// Light rAF soft pass (even without idle tick) when RT AI on — goals only, no AdvanceTime
	var acc = 0;
	var last = 0;
	function pump(): void {
		var t = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
		if (!last) last = t;
		var dt = Math.min(0.25, (t - last) / 1000);
		last = t;
		if (g.KD_AI_RT_ENABLED && !isEngaged()) {
			acc += dt;
			if (acc >= 0.2) {
				acc = 0;
				try { KDAIRealtimeTick(); } catch (_e) {}
			}
		}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDAIRealtimeTick = KDAIRealtimeTick;
	g.KDAIRealtimeGetState = KDAIRealtimeGetState;
	g.KDAINotifyNoise = KDAINotifyNoise;

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDAIRealtime] Phase 2 AI/path layer online (default OFF). Set KD_AI_RT_ENABLED=true (+ optional KD_TIME_IDLE_TICK_ENABLED).");
	} catch (_c) {}
})();
