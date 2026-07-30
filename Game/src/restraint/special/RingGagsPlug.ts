/**
 * RingGags Phase 4 — Plug / Unplug (UI-safe)
 * Mutate item.name + events; re-key inventory Map; struggle-panel + inventory actions.
 * Matches original RingGags mod behavior for player plug/unplug.
 * Open variants are NOT listed in restraint search / cheat inventory.
 */
"use strict";

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

var RG_OPEN_TEXT: any = {
	PanelPlugGagHarness: { title: "Harness Plug Gag (Open)", desc: "A harness gag with the plug removed.", desc2: "The harness still holds your jaws wide." },
	PanelPlugGag: { title: "Panel Plug Gag (Open)", desc: "A panel gag with the plug removed.", desc2: "The panel frames an open mouth." },
	MaidMuzzle: { title: "Maid Muzzle (Open)", desc: "Maid muzzle, plug removed.", desc2: "Nothing seals the mouth." },
	CableGag: { title: "Cable Gag (Open)", desc: "Cable panel, plug removed.", desc2: "Mouth stays open." },
	NylonCableGag: { title: "Nylon Cable Gag (Open)", desc: "Nylon cable panel, plug removed.", desc2: "Opening stays empty." },
	CyberPlugGag: { title: "Cyber Plug Gag (Open)", desc: "Cyber panel, insert ejected.", desc2: "Open airway." },
	GoodGirlGag: { title: "Good Girl Gag (Open)", desc: "Good-girl muzzle, plug removed.", desc2: "Mouth free to drip." },
	MikoGag: { title: "Miko Gag (Open)", desc: "Ornamental gag, plug removed.", desc2: "Nothing fills the mouth." },
	SteelMuzzleGag: { title: "Steel Muzzle (Open)", desc: "Steel muzzle front open.", desc2: "Sound escapes." },
	BlacksteelMuzzleGag: { title: "Blacksteel Muzzle (Open)", desc: "Blacksteel muzzle, plug removed.", desc2: "Mouth unsealed." },
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

var RG_InventoryActionsWrapped = false;
var RG_DebuffWrapped = false;
var RG_PlugSwapRegistered = false;
var RG_StruggleButtonsWrapped = false;
var RG_StruggleFnWrapped = false;
var RG_SuppressDifficultyText = false;

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
function RG_IsPluggedVariant(name) { return !!RG_SWAP_PAIRS[name]; }
function RG_IsOpenVariant(name) { return !!RG_SWAP_PAIRS_REVERSE[name]; }

function RG_GAny(): any {
	return typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
}

function RG_ScheduleRefresh() {
	try {
		if (typeof KDUpdateItemEventCache !== "undefined") KDUpdateItemEventCache = true;
	} catch (_e0) {}
	try {
		if (typeof KDRefreshCharacter !== "undefined" && typeof KinkyDungeonPlayer !== "undefined"
				&& KDRefreshCharacter && KDRefreshCharacter.set)
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	} catch (_e1) {}
	if (typeof setTimeout !== "function") return;
	setTimeout(function () {
		try {
			if (typeof KinkyDungeonDressPlayer === "function") KinkyDungeonDressPlayer();
		} catch (_e2) {}
		try {
			if (typeof KinkyDungeonUpdateStruggleGroups === "function")
				KinkyDungeonUpdateStruggleGroups();
		} catch (_e3) {}
	}, 0);
}

function RG_RegisterOpenVariantText(baseName, openName) {
	var pack = RG_OPEN_TEXT[baseName];
	var title = pack ? pack.title : baseName + " (Open)";
	var desc = pack ? pack.desc : "";
	var desc2 = pack ? pack.desc2 : "The plug has been removed; the mouth stays open.";
	try {
		if (typeof TextGet === "function") {
			var bt = TextGet("Restraint" + baseName);
			var s = bt != null ? String(bt) : "";
			if (s && s.indexOf("[NotFound]") < 0 && s.indexOf("Restraint" + baseName) !== 0)
				title = s + " (Open)";
		}
	} catch (_e0) {}
	try { if (typeof KinkyDungeonDupeRestraintText === "function") KinkyDungeonDupeRestraintText(baseName, openName); } catch (_e1) {}
	try { if (typeof KinkyDungeonAddRestraintText === "function") KinkyDungeonAddRestraintText(openName, title, desc, desc2); } catch (_e2) {}
	try {
		if (typeof addTextKey === "function") {
			addTextKey("Restraint" + openName, title);
			addTextKey("Restraint" + openName + "Desc", desc);
			addTextKey("Restraint" + openName + "Desc2", desc2);
		}
	} catch (_e3) {}
}

function RG_PerformSwap(item) {
	if (!item || !item.name) return false;
	var siblingName = RG_GetSwapSibling(item.name);
	if (!siblingName) return false;

	var siblingDef = typeof KinkyDungeonGetRestraintByName === "function"
		? KinkyDungeonGetRestraintByName(siblingName) : null;
	if (!siblingDef) {
		try { RG_RegisterOpenVariants(); } catch (_r) {}
		siblingDef = typeof KinkyDungeonGetRestraintByName === "function"
			? KinkyDungeonGetRestraintByName(siblingName) : null;
	}
	if (!siblingDef) {
		if (typeof console !== "undefined" && console.warn)
			console.warn("[RingGags] sibling not found:", siblingName);
		return false;
	}

	var wasPlugged = RG_IsPluggedVariant(item.name);
	var baseName = wasPlugged ? item.name : RG_SWAP_PAIRS_REVERSE[item.name];
	var openModel = baseName ? RG_OPEN_MODEL_OVERRIDES[baseName] : null;

	if (baseName && RG_IsOpenVariant(siblingName) && openModel) {
		try { (siblingDef as any).Model = openModel; } catch (_es) {}
		try { RG_RegisterOpenVariantText(baseName, siblingName); } catch (_et) {}
	}

	var oldName = item.name;
	item.name = siblingName;

	try {
		if (typeof KinkyDungeonInventory !== "undefined" && typeof KDInventoryType === "function") {
			var invMap = KinkyDungeonInventory.get(KDInventoryType(item));
			if (invMap && typeof invMap.has === "function" && invMap.has(oldName)) {
				invMap.delete(oldName);
				invMap.set(siblingName, item);
			}
		}
	} catch (_inv) {
		if (typeof console !== "undefined" && console.warn)
			console.warn("[RingGags] inventory re-key failed:", _inv);
	}

	try {
		var anyItem: any = item;
		if ("Model" in anyItem) delete anyItem.Model;
		if ("type" in anyItem && typeof anyItem.type === "string") {
			var bad = anyItem.type.indexOf("Model") >= 0
				|| anyItem.type.indexOf("Gag") >= 0
				|| anyItem.type.indexOf("Open") >= 0;
			if (bad) delete anyItem.type;
		}
	} catch (_em) {}

	try {
		if (typeof KDGetEventsForRestraint === "function")
			item.events = KDGetEventsForRestraint(siblingName);
		else if (typeof KDRestraint === "function") {
			var nd = KDRestraint(item);
			item.events = nd && nd.events ? Object.assign([], nd.events) : (item.events || []);
		}
	} catch (_ee) {}

	try {
		var def = typeof KDRestraint === "function" ? KDRestraint(item) : null;
		if (def && def.DefaultLock && !item.lock
				&& RG_IsPluggedVariant(siblingName)
				&& typeof KinkyDungeonLock === "function") {
			KinkyDungeonLock(item, def.DefaultLock, true);
		}
	} catch (_lk) {}

	try { if (typeof KDUpdateLinkCaches === "function") KDUpdateLinkCaches(item); } catch (_elink) {}

	if (typeof console !== "undefined" && console.log)
		console.log("[RingGags] swap", oldName, "->", siblingName,
			"Model=", siblingDef && (siblingDef as any).Model);

	RG_ScheduleRefresh();
	return true;
}

/**
 * Register open sibling restraint. Hidden from restraint browser / loot:
 * inventory:false, weight:0, empty enemyTags. Still valid as worn swap target.
 * inventoryAs / inventoryAsSelf = base so removal drops the closed gag.
 */
function RG_AddOpenVariant(baseName, modelOverride) {
	var base = typeof KinkyDungeonGetRestraintByName === "function"
		? KinkyDungeonGetRestraintByName(baseName) : null;
	if (!base) return false;
	var openName = RG_SWAP_PAIRS[baseName];
	if (!openName) return false;
	var existing = typeof KinkyDungeonGetRestraintByName === "function"
		? KinkyDungeonGetRestraintByName(openName) : null;

	if (!existing) {
		var copy: any;
		try { copy = JSON.parse(JSON.stringify(base)); } catch (_e) { return false; }
		copy.name = openName;
		// Hide from restraint search / cheat inventory / shops / loot rolls
		copy.inventory = false;
		copy.weight = 0;
		copy.enemyTags = {};
		copy.minLevel = 99;
		// When removed, drop as the closed (plugged) base — not as a free Open item
		copy.inventoryAs = baseName;
		copy.inventoryAsSelf = baseName;
		copy.Model = modelOverride || "PanelGagOpenModel";
		copy.gag = 0.1;
		try { copy.gagFamily = baseName; } catch (_gf) {}
		copy.events = (typeof RingGagEvents !== "undefined" && RingGagEvents)
			? RingGagEvents.slice() : (copy.events || []);
		if (!copy.limitChance) copy.limitChance = {};
		if (!copy.limitChance.Struggle || copy.limitChance.Struggle < 0.15)
			copy.limitChance.Struggle = 0.15;
		if (!copy.shrine) copy.shrine = [];
		if (copy.shrine.indexOf("OpenGag") < 0)
			copy.shrine = copy.shrine.concat(["OpenGag"]);
		delete copy.DefaultLock;
		KinkyDungeonRestraints.push(copy);
	} else {
		var ex: any = existing;
		if (modelOverride) ex.Model = modelOverride;
		ex.gag = 0.1;
		ex.inventory = false;
		ex.weight = 0;
		ex.enemyTags = {};
		ex.minLevel = 99;
		ex.inventoryAs = baseName;
		ex.inventoryAsSelf = baseName;
		if (!ex.shrine) ex.shrine = [];
		if (ex.shrine.indexOf("OpenGag") < 0)
			ex.shrine = ex.shrine.concat(["OpenGag"]);
	}
	RG_RegisterOpenVariantText(baseName, openName);
	return true;
}

function RG_RegisterOpenVariants() {
	if (typeof KinkyDungeonRestraints === "undefined") return;
	for (var baseName in RG_SWAP_PAIRS)
		RG_AddOpenVariant(baseName, RG_OPEN_MODEL_OVERRIDES[baseName]);
	if (typeof KinkyDungeonRefreshRestraintsCache === "function")
		KinkyDungeonRefreshRestraintsCache();
}

function RG_DoPlayerPlugSwap(item) {
	if (!item || !RG_IsSwapPair(item)) return false;
	var wasPlugged = RG_IsPluggedVariant(item.name);
	var ok = false;
	try { ok = RG_PerformSwap(item); }
	catch (err) {
		if (typeof console !== "undefined" && console.error)
			console.error("[RingGags] swap failed:", err);
		return false;
	}
	if (!ok) return false;
	try {
		if (wasPlugged) { if (typeof RG_PlayUnplug === "function") RG_PlayUnplug(); }
		else { if (typeof RG_PlayGulp === "function") RG_PlayGulp(); }
	} catch (_ea) {}
	try {
		var msg = wasPlugged ? RG_Pick(RG_MSG_PLAYER_UNPLUG) : RG_Pick(RG_MSG_PLAYER_PLUG);
		if (typeof KinkyDungeonSendTextMessage === "function")
			KinkyDungeonSendTextMessage(5, msg, "#aac4ef", 3);
	} catch (_emsg) {}
	try { if (typeof KinkyDungeonAdvanceTime === "function") KinkyDungeonAdvanceTime(1); } catch (_et) {}
	return true;
}

function RG_RegisterPlugSwapText() {
	try {
		if (typeof addTextKey === "function") {
			addTextKey("KDContextMenu_PlugSwap", "Plug / Unplug");
			addTextKey("KDInventoryActionPlugSwap", "Plug / Unplug");
			addTextKey("KDEscapePlugSwap", "");
			addTextKey("KDEscapePlugSwapPlug", "");
			addTextKey("KDEscapePlugSwapUnplug", "");
			addTextKey("KDItemStrugglePlugSwap", "Plug / Unplug (1 turn)");
			addTextKey("KDItemStrugglePlugSwapPlug", "Plug (1 turn)");
			addTextKey("KDItemStrugglePlugSwapUnplug", "Unplug (1 turn)");
			addTextKey("PlugSwapUnplug", "Unplug");
			addTextKey("PlugSwapPlug", "Plug");
		}
	} catch (_t) {}
}

function RG_RegisterStrugglePlugSwap() {
	if (RG_StruggleButtonsWrapped) return;
	RG_StruggleButtonsWrapped = true;

	if (typeof KDStruggleButtons !== "undefined") {
		KDStruggleButtons.PlugSwap = function (data: any, i: any, query: any, _target: any, _entity: any) {
			var x = data.x, y = data.y, ButtonWidth = data.ButtonWidth,
				sg = data.sg, button_index = data.button_index, item = data.item;
			var isSwap = item && RG_IsSwapPair(item);
			var curse = null;
			try {
				curse = item && (typeof KDGetCurse === "function") ? KDGetCurse(item) : (item && item.curse);
			} catch (_c) { curse = item && item.curse; }
			var handsFree = true;
			try {
				handsFree = !(typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound())
					&& !(typeof KinkyDungeonIsHandsBound === "function" && KinkyDungeonIsHandsBound());
			} catch (_h) {}
			var allowed = !!(isSwap && !curse && !(sg && sg.blocked) && handsFree);

			var action = function (_b: any) {
				if (!isSwap) return false;
				if (!handsFree) {
					if (typeof KinkyDungeonSendTextMessage === "function")
						KinkyDungeonSendTextMessage(6, "Your hands aren't free enough to manage the plug.", "#cc6680", 2);
					return true;
				}
				var itemIndex = 0;
				try {
					if (typeof KDStruggleGroupLinkIndex !== "undefined" && KDStruggleGroupLinkIndex
							&& sg && KDStruggleGroupLinkIndex[sg.group] != null)
						itemIndex = KDStruggleGroupLinkIndex[sg.group];
				} catch (_i) {}
				if (typeof KDSendInput === "function" && sg)
					KDSendInput("plugSwap", { group: sg.group, index: itemIndex });
				else if (item) RG_DoPlayerPlugSwap(item);
				return true;
			};

			if (query) {
				return {
					i: 7,
					allowed: allowed,
					image: (item && RG_IsPluggedVariant(item.name)) ? "InventoryAction/Unplug" : "InventoryAction/Plug",
					type: "PlugSwap",
					action: action,
				};
			}

			if (isSwap && !curse && typeof DrawButtonKDEx === "function") {
				var iconName = RG_IsPluggedVariant(item.name) ? "Unplug" : "Plug";
				var root = (typeof KinkyDungeonRootDirectory !== "undefined" && KinkyDungeonRootDirectory)
					? KinkyDungeonRootDirectory : "";
				var iconPath = root + "InventoryAction/" + iconName + ".png";
				var left = sg && sg.left;
				var bx = x + 495 - ButtonWidth + (left ? -(ButtonWidth) * i : (ButtonWidth) * i);
				var btnOpts: any = { scaleImage: true, centered: true };
				DrawButtonKDEx(
					"sgPlugSwap" + button_index + (sg ? sg.group : ""),
					function (_b) { return action(_b); },
					true,
					bx, y, ButtonWidth, ButtonWidth,
					"",
					allowed ? (typeof KDBaseWhite !== "undefined" ? KDBaseWhite : "#ffffff") : "#ff4444",
					iconPath, "", false, true,
					allowed ? (typeof KDButtonColorIntense !== "undefined" ? KDButtonColorIntense : undefined) : "rgba(255,50,50,0.5)",
					undefined, undefined,
					btnOpts
				);
				return { i: i + 1, allowed: allowed, type: "PlugSwap",
					image: RG_IsPluggedVariant(item.name) ? "InventoryAction/Unplug" : "InventoryAction/Plug" };
			}
			return { i: i, allowed: false, type: "PlugSwap" };
		};
	}

	var g = RG_GAny();
	if (typeof g.KDGetStruggleButtons === "function") {
		var RG_OrigGetStruggleButtons = g.KDGetStruggleButtons;
		g.KDGetStruggleButtons = function (data: any) {
			var ret = RG_OrigGetStruggleButtons(data);
			if (!Array.isArray(ret)) ret = [];
			if (ret.indexOf("ContextMenu") >= 0) return ret;
			if (ret.indexOf("PlugSwap") < 0) return ret.concat(["PlugSwap"]);
			return ret;
		};
	}

	if (typeof g.KDGetStruggleContextMenu === "function") {
		var RG_OrigGetStruggleContextMenu = g.KDGetStruggleContextMenu;
		g.KDGetStruggleContextMenu = function (item: any, sg: any, target: any, entity: any) {
			var ret = RG_OrigGetStruggleContextMenu(item, sg, target, entity);
			if (!Array.isArray(ret)) ret = [];
			if (ret.indexOf("PlugSwap") < 0) return ret.concat(["PlugSwap"]);
			return ret;
		};
	}
}

function RG_WrapStruggleQuery() {
	if (RG_StruggleFnWrapped) return;
	var g = RG_GAny();
	if (typeof g.KinkyDungeonStruggle !== "function") return;
	RG_StruggleFnWrapped = true;
	var RG_OrigStruggleFn = g.KinkyDungeonStruggle;
	g.KinkyDungeonStruggle = function (struggleGroup: any, StruggleType: any, index?: any, query?: any, retData?: any) {
		if (struggleGroup === "RingGagDroolFX" || struggleGroup === "RingGagBreathFX") {
			if (query && retData) {
				retData.escapeChance = -100;
				retData.limitChance = 1;
				retData.struggleTime = 99;
			}
			return false;
		}
		if (query && (StruggleType === "PlugSwap" || StruggleType === "PlugSwapPlug" || StruggleType === "PlugSwapUnplug")) {
			RG_SuppressDifficultyText = true;
			if (retData) {
				retData.origEscapeChance = 1;
				retData.escapeChance = 1;
				retData.lowEscapeChance = 1;
				retData.escapePenalty = 0;
				retData.extraLim = 0;
				retData.limitChance = 0;
				retData.origLimitChance = 0;
				retData.cost = 0;
				retData.cutBonus = 0;
				retData.cutVulnerability = 0;
			}
			return true;
		}
		return RG_OrigStruggleFn.apply(this, arguments as any);
	};
}

function RG_RegisterPlugSwap() {
	if (RG_PlugSwapRegistered) return;
	RG_PlugSwapRegistered = true;

	RG_RegisterPlugSwapText();
	RG_RegisterStrugglePlugSwap();
	RG_WrapStruggleQuery();

	if (typeof KDInventoryAction !== "undefined" && !KDInventoryAction["PlugSwap"]) {
		KDInventoryAction["PlugSwap"] = {
			hotkey: function () { return ""; },
			hotkeyPress: function () { return ""; },
			icon: function (_p, item) {
				return RG_IsPluggedVariant(item.name) ? "InventoryAction/Unplug" : "InventoryAction/Plug";
			},
			label: function (_p, item) {
				if (RG_IsPluggedVariant(item.name)) return "Unplug";
				if (RG_IsOpenVariant(item.name)) return "Plug";
				return "Swap";
			},
			show: function (_p, item) {
				try {
					var cursed = typeof KDGetCurse === "function" ? KDGetCurse(item) : (item && item.curse);
					return RG_IsSwapPair(item) && !cursed;
				} catch (_e) { return false; }
			},
			valid: function (_p, item) {
				try {
					if (typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound()) return false;
					if (typeof KinkyDungeonIsHandsBound === "function" && KinkyDungeonIsHandsBound()) return false;
					return true;
				} catch (_e) { return false; }
			},
			click: function (_p, item) {
				try {
					var r = typeof KDRestraint === "function" ? KDRestraint(item) : null;
					if (!r) { RG_DoPlayerPlugSwap(item); return; }
					var sg = (typeof KinkyDungeonStruggleGroups !== "undefined" && KinkyDungeonStruggleGroups)
						? KinkyDungeonStruggleGroups.find(function (g) { return r.Group === g.group; }) : null;
					if (!sg) { RG_DoPlayerPlugSwap(item); return; }
					var itemIndex = typeof KDGetItemLinkIndex === "function" ? KDGetItemLinkIndex(item, false) : 0;
					if (itemIndex < 0) itemIndex = 0;
					if (typeof KDSendInput === "function")
						KDSendInput("plugSwap", { group: sg.group, index: itemIndex });
					else RG_DoPlayerPlugSwap(item);
				} catch (_e) {
					try { RG_DoPlayerPlugSwap(item); } catch (_e2) {}
				}
			},
			cancel: function () { return false; },
		};
	}

	if (typeof KDInputTypes !== "undefined") {
		KDInputTypes["plugSwap"] = function (data: any): string {
			try {
				var item = typeof KinkyDungeonGetRestraintItem === "function"
					? KinkyDungeonGetRestraintItem(data.group) : null;
				if (!item) return "";
				if (data.index && typeof KDDynamicLinkListSurface === "function") {
					var surfaceItems = KDDynamicLinkListSurface(item);
					if (surfaceItems && surfaceItems[data.index]) item = surfaceItems[data.index];
				}
				if (typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound()) {
					if (typeof KinkyDungeonSendTextMessage === "function")
						KinkyDungeonSendTextMessage(6, "Your hands aren't free enough to manage the plug.", "#cc6680", 2);
					return "";
				}
				if (typeof KinkyDungeonIsHandsBound === "function" && KinkyDungeonIsHandsBound()) {
					if (typeof KinkyDungeonSendTextMessage === "function")
						KinkyDungeonSendTextMessage(6, "Your hands aren't free enough to manage the plug.", "#cc6680", 2);
					return "";
				}
				if (item && RG_IsSwapPair(item)) RG_DoPlayerPlugSwap(item);
			} catch (_e) {}
			return "";
		};
	}

	if (typeof KDInventoryActionsDefault !== "undefined" && KDInventoryActionsDefault.restraint && !RG_InventoryActionsWrapped) {
		var orig = KDInventoryActionsDefault.restraint;
		KDInventoryActionsDefault.restraint = function (item) {
			var ret: any;
			try { ret = orig.call(this, item); } catch (_e) { ret = []; }
			if (!Array.isArray(ret)) ret = [];
			try {
				if (item && RG_IsSwapPair(item) && ret.indexOf("PlugSwap") < 0)
					ret.push("PlugSwap");
			} catch (_e2) {}
			return ret;
		};
		RG_InventoryActionsWrapped = true;
	}
}

function RG_RegisterOpenGagDebuff() {
	if (typeof KDDrawBuffIcons !== "function" || RG_DebuffWrapped) return;
	var orig = KDDrawBuffIcons;
	var g = RG_GAny();
	g.KDDrawBuffIcons = function (minXX, minYY, statsDraw, side) {
		try {
			if (statsDraw && typeof RG_HasOnlyOpenGags === "function" && RG_HasOnlyOpenGags()) {
				statsDraw.rg_opengag = {
					text: RG_DEBUFF_TEXT, category: "status", icon: "opengag_debuff",
					color: typeof KDBaseRed !== "undefined" ? KDBaseRed : "#ff4444",
					bgcolor: "#333333", priority: 6,
				};
			}
		} catch (_e) {}
		return orig.call(this, minXX, minYY, statsDraw, side);
	};
	RG_DebuffWrapped = true;
}

(function RG_PlugInit() {
	var tries = 0;
	function tick() {
		if (typeof KinkyDungeonRestraints === "undefined" || !Array.isArray(KinkyDungeonRestraints)) {
			if (++tries < 40 && typeof setTimeout === "function") setTimeout(tick, 250);
			return;
		}
		try { RG_RegisterOpenVariants(); } catch (_e1) {}
		try { RG_RegisterPlugSwap(); } catch (_e2) {}
		try { RG_RegisterOpenGagDebuff(); } catch (_e3) {}
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
	else tick();
})();
