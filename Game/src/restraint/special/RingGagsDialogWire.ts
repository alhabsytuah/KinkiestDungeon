/**
 * RingGags — wire drool/breath flavor dialog into the tick handler.
 * Loaded after RingGags.ts and RingGagsDialogue.ts (tsconfig order).
 */
"use strict";

(function RG_WireDialogMessages() {
	var tries = 0;
	function install() {
		if (typeof KDEventMapInventory === "undefined") {
			if (++tries < 40 && typeof setTimeout === "function") setTimeout(install, 250);
			return;
		}
		if (typeof RG_TickHandler !== "function") {
			if (++tries < 40 && typeof setTimeout === "function") setTimeout(install, 250);
			return;
		}
		if ((RG_TickHandler as any)._rgDialogWired) return;
		(RG_TickHandler as any)._rgDialogWired = true;

		var orig = RG_TickHandler;
		var wrapped = function (_e: any, _item: any, data: any) {
			var stageBefore = (typeof RG_State !== "undefined") ? RG_State.DroolStage : 0;
			var episodeBefore = (typeof RG_State !== "undefined") ? (RG_State.DroolEpisode || 0) : 0;
			var cyclingBefore = (typeof RG_State !== "undefined") ? !!RG_State.Cycling : false;

			orig(_e, _item, data);

			try {
				if (typeof RG_State === "undefined") return;
				var s: any = RG_State;
				if (s.BreathMsgCooldown === undefined) s.BreathMsgCooldown = 0;
				if (s.LastBreathWasActive === undefined) s.LastBreathWasActive = false;

				if (s.BreathMsgCooldown > 0) s.BreathMsgCooldown -= 1;
				var breathNow = !!s.BreathActive;
				if (breathNow && !s.LastBreathWasActive && typeof RG_FireBreathMessage === "function") {
					var stamina = (typeof KinkyDungeonStatStamina !== "undefined") ? KinkyDungeonStatStamina : 100;
					var staminaMax = (typeof KinkyDungeonStatStaminaMax !== "undefined") ? KinkyDungeonStatStaminaMax : 100;
					var distraction = (typeof KinkyDungeonStatDistraction !== "undefined") ? KinkyDungeonStatDistraction : 0;
					var distractionMax = (typeof KinkyDungeonStatDistractionMax !== "undefined") ? KinkyDungeonStatDistractionMax : 100;
					var ratio = staminaMax > 0 ? stamina / staminaMax : 1;
					var aroused = distractionMax > 0 && distraction / distractionMax >= (typeof RG_BREATH_AROUSED !== "undefined" ? RG_BREATH_AROUSED : 0.4);
					RG_FireBreathMessage(ratio, aroused);
				}
				s.LastBreathWasActive = breathNow;

				if (typeof RG_FireDroolStartMessage === "function"
						&& s.DroolStage > 0
						&& (s.DroolEpisode > episodeBefore || s.DroolStage !== stageBefore)) {
					var armsBound = typeof KinkyDungeonIsArmsBound === "function" && KinkyDungeonIsArmsBound();
					var hasDroolLock = typeof RG_GetDroolLockItem === "function" && RG_GetDroolLockItem() !== null;
					var isCycling = !!s.Cycling || (cyclingBefore && s.DroolStage === 2);
					RG_FireDroolStartMessage(s.DroolStage, isCycling, armsBound, !!hasDroolLock);
				}
			} catch (_ex) { /* ignore */ }
		};

		KDEventMapInventory["tick"] = KDEventMapInventory["tick"] || {};
		KDEventMapInventory["tick"]["ringGagEffects"] = wrapped;
		if (typeof console !== "undefined" && console.log)
			console.log("[RingGags] Dialog message wire installed on ringGagEffects tick");
	}
	if (typeof setTimeout === "function") setTimeout(install, 0);
	else install();
})();
