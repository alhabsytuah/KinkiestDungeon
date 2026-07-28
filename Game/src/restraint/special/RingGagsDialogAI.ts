/**
 * RingGags Dialog AI — optional adaptive dialogue banks.
 * Soft disable: set RG_DIALOG_AI_ENABLED = false
 * Hard remove: drop this file from tsconfig.json and delete the file.
 * Core ring-gag / drool logic must not depend on this module.
 */

/** Master kill switch — set false if this layer breaks. */
var RG_DIALOG_AI_ENABLED = true;

type RG_DialogEntry = {
	id: string;
	text: string;
	tags: string[];
	weight: number;
	cooldownTurns?: number;
	noise?: number;
};

type RG_DialogContext = {
	bank: string;
	onlyOpenGag?: boolean;
	armsBound?: boolean;
	droolStage?: number;
	staminaRatio?: number;
	arousalRatio?: number;
	turn?: number;
};

/** Session learning / anti-spam (not written to save by default). */
var RG_DialogMemory: {
	weights: Record<string, number>;
	lastShown: Record<string, number>;
	recentIds: string[];
} = {
	weights: {},
	lastShown: {},
	recentIds: [],
};

var RG_DIALOG_BANKS: Record<string, RG_DialogEntry[]> = {
	"OpenGag/Mumble": [
		{ id: "og_m0", text: "Aahh...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m1", text: "Haaahh...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m2", text: "Aaah...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m3", text: "Nnaahh...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m4", text: "Hahh...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m5", text: "Aahnn...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m6", text: "Haaah...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
		{ id: "og_m7", text: "Nnnhaa...", tags: ["open_gag", "mumble"], weight: 1, noise: 4 },
	],
	"OpenGag/Aroused": [
		{ id: "og_a0", text: "Aaahh~", tags: ["open_gag", "aroused"], weight: 1, noise: 5 },
		{ id: "og_a1", text: "Haahhh~", tags: ["open_gag", "aroused"], weight: 1, noise: 5 },
		{ id: "og_a2", text: "Aahnn~", tags: ["open_gag", "aroused"], weight: 1, noise: 5 },
		{ id: "og_a3", text: "Nnhaa~", tags: ["open_gag", "aroused"], weight: 1, noise: 5 },
		{ id: "og_a4", text: "Haahh~~", tags: ["open_gag", "aroused"], weight: 1, noise: 6 },
		{ id: "og_a5", text: "Aahhh~~~", tags: ["open_gag", "aroused"], weight: 1, noise: 6 },
	],
	"OpenGag/Struggle": [
		{ id: "og_s0", text: "Aaagh!", tags: ["open_gag", "struggle"], weight: 1, noise: 6 },
		{ id: "og_s1", text: "Hnnaa!", tags: ["open_gag", "struggle"], weight: 1, noise: 6 },
		{ id: "og_s2", text: "Aaah!!", tags: ["open_gag", "struggle"], weight: 1, noise: 6 },
		{ id: "og_s3", text: "Nnaagh!", tags: ["open_gag", "struggle"], weight: 1, noise: 6 },
		{ id: "og_s4", text: "Haaagh!", tags: ["open_gag", "struggle"], weight: 1, noise: 6 },
	],
	"OpenGag/StruggleQuiet": [
		{ id: "og_sq0", text: "Aah.", tags: ["open_gag", "struggle_quiet"], weight: 1, noise: 3 },
		{ id: "og_sq1", text: "Haa...", tags: ["open_gag", "struggle_quiet"], weight: 1, noise: 3 },
		{ id: "og_sq2", text: "Nnh.", tags: ["open_gag", "struggle_quiet"], weight: 1, noise: 3 },
		{ id: "og_sq3", text: "Hnn.", tags: ["open_gag", "struggle_quiet"], weight: 1, noise: 3 },
	],
	"OpenGag/Restraint": [
		{ id: "og_r0", text: "Aah!", tags: ["open_gag", "restraint"], weight: 1, noise: 5 },
		{ id: "og_r1", text: "Nnaah!", tags: ["open_gag", "restraint"], weight: 1, noise: 5 },
		{ id: "og_r2", text: "AAH!!", tags: ["open_gag", "restraint"], weight: 1, noise: 5 },
		{ id: "og_r3", text: "Haaah!", tags: ["open_gag", "restraint"], weight: 1, noise: 5 },
	],
	"Drool/Start": [
		{ id: "dr_s0", text: "Saliva pools behind the ring; you cannot seal your lips.", tags: ["drool"], weight: 1, cooldownTurns: 40 },
		{ id: "dr_s1", text: "A slow string of drool gathers at the corner of your mouth.", tags: ["drool"], weight: 1, cooldownTurns: 40 },
	],
	"Drool/Bound": [
		{ id: "dr_b0", text: "Your arms are bound — the drool runs freely down your chin.", tags: ["drool", "bound"], weight: 1, cooldownTurns: 50 },
		{ id: "dr_b1", text: "You try to wipe, but the restraints stop you. Drool keeps coming.", tags: ["drool", "bound"], weight: 1, cooldownTurns: 50 },
	],
	"Drool/Peak": [
		{ id: "dr_p0", text: "Constant drool slips past the ring; the floor may not stay dry.", tags: ["drool", "peak"], weight: 1, cooldownTurns: 60 },
		{ id: "dr_p1", text: "Your mouth stays forced open. The drooling will not stop.", tags: ["drool", "peak"], weight: 1, cooldownTurns: 60 },
	],
	"Breath/Tired": [
		{ id: "br_t0", text: "Soft pants pass through the open ring.", tags: ["breath", "tired"], weight: 1, cooldownTurns: 30 },
		{ id: "br_t1", text: "You breathe harder through your mouth; the gag holds your jaw apart.", tags: ["breath", "tired"], weight: 1, cooldownTurns: 30 },
	],
	"Breath/Huffing": [
		{ id: "br_h0", text: "Heavy huffs and gasps — the ring keeps every breath audible.", tags: ["breath", "huffing"], weight: 1, cooldownTurns: 25 },
		{ id: "br_h1", text: "Ragged mouth-breathing; you cannot close your lips around the metal.", tags: ["breath", "huffing"], weight: 1, cooldownTurns: 25 },
	],
	"Breath/Aroused": [
		{ id: "br_a0", text: "Uneven gasps slip out around the ring.", tags: ["breath", "aroused"], weight: 1, cooldownTurns: 30 },
		{ id: "br_a1", text: "Breathing turns shaky and open-mouthed.", tags: ["breath", "aroused"], weight: 1, cooldownTurns: 30 },
	],
};

function RG_DialogFallback(ctx: RG_DialogContext): string {
	var b = ctx && ctx.bank ? ctx.bank : "";
	if (b.indexOf("Aroused") >= 0) return "Aaahh~";
	if (b.indexOf("StruggleQuiet") >= 0) return "Aah.";
	if (b.indexOf("Struggle") >= 0) return "Aaagh!";
	if (b.indexOf("Restraint") >= 0) return "Aah!";
	if (b.indexOf("Drool") >= 0) return "Saliva slips past the ring...";
	if (b.indexOf("Breath") >= 0) return "Hah... hah...";
	return "Aahh...";
}

function RG_DialogEffectiveWeight(entry: RG_DialogEntry, turn: number): number {
	var w = entry.weight;
	var learned = RG_DialogMemory.weights[entry.id];
	if (typeof learned === "number") w *= Math.max(0.15, learned);
	var last = RG_DialogMemory.lastShown[entry.id];
	if (typeof last === "number" && entry.cooldownTurns && turn - last < entry.cooldownTurns) {
		w *= 0.05;
	}
	if (RG_DialogMemory.recentIds.indexOf(entry.id) >= 0) w *= 0.35;
	return Math.max(0.01, w);
}

function RG_DialogRecordShow(entry: RG_DialogEntry, turn: number): void {
	RG_DialogMemory.lastShown[entry.id] = turn;
	RG_DialogMemory.recentIds.push(entry.id);
	if (RG_DialogMemory.recentIds.length > 8) RG_DialogMemory.recentIds.shift();
	// Light anti-spam learning: shown lines get a mild fatigue
	var cur = RG_DialogMemory.weights[entry.id];
	if (typeof cur !== "number") cur = 1;
	RG_DialogMemory.weights[entry.id] = Math.max(0.4, cur * 0.92);
}

/** Optional: call when a noisy line caused trouble — slightly prefer quieter later. */
function RG_DialogFeedback(entryId: string, positive: boolean): void {
	if (!RG_DIALOG_AI_ENABLED) return;
	var cur = RG_DialogMemory.weights[entryId];
	if (typeof cur !== "number") cur = 1;
	RG_DialogMemory.weights[entryId] = positive
		? Math.min(2, cur * 1.08)
		: Math.max(0.35, cur * 0.9);
}

/**
 * Main entry: pick a line from a bank. Safe if disabled or on error.
 */
function RG_PickDialog(ctx: RG_DialogContext): string {
	if (!RG_DIALOG_AI_ENABLED) return RG_DialogFallback(ctx);
	try {
		var bankName = (ctx && ctx.bank) || "OpenGag/Mumble";
		var bank = RG_DIALOG_BANKS[bankName];
		if (!bank || !bank.length) return RG_DialogFallback(ctx);
		var turn = typeof ctx.turn === "number" ? ctx.turn : 0;
		var total = 0;
		var weights: number[] = [];
		for (var i = 0; i < bank.length; i++) {
			var ew = RG_DialogEffectiveWeight(bank[i], turn);
			weights.push(ew);
			total += ew;
		}
		var r = Math.random() * total;
		var acc = 0;
		var chosen = bank[0];
		for (var j = 0; j < bank.length; j++) {
			acc += weights[j];
			if (r <= acc) {
				chosen = bank[j];
				break;
			}
		}
		RG_DialogRecordShow(chosen, turn);
		return chosen.text;
	} catch (_e) {
		console.warn("[RingGags] Dialog AI failed, using fallback");
		return RG_DialogFallback(ctx);
	}
}

/** Map legacy open-gag speech kinds to bank names. */
function RG_DialogBankForSpeechKind(kind: string): string {
	if (kind === "mumble_aroused" || kind === "OpenGagMumbleAroused") return "OpenGag/Aroused";
	if (kind === "struggle_quiet" || kind === "OpenGagStruggleQuiet") return "OpenGag/StruggleQuiet";
	if (kind === "struggle" || kind === "OpenGagStruggle") return "OpenGag/Struggle";
	if (kind === "restraint" || kind === "OpenGagRestraint") return "OpenGag/Restraint";
	return "OpenGag/Mumble";
}

function RG_InstallDialogAI(): void {
	if (!RG_DIALOG_AI_ENABLED) {
		console.log("[RingGags] Dialog AI disabled (RG_DIALOG_AI_ENABLED=false)");
		return;
	}
	console.log("[RingGags] Dialog AI banks ready (kill switch: RG_DIALOG_AI_ENABLED)");
}

// Auto-log on load; core must still call RG_PickDialog when wiring speech.
RG_InstallDialogAI();
