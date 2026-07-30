/**
 * RingGags systems — base-game port (Sax)
 * Global script for tsc outFile (no export/import).
 * Loaded after KinkyDungeonRestraintsList via tsconfig files[].
 *
 * State lives in RG_State (module-level), NOT on KDGameData.
 *
 * Drool visual (SFX sprite) — sequential by design:
 *   Stage 1 → DroolS1, Stage 2 → DroolS2, Stage 3 → DroolS3, Stage 4 → DroolS4.
 *   Builds from light drool to full chin coverage; sustains at max (S4) when cycling.
 * Strand particles also scale with logical stage.
 */

"use strict";

var RG_COOLDOWNS = {
	"1": [35, 50], "2": [35, 50], "3": [35, 50], "4": [35, 50], cycle: [35, 50]
};
var RG_DURATIONS = {
	"1": [10, 20], "2": [10, 20], "3": [10, 20], "4": [10, 20], cycle: [10, 20]
};
var RG_CYCLE = [2, 3, 4];
var RG_BREATH_TIRED = 0.5;
var RG_BREATH_HUFFING = 0.25;
var RG_BREATH_AROUSED = 0.4;

var RG_BallGagLink = ["Stuffing", "PlugGags", "FlatGags", "MuzzleGags", "Tape", "Wrapping", "Encase"];
var RingGagEvents = [
	{ trigger: "tick", type: "ringGagEffects", inheritLinked: true },
	{ trigger: "postRemoval", type: "ringGagCleanup", inheritLinked: true },
];

if (typeof KDEffectTiles !== "undefined") {
	KDEffectTiles["DroolPuddle"] = {
		name: "DroolPuddle",
		duration: 5,
		priority: 2,
		tags: ["wet", "slippery", "drool"],
	};
}

if (typeof KDEffectTileMoveOnFunctions !== "undefined") {
	KDEffectTileMoveOnFunctions["DroolPuddle"] = function (entity: any, tile: any, willing: any, dir: any, sprint: any) {
		if (entity && entity.player && willing && dir && (dir.x || dir.y)
			&& typeof KinkyDungeonFlags !== "undefined" && !KinkyDungeonFlags.get("slipped")) {
			if (typeof KDSlip === "function") KDSlip(dir);
			if (typeof KDKneelTurns === "function") KDKneelTurns(3);
			if (typeof KinkyDungeonSetFlag === "function") KinkyDungeonSetFlag("slipped", 1);
		}
		return { cancelmove: false, returnvalue: false };
	};
}

var RG_State = {
	DroolCooldown: 0,
	DroolDuration: 0,
	DroolStage: 0,
	DroolEpisode: 0,
	BoundWipeFailCount: 0,
	Cycling: false,
	CycleIndex: 0,
	CurrentOverlay: 0,
	BreathActive: false,
	WasStuffed: false,
	DryingCooldown: 0,
	PrevX: -1,
	PrevY: -1,
	PreferredDroolSFX: 1,
	DripCooldown: 0,
	_inited: false,
};

function RG_RandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function RG_ShouldShowBreath(stamina, staminaMax, distraction, distractionMax) {
	var staminaRatio = staminaMax > 0 ? stamina / staminaMax : 1;
	var tired = staminaRatio < RG_BREATH_TIRED;
	var huffing = staminaRatio < RG_BREATH_HUFFING;
	var aroused = distractionMax > 0 && distraction / distractionMax >= RG_BREATH_AROUSED;
	return tired || huffing || aroused;
}

function RG_PlayModSound(relPath, volMult) {
	try {
		if (typeof KDSoundEnabled === "function" && !KDSoundEnabled()) return;
		var root = (typeof KinkyDungeonRootDirectory !== "undefined" && KinkyDungeonRootDirectory)
			? KinkyDungeonRootDirectory : "";
		var path = root + relPath;
		var audio = new Audio(path);
		var base = (typeof KDSfxVolume !== "undefined") ? KDSfxVolume : 1;
		audio.volume = Math.min(base * (volMult != null ? volMult : 1), 1);
		var p = audio.play();
		if (p && typeof p.catch === "function") p.catch(function () {});
	} catch (_e) {}
}
function RG_PlayDrip() {
	var n = RG_RandInt(1, 13);
	if (n === 7) n = 8;
	RG_PlayModSound("Audio/drip" + n + ".ogg", 1.2);
}
function RG_PlayGulp() {
	RG_PlayModSound("Audio/gulp" + RG_RandInt(1, 8) + ".ogg", 1.5);
}
function RG_PlayUnplug() {
	RG_PlayModSound("Audio/unplug.ogg", 1.2);
}

function RG_InitState() {
	if (RG_State._inited) return;
	RG_State._inited = true;
	RG_State.DroolCooldown = RG_RandInt(RG_COOLDOWNS["1"][0], RG_COOLDOWNS["1"][1]);
	RG_State.DroolDuration = 0;
	RG_State.DroolStage = 0;
	RG_State.DroolEpisode = 0;
	RG_State.BoundWipeFailCount = 0;
	RG_State.Cycling = false;
	RG_State.CycleIndex = 0;
	RG_State.CurrentOverlay = 0;
	RG_State.BreathActive = false;
	RG_State.WasStuffed = false;
	RG_State.DryingCooldown = 0;
	RG_State.PrevX = -1;
	RG_State.PrevY = -1;
	RG_State.PreferredDroolSFX = 1;
	RG_State.DripCooldown = 0;
}
function RG_ClearState() {
	RG_State.DroolStage = 0;
	RG_State.DroolDuration = 0;
	RG_State.Cycling = false;
	RG_State.CycleIndex = 0;
	RG_State.DryingCooldown = 0;
	RG_State.BoundWipeFailCount = 0;
	RG_State.CurrentOverlay = 0;
	RG_State.BreathActive = false;
	RG_State.DripCooldown = 0;
	RG_State.PreferredDroolSFX = 1;
	RG_State.DroolCooldown = RG_RandInt(RG_COOLDOWNS["1"][0], RG_COOLDOWNS["1"][1]);
	RG_StrandsStage = 0;
	RG_Strands = [];
}

function RG_HasOpenGag() {
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		var r = KDRestraint(rest.item);
		if (r && r.shrine && r.shrine.indexOf("OpenGag") >= 0) return true;
	}
	return false;
}
function RG_HasOnlyOpenGags() {
	var hasAny = false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		var r = KDRestraint(rest.item);
		if (r && r.gag) {
			hasAny = true;
			if (!r.shrine || r.shrine.indexOf("OpenGag") === -1) return false;
		}
	}
	return hasAny;
}
function RG_IsStuffed() {
	var hasRing = false, hasOther = false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		var r = KDRestraint(rest.item);
		if (!r || !r.gag) continue;
		if (r.shrine && r.shrine.indexOf("OpenGag") >= 0) hasRing = true;
		else hasOther = true;
	}
	return hasRing && hasOther;
}
function RG_GetDroolLockItem() {
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		var item = rest.item;
		if (item && (item.curse === "DroolLock" || item.curse === "droolLock")) return item;
	}
	return null;
}

function RG_SilentAddRestraint(name) {
	var g: any = (typeof globalThis !== "undefined") ? globalThis : (typeof window !== "undefined" ? window : {});
	var oF = g.KinkyDungeonSendFloater;
	var oA = g.AudioPlayInstantSoundKD;
	var oT = g.KinkyDungeonSendTextMessage;
	var oM = g.KinkyDungeonSendActionMessage;
	if (typeof oF === "function") g.KinkyDungeonSendFloater = function () {};
	if (typeof oA === "function") g.AudioPlayInstantSoundKD = function () {};
	if (typeof oT === "function") g.KinkyDungeonSendTextMessage = function () {};
	if (typeof oM === "function") g.KinkyDungeonSendActionMessage = function () {};
	var r = null;
	try {
		r = KinkyDungeonAddRestraintIfWeaker(name, 0, true, undefined, false);
	} catch (_e) {
		r = null;
	} finally {
		if (typeof oF === "function") g.KinkyDungeonSendFloater = oF;
		if (typeof oA === "function") g.AudioPlayInstantSoundKD = oA;
		if (typeof oT === "function") g.KinkyDungeonSendTextMessage = oT;
		if (typeof oM === "function") g.KinkyDungeonSendActionMessage = oM;
	}
	return r;
}

function RG_SilentRemoveRestraint(group) {
	var g: any = (typeof globalThis !== "undefined") ? globalThis : (typeof window !== "undefined" ? window : {});
	var oF = g.KinkyDungeonSendFloater;
	var oA = g.AudioPlayInstantSoundKD;
	var oT = g.KinkyDungeonSendTextMessage;
	if (typeof oF === "function") g.KinkyDungeonSendFloater = function () {};
	if (typeof oA === "function") g.AudioPlayInstantSoundKD = function () {};
	if (typeof oT === "function") g.KinkyDungeonSendTextMessage = function () {};
	try {
		KinkyDungeonRemoveRestraint(group, false, false, true);
	} catch (_e) {}
	finally {
		if (typeof oF === "function") g.KinkyDungeonSendFloater = oF;
		if (typeof oA === "function") g.AudioPlayInstantSoundKD = oA;
		if (typeof oT === "function") g.KinkyDungeonSendTextMessage = oT;
	}
}

function RG_ForceAppearanceRefresh() {
	try {
		if (typeof KDUpdateItemEventCache !== "undefined") KDUpdateItemEventCache = true;
	} catch (_e0) {}
	try {
		if (typeof KDRefreshCharacter !== "undefined" && typeof KinkyDungeonPlayer !== "undefined"
				&& KDRefreshCharacter && KDRefreshCharacter.set)
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	} catch (_e1) {}
	if (typeof setTimeout === "function") {
		setTimeout(function () {
			try {
				if (typeof KinkyDungeonDressPlayer === "function") KinkyDungeonDressPlayer();
			} catch (_e2) {}
		}, 0);
	}
}

/**
 * Apply drool overlay for logical stage.
 * Visual = sequential DroolS{stage}: S1 light → S2 → S3 → S4 heavy / sustained max.
 */
function RG_SetDroolOverlay(stage) {
	if (stage === RG_State.CurrentOverlay) return;
	if (RG_State.CurrentOverlay > 0) RG_SilentRemoveRestraint("RingGagDroolFX");
	if (stage >= 1 && stage <= 4) {
		RG_State.PreferredDroolSFX = stage;
		RG_SilentAddRestraint("RingGagDroolS" + stage + "FX");
	}
	RG_State.CurrentOverlay = stage;
	RG_ForceAppearanceRefresh();
}
function RG_SetBreathOverlay(show) {
	if (show === RG_State.BreathActive) return;
	if (!show) RG_SilentRemoveRestraint("RingGagBreathFX");
	else RG_SilentAddRestraint("RingGagBreathFX");
	RG_State.BreathActive = show;
	RG_ForceAppearanceRefresh();
}

var RG_MOUTH_HALF_WIDTH = 15;
var RG_DROOL_Y_OFFSET = 25;
var RG_DROOL_X_OFFSET = -10;
var RG_STRAND_BIAS = 0.65;
var RG_STRAND_CONFIGS = {
	1: [8000],
	2: [6000, 4500],
	3: [3000, 3500],
	4: [6000, 4500, 5000]
};
var RG_Strands = [];
var RG_StrandsStage = 0;

function RG_InitStrands(stage) {
	var cfg = RG_STRAND_CONFIGS[stage];
	if (!cfg) {
		RG_Strands = [];
		RG_StrandsStage = 0;
		return;
	}
	RG_Strands = [];
	var now = (typeof CommonTime === "function") ? CommonTime() : Date.now();
	for (var i = 0; i < cfg.length; i++) {
		RG_Strands.push({
			interval: cfg[i],
			lastTime: now - Math.floor(Math.random() * cfg[i]),
			lastXOffset: (Math.random() - 0.5) * 2 * RG_MOUTH_HALF_WIDTH
		});
	}
	RG_StrandsStage = stage;
}

function RG_NextStrandX(strand) {
	var randomX = (Math.random() - 0.5) * 2 * RG_MOUTH_HALF_WIDTH;
	var newX = strand.lastXOffset * RG_STRAND_BIAS + randomX * (1 - RG_STRAND_BIAS);
	if (newX > RG_MOUTH_HALF_WIDTH) newX = RG_MOUTH_HALF_WIDTH;
	if (newX < -RG_MOUTH_HALF_WIDTH) newX = -RG_MOUTH_HALF_WIDTH;
	strand.lastXOffset = newX;
	return newX;
}

function RG_SpawnStrandParticles(spawnX, baseY, dropDistance) {
	if (typeof KDAddParticle !== "function") return;

	var shortLife = 800 + Math.random() * 200;
	var longLife = 1800 + Math.random() * 400;
	var shortVy = (dropDistance * 0.2) / shortLife;
	var longVy = dropDistance / longLife;

	KDAddParticle(spawnX, baseY, "Models/SFX/SFX_DroolStrandShort.png", undefined, {
		time: 0,
		lifetime: shortLife,
		vx: 0,
		vy: shortVy,
		zIndex: 60,
		sin_x: 0,
		sin_y: 0,
		sin_period: 1,
		phase: 0,
		fadeEase: "invcos",
		rotation: 0,
		scale: 0.4 + Math.random() * 0.15,
	});

	(function (life) {
		if (typeof setTimeout !== "function") return;
		setTimeout(function () { RG_PlayDrip(); }, life);
	})(longLife * 0.5);

	var longSegments = 4;
	for (var seg = 0; seg < longSegments; seg++) {
		var segT = seg / (longSegments - 1);
		var expSpeed = (Math.exp(2.5 * segT) - 1) / (Math.exp(2.5) - 1);
		var segVy = longVy * (0.3 + expSpeed * 2.5);
		var segLife = longLife * (0.35 + segT * 0.65);
		var segScale = 0.35 + segT * 0.15 + Math.random() * 0.1;
		KDAddParticle(spawnX, baseY, "Models/SFX/SFX_DroolStrandLong.png", undefined, {
			time: 0,
			lifetime: segLife,
			vx: 0,
			vy: segVy,
			zIndex: 60,
			sin_x: 0,
			sin_y: 0,
			sin_period: 1,
			phase: 0,
			fadeEase: seg < longSegments - 1 ? "invcos" : undefined,
			rotation: 0,
			scale: segScale,
		});
	}
}

function RG_TickStrands() {
	var stage = RG_State.CurrentOverlay;
	if (!stage || stage < 1) {
		RG_StrandsStage = 0;
		return;
	}
	if (RG_IsStuffed() || !RG_HasOnlyOpenGags()) {
		RG_StrandsStage = 0;
		return;
	}
	if (stage !== RG_StrandsStage) {
		RG_InitStrands(stage);
	}
	if (!RG_Strands.length) return;
	if (typeof GetHardpointLoc !== "function" || typeof KinkyDungeonPlayer === "undefined") return;

	var now = (typeof CommonTime === "function") ? CommonTime() : Date.now();
	var flip = (typeof KDToggles !== "undefined" && KDToggles) ? KDToggles.FlipPlayer : false;
	var pos = GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "Mouth", flip);
	if (!pos) return;
	var baseX = pos.x + RG_DROOL_X_OFFSET;
	var baseY = pos.y + RG_DROOL_Y_OFFSET;
	var feetPos = GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "Front", flip);
	var dropDistance = feetPos ? (feetPos.y - pos.y) * 2.0 : 300;
	if (dropDistance < 300) dropDistance = 300;

	for (var i = 0; i < RG_Strands.length; i++) {
		var strand = RG_Strands[i];
		if (now < strand.lastTime + strand.interval) continue;
		strand.lastTime = now;
		var xOffset = RG_NextStrandX(strand);
		var xJitter = (Math.random() - 0.5) * 3;
		var spawnX = baseX + xOffset + xJitter;
		RG_SpawnStrandParticles(spawnX, baseY, dropDistance);
	}
}

(function RG_HookStrandRender() {
	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
	var current = g.KDDrawArousalScreenFilter;
	if (typeof current !== "function") {
		if (typeof setTimeout === "function") setTimeout(RG_HookStrandRender, 500);
		return;
	}
	if (current._rgStrandsHooked) return;
	var orig = current;
	var hooked: any = function () {
		orig.apply(this, arguments);
		try { RG_TickStrands(); } catch (_e) {}
	};
	hooked._rgStrandsHooked = true;
	g.KDDrawArousalScreenFilter = hooked;
})();

function RG_TickHandler(_e, _item, data) {
	RG_InitState();
	var armsBound = typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound();
	var episodeActive = RG_State.DroolDuration > 0;
	var stuffed = RG_IsStuffed() || !RG_HasOnlyOpenGags();
	var droolEnabled = RG_HasOpenGag() && RG_HasOnlyOpenGags();
	var hasDroolLock = RG_GetDroolLockItem() !== null;
	var maxStage = hasDroolLock ? 4 : 2;

	var prevStuffed = RG_State.WasStuffed;
	RG_State.WasStuffed = stuffed;
	if (stuffed && !prevStuffed) {
		RG_State.DroolDuration = 0;
		RG_State.DryingCooldown = RG_RandInt(RG_COOLDOWNS["1"][0], RG_COOLDOWNS["1"][1]);
	}

	var movedThisTick = false, prevTileX = RG_State.PrevX, prevTileY = RG_State.PrevY, movementBonus = 0;
	if (typeof KinkyDungeonPlayerEntity !== "undefined") {
		var px = KinkyDungeonPlayerEntity.x, py = KinkyDungeonPlayerEntity.y;
		if (RG_State.PrevX >= 0 && (px !== RG_State.PrevX || py !== RG_State.PrevY)) {
			movedThisTick = true; movementBonus = 1;
			prevTileX = RG_State.PrevX; prevTileY = RG_State.PrevY;
		}
		RG_State.PrevX = px; RG_State.PrevY = py;
	}

	var breathActive = false;
	if (droolEnabled) {
		var stamina = (typeof KinkyDungeonStatStamina !== "undefined") ? KinkyDungeonStatStamina : 100;
		var staminaMax = (typeof KinkyDungeonStatStaminaMax !== "undefined") ? KinkyDungeonStatStaminaMax : 100;
		var distraction = (typeof KinkyDungeonStatDistraction !== "undefined") ? KinkyDungeonStatDistraction : 0;
		var distractionMax = (typeof KinkyDungeonStatDistractionMax !== "undefined") ? KinkyDungeonStatDistractionMax : 100;
		breathActive = RG_ShouldShowBreath(stamina, staminaMax, distraction, distractionMax);
	}
	RG_SetBreathOverlay(breathActive);

	if (!droolEnabled) {
		if (RG_State.DroolStage > 0 || RG_State.CurrentOverlay > 0 || RG_State.BreathActive) {
			RG_SilentRemoveRestraint("RingGagDroolFX");
			RG_SilentRemoveRestraint("RingGagBreathFX");
			RG_SetDroolOverlay(0);
			RG_ClearState();
		}
		return;
	}

	if (!hasDroolLock && (RG_State.Cycling || RG_State.DroolStage > 2)) {
		var clamped = Math.min(RG_State.DroolStage, 2);
		RG_State.DroolStage = clamped;
		RG_State.Cycling = false;
		RG_State.CycleIndex = 0;
		RG_State.BoundWipeFailCount = 0;
		RG_SetDroolOverlay(clamped);
	}

	if (RG_State.DroolStage > 0 && !stuffed && movedThisTick && prevTileX >= 0) {
		var puddleChance = 0;
		if (hasDroolLock) puddleChance = 0.6;
		else if (RG_State.DroolStage === 2 && armsBound) puddleChance = 0.1;
		if (puddleChance > 0 && Math.random() < puddleChance) {
			try {
				if (typeof KDCreateEffectTile === "function")
					KDCreateEffectTile(prevTileX, prevTileY, { name: "DroolPuddle", duration: 5 }, 0);
			} catch (_ex) {}
		}
	}

	if (stuffed) {
		var dryFloor = hasDroolLock ? 2 : 0;
		if (RG_State.DroolStage > dryFloor) {
			RG_State.DryingCooldown -= 1;
			if (RG_State.DryingCooldown <= 0) {
				var prevStage = RG_State.DroolStage - 1;
				RG_State.DroolStage = prevStage;
				RG_SetDroolOverlay(prevStage);
				if (prevStage > dryFloor) {
					var dcd = RG_COOLDOWNS[String(prevStage + 1)] || RG_COOLDOWNS["1"];
					RG_State.DryingCooldown = RG_RandInt(dcd[0], dcd[1]);
				} else {
					RG_State.BoundWipeFailCount = 0;
					RG_State.Cycling = false;
					RG_State.CycleIndex = 0;
					RG_State.DroolCooldown = RG_RandInt(RG_COOLDOWNS["1"][0], RG_COOLDOWNS["1"][1]);
				}
			}
		}
		return;
	}

	if (!episodeActive) {
		RG_State.DroolCooldown -= 1 + movementBonus;
		if (RG_State.DroolCooldown <= 0) {
			var nextStage, isCycling = !!RG_State.Cycling;
			if (isCycling) {
				nextStage = RG_CYCLE[RG_State.CycleIndex % RG_CYCLE.length];
				RG_State.CycleIndex += 1;
				RG_State.DroolDuration = RG_RandInt(RG_DURATIONS.cycle[0], RG_DURATIONS.cycle[1]);
			} else {
				nextStage = RG_State.DroolStage + 1;
				if (nextStage > maxStage) nextStage = maxStage;
				if (hasDroolLock && nextStage < 2) nextStage = 2;
				var du = RG_DURATIONS[String(nextStage)] || RG_DURATIONS["1"];
				RG_State.DroolDuration = RG_RandInt(du[0], du[1]);
			}
			RG_State.DroolStage = nextStage;
			RG_State.DroolEpisode += 1;
			RG_SetDroolOverlay(nextStage);
			if (isCycling && nextStage === 2) RG_PlayGulp();
		}
	} else {
		RG_State.DroolDuration -= 1;
		if (RG_State.DroolDuration <= 0) {
			RG_State.DroolEpisode += 1;
			if (armsBound) RG_State.BoundWipeFailCount += 1;
			if (hasDroolLock && RG_State.DroolStage >= 4 && !RG_State.Cycling) {
				RG_State.Cycling = true;
				RG_State.CycleIndex = 0;
			}
			var cd;
			if (RG_State.Cycling) cd = RG_COOLDOWNS.cycle;
			else {
				var next = Math.min(RG_State.DroolStage + 1, maxStage);
				cd = RG_COOLDOWNS[String(next)] || RG_COOLDOWNS[String(maxStage)];
			}
			RG_State.DroolCooldown = RG_RandInt(cd[0], cd[1]);
		}
	}
}

function RG_CleanupHandler(_e, item, data) {
	if (data && data.item !== item) return;
	var ringName = item && item.name;
	var stillEquipped = false, stillOpenGagged = false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		if (rest.item && rest.item.name === ringName) stillEquipped = true;
		var r = KDRestraint(rest.item);
		if (r && r.shrine && r.shrine.indexOf("OpenGag") >= 0) stillOpenGagged = true;
	}
	if (!stillEquipped && !stillOpenGagged) {
		RG_SilentRemoveRestraint("RingGagDroolFX");
		RG_SilentRemoveRestraint("RingGagBreathFX");
		RG_ClearState();
	}
}

function RG_RegisterEvents() {
	if (typeof KDEventMapInventory === "undefined") return;
	KDEventMapInventory["tick"] = KDEventMapInventory["tick"] || {};
	KDEventMapInventory["tick"]["ringGagEffects"] = RG_TickHandler;
	KDEventMapInventory["postRemoval"] = KDEventMapInventory["postRemoval"] || {};
	KDEventMapInventory["postRemoval"]["ringGagCleanup"] = RG_CleanupHandler;
}

var RG_RESTRAINT_TEXT = [
	{ name: "RingGag", display: "Ring Gag", flavor: "A firm metal ring wedged behind your teeth forces your mouth wide open.", func: "A standard ring gag. Barely muffles speech since the mouth is held open." },
	{ name: "HarnessRingGag", display: "Harness Ring Gag", flavor: "A metal ring held in place by a web of leather straps buckled tightly around your head.", func: "The harness is comprehensive and it's locked in place." },
	{ name: "LargeRingGag", display: "Large Ring Gag", flavor: "A wider metal ring forced into your mouth. The stretch is significant.", func: "A larger ring gag. Your jaw is held wider than is comfortable." },
	{ name: "HugeRingGag", display: "Huge Ring Gag", flavor: "An enormous metal ring stretches your jaw painfully wide.", func: "The largest ring gag variant. Your jaw aches from how wide it forces you open." },
	{ name: "LatexRingGag", display: "Latex Ring Gag", flavor: "A soft rubber O-ring forced into your mouth. It stretches but doesn't yield.", func: "A flexible latex ring gag. The rubber holds your jaw open without the bite of metal." },
	{ name: "DragonscaleRingGag", display: "Dragonscale Ring Gag", flavor: "A metal ring secured with dragonscale straps that resist any blade.", func: "It's made from hard-to-cut dragonscale!!!" },
	{ name: "HighsecSpiderGag", display: "High-Security Spider Gag", flavor: "A radial metal frame locked into your mouth, fanned out by a reinforced harness.", func: "The cable-reinforced straps and metal spider frame make this near-impossible to remove." },
	{ name: "MagicSpiderGag", display: "Magic Spider Gag", flavor: "An enchanted ring formed into a spider-like frame.", func: "It's brimming with conjured energy. A normal knife won't work here!" },
	{ name: "GoodGirlGag", display: "Good Girl Gag", flavor: "A nurse-issue ring gag built into a soft leather muzzle. The plug pulls out for dosing.", func: "Open wide — good girl. Now let's plug that back up, shall we?" },
	{ name: "CriersRing", display: "Crier's Ring", flavor: "A cruel ring gag that forces your mouth open and invites misfortune.", func: "Something about this ring feels cursed…" },
	{ name: "TongueTrap", display: "Tongue Trap", flavor: "A firm metal ring with a rubber-coated saddle that clamps down over your tongue.", func: "Drinking potions becomes a gamble — your numbed tongue can't tell a healing brew from poison." },
	{ name: "IncantorsMouthpiece", display: "Incantor's Mouthpiece", flavor: "An ancient metal ring etched with spellwork that glows faintly gold when enemies draw near.", func: "Up close, the word is the weapon." },
];

function RG_CoreRestraints() {
	var link = RG_BallGagLink.slice();
	return [
		{ inventory: true, name: "RingGag", Asset: "RingGags", preview: "RingGags", Model: "RingGag", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], gag: 0.1, power: 4, weight: 3, strictness: 0.1, maxwill: 0.6, escapeChance: { Struggle: 0.15, Cut: 0.2, Remove: 0.8, Pick: 0.2 }, limitChance: { Struggle: 0.15 }, enemyTags: { leatherRestraints: 10, ballGagRestraints: 4 }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, trappable: true, name: "HarnessRingGag", debris: "Belts", Asset: "RingGags", preview: "RingGags", Model: "RingGagHarness", sfxGroup: "Leather", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], gag: 0.1, power: 5, weight: 2, strictness: 0.15, maxwill: 0.7, escapeChance: { Struggle: 0.05, Cut: 0.15, Remove: 0.5, Pick: 0.2 }, limitChance: { Struggle: 0.15 }, enemyTags: { leatherRestraints: 8, ballGagRestraints: 5 }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, name: "LargeRingGag", Asset: "RingGags", preview: "RingGags", Model: "LargeRingGag", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], gag: 0.1, power: 4, weight: 2, maxwill: 0.9, escapeChance: { Struggle: 0.0, Cut: 0.45, Remove: 0.65, Pick: 0.3 }, limitChance: { Struggle: 0.15 }, enemyTags: { ballGagRestraints: 4 }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, name: "HugeRingGag", Asset: "RingGags", preview: "RingGags", Model: "LargeRingGag", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], DefaultLock: "Red_Hi", gag: 0.1, power: 5, weight: 2, maxwill: 0.9, escapeChance: { Struggle: 0.0, Cut: 0.45, Remove: 0.65, Pick: 0.3 }, limitChance: { Struggle: 0.15 }, enemyTags: { ballGagRestraints: 3 }, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["Leather", "Gags", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, name: "LatexRingGag", Asset: "RingGags", preview: "RingGags", Model: "LatexRingGag", Group: "ItemMouth", Type: "Tight", Color: ["#4EA1FF", "Default"], sfxGroup: "Rubber", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], gag: 0.1, power: 7, weight: 0, escapeChance: { Struggle: -0.05, Cut: 0.04, Remove: 0.4, Pick: 0.25 }, limitChance: { Struggle: 0.15 }, enemyTags: { latexRestraints: 5, latexGag: 8 }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Latex", "Gags", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, name: "DragonscaleRingGag", debris: "Belts", Asset: "RingGags", preview: "RingGags", Model: "RingGagHarnessSecure", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], gag: 0.1, power: 6, weight: 1, maxwill: 0.75, escapeChance: { Struggle: -0.1, Cut: -0.5, Remove: 0.35, Pick: 0.2 }, limitChance: { Struggle: 0.15 }, enemyTags: { dragonRestraints: 6, ballGagRestraints: 2 }, playerTags: {}, minLevel: 3, allFloors: true, shrine: ["Leather", "Gags", "OpenGag", "Dragon"], events: RingGagEvents.slice() },
		{ inventory: true, name: "HighsecSpiderGag", debris: "Belts", Asset: "RingGags", preview: "RingGags", Model: "SpiderGagHarnessSecure", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], quickBindCondition: "BallGag", quickBindMult: 0.5, gag: 0.1, power: 8, weight: 1, maxwill: 0.85, escapeChance: { Struggle: -0.2, Cut: 0.05, Remove: 0.2, Pick: 0.1 }, limitChance: { Struggle: 0.2 }, enemyTags: { highsec: 8, ballGagRestraints: 2 }, playerTags: {}, minLevel: 5, allFloors: true, shrine: ["Leather", "Gags", "OpenGag", "Metal"], events: RingGagEvents.slice() },
		{ inventory: true, name: "MagicSpiderGag", Asset: "RingGags", preview: "RingGags", debris: "Belts", Model: "SpiderGag", sfxGroup: "Leather", Group: "ItemMouth", Type: "Tight", Color: ["Default", "#ff00ff"], LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], quickBindCondition: "BallGag", quickBindMult: 0.5, DefaultLock: "Purple", magic: true, gag: 0.1, power: 5.5, weight: 2, escapeChance: { Struggle: -0.1, Cut: 0.12, Remove: 0.45, Pick: 0.25 }, limitChance: { Struggle: 0.15 }, enemyTags: { ballGagRestraintsMagic: 4, gagSpellStrong: 10, forceAntiMagic: -100 }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags", "Conjure", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, name: "GoodGirlGag", Asset: "RingGags", preview: "RingGags", Model: "GoodGirlGagModel", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], debris: "Belts", sfxGroup: "Leather", LinkableBy: ["FlatGags", "MuzzleGags", "Tape", "Wrapping", "Encase"], renderWhenLinked: ["FlatGags", "MuzzleGags", "Tape", "Wrapping", "Encase"], factionColor: [[], [0]], DefaultLock: "Red", gag: 0.4, power: 8, weight: 2, maxwill: 0.9, limitChance: { Struggle: 0.1, Cut: 0, Unlock: 0.75 }, escapeChance: { Struggle: -0.175, Cut: 0.15, Remove: 0.15, Pick: 0.15 }, enemyTags: { nurseRestraints: 12, dressRestraints: 3, forceAntiMagic: -100 }, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags", "PlugGags"], events: RingGagEvents.slice() },
		{ inventory: true, name: "CriersRing", Asset: "RingGags", preview: "RingGags", Model: "RingGag", Group: "ItemMouth", Type: "Tight", Color: ["#5a1a1a", "#5a1a1a"], debris: "Belts", sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, gag: 0.1, power: 10, weight: 0, strictness: 0.15, maxwill: 0.45, escapeChance: { Struggle: -0.1, Cut: 0.1, Remove: 0.25, Pick: 0.15 }, limitChance: { Struggle: 0.15 }, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Leather", "Gags", "OpenGag", "Cursed"], events: RingGagEvents.slice() },
		{ inventory: true, name: "TongueTrap", Asset: "RingGags", preview: "RingGags", Model: "TongueTrapModel", Group: "ItemMouth", Type: "Tight", Color: ["Default", "Default"], sfxGroup: "Rubber", LinkableBy: link, renderWhenLinked: link, gag: 0.1, power: 10, weight: 1, strictness: 0.15, maxwill: 0.5, escapeChance: { Struggle: -0.1, Cut: 0.1, Remove: 0.3, Pick: 0.2 }, limitChance: { Struggle: 0.15 }, DefaultLock: "Blue", enemyTags: { trapRestraints: 6, latexRestraints: 2 }, playerTags: {}, minLevel: 2, allFloors: true, shrine: ["Latex", "Gags", "OpenGag"], events: RingGagEvents.slice() },
		{ inventory: true, name: "IncantorsMouthpiece", Asset: "RingGags", preview: "RingGags", Model: "IncantorsMouthpieceModel", Group: "ItemMouth", Type: "Tight", Color: ["#e8c96a", "#b08a2a"], sfxGroup: "Leather", LinkableBy: link, renderWhenLinked: link, factionColor: [[], [0]], DefaultLock: "Divine2", gag: 0.1, power: 30, weight: 0, strictness: 0.3, maxwill: 0.9, escapeChance: { Struggle: -99, Cut: -99, Remove: 1, Pick: -100 }, limitChance: { Struggle: 0.5 }, enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: ["Metal", "Gags", "OpenGag", "Divine"], events: RingGagEvents.slice() },
	];
}

function RG_CosmeticRestraints() {
	var list = [];
	for (var i = 1; i <= 4; i++) {
		list.push({
			inventory: false, name: "RingGagDroolS" + i + "FX", Asset: "RingGags", preview: "RingGags",
			Model: "RingGagDroolS" + i, Group: "RingGagDroolFX",
			power: -10, weight: 0, maxwill: 0, noDupe: true,
			escapeChance: { Struggle: -100, Cut: -100, Remove: -100, Pick: -100 },
			limitChance: { Struggle: 1, Cut: 1, Remove: 1, Pick: 1 },
			enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
		});
	}
	list.push({
		inventory: false, name: "RingGagBreathFX", Asset: "RingGags", preview: "RingGags",
		Model: "RingGagBreathOverlay", Group: "RingGagBreathFX",
		power: -10, weight: 0, maxwill: 0, noDupe: true,
		escapeChance: { Struggle: -100, Cut: -100, Remove: -100, Pick: -100 },
		limitChance: { Struggle: 1, Cut: 1, Remove: 1, Pick: 1 },
		enemyTags: {}, playerTags: {}, minLevel: 0, allFloors: true, shrine: [],
	});
	return list;
}

var RG_Registered = false;
function RG_Register() {
	if (RG_Registered) return true;
	if (typeof KinkyDungeonRestraints === "undefined" || !Array.isArray(KinkyDungeonRestraints)) {
		return false;
	}
	RG_Registered = true;

	var restraints = RG_CoreRestraints().concat(RG_CosmeticRestraints());
	var added = 0;
	for (var ri = 0; ri < restraints.length; ri++) {
		var r = restraints[ri];
		var exists = false;
		for (var j = 0; j < KinkyDungeonRestraints.length; j++) {
			if (KinkyDungeonRestraints[j].name === r.name) { exists = true; break; }
		}
		if (!exists) {
			KinkyDungeonRestraints.push(r);
			added++;
		}
	}

	if (typeof KinkyDungeonAddRestraintText === "function") {
		for (var ti = 0; ti < RG_RESTRAINT_TEXT.length; ti++) {
			var t = RG_RESTRAINT_TEXT[ti];
			KinkyDungeonAddRestraintText(t.name, t.display, t.flavor, t.func);
		}
		for (var ci = 1; ci <= 4; ci++) {
			KinkyDungeonAddRestraintText("RingGagDroolS" + ci + "FX", "", "", "");
		}
		KinkyDungeonAddRestraintText("RingGagBreathFX", "", "", "");
	} else if (typeof addTextKey === "function") {
		for (var tj = 0; tj < RG_RESTRAINT_TEXT.length; tj++) {
			var tt = RG_RESTRAINT_TEXT[tj];
			addTextKey("Restraint" + tt.name, tt.display);
			addTextKey("Restraint" + tt.name + "Desc", tt.flavor);
			addTextKey("Restraint" + tt.name + "Desc2", tt.func);
		}
		for (var cj = 1; cj <= 4; cj++) {
			addTextKey("RestraintRingGagDroolS" + cj + "FX", "");
			addTextKey("RestraintRingGagDroolS" + cj + "FXDesc", "");
			addTextKey("RestraintRingGagDroolS" + cj + "FXDesc2", "");
		}
		addTextKey("RestraintRingGagBreathFX", "");
		addTextKey("RestraintRingGagBreathFXDesc", "");
		addTextKey("RestraintRingGagBreathFXDesc2", "");
	}

	if (typeof KinkyDungeonRefreshRestraintsCache === "function") {
		KinkyDungeonRefreshRestraintsCache();
	}
	RG_RegisterEvents();
	if (typeof console !== "undefined" && console.log) {
		console.log("[RingGags] Registered " + added + " restraints + sequential drool S1–S4");
	}
	return true;
}

RG_Register();

(function RG_DeferredRegister() {
	var tries = 0;
	function tick() {
		if (RG_Register()) return;
		tries++;
		if (tries < 40) {
			if (typeof setTimeout === "function") setTimeout(tick, 250);
		} else if (typeof console !== "undefined" && console.warn) {
			console.warn("[RingGags] Failed to register: KinkyDungeonRestraints never became available");
		}
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
})();
