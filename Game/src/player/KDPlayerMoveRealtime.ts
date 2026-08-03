"use strict";
/**
 * Phase 3 — Player Movement & Input (hybrid / explore continuous feel)
 * Branch: feature/ringgags-port
 *
 * Default: vanilla click-to-move + one-tile keys (unchanged).
 *
 * When enabled in explore mode:
 *  - Hold WASD / arrows → discrete tile steps on a timer (feels continuous)
 *  - Each step still goes through KDSendInput("move") / KinkyDungeonMove
 *  - Combat (engaged) → hold-to-step OFF; classic turn input only
 *
 * Enable:
 *   KD_PLAYER_RT_ENABLED = true;
 *   KD_PLAYER_RT_STEP_MS = 120;  // ms between held steps
 *   KD_TIME_IDLE_TICK_ENABLED = true; // optional: world ticks while you hold-move
 */
(function KDPlayerMoveRealtimeBoot() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});

	if (typeof g.KD_PLAYER_RT_ENABLED === "undefined") g.KD_PLAYER_RT_ENABLED = false;
	/** ms between auto-steps while a direction is held */
	if (typeof g.KD_PLAYER_RT_STEP_MS === "undefined") g.KD_PLAYER_RT_STEP_MS = 120;
	/** allow diagonal from combined keys */
	if (typeof g.KD_PLAYER_RT_DIAGONAL === "undefined") g.KD_PLAYER_RT_DIAGONAL = true;
	/** if true, holding move also nudges Phase 1 idle (world acts while you walk) */
	if (typeof g.KD_PLAYER_RT_DRIVE_WORLD === "undefined") g.KD_PLAYER_RT_DRIVE_WORLD = true;

	var keysDown: Record<string, boolean> = {};
	var stepAcc = 0;
	var lastNow = 0;
	var lastStepResult = "";

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

	function canHoldMove(): boolean {
		if (!g.KD_PLAYER_RT_ENABLED) return false;
		if (!isGameActive()) return false;
		if (isEngaged()) return false;
		try {
			if (typeof KinkyDungeonTargetingSpell !== "undefined" && KinkyDungeonTargetingSpell) return false;
		} catch (_e) {}
		try {
			if (typeof KDModalArea !== "undefined" && KDModalArea) return false;
		} catch (_e2) {}
		// Typing in inputs
		try {
			var ae = typeof document !== "undefined" ? document.activeElement : null;
			if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || (ae as any).isContentEditable)) return false;
		} catch (_e3) {}
		return true;
	}

	function readDir(): { x: number; y: number } | null {
		var dx = 0, dy = 0;
		if (keysDown["KeyW"] || keysDown["ArrowUp"] || keysDown["Numpad8"]) dy -= 1;
		if (keysDown["KeyS"] || keysDown["ArrowDown"] || keysDown["Numpad2"]) dy += 1;
		if (keysDown["KeyA"] || keysDown["ArrowLeft"] || keysDown["Numpad4"]) dx -= 1;
		if (keysDown["KeyD"] || keysDown["ArrowRight"] || keysDown["Numpad6"]) dx += 1;
		// numpad diagonals
		if (keysDown["Numpad7"]) { dx -= 1; dy -= 1; }
		if (keysDown["Numpad9"]) { dx += 1; dy -= 1; }
		if (keysDown["Numpad1"]) { dx -= 1; dy += 1; }
		if (keysDown["Numpad3"]) { dx += 1; dy += 1; }

		if (!g.KD_PLAYER_RT_DIAGONAL) {
			if (Math.abs(dx) + Math.abs(dy) > 1) {
				// prefer horizontal if both
				if (dx !== 0) dy = 0;
			}
		} else {
			dx = Math.max(-1, Math.min(1, dx));
			dy = Math.max(-1, Math.min(1, dy));
		}
		if (dx === 0 && dy === 0) return null;
		return { x: dx, y: dy };
	}

	function tryStep(dir: { x: number; y: number }): string {
		var sprint = false;
		try {
			if (keysDown["ShiftLeft"] || keysDown["ShiftRight"]) sprint = true;
		} catch (_e) {}

		// Prefer official input pipeline
		try {
			if (typeof KDSendInput === "function") {
				var res = KDSendInput("move", {
					dir: { x: dir.x, y: dir.y },
					delta: 1,
					AllowInteract: true,
					SuppressSprint: false,
					sprint: sprint,
					AutoPass: false,
				}, undefined, undefined, true);
				lastStepResult = String(res || "");
				return lastStepResult;
			}
		} catch (_e) {}

		try {
			if (typeof KinkyDungeonMove === "function") {
				var ok = KinkyDungeonMove({ x: dir.x, y: dir.y }, 1, true, false, sprint);
				lastStepResult = ok ? "move" : "nomove";
				return lastStepResult;
			}
		} catch (_e2) {}

		lastStepResult = "fail";
		return lastStepResult;
	}

	function onKeyDown(ev: KeyboardEvent): void {
		if (!ev || !ev.code) return;
		keysDown[ev.code] = true;
		// First press: step immediately when RT move on
		if (!canHoldMove()) return;
		var dir = readDir();
		if (!dir) return;
		// Avoid fighting game's own single-press handlers too hard: only auto-repeat path uses timer;
		// initial step still ok for fluid feel
		stepAcc = 0;
		tryStep(dir);
	}

	function onKeyUp(ev: KeyboardEvent): void {
		if (!ev || !ev.code) return;
		delete keysDown[ev.code];
		if (!readDir()) stepAcc = 0;
	}

	function onBlur(): void {
		keysDown = {};
		stepAcc = 0;
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

		if (canHoldMove()) {
			var dir = readDir();
			if (dir) {
				var interval = Number(g.KD_PLAYER_RT_STEP_MS) || 120;
				if (interval < 40) interval = 40;
				stepAcc += dt * 1000;
				while (stepAcc >= interval) {
					stepAcc -= interval;
					var r = tryStep(dir);
					if (r === "nomove" || r === "fail") {
						stepAcc = 0;
						break;
					}
					if (isEngaged()) {
						stepAcc = 0;
						break;
					}
				}
			} else {
				stepAcc = 0;
			}
		} else {
			stepAcc = 0;
		}

		if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
		else setTimeout(pump, 50);
	}

	function KDPlayerMoveRTGetState(): any {
		return {
			enabled: !!g.KD_PLAYER_RT_ENABLED,
			canHold: canHoldMove(),
			engaged: isEngaged(),
			stepMs: g.KD_PLAYER_RT_STEP_MS,
			dir: readDir(),
			lastStepResult: lastStepResult,
			keys: Object.keys(keysDown),
		};
	}

	// Listeners
	try {
		if (typeof window !== "undefined") {
			window.addEventListener("keydown", onKeyDown, true);
			window.addEventListener("keyup", onKeyUp, true);
			window.addEventListener("blur", onBlur, true);
		}
	} catch (_e) {}

	if (typeof requestAnimationFrame === "function") requestAnimationFrame(pump);
	else setTimeout(pump, 50);

	g.KDPlayerMoveRTGetState = KDPlayerMoveRTGetState;
	g.KDPlayerMoveRTKeys = keysDown;

	try {
		if (typeof console !== "undefined" && console.log)
			console.log("[KDPlayerMoveRT] Phase 3 player hold-to-step online (default OFF). Set KD_PLAYER_RT_ENABLED=true to hold WASD/arrows in explore.");
	} catch (_c) {}
})();
