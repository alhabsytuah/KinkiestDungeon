/**
 * RingGags Phase 4 — Plug / Unplug swap system
 * Loaded after RingGags.ts (global outFile). Uses RG_PlayUnplug, RG_RandInt,
 * RG_BallGagLink, RingGagEvents, RG_HasOnlyOpenGags from RingGags.ts.
 */
"use strict";

// =========================================================================
// Phase 4: Plug / Unplug (swap pairs)
// =========================================================================
// Plugged (base) <-> Open sibling. Unplug plays unplug.ogg; plug is silent.

var RG_SWAP_PAIRS: any = {
	CyberPlugGag: "CyberPlugGagOpen",
	GoodGirlGag: "GoodGirlGagOpen",
	MikoGag: "MikoGagOpen",
	PanelPlugGagHarness: "PanelPlugGagHarnessOpen",
	PanelPlugGag: "PanelPlugGagOpen",
	MaidMuzzle: "MaidMuzzleOpen",
	CableGag: "CableGagOpen",
	NylonCableGag: "NylonCableGagOpen",
	SteelMuzzleGag: "SteelMuzzleGagOpen",
	BlacksteelMuzzleGag: "BlacksteelMuzzleGagOpen",
};
var RG_SWAP_PAIRS_REVERSE: any = {};
(function () {
	for (var k in RG_SWAP_PAIRS) RG_SWAP_PAIRS_REVERSE[RG_SWAP_PAIRS[k]] = k;
})();

var RG_OPEN_MODEL_OVERRIDES: any = {
	CyberPlugGag: "CyberPlugGagOpenModel",
	GoodGirlGag: "GoodGirlGagOpenModel",
	MikoGag: "OrnamentalGagOpenModel",
	PanelPlugGagHarness: "PanelGagOpenHarnessModel",
	PanelPlugGag: "PanelGagOpenModel",
	MaidMuzzle: "PanelGagOpenModel",
	CableGag: "SmallLeatherPanelGagOpenModel",
	NylonCableGag: "SmallLeatherPanelGagOpenModel",
	SteelMuzzleGag: "SteelMuzzleOpenModel",
	BlacksteelMuzzleGag: "BlacksteelMuzzleOpenModel",
};

var RG_MSG_PLAYER_PLUG = [
	"You push the plug back into place. The drool is trapped again.",
	"You fit the plug back into the ring and seal it.",
	"Your hands fumble the plug home. The ring snaps shut around it.",
];
var RG_MSG_PLAYER_UNPLUG = [
	"You carefully extract the plug. Your mouth is held open.",
	"You work the plug free. The ring holds its shape without it.",
	"The plug slides out into your waiting fingers. The ring stays.",
];

var RG_DEBUFF_TEXT = "Your mouth is stretched open! Noise and drool escape with nothing to stop them...";

// Module flags (do not hang booleans on typed game objects)
var RG_InventoryActionsWrapped = false;
var RG_StruggleButtonsWrapped = false;
var RG_StruggleContextWrapped = false;
var RG_DebuffWrapped = false;
var RG_PlugSwapRegistered = false;

function RG_Pick(arr) {
	if (!arr || !arr.length) return "";
	return arr[RG_RandInt(0, arr.length - 1)];
}

function RG_GetSwapSibling(itemName) {
	if (!itemName) return null;
	return RG_SWAP_PAIRS[itemName] || RG_SWAP_PAIRS_REVERSE[itemName] || null;
}
function RG_IsSwapPair(item) {
	if (!item || !item.name) return false;
	return RG_SWAP_PAIRS[item.name] !== undefined || RG_SWAP_PAIRS_REVERSE[item.name] !== undefined;
}
function RG_IsPluggedVariant(name) {
	return !!RG_SWAP_PAIRS[name];
}
function RG_IsOpenVariant(name) {
	return !!RG_SWAP_PAIRS_REVERSE[name];
}

/** Mutate equipped item to its plug/open sibling in place. */
function RG_PerformSwap(item) {
	if (!item || !item.name) return false;
	var siblingName = RG_GetSwapSibling(item.name);
	if (!siblingName) return false;
	var siblingDef = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(siblingName)
		: null;
	if (!siblingDef) {
		if (typeof console !== "undefined" && console.warn)
			console.warn("[RingGags] RG_PerformSwap: sibling not found:", siblingName);
		return false;
	}

	var oldName = item.name;
	item.name = siblingName;

	try {
		if (typeof KinkyDungeonInventory !== "undefined" && typeof KDInventoryType === "function") {
			var invMap = KinkyDungeonInventory.get(KDInventoryType(item));
			if (invMap && invMap.has(oldName)) {
				invMap.delete(oldName);
				invMap.set(siblingName, item);
			}
		}
	} catch (_e) {}

	if (typeof KDGetEventsForRestraint === "function") {
		item.events = KDGetEventsForRestraint(siblingName);
	} else if (typeof KDRestraint === "function") {
		var newDef = KDRestraint(item);
		item.events = newDef && newDef.events ? Object.assign([], newDef.events) : [];
	}

	var def = (typeof KDRestraint === "function") ? KDRestraint(item) : null;
	if (def && def.DefaultLock && !item.lock
			&& RG_IsPluggedVariant(siblingName)
			&& typeof KinkyDungeonLock === "function") {
		try { KinkyDungeonLock(item, def.DefaultLock, true); } catch (_e2) {}
	}

	try {
		if (typeof KDUpdateItemEventCache !== "undefined") KDUpdateItemEventCache = true;
		if (typeof KDUpdateLinkCaches === "function") KDUpdateLinkCaches(item);
		if (typeof KDRefreshCharacter !== "undefined" && typeof KinkyDungeonPlayer !== "undefined")
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
		if (typeof KinkyDungeonDressPlayer === "function") KinkyDungeonDressPlayer();
		if (typeof CharacterRefresh === "function" && typeof KinkyDungeonPlayer !== "undefined")
			CharacterRefresh(KinkyDungeonPlayer);
		if (typeof KinkyDungeonUpdateStruggleGroups === "function") KinkyDungeonUpdateStruggleGroups();
	} catch (_e3) {}

	return true;
}

/** Clone base plug/muzzle gag into an Open sibling restraint def. */
function RG_AddOpenVariant(baseName, modelOverride) {
	var base = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(baseName)
		: null;
	if (!base) return false;
	var openName = RG_SWAP_PAIRS[baseName];
	if (!openName) return false;

	if (typeof KinkyDungeonGetRestraintByName === "function" && KinkyDungeonGetRestraintByName(openName))
		return true;

	var copy: any;
	try { copy = JSON.parse(JSON.stringify(base)); }
	catch (_e) { return false; }

	copy.name = openName;
	copy.inventory = true;
	copy.weight = 0;
	copy.inventoryAs = baseName;
	copy.inventoryAsSelf = baseName;
	copy.Model = modelOverride || "RingGag";
	copy.gag = 0.1;
	copy.gagFamily = baseName;
	copy.events = RingGagEvents.slice();

	if (!copy.LinkableBy) copy.LinkableBy = [];
	for (var li = 0; li < RG_BallGagLink.length; li++) {
		if (copy.LinkableBy.indexOf(RG_BallGagLink[li]) < 0)
			copy.LinkableBy.push(RG_BallGagLink[li]);
	}
	if (!copy.renderWhenLinked) copy.renderWhenLinked = [];
	for (var ri = 0; ri < RG_BallGagLink.length; ri++) {
		if (copy.renderWhenLinked.indexOf(RG_BallGagLink[ri]) < 0)
			copy.renderWhenLinked.push(RG_BallGagLink[ri]);
	}
	if (!copy.limitChance) copy.limitChance = {};
	if (!copy.limitChance.Struggle || copy.limitChance.Struggle < 0.15)
		copy.limitChance.Struggle = 0.15;
	if (!copy.shrine) copy.shrine = [];
	if (copy.shrine.indexOf("OpenGag") < 0) copy.shrine = copy.shrine.concat(["OpenGag"]);

	KinkyDungeonRestraints.push(copy);

	var baseKey = "Restraint" + baseName;
	var displayName = (typeof TextGet === "function") ? TextGet(baseKey) : openName;
	var desc = (typeof TextGet === "function") ? TextGet(baseKey + "Desc") : "";
	var desc2 = (typeof TextGet === "function") ? TextGet(baseKey + "Desc2") : "";
	if (displayName === baseKey || !displayName) displayName = openName;
	if (typeof KinkyDungeonAddRestraintText === "function") {
		KinkyDungeonAddRestraintText(openName, displayName + " (Open)", desc || "", desc2 || "The plug has been removed; the mouth stays open.");
	} else if (typeof addTextKey === "function") {
		addTextKey("Restraint" + openName, displayName + " (Open)");
		addTextKey("Restraint" + openName + "Desc", desc || "");
		addTextKey("Restraint" + openName + "Desc2", desc2 || "The plug has been removed; the mouth stays open.");
	}

	var baseAny: any = base;
	if (!baseAny.gagFamily) baseAny.gagFamily = baseName;
	return true;
}

function RG_RegisterOpenVariants() {
	if (typeof KinkyDungeonRestraints === "undefined") return;
	for (var baseName in RG_SWAP_PAIRS) {
		RG_AddOpenVariant(baseName, RG_OPEN_MODEL_OVERRIDES[baseName]);
	}
	if (typeof KinkyDungeonRefreshRestraintsCache === "function")
		KinkyDungeonRefreshRestraintsCache();
}

/** Execute player plug/unplug on an equipped item. */
function RG_DoPlayerPlugSwap(item) {
	if (!item || !RG_IsSwapPair(item)) return false;
	var wasPlugged = RG_IsPluggedVariant(item.name);
	var ok = RG_PerformSwap(item);
	if (!ok) return false;

	if (wasPlugged) RG_PlayUnplug();

	var msg = wasPlugged ? RG_Pick(RG_MSG_PLAYER_UNPLUG) : RG_Pick(RG_MSG_PLAYER_PLUG);
	if (typeof KinkyDungeonSendTextMessage === "function")
		KinkyDungeonSendTextMessage(5, msg, "#aac4ef", 3);

	if (typeof KinkyDungeonAdvanceTime === "function") KinkyDungeonAdvanceTime(1);
	return true;
}

function RG_RegisterPlugSwap() {
	if (RG_PlugSwapRegistered) return;
	RG_PlugSwapRegistered = true;

	if (typeof KDInventoryAction !== "undefined" && !KDInventoryAction["PlugSwap"]) {
		KDInventoryAction["PlugSwap"] = {
			hotkey: function () { return ""; },
			hotkeyPress: function () { return ""; },
			icon: function (_p, item) {
				if (RG_IsPluggedVariant(item.name)) return "InventoryAction/Unplug";
				return "InventoryAction/Plug";
			},
			label: function (_p, item) {
				if (RG_IsPluggedVariant(item.name)) return "Unplug";
				if (RG_IsOpenVariant(item.name)) return "Plug";
				return "Swap";
			},
			show: function (_p, item) {
				var cursed = (typeof KDGetCurse === "function") ? KDGetCurse(item) : (item && item.curse);
				return RG_IsSwapPair(item) && !cursed;
			},
			valid: function (_p, item) {
				if (typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound()) return false;
				if (typeof KinkyDungeonIsHandsBound === "function" && KinkyDungeonIsHandsBound()) return false;
				var r = KDRestraint(item);
				if (!r) return false;
				var sg = (typeof KinkyDungeonStruggleGroups !== "undefined" && KinkyDungeonStruggleGroups)
					? KinkyDungeonStruggleGroups.find(function (g) { return r.Group === g.group; })
					: null;
				return !(sg && sg.blocked);
			},
			click: function (_p, item) {
				var r = KDRestraint(item);
				if (!r) return;
				var sg = (typeof KinkyDungeonStruggleGroups !== "undefined" && KinkyDungeonStruggleGroups)
					? KinkyDungeonStruggleGroups.find(function (g) { return r.Group === g.group; })
					: null;
				if (!sg) {
					RG_DoPlayerPlugSwap(item);
					return;
				}
				var itemIndex = (typeof KDGetItemLinkIndex === "function") ? KDGetItemLinkIndex(item, false) : 0;
				if (itemIndex < 0) itemIndex = 0;
				if (typeof KDSendInput === "function")
					KDSendInput("plugSwap", { group: sg.group, index: itemIndex });
				else
					RG_DoPlayerPlugSwap(item);
			},
			cancel: function () { return false; },
		};
	}

	if (typeof KDInputTypes !== "undefined") {
		KDInputTypes["plugSwap"] = function (data: any): string {
			var item = (typeof KinkyDungeonGetRestraintItem === "function")
				? KinkyDungeonGetRestraintItem(data.group)
				: null;
			if (!item) return "";
			if (data.index && typeof KDDynamicLinkListSurface === "function") {
				var surfaceItems = KDDynamicLinkListSurface(item);
				if (surfaceItems && surfaceItems[data.index]) item = surfaceItems[data.index];
			}
			if (!item || !RG_IsSwapPair(item)) return "";
			RG_DoPlayerPlugSwap(item);
			return "";
		};
	}

	if (typeof KDInventoryActionsDefault !== "undefined" && KDInventoryActionsDefault.restraint && !RG_InventoryActionsWrapped) {
		var RG_OrigRestraintActions = KDInventoryActionsDefault.restraint;
		KDInventoryActionsDefault.restraint = function (item) {
			var ret = RG_OrigRestraintActions.call(this, item);
			try {
				if (item && RG_IsSwapPair(item) && Array.isArray(ret) && ret.indexOf("PlugSwap") < 0)
					ret.push("PlugSwap");
			} catch (_e) {}
			return ret;
		};
		RG_InventoryActionsWrapped = true;
	}

	if (typeof KDStruggleButtons !== "undefined" && !KDStruggleButtons.PlugSwap) {
		KDStruggleButtons.PlugSwap = function (data, i, query, _target, _entity) {
			var x = data.x, y = data.y, ButtonWidth = data.ButtonWidth,
				sg = data.sg, button_index = data.button_index, item = data.item;
			var isSwap = !!(item && RG_IsSwapPair(item));
			var curse = item && (typeof KDGetCurse === "function") ? KDGetCurse(item) : (item && item.curse);
			var handsFree = !(typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound())
				&& !(typeof KinkyDungeonIsHandsBound === "function" && KinkyDungeonIsHandsBound());
			var allowed = !!(isSwap && !curse && sg && !sg.blocked && handsFree);

			var action = function (_b) {
				if (!isSwap) return false;
				if (!handsFree) {
					if (typeof KinkyDungeonSendTextMessage === "function")
						KinkyDungeonSendTextMessage(6, "Your hands aren't free enough to manage the plug.", "#cc6680", 2);
					return true;
				}
				var itemIndex = (typeof KDStruggleGroupLinkIndex !== "undefined" && KDStruggleGroupLinkIndex && sg && KDStruggleGroupLinkIndex[sg.group])
					? KDStruggleGroupLinkIndex[sg.group] : 0;
				if (typeof KDSendInput === "function" && sg)
					KDSendInput("plugSwap", { group: sg.group, index: itemIndex });
				else
					RG_DoPlayerPlugSwap(item);
				return true;
			};

			if (query) {
				return {
					i: 7,
					allowed: allowed,
					image: item && RG_IsPluggedVariant(item.name) ? "InventoryAction/Unplug" : "InventoryAction/Plug",
					type: "PlugSwap",
					action: action,
				};
			}

			// Always advance slot index so layout stays consistent; only draw when swap pair
			if (isSwap && !curse && typeof DrawButtonKDEx === "function") {
				var iconName = RG_IsPluggedVariant(item.name) ? "Unplug" : "Plug";
				var root = (typeof KinkyDungeonRootDirectory !== "undefined") ? KinkyDungeonRootDirectory : "";
				var iconPath = root + "InventoryAction/" + iconName + ".png";
				var btnColor = allowed
					? ((typeof KDButtonColorIntense !== "undefined") ? KDButtonColorIntense : "#444444")
					: "rgba(255, 50, 50, 0.5)";
				var left = sg && sg.left;
				var bx = x + 495 - ButtonWidth + (left ? -(ButtonWidth) * i : (ButtonWidth) * i);
				if (DrawButtonKDEx(
					"sgPlugSwap" + button_index + (sg ? sg.group : ""),
					function (_b) { return action(_b); },
					true,
					bx, y, ButtonWidth, ButtonWidth, "",
					allowed ? ((typeof KDBaseWhite !== "undefined") ? KDBaseWhite : "#ffffff") : "#ff4444",
					iconPath, "",
					undefined, true, btnColor, undefined, undefined, { scaleImage: true }
				)) {
					if (data) data.StruggleType = RG_IsPluggedVariant(item.name) ? "PlugSwapUnplug" : "PlugSwapPlug";
				}
				i++;
			}
			return {
				i: i,
				allowed: allowed,
				type: "PlugSwap",
				image: item && RG_IsPluggedVariant(item.name) ? "InventoryAction/Unplug" : "InventoryAction/Plug",
			};
		};
	}

	// outFile shares one scope: must reassign the local function binding (not only globalThis).
	// @ts-expect-error TS2630 intentional monkey-patch of struggle button list
	if (typeof KDGetStruggleButtons === "function" && !RG_StruggleButtonsWrapped) {
		var RG_OrigGetStruggleButtons = KDGetStruggleButtons;
		// @ts-expect-error TS2630
		KDGetStruggleButtons = function (data) {
			var ret = RG_OrigGetStruggleButtons(data);
			if (!ret || !ret.length) return ret;
			if (ret.indexOf("ContextMenu") >= 0) return ret;
			if (ret.indexOf("PlugSwap") < 0) return ret.concat(["PlugSwap"]);
			return ret;
		};
		RG_StruggleButtonsWrapped = true;
	}

	// @ts-expect-error TS2630 intentional monkey-patch
	if (typeof KDGetStruggleContextMenu === "function" && !RG_StruggleContextWrapped) {
		var RG_OrigGetStruggleContextMenu = KDGetStruggleContextMenu;
		// @ts-expect-error TS2630
		KDGetStruggleContextMenu = function (item, sg, target, entity) {
			var ret = RG_OrigGetStruggleContextMenu(item, sg, target, entity);
			if (!ret) return ["PlugSwap"];
			if (ret.indexOf("PlugSwap") < 0) return ret.concat(["PlugSwap"]);
			return ret;
		};
		RG_StruggleContextWrapped = true;
	}

	if (typeof console !== "undefined" && console.log)
		console.log("[RingGags] PlugSwap inventory + struggle UI registered");
}

/** Open-gag status icon on Buffs & Stats (Game/Buffs/opengag_debuff.png). */
function RG_RegisterOpenGagDebuff() {
	if (typeof KDDrawBuffIcons !== "function" || RG_DebuffWrapped) return;
	var RG_OrigDrawBuffIcons = KDDrawBuffIcons;
	// @ts-expect-error TS2630 intentional monkey-patch
	KDDrawBuffIcons = function (minXX, minYY, statsDraw, side) {
		try {
			if (statsDraw && typeof RG_HasOnlyOpenGags === "function" && RG_HasOnlyOpenGags()) {
				statsDraw.rg_opengag = {
					text: RG_DEBUFF_TEXT,
					category: "status",
					icon: "opengag_debuff",
					color: (typeof KDBaseRed !== "undefined") ? KDBaseRed : "#ff4444",
					bgcolor: "#333333",
					priority: 6,
				};
			}
		} catch (_e) {}
		return RG_OrigDrawBuffIcons.call(this, minXX, minYY, statsDraw, side);
	};
	RG_DebuffWrapped = true;
	if (typeof console !== "undefined" && console.log)
		console.log("[RingGags] Open-gag debuff icon hooked");
}

// Deferred init: open variants need base restraints in cache.
(function RG_PlugInit() {
	var tries = 0;
	function tick() {
		if (typeof KinkyDungeonRestraints === "undefined" || !Array.isArray(KinkyDungeonRestraints)) {
			tries++;
			if (tries < 40 && typeof setTimeout === "function") setTimeout(tick, 250);
			return;
		}
		RG_RegisterOpenVariants();
		RG_RegisterPlugSwap();
		RG_RegisterOpenGagDebuff();
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
	else tick();
})();
