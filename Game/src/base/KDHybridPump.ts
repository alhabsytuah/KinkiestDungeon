"use strict";
/**
 * Unified hybrid frame coordinator
 * Registers tick callbacks so modules can share one rAF instead of N independent loops.
 * Existing modules keep working; new code should prefer KDHybridPumpRegister.
 */
(function KDHybridPumpBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_HYBRID_UNIFIED_PUMP === "undefined") g.KD_HYBRID_UNIFIED_PUMP = true;

	var cbs: { name: string; fn: (dt: number) => void; everyMs: number; acc: number }[] = [];
	var lastNow = 0;
	var frames = 0;

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function KDHybridPumpRegister(name: string, fn: (dt: number) => void, everyMs?: number): void {
		if (!name || typeof fn !== "function") return;
		for (var i = 0; i < cbs.length; i++) {
			if (cbs[i].name === name) {
				cbs[i].fn = fn;
				cbs[i].everyMs = everyMs || 0;
				return;
			}
		}
		cbs.push({ name: name, fn: fn, everyMs: everyMs || 0, acc: 0 });
	}

	function KDHybridPumpUnregister(name: string): void {
		cbs = cbs.filter(function (c) { return c.name !== name; });
	}

	function pump(): void {
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = Math.min(0.1, Math.max(0, (t - lastNow) / 1000));
		lastNow = t;
		frames++;
		if (g.KD_HYBRID_UNIFIED_PUMP) {
			for (var i = 0; i < cbs.length; i++) {
				var c = cbs[i];
				if (c.everyMs > 0) {
					c.acc += dt * 1000;
					if (c.acc < c.everyMs) continue;
					c.acc = 0;
				}
				try { c.fn(dt); } catch (_e) {}
			}
		}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 16);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 16);

	g.KDHybridPumpRegister = KDHybridPumpRegister;
	g.KDHybridPumpUnregister = KDHybridPumpUnregister;
	g.KDHybridPumpGetState = function () {
		return { frames: frames, callbacks: cbs.map(function (c) { return c.name; }), unified: !!g.KD_HYBRID_UNIFIED_PUMP };
	};
})();
