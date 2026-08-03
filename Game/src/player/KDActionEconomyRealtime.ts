"use strict";
/** Phase 5c — Action GCD (TS-safe) */
(function KDActionEconomyRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_ACTION_ECON_ENABLED === "undefined") g.KD_ACTION_ECON_ENABLED = false;
	if (typeof g.KD_ACTION_GCD_MS === "undefined") g.KD_ACTION_GCD_MS = 280;
	if (typeof g.KD_ACTION_GCD_MOVE_MS === "undefined") g.KD_ACTION_GCD_MOVE_MS = 0;
	if (typeof g.KD_ACTION_GCD_STRUGGLE_MS === "undefined") g.KD_ACTION_GCD_STRUGGLE_MS = 350;
	if (typeof g.KD_ACTION_GCD_ATTACK_MS === "undefined") g.KD_ACTION_GCD_ATTACK_MS = 400;
	if (typeof g.KD_ACTION_GCD_SPELL_MS === "undefined") g.KD_ACTION_GCD_SPELL_MS = 450;

	var lastByType: any = {};
	var lastAny = 0;
	var blocked = 0;
	var passed = 0;

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function bucketFor(type: string): string {
		if (!type) return "other";
		if (type === "move" || type === "movestairs") return "move";
		if (type === "struggle" || type === "struggleCurse" || type === "pick" || type === "unlock") return "struggle";
		if (type === "doattack" || type === "dospecial" || type === "docapture") return "attack";
		if (type === "tryCastSpell" || type === "spellCastFromBook" || type === "upcast") return "spell";
		return "other";
	}

	function gcdMsFor(bucket: string): number {
		if (bucket === "move") return Number(g.KD_ACTION_GCD_MOVE_MS) || 0;
		if (bucket === "struggle") return Number(g.KD_ACTION_GCD_STRUGGLE_MS) || 350;
		if (bucket === "attack") return Number(g.KD_ACTION_GCD_ATTACK_MS) || 400;
		if (bucket === "spell") return Number(g.KD_ACTION_GCD_SPELL_MS) || 450;
		return Number(g.KD_ACTION_GCD_MS) || 280;
	}

	function KDActionEconAllow(type: string): boolean {
		if (!g.KD_ACTION_ECON_ENABLED) return true;
		var t = nowMs();
		var bucket = bucketFor(type);
		var need = gcdMsFor(bucket);
		if (need <= 0) return true;
		var last = lastByType[bucket] || 0;
		if (t - last < need) { blocked++; return false; }
		var gNeed = Number(g.KD_ACTION_GCD_MS) || 0;
		if (gNeed > 0 && bucket !== "move" && t - lastAny < gNeed * 0.5) { blocked++; return false; }
		lastByType[bucket] = t;
		lastAny = t;
		passed++;
		return true;
	}

	g.KDActionEconAllow = KDActionEconAllow;
	g.KDActionEconGetState = function () {
		return { enabled: !!g.KD_ACTION_ECON_ENABLED, blocked: blocked, passed: passed, lastByType: lastByType, gcdMs: g.KD_ACTION_GCD_MS };
	};

	try { console.log("[KDActionEcon] Phase 5c online (default OFF)."); } catch (_c) {}
})();
