/**
 * RingGags models — port of Sax RingGags v1.0 construction
 *
 * Open plug variants = ONE open-panel sprite drawn on the gag layer
 * (GagMuzzle / GagFlat), plus base-game leather/metal straps.
 * Asset paths match the original zip / atlas keys:
 *   Models/PlugGags/PanelGagOpen.png
 *   Models/PlugGags/SmallLeatherPanelGagOpen.png
 *   Models/PlugGags/CyberPlugGagOpen.png
 *   Models/PlugGags/GoodGirlGag/GoodGirlGagOpen.png
 *   Models/PlugGags/SteelMuzzle/SteelMuzzleOpen.png
 *   Models/PlugGags/BlacksteelMuzzle/BlacksteelMuzzleOpen.png
 *   Models/PlugGags/OrnamentalGag/*
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
			Sprite: "RingMouth", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", InheritColor: "Ball",
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

// ---- Spider ----
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
			Sprite: "RingMouth", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "SpiderOverlay", Layer: "GagStraps", Pri: 50,
			Sprite: "SpiderGagOverlay", InheritColor: "Ball",
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

AddModel({
	Name: "LargeRingGag",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "LargeRing", Layer: "GagUnder", Pri: -101,
			Sprite: "LargeRing", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTipLarge", InheritColor: "Ball",
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
		{ Name: "LatexRing", Layer: "GagUnder", Pri: -101,
			Sprite: "LatexRing", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagStraps", Pri: 15,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "TongueTrapModel",
	Folder: "RingGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "TongueTrap", Layer: "GagUnder", Pri: -101,
			Sprite: "TongueTrap", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTrapTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTrapTip", InheritColor: "Ball",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Strap", Layer: "GagFlatStraps", Pri: 14,
			Sprite: "BigBallStrapSegmented", Folder: "GagMetal",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "IncantorsMouthpieceModel",
	Folder: "RingGags/IncantorsMouthpiece",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "Mouth", Layer: "GagUnder", Pri: -101, Sprite: "Mouth", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Panel", Layer: "GagMuzzle", Pri: 50, Sprite: "Panel", OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "PanelOverlay", Layer: "GagMuzzle", Pri: 50.05, Sprite: "PanelOverlay", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleCollar", Layer: "Collar", Pri: -50, Sprite: "MuzzleCollar", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleHarness", Layer: "GagStrapsUnder", Pri: 50, Sprite: "MuzzleHarness", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleRim", Layer: "GagMuzzle", Pri: 50.1, Sprite: "MuzzleRim", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleGold", Layer: "GagMuzzle", Pri: 50.2, Sprite: "MuzzleGold", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleGoldClean", Layer: "GagMuzzle", Pri: 50.3, Sprite: "MuzzleGoldClean", OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Good Girl (plugged + open) — same strap stack, different panel ----
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
			Sprite: "GoodGirlGag", OffsetX: 942, OffsetY: 200, Invariant: true,
			HideWhenOverridden: true, DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "MuzzleLeather", Layer: "GagMuzzleStraps", Pri: 19,
			Sprite: "GoodGirlGag_MuzzleLeather", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleMetal", Layer: "GagMuzzleStraps", Pri: 19.2,
			Sprite: "GoodGirlGag_MuzzleMetal", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessLeather", Layer: "GagMuzzleStraps", Pri: 21,
			Sprite: "GoodGirlGag_HarnessLeather", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessStitching", Layer: "GagMuzzleStraps", Pri: 21.1,
			Sprite: "GoodGirlGag_HarnessStitching", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessMetal", Layer: "GagMuzzleStraps", Pri: 21.2,
			Sprite: "GoodGirlGag_HarnessMetal", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "LocksMetal", Layer: "GagMuzzleStraps", Pri: 21.3,
			Sprite: "GoodGirlGag_LocksMetal", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "LocksPadlock", Layer: "GagMuzzleStraps", Pri: 21.4,
			Sprite: "GoodGirlGag_LocksPadlock", OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "GoodGirlGagOpenModel",
	Folder: "PlugGags/GoodGirlGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "GoodGirlGagOpen", Layer: "GagMuzzle", Pri: 5,
			Sprite: "GoodGirlGagOpen", OffsetX: 942, OffsetY: 200, Invariant: true,
			HideWhenOverridden: true, DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "MuzzleLeather", Layer: "GagMuzzleStraps", Pri: 19,
			Sprite: "GoodGirlGag_MuzzleLeather", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleMetal", Layer: "GagMuzzleStraps", Pri: 19.2,
			Sprite: "GoodGirlGag_MuzzleMetal", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessLeather", Layer: "GagMuzzleStraps", Pri: 21,
			Sprite: "GoodGirlGag_HarnessLeather", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessStitching", Layer: "GagMuzzleStraps", Pri: 21.1,
			Sprite: "GoodGirlGag_HarnessStitching", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "HarnessMetal", Layer: "GagMuzzleStraps", Pri: 21.2,
			Sprite: "GoodGirlGag_HarnessMetal", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "LocksMetal", Layer: "GagMuzzleStraps", Pri: 21.3,
			Sprite: "GoodGirlGag_LocksMetal", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "LocksPadlock", Layer: "GagMuzzleStraps", Pri: 21.4,
			Sprite: "GoodGirlGag_LocksPadlock", OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- OPEN PANEL: one open sprite on GagMuzzle + leather straps (original zip) ----

AddModel({
	Name: "PanelGagOpenModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
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

AddModel({
	Name: "PanelGagOpenHarnessModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
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

AddModel({
	Name: "SmallLeatherPanelGagOpenModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
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
	Name: "CyberPlugGagOpenModel",
	Folder: "PlugGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag", "Cyber"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "CyberPlugOpen", Layer: "GagFlatStraps", Pri: 17,
			Sprite: "CyberPlugGagOpen", InheritColor: "Ball",
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
	])
});

AddModel({
	Name: "SteelMuzzleOpenModel",
	Folder: "PlugGags/SteelMuzzle",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag", "Metal"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "SteelMuzzleOpen", Layer: "GagFlat", Pri: 30,
			Sprite: "SteelMuzzleOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
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
	Categories: ["Restraints", "Gags", "OpenGag", "Metal"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "BlacksteelMuzzleOpen", Layer: "GagFlat", Pri: 30,
			Sprite: "BlacksteelMuzzleOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "OTNStrap", Layer: "GagFlat", Pri: 30.1,
			Sprite: "OTNStrap",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "OTNStrapRivets", Layer: "GagFlat", Pri: 30.2,
			Sprite: "OTNStrapRivets",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "TongueTip", Layer: "Gag", Pri: 1,
			Sprite: "TongueTip", Folder: "RingGags",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "OrnamentalGagOpenModel",
	Folder: "PlugGags/OrnamentalGag",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "OrnamentalPanel", Layer: "GagFlat", Pri: 30,
			Sprite: "OrnamentalGagPanel", InheritColor: "Latex",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "OrnamentalMouth", Layer: "GagFlat", Pri: 30.1,
			Sprite: "OrnamentalGagMouth",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "OrnamentalRing", Layer: "GagFlat", Pri: 30.2,
			Sprite: "OrnamentalGagRing", InheritColor: "Plug",
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

// Drool / breath overlays
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
