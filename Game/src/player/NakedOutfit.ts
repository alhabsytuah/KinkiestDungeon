/**
 * Naked Outfit — base-game port (from Ilyasnow NakedOutfit v1.12)
 *
 * - Always-available non-droppable "None" / Naked outfit
 * - Bikini-style exposure resists + sneak/mana tradeoffs
 * - Optional BodyPlus torso/nipple atlas override
 * - Visible bottom toys (PussyToy / VibeToy models)
 *
 * Loaded after KinkyDungeonDressList via tsconfig files[].
 * Global script for tsc outFile (no export/import).
 */
"use strict";

/** Feature toggles (vanilla defaults: all on). */
var NO_CFG = {
	AddNakedOutfit: true,
	NakedOutfitBuffEvents: true,
	ReplaceBody: true,
	ReplaceNipples: true,
	EnableToys: true,
};

var NO_RestraintPlugsF = ["TrapPlug", "TrapPlug2", "TrapPlug3", "TrapPlug4", "TrapPlug5", "SteelPlugF"];
var NO_RestraintPlugsR = ["RearVibe1", "SteelPlugR"];
var NO_RestraintVibes = ["TrapVibe", "TrapVibeProto", "MaidVibe"];

function NO_NakedEvents(): any[] {
	var events: any[] = [
		{ type: "damageResist", trigger: "tick", damage: "ice", power: -0.2 },
		{ type: "damageResist", trigger: "tick", damage: "tickle", power: -0.2 },
		{ type: "damageResist", trigger: "tick", damage: "grope", power: -0.2 },
		{ type: "damageResist", trigger: "tick", damage: "acid", power: 0.3 },
		{ type: "damageResist", trigger: "tick", damage: "soap", power: 0.3 },
	];
	if (NO_CFG.NakedOutfitBuffEvents) {
		events.push(
			{ type: "sneakBuff", trigger: "tick", power: -0.2 },
			{ type: "ManaCost", trigger: "calcEfficientMana", power: 0.1 }
		);
	}
	return events;
}

function NO_EnsureDressNone() {
	try {
		if (typeof KinkyDungeonDresses !== "undefined" && !KinkyDungeonDresses["None"]) {
			KinkyDungeonDresses["None"] = [];
		}
	} catch (_e) {}
}

function NO_RegisterOutfit() {
	NO_EnsureDressNone();
	try {
		if (typeof addTextKey === "function") {
			addTextKey("KinkyDungeonInventoryItemNone", "Naked");
			addTextKey("KinkyDungeonInventoryItemNoneDesc", "Strip off your clothing.");
			if (NO_CFG.NakedOutfitBuffEvents) {
				addTextKey(
					"KinkyDungeonInventoryItemNoneDesc2",
					"It feels a bit easier to manipulate mana this way. You feel exposed though..."
				);
			} else {
				addTextKey(
					"KinkyDungeonInventoryItemNoneDesc2",
					"In case you don't want to walk around in a prison gown. You feel vulnerable though..."
				);
			}
		}
	} catch (_e) {}

	try {
		if (typeof KDEventMapOutfit !== "undefined" && typeof KDEventMapInventory !== "undefined") {
			if (!KDEventMapOutfit.calcEfficientMana && KDEventMapInventory.calcEfficientMana) {
				KDEventMapOutfit.calcEfficientMana = KDEventMapInventory.calcEfficientMana;
			}
		}
	} catch (_e) {}

	var events = NO_NakedEvents();
	var patched = false;
	try {
		if (!KinkyDungeonOutfitsBase) (KinkyDungeonOutfitsBase as any) = [];
		for (var i = 0; i < KinkyDungeonOutfitsBase.length; i++) {
			if (KinkyDungeonOutfitsBase[i].name == "None") {
				KinkyDungeonOutfitsBase[i].events = events;
				KinkyDungeonOutfitsBase[i].dress = "None";
				patched = true;
				break;
			}
		}
		if (!patched) {
			KinkyDungeonOutfitsBase.push({
				name: "None",
				dress: "None",
				shop: false,
				rarity: 1,
				events: events,
			} as any);
		}
		if (typeof KinkyDungeonRefreshOutfitCache === "function") {
			KinkyDungeonRefreshOutfitCache();
		}
	} catch (_e) {
		console.log("[NakedOutfit] RegisterOutfit failed", _e);
	}
}

function NO_EnsureInventoryNone() {
	if (!NO_CFG.AddNakedOutfit) return;
	try {
		if (typeof KinkyDungeonInventory === "undefined" || !KinkyDungeonInventory) return;
		var outfitMap = KinkyDungeonInventory.get(Outfit);
		if (!outfitMap) return;
		if (!outfitMap.get("None")) {
			var entry = { name: "None", type: Outfit, id: KinkyDungeonGetItemID() };
			var next = new Map([["None", entry as any], ...Array.from(outfitMap.entries())]);
			KinkyDungeonInventory.set(Outfit, next);
		}
	} catch (_e) {}
}

function NO_WireInventory() {
	if (!NO_CFG.AddNakedOutfit) return;

	try {
		var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
		if (typeof KDInitInventory === "function") {
			var KDInitInventoryOriginal = KDInitInventory;
			g.KDInitInventory = function () {
				var ret = KDInitInventoryOriginal.apply(this, arguments as any);
				try {
					if (typeof KinkyDungeonInventoryAddOutfit === "function") {
						KinkyDungeonInventoryAddOutfit("None");
					}
				} catch (_e) {}
				return ret;
			};
		}
	} catch (_e) {}

	try {
		if (typeof KDEventMapGeneric !== "undefined") {
			if (!KDEventMapGeneric.tick) KDEventMapGeneric.tick = {};
			KDEventMapGeneric.tick["nakedOutfitEnsure"] = function (_e: any, _data: any) {
				NO_EnsureInventoryNone();
			};
		}
	} catch (_e) {}

	try {
		if (typeof KDInventoryAction !== "undefined" && KDInventoryAction.Drop && KDInventoryAction.Drop.valid) {
			var DropValidationOriginal = KDInventoryAction.Drop.valid;
			KDInventoryAction.Drop.valid = function (_player: any, item: any) {
				var ret = DropValidationOriginal(_player, item);
				if (item && item.type == Outfit && item.name == "None") return false;
				return ret;
			};
		}
	} catch (_e) {}

	try {
		if (typeof kdpixitex !== "undefined" && kdpixitex) {
			if (!kdpixitex.has("Game/Outfits/None.png") && kdpixitex.has("Game/Poses/Free.png")) {
				kdpixitex.set("Game/Outfits/None.png", kdpixitex.get("Game/Poses/Free.png"));
			}
		}
	} catch (_e) {}
}

function NO_RegisterToyModels() {
	if (!NO_CFG.EnableToys) return;
	try {
		if (typeof AddModel !== "function" || typeof ToLayerMap !== "function") return;

		if (typeof addTextKey === "function") {
			addTextKey("m_VibeToy", "VibeToy");
			addTextKey("m_VibeToy_l_Vibe", "Vibe");
			addTextKey("m_PussyToy", "PussyToy");
			addTextKey("m_PussyToy_l_Torso", "Skin");
			addTextKey("m_PussyToy_l_Vibe", "Vibe");
		}

		AddModel({
			Name: "VibeToy",
			Folder: "Toys",
			Parent: "VibeToy",
			TopLevel: true,
			Categories: ["Toys"],
			Layers: ToLayerMap([
				{
					Name: "VibeToy",
					Layer: "TorsoLower",
					Pri: -20,
					Invariant: true,
					InheritColor: "Vibe",
				},
			]),
		} as any);
		if (typeof GetModelRestraintVersion === "function") {
			AddModel(GetModelRestraintVersion("VibeToy", true));
		}

		AddModel({
			Name: "PussyToy",
			Folder: "Toys",
			Parent: "PussyToy",
			TopLevel: true,
			Categories: ["Toys"],
			Layers: ToLayerMap([
				{
					Name: "PussyToyBase",
					Layer: "TorsoLower",
					Pri: -30,
					Invariant: true,
					InheritColor: "Torso",
					MorphPoses: { Closed: "Closed", Hogtie: "Closed" },
				},
				{
					Name: "PussyToyToy",
					Layer: "TorsoLower",
					Pri: -29.9,
					Invariant: true,
					InheritColor: "Vibe",
					MorphPoses: { Closed: "Closed", Hogtie: "Closed" },
				},
			]),
		} as any);
		if (typeof GetModelRestraintVersion === "function") {
			AddModel(GetModelRestraintVersion("PussyToy", true));
		}

		var listV = NO_RestraintVibes;
		for (var vi = 0; vi < listV.length; vi++) {
			var rv = typeof KinkyDungeonGetRestraintByName === "function" ? KinkyDungeonGetRestraintByName(listV[vi]) : null;
			if (rv) rv.Model = "VibeToy";
		}
		var listF = NO_RestraintPlugsF;
		for (var fi = 0; fi < listF.length; fi++) {
			var rf = typeof KinkyDungeonGetRestraintByName === "function" ? KinkyDungeonGetRestraintByName(listF[fi]) : null;
			if (rf) rf.Model = "PussyToy";
		}
	} catch (_e) {
		console.log("[NakedOutfit] RegisterToyModels failed", _e);
	}
}

function NO_WireToySkin() {
	if (!NO_CFG.EnableToys) return;
	try {
		if (typeof KDEventMapGeneric === "undefined") return;
		if (!KDEventMapGeneric.postApply) KDEventMapGeneric.postApply = {};
		KDEventMapGeneric.postApply["nakedPussyToySkin"] = function (_e: any, data: any) {
			try {
				if (!data || !data.item || NO_RestraintPlugsF.indexOf(data.item.name) < 0) return;
				var skinColor: any = null;
				if (typeof KDCurrentModels !== "undefined" && KDCurrentModels.get) {
					var pm = KDCurrentModels.get(KinkyDungeonPlayer);
					if (pm && pm.Models && pm.Models.get) {
						var body = pm.Models.get("Body");
						if (body && body.Filters) skinColor = body.Filters.Torso;
					}
				}
				if (!skinColor) return;
				var item = typeof KDRestraint === "function" ? KDRestraint(data.item) : null;
				if (item) {
					if (!item.Filters) item.Filters = {};
					item.Filters.Torso = skinColor;
				}
			} catch (_err) {}
		};
	} catch (_e) {}
}

function NO_OverrideTextures(paths: string[]) {
	for (var i = 0; i < paths.length; i++) {
		var image = paths[i];
		try {
			if (typeof PIXI === "undefined" || !PIXI.Texture) continue;
			var tex = PIXI.Texture.from(image);
			if (tex && typeof kdpixitex !== "undefined" && kdpixitex && kdpixitex.get(image) != tex) {
				kdpixitex.set(image, tex);
			}
		} catch (_e) {}
	}
}

function NO_OnAtlasLoad(progress: number) {
	if (progress < 1) return;
	try {
		if (NO_CFG.ReplaceBody) {
			NO_OverrideTextures([
				"Models/Body/Torso.png",
				"Models/Body/TorsoSpread.png",
				"Models/Body/TorsoClosed.png",
			]);
		}
		if (NO_CFG.ReplaceNipples) {
			NO_OverrideTextures(["Models/Body/Nipples.png"]);
		}
	} catch (_e) {
		console.log("[NakedOutfit] OnAtlasLoad failed", _e);
	}
}

function NO_LoadBodyPlusAtlas() {
	if (!NO_CFG.ReplaceBody && !NO_CFG.ReplaceNipples) return;
	try {
		if (typeof PIXI === "undefined" || !PIXI.Assets || !PIXI.Assets.load) {
			NO_OnAtlasLoad(1);
			return;
		}
		PIXI.Assets.load(
			{
				src: "TextureAtlas/BodyPlus-0.json",
				loadParser: "modAtlasLoader",
			} as any,
			NO_OnAtlasLoad
		);
	} catch (_e) {
		console.log("[NakedOutfit] atlas load failed, trying direct override", _e);
		NO_OnAtlasLoad(1);
	}
}

function NO_Init() {
	if (!NO_CFG.AddNakedOutfit) {
		NO_RegisterToyModels();
		NO_WireToySkin();
		NO_LoadBodyPlusAtlas();
		return;
	}
	NO_RegisterOutfit();
	NO_WireInventory();
	NO_RegisterToyModels();
	NO_WireToySkin();
	NO_LoadBodyPlusAtlas();
	console.log("[NakedOutfit] Loaded: Naked outfit + BodyPlus + toys");
}

try {
	NO_Init();
} catch (e) {
	console.log("[NakedOutfit] Init error", e);
}
