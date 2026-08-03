"use strict";
/** Phase 4 — Combat & restraints hybrid (TS-safe) */
(function KDCombatRestraintRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_COMBAT_RT_ENABLED === "undefined") g.KD_COMBAT_RT_ENABLED = false;
	if (typeof g.KD_STRUGGLE_RT_DRIP === "undefined") g.KD_STRUGGLE_RT_DRIP = false;
	if (typeof g.KD_COMBAT_RT_BASE_STEP_MS === "undefined") g.KD_COMBAT_RT_BASE_STEP_MS = 120;
	if (typeof g.KD_COMBAT_RT_MAX_SLOW_MULT === "undefined") g.KD_COMBAT_RT_MAX_SLOW_MULT = 2.75;
	if (typeof g.KD_STRUGGLE_RT_AMOUNT === "undefined") g.KD_STRUGGLE_RT_AMOUNT = 0.012;
	if (typeof g.KD_STRUGGLE_RT_MS === "undefined") g.KD_STRUGGLE_RT_MS = 400;

	var struggleAcc = 0;
	var lastNow = 0;
	var lastPressure: any = null;

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

	function num(v: any, d: number): number {
		var n = Number(v);
		return isFinite(n) ? n : d;
	}

	function KDCombatRTReadPressure(): any {
		var slow = 0, freeze = 0, bind = 0, restriction = 0, stamRatio = 1, willRatio = 1;
		var arms = false, legs = false, gag = 0;

		try { if (typeof g.KinkyDungeonSlowLevel !== "undefined") slow = num(g.KinkyDungeonSlowLevel, 0); } catch (_e) {}
		try {
			if (typeof g.KinkyDungeonFreezeTime !== "undefined" && g.KinkyDungeonFreezeTime > 0) freeze = 1;
			else if (g.KDGameData && typeof g.KDGameData.FreezeTime === "number" && g.KDGameData.FreezeTime > 0) freeze = 1;
		} catch (_e2) {}
		try {
			if (typeof g.KinkyDungeonStatStamina !== "undefined" && g.KinkyDungeonStatStaminaMax > 0)
				stamRatio = Math.max(0, Math.min(1, g.KinkyDungeonStatStamina / g.KinkyDungeonStatStaminaMax));
		} catch (_e3) {}
		try {
			if (typeof g.KinkyDungeonStatWill !== "undefined" && g.KinkyDungeonStatWillMax > 0)
				willRatio = Math.max(0, Math.min(1, g.KinkyDungeonStatWill / g.KinkyDungeonStatWillMax));
		} catch (_e4) {}
		try {
			if (typeof g.KinkyDungeonGetRestriction === "function") restriction = num(g.KinkyDungeonGetRestriction(), 0);
			else if (typeof g.KDGetRestriction === "function") restriction = num(g.KDGetRestriction(), 0);
		} catch (_e5) {}
		try {
			if (typeof g.KinkyDungeonGetRestraintItem === "function") {
				if (g.KinkyDungeonGetRestraintItem("ItemArms") || g.KinkyDungeonGetRestraintItem("ItemHands")) arms = true;
				if (g.KinkyDungeonGetRestraintItem("ItemLegs") || g.KinkyDungeonGetRestraintItem("ItemFeet")) legs = true;
			}
		} catch (_e6) {}
		try {
			if (typeof g.KinkyDungeonGagTotal === "function") gag = num(g.KinkyDungeonGagTotal(), 0);
		} catch (_e7) {}

		bind = Math.min(1, (restriction / 12) + (arms ? 0.25 : 0) + (legs ? 0.2 : 0));
		var slowNorm = Math.min(1, slow / 5);
		var freezeBlock = freeze > 0 ? 1 : 0;
		var fatigue = 1 - stamRatio;
		var maxMult = num(g.KD_COMBAT_RT_MAX_SLOW_MULT, 2.75);
		var moveMult = 1 + slowNorm * 0.9 + bind * 0.55 + fatigue * 0.35 + (legs ? 0.2 : 0);
		if (freezeBlock) moveMult = Math.max(moveMult, maxMult);
		moveMult = Math.max(1, Math.min(maxMult, moveMult));

		lastPressure = {
			slow: slow, freeze: freeze, bind: bind, restriction: restriction,
			arms: arms, legs: legs, gag: gag, stamRatio: stamRatio, willRatio: willRatio,
			moveMult: moveMult,
			attackPenalty: Math.min(0.45, bind * 0.25 + (arms ? 0.15 : 0) + gag * 0.1),
			struggleHard: Math.min(0.5, bind * 0.3 + slowNorm * 0.15 + (1 - willRatio) * 0.2),
			engaged: isEngaged(),
		};
		return lastPressure;
	}

	function applyRateMults(p: any): void {
		if (!g.KD_COMBAT_RT_ENABLED || !p || isEngaged()) return;
		var base = num(g.KD_COMBAT_RT_BASE_STEP_MS, 120);
		g.KD_PLAYER_RT_STEP_MS = Math.round(base * p.moveMult);
		var idleBase = 100;
		try {
			if (typeof g.KD_TIME_IDLE_MS_BASE === "undefined") g.KD_TIME_IDLE_MS_BASE = num(g.KD_TIME_IDLE_MS, 100);
			idleBase = num(g.KD_TIME_IDLE_MS_BASE, 100);
		} catch (_e) {}
		if (g.KD_TIME_IDLE_TICK_ENABLED) {
			g.KD_TIME_IDLE_MS = Math.round(idleBase * Math.min(2.2, 0.85 + p.moveMult * 0.4));
		}
		if (typeof g.KD_AI_RT_MOVEPOINTS_DRIP === "number") {
			if (typeof g.KD_AI_RT_MOVEPOINTS_DRIP_BASE === "undefined")
				g.KD_AI_RT_MOVEPOINTS_DRIP_BASE = g.KD_AI_RT_MOVEPOINTS_DRIP;
			var bd = num(g.KD_AI_RT_MOVEPOINTS_DRIP_BASE, 0.35);
			g.KD_AI_RT_MOVEPOINTS_DRIP = bd / Math.max(1, p.moveMult * 0.85);
		}
	}

	function tryStruggleDrip(dtMs: number): void {
		if (!g.KD_STRUGGLE_RT_DRIP || !isGameActive() || isEngaged()) return;
		struggleAcc += dtMs;
		var interval = Math.max(200, num(g.KD_STRUGGLE_RT_MS, 400));
		if (struggleAcc < interval) return;
		struggleAcc = 0;
		var amount = num(g.KD_STRUGGLE_RT_AMOUNT, 0.012);
		var p = lastPressure || KDCombatRTReadPressure();
		amount *= Math.max(0.35, 1 - (p.struggleHard || 0));
		try {
			if (typeof g.KinkyDungeonAllRestraint !== "function") return;
			var list = g.KinkyDungeonAllRestraint();
			if (!list || !list.length) return;
			for (var i = 0; i < list.length && i < 8; i++) {
				var it: any = list[i];
				var item: any = it && (it.item || it);
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
	g.KDCombatRTGetState = function () {
		var p = KDCombatRTReadPressure();
		return {
			enabled: !!g.KD_COMBAT_RT_ENABLED, struggleDrip: !!g.KD_STRUGGLE_RT_DRIP,
			engaged: isEngaged(), pressure: p,
			effectiveStepMs: g.KD_PLAYER_RT_STEP_MS, effectiveIdleMs: g.KD_TIME_IDLE_MS,
		};
	};

	try { console.log("[KDCombatRT] Phase 4 online (default OFF)."); } catch (_c) {}
})();
