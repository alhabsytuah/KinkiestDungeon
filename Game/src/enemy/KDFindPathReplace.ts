"use strict";
/** Core replace — FindPath cache (TS-safe) */
(function KDFindPathReplaceBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_REPLACE_FIND_PATH === "undefined") g.KD_REPLACE_FIND_PATH = false;
	if (typeof g.KD_PATH_CACHE_TTL_MS === "undefined") g.KD_PATH_CACHE_TTL_MS = 450;
	if (typeof g.KD_PATH_REPATH_BUDGET === "undefined") g.KD_PATH_REPATH_BUDGET = 4;
	if (typeof g.KD_PATH_REPATH_MS === "undefined") g.KD_PATH_REPATH_MS = 300;

	var original: any = null;
	var installed = false;
	var cache: any = {};
	var hits = 0;
	var misses = 0;
	var clears = 0;
	var lastRepath = 0;
	var repathCursor = 0;

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function key(x1: any, y1: any, x2: any, y2: any, block?: any): string {
		return x1 + "," + y1 + ">" + x2 + "," + y2 + ":" + (block || "");
	}

	function KDFindPathClearCache(): void {
		cache = {};
		clears++;
	}

	function capture(): void {
		if (typeof g.KinkyDungeonFindPath === "function" && !g.KinkyDungeonFindPath.__kdReplace) {
			original = g.KinkyDungeonFindPath;
		}
	}

	var mediatedFindPath: any = function (): any {
		capture();
		if (!g.KD_REPLACE_FIND_PATH || typeof original !== "function") {
			return original ? original.apply(null, arguments) : null;
		}
		var args: any = arguments;
		var x1 = args[0], y1 = args[1], x2 = args[2], y2 = args[3];
		var block = args.length > 4 ? args[4] : undefined;
		var k = key(x1, y1, x2, y2, typeof block === "object" ? "o" : block);
		var t = nowMs();
		var ttl = Number(g.KD_PATH_CACHE_TTL_MS) || 450;
		var c = cache[k];
		if (c && t - c.t < ttl && c.gx === x2 && c.gy === y2) {
			hits++;
			return c.path;
		}
		misses++;
		var path = original.apply(null, args);
		cache[k] = { path: path, t: t, gx: x2, gy: y2 };
		if (misses % 40 === 0) {
			for (var ck in cache) {
				if (t - cache[ck].t > ttl * 4) delete cache[ck];
			}
		}
		return path;
	};

	function install(): void {
		capture();
		if (typeof original !== "function") {
			setTimeout(install, 400);
			return;
		}
		if (installed) return;
		mediatedFindPath.__kdReplace = true;
		g.KinkyDungeonFindPath = mediatedFindPath;
		installed = true;
		try { console.log("[KDFindPathReplace] installed"); } catch (_c) {}
	}
	install();

	function entityList(): any[] {
		try {
			if (g.KDMapData && g.KDMapData.Entities) return g.KDMapData.Entities;
		} catch (_e) {}
		return [];
	}

	function repathTick(): void {
		if (!g.KD_REPLACE_FIND_PATH || typeof original !== "function") return;
		var t = nowMs();
		if (t - lastRepath < (Number(g.KD_PATH_REPATH_MS) || 300)) return;
		lastRepath = t;
		var list = entityList();
		if (!list.length) return;
		var budget = Math.max(1, Number(g.KD_PATH_REPATH_BUDGET) || 4);
		var n = list.length;
		for (var b = 0; b < budget; b++) {
			repathCursor = (repathCursor + 1) % n;
			var e = list[repathCursor];
			if (!e || e.player) continue;
			if (typeof e.gx !== "number" || typeof e.gy !== "number") continue;
			if (e.gx === e.x && e.gy === e.y) continue;
			var need = !e.path || !e.path.length;
			if (!need && e.path && e.path[0]) {
				var step = e.path[0];
				var sx = step.x != null ? step.x : step[0];
				var sy = step.y != null ? step.y : step[1];
				if (Math.abs(sx - e.x) > 1 || Math.abs(sy - e.y) > 1) need = true;
			}
			if (!need && Math.random() > 0.15) continue;
			try {
				var p = mediatedFindPath(e.x, e.y, e.gx, e.gy);
				if (p) e.path = p;
			} catch (_e) {}
		}
	}

	function pump(): void {
		try { repathTick(); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDFindPathClearCache = KDFindPathClearCache;
	g.KDFindPathReplaceGetState = function () {
		return {
			enabled: !!g.KD_REPLACE_FIND_PATH,
			installed: installed,
			hits: hits,
			misses: misses,
			clears: clears,
			cacheSize: Object.keys(cache).length,
		};
	};
})();
