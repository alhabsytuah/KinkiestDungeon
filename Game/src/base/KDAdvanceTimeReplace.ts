"use strict";
/** Core replace layer — KinkyDungeonAdvanceTime (TS-safe) */
(function KDAdvanceTimeReplaceBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_REPLACE_ADVANCE_TIME === "undefined") g.KD_REPLACE_ADVANCE_TIME = false;
	if (typeof g.KD_ADVANCE_TIME_SCALE === "undefined") g.KD_ADVANCE_TIME_SCALE = 1;
	if (typeof g.KD_ADVANCE_TIME_MAX_BATCH === "undefined") g.KD_ADVANCE_TIME_MAX_BATCH = 3;

	var original: any = null;
	var installed = false;
	var totalCalls = 0;
	var mediatedCalls = 0;
	var worldFrac = 0;

	function capture(): void {
		if (typeof g.KinkyDungeonAdvanceTime === "function" && !g.KinkyDungeonAdvanceTime.__kdReplace) {
			original = g.KinkyDungeonAdvanceTime;
		}
	}

	function mediatedAdvance(delta?: number, noUpdate?: boolean, suppress?: boolean): any {
		capture();
		totalCalls++;
		if (!g.KD_REPLACE_ADVANCE_TIME || typeof original !== "function") {
			return original ? original(delta, noUpdate, suppress) : undefined;
		}
		mediatedCalls++;
		var d = typeof delta === "number" && delta > 0 ? delta : 1;
		var scale = Number(g.KD_ADVANCE_TIME_SCALE) || 1;
		var maxBatch = Math.max(1, Number(g.KD_ADVANCE_TIME_MAX_BATCH) || 3);

		try {
			if (g.KDTimeState) {
				g.KDTimeState.worldTime += d * 0.1 * scale;
				g.KDTimeState.turnCount += d;
			}
		} catch (_e) {}

		worldFrac += d * scale;
		var steps = Math.floor(worldFrac);
		if (steps < 1) {
			return original(1, noUpdate, suppress);
		}
		worldFrac -= steps;
		if (steps > maxBatch) steps = maxBatch;

		var last: any;
		for (var i = 0; i < steps; i++) {
			last = original(1, noUpdate, suppress);
			try {
				if (typeof g.KDTimeIsEngaged === "function" && g.KDTimeIsEngaged() && i + 1 < steps) break;
			} catch (_e2) {}
		}
		return last;
	}

	function install(): void {
		capture();
		if (typeof original !== "function") {
			setTimeout(install, 400);
			return;
		}
		if (installed) return;
		(mediatedAdvance as any).__kdReplace = true;
		g.KinkyDungeonAdvanceTime = mediatedAdvance;
		installed = true;
		try {
			if (typeof console !== "undefined" && console.log)
				console.log("[KDAdvanceTimeReplace] installed (active only when KD_REPLACE_ADVANCE_TIME=true)");
		} catch (_c) {}
	}
	install();

	g.KDAdvanceTimeReplaceGetState = function () {
		return {
			enabled: !!g.KD_REPLACE_ADVANCE_TIME,
			installed: installed,
			totalCalls: totalCalls,
			mediatedCalls: mediatedCalls,
			worldFrac: worldFrac,
			scale: g.KD_ADVANCE_TIME_SCALE,
		};
	};
})();
