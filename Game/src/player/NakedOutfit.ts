/**
 * Naked Outfit — complete base-game port of Ilyasnow NakedOutfit v1.12
 *
 * Original mod files → this file + TextureAtlas/BodyPlus-0.{json,png}
 * Nothing left behind. See docs/NAKED_OUTFIT_PORT.md for full checklist.
 *
 * Original settings (mod UI) are hard NO_CFG flags below.
 * BodyPlus OVERWRITES the vanilla nude body (Torso*/Nipples) and supplies toy frames.
 *
 * Original never shipped loose Models/Toys/*.png — everything lives in the atlas.
 */
"use strict";

var NO_CFG = {
	AddNakedOutfit: true,
	NakedOutfitBuffEvents: true,
	ReplaceBody: true,
	ReplaceNipples: true,
	EnableToys: true,
};

// Original: RestraintPlugsF + RestraintVibes. (RestraintPlugsR was dead code in the mod.)
var NO_RestraintPlugsF = ["TrapPlug", "TrapPlug2", "TrapPlug3", "TrapPlug4", "TrapPlug5", "SteelPlugF"];
var NO_RestraintVibes = ["TrapVibe", "TrapVibeProto", "MaidVibe"];

var NO_BodyPlusApplied = false;
var NO_BodyPlusSheet: any = null;
var NO_BodyPlusTries = 0;

function NO_NakedEvents(): any[] {
	// Resist values copied from bikini outfit (identical to original)
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

	// Original: KDEventMapOutfit.calcEfficientMana = KDEventMapInventory.calcEfficientMana
	try {
		if (typeof KDEventMapOutfit !== "undefined" && typeof KDEventMapInventory !== "undefined") {
			var invMap: any = KDEventMapInventory;
			var outMap: any = KDEventMapOutfit;
			if (invMap.calcEfficientMana) {
				outMap.calcEfficientMana = invMap.calcEfficientMana;
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
			// Keep Naked first (original behaviour)
			var entry = { name: "None", type: Outfit, id: KinkyDungeonGetItemID() };
			var next = new Map([["None", entry as any], ...Array.from(outfitMap.entries())]);
			KinkyDungeonInventory.set(Outfit, next);
		}
	} catch (_e) {}
}

/** Original used only kdpixitex. Port also sets KDModFiles so resource loaders never 404. */
function NO_AliasNoneIcon() {
	try {
		var g: any = typeof globalThis !== "undefined" ? globalThis : window;
		if (typeof KDModFiles === "undefined" || !KDModFiles) {
			try {
				g.KDModFiles = {};
			} catch (_e) {}
		}
		if (typeof KDModFiles !== "undefined" && KDModFiles) {
			if (!KDModFiles["Game/Outfits/None.png"]) {
				KDModFiles["Game/Outfits/None.png"] =
					KDModFiles["Game/Poses/Free.png"] || "Game/Poses/Free.png";
			}
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

function NO_WireInventory() {
	if (!NO_CFG.AddNakedOutfit) return;

	NO_AliasNoneIcon();

	// Original: wrap KDInitInventory so every new inventory gets Naked
	try {
		var g: any = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
		if (typeof KDInitInventory === "function") {
			var KDInitInventoryOriginal = KDInitInventory;
			g.KDInitInventory = function () {
				var ret = KDInitInventoryOriginal.apply(this, arguments as any);
				try {
					NO_AliasNoneIcon();
					if (typeof KinkyDungeonInventoryAddOutfit === "function") {
						KinkyDungeonInventoryAddOutfit("None");
					}
				} catch (_e) {}
				return ret;
			};
		}
	} catch (_e) {}

	// Original tick: ensure Naked is present and first
	try {
		if (typeof KDEventMapGeneric !== "undefined") {
			if (!KDEventMapGeneric.tick) KDEventMapGeneric.tick = {};
			KDEventMapGeneric.tick["nakedOutfitEnsure"] = function (_e: any, _data: any) {
				NO_EnsureInventoryNone();
				NO_AliasNoneIcon();
				NO_EnsureNipplesVisible();
			};
		}
	} catch (_e) {}

	// Original: disable dropping
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

		// Exact layer definitions from original NakedOutfit.ks
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

		// Assign models to existing restraints (same list as original)
		for (var vi = 0; vi < NO_RestraintVibes.length; vi++) {
			var rv = typeof KinkyDungeonGetRestraintByName === "function" ? KinkyDungeonGetRestraintByName(NO_RestraintVibes[vi]) : null;
			if (rv) rv.Model = "VibeToy";
		}
		for (var fi = 0; fi < NO_RestraintPlugsF.length; fi++) {
			var rf = typeof KinkyDungeonGetRestraintByName === "function" ? KinkyDungeonGetRestraintByName(NO_RestraintPlugsF[fi]) : null;
			if (rf) rf.Model = "PussyToy";
		}
	} catch (_e) {
		console.log("[NakedOutfit] RegisterToyModels failed", _e);
	}
}

function NO_WireToySkin() {
	if (!NO_CFG.EnableToys) return;
	// Original: KDEventMapGeneric.postApply.PussyToySkin
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

/**
 * Original OverrideTextures used PIXI.Texture.from(path).
 * Because modAtlasLoader registers frame keys under those exact paths, it worked.
 * Port prefers the loaded sheet textures first, then falls back to PIXI.Texture.from.
 */
function NO_OverrideTextures(paths: string[]) {
	for (var i = 0; i < paths.length; i++) {
		var image = paths[i];
		try {
			var tex: any = null;

			if (NO_BodyPlusSheet) {
				var map: any = NO_BodyPlusSheet.textures;
				if (map && map[image]) tex = map[image];
				if (!tex && map) {
					var base = image.split("/").pop() || "";
					var keys = Object.keys(map);
					for (var ki = 0; ki < keys.length; ki++) {
						if (keys[ki] === image || keys[ki].endsWith("/" + base) || keys[ki] === base) {
							tex = map[keys[ki]];
							break;
						}
					}
				}
			}

			if (!tex && typeof PIXI !== "undefined" && PIXI.Texture) {
				try {
					tex = PIXI.Texture.from(image);
				} catch (_e) {
					tex = null;
				}
			}

			if (tex && typeof kdpixitex !== "undefined" && kdpixitex) {
				kdpixitex.set(image, tex);
				console.log("[NakedOutfit] overridden texture " + image);
			} else {
				console.log("[NakedOutfit] no texture for " + image);
			}
		} catch (e) {
			console.log("[NakedOutfit] Failed to get texture " + image, e);
		}
	}
}

function NO_EnsureNipplesVisible() {
	if (!NO_CFG.ReplaceNipples) return;
	try {
		if (typeof KDToggles !== "undefined" && KDToggles) {
			(KDToggles as any).Nipples = true;
		}
	} catch (_e) {}
	try {
		if (typeof KDCurrentModels !== "undefined" && KDCurrentModels.get && typeof KinkyDungeonPlayer !== "undefined") {
			var mc = KDCurrentModels.get(KinkyDungeonPlayer);
			if (mc && mc.Poses) {
				delete mc.Poses.HideNipples;
			}
		}
	} catch (_e) {}
}

function NO_RefreshPlayerDraw() {
	try {
		if (typeof KinkyDungeonPlayer !== "undefined" && KinkyDungeonPlayer) {
			if (typeof KDRefreshCharacter === "function") {
				KDRefreshCharacter(KinkyDungeonPlayer, true);
			}
			if (typeof DressPlayer === "function") {
				DressPlayer();
			} else if (typeof KinkyDungeonDressPlayer === "function") {
				KinkyDungeonDressPlayer();
			}
		}
	} catch (_e) {}
}

function NO_ApplyBodyPlusOverrides() {
	// Original OnAtlasLoad only overrode body + nipples.
	// Port also pushes the five toy frames into kdpixitex so model lookups never 404.
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
	if (NO_CFG.EnableToys) {
		NO_OverrideTextures([
			"Models/Toys/PussyToyBase.png",
			"Models/Toys/PussyToyBaseClosed.png",
			"Models/Toys/PussyToyToy.png",
			"Models/Toys/PussyToyToyClosed.png",
			"Models/Toys/VibeToy.png",
		]);
	}
	NO_EnsureNipplesVisible();
	NO_BodyPlusApplied = true;
	console.log("[NakedOutfit] BodyPlus overrides applied (vanilla nude body replaced)");
	NO_RefreshPlayerDraw();
}

function NO_OnAtlasLoad(progress?: number, sheet?: any) {
	if (typeof progress === "number" && progress < 1) return;
	if (sheet) NO_BodyPlusSheet = sheet;
	NO_ApplyBodyPlusOverrides();
}

/**
 * Original: PIXI.Assets.load({ src: "TextureAtlas/BodyPlus-0.json", loadParser: "modAtlasLoader" }, OnAtlasLoad)
 * Port keeps that path first, then falls back to plain spritesheet load.
 */
function NO_LoadBodyPlusAtlas() {
	if (!NO_CFG.ReplaceBody && !NO_CFG.ReplaceNipples && !NO_CFG.EnableToys) return;
	if (typeof PIXI === "undefined" || !PIXI.Assets || !PIXI.Assets.load) {
		console.log("[NakedOutfit] PIXI.Assets unavailable");
		return;
	}

	var url = "TextureAtlas/BodyPlus-0.json";
	NO_BodyPlusTries++;

	function onOk(sheet: any) {
		if (sheet) NO_BodyPlusSheet = sheet;
		NO_OnAtlasLoad(1, sheet);
	}

	function onFail(err: any) {
		console.log("[NakedOutfit] BodyPlus load attempt failed", err);
		if (NO_BodyPlusTries < 4) {
			setTimeout(function () {
				try {
					PIXI.Assets.load(url).then(onOk).catch(function (e2: any) {
						console.log(
							"[NakedOutfit] BodyPlus plain load failed — need TextureAtlas/BodyPlus-0.png next to JSON",
							e2
						);
					});
				} catch (_e) {}
			}, 600);
		}
	}

	// A: original modAtlasLoader
	try {
		var p1: any = PIXI.Assets.load(
			{ src: url, loadParser: "modAtlasLoader" } as any,
			function (progress: number) {
				NO_OnAtlasLoad(progress);
			}
		);
		if (p1 && typeof p1.then === "function") {
			p1.then(onOk).catch(function () {
				PIXI.Assets.load(url).then(onOk).catch(onFail);
			});
			return;
		}
	} catch (_e) {}

	// B: default spritesheet (vanilla disk)
	try {
		PIXI.Assets.load(url).then(onOk).catch(onFail);
	} catch (e) {
		onFail(e);
	}
}

/** Equivalent of original AfterModLoad() */
function NO_AfterModLoad() {
	NO_AliasNoneIcon();
	NO_RegisterOutfit();
	NO_WireInventory();
	NO_RegisterToyModels();
	NO_WireToySkin();
	NO_LoadBodyPlusAtlas();
	// Improvement over original: main atlas can overwrite kdpixitex after first pass
	setTimeout(function () {
		NO_AliasNoneIcon();
		if (!NO_BodyPlusApplied) NO_LoadBodyPlusAtlas();
		else NO_ApplyBodyPlusOverrides();
	}, 1500);
	setTimeout(function () {
		NO_AliasNoneIcon();
		if (NO_BodyPlusSheet) NO_ApplyBodyPlusOverrides();
		else if (!NO_BodyPlusApplied) NO_LoadBodyPlusAtlas();
	}, 4000);
}

try {
	NO_AfterModLoad();
	console.log("[NakedOutfit] complete vanilla port of Ilyasnow v1.12 loaded (BodyPlus overwrites vanilla nude body)");
} catch (e) {
	console.log("[NakedOutfit] init failed", e);
}
