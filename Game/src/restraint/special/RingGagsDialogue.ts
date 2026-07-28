/**
 * RingGags open-mouth dialogue & noise
 * Strategy: register dedicated KinkyDungeonOpenGag* text keys via addTextKey,
 * and route idle mumble through KDDoMumble when only OpenGags are worn.
 * Avoids fighting vanilla TextGet on shared KinkyDungeonGagMumble* keys.
 */
"use strict";

var RG_OPEN_MUMBLE = ["Aahh...", "Haaahh...", "Aaah...", "Nnaahh...", "Hahh...", "Aahnn...", "Haaah...", "Aah...", "Nnnh...", "Haaahnn..."];
var RG_OPEN_MUMBLE_AROUSED = ["Aaahh~", "Haahhh~", "Aahnn~", "Nnhaa~", "Haahh~~", "Aah~", "Aahnn~~", "Aahhh~~~", "Haaahh~~", "Nnnhaa~"];
var RG_OPEN_STRUGGLE = ["Aaagh!", "Hnnaa!", "Aaah!!", "Nnaagh!", "Haaah!"];
var RG_OPEN_STRUGGLE_QUIET = ["Aah.", "Haa...", "Nnh.", "Ahh."];
var RG_OPEN_RESTRAINT = ["Aah!", "Nnaah!", "AAH!!", "Haaah!"];

var RG_NOISE_RADII: {[key: string]: number} = {
	OPEN_MUMBLE: 4,
	OPEN_MUMBLE_AROUSED: 8,
	OPEN_STRUGGLE: 6,
	OPEN_STRUGGLE_QUIET: 2,
	OPEN_RESTRAINT: 4,
};
var RG_NOISE_RADIUS = 4;

var RG_COLOR_START = "#b0c4de";
var RG_COLOR_WIPE = "#88ccaa";
var RG_COLOR_BOUND_T1 = "#d4a0b0";
var RG_COLOR_BOUND_T2 = "#d88898";
var RG_COLOR_BOUND_T3 = "#cc6680";
var RG_COLOR_BREATH = "#a8c8d8";

var RG_MSG_DROOL_START_FIRST = [
	"Saliva begins pooling behind the ring in your mouth.",
	"Your mouth starts watering uncontrollably around the gag.",
	"You feel drool building up with nothing to stop it.",
	"The open ring keeps your lips from sealing — saliva has nowhere to go but out.",
];
var RG_MSG_DROOL_START_RECURRING = [
	"More drool escapes past the ring.",
	"Saliva spills over your lip again.",
	"Another trail of drool slides down your chin.",
	"The drooling hasn't stopped...",
	"Your chin is slick with drool again.",
	"You try to swallow, but the ring holds your jaw open too wide.",
];
var RG_MSG_CYCLE_S2 = [
	"For a second you forgot about the drooling. The gag reminded you.",
	"The drool eased off just long enough to give you false hope.",
	"The drool had slowed for a moment. It's starting again.",
	"Your chin was almost dry. Was.",
];
var RG_MSG_BOUND_TIER1 = [
	"Drool runs down your chin. Your hands can't reach.",
	"You feel it dripping but there's nothing you can do.",
	"Saliva trails down your neck. You can only endure it.",
	"The drool reaches your chest. Your bound arms are useless.",
	"You try to shake it off, but more just takes its place.",
];
var RG_MSG_BOUND_TIER2 = [
	"It's getting worse. Your chin is soaked and your arms won't budge.",
	"Your chin drips steadily now. Your arms strain but the restraints hold.",
	"You tilt your head trying to slow it. It doesn't help.",
	"You try pressing your tongue against the ring. It just makes it worse.",
	"You swallow what you can. The rest has nowhere to go but down.",
	"Another string of saliva escapes. Your bound hands clench uselessly.",
	"It's dripping onto your chest now.",
	"The drool pools in the hollow of your collarbone.",
];
var RG_MSG_BOUND_TIER3 = [
	"Your neck glistens. At this point you've stopped trying.",
	"The drool is constant. You barely notice it anymore.",
	"Another wave of drool. The gag doesn't care about your dignity.",
	"Saliva soaks the front of your clothes. There's no end to it.",
	"Your jaw aches and your chin never dries. This is just how it is now.",
];
var RG_MSG_BREATH_START = [
	"Your breathing shifts to your open mouth — soft, audible pants escape the ring.",
	"With your lips forced apart, every breath is a soft gasp.",
	"You start breathing harder through the open ring. The sound is unmistakable.",
];
var RG_MSG_BREATH_TIRED = [
	"Heavy mouth-breathing. The ring forces every pant out into the open.",
	"You're huffing through the gag, unable to seal your lips.",
	"Exhaustion makes every breath loud and wet against the open ring.",
];
var RG_MSG_BREATH_AROUSED = [
	"Excitement makes your breathing ragged. Soft gasps spill past the ring.",
	"Your open mouth betrays every shaky breath.",
	"Arousal turns each exhale into an audible sigh through the gag.",
];

function RG_DlgPick(arr: string[]): string {
	if (!arr || !arr.length) return "";
	return arr[Math.floor(Math.random() * arr.length)];
}

function RG_S(): any {
	return typeof RG_State !== "undefined" ? RG_State : {};
}

function RG_HasCriersRingDlg(): boolean {
	if (typeof KinkyDungeonAllRestraintDynamic !== "function") return false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		if (rest.item && rest.item.name === "CriersRing") return true;
	}
	return false;
}

(function () {
	var s = RG_S();
	if (s.LastNoiseCategory === undefined) s.LastNoiseCategory = null;
	if (s.BreathMsgCooldown === undefined) s.BreathMsgCooldown = 0;
	if (s.LastBreathWasActive === undefined) s.LastBreathWasActive = false;
})();

/** Register dedicated open-gag speech keys so vanilla GagMumble* stay untouched. */
var RG_OPEN_TEXTS_REGISTERED = false;
function RG_RegisterOpenGagTexts() {
	if (RG_OPEN_TEXTS_REGISTERED) return;
	if (typeof addTextKey !== "function") return;
	RG_OPEN_TEXTS_REGISTERED = true;
	for (var i = 0; i < 10; i++) {
		addTextKey("KinkyDungeonOpenGagMumble" + i, RG_OPEN_MUMBLE[i % RG_OPEN_MUMBLE.length]);
		addTextKey("KinkyDungeonOpenGagMumbleAroused" + i, RG_OPEN_MUMBLE_AROUSED[i % RG_OPEN_MUMBLE_AROUSED.length]);
		addTextKey("KinkyDungeonOpenGagStruggle" + i, RG_OPEN_STRUGGLE[i % RG_OPEN_STRUGGLE.length]);
		addTextKey("KinkyDungeonOpenGagStruggleQuiet" + i, RG_OPEN_STRUGGLE_QUIET[i % RG_OPEN_STRUGGLE_QUIET.length]);
		addTextKey("KinkyDungeonOpenGagRestraint" + i, RG_OPEN_RESTRAINT[i % RG_OPEN_RESTRAINT.length]);
	}
	if (typeof console !== "undefined" && console.log) {
		console.log("[RingGags] Open-gag text keys registered (KinkyDungeonOpenGag*)");
	}
}

/** KinkyDungeonGagMumble -> KinkyDungeonOpenGagMumble */
function RG_ToOpenGagKey(key: string): string {
	if (key.indexOf("KinkyDungeonGag") === 0) {
		return "KinkyDungeonOpenGag" + key.substring("KinkyDungeonGag".length);
	}
	return key;
}

var RG_DoMumbleHooked = false;
function RG_InstallDoMumbleHook() {
	if (RG_DoMumbleHooked) return;
	if (typeof KDDoMumble !== "function") return;
	if (typeof RG_HasOnlyOpenGags !== "function") return;
	RG_DoMumbleHooked = true;

	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
	var orig: any = g.KDDoMumble || KDDoMumble;

	var hooked = function (player: any, cancel: boolean) {
		if (!cancel && typeof RG_HasOnlyOpenGags === "function" && RG_HasOnlyOpenGags()) {
			var origCanTalk: any = typeof KinkyDungeonCanTalk === "function" ? KinkyDungeonCanTalk : null;
			if (origCanTalk) {
				g.KinkyDungeonCanTalk = function () { return true; };
				// @ts-ignore
				KinkyDungeonCanTalk = g.KinkyDungeonCanTalk;
			}
			try {
				orig.apply(this, arguments);
			} finally {
				if (origCanTalk) {
					g.KinkyDungeonCanTalk = origCanTalk;
					// @ts-ignore
					KinkyDungeonCanTalk = origCanTalk;
				}
			}

			var gagchance = (typeof KinkyDungeonGagMumbleChance !== "undefined") ? KinkyDungeonGagMumbleChance : 0.02;
			var perR = (typeof KinkyDungeonGagMumbleChancePerRestraint !== "undefined") ? KinkyDungeonGagMumbleChancePerRestraint : 0.0025;
			var perMax = (typeof KinkyDungeonGagMumbleChancePerRestraintMax !== "undefined") ? KinkyDungeonGagMumbleChancePerRestraintMax : 0.05;
			if (typeof KinkyDungeonAllRestraint === "function") {
				for (var inv of KinkyDungeonAllRestraint()) {
					if (typeof KDRestraint === "function" && KDRestraint(inv) && gagchance + perR < perMax) gagchance += perR;
				}
			}
			var canTalkNow = origCanTalk ? !origCanTalk() : true;
			if (canTalkNow && typeof KDRandom === "function" && KDRandom() < gagchance) {
				var numMsg = (typeof KDNumberOfGagMsg !== "undefined") ? KDNumberOfGagMsg : 5;
				var gagMsg = Math.floor(KDRandom() * numMsg);
				var gagEffect = (typeof KinkyDungeonGagTotal === "function") ? KinkyDungeonGagTotal() * 5 : 0;
				gagMsg += gagEffect;
				gagMsg = Math.max(0, Math.min(7, Math.floor(gagMsg)));
				var prefix = "KinkyDungeonOpenGagMumble";
				var distract = (typeof KinkyDungeonStatDistraction !== "undefined") ? KinkyDungeonStatDistraction : 0;
				var distractMax = (typeof KinkyDungeonStatDistractionMax !== "undefined") ? KinkyDungeonStatDistractionMax : 100;
				if (distractMax > 0 && KDRandom() < distract / distractMax) {
					prefix = "KinkyDungeonOpenGagMumbleAroused";
					RG_S().LastNoiseCategory = "OPEN_MUMBLE_AROUSED";
				} else {
					RG_S().LastNoiseCategory = "OPEN_MUMBLE";
				}
				var key = prefix + gagMsg;
				var line = (typeof TextGet === "function") ? TextGet(key) : RG_DlgPick(RG_OPEN_MUMBLE);
				if (typeof KinkyDungeonSendDialogue === "function" && typeof KinkyDungeonPlayerEntity !== "undefined") {
					KinkyDungeonSendDialogue(KinkyDungeonPlayerEntity, line, (typeof KDBaseWhite !== "undefined") ? KDBaseWhite : "#ffffff", 2, 0);
				}
				if (typeof KDToggles !== "undefined" && KDToggles.GagParticles && typeof KDSendGagParticles === "function" && typeof KDPlayer === "function") {
					KDSendGagParticles(KDPlayer());
				}
			}
			return;
		}
		return orig.apply(this, arguments);
	};

	g.KDDoMumble = hooked;
	// @ts-ignore
	KDDoMumble = hooked;
}

var RG_GagParticlesHooked = false;
function RG_InstallGagParticlesHook() {
	if (RG_GagParticlesHooked) return;
	if (typeof KDSendGagParticles !== "function") return;
	if (typeof RG_HasOnlyOpenGags !== "function") return;
	RG_GagParticlesHooked = true;

	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
	var orig: any = g.KDSendGagParticles || KDSendGagParticles;

	var hooked = function (entity: any) {
		if (entity && entity.player && RG_HasOnlyOpenGags()) {
			var s = RG_S();
			var cat = s.LastNoiseCategory;
			var radius = (cat && RG_NOISE_RADII[cat]) ? RG_NOISE_RADII[cat] : RG_NOISE_RADIUS;
			if (RG_HasCriersRingDlg()) radius *= 2;
			if (typeof KinkyDungeonMakeNoise === "function" && typeof KinkyDungeonPlayerEntity !== "undefined") {
				KinkyDungeonMakeNoise(radius, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			}
			s.LastNoiseCategory = null;
		}
		return orig.apply(this, arguments);
	};

	g.KDSendGagParticles = hooked;
	// @ts-ignore
	KDSendGagParticles = hooked;
}

var RG_TextGetHooked = false;
function RG_InstallTextGetHook() {
	if (RG_TextGetHooked) return;
	if (typeof TextGet !== "function") return;
	if (typeof RG_HasOnlyOpenGags !== "function") return;
	RG_TextGetHooked = true;

	var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
	var orig: any = g.TextGet || TextGet;

	var hooked = function (key: any) {
		if (typeof key === "string" && key.indexOf("KinkyDungeonGag") === 0 && key.indexOf("KinkyDungeonOpenGag") !== 0 && RG_HasOnlyOpenGags()) {
			var openKey = RG_ToOpenGagKey(key);
			var s = RG_S();
			if (key.indexOf("KinkyDungeonGagMumbleAroused") === 0) s.LastNoiseCategory = "OPEN_MUMBLE_AROUSED";
			else if (key.indexOf("KinkyDungeonGagMumble") === 0) s.LastNoiseCategory = "OPEN_MUMBLE";
			else if (key.indexOf("KinkyDungeonGagStruggleQuiet") === 0) s.LastNoiseCategory = "OPEN_STRUGGLE_QUIET";
			else if (key.indexOf("KinkyDungeonGagStruggle") === 0) s.LastNoiseCategory = "OPEN_STRUGGLE";
			else if (key.indexOf("KinkyDungeonGagRestraint") === 0) s.LastNoiseCategory = "OPEN_RESTRAINT";
			var t = orig.call(this, openKey);
			if (t && t !== openKey) return t;
			if (s.LastNoiseCategory === "OPEN_MUMBLE_AROUSED") return RG_DlgPick(RG_OPEN_MUMBLE_AROUSED);
			if (s.LastNoiseCategory === "OPEN_STRUGGLE_QUIET") return RG_DlgPick(RG_OPEN_STRUGGLE_QUIET);
			if (s.LastNoiseCategory === "OPEN_STRUGGLE") return RG_DlgPick(RG_OPEN_STRUGGLE);
			if (s.LastNoiseCategory === "OPEN_RESTRAINT") return RG_DlgPick(RG_OPEN_RESTRAINT);
			return RG_DlgPick(RG_OPEN_MUMBLE);
		}
		return orig.apply(this, arguments);
	};

	g.TextGet = hooked;
	// @ts-ignore
	TextGet = hooked;
}

function RG_FireDroolStartMessage(nextStage: number, isCycling: boolean, _armsBound: boolean, hasDroolLock: boolean) {
	if (typeof KinkyDungeonSendTextMessage !== "function") return;
	var s = RG_S();
	var msg: string;
	var color: string;
	var failCount = s.BoundWipeFailCount || 0;
	if (isCycling && nextStage === 2) {
		msg = RG_DlgPick(RG_MSG_CYCLE_S2);
		color = RG_COLOR_START;
	} else if (isCycling) {
		msg = RG_DlgPick(RG_MSG_BOUND_TIER3);
		color = RG_COLOR_BOUND_T3;
	} else if ((s.DroolEpisode || 0) <= 1) {
		msg = RG_DlgPick(RG_MSG_DROOL_START_FIRST);
		color = RG_COLOR_START;
	} else if (failCount <= 0) {
		msg = RG_DlgPick(RG_MSG_DROOL_START_RECURRING);
		color = RG_COLOR_START;
	} else if (failCount <= 2) {
		msg = RG_DlgPick(RG_MSG_BOUND_TIER1);
		color = RG_COLOR_BOUND_T1;
	} else if (failCount <= 4 || !hasDroolLock) {
		msg = RG_DlgPick(RG_MSG_BOUND_TIER2);
		color = RG_COLOR_BOUND_T2;
	} else {
		msg = RG_DlgPick(RG_MSG_BOUND_TIER3);
		color = RG_COLOR_BOUND_T3;
	}
	KinkyDungeonSendTextMessage(5, msg, color, 2);
}

function RG_FireBreathMessage(staminaRatio: number, aroused: boolean) {
	if (typeof KinkyDungeonSendTextMessage !== "function") return;
	var s = RG_S();
	if ((s.BreathMsgCooldown || 0) > 0) return;
	var msg: string;
	if (aroused) msg = RG_DlgPick(RG_MSG_BREATH_AROUSED);
	else if (typeof RG_BREATH_HUFFING !== "undefined" && staminaRatio < RG_BREATH_HUFFING) msg = RG_DlgPick(RG_MSG_BREATH_TIRED);
	else msg = RG_DlgPick(RG_MSG_BREATH_START);
	KinkyDungeonSendTextMessage(4, msg, RG_COLOR_BREATH, 2);
	s.BreathMsgCooldown = 40;
}

(function RG_DialogueBoot() {
	var tries = 0;
	function tick() {
		RG_RegisterOpenGagTexts();
		RG_InstallDoMumbleHook();
		RG_InstallGagParticlesHook();
		RG_InstallTextGetHook();
		if (RG_OPEN_TEXTS_REGISTERED && RG_DoMumbleHooked) {
			if (typeof console !== "undefined" && console.log) {
				console.log("[RingGags] Open-mouth dialogue installed (OpenGag keys + KDDoMumble route)");
			}
			return;
		}
		tries++;
		if (tries < 40 && typeof setTimeout === "function") setTimeout(tick, 250);
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
})();
