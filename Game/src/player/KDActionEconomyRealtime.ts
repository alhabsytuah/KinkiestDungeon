"use strict";
/**
 * Phase 5c — Real-time combat action economy (item 3)
 *
 * Soft global cooldown (GCD) between player combat-ish inputs.
 * Does not replace turns; spaces repeated struggle/attack/spell sends in real time.
 *
 * Enable: KD_ACTION_ECON_ENABLED = true;
 */
(function KDActionEconomyRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_ACTION_ECON_ENABLED === "undefined") g.KD_ACTION_ECON_ENABLED = false;
	if (typeof g.KD_ACTION_GCD_MS === "undefined") g.KD_ACTION_GCD_MS = 280;
	if (typeof g.KD_ACTION_GCD_MOVE_MS === "undefined") g.KD_ACTION_GCD_MOVE_MS = 0; // 0 = don't gate pure move
	if (typeof g.KD_ACTION_GCD_STRUGGLE_MS === "undefined") g.KD_ACTION_GCD_STRUGGLE_MS = 350;
	if (typeof g.KD_ACTION_GCD_ATTACK_MS === "undefined") g.KD_ACTION_GCD_ATTACK_MS = 400;
	if (typeof g.KD_ACTION_GCD_SPELL_MS === "undefined") g.KD_ACTION_GCD_SPELL_MS = 450;

	var lastByType: Record<string, number> = {};
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
		if (t - last < need) {
			blocked++;
			return false;
		}
		// light global spacing
		var gNeed = Number(g.KD_ACTION_GCD_MS) || 0;
		if (gNeed > 0 && bucket !== "move" && t - lastAny < gNeed * 0.5) {
			blocked++;
			return false;
		}
		lastByType[bucket] = t;
		lastAny = t;
		passed++;
		return true;
	}

	// Wrap KDSendInput when available
	function install(): void {
		var original = g.KDSendInput;
		if (typeof original !== "function") {
			setTimeout(install, 500);
			return;
		}
		if ((original as any).__kdActionEcon) return;
		var wrapped = function (type: string, data: any, frame?: boolean, noUpdate?: boolean, process?: boolean) {
			if (!KDActionEconAllow(type)) return "gcd";
			return original(type, data, frame, noUpdate, process);
		};
		(wrapped as any).__kdActionEcon = true;
		g.KDSendInput = wrapped;
	}
	install();

	g.KDActionEconAllow = KDActionEconAllow;
	g.KDActionEconGetState = function () {
		return {
			enabled: !!g.KD_ACTION_ECON_ENABLED,
			blocked: blocked,
			passed: passed,
			lastByType: lastByType,
			gcdMs: g.KD_ACTION_GCD_MS,
		};
	};

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDActionEcon] Phase 5c action GCD online (default OFF). KD_ACTION_ECON_ENABLED=true");
	} catch (_c) {}
})();
