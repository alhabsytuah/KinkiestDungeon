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

/** Canonical display strings so we never depend on TextGet at boot. */
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

/** Write Restraint{name}, Desc, Desc2 into the live text table. */
function RG_SetRestraintTextKeys(restraintName, title, desc, desc2) {
	var t = title || restraintName;
	var d = desc || "";
	var d2 = desc2 || "The plug has been removed; the mouth stays open.";
	var keys = [
		["Restraint" + restraintName, t],
		["Restraint" + restraintName + "Desc", d],
		["Restraint" + restraintName + "Desc2", d2],
	];
	for (var i = 0; i < keys.length; i++) {
		var k = keys[i][0];
		var v = keys[i][1];
		try {
			if (typeof addTextKey === "function") addTextKey(k, v);
		} catch (_e0) {}
		try {
			if (typeof Text !== "undefined" && Text && typeof Text !== "function") {
				(Text as any)[k] = v;
			}
		} catch (_e1) {}
		try {
			var g: any = (typeof globalThis !== "undefined") ? globalThis : {};
			if (g.Text && typeof g.Text === "object") g.Text[k] = v;
			if (g.KDText && typeof g.KDText === "object") g.KDText[k] = v;
		} catch (_e2) {}
	}
	try {
		if (typeof KinkyDungeonAddRestraintText === "function")
			KinkyDungeonAddRestraintText(restraintName, t, d, d2);
	} catch (_e3) {}
}

function RG_RegisterOpenVariantText(baseName, openName) {
	var pack = RG_OPEN_TEXT[baseName];
	var title = pack ? pack.title : (openName + " (Open)");
	var desc = pack ? pack.desc : "";
	var desc2 = pack ? pack.desc2 : "The plug has been removed; the mouth stays open.";

	// Prefer live base strings when TextGet is ready and not a missing-key stub.
	try {
		if (typeof TextGet === "function") {
			var bt = TextGet("Restraint" + baseName);
			var bd = TextGet("Restraint" + baseName + "Desc");
			var bd2 = TextGet("Restraint" + baseName + "Desc2");
			var bad = function (s, key) {
				if (!s || s === key) return true;
				if (String(s).indexOf("[NotFound]") >= 0) return true;
				if (String(s).indexOf("Restraint" + baseName) === 0 && String(s).length < 64) return true;
				return false;
		};
			if (!bad(bt, "Restraint" + baseName))
				title = bt + " (Open)";
			if (!bad(bd, "Restraint" + baseName + "Desc"))
				desc = bd;
			if (!bad(bd2, "Restraint" + baseName + "Desc2"))
				desc2 = bd2 + (String(bd2).indexOf("plug") >= 0 ? "" : " The plug has been removed.");
		}
	} catch (_e) {}

	RG_SetRestraintTextKeys(openName, title, desc, desc2);
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

	// Ensure open-side text exists before UI refreshes
	if (RG_IsOpenVariant(siblingName)) {
		var baseForText = RG_SWAP_PAIRS_REVERSE[siblingName];
		if (baseForText) RG_RegisterOpenVariantText(baseForText, siblingName);
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

	var already = (typeof KinkyDungeonGetRestraintByName === "function")
		&& KinkyDungeonGetRestraintByName(openName);

	if (!already) {
		var copy: any;
		try { copy = JSON.parse(JSON.stringify(base)); }
		catch (_e) { return false; }

		copy.name = openName;
		copy.inventory = true;
		copy.weight = 0;
		// Keep collection/loot as the plugged form, but text keys use openName
		copy.inventoryAs = baseName;
		copy.inventoryAsSelf = openName;
		copy.Model = modelOverride || "RingGag";
		// Preview / asset: use open model name so icon path resolves cleanly when present
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
		// Refresh model pointer if defs already exist from an older session/build
		try {
			var existing: any = KinkyDungeonGetRestraintByName(openName);
			if (existing && modelOverride) {
				existing.Model = modelOverride;
				existing.Asset = modelOverride;
				existing.inventoryAsSelf = openName;
			}
		} catch (_e4) {}
	}

	// Always (re)register text so NotFound keys go away even if def pre-existed
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

	if (typeof console !== "undefined" && console.log)
		console.log("[RingGags] PlugSwap logic + inventory action registered (struggle UI in KDStruggleGroups)");
}

/** Open-gag status icon on Buffs & Stats (Game/Buffs/opengag_debuff.png). */
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
		return RG_OrigDrawBuffIcons.call(this, minXX, minYY, statsDraw, side);
	};
	RG_DebuffWrapped = true;
	if (typeof console !== "undefined" && console.log)
		console.log("[RingGags] Open-gag debuff icon hooked");
}

// Deferred init: open variants need base restraints in cache.
// Text is re-applied on a short delay so localization tables are loaded.
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
		// Second pass after text files usually finish loading
		if (typeof setTimeout === "function") {
			setTimeout(function () {
				for (var baseName in RG_SWAP_PAIRS)
					RG_RegisterOpenVariantText(baseName, RG_SWAP_PAIRS[baseName]);
			}, 1500);
		}
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
	else tick();
})();
