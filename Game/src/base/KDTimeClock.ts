"use strict";
/**
 * Phase 1 — Core Time & Turn Loop foundation (hybrid / real-time prep)
 * Branch: feature/ringgags-port
 *
 * Default remains FULLY TURN-BASED. This module only:
 *  - Introduces a shared clock (KDTime)
 *  - Tracks mode: TurnBased | RealTimeExplore (future combat stays turn)
 *  - Optionally idle-advances discrete turns while exploring (feature flag)
 *  - Does NOT rewrite enemy AI, movement, or struggle yet
 *
 * Enable later:
 *   (window as any).KD_TIME_IDLE_TICK_ENABLED = true;
 *   (window as any).KD_TIME_IDLE_MS = 100;
 */
(function KDTimeClockBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_TIME_IDLE_TICK_ENABLED === "undefined") g.KD_TIME_IDLE_TICK_ENABLED = false;
	if (typeof g.KD_TIME_IDLE_MS === "undefined") g.KD_TIME_IDLE_MS = 100;
	if (typeof g.KD_TIME_ENGAGE_RANGE === "undefined") g.KD_TIME_ENGAGE_RANGE = 6;
	if (typeof g.KD_TIME_REALTIME_ACCUM === "undefined") g.KD_TIME_REALTIME_ACCUM = false;

	interface KDTimeState {
		worldTime: number;
		turnCount: number;
		mode: string;
		lastNow: number;
		idleAcc: number;
		fracAcc: number;
		engaged: boolean;
	}

	var state: KDTimeState = {
		worldTime: 0,
		turnCount: 0,
		mode: "TurnBased",
		lastNow: 0,
		idleAcc: 0,
		fracAcc: 0,
		engaged: false,
	};

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function isGameActive(): boolean {
		try {
			if (typeof KinkyDungeonState !== "undefined" && KinkyDungeonState !== "Game") return false;
			if (typeof KinkyDungeonDrawState !== "undefined" && KinkyDungeonDrawState && KinkyDungeonDrawState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

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

	function KDTimeIsEngaged(): boolean {
		var range = Number(g.KD_TIME_ENGAGE_RANGE) || 6;
		var me = playerXY();
		try {
			var list: any = null;
			if (typeof KDMapData !== "undefined" && KDMapData && KDMapData.Entities) list = KDMapData.Entities;
			else if (typeof KinkyDungeonEntities !== "undefined") list = KinkyDungeonEntities;
			if (!list || !list.length) {
				state.engaged = false;
				return false;
			}
			for (var i = 0; i < list.length; i++) {
				var e = list[i];
				if (!e || e.player) continue;
				var hostile = true;
				try {
					if (typeof KinkyDungeonHostile === "function") hostile = !!KinkyDungeonHostile(e);
					else if (e.hostile === false || e.allied) hostile = false;
				} catch (_h) {}
				if (!hostile) continue;
				var d = chebyshev(me.x, me.y, e.x || 0, e.y || 0);
				if (d <= range) {
					state.engaged = true;
					return true;
				}
			}
		} catch (_e) {}
		state.engaged = false;
		return false;
	}

	function KDTimeGetMode(): string {
		if (KDTimeIsEngaged()) {
			state.mode = "TurnBased";
			return state.mode;
		}
		if (g.KD_TIME_IDLE_TICK_ENABLED) {
			state.mode = "RealTimeExplore";
			return state.mode;
		}
		state.mode = "TurnBased";
		return state.mode;
	}

	function KDTimeAdvanceTurn(reason?: string): boolean {
		try {
			if (typeof KinkyDungeonAdvanceTime === "function") {
				KinkyDungeonAdvanceTime(1, true, true);
				state.turnCount++;
				return true;
			}
		} catch (_e) {
			try {
				if (typeof KinkyDungeonAdvanceTime === "function") {
					KinkyDungeonAdvanceTime(1);
					state.turnCount++;
					return true;
				}
			} catch (_e2) {}
		}
		return false;
	}

	function KDTimeUpdate(dtSec?: number): void {
		var t = nowMs();
		if (!state.lastNow) state.lastNow = t;
		var dt = typeof dtSec === "number" && dtSec > 0 ? dtSec : Math.min(0.25, Math.max(0, (t - state.lastNow) / 1000));
		state.lastNow = t;
		state.worldTime += dt;

		if (!isGameActive()) return;
		if (!g.KD_TIME_IDLE_TICK_ENABLED) return;
		if (KDTimeIsEngaged()) return;

		try {
			if (typeof KinkyDungeonTargetingSpell !== "undefined" && KinkyDungeonTargetingSpell) return;
		} catch (_e) {}

		state.idleAcc += dt * 1000;
		var interval = Number(g.KD_TIME_IDLE_MS) || 100;
		if (interval < 16) interval = 16;
		while (state.idleAcc >= interval) {
			state.idleAcc -= interval;
			if (!KDTimeAdvanceTurn("idle")) break;
			if (KDTimeIsEngaged()) break;
		}
	}

	function KDTimeGetState(): any {
		return {
			worldTime: state.worldTime,
			turnCount: state.turnCount,
			mode: KDTimeGetMode(),
			engaged: state.engaged,
			idleEnabled: !!g.KD_TIME_IDLE_TICK_ENABLED,
			idleMs: g.KD_TIME_IDLE_MS,
			engageRange: g.KD_TIME_ENGAGE_RANGE,
		};
	}

	function KDTimeReset(): void {
		state.worldTime = 0;
		state.turnCount = 0;
		state.idleAcc = 0;
		state.fracAcc = 0;
		state.lastNow = nowMs();
		state.mode = "TurnBased";
		state.engaged = false;
	}

	g.KDTimeUpdate = KDTimeUpdate;
	g.KDTimeGetState = KDTimeGetState;
	g.KDTimeGetMode = KDTimeGetMode;
	g.KDTimeIsEngaged = KDTimeIsEngaged;
	g.KDTimeAdvanceTurn = KDTimeAdvanceTurn;
	g.KDTimeReset = KDTimeReset;
	g.KDTimeState = state;

	function pump(): void {
		try { KDTimeUpdate(); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDTime] Phase 1 clock online (default turn-based; idle tick OFF). Set KD_TIME_IDLE_TICK_ENABLED=true to auto-advance turns while exploring.");
	} catch (_c) {}
})();
