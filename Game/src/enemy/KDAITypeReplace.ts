"use strict";
/** Core replace — continuous AI profiles (TS-safe) */
(function KDAITypeReplaceBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_REPLACE_AITYPE === "undefined") g.KD_REPLACE_AITYPE = false;
	if (typeof g.KD_AITYPE_TICK_MS === "undefined") g.KD_AITYPE_TICK_MS = 200;
	if (typeof g.KD_AITYPE_BUDGET === "undefined") g.KD_AITYPE_BUDGET = 12;

	var lastNow = 0;
	var acc = 0;
	var ticks = 0;
	var cursor = 0;

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

	function playerXY(): any {
		try {
			if (g.KinkyDungeonPlayerEntity)
				return { x: g.KinkyDungeonPlayerEntity.x || 0, y: g.KinkyDungeonPlayerEntity.y || 0 };
		} catch (_e) {}
		return { x: 0, y: 0 };
	}

	function entityList(): any[] {
		try {
			if (g.KDMapData && g.KDMapData.Entities) return g.KDMapData.Entities;
		} catch (_e) {}
		return [];
	}

	function dist(a: any, me: any): number {
		return Math.max(Math.abs((a.x || 0) - me.x), Math.abs((a.y || 0) - me.y));
	}

	function applyProfile(e: any, me: any): void {
		if (!e || e.player) return;
		var d = dist(e, me);
		var hostile = true;
		try {
			if (typeof g.KinkyDungeonHostile === "function") hostile = !!g.KinkyDungeonHostile(e);
			else if (e.hostile === false || e.allied) hostile = false;
		} catch (_h) {}

		var profile = String(e.AI || e.ai || (e.Enemy && e.Enemy.AI) || "wander").toLowerCase();

		if (hostile && d <= 10) {
			e.gx = me.x;
			e.gy = me.y;
			e.__kd_profile = "hunt";
			if (typeof e.movePoints === "number") e.movePoints = Math.max(0, e.movePoints - 0.4);
			else e.movePoints = 0;
		} else if (hostile && d <= 16) {
			e.gx = me.x + ((Math.random() * 3) | 0) - 1;
			e.gy = me.y + ((Math.random() * 3) | 0) - 1;
			e.__kd_profile = "investigate";
			if (typeof e.movePoints === "number") e.movePoints = Math.max(0, e.movePoints - 0.2);
		} else if (profile.indexOf("guard") >= 0 || profile.indexOf("patrol") >= 0) {
			e.__kd_profile = "patrol";
			if (typeof e.gx !== "number" || Math.random() < 0.02) {
				e.gx = (e.x || 0) + ((Math.random() * 5) | 0) - 2;
				e.gy = (e.y || 0) + ((Math.random() * 5) | 0) - 2;
			}
		} else {
			e.__kd_profile = "wander";
			if (typeof e.gx !== "number" || Math.random() < 0.03) {
				e.gx = (e.x || 0) + ((Math.random() * 7) | 0) - 3;
				e.gy = (e.y || 0) + ((Math.random() * 7) | 0) - 3;
			}
		}

		try {
			var hp = e.hp != null ? e.hp : (e.Enemy && e.Enemy.maxhp);
			var max = e.Enemy && e.Enemy.maxhp ? e.Enemy.maxhp : hp;
			if (hp != null && max && hp / max < 0.25 && hostile) {
				e.gx = (e.x || 0) * 2 - me.x;
				e.gy = (e.y || 0) * 2 - me.y;
				e.__kd_profile = "flee";
			}
		} catch (_f) {}
	}

	function tick(): void {
		if (!g.KD_REPLACE_AITYPE || !isGameActive()) return;
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = t - lastNow;
		lastNow = t;
		acc += dt;
		var interval = Math.max(50, Number(g.KD_AITYPE_TICK_MS) || 200);
		if (acc < interval) return;
		acc = 0;
		ticks++;

		var me = playerXY();
		var list = entityList();
		if (!list.length) return;
		var budget = Math.max(1, Number(g.KD_AITYPE_BUDGET) || 12);
		var n = list.length;
		for (var b = 0; b < budget; b++) {
			cursor = (cursor + 1) % n;
			try { applyProfile(list[cursor], me); } catch (_e) {}
		}
	}

	function pump(): void {
		try { tick(); } catch (_e) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDAITypeReplaceGetState = function () {
		return { enabled: !!g.KD_REPLACE_AITYPE, ticks: ticks, intervalMs: g.KD_AITYPE_TICK_MS, budget: g.KD_AITYPE_BUDGET };
	};

	try { console.log("[KDAITypeReplace] continuous profiles online (default OFF)."); } catch (_c) {}
})();
