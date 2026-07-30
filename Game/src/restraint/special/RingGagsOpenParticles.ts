/**
 * RingGags — open-mouth particle override (あ / aaa.png).
 * Original mod: KDSendGagParticles uses Models/SFX/aaa.png and MakeNoise.
 */
"use strict";

var RG_AAA_PARTICLE = "Models/SFX/aaa.png";

(function RG_InstallAaaParticles() {
	var tries = 0;
	function install() {
		if (typeof KDSendGagParticles !== "function" || typeof RG_HasOnlyOpenGags !== "function") {
			if (++tries < 40 && typeof setTimeout === "function") setTimeout(install, 250);
			return;
		}
		var g: any = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : {});
		var existing: any = g.KDSendGagParticles || KDSendGagParticles;
		if (existing && existing._rgAaa) return;

		var orig: any = existing;

		var hooked: any = function (entity: any) {
			if (entity && entity.player && typeof RG_HasOnlyOpenGags === "function" && RG_HasOnlyOpenGags()) {
				var s: any = (typeof RG_State !== "undefined") ? RG_State : {};
				var cat = s.LastNoiseCategory;
				var radii: any = (typeof RG_NOISE_RADII !== "undefined") ? RG_NOISE_RADII : {};
				var radius = (cat && radii[cat]) ? radii[cat] : ((typeof RG_NOISE_RADIUS !== "undefined") ? RG_NOISE_RADIUS : 4);
				if (typeof RG_HasCriersRingDlg === "function" && RG_HasCriersRingDlg()) radius *= 2;
				try {
					if (typeof KinkyDungeonMakeNoise === "function" && typeof KinkyDungeonPlayerEntity !== "undefined")
						KinkyDungeonMakeNoise(radius, KinkyDungeonPlayerEntity.x, KinkyDungeonPlayerEntity.y);
				} catch (_n) {}
				s.LastNoiseCategory = null;

				try {
					if (typeof KDToggles !== "undefined" && KDToggles.GagParticles
							&& typeof KDAddParticleEmitter === "function"
							&& typeof GetHardpointLoc === "function"
							&& typeof KinkyDungeonPlayer !== "undefined") {
						var lifetime = 2000;
						var pos = GetHardpointLoc(KinkyDungeonPlayer, 0, 0, 1, "Mouth", KDToggles.FlipPlayer);
						var x = pos.x, y = pos.y;
						var vxx = ((KDToggles.FlipPlayer) ? -1 : 1) * (0.15 + Math.random() * 0.05);
						var vyy = -0.07 + Math.random() * 0.23;
						var vx = vxx * Math.cos(pos.angle) - vyy * Math.sin(pos.angle);
						var vy = vxx * Math.sin(pos.angle) + vyy * Math.cos(pos.angle);
						var root = (typeof KinkyDungeonRootDirectory !== "undefined" && KinkyDungeonRootDirectory) ? KinkyDungeonRootDirectory : "";
						// Cast emitter payloads as any — runtime accepts extra fields (dispersion, etc.)
						var emitterData: any = {
							time: 0, lifetime: 1000, vx: 0, vy: 0, zIndex: 60, dispersion: 0, cd: 0, rate: 235,
						};
						var particleData: any = {
							time: 0, lifetime: lifetime, vx: vx, vy: vy, zIndex: 60,
							sin_y: 0.1, sin_y_spread: 0.02, sin_period: 1.4, phase: 6 * Math.random(),
							fadeEase: "invcos", rotation: 0, dispersion_spread: 0.25,
						};
						KDAddParticleEmitter(x, y, root + "Aura/Null.png", RG_AAA_PARTICLE, undefined, emitterData, particleData);
						return;
					}
				} catch (_p) {}
			}
			return orig.apply(this, arguments);
		};
		hooked._rgAaa = true;

		g.KDSendGagParticles = hooked;
		if (typeof console !== "undefined" && console.log)
			console.log("[RingGags] Open-mouth aaa particle + noise hook installed");
	}
	if (typeof setTimeout === "function") setTimeout(install, 50);
	else install();
})();
