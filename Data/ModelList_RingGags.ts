/**
 * RingGags models — base-game port of RingGags mod (Sax)
 * Loaded with other Data/ModelList_*.ts via the build.
 * Phase 1 assets under Models/RingGags, Models/PlugGags, Models/SFX.
 * Open plug variants: sprites in Models/PlugGags/ (not a separate OpenGags folder).
 */

// ---- Core ring gag ----
AddModel({
	Name: "RingGag",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
			Sprite: "RingMouth",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel(GetModelWithExtraLayers("RingGagHarness", "RingGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "BallHarness", Folder: "GagLeather",
		OffsetX: 942, OffsetY: 200, Invariant: true },
], "RingGag", false));

AddModel(GetModelWithExtraLayers("RingGagHarnessSecure", "RingGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 20,
		Sprite: "BallSideStrap", Folder: "GagLeather",
		OffsetX: 942, OffsetY: 200, Invariant: true },
], "RingGag", false));

// ---- Spider gag ----
AddModel({
	Name: "SpiderGag",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
			Sprite: "RingMouth",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "SpiderOverlay", Layer: "GagStraps", Pri: 50,
			Sprite: "SpiderGagOverlay",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel(GetModelWithExtraLayers("SpiderGagHarness", "SpiderGag", [
	{ Name: "Harness", Layer: "GagStraps", Pri: 10,
		Sprite: "BallHarness", Folder: "GagLeather",
		OffsetX: 942, OffsetY: 200, Invariant: true },
], "SpiderGag", false));

AddModel(GetModelWithExtraLayers("SpiderGagHarnessSecure", "SpiderGagHarness", [
	{ Name: "SideStrap", Layer: "GagStraps", Pri: 20,
		Sprite: "BallSideStrap", Folder: "GagLeather",
		OffsetX: 942, OffsetY: 200, Invariant: true },
], "SpiderGag", false));

// ---- Large / Latex ring variants ----
AddModel({
	Name: "LargeRingGag",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
			Sprite: "LargeRing",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTipLarge",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "LatexRingGag",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
			Sprite: "LatexRing",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Tongue Trap ----
AddModel({
	Name: "TongueTrapModel",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
			Sprite: "RingMouth",
			InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTrap", Layer: "Gag", Pri: 2,
			Sprite: "TongueTrap",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTrapTip", Layer: "Gag", Pri: 3,
			Sprite: "TongueTrapTip",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Incantor's Mouthpiece ----
AddModel({
	Name: "IncantorsMouthpieceModel",
	Folder: "RingGags/IncantorsMouthpiece",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "GagUnder", Pri: -101,
			Sprite: "Mouth",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Panel", Layer: "GagFlat", Pri: 5,
			Sprite: "Panel",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "PanelOverlay", Layer: "GagFlat", Pri: 5.1,
			Sprite: "PanelOverlay",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleRim", Layer: "GagMuzzle", Pri: 10,
			Sprite: "MuzzleRim",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleGold", Layer: "GagMuzzle", Pri: 10.1,
			Sprite: "MuzzleGold",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleHarness", Layer: "GagMuzzleStraps", Pri: 15,
			Sprite: "MuzzleHarness",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleCollar", Layer: "GagMuzzleStraps", Pri: 16,
			Sprite: "MuzzleCollar",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Good Girl Gag (plugged + open) ----
AddModel({
	Name: "GoodGirlGagModel",
	Folder: "PlugGags/GoodGirlGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["HideMouth", "FaceCoverGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "GoodGirlGag", Layer: "GagMuzzle", Pri: 5,
			Sprite: "GoodGirlGag",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "GoodGirlGagOpenModel",
	Folder: "PlugGags/GoodGirlGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "GoodGirlGagOpen", Layer: "GagMuzzle", Pri: 5,
			Sprite: "GoodGirlGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Ornamental / Miko open (MikoGag swap) ----
AddModel({
	Name: "OrnamentalGagOpenModel",
	Folder: "PlugGags/OrnamentalGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "OrnamentalPanel", Layer: "GagFlat", Pri: 30,
			Sprite: "OrnamentalGagPanel",
			InheritColor: "Latex",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "OrnamentalMouth", Layer: "GagFlat", Pri: 30.1,
			Sprite: "OrnamentalGagMouth",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "OrnamentalRing", Layer: "GagFlat", Pri: 30.2,
			Sprite: "OrnamentalGagRing",
			InheritColor: "Plug",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Harness", Layer: "GagFlatStraps", Pri: 19,
			Sprite: "Harness", Folder: "GagLatex",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "SideStrap", Layer: "GagFlatStraps", Pri: 21,
			Sprite: "SideStrap", Folder: "GagLatex",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Open panel / muzzle variants (Phase 4 plug swaps) ----
// PanelPlugGag, MaidMuzzle
AddModel({
	Name: "PanelGagOpenModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "PanelGagOpen", Layer: "GagMuzzle", Pri: 3,
			Sprite: "PanelGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagMuzzleStraps", Pri: 15,
			Sprite: "MuzzleStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// PanelPlugGagHarness
AddModel({
	Name: "PanelGagOpenHarnessModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "PanelGagOpen", Layer: "GagMuzzle", Pri: 3,
			Sprite: "PanelGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagMuzzleStraps", Pri: 15,
			Sprite: "MuzzleStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Harness", Layer: "GagMuzzleStraps", Pri: 18,
			Sprite: "MuzzleHarness", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// CableGag, NylonCableGag
AddModel({
	Name: "SmallLeatherPanelGagOpenModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "SmallPanelOpen", Layer: "GagFlat", Pri: 5,
			Sprite: "SmallLeatherPanelGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 17,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "SteelMuzzleOpenModel",
	Folder: "PlugGags/SteelMuzzle",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "SteelMuzzleOpen", Layer: "GagFlat", Pri: 30,
			Sprite: "SteelMuzzleOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "OTNRivets", Layer: "GagFlat", Pri: 30.1,
			Sprite: "OTNRivets",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "BlacksteelMuzzleOpenModel",
	Folder: "PlugGags/BlacksteelMuzzle",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "BlacksteelMuzzleOpen", Layer: "GagFlat", Pri: 30,
			Sprite: "BlacksteelMuzzleOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// High-Tech Gag (Open) — CyberPlugGagOpen / CyberPlugGag swap
AddModel({
	Name: "CyberPlugGagOpenModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "CyberOpen", Layer: "GagFlatStraps", Pri: 17,
			Sprite: "CyberPlugGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagFlatStraps", Pri: 14,
			Sprite: "BigBallStrapSegmented", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Harness", Layer: "GagFlatStraps", Pri: 16,
			Sprite: "BallHarnessSegmented", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Mask", Layer: "GagFlatStraps", Pri: 19,
			Sprite: "HarnessMask", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Display", Layer: "GagFlatStraps", Pri: 21,
			Sprite: "Display", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TopRim", Layer: "GagFlatStraps", Pri: 21.1,
			Sprite: "Rim", Folder: "GagMetal",
			NoOverride: true, TieToLayer: "Display",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessDisplay", Layer: "GagFlatStraps", Pri: 21,
			Sprite: "HarnessDisplay", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessRim", Layer: "GagFlatStraps", Pri: 21.1,
			Sprite: "HarnessRim", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Drool SFX overlays (cosmetic) + breath ----
for (let i = 1; i <= 4; i++) {
	AddModel({
		Name: "RingGagDroolS" + i,
		Folder: "SFX",
		TopLevel: false,
		Group: "Mouth",
		Restraint: true,
		Categories: ["Restraints"],
		Layers: ToLayerMap([
			{ Name: "DroolS" + i, Layer: "GagFlat", Pri: 5.0,
				OffsetX: 942, OffsetY: 200, Invariant: true },
		])
	});
}

AddModel({
	Name: "RingGagBreathOverlay",
	Folder: "SFX",
	TopLevel: false,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints"],
	Layers: ToLayerMap([
		{ Name: "Breath", Layer: "GagFlat", Pri: 4.9,
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});
