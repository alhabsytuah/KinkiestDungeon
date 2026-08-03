"use strict";
/**
 * Phase 4 — Combat & Restraints (hybrid layer)
 * Branch: feature/ringgags-port
 *
 * Does NOT convert combat into real-time action queues.
 * Combat while engaged stays player-turn → world-turn (vanilla).
 *
 * This layer:
 *  1) Maps restraint / slow / freeze / bind into explore movement rate (Phase 3)
 *  2) Softens world idle tick when heavily restricted (Phase 1)
 *  3) Optional struggle progress drip outside hard engage (flagged)
 *  4) Exposes effective combat pressure scores for UI / future phases
 *
 * Enable pieces:
 *   KD_COMBAT_RT_ENABLED = true;       // master: apply restraint → rate mults
 *   KD_STRUGGLE_RT_DRIP = true;        // optional continuous struggle progress
 */
(function KDCombatRestraintRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_COMBAT_RT_ENABLED === "undefined") g.KD_COMBAT_RT_ENABLED = false;
	if (typeof g.KD_STRUGGLE_RT_DRIP === "undefined") g.KD_STRUGGLE_RT_DRIP = false;
	/** base step ms when unrestricted (synced toward Phase 3 default) */
	if (typeof g.KD_COMBAT_RT_BASE_STEP_MS === "undefined") g.KD_COMBAT_RT_BASE_STEP_MS = 120;
	/** max slow mult on step interval (2.5 = 2.5× slower) */
	if (typeof g.KD_COMBAT_RT_MAX_SLOW_MULT === "undefined") g.KD_COMBAT_RT_MAX_SLOW_MULT = 2.75;
	/** struggle progress per soft tick when drip on (very small) */
	if (typeof g.KD_STRUGGLE_RT_AMOUNT === "undefined") g.KD_STRUGGLE_RT_AMOUNT = 0.012;
	/** ms between struggle drip ticks */
	if (typeof g.KD_STRUGGLE_RT_MS === "undefined") g.KD_STRUGGLE_RT_MS = 400;

	var struggleAcc = 0;
	var lastNow = 0;
	var lastPressure: any = null;

	function isGameActive(): boolean {
		try {
			if (typeof KinkyDungeonState !== "undefined" && KinkyDungeonState !== "Game") return false;
			if (typeof KinkyDungeonDrawState !== "undefined" && KinkyDungeonDrawState && KinkyDungeonDrawState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

	function isEngaged(): boolean {
		try {
			if (typeof KDTimeIsEngaged === "function") return !!KDTimeIsEngaged();
		} catch (_e) {}
		return false;
	}

	function num(v: any, d: number): number {
		var n = Number(v);
		return isFinite(n) ? n : d;
	}

	/** Read restraint / body pressure from live game state */
	function KDCombatRTReadPressure(): any {
		var slow = 0;
		var freeze = 0;
		var bind = 0;
		var restriction = 0;
		var stamRatio = 1;
		var willRatio = 1;
		var arms = false;
		var legs = false;
		var gag = 0;

		try {
			if (typeof KinkyDungeonSlowLevel !== "undefined") slow = num(KinkyDungeonSlowLevel, 0);
		} catch (_e) {}
		try {
			if (typeof KinkyDungeonFreezeTurns !== "undefined") freeze = num(KinkyDungeonFreezeTurns, 0);
			else if (typeof KDGameData !== "undefined" && KDGameData && typeof KDGameData.FreezeTurns === "number")
				freeze = KDGameData.FreezeTurns;
		} catch (_e2) {}
		try {
			if (typeof KinkyDungeonStatStamina !== "undefined" && typeof KinkyDungeonStatStaminaMax !== "undefined" && KinkyDungeonStatStaminaMax > 0)
				stamRatio = Math.max(0, Math.min(1, KinkyDungeonStatStamina / KinkyDungeonStatStaminaMax));
		} catch (_e3) {}
		try {
			if (typeof KinkyDungeonStatWill !== "undefined" && typeof KinkyDungeonStatWillMax !== "undefined" && KinkyDungeonStatWillMax > 0)
				willRatio = Math.max(0, Math.min(1, KinkyDungeonStatWill / KinkyDungeonStatWillMax));
		} catch (_e4) {}
		try {
			if (typeof KinkyDungeonGetRestriction === "function") restriction = num(KinkyDungeonGetRestriction(), 0);
			else if (typeof KDGetRestriction === "function") restriction = num(KDGetRestriction(), 0);
		} catch (_e5) {}
		try {
			if (typeof KinkyDungeonGetRestraintItem === "function") {
				if (KinkyDungeonGetRestraintItem("ItemArms") || KinkyDungeonGetRestraintItem("ItemHands")) arms = true;
				if (KinkyDungeonGetRestraintItem("ItemLegs") || KinkyDungeonGetRestraintItem("ItemFeet")) legs = true;
			}
		} catch (_e6) {}
		try {
			if (typeof KinkyDungeonGagTotal === "function") gag = num(KinkyDungeonGagTotal(), 0);
		} catch (_e7) {}

		// Bind score from restriction + limb locks
		bind = Math.min(1, (restriction / 12) + (arms ? 0.25 : 0) + (legs ? 0.2 : 0));
		var slowNorm = Math.min(1, slow / 5);
		var freezeBlock = freeze > 0 ? 1 : 0;
		var fatigue = 1 - stamRatio;

		// Effective move interval multiplier (>=1 = slower)
		var maxMult = num(g.KD_COMBAT_RT_MAX_SLOW_MULT, 2.75);
		var moveMult = 1
			+ slowNorm * 0.9
			+ bind * 0.55
			+ fatigue * 0.35
			+ (legs ? 0.2 : 0);
		if (freezeBlock) moveMult = Math.max(moveMult, maxMult);
		moveMult = Math.max(1, Math.min(maxMult, moveMult));

		var attackPenalty = Math.min(0.45, bind * 0.25 + (arms ? 0.15 : 0) + gag * 0.1);
		var struggleHard = Math.min(0.5, bind * 0.3 + slowNorm * 0.15 + (1 - willRatio) * 0.2);

		lastPressure = {
			slow: slow,
			freeze: freeze,
			bind: bind,
			restriction: restriction,
			arms: arms,
			legs: legs,
			gag: gag,
			stamRatio: stamRatio,
			willRatio: willRatio,
			moveMult: moveMult,
			attackPenalty: attackPenalty,
			struggleHard: struggleHard,
			engaged: isEngaged(),
		};
		return lastPressure;
	}

	/** Apply pressure into Phase 1/3 globals (explore only) */
	function applyRateMults(p: any): void {
		if (!g.KD_COMBAT_RT_ENABLED || !p) return;
		if (isEngaged()) {
			// Combat: do not rewrite player step timing — pure turns
			return;
		}
		var base = num(g.KD_COMBAT_RT_BASE_STEP_MS, 120);
		g.KD_PLAYER_RT_STEP_MS = Math.round(base * p.moveMult);

		// Idle world tick slightly slower when bound (optional coupling)
		var idleBase = 100;
		try {
			if (typeof g.KD_TIME_IDLE_MS_BASE === "undefined") g.KD_TIME_IDLE_MS_BASE = num(g.KD_TIME_IDLE_MS, 100);
			idleBase = num(g.KD_TIME_IDLE_MS_BASE, 100);
		} catch (_e) {}
		if (g.KD_TIME_IDLE_TICK_ENABLED) {
			g.KD_TIME_IDLE_MS = Math.round(idleBase * Math.min(2.2, 0.85 + p.moveMult * 0.4));
		}

		// AI movePoints drip weaker when player is slow (world not racing ahead as hard)
		if (typeof g.KD_AI_RT_MOVEPOINTS_DRIP === "number") {
			if (typeof g.KD_AI_RT_MOVEPOINTS_DRIP_BASE === "undefined")
				g.KD_AI_RT_MOVEPOINTS_DRIP_BASE = g.KD_AI_RT_MOVEPOINTS_DRIP;
			var bd = num(g.KD_AI_RT_MOVEPOINTS_DRIP_BASE, 0.35);
			g.KD_AI_RT_MOVEPOINTS_DRIP = bd / Math.max(1, p.moveMult * 0.85);
		}
	}

	function tryStruggleDrip(dtMs: number): void {
		if (!g.KD_STRUGGLE_RT_DRIP) return;
		if (!isGameActive()) return;
		// Never drip struggle mid hard engage — combat pace stays intentional
		if (isEngaged()) return;

		struggleAcc += dtMs;
		var interval = Math.max(200, num(g.KD_STRUGGLE_RT_MS, 400));
		if (struggleAcc < interval) return;
		struggleAcc = 0;

		var amount = num(g.KD_STRUGGLE_RT_AMOUNT, 0.012);
		var p = lastPressure || KDCombatRTReadPressure();
		amount *= Math.max(0.35, 1 - (p.struggleHard || 0));

		// Best-effort: bump struggle progress on worn restraints if APIs exist
		try {
			if (typeof KinkyDungeonAllRestraint !== "function") return;
			var list = KinkyDungeonAllRestraint();
			if (!list || !list.length) return;
			// Prefer a bound group with existing progress fields
			for (var i = 0; i < list.length && i < 8; i++) {
				var it = list[i];
				if (!it) continue;
				var item = it.item || it;
				if (!item) continue;
				if (typeof item.struggleProgress === "number") {
					item.struggleProgress = Math.min(0.99, item.struggleProgress + amount);
					break;
				}
				if (typeof item.progress === "number") {
					item.progress = Math.min(0.99, item.progress + amount);
					break;
				}
			}
		} catch (_e) {}
	}

	function KDCombatRTGetState(): any {
		var p = KDCombatRTReadPressure();
		return {
			enabled: !!g.KD_COMBAT_RT_ENABLED,
			struggleDrip: !!g.KD_STRUGGLE_RT_DRIP,
			engaged: isEngaged(),
			pressure: p,
			effectiveStepMs: g.KD_PLAYER_RT_STEP_MS,
			effectiveIdleMs: g.KD_TIME_IDLE_MS,
		};
	}

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function pump(): void {
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = Math.min(0.25, Math.max(0, (t - lastNow) / 1000));
		lastNow = t;

		if (isGameActive() && g.KD_COMBAT_RT_ENABLED) {
			var p = KDCombatRTReadPressure();
			applyRateMults(p);
		}
		if (isGameActive()) tryStruggleDrip(dt * 1000);

		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}

	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDCombatRTReadPressure = KDCombatRTReadPressure;
	g.KDCombatRTGetState = KDCombatRTGetState;

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDCombatRT] Phase 4 combat/restraint layer online (default OFF). KD_COMBAT_RT_ENABLED=true applies bind/slow → explore step rate; combat stays turn-based when engaged.");
	} catch (_c) {}
})();
