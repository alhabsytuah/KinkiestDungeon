/**
 * RingGags Phase 4 — Plug / Unplug
 * Swap in-place by name only (never item.type). Model comes from restraint def.
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
	CableGag: { title: "Cable Gag (Open)", desc: "Cable panel, plug removed.", desc2: "Mouth stays open and noisy." },
	NylonCableGag: { title: "Nylon Cable Gag (Open)", desc: "Nylon cable panel, plug removed.", desc2: "Straps tight; opening empty." },
	CyberPlugGag: { title: "Cyber Plug Gag (Open)", desc: "Cyber panel, insert ejected.", desc2: "Open airway." },
	GoodGirlGag: { title: "Good Girl Gag (Open)", desc: "Good-girl muzzle, plug removed.", desc2: "Mouth free to open and drip." },
	MikoGag: { title: "Miko Gag (Open)", desc: "Ornamental gag, plug removed.", desc2: "Nothing fills the mouth." },
	SteelMuzzleGag: { title: "Steel Muzzle (Open)", desc: "Steel muzzle front open.", desc2: "Sound and spit escape." },
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

function RG_ForceCharacterRefresh() {
	try { if (typeof KDUpdateItemEventCache !== "undefined") KDUpdateItemEventCache = true; } catch (_e0) {}
	try {
		if (typeof KDRefreshCharacter !== "undefined" && KinkyDungeonPlayer && KDRefreshCharacter.set)
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	} catch (_e1) {}
	try { if (typeof KinkyDungeonDressPlayer === "function") KinkyDungeonDressPlayer(); } catch (_e2) {}
	try { if (typeof CharacterRefresh === "function") CharacterRefresh(KinkyDungeonPlayer); } catch (_e3) {}
	try { if (typeof KinkyDungeonUpdateStruggleGroups === "function") KinkyDungeonUpdateStruggleGroups(); } catch (_e4) {}
}

function RG_RegisterOpenVariantText(baseName, openName) {
	var pack = RG_OPEN_TEXT[baseName];
	var title = pack ? pack.title : (baseName + " (Open)");
	var desc = pack ? pack.desc : "";
	var desc2 = pack ? pack.desc2 : "The plug has been removed; the mouth stays open.";
	try {
		if (typeof TextGet === "function") {
			var bt = TextGet("Restraint" + baseName);
			if (bt && String(bt).indexOf("[NotFound]") < 0 && String(bt).indexOf("Restraint" + baseName) !== 0)
				title = bt + " (Open)";
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
	var siblingDef = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(siblingName) : null;
	if (!siblingDef) {
		if (typeof console !== "undefined" && console.warn)
			console.warn("[RingGags] sibling not found:", siblingName);
		return false;
	}

	var wasPlugged = RG_IsPluggedVariant(item.name);
	var baseName = wasPlugged ? item.name : RG_SWAP_PAIRS_REVERSE[item.name];
	var openModel = baseName ? RG_OPEN_MODEL_OVERRIDES[baseName] : null;

	if (baseName && RG_IsOpenVariant(siblingName)) {
		try { RG_RegisterOpenVariantText(baseName, siblingName); } catch (_et) {}
		try {
			var sd: any = siblingDef;
			if (openModel) { sd.Model = openModel; sd.Asset = openModel; }
		} catch (_es) {}
	}

	var oldName = item.name;
	// Identity only — never item.type (inventory category); never item.Model
	// (appearance uses KDRestraint(item).Model from the def)
	item.name = siblingName;
	try {
		var anyItem: any = item;
		if (anyItem.Model !== undefined) delete anyItem.Model;
	} catch (_em) {}

	try {
		if (typeof KinkyDungeonInventory !== "undefined" && typeof KDInventoryType === "function") {
			var invMap = KinkyDungeonInventory.get(KDInventoryType(item));
			if (invMap && typeof invMap.has === "function") {
				if (invMap.has(oldName)) invMap.delete(oldName);
				if (!invMap.has(siblingName)) invMap.set(siblingName, item);
			}
		}
	} catch (_eInv) {}

	try {
		if (typeof KDGetEventsForRestraint === "function")
			item.events = KDGetEventsForRestraint(siblingName);
		else if (typeof KDRestraint === "function") {
			var nd = KDRestraint(item);
			item.events = nd && nd.events ? Object.assign([], nd.events) : (item.events || []);
		}
	} catch (_ee) {}

	try {
		var def = (typeof KDRestraint === "function") ? KDRestraint(item) : null;
		if (def && (def as any).DefaultLock && !item.lock && RG_IsPluggedVariant(siblingName)
				&& typeof KinkyDungeonLock === "function")
			KinkyDungeonLock(item, (def as any).DefaultLock, true);
	} catch (_elock) {}

	try { if (typeof KDUpdateLinkCaches === "function") KDUpdateLinkCaches(item); } catch (_elink) {}
	RG_ForceCharacterRefresh();
	return true;
}

function RG_AddOpenVariant(baseName, modelOverride) {
	var base = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(baseName) : null;
	if (!base) return false;
	var openName = RG_SWAP_PAIRS[baseName];
	if (!openName) return false;
	var existing = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(openName) : null;

	if (!existing) {
		var copy: any;
		try { copy = JSON.parse(JSON.stringify(base)); } catch (_e) { return false; }
		copy.name = openName;
		copy.inventory = true;
		copy.weight = 0;
		// Drop as closed base when removed (original mod behavior)
		copy.inventoryAs = baseName;
		copy.inventoryAsSelf = baseName;
		copy.Model = modelOverride || "PanelGagOpenModel";
		copy.Asset = modelOverride || openName;
		copy.gag = 0.1;
		copy.gagFamily = baseName;
		copy.events = (typeof RingGagEvents !== "undefined" && RingGagEvents)
			? RingGagEvents.slice() : (copy.events || []);
		if (!copy.LinkableBy) copy.LinkableBy = [];
		if (typeof RG_BallGagLink !== "undefined" && RG_BallGagLink) {
			for (var li = 0; li < RG_BallGagLink.length; li++)
				if (copy.LinkableBy.indexOf(RG_BallGagLink[li]) < 0)
					copy.LinkableBy.push(RG_BallGagLink[li]);
		}
		if (!copy.limitChance) copy.limitChance = {};
		if (!copy.limitChance.Struggle || copy.limitChance.Struggle < 0.15)
			copy.limitChance.Struggle = 0.15;
		if (!copy.shrine) copy.shrine = [];
		if (copy.shrine.indexOf("OpenGag") < 0) copy.shrine = copy.shrine.concat(["OpenGag"]);
		KinkyDungeonRestraints.push(copy);
		var baseAny: any = base;
		if (!baseAny.gagFamily) baseAny.gagFamily = baseName;
	} else {
		var ex: any = existing;
		if (modelOverride) { ex.Model = modelOverride; ex.Asset = modelOverride; }
		ex.inventoryAs = baseName;
		ex.inventoryAsSelf = baseName;
		ex.gag = 0.1;
		if (!ex.shrine) ex.shrine = [];
		if (ex.shrine.indexOf("OpenGag") < 0) ex.shrine = ex.shrine.concat(["OpenGag"]);
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
		if (typeof console !== "undefined" && console.error) console.error("[RingGags] swap failed:", err);
		return false;
	}
	if (!ok) return false;
	try {
		if (wasPlugged) {
			if (typeof RG_PlayUnplug === "function") RG_PlayUnplug();
		} else {
			if (typeof RG_PlayGulp === "function") RG_PlayGulp();
		}
	} catch (_ea) {}
	try {
		var msg = wasPlugged ? RG_Pick(RG_MSG_PLAYER_UNPLUG) : RG_Pick(RG_MSG_PLAYER_PLUG);
		if (typeof KinkyDungeonSendTextMessage === "function")
			KinkyDungeonSendTextMessage(5, msg, "#aac4ef", 3);
	} catch (_emsg) {}
	try { if (typeof KinkyDungeonAdvanceTime === "function") KinkyDungeonAdvanceTime(1); } catch (_et) {}
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
				return RG_IsPluggedVariant(item.name) ? "InventoryAction/Unplug" : "InventoryAction/Plug";
			},
			label: function (_p, item) {
				if (RG_IsPluggedVariant(item.name)) return "Unplug";
				if (RG_IsOpenVariant(item.name)) return "Plug";
				return "Swap";
			},
			show: function (_p, item) {
				try {
					var cursed = (typeof KDGetCurse === "function") ? KDGetCurse(item) : (item && item.curse);
					return RG_IsSwapPair(item) && !cursed;
				} catch (_e) { return false; }
			},
			valid: function (_p, item) {
				try {
					if (typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound()) return false;
					if (typeof KinkyDungeonIsHandsBound === "function" && KinkyDungeonIsHandsBound()) return false;
					var r = KDRestraint(item);
					if (!r) return false;
					var sg = KinkyDungeonStruggleGroups
						? KinkyDungeonStruggleGroups.find(function (g) { return r.Group === g.group; }) : null;
					return !(sg && sg.blocked);
				} catch (_e) { return false; }
			},
			click: function (_p, item) {
				try {
					var r = KDRestraint(item);
					if (!r) return;
					var sg = KinkyDungeonStruggleGroups
						? KinkyDungeonStruggleGroups.find(function (g) { return r.Group === g.group; }) : null;
					if (!sg) { RG_DoPlayerPlugSwap(item); return; }
					var itemIndex = (typeof KDGetItemLinkIndex === "function") ? KDGetItemLinkIndex(item, false) : 0;
					if (itemIndex < 0) itemIndex = 0;
					if (typeof KDSendInput === "function")
						KDSendInput("plugSwap", { group: sg.group, index: itemIndex });
					else RG_DoPlayerPlugSwap(item);
				} catch (_e) {}
			},
			cancel: function () { return false; },
		};
	}

	if (typeof KDInputTypes !== "undefined") {
		KDInputTypes["plugSwap"] = function (data: any): string {
			try {
				var item = (typeof KinkyDungeonGetRestraintItem === "function")
					? KinkyDungeonGetRestraintItem(data.group) : null;
				if (!item) return "";
				if (data.index && typeof KDDynamicLinkListSurface === "function") {
					var surfaceItems = KDDynamicLinkListSurface(item);
					if (surfaceItems && surfaceItems[data.index]) item = surfaceItems[data.index];
				}
				if (item && RG_IsSwapPair(item)) RG_DoPlayerPlugSwap(item);
			} catch (_e) {}
			return "";
		};
	}

	if (typeof KDInventoryActionsDefault !== "undefined" && KDInventoryActionsDefault.restraint && !RG_InventoryActionsWrapped) {
		var orig = KDInventoryActionsDefault.restraint;
		KDInventoryActionsDefault.restraint = function (item) {
			var ret = orig.call(this, item);
			try {
				if (item && RG_IsSwapPair(item) && Array.isArray(ret) && ret.indexOf("PlugSwap") < 0)
					ret.push("PlugSwap");
			} catch (_e) {}
			return ret;
		};
		RG_InventoryActionsWrapped = true;
	}
}

function RG_RegisterOpenGagDebuff() {
	if (typeof KDDrawBuffIcons !== "function" || RG_DebuffWrapped) return;
	var orig = KDDrawBuffIcons;
	var g: any = (typeof globalThis !== "undefined") ? globalThis : (typeof window !== "undefined" ? window : {});
	g.KDDrawBuffIcons = function (minXX, minYY, statsDraw, side) {
		try {
			if (statsDraw && typeof RG_HasOnlyOpenGags === "function" && RG_HasOnlyOpenGags()) {
				statsDraw.rg_opengag = {
					text: RG_DEBUFF_TEXT, category: "status", icon: "opengag_debuff",
					color: (typeof KDBaseRed !== "undefined") ? KDBaseRed : "#ff4444",
					bgcolor: "#333333", priority: 6,
				};
			}
		} catch (_e) {}
		try { return orig.call(this, minXX, minYY, statsDraw, side); }
		catch (_e2) { return null; }
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
