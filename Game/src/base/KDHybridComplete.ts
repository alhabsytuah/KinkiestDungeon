"use strict";
/** Hybrid completion pack — TS-safe via globalThis */
(function KDHybridCompleteBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_HYBRID_COMPLETE === "undefined") g.KD_HYBRID_COMPLETE = true;
	if (typeof g.KD_LOGICAL_MOTION === "undefined") g.KD_LOGICAL_MOTION = false;
	if (typeof g.KD_LOGICAL_SPEED === "undefined") g.KD_LOGICAL_SPEED = 2.5;
	if (typeof g.KD_DRAW_VISUAL_HOOK === "undefined") g.KD_DRAW_VISUAL_HOOK = true;
	if (typeof g.KD_RT_ENEMY_DAMAGE === "undefined") g.KD_RT_ENEMY_DAMAGE = false;
	if (typeof g.KD_RT_DAMAGE_PER_SEC === "undefined") g.KD_RT_DAMAGE_PER_SEC = 1.2;
	if (typeof g.KD_RT_COMBAT_FULL === "undefined") g.KD_RT_COMBAT_FULL = false;
	if (typeof g.KD_RT_PLAYER_GCD_MS === "undefined") g.KD_RT_PLAYER_GCD_MS = 500;
	if (typeof g.KD_STRUGGLE_RT_UNLOCK === "undefined") g.KD_STRUGGLE_RT_UNLOCK = false;
	if (typeof g.KD_STRUGGLE_UNLOCK_THRESHOLD === "undefined") g.KD_STRUGGLE_UNLOCK_THRESHOLD = 0.92;
	if (typeof g.KD_HYBRID_DEBUG_UI === "undefined") g.KD_HYBRID_DEBUG_UI = true;
	if (typeof g.KD_HYBRID_SAVE_FLAGS === "undefined") g.KD_HYBRID_SAVE_FLAGS = true;

	var STORAGE_KEY = "KDHybridFlags_v1";
	var lastNow = 0;
	var playerFrac: any = { x: 0, y: 0, tx: 0, ty: 0, active: false };
	var playerGcdUntil = 0;
	var enemyDmgAcc: any = {};
	var debugEl: any = null;
	var originalSend: any = null;
	var sendInstalled = false;

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

	function playerEnt(): any {
		try { return g.KinkyDungeonPlayerEntity || null; } catch (_e) { return null; }
	}

	function entityList(): any[] {
		try {
			if (g.KDMapData && g.KDMapData.Entities) return g.KDMapData.Entities;
		} catch (_e) {}
		return [];
	}

	function KDHybridEnableRecommended(): void {
		g.KD_TIME_IDLE_TICK_ENABLED = true;
		g.KD_TIME_IDLE_MS = 140;
		g.KD_TIME_ENGAGE_RANGE = 6;
		g.KD_AI_RT_ENABLED = true;
		g.KD_PLAYER_RT_ENABLED = true;
		g.KD_PLAYER_RT_STEP_MS = 130;
		g.KD_COMBAT_RT_ENABLED = true;
		g.KD_MOTION_LERP_ENABLED = true;
		g.KD_MOTION_LERP_SPEED = 12;
		g.KD_PATH_FOLLOW_ENABLED = true;
		g.KD_ATTACK_READY_ENABLED = true;
		g.KD_ACTION_ECON_ENABLED = true;
		g.KD_STRUGGLE_PHYS_ENABLED = true;
		g.KD_REPLACE_ADVANCE_TIME = true;
		g.KD_REPLACE_AITYPE = true;
		g.KD_REPLACE_FIND_PATH = true;
		g.KD_LOGICAL_MOTION = true;
		g.KD_DRAW_VISUAL_HOOK = true;
		g.KD_RT_ENEMY_DAMAGE = true;
		g.KD_RT_COMBAT_FULL = true;
		g.KD_STRUGGLE_RT_UNLOCK = true;
		g.KD_HYBRID_DEBUG_UI = true;
		saveFlags();
		try { console.log("[KDHybrid] recommended preset ON + saved"); } catch (_c) {}
	}

	function KDHybridDisableAll(): void {
		var keys = [
			"KD_TIME_IDLE_TICK_ENABLED", "KD_AI_RT_ENABLED", "KD_PLAYER_RT_ENABLED",
			"KD_COMBAT_RT_ENABLED", "KD_MOTION_LERP_ENABLED", "KD_PATH_FOLLOW_ENABLED",
			"KD_ATTACK_READY_ENABLED", "KD_ACTION_ECON_ENABLED", "KD_STRUGGLE_PHYS_ENABLED",
			"KD_REPLACE_ADVANCE_TIME", "KD_REPLACE_AITYPE", "KD_REPLACE_FIND_PATH",
			"KD_LOGICAL_MOTION", "KD_RT_ENEMY_DAMAGE", "KD_RT_COMBAT_FULL", "KD_STRUGGLE_RT_UNLOCK"
		];
		for (var i = 0; i < keys.length; i++) g[keys[i]] = false;
		saveFlags();
	}

	var FLAG_KEYS = [
		"KD_TIME_IDLE_TICK_ENABLED", "KD_TIME_IDLE_MS", "KD_TIME_ENGAGE_RANGE",
		"KD_AI_RT_ENABLED", "KD_PLAYER_RT_ENABLED", "KD_PLAYER_RT_STEP_MS",
		"KD_COMBAT_RT_ENABLED", "KD_MOTION_LERP_ENABLED", "KD_MOTION_LERP_SPEED",
		"KD_PATH_FOLLOW_ENABLED", "KD_ATTACK_READY_ENABLED", "KD_ACTION_ECON_ENABLED",
		"KD_STRUGGLE_PHYS_ENABLED", "KD_REPLACE_ADVANCE_TIME", "KD_REPLACE_AITYPE",
		"KD_REPLACE_FIND_PATH", "KD_LOGICAL_MOTION", "KD_LOGICAL_SPEED",
		"KD_DRAW_VISUAL_HOOK", "KD_RT_ENEMY_DAMAGE", "KD_RT_DAMAGE_PER_SEC",
		"KD_RT_COMBAT_FULL", "KD_RT_PLAYER_GCD_MS", "KD_STRUGGLE_RT_UNLOCK",
		"KD_STRUGGLE_UNLOCK_THRESHOLD", "KD_HYBRID_DEBUG_UI"
	];

	function saveFlags(): void {
		if (!g.KD_HYBRID_SAVE_FLAGS) return;
		try {
			var o: any = {};
			for (var i = 0; i < FLAG_KEYS.length; i++) {
				var k = FLAG_KEYS[i];
				if (typeof g[k] !== "undefined") o[k] = g[k];
			}
			localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
		} catch (_e) {}
	}

	function loadFlags(): void {
		if (!g.KD_HYBRID_SAVE_FLAGS) return;
		try {
			var raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			var o = JSON.parse(raw);
			for (var k in o) {
				if (FLAG_KEYS.indexOf(k) >= 0) g[k] = o[k];
			}
		} catch (_e) {}
	}
	loadFlags();

	function installSendWrap(): void {
		var cur = g.KDSendInput;
		if (typeof cur !== "function") {
			setTimeout(installSendWrap, 400);
			return;
		}
		if (cur.__kdHybridMaster) return;
		originalSend = cur;
		var wrapped: any = function (type: string, data: any, frame?: boolean, noUpdate?: boolean, process?: boolean): any {
			var t = nowMs();
			if (g.KD_RT_COMBAT_FULL && (type === "doattack" || type === "dospecial" || type === "tryCastSpell" || type === "spellCastFromBook")) {
				if (t < playerGcdUntil) return "gcd";
				playerGcdUntil = t + (Number(g.KD_RT_PLAYER_GCD_MS) || 500);
			}
			try {
				if (typeof g.KDActionEconAllow === "function" && !g.KDActionEconAllow(type)) return "gcd";
			} catch (_e) {}
			if (type === "struggle" || type === "struggleCurse") {
				try {
					if (typeof g.KDStrugglePhysStart === "function") g.KDStrugglePhysStart(data && data.group);
				} catch (_e2) {}
			}
			if (g.KD_LOGICAL_MOTION && type === "move" && data && data.dir && !isEngaged()) {
				var pl = playerEnt();
				if (pl && !playerFrac.active) {
					playerFrac.x = pl.x || 0;
					playerFrac.y = pl.y || 0;
					playerFrac.tx = (pl.x || 0) + (data.dir.x || 0);
					playerFrac.ty = (pl.y || 0) + (data.dir.y || 0);
					playerFrac.active = true;
				}
			}
			return originalSend(type, data, frame, noUpdate, process);
		};
		wrapped.__kdHybridMaster = true;
		g.KDSendInput = wrapped;
		sendInstalled = true;
	}
	installSendWrap();

	function tickLogical(dt: number): void {
		if (!g.KD_LOGICAL_MOTION) return;
		if (!isGameActive() || isEngaged()) { playerFrac.active = false; return; }
		var pl = playerEnt();
		if (!pl || !playerFrac.active) return;
		var spd = Number(g.KD_LOGICAL_SPEED) || 2.5;
		var dx = playerFrac.tx - playerFrac.x;
		var dy = playerFrac.ty - playerFrac.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if (dist < 0.001) { playerFrac.active = false; return; }
		var step = Math.min(dist, spd * dt);
		playerFrac.x += (dx / dist) * step;
		playerFrac.y += (dy / dist) * step;
		pl.visual_x = playerFrac.x;
		pl.visual_y = playerFrac.y;
		pl.__kd_logical_x = playerFrac.x;
		pl.__kd_logical_y = playerFrac.y;
		if (Math.abs(playerFrac.x - playerFrac.tx) < 0.05 && Math.abs(playerFrac.y - playerFrac.ty) < 0.05) {
			playerFrac.active = false;
			pl.visual_x = pl.x;
			pl.visual_y = pl.y;
		}
	}

	function installDrawHook(): void {
		if (!g.KD_DRAW_VISUAL_HOOK) return;
		if (typeof g.KDEntityVisualPos !== "function") {
			g.KDEntityVisualPos = function (e: any): any {
				if (!e) return { x: 0, y: 0 };
				return {
					x: typeof e.visual_x === "number" ? e.visual_x : (e.x || 0),
					y: typeof e.visual_y === "number" ? e.visual_y : (e.y || 0),
				};
			};
		}
	}
	installDrawHook();

	function tickEnemyDamage(dt: number): void {
		if (!g.KD_RT_ENEMY_DAMAGE || !isGameActive()) return;
		var pl = playerEnt();
		if (!pl) return;
		var list = entityList();
		var rate = Number(g.KD_RT_DAMAGE_PER_SEC) || 1.2;
		for (var i = 0; i < list.length && i < 40; i++) {
			var e = list[i];
			if (!e || e.player) continue;
			var d = Math.max(Math.abs((e.x || 0) - (pl.x || 0)), Math.abs((e.y || 0) - (pl.y || 0)));
			if (d > 1) continue;
			var ready = typeof e.__kd_attackReady === "number" ? e.__kd_attackReady : (isEngaged() ? 1 : 0);
			if (ready < 0.85 && !isEngaged()) continue;
			var id = String(e.id != null ? e.id : i);
			enemyDmgAcc[id] = (enemyDmgAcc[id] || 0) + rate * dt * ready;
			if (enemyDmgAcc[id] < 1) continue;
			enemyDmgAcc[id] -= Math.floor(enemyDmgAcc[id]);
			e.__kd_wantAttack = true;
		}
	}

	function tickStruggleUnlock(): void {
		if (!g.KD_STRUGGLE_RT_UNLOCK || !isGameActive()) return;
		var thr = Number(g.KD_STRUGGLE_UNLOCK_THRESHOLD) || 0.92;
		try {
			if (typeof g.KinkyDungeonAllRestraint !== "function") return;
			var list = g.KinkyDungeonAllRestraint();
			if (!list) return;
			for (var i = 0; i < list.length; i++) {
				var it: any = list[i];
				var item: any = it && (it.item || it);
				if (!item || typeof item.struggleProgress !== "number") continue;
				if (item.struggleProgress < thr) continue;
				item.struggleProgress = Math.min(0.99, item.struggleProgress);
				try {
					if (originalSend) {
						var group = item.group || it.group || "ItemArms";
						originalSend("struggle", { group: group }, undefined, undefined, true);
						item.struggleProgress = 0;
					}
				} catch (_e) {}
			}
		} catch (_e2) {}
	}

	function ensureDebugUI(): void {
		if (!g.KD_HYBRID_DEBUG_UI) {
			if (debugEl && debugEl.parentNode) debugEl.parentNode.removeChild(debugEl);
			debugEl = null;
			return;
		}
		if (typeof document === "undefined") return;
		if (!debugEl) {
			debugEl = document.createElement("div");
			debugEl.id = "kd-hybrid-debug";
			debugEl.style.cssText = "position:fixed;right:8px;bottom:8px;z-index:99999;background:rgba(0,0,0,.82);color:#9f9;font:12px/1.35 monospace;padding:8px 10px;border-radius:8px;max-width:320px;pointer-events:none;white-space:pre;";
			document.body.appendChild(debugEl);
		}
		var mode = "?";
		try {
			if (typeof g.KDTimeGetMode === "function") mode = g.KDTimeGetMode();
		} catch (_e) {}
		debugEl.textContent = [
			"KD Hybrid " + mode,
			"idle:" + !!g.KD_TIME_IDLE_TICK_ENABLED + " ai:" + !!g.KD_REPLACE_AITYPE + " path:" + !!g.KD_REPLACE_FIND_PATH,
			"motion:" + !!g.KD_MOTION_LERP_ENABLED + " logical:" + !!g.KD_LOGICAL_MOTION,
			"rtDmg:" + !!g.KD_RT_ENEMY_DAMAGE + " struggleU:" + !!g.KD_STRUGGLE_RT_UNLOCK,
			"sendWrap:" + sendInstalled + " eng:" + isEngaged(),
			"[F8 toggle · KDHybridEnableRecommended()]"
		].join("\n");
	}

	try {
		if (typeof window !== "undefined") {
			window.addEventListener("keydown", function (ev: any) {
				if (ev.code === "F8") {
					g.KD_HYBRID_DEBUG_UI = !g.KD_HYBRID_DEBUG_UI;
					ensureDebugUI();
					saveFlags();
				}
			});
		}
	} catch (_e) {}

	function pump(): void {
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = Math.min(0.08, Math.max(0, (t - lastNow) / 1000));
		lastNow = t;
		if (g.KD_HYBRID_COMPLETE && isGameActive()) {
			try { tickLogical(dt); } catch (_e) {}
			try { tickEnemyDamage(dt); } catch (_e2) {}
			try { tickStruggleUnlock(); } catch (_e3) {}
		}
		try { ensureDebugUI(); } catch (_e4) {}
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 16);
	}
	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 16);

	setInterval(function () { try { saveFlags(); } catch (_e) {} }, 15000);

	g.KDHybridEnableRecommended = KDHybridEnableRecommended;
	g.KDHybridDisableAll = KDHybridDisableAll;
	g.KDHybridSaveFlags = saveFlags;
	g.KDHybridLoadFlags = loadFlags;
	g.KDHybridGetState = function () {
		return {
			sendInstalled: sendInstalled,
			logical: playerFrac,
			engaged: isEngaged(),
			flags: FLAG_KEYS.reduce(function (o: any, k: string) { o[k] = g[k]; return o; }, {}),
		};
	};

	try { console.log("[KDHybridComplete] residual gaps pack online."); } catch (_c) {}
})();
