/**
 * Naked Outfit — base-game port (from Ilyasnow NakedOutfit v1.12)
 *
 * Behaviour matches the original mod:
 * - Always-available non-droppable "None" / Naked outfit
 * - Bikini-style exposure resists + sneak/mana tradeoffs
 * - BodyPlus torso/nipple override via TextureAtlas/BodyPlus-0.*
 * - Visible bottom toys (PussyToy / VibeToy)
 *
 * Loaded after KinkyDungeonDressList via tsconfig files[].
 */
"use strict";

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

var NO_BodyPlusApplied = false;
var NO_BodyPlusSheet: any = null;

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

	// Original mod: KDEventMapOutfit.calcEfficientMana = KDEventMapInventory.calcEfficientMana
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
			var entry = { name: "None", type: Outfit, id: KinkyDungeonGetItemID() };
			var next = new Map([["None", entry as any], ...Array.from(outfitMap.entries())]);
			KinkyDungeonInventory.set(Outfit, next);
		}
	} catch (_e) {}
}

function NO_WireInventory() {
	if (!NO_CFG.AddNakedOutfit) return;

	try {
		var g: any = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
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

/** Original-mod OverrideTextures — force kdpixitex from BodyPlus sheet / PIXI cache. */
function NO_OverrideTextures(paths: string[]) {
	for (var i = 0; i < paths.length; i++) {
		var image = paths[i];
		try {
			var tex: any = null;

			// Prefer frame from loaded BodyPlus spritesheet
			if (NO_BodyPlusSheet) {
				var map: any = NO_BodyPlusSheet.textures;
				if (!map && NO_BodyPlusSheet.linkedSheets) {
					try {
						var linked: any[] = Object.values(NO_BodyPlusSheet.linkedSheets);
						for (var li = 0; li < linked.length; li++) {
							if (linked[li] && linked[li].textures && linked[li].textures[image]) {
								map = linked[li].textures;
								break;
							}
						}
					} catch (_e) {}
				}
				if (map && map[image]) tex = map[image];
			}

			// Fallback: PIXI global cache (original mod path)
			if (!tex && typeof PIXI !== "undefined" && PIXI.Texture) {
				tex = PIXI.Texture.from(image);
			}

			if (tex && typeof kdpixitex !== "undefined" && kdpixitex) {
				kdpixitex.set(image, tex);
				console.log("[NakedOutfit] overridden texture " + image);
			}
		} catch (e) {
			console.log("[NakedOutfit] Failed to get texture " + image, e);
		}
	}
}

/** Nipples layer is hidden when KDToggles.Nipples is false (Poses.HideNipples). */
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
			}
		}
	} catch (_e) {}
}

/** Called when BodyPlus atlas is fully loaded (progress >= 1 or promise resolve). */
function NO_OnAtlasLoad(progress?: number, sheet?: any) {
	if (typeof progress === "number" && progress < 1) return;

	if (sheet) NO_BodyPlusSheet = sheet;

	// Original mod paths
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
	// Toys also live in the same atlas — register if present
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
	console.log("[NakedOutfit] BodyPlus applied (original OverrideTextures path)");
	NO_RefreshPlayerDraw();
}

/**
 * BodyPlus load — same idea as original:
 *   PIXI.Assets.load({ src: "TextureAtlas/BodyPlus-0.json", loadParser: "modAtlasLoader" }, OnAtlasLoad)
 * For vanilla disk files we also accept the default spritesheet parser.
 */
function NO_LoadBodyPlusAtlas() {
	if (!NO_CFG.ReplaceBody && !NO_CFG.ReplaceNipples && !NO_CFG.EnableToys) return;

	var url = "TextureAtlas/BodyPlus-0.json";

	function tryLoad() {
		if (typeof PIXI === "undefined" || !PIXI.Assets || !PIXI.Assets.load) {
			console.log("[NakedOutfit] PIXI.Assets unavailable");
			return;
		}

		// Prefer original modAtlasLoader when registered; else default spritesheet
		var loadArg: any = url;
		try {
			if (PIXI.extensions && typeof PIXI.extensions.getByName === "function") {
				// keep simple — object form with loadParser if mod parser exists
			}
			loadArg = { src: url, loadParser: "modAtlasLoader" };
		} catch (_e) {
			loadArg = url;
		}

		var p: any;
		try {
			// Signature: load(url, onProgress?) — progress callback like original
			p = PIXI.Assets.load(loadArg, function (progress: number) {
				NO_OnAtlasLoad(progress);
			});
		} catch (_e1) {
			try {
				p = PIXI.Assets.load(url);
			} catch (_e2) {
				console.log("[NakedOutfit] Assets.load failed", _e2);
				return;
			}
		}

		if (p && typeof p.then === "function") {
			p.then(
				function (sheet: any) {
					NO_OnAtlasLoad(1, sheet);
				},
				function (err: any) {
					console.log("[NakedOutfit] BodyPlus load failed (try without modAtlasLoader)", err);
					// Fallback: plain path load
					PIXI.Assets.load(url)
						.then(function (sheet2: any) {
							NO_OnAtlasLoad(1, sheet2);
						})
						.catch(function (e2: any) {
							console.log(
								"[NakedOutfit] BodyPlus failed — ensure TextureAtlas/BodyPlus-0.png sits next to BodyPlus-0.json",
								e2
							);
						});
				}
			);
		}
	}

	tryLoad();
	// Retry after main atlases (same timing idea as deferred game load)
	setTimeout(function () {
		if (!NO_BodyPlusApplied) tryLoad();
	}, 1200);
}

function NO_Init() {
	NO_RegisterOutfit();
	NO_WireInventory();
	NO_RegisterToyModels();
	NO_WireToySkin();
	NO_EnsureNipplesVisible();
	NO_LoadBodyPlusAtlas();
	console.log("[NakedOutfit] Loaded: Naked outfit + BodyPlus + toys (v1.12 parity)");
}

try {
	NO_Init();
} catch (e) {
	console.log("[NakedOutfit] Init error", e);
}
