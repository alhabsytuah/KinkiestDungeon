/**
 * RingGags Phase 4 — Plug / Unplug swap system
 * Loaded after RingGags.ts (global outFile).
 * Struggle UI PlugSwap lives in KDStruggleGroups.ts; this file owns swap logic,
 * open variants, inventory action, input type, and open-gag debuff.
 */
"use strict";

// =========================================================================
// Phase 4: Plug / Unplug (swap pairs)
// =========================================================================

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
	PanelPlugGagHarness: {
		title: "Harness Plug Gag (Open)",
		desc: "A harness gag meant to hold the mouth open after the plug is removed.",
		desc2: "The plug is gone; the harness still holds your jaws wide. Drool and noise escape freely.",
	},
	PanelPlugGag: {
		title: "Panel Plug Gag (Open)",
		desc: "A panel gag with the center plug removed, leaving the mouth exposed.",
		desc2: "Without the plug, the panel frames an open mouth. Speech and drool are no longer blocked.",
	},
	MaidMuzzle: {
		title: "Maid Muzzle (Open)",
		desc: "A maid-styled muzzle with the plug taken out.",
		desc2: "The frills remain, but nothing seals the mouth. You can breathe and drool freely.",
	},
	CableGag: {
		title: "Cable Gag (Open)",
		desc: "Cable straps around an open panel — plug removed.",
		desc2: "The cable still bites, but the mouth stays open and noisy.",
	},
	NylonCableGag: {
		title: "Nylon Cable Gag (Open)",
		desc: "Nylon cable panel gag with the plug removed.",
		desc2: "The straps stay tight; the opening stays empty.",
	},
	CyberPlugGag: {
		title: "Cyber Plug Gag (Open)",
		desc: "A cybernetic mouth panel with the insert ejected.",
		desc2: "Systems report an open airway. Drool sensors are active.",
	},
	GoodGirlGag: {
		title: "Good Girl Gag (Open)",
		desc: "The good-girl muzzle with its plug removed.",
		desc2: "You are still labeled, but your mouth is free to open and drip.",
	},
	MikoGag: {
		title: "Miko Gag (Open)",
		desc: "An ornamental gag with the plug removed.",
		desc2: "The ring and panel remain; nothing fills the mouth.",
	},
	SteelMuzzleGag: {
		title: "Steel Muzzle (Open)",
		desc: "A steel muzzle with the front left open.",
		desc2: "Cold metal frames an open mouth. Sound and spit escape the gap.",
	},
	BlacksteelMuzzleGag: {
		title: "Blacksteel Muzzle (Open)",
		desc: "A blacksteel muzzle with the plug removed.",
		desc2: "Dark metal still cages the face, but the mouth is unsealed.",
	},
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
function RG_IsPluggedVariant(name) {
	return !!RG_SWAP_PAIRS[name];
}
function RG_IsOpenVariant(name) {
	return !!RG_SWAP_PAIRS_REVERSE[name];
}

function RG_ForceCharacterRefresh() {
	// Soft refresh only — never throw into the main draw loop
	try {
		if (typeof KDUpdateItemEventCache !== "undefined") KDUpdateItemEventCache = true;
	} catch (_e0) {}
	try {
		if (typeof KDRefreshCharacter !== "undefined" && typeof KinkyDungeonPlayer !== "undefined" && KDRefreshCharacter && KDRefreshCharacter.set)
			KDRefreshCharacter.set(KinkyDungeonPlayer, true);
	} catch (_e1) {}
	try {
		if (typeof KinkyDungeonDressPlayer === "function") KinkyDungeonDressPlayer();
	} catch (_e2) {}
	try {
		if (typeof CharacterRefresh === "function" && typeof KinkyDungeonPlayer !== "undefined")
			CharacterRefresh(KinkyDungeonPlayer);
	} catch (_e3) {}
	try {
		if (typeof KinkyDungeonUpdateStruggleGroups === "function") KinkyDungeonUpdateStruggleGroups();
	} catch (_e4) {}
}

function RG_RegisterOpenVariantText(baseName, openName) {
	var pack = RG_OPEN_TEXT[baseName];
	var title = pack ? pack.title : (baseName + " (Open)");
	var desc = pack ? pack.desc : "";
	var desc2 = pack ? pack.desc2 : "The plug has been removed; the mouth stays open.";

	try {
		if (typeof TextGet === "function") {
			var bt = TextGet("Restraint" + baseName);
			var bd = TextGet("Restraint" + baseName + "Desc");
			var bd2 = TextGet("Restraint" + baseName + "Desc2");
			var isBad = function (s, key) {
				if (s == null || s === "" || s === key) return true;
				var str = String(s);
				if (str.indexOf("[NotFound]") >= 0) return true;
				if (str.indexOf("Restraint" + baseName) === 0) return true;
				return false;
		};
			if (!isBad(bt, "Restraint" + baseName)) title = bt + " (Open)";
			if (!isBad(bd, "Restraint" + baseName + "Desc")) desc = bd;
			if (!isBad(bd2, "Restraint" + baseName + "Desc2")) desc2 = bd2;
		}
	} catch (_e0) {}

	try {
		if (typeof KinkyDungeonDupeRestraintText === "function")
			KinkyDungeonDupeRestraintText(baseName, openName);
	} catch (_e1) {}
	try {
		if (typeof KinkyDungeonAddRestraintText === "function")
			KinkyDungeonAddRestraintText(openName, title, desc, desc2);
	} catch (_e2) {}
	try {
		if (typeof addTextKey === "function") {
			addTextKey("Restraint" + openName, title);
			addTextKey("Restraint" + openName + "Desc", desc);
			addTextKey("Restraint" + openName + "Desc2", desc2);
		}
	} catch (_e3) {}
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

	var wasPlugged = RG_IsPluggedVariant(item.name);
	var baseName = wasPlugged ? item.name : RG_SWAP_PAIRS_REVERSE[item.name];
	var openModel = baseName ? RG_OPEN_MODEL_OVERRIDES[baseName] : null;

	if (baseName && RG_IsOpenVariant(siblingName)) {
		try { RG_RegisterOpenVariantText(baseName, siblingName); } catch (_et) {}
		try {
			var sd: any = siblingDef;
			if (openModel) {
				sd.Model = openModel;
				sd.Asset = openModel;
			}
		} catch (_es) {}
	}

	var oldName = item.name;

	// ONLY change the restraint identity — never touch item.type (inventory category)
	item.name = siblingName;

	// Optional appearance hint only (do not set item.type)
	try {
		var itemAny: any = item;
		if (RG_IsOpenVariant(siblingName) && openModel) {
			itemAny.Model = openModel;
		} else if (RG_IsPluggedVariant(siblingName) && siblingDef) {
			var pluggedModel = (siblingDef as any).Model;
			if (pluggedModel) itemAny.Model = pluggedModel;
		}
	} catch (_em) {}

	// Remap inventory key if the map is keyed by name — keep the same object reference
	try {
		if (typeof KinkyDungeonInventory !== "undefined" && typeof KDInventoryType === "function") {
			var invType = KDInventoryType(item);
			var invMap = invType != null ? KinkyDungeonInventory.get(invType) : null;
			if (invMap && typeof invMap.has === "function") {
				if (invMap.has(oldName)) invMap.delete(oldName);
				if (!invMap.has(siblingName)) invMap.set(siblingName, item);
			}
		}
	} catch (_eInv) {
		if (typeof console !== "undefined" && console.warn)
			console.warn("[RingGags] inventory remap skipped:", _eInv);
	}

	try {
		if (typeof KDGetEventsForRestraint === "function") {
			item.events = KDGetEventsForRestraint(siblingName);
		} else if (typeof KDRestraint === "function") {
			var newDef = KDRestraint(item);
			item.events = newDef && newDef.events ? Object.assign([], newDef.events) : (item.events || []);
		}
	} catch (_ee) {}

	try {
		var def = (typeof KDRestraint === "function") ? KDRestraint(item) : null;
		if (def && (def as any).DefaultLock && !item.lock
				&& RG_IsPluggedVariant(siblingName)
				&& typeof KinkyDungeonLock === "function") {
			KinkyDungeonLock(item, (def as any).DefaultLock, true);
		}
	} catch (_elock) {}

	try {
		if (typeof KDUpdateLinkCaches === "function") KDUpdateLinkCaches(item);
	} catch (_elink) {}

	RG_ForceCharacterRefresh();
	return true;
}

function RG_AddOpenVariant(baseName, modelOverride) {
	var base = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(baseName)
		: null;
	if (!base) return false;
	var openName = RG_SWAP_PAIRS[baseName];
	if (!openName) return false;

	var existing = (typeof KinkyDungeonGetRestraintByName === "function")
		? KinkyDungeonGetRestraintByName(openName)
		: null;

	if (!existing) {
		var copy: any;
		try { copy = JSON.parse(JSON.stringify(base)); }
		catch (_e) { return false; }

		copy.name = openName;
		copy.inventory = true;
		copy.weight = 0;
		delete copy.inventoryAs;
		copy.inventoryAsSelf = openName;
		copy.Model = modelOverride || "PanelGagOpenModel";
		copy.Asset = modelOverride || openName;
		copy.gag = 0.1;
		copy.gagFamily = baseName;
		copy.events = (typeof RingGagEvents !== "undefined" && RingGagEvents)
			? RingGagEvents.slice()
			: (copy.events || []);

		if (!copy.LinkableBy) copy.LinkableBy = [];
		if (typeof RG_BallGagLink !== "undefined" && RG_BallGagLink) {
			for (var li = 0; li < RG_BallGagLink.length; li++) {
				if (copy.LinkableBy.indexOf(RG_BallGagLink[li]) < 0)
					copy.LinkableBy.push(RG_BallGagLink[li]);
			}
		}
		if (!copy.renderWhenLinked) copy.renderWhenLinked = [];
		if (typeof RG_BallGagLink !== "undefined" && RG_BallGagLink) {
			for (var ri = 0; ri < RG_BallGagLink.length; ri++) {
				if (copy.renderWhenLinked.indexOf(RG_BallGagLink[ri]) < 0)
					copy.renderWhenLinked.push(RG_BallGagLink[ri]);
			}
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
		if (modelOverride) {
			ex.Model = modelOverride;
			ex.Asset = modelOverride;
		}
		ex.inventoryAsSelf = openName;
		delete ex.inventoryAs;
		ex.gag = 0.1;
		if (!ex.shrine) ex.shrine = [];
		if (ex.shrine.indexOf("OpenGag") < 0) ex.shrine = ex.shrine.concat(["OpenGag"]);
	}

	RG_RegisterOpenVariantText(baseName, openName);
	return true;
}

function RG_RegisterOpenVariants() {
	if (typeof KinkyDungeonRestraints === "undefined") return;
	for (var baseName in RG_SWAP_PAIRS) {
		RG_AddOpenVariant(baseName, RG_OPEN_MODEL_OVERRIDES[baseName]);
	}
	if (typeof KinkyDungeonRefreshRestraintsCache === "function")
		KinkyDungeonRefreshRestraintsCache();

	try {
		if (typeof ModelDefs !== "undefined" && typeof console !== "undefined" && console.log) {
			var missing = [];
			for (var bn in RG_OPEN_MODEL_OVERRIDES) {
				var mn = RG_OPEN_MODEL_OVERRIDES[bn];
				if (!ModelDefs[mn]) missing.push(mn);
			}
			if (missing.length)
				console.warn("[RingGags] Open models missing from ModelDefs:", missing);
			else
				console.log("[RingGags] All open plug models present in ModelDefs");
		}
	} catch (_ed) {}
}

function RG_DoPlayerPlugSwap(item) {
	if (!item || !RG_IsSwapPair(item)) return false;
	var wasPlugged = RG_IsPluggedVariant(item.name);
	var ok = false;
	try {
		ok = RG_PerformSwap(item);
	} catch (err) {
		if (typeof console !== "undefined" && console.error)
			console.error("[RingGags] swap failed:", err);
		return false;
	}
	if (!ok) return false;

	try {
		if (wasPlugged && typeof RG_PlayUnplug === "function") RG_PlayUnplug();
	} catch (_ea) {}

	try {
		var msg = wasPlugged ? RG_Pick(RG_MSG_PLAYER_UNPLUG) : RG_Pick(RG_MSG_PLAYER_PLUG);
		if (typeof KinkyDungeonSendTextMessage === "function")
			KinkyDungeonSendTextMessage(5, msg, "#aac4ef", 3);
	} catch (_emsg) {}

	try {
		if (typeof KinkyDungeonAdvanceTime === "function") KinkyDungeonAdvanceTime(1);
	} catch (_et) {}
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
					var sg = (typeof KinkyDungeonStruggleGroups !== "undefined" && KinkyDungeonStruggleGroups)
						? KinkyDungeonStruggleGroups.find(function (g) { return r.Group === g.group; })
						: null;
					return !(sg && sg.blocked);
				} catch (_e) { return false; }
			},
			click: function (_p, item) {
				try {
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
				} catch (_e) {
					if (typeof console !== "undefined" && console.error)
						console.error("[RingGags] PlugSwap click error:", _e);
				}
			},
			cancel: function () { return false; },
		};
	}

	if (typeof KDInputTypes !== "undefined") {
		KDInputTypes["plugSwap"] = function (data: any): string {
			try {
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
			} catch (_e) {
				if (typeof console !== "undefined" && console.error)
					console.error("[RingGags] plugSwap input error:", _e);
			}
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

	if (typeof console !== "undefined" && console.log)
		console.log("[RingGags] PlugSwap logic + inventory action registered");
}

function RG_RegisterOpenGagDebuff() {
	if (typeof KDDrawBuffIcons !== "function" || RG_DebuffWrapped) return;
	var RG_OrigDrawBuffIcons = KDDrawBuffIcons;
	var g: any = (typeof globalThis !== "undefined") ? globalThis : (typeof window !== "undefined" ? window : {});
	g.KDDrawBuffIcons = function (minXX, minYY, statsDraw, side) {
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
		try {
			return RG_OrigDrawBuffIcons.call(this, minXX, minYY, statsDraw, side);
		} catch (_e2) {
			return null;
		}
	};
	RG_DebuffWrapped = true;
}

(function RG_PlugInit() {
	var tries = 0;
	function tick() {
		if (typeof KinkyDungeonRestraints === "undefined" || !Array.isArray(KinkyDungeonRestraints)) {
			tries++;
			if (tries < 40 && typeof setTimeout === "function") setTimeout(tick, 250);
			return;
		}
		try { RG_RegisterOpenVariants(); } catch (_e1) {}
		try { RG_RegisterPlugSwap(); } catch (_e2) {}
		try { RG_RegisterOpenGagDebuff(); } catch (_e3) {}
		if (typeof setTimeout === "function") {
			setTimeout(function () {
				try {
					for (var baseName in RG_SWAP_PAIRS)
						RG_RegisterOpenVariantText(baseName, RG_SWAP_PAIRS[baseName]);
				} catch (_e4) {}
			}, 1500);
		}
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
	else tick();
})();
