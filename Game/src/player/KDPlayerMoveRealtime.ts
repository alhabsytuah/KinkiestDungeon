"use strict";
/** Phase 3 — Player hold-to-step (TS-safe) */
(function KDPlayerMoveRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_PLAYER_RT_ENABLED === "undefined") g.KD_PLAYER_RT_ENABLED = false;
	if (typeof g.KD_PLAYER_RT_STEP_MS === "undefined") g.KD_PLAYER_RT_STEP_MS = 120;
	if (typeof g.KD_PLAYER_RT_DIAGONAL === "undefined") g.KD_PLAYER_RT_DIAGONAL = true;
	if (typeof g.KD_PLAYER_RT_DRIVE_WORLD === "undefined") g.KD_PLAYER_RT_DRIVE_WORLD = true;

	var keysDown: any = {};
	var stepAcc = 0;
	var lastNow = 0;
	var lastStepResult = "";

	function nowMs(): number {
		if (typeof performance !== "undefined" && performance.now) return performance.now();
		return Date.now();
	}

	function isGameActive(): boolean {
		try {
			if (typeof g.KinkyDungeonState !== "undefined" && g.KinkyDungeonState !== "Game") return false;
			if (g.KinkyDungeonDrawState && g.KinkyDungeonDrawState !== "Game") return false;
		} catch (_e) {}
		return true;
	}

	function isEngaged(): boolean {
		try {
			if (typeof g.KDTimeIsEngaged === "function") return !!g.KDTimeIsEngaged();
		} catch (_e) {}
		return false;
	}

	function canHoldMove(): boolean {
		if (!g.KD_PLAYER_RT_ENABLED || !isGameActive() || isEngaged()) return false;
		try { if (g.KinkyDungeonTargetingSpell) return false; } catch (_e) {}
		try { if (g.KDModalArea) return false; } catch (_e2) {}
		try {
			var ae: any = typeof document !== "undefined" ? document.activeElement : null;
			if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable)) return false;
		} catch (_e3) {}
		return true;
	}

	function readDir(): any {
		var dx = 0, dy = 0;
		if (keysDown["KeyW"] || keysDown["ArrowUp"] || keysDown["Numpad8"]) dy -= 1;
		if (keysDown["KeyS"] || keysDown["ArrowDown"] || keysDown["Numpad2"]) dy += 1;
		if (keysDown["KeyA"] || keysDown["ArrowLeft"] || keysDown["Numpad4"]) dx -= 1;
		if (keysDown["KeyD"] || keysDown["ArrowRight"] || keysDown["Numpad6"]) dx += 1;
		if (keysDown["Numpad7"]) { dx -= 1; dy -= 1; }
		if (keysDown["Numpad9"]) { dx += 1; dy -= 1; }
		if (keysDown["Numpad1"]) { dx -= 1; dy += 1; }
		if (keysDown["Numpad3"]) { dx += 1; dy += 1; }
		if (!g.KD_PLAYER_RT_DIAGONAL) {
			if (Math.abs(dx) + Math.abs(dy) > 1) { if (dx !== 0) dy = 0; }
		} else {
			dx = Math.max(-1, Math.min(1, dx));
			dy = Math.max(-1, Math.min(1, dy));
		}
		if (dx === 0 && dy === 0) return null;
		return { x: dx, y: dy };
	}

	function tryStep(dir: any): string {
		var sprint = !!(keysDown["ShiftLeft"] || keysDown["ShiftRight"]);
		try {
			if (typeof g.KDSendInput === "function") {
				var res = g.KDSendInput("move", {
					dir: { x: dir.x, y: dir.y }, delta: 1, AllowInteract: true,
					SuppressSprint: false, sprint: sprint, AutoPass: false,
				}, undefined, undefined, true);
				lastStepResult = String(res || "");
				return lastStepResult;
			}
		} catch (_e) {}
		try {
			if (typeof g.KinkyDungeonMove === "function") {
				var ok = g.KinkyDungeonMove({ x: dir.x, y: dir.y }, 1, true, false, sprint);
				lastStepResult = ok ? "move" : "nomove";
				return lastStepResult;
			}
		} catch (_e2) {}
		lastStepResult = "fail";
		return lastStepResult;
	}

	function onKeyDown(ev: any): void {
		if (!ev || !ev.code) return;
		keysDown[ev.code] = true;
		if (!canHoldMove()) return;
		var dir = readDir();
		if (!dir) return;
		stepAcc = 0;
		tryStep(dir);
	}

	function onKeyUp(ev: any): void {
		if (!ev || !ev.code) return;
		delete keysDown[ev.code];
		if (!readDir()) stepAcc = 0;
	}

	function onBlur(): void { keysDown = {}; stepAcc = 0; }

	function pump(): void {
		var t = nowMs();
		if (!lastNow) lastNow = t;
		var dt = Math.min(0.25, Math.max(0, (t - lastNow) / 1000));
		lastNow = t;
		if (canHoldMove()) {
			var dir = readDir();
			if (dir) {
				var interval = Number(g.KD_PLAYER_RT_STEP_MS) || 120;
				if (interval < 40) interval = 40;
				stepAcc += dt * 1000;
				while (stepAcc >= interval) {
					stepAcc -= interval;
					var r = tryStep(dir);
					if (r === "nomove" || r === "fail" || isEngaged()) { stepAcc = 0; break; }
				}
			} else stepAcc = 0;
		} else stepAcc = 0;
		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}

	try {
		if (typeof window !== "undefined") {
			window.addEventListener("keydown", onKeyDown, true);
			window.addEventListener("keyup", onKeyUp, true);
			window.addEventListener("blur", onBlur, true);
		}
	} catch (_e) {}

	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDPlayerMoveRTGetState = function () {
		return {
			enabled: !!g.KD_PLAYER_RT_ENABLED, canHold: canHoldMove(), engaged: isEngaged(),
			stepMs: g.KD_PLAYER_RT_STEP_MS, dir: readDir(), lastStepResult: lastStepResult, keys: Object.keys(keysDown),
		};
	};
	g.KDPlayerMoveRTKeys = keysDown;

	try { console.log("[KDPlayerMoveRT] Phase 3 online (default OFF)."); } catch (_c) {}
})();
