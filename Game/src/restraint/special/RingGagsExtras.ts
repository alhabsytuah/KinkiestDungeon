/**
 * RingGagsExtras — remaining original-mod systems not in core/Plug/Dialogue.
 * Load after RingGags.ts + RingGagsPlug.ts (uses RG_* globals).
 */
"use strict";

// =========================================================================
// Public API (other mods / debug)
// =========================================================================
var RingGagsAPI: any = {
	hasOpenMouth: function () {
		return typeof RG_HasOpenGag === "function" && RG_HasOpenGag();
	},
	hasOnlyOpenMouth: function () {
		return typeof RG_HasOnlyOpenGags === "function" && RG_HasOnlyOpenGags();
	},
	droolStage: function () {
		return (typeof RG_State !== "undefined" && RG_State) ? (RG_State.DroolStage || 0) : 0;
	},
	hasDroolLock: function () {
		return typeof RG_GetDroolLockItem === "function" && RG_GetDroolLockItem() !== null;
	},
};
try {
	if (typeof globalThis !== "undefined") (globalThis as any).RingGagsAPI = RingGagsAPI;
	else if (typeof window !== "undefined") (window as any).RingGagsAPI = RingGagsAPI;
} catch (_e) {}

// =========================================================================
// Helpers
// =========================================================================
function RG_XPick(arr: any[]): any {
	if (!arr || !arr.length) return null;
	return arr[Math.floor(Math.random() * arr.length)];
}
function RG_HasCriersRing(): boolean {
	if (typeof KinkyDungeonAllRestraintDynamic !== "function") return false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		if (rest.item && rest.item.name === "CriersRing") return true;
	}
	return false;
}
function RG_HasIncantorsMouthpiece(): boolean {
	if (typeof KinkyDungeonAllRestraintDynamic !== "function") return false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		if (rest.item && rest.item.name === "IncantorsMouthpiece") return true;
	}
	return false;
}
function RG_HasTongueTrap(): boolean {
	if (typeof KinkyDungeonAllRestraintDynamic !== "function") return false;
	for (var rest of KinkyDungeonAllRestraintDynamic()) {
		if (rest.item && rest.item.name === "TongueTrap") return true;
	}
	return false;
}
function RG_HasNoiseAmplifier(): boolean {
	return RG_HasCriersRing() || RG_HasIncantorsMouthpiece();
}
function RG_EnemyWithin1Tile(): boolean {
	if (typeof KDMapData === "undefined" || !KDMapData.Entities) return false;
	if (typeof KinkyDungeonPlayerEntity === "undefined") return false;
	var px = KinkyDungeonPlayerEntity.x, py = KinkyDungeonPlayerEntity.y;
	for (var i = 0; i < KDMapData.Entities.length; i++) {
		var en = KDMapData.Entities[i];
		if (!en || en.player) continue;
		if (typeof KDHostile === "function" && !KDHostile(en)) continue;
		if (Math.abs(en.x - px) <= 1 && Math.abs(en.y - py) <= 1) return true;
	}
	return false;
}
function RG_IsCyberGag(item: any): boolean {
	var def = (typeof KDRestraint === "function") ? KDRestraint(item) : null;
	return !!(def && def.shrine && def.shrine.indexOf("Cyber") >= 0);
}
function RG_IsCyberShorted(item: any): boolean {
	return !!(item && typeof KDItemDataQuery === "function" && KDItemDataQuery(item, "cyberShorted"));
}
function RG_IsCyberJammed(item: any): boolean {
	return !!(item && typeof KDItemDataQuery === "function" && KDItemDataQuery(item, "cyberJammed"));
}

// =========================================================================
// OpenGag shrine costs
// =========================================================================
if (typeof KDShrineBaseCost !== "undefined" && !KDShrineBaseCost["OpenGag"])
	KDShrineBaseCost["OpenGag"] = 20;
if (typeof KDShrineBaseCount !== "undefined" && !KDShrineBaseCount["OpenGag"])
	KDShrineBaseCount["OpenGag"] = 1;

// =========================================================================
// DroolLock custom curse
// =========================================================================
var RG_MSG_DROOLLOCK_S4_1 = "The sigil flickers once. A single drop of wet light escapes its edge.";
var RG_MSG_DROOLLOCK_S4_2 = "The sigil flickers again, fainter. The pattern is weakening.";

if (typeof KDCurses !== "undefined") {
	KDCurses["DroolLock"] = {
		powerMult: 2.5,
		lock: true,
		noShrine: true,
		activatecurse: true,
		level: 5,
		weight: function (item: any) {
			var r = typeof KDRestraint === "function" ? KDRestraint(item) : null;
			if (!r || !r.shrine) return 0;
			if (r.shrine.indexOf("OpenGag") >= 0) return 125;
			if (r.shrine.indexOf("PlugGags") >= 0) return 125;
			return 0;
		},
		condition: function (item: any) {
			return (typeof KDItemDataQuery === "function"
				? (KDItemDataQuery(item, "droolLockS4Count") || 0) : 0) >= 3;
		},
		onApply: function (item: any, _host: any) {
			if (typeof KDItemDataSet === "function") KDItemDataSet(item, "droolLockS4Count", 0);
			if (typeof RG_State !== "undefined" && RG_State) {
				if (!RG_State.DroolStage || RG_State.DroolStage < 2) {
					RG_State.DroolStage = 2;
					var du = (typeof RG_DURATIONS !== "undefined" && RG_DURATIONS["2"])
						? RG_DURATIONS["2"] : [10, 20];
					RG_State.DroolDuration = (typeof RG_RandInt === "function")
						? RG_RandInt(du[0], du[1]) : 15;
					if (typeof RG_SetDroolOverlay === "function") RG_SetDroolOverlay(2);
				}
			}
		},
		remove: function (_item: any, _host: any) {},
		entityCanUnlock: function (entity: any, _player: any, _data: any) {
			return typeof KDHelpless === "function" && !KDHelpless(entity)
				&& entity.Enemy && entity.Enemy.Security && entity.Enemy.Security.level_magic >= 2;
		},
		entityDoUnlock: function (_entity: any, _player: any, _data: any) { return true; },
	};
}
if (typeof KDCurseUnlockList !== "undefined" && KDCurseUnlockList.Common) {
	if (KDCurseUnlockList.Common.indexOf("DroolLock") < 0)
		KDCurseUnlockList.Common.push("DroolLock");
}

// DroolLock S4 progress messages (hook tick via wrapping)
(function RG_HookDroolLockS4() {
	if (typeof KDEventMapInventory === "undefined") return;
	var orig = KDEventMapInventory["tick"] && KDEventMapInventory["tick"]["ringGagEffects"];
	if (!orig || (orig as any)._rgDroolLockHooked) return;
	KDEventMapInventory["tick"]["ringGagEffects"] = function (e: any, item: any, data: any) {
		var prevStage = (typeof RG_State !== "undefined" && RG_State) ? RG_State.DroolStage : 0;
		orig(e, item, data);
		try {
			var lockItem = typeof RG_GetDroolLockItem === "function" ? RG_GetDroolLockItem() : null;
			if (!lockItem || typeof KDItemDataQuery !== "function" || typeof KDItemDataSet !== "function") return;
			var stage = RG_State ? RG_State.DroolStage : 0;
			// Count each transition into S4
			if (stage === 4 && prevStage !== 4) {
				var s4 = (KDItemDataQuery(lockItem, "droolLockS4Count") || 0) + 1;
				KDItemDataSet(lockItem, "droolLockS4Count", s4);
				if (typeof KinkyDungeonSendTextMessage === "function") {
					if (s4 === 1) KinkyDungeonSendTextMessage(6, RG_MSG_DROOLLOCK_S4_1, "#aac4ef", 3);
					else if (s4 === 2) KinkyDungeonSendTextMessage(6, RG_MSG_DROOLLOCK_S4_2, "#aac4ef", 3);
					else if (s4 >= 3) {
						var unlockMsg = (typeof TextGet === "function")
							? TextGet("KinkyDungeonCurseUnlockDroolLock") : "The wet sigil fades.";
						if (typeof KinkyDungeonSendActionMessage === "function")
							KinkyDungeonSendActionMessage(8, unlockMsg, "#99FF99", 4);
						else KinkyDungeonSendTextMessage(8, unlockMsg, "#99FF99", 4);
						if (typeof KDSetCurse === "function") KDSetCurse(lockItem, "", true);
					}
				}
			}
		} catch (_ex) {}
	};
	(KDEventMapInventory["tick"]["ringGagEffects"] as any)._rgDroolLockHooked = true;
})();

// DroolLock UI text
(function () {
	if (typeof addTextKey !== "function") return;
	addTextKey("KinkyDungeonCurseInfoDroolLock",
		"The gag drips with a wet sigil. Endure peak drool three times without wiping to weaken the curse.");
	addTextKey("KinkyDungeonCurseStruggleDroolLock",
		"The sigil weeps as you pull. The curse drinks your struggle and holds tighter.");
	addTextKey("KinkyDungeonCurseUnlockDroolLock",
		"The wet sigil runs clear one last time, then fades to dry stone. The curse has exhausted itself.");
})();

// =========================================================================
// Crier's Ring — random curse on equip
// =========================================================================
var RG_CRIERS_CURSE_POOL = [
	{ curse: "Key", weight: 3 },
	{ curse: "BlueLock", weight: 3 },
	{ curse: "Will", weight: 3 },
	{ curse: "Mana", weight: 3 },
	{ curse: "ShrineWill", weight: 2 },
	{ curse: "ShrineElements", weight: 2 },
	{ curse: "ShrineConjure", weight: 2 },
	{ curse: "ShrineIllusion", weight: 2 },
	{ curse: "TakeDamageFire", weight: 2 },
	{ curse: "TakeDamageIce", weight: 2 },
	{ curse: "TakeDamageElectric", weight: 2 },
	{ curse: "TakeDamageGlue", weight: 2 },
	{ curse: "TakeDamageChain", weight: 2 },
];
function RG_PickCriersCurse(): string {
	var total = 0;
	for (var i = 0; i < RG_CRIERS_CURSE_POOL.length; i++) total += RG_CRIERS_CURSE_POOL[i].weight;
	var roll = Math.random() * total, acc = 0;
	for (var j = 0; j < RG_CRIERS_CURSE_POOL.length; j++) {
		acc += RG_CRIERS_CURSE_POOL[j].weight;
		if (roll < acc) return RG_CRIERS_CURSE_POOL[j].curse;
	}
	return RG_CRIERS_CURSE_POOL[0].curse;
}
if (typeof KDEventMapInventory !== "undefined") {
	KDEventMapInventory["postApply"] = KDEventMapInventory["postApply"] || {};
	KDEventMapInventory["postApply"]["criersRingCurse"] = function (_e: any, item: any, data: any) {
		if (!item || item.name !== "CriersRing") return;
		if (data && data.item && data.item !== item) return;
		if (typeof KDGetCurse === "function" && KDGetCurse(item)) return;
		var curseName = RG_PickCriersCurse();
		if (typeof KDSetCurse === "function") KDSetCurse(item, curseName, true);
	};
}

// Ensure CriersRing restraint has the postApply event
(function RG_EnsureCriersEvent() {
	function tryPatch() {
		if (typeof KinkyDungeonGetRestraintByName !== "function") return false;
		var def = KinkyDungeonGetRestraintByName("CriersRing");
		if (!def) return false;
		if (!def.events) def.events = [];
		var has = false;
		for (var i = 0; i < def.events.length; i++) {
			if (def.events[i].type === "criersRingCurse") { has = true; break; }
		}
		if (!has) def.events.push({ trigger: "postApply", type: "criersRingCurse", inheritLinked: true });
		return true;
	}
	var n = 0;
	function tick() {
		if (tryPatch()) return;
		if (++n < 40 && typeof setTimeout === "function") setTimeout(tick, 250);
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
})();

// =========================================================================
// Incantor's Mouthpiece — Verbal ignore + damage near enemies
// =========================================================================
if (typeof KDSpellComponentTypes !== "undefined" && KDSpellComponentTypes.Verbal) {
	var RG_OrigVerbalIgnore = KDSpellComponentTypes.Verbal.ignore;
	var RG_OrigVerbalCheck = KDSpellComponentTypes.Verbal.check;
	var RG_OrigVerbalPartial = KDSpellComponentTypes.Verbal.partialMiscastChance;
	KDSpellComponentTypes.Verbal.ignore = function (spell: any, x: any, y: any) {
		try {
			if (RG_HasIncantorsMouthpiece() && RG_EnemyWithin1Tile()) return true;
		} catch (_e) {}
		return RG_OrigVerbalIgnore ? RG_OrigVerbalIgnore.call(this, spell, x, y) : false;
	};
	KDSpellComponentTypes.Verbal.check = function (spell: any, x: any, y: any) {
		try {
			if (RG_HasIncantorsMouthpiece() && RG_EnemyWithin1Tile()) return true;
		} catch (_e) {}
		return RG_OrigVerbalCheck ? RG_OrigVerbalCheck.call(this, spell, x, y) : true;
	};
	if (typeof RG_OrigVerbalPartial === "function") {
		KDSpellComponentTypes.Verbal.partialMiscastChance = function (spell: any, x: any, y: any) {
			try {
				if (RG_HasIncantorsMouthpiece() && RG_EnemyWithin1Tile()) return 0;
			} catch (_e) {}
			return RG_OrigVerbalPartial.call(this, spell, x, y);
		};
	}
}

// +60% verbal damage when adjacent (via SendEvent wrap)
var RG_PendingAutoSwap: any[] = [];
function RG_QueueAutoSwap(item: any) {
	if (!item) return;
	for (var i = 0; i < RG_PendingAutoSwap.length; i++)
		if (RG_PendingAutoSwap[i] === item) return;
	RG_PendingAutoSwap.push(item);
	if (typeof setTimeout !== "function") return;
	setTimeout(function () {
		while (RG_PendingAutoSwap.length > 0) {
			var queued = RG_PendingAutoSwap.shift();
			var still = false;
			if (typeof KinkyDungeonAllRestraintDynamic === "function") {
				for (var rest of KinkyDungeonAllRestraintDynamic()) {
					if (rest.item === queued) { still = true; break; }
				}
			}
			if (!still) continue;
			if (typeof RG_IsPluggedVariant === "function" && !RG_IsPluggedVariant(queued.name)) continue;
			if (typeof RG_PerformSwap === "function") RG_PerformSwap(queued);
		}
	}, 0);
}

if (typeof KinkyDungeonSendEvent === "function") {
	var RG_OrigSendEvent = KinkyDungeonSendEvent;
	KinkyDungeonSendEvent = function (Event: any, data: any, forceSpell?: any, forceWeapon?: any, mapData?: any) {
		// Incantor damage boost
		if (Event === "beforeDamageEnemy" && data && data.spell
				&& data.faction === "Player"
				&& data.spell.components && data.spell.components.indexOf("Verbal") >= 0
				&& RG_HasIncantorsMouthpiece() && RG_EnemyWithin1Tile()) {
			if (typeof data.dmg === "number") data.dmg *= 1.6;
		}
		var result = RG_OrigSendEvent.apply(this, arguments as any);

		// 50% auto-unplug on equip for plugged swap pairs
		if (Event === "postApply" && data && data.item && data.player && data.player.player) {
			var appliedName = data.item.name;
			var willAuto = !data.UnLink
				&& typeof RG_IsPluggedVariant === "function" && RG_IsPluggedVariant(appliedName)
				&& Math.random() < 0.5;
			if (willAuto) RG_QueueAutoSwap(data.item);
		}

		// Cyber lockout jam
		if (Event === "lockout") {
			if (typeof KinkyDungeonAllRestraintDynamic === "function") {
				for (var rest of KinkyDungeonAllRestraintDynamic()) {
					if (rest.item && typeof RG_IsSwapPair === "function" && RG_IsSwapPair(rest.item)
							&& RG_IsCyberGag(rest.item) && typeof KDItemDataSet === "function") {
						KDItemDataSet(rest.item, "cyberJammed", true);
						if (typeof KinkyDungeonSendTextMessage === "function")
							KinkyDungeonSendTextMessage(8,
								"Security lockout is engaged. The plug mechanism is disabled.", "#ff4444", 3);
					}
				}
			}
		}
		if (Event === "calcLockout" && data) {
			if ((data.chance || 0) + (data.bonus || 0) < 0.99) {
				if (typeof KinkyDungeonAllRestraintDynamic === "function") {
					for (var rest2 of KinkyDungeonAllRestraintDynamic()) {
						if (rest2.item && typeof KDItemDataQuery === "function"
								&& KDItemDataQuery(rest2.item, "cyberJammed")
								&& typeof KDItemDataSet === "function")
							KDItemDataSet(rest2.item, "cyberJammed", false);
					}
				}
			}
		}
		if (Event === "postMapgen") {
			if (typeof KinkyDungeonAllRestraintDynamic === "function") {
				for (var rest3 of KinkyDungeonAllRestraintDynamic()) {
					if (!rest3.item || typeof KDItemDataSet !== "function") continue;
					if (typeof KDItemDataQuery === "function" && KDItemDataQuery(rest3.item, "cyberShorted"))
						KDItemDataSet(rest3.item, "cyberShorted", false);
					if (typeof KDItemDataQuery === "function" && KDItemDataQuery(rest3.item, "cyberJammed"))
						KDItemDataSet(rest3.item, "cyberJammed", false);
				}
			}
		}
		return result;
	};
}

// =========================================================================
// Tongue Trap — 50% bad potion effects
// =========================================================================
var RG_TONGUE_POTION_POOL = [
	"PotionMana", "PotionWill", "PotionStamina",
	"PotionFrigid", "PotionInvisibility", "PotionStrength",
];
var RG_SuppressNextPotionSuccessMsg = false;

function RG_IsSwappablePotion(consumable: any): boolean {
	return !!(consumable && consumable.name && RG_TONGUE_POTION_POOL.indexOf(consumable.name) >= 0);
}
function RG_ApplyBadPotionEffect(consumable: any, entity: any) {
	if (!entity || !entity.player || !consumable) return;
	var name = consumable.name;
	var msg = "The potion tastes wrong on your pinned tongue — ";
	try {
		if (name === "PotionMana" && typeof KDChangeMana === "function") {
			KDChangeMana("TongueTrap", "drain", "tongueTrap", -5, false, 0, false, true);
			msg += "the mana drains out of you instead of in.";
		} else if (name === "PotionWill" && typeof KDChangeWill === "function") {
			KDChangeWill("TongueTrap", "drain", "tongueTrap", -2.5);
			if (typeof KinkyDungeonChangeRep === "function") KinkyDungeonChangeRep("Ghost", 5);
			msg += "your resolve wavers and something in you softens.";
		} else if (name === "PotionStamina" && typeof KDChangeStamina === "function") {
			KDChangeStamina("TongueTrap", "drain", "tongueTrap", -5);
			msg += "the adrenaline sours into exhaustion.";
		} else if (name === "PotionFrigid" && typeof KDChangeDistraction === "function") {
			KDChangeDistraction("TongueTrap", "raise", "tongueTrap", 5, false, 0);
			msg += "the cooling agent sets you burning instead.";
		} else if (name === "PotionInvisibility" && typeof KinkyDungeonMakeNoise === "function") {
			KinkyDungeonMakeNoise(6, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
			msg += "your slurred verbal component fizzles, and the noise carries.";
		} else if (name === "PotionStrength" && typeof KinkyDungeonApplyBuffToEntity === "function") {
			KinkyDungeonApplyBuffToEntity(entity, {
				id: "NumbedWeakness", name: "Numbed Weakness", aura: "#444488",
				type: "AttackDmg", power: -2, duration: 50, tags: ["weakness"],
			});
			msg += "your muscles go slack instead of strong.";
		} else {
			msg += "it doesn't taste like it should.";
		}
	} catch (_e) { msg += "it doesn't taste like it should."; }
	if (typeof KinkyDungeonSendActionMessage === "function")
		KinkyDungeonSendActionMessage(7, msg, "#cc6680", 3);
}

if (typeof KinkyDungeonSendActionMessage === "function") {
	var RG_OrigSAM = KinkyDungeonSendActionMessage;
	KinkyDungeonSendActionMessage = function (priority: any, text: any, color: any, time: any) {
		if (RG_SuppressNextPotionSuccessMsg && priority === 9) {
			RG_SuppressNextPotionSuccessMsg = false;
			return;
		}
		return RG_OrigSAM.apply(this, arguments as any);
	};
}
if (typeof KinkyDungeonConsumableEffect === "function") {
	var RG_OrigCE = KinkyDungeonConsumableEffect;
	KinkyDungeonConsumableEffect = function (consumable: any, type: any, inv?: any) {
		try {
			if (RG_HasTongueTrap() && RG_IsSwappablePotion(consumable) && Math.random() < 0.5) {
				RG_ApplyBadPotionEffect(consumable, typeof KDPlayer === "function" ? KDPlayer() : null);
				RG_SuppressNextPotionSuccessMsg = true;
				return;
			}
		} catch (_e) {}
		return RG_OrigCE.apply(this, arguments as any);
	};
}
if (typeof KDPotionTypes !== "undefined" && KDPotionTypes.Strength) {
	var RG_OrigStr = KDPotionTypes.Strength.playerEffect;
	KDPotionTypes.Strength.playerEffect = function (inv: any, quantity: any, user: any, target: any, tx: any, ty: any) {
		try {
			var consumable = typeof KDConsumable === "function" ? KDConsumable(inv) : null;
			if (RG_HasTongueTrap() && consumable && Math.random() < 0.5) {
				RG_ApplyBadPotionEffect(consumable, typeof KDPlayer === "function" ? KDPlayer() : null);
				RG_SuppressNextPotionSuccessMsg = true;
				return { success: true, consumed: quantity, time: 1, componentfailure: "",
					miscast: false, affected: [target] };
			}
		} catch (_e) {}
		return RG_OrigStr.call(this, inv, quantity, user, target, tx, ty);
	};
}

// Cyber potion short-circuit (20%)
if (typeof KinkyDungeonConsumableEffect === "function") {
	var RG_OrigCE2 = KinkyDungeonConsumableEffect;
	// already wrapped above — chain further for cyber
}
(function () {
	if (typeof KinkyDungeonConsumableEffect !== "function") return;
	var prev = KinkyDungeonConsumableEffect;
	KinkyDungeonConsumableEffect = function () {
		var result = prev.apply(this, arguments as any);
		try {
			if (Math.random() < 0.2 && typeof KinkyDungeonAllRestraintDynamic === "function") {
				for (var rest of KinkyDungeonAllRestraintDynamic()) {
					if (rest.item && typeof RG_IsSwapPair === "function" && RG_IsSwapPair(rest.item)
							&& RG_IsCyberGag(rest.item) && !RG_IsCyberShorted(rest.item)) {
						if (typeof RG_IsOpenVariant === "function" && RG_IsOpenVariant(rest.item.name)
								&& typeof RG_PerformSwap === "function")
							RG_PerformSwap(rest.item);
						if (typeof KDItemDataSet === "function") KDItemDataSet(rest.item, "cyberShorted", true);
						if (typeof KinkyDungeonSendTextMessage === "function")
							KinkyDungeonSendTextMessage(8,
								"Liquid seeps into the mechanism. A short circuit forces the plug closed.", "#ff6666", 3);
						break;
					}
				}
			}
		} catch (_e) {}
		return result;
	};
})();

// =========================================================================
// Cyber remotePunish
// =========================================================================
if (typeof KDEventMapInventory !== "undefined") {
	KDEventMapInventory["remotePunish"] = KDEventMapInventory["remotePunish"] || {};
	KDEventMapInventory["remotePunish"]["cyberGagRemoteSwap"] = function (_e: any, item: any, data: any) {
		if (!item || typeof RG_IsSwapPair !== "function" || !RG_IsSwapPair(item) || !RG_IsCyberGag(item)) return;
		var enemy = data && data.enemy;
		if (!enemy || !enemy.Enemy || !enemy.Enemy.RemoteControl) return;
		var chance = enemy.Enemy.RemoteControl.punishRemoteChance || 0.2;
		if (Math.random() >= chance) return;
		var cd = (typeof KDItemDataQuery === "function") ? (KDItemDataQuery(item, "cyberRemoteCD") || 0) : 0;
		if (cd > 0) return;
		var wasPlugged = typeof RG_IsPluggedVariant === "function" && RG_IsPluggedVariant(item.name);
		if (typeof RG_PerformSwap !== "function" || !RG_PerformSwap(item)) return;
		if (typeof KDItemDataSet === "function") KDItemDataSet(item, "cyberRemoteCD", 100);
		if (typeof KinkyDungeonSendTextMessage === "function") {
			KinkyDungeonSendTextMessage(5,
				wasPlugged
					? "A remote signal retracts the plug. The ring is left open."
					: "A remote signal drives the plug home. The housing seals.",
				"#66ccff", 2);
		}
	};

	// Tick down cyber remote CD + poll lockout
	var tickOrig = KDEventMapInventory["tick"] && KDEventMapInventory["tick"]["ringGagEffects"];
	if (tickOrig && !(tickOrig as any)._rgCyberTick) {
		KDEventMapInventory["tick"]["ringGagEffects"] = function (e: any, item: any, data: any) {
			try {
				if (item && RG_IsCyberGag(item) && typeof RG_IsSwapPair === "function" && RG_IsSwapPair(item)) {
					var cd = (typeof KDItemDataQuery === "function") ? (KDItemDataQuery(item, "cyberRemoteCD") || 0) : 0;
					if (cd > 0 && typeof KDItemDataSet === "function") KDItemDataSet(item, "cyberRemoteCD", cd - 1);
					var lockout = (typeof KDGameData !== "undefined") ? (KDGameData.LockoutChance || 0) : 0;
					if (lockout >= 0.99 && !RG_IsCyberJammed(item) && typeof KDItemDataSet === "function") {
						KDItemDataSet(item, "cyberJammed", true);
						if (typeof KinkyDungeonSendTextMessage === "function")
							KinkyDungeonSendTextMessage(8, "Security lockout: plug mechanism jammed.", "#ff4444", 3);
					} else if (lockout < 0.99 && RG_IsCyberJammed(item) && typeof KDItemDataSet === "function") {
						KDItemDataSet(item, "cyberJammed", false);
					}
				}
			} catch (_e) {}
			tickOrig(e, item, data);
		};
		(KDEventMapInventory["tick"]["ringGagEffects"] as any)._rgCyberTick = true;
	}
}

// Attach remotePunish to CyberPlugGag definition
(function RG_PatchCyberEvents() {
	function tryPatch() {
		if (typeof KinkyDungeonGetRestraintByName !== "function") return false;
		var def = KinkyDungeonGetRestraintByName("CyberPlugGag");
		if (!def) return false;
		if (!def.events) def.events = [];
		var hasRemote = false, hasTick = false;
		for (var i = 0; i < def.events.length; i++) {
			if (def.events[i].type === "cyberGagRemoteSwap") hasRemote = true;
			if (def.events[i].type === "ringGagEffects") hasTick = true;
		}
		if (!hasRemote) def.events.push({ trigger: "remotePunish", type: "cyberGagRemoteSwap", inheritLinked: true });
		if (!hasTick) def.events.push({ trigger: "tick", type: "ringGagEffects", inheritLinked: true });
		return true;
	}
	var n = 0;
	function tick() {
		if (tryPatch()) return;
		if (++n < 40 && typeof setTimeout === "function") setTimeout(tick, 250);
	}
	if (typeof setTimeout === "function") setTimeout(tick, 0);
})();

// =========================================================================
// NPC plug swap (playful intents)
// =========================================================================
var RG_MSG_NPC_PLUG = [
	"${Target} pushes the plug back into your mouth. No more talking.",
	"${Target} slides the plug into the ring and presses it home.",
	"${Target} fits the plug carefully into place, silencing you again.",
];
var RG_MSG_NPC_UNPLUG = [
	"${Target} pulls the plug from your mouth and pockets it, smiling.",
	"${Target} works the plug free. The ring holds your mouth open for them.",
	"${Target} extracts the plug with a flourish. They want to hear you now.",
];

function RG_TryNPCSwap(enemy: any, _aiData: any): boolean {
	try {
		if (!enemy || !enemy.Enemy || typeof KinkyDungeonPlayerEntity === "undefined") return false;
		if (typeof KinkyDungeonAlert !== "undefined" && KinkyDungeonAlert > 0) return false;
		if (typeof KDEnemyHasFlag === "function" && KDEnemyHasFlag(enemy, "RG_plugSwapCD")) return false;
		var dx = Math.abs(enemy.x - KinkyDungeonPlayerEntity.x);
		var dy = Math.abs(enemy.y - KinkyDungeonPlayerEntity.y);
		if (dx > 1 || dy > 1) return false;
		if (Math.random() > 0.15) return false;
		var pairItems: any[] = [];
		if (typeof KinkyDungeonAllRestraintDynamic === "function") {
			for (var rest of KinkyDungeonAllRestraintDynamic()) {
				if (rest.item && typeof RG_IsSwapPair === "function" && RG_IsSwapPair(rest.item)) {
					var cursed = typeof KDGetCurse === "function" ? KDGetCurse(rest.item) : rest.item.curse;
					if (!cursed) pairItems.push(rest.item);
				}
			}
		}
		if (!pairItems.length) return false;
		var target = pairItems[Math.floor(Math.random() * pairItems.length)];
		var wasPlugged = typeof RG_IsPluggedVariant === "function" && RG_IsPluggedVariant(target.name);
		if (typeof RG_PerformSwap !== "function" || !RG_PerformSwap(target)) return false;
		var template = wasPlugged ? RG_XPick(RG_MSG_NPC_UNPLUG) : RG_XPick(RG_MSG_NPC_PLUG);
		var enemyName = (typeof TextGet === "function" && enemy.Enemy && enemy.Enemy.name)
			? TextGet("Name" + enemy.Enemy.name) : "They";
		var text = template.replace("${Target}", enemyName);
		if (typeof KinkyDungeonSendDialogue === "function") {
			KinkyDungeonSendDialogue(enemy, text,
				(typeof KDGetColor === "function" ? KDGetColor(enemy) : "#ffffff"), 8, 6);
		} else if (typeof KinkyDungeonSendTextMessage === "function") {
			KinkyDungeonSendTextMessage(6, text, "#aac4ef", 4);
		}
		if (typeof KinkyDungeonSetEnemyFlag === "function")
			KinkyDungeonSetEnemyFlag(enemy, "RG_plugSwapCD", 10);
		return true;
	} catch (_ex) { return false; }
}

if (typeof KDIntentEvents !== "undefined") {
	var intents = ["Cuddle", "TempLeash", "ToyWithPlayer"];
	for (var ii = 0; ii < intents.length; ii++) {
		(function (name: string) {
			var intent = KDIntentEvents[name];
			if (!intent || typeof intent.maintain !== "function") return;
			var orig = intent.maintain;
			intent.maintain = function (enemy: any, delta: any, aiData: any) {
				try { RG_TryNPCSwap(enemy, aiData); } catch (_e) {}
				return orig.call(this, enemy, delta, aiData);
			};
		})(intents[ii]);
	}
}

// =========================================================================
// Surface-list block: ring gag inaccessible under non-stuffing gag
// =========================================================================
var RG_RING_NAMES: any = {
	RingGag: true, HarnessRingGag: true,
	LargeRingGag: true, HugeRingGag: true, LatexRingGag: true,
	DragonscaleRingGag: true, HighsecSpiderGag: true, MagicSpiderGag: true,
	GoodGirlGag: true, CriersRing: true, TongueTrap: true,
	IncantorsMouthpiece: true,
};
if (typeof RG_SWAP_PAIRS !== "undefined") {
	for (var _b in RG_SWAP_PAIRS) {
		RG_RING_NAMES[RG_SWAP_PAIRS[_b]] = true;
	}
}
function RG_IsRingGagItem(item: any): boolean {
	return !!(item && item.name && RG_RING_NAMES[item.name]);
}
function RG_IsAllowedOverRing(item: any): boolean {
	var r = item && typeof KDRestraint === "function" ? KDRestraint(item) : null;
	if (!r || !r.shrine) return false;
	return r.shrine.indexOf("Stuffing") >= 0;
}
if (typeof KDDynamicLinkListSurface === "function") {
	var RG_OrigSurface = KDDynamicLinkListSurface;
	KDDynamicLinkListSurface = function (item: any) {
		var ret = RG_OrigSurface.call(this, item);
		try {
			var chain: any[] = [];
			var cur = item;
			while (cur) { chain.push(cur); cur = cur.dynamicLink; }
			for (var i = 0; i < chain.length; i++) {
				if (!RG_IsRingGagItem(chain[i])) continue;
				var blocked = false;
				for (var j = 0; j < i; j++) {
					if (!RG_IsAllowedOverRing(chain[j])) { blocked = true; break; }
				}
				if (blocked) {
					var idx = ret.indexOf(chain[i]);
					if (idx >= 0) ret.splice(idx, 1);
				}
			}
		} catch (_e) {}
		return ret;
	};
}

// =========================================================================
// Noise amplifier for Crier / Incantor (double radius in particle path)
// =========================================================================
// RingGagsDialogue already doubles for Crier; extend for Incantor via wrap
if (typeof RG_HasCriersRingDlg === "function") {
	// dialogue module checks Crier only — patch HasNoiseAmplifier into OpenParticles if present
}

if (typeof console !== "undefined" && console.log) {
	console.log("[RingGags] Extras loaded: DroolLock, Crier, Incantor, TongueTrap, NPC swap, Cyber, API, surface block, auto-unplug");
}
