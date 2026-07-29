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
	npcType?: string;
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
	// ---------- Player open-mouth speech ----------
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

	// ---------- NPC reactions (open ring / drool / noise) ----------
	"NPC/Guard/Spot": [
		{ id: "ng_s0", text: "Hold it — jaw forced open like that? You're not sneaking past anyone.", tags: ["npc", "guard"], weight: 1, cooldownTurns: 20 },
		{ id: "ng_s1", text: "Nice ring. Keep gasping; it makes you easy to track.", tags: ["npc", "guard"], weight: 1, cooldownTurns: 20 },
		{ id: "ng_s2", text: "Mouth open, hands tied… security's favorite combination.", tags: ["npc", "guard"], weight: 1, cooldownTurns: 20 },
		{ id: "ng_s3", text: "I heard you before I saw you. That ring carries.", tags: ["npc", "guard"], weight: 1, cooldownTurns: 20 },
	],
	"NPC/Guard/HearNoise": [
		{ id: "ng_h0", text: "Who's breathing that loud? Show yourself!", tags: ["npc", "guard", "noise"], weight: 1, cooldownTurns: 15 },
		{ id: "ng_h1", text: "Those wet gasps again… search the corridor.", tags: ["npc", "guard", "noise"], weight: 1, cooldownTurns: 15 },
		{ id: "ng_h2", text: "Quiet down— wait. That wasn't quiet at all.", tags: ["npc", "guard", "noise"], weight: 1, cooldownTurns: 15 },
		{ id: "ng_h3", text: "Open-mouthed whimpering. Pinpoint them.", tags: ["npc", "guard", "noise"], weight: 1, cooldownTurns: 15 },
	],
	"NPC/Guard/Capture": [
		{ id: "ng_c0", text: "Stay still. The ring stays in — I want to hear every breath.", tags: ["npc", "guard", "capture"], weight: 1, cooldownTurns: 25 },
		{ id: "ng_c1", text: "Caught drooling on the floor. Charming.", tags: ["npc", "guard", "capture"], weight: 1, cooldownTurns: 25 },
		{ id: "ng_c2", text: "Don't bother forming words. That metal won't let you.", tags: ["npc", "guard", "capture"], weight: 1, cooldownTurns: 25 },
		{ id: "ng_c3", text: "Cuffs, then we walk. Try not to puddle the whole way.", tags: ["npc", "guard", "capture"], weight: 1, cooldownTurns: 25 },
	],
	"NPC/Guard/Taunt": [
		{ id: "ng_t0", text: "Look at you — jaw locked open, spit shining on your chin.", tags: ["npc", "guard", "taunt"], weight: 1, cooldownTurns: 30 },
		{ id: "ng_t1", text: "All that noise and still nothing useful to say.", tags: ["npc", "guard", "taunt"], weight: 1, cooldownTurns: 30 },
		{ id: "ng_t2", text: "Breathe harder. I like knowing exactly where you are.", tags: ["npc", "guard", "taunt"], weight: 1, cooldownTurns: 30 },
	],

	"NPC/Shop/GreetOpen": [
		{ id: "ns_g0", text: "Welcome— oh. Bit hard to haggle with your mouth stuck like that.", tags: ["npc", "shop"], weight: 1, cooldownTurns: 40 },
		{ id: "ns_g1", text: "Mind the merchandise. You're dripping.", tags: ["npc", "shop"], weight: 1, cooldownTurns: 40 },
		{ id: "ns_g2", text: "Point at what you want. Nodding will have to do.", tags: ["npc", "shop"], weight: 1, cooldownTurns: 40 },
		{ id: "ns_g3", text: "I've seen ring gags before. Yours looks… thorough.", tags: ["npc", "shop"], weight: 1, cooldownTurns: 40 },
	],
	"NPC/Shop/RefuseTalk": [
		{ id: "ns_r0", text: "I don't need a speech. Coins talk louder than your gasps.", tags: ["npc", "shop"], weight: 1, cooldownTurns: 35 },
		{ id: "ns_r1", text: "Save the aahhs for the dungeon. This is a store.", tags: ["npc", "shop"], weight: 1, cooldownTurns: 35 },
	],
	"NPC/Shop/Drool": [
		{ id: "ns_d0", text: "There's a rag by the door if you can reach it. Doubt you can.", tags: ["npc", "shop", "drool"], weight: 1, cooldownTurns: 45 },
		{ id: "ns_d1", text: "Please don't leave a trail from the entrance.", tags: ["npc", "shop", "drool"], weight: 1, cooldownTurns: 45 },
	],

	"NPC/Enemy/Spot": [
		{ id: "ne_s0", text: "There — open mouth, easy prey.", tags: ["npc", "enemy"], weight: 1, cooldownTurns: 18 },
		{ id: "ne_s1", text: "Listen to that breathing. Someone's already half beaten.", tags: ["npc", "enemy"], weight: 1, cooldownTurns: 18 },
		{ id: "ne_s2", text: "A ring gag? How considerate of whoever fitted you.", tags: ["npc", "enemy"], weight: 1, cooldownTurns: 18 },
		{ id: "ne_s3", text: "You can't even close your lips. This won't take long.", tags: ["npc", "enemy"], weight: 1, cooldownTurns: 18 },
	],
	"NPC/Enemy/HearNoise": [
		{ id: "ne_h0", text: "Heard that. Wet, open, close.", tags: ["npc", "enemy", "noise"], weight: 1, cooldownTurns: 12 },
		{ id: "ne_h1", text: "Someone's panting through metal. Move in.", tags: ["npc", "enemy", "noise"], weight: 1, cooldownTurns: 12 },
		{ id: "ne_h2", text: "Those little aahhs carry farther than you think.", tags: ["npc", "enemy", "noise"], weight: 1, cooldownTurns: 12 },
	],
	"NPC/Enemy/Combat": [
		{ id: "ne_c0", text: "Keep gasping — it won't help you struggle free.", tags: ["npc", "enemy", "combat"], weight: 1, cooldownTurns: 20 },
		{ id: "ne_c1", text: "Mouth wide open and still fighting. Adorable.", tags: ["npc", "enemy", "combat"], weight: 1, cooldownTurns: 20 },
		{ id: "ne_c2", text: "I'll tighten everything else. The ring stays.", tags: ["npc", "enemy", "combat"], weight: 1, cooldownTurns: 20 },
	],
	"NPC/Enemy/Capture": [
		{ id: "ne_cap0", text: "Down. Jaw stays forced open; I want the drool visible.", tags: ["npc", "enemy", "capture"], weight: 1, cooldownTurns: 25 },
		{ id: "ne_cap1", text: "No more running with that metal in the way of every breath.", tags: ["npc", "enemy", "capture"], weight: 1, cooldownTurns: 25 },
		{ id: "ne_cap2", text: "Struggle all you like. The ring already did half my work.", tags: ["npc", "enemy", "capture"], weight: 1, cooldownTurns: 25 },
	],
	"NPC/Enemy/PlugThreat": [
		{ id: "ne_p0", text: "Cute ring. Shall we fill it so you stop making so much noise?", tags: ["npc", "enemy", "plug"], weight: 1, cooldownTurns: 30 },
		{ id: "ne_p1", text: "Open looks good on you. Plugged might look better.", tags: ["npc", "enemy", "plug"], weight: 1, cooldownTurns: 30 },
		{ id: "ne_p2", text: "If you keep howling through that hoop, I'll seal it.", tags: ["npc", "enemy", "plug"], weight: 1, cooldownTurns: 30 },
	],

	"NPC/Maid/React": [
		{ id: "nm_r0", text: "Oh dear — another trail on the floor. Hold still while I… never mind, your hands are busy.", tags: ["npc", "maid"], weight: 1, cooldownTurns: 35 },
		{ id: "nm_r1", text: "Ring gags always make such a mess. Poor thing.", tags: ["npc", "maid"], weight: 1, cooldownTurns: 35 },
		{ id: "nm_r2", text: "Breathe through it carefully. I'll fetch a cloth you can't use.", tags: ["npc", "maid"], weight: 1, cooldownTurns: 35 },
	],
	"NPC/Maid/Clean": [
		{ id: "nm_c0", text: "Chin up — figuratively. I'll wipe the worst of it.", tags: ["npc", "maid", "drool"], weight: 1, cooldownTurns: 40 },
		{ id: "nm_c1", text: "There. It will only last until the next string of drool.", tags: ["npc", "maid", "drool"], weight: 1, cooldownTurns: 40 },
	],

	"NPC/Mage/React": [
		{ id: "nmg_r0", text: "An open focus… or a crude ring. Either way, your tongue is useless for proper words.", tags: ["npc", "mage"], weight: 1, cooldownTurns: 35 },
		{ id: "nmg_r1", text: "Incantations require lips you don't currently control.", tags: ["npc", "mage"], weight: 1, cooldownTurns: 35 },
		{ id: "nmg_r2", text: "Interesting restraint. The aural component of your magic must be suffering.", tags: ["npc", "mage"], weight: 1, cooldownTurns: 35 },
	],
	"NPC/Mage/Incantor": [
		{ id: "nmg_i0", text: "That mouthpiece hums with old work. Don't bite down — you can't.", tags: ["npc", "mage", "incantor"], weight: 1, cooldownTurns: 40 },
		{ id: "nmg_i1", text: "Forced open for the spell, not for comfort. Remember that.", tags: ["npc", "mage", "incantor"], weight: 1, cooldownTurns: 40 },
	],

	"NPC/Beast/React": [
		{ id: "nb_r0", text: "*sniffs the open-mouthed breathing, curious and close*", tags: ["npc", "beast"], weight: 1, cooldownTurns: 25 },
		{ id: "nb_r1", text: "*growls at the wet sounds slipping past the ring*", tags: ["npc", "beast"], weight: 1, cooldownTurns: 25 },
		{ id: "nb_r2", text: "*tilts its head at your helpless, open jaw*", tags: ["npc", "beast"], weight: 1, cooldownTurns: 25 },
	],

	"NPC/Ally/Worry": [
		{ id: "na_w0", text: "You're leaving a trail — and everyone can hear you breathe.", tags: ["npc", "ally"], weight: 1, cooldownTurns: 30 },
		{ id: "na_w1", text: "I can't understand a word. Nod if you still want to push on.", tags: ["npc", "ally"], weight: 1, cooldownTurns: 30 },
		{ id: "na_w2", text: "That ring is going to get us found. Stay behind me.", tags: ["npc", "ally"], weight: 1, cooldownTurns: 30 },
	],
	"NPC/Ally/HelpWipe": [
		{ id: "na_h0", text: "Hold still — I'll clear your chin. Don't thank me; you can't.", tags: ["npc", "ally", "drool"], weight: 1, cooldownTurns: 35 },
		{ id: "na_h1", text: "There. Temporary. We need to move before it starts again.", tags: ["npc", "ally", "drool"], weight: 1, cooldownTurns: 35 },
	],

	"NPC/Crier/Hear": [
		{ id: "nc_h0", text: "By the bells — that ring makes you loud as a town square.", tags: ["npc", "crier"], weight: 1, cooldownTurns: 20 },
		{ id: "nc_h1", text: "Hear ye: one prisoner who cannot shut up even if they tried.", tags: ["npc", "crier"], weight: 1, cooldownTurns: 20 },
		{ id: "nc_h2", text: "Whatever curse is on that metal, it's working. The whole floor knows.", tags: ["npc", "crier"], weight: 1, cooldownTurns: 20 },
	],

	"NPC/Generic/NoticeDrool": [
		{ id: "n_d0", text: "You're making a puddle.", tags: ["npc", "drool"], weight: 1, cooldownTurns: 25 },
		{ id: "n_d1", text: "Chin. Floor. Again.", tags: ["npc", "drool"], weight: 1, cooldownTurns: 25 },
		{ id: "n_d2", text: "That open ring doesn't leave much dignity, does it?", tags: ["npc", "drool"], weight: 1, cooldownTurns: 25 },
	],
	"NPC/Generic/NoticeBreath": [
		{ id: "n_b0", text: "Every breath is a beacon with your mouth held like that.", tags: ["npc", "breath"], weight: 1, cooldownTurns: 25 },
		{ id: "n_b1", text: "Slow down. You're panting loud enough to map the room.", tags: ["npc", "breath"], weight: 1, cooldownTurns: 25 },
	],
	"NPC/Generic/NoticeRing": [
		{ id: "n_r0", text: "Someone fitted you with a ring. No words. Only sound.", tags: ["npc", "open_gag"], weight: 1, cooldownTurns: 30 },
		{ id: "n_r1", text: "Jaw locked open. That's a statement.", tags: ["npc", "open_gag"], weight: 1, cooldownTurns: 30 },
		{ id: "n_r2", text: "You won't talk your way out. The metal already decided.", tags: ["npc", "open_gag"], weight: 1, cooldownTurns: 30 },
	],
};

function RG_DialogFallback(ctx: RG_DialogContext): string {
	var b = ctx && ctx.bank ? ctx.bank : "";
	if (b.indexOf("NPC/") === 0) return "...";
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
	var cur = RG_DialogMemory.weights[entry.id];
	if (typeof cur !== "number") cur = 1;
	RG_DialogMemory.weights[entry.id] = Math.max(0.4, cur * 0.92);
}

function RG_DialogFeedback(entryId: string, positive: boolean): void {
	if (!RG_DIALOG_AI_ENABLED) return;
	var cur = RG_DialogMemory.weights[entryId];
	if (typeof cur !== "number") cur = 1;
	RG_DialogMemory.weights[entryId] = positive
		? Math.min(2, cur * 1.08)
		: Math.max(0.35, cur * 0.9);
}

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

function RG_DialogBankForSpeechKind(kind: string): string {
	if (kind === "mumble_aroused" || kind === "OpenGagMumbleAroused") return "OpenGag/Aroused";
	if (kind === "struggle_quiet" || kind === "OpenGagStruggleQuiet") return "OpenGag/StruggleQuiet";
	if (kind === "struggle" || kind === "OpenGagStruggle") return "OpenGag/Struggle";
	if (kind === "restraint" || kind === "OpenGagRestraint") return "OpenGag/Restraint";
	return "OpenGag/Mumble";
}

/** Map NPC role + event to a bank name. */
function RG_DialogBankForNPC(role: string, event: string): string {
	var r = (role || "generic").toLowerCase();
	var e = (event || "spot").toLowerCase();
	if (r === "guard" || r === "security") {
		if (e === "hear" || e === "noise") return "NPC/Guard/HearNoise";
		if (e === "capture") return "NPC/Guard/Capture";
		if (e === "taunt") return "NPC/Guard/Taunt";
		return "NPC/Guard/Spot";
	}
	if (r === "shop" || r === "merchant" || r === "vendor") {
		if (e === "drool") return "NPC/Shop/Drool";
		if (e === "refuse") return "NPC/Shop/RefuseTalk";
		return "NPC/Shop/GreetOpen";
	}
	if (r === "maid") {
		if (e === "clean") return "NPC/Maid/Clean";
		return "NPC/Maid/React";
	}
	if (r === "mage" || r === "witch" || r === "wizard") {
		if (e === "incantor") return "NPC/Mage/Incantor";
		return "NPC/Mage/React";
	}
	if (r === "beast" || r === "animal" || r === "monster") return "NPC/Beast/React";
	if (r === "ally" || r === "friend" || r === "party") {
		if (e === "wipe" || e === "help") return "NPC/Ally/HelpWipe";
		return "NPC/Ally/Worry";
	}
	if (r === "crier") return "NPC/Crier/Hear";
	if (r === "enemy" || r === "foe" || r === "hostile") {
		if (e === "hear" || e === "noise") return "NPC/Enemy/HearNoise";
		if (e === "combat") return "NPC/Enemy/Combat";
		if (e === "capture") return "NPC/Enemy/Capture";
		if (e === "plug") return "NPC/Enemy/PlugThreat";
		return "NPC/Enemy/Spot";
	}
	if (e === "drool") return "NPC/Generic/NoticeDrool";
	if (e === "breath") return "NPC/Generic/NoticeBreath";
	return "NPC/Generic/NoticeRing";
}

function RG_InstallDialogAI(): void {
	if (!RG_DIALOG_AI_ENABLED) {
		console.log("[RingGags] Dialog AI disabled (RG_DIALOG_AI_ENABLED=false)");
		return;
	}
	console.log("[RingGags] Dialog AI banks ready (player + NPC; kill switch: RG_DIALOG_AI_ENABLED)");
}

RG_InstallDialogAI();
