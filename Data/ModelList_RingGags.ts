/**
 * RingGags models — base-game port of RingGags mod (Sax)
 * Loaded via tsconfig (Data/ModelList_RingGags.ts).
 *
 * Open sprites live in: Models/PlugGags/OpenGags/
 *   PanelGagOpen.png, SmallLeatherPanelGagOpen.png, CyberPlugGagOpen.png,
 *   GoodGirlGagOpen.png, SteelMuzzleOpen.png, BlacksteelMuzzleOpen.png,
 *   OrnamentalGagOpen.png
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
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
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
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
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
		{ Name: "RingMouth", Layer: "GagUnder", Pri: -101,
			Sprite: "RingMouth", InheritColor: "Ball",
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
		{ Name: "Panel", Layer: "GagFlat", Pri: 5, Sprite: "Panel", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "PanelOverlay", Layer: "GagFlat", Pri: 5.1, Sprite: "PanelOverlay", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleRim", Layer: "GagMuzzle", Pri: 10, Sprite: "MuzzleRim", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleGold", Layer: "GagMuzzle", Pri: 10.1, Sprite: "MuzzleGold", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleHarness", Layer: "GagMuzzleStraps", Pri: 15, Sprite: "MuzzleHarness", OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "MuzzleCollar", Layer: "GagMuzzleStraps", Pri: 16, Sprite: "MuzzleCollar", OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// ---- Good Girl ----
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
			Sprite: "GoodGirlGagComposite",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "GoodGirlGagOpenModel",
	Folder: "PlugGags/OpenGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "GoodGirlGagOpen", Layer: "GagMuzzle", Pri: 5,
			Sprite: "GoodGirlGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
	])
});

// ---- OPEN PLUG VARIANTS (standalone — do NOT use GetModelWithExtraLayers) ----

AddModel({
	Name: "PanelGagOpenModel",
	Folder: "PlugGags/OpenGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "PanelGagOpen", Layer: "GagFlat", Pri: 5,
			Sprite: "PanelGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "Strap", Layer: "GagStraps", Pri: 17,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

// Full standalone harness open (was broken via GetModelWithExtraLayers)
AddModel({
	Name: "PanelGagOpenHarnessModel",
	Folder: "PlugGags/OpenGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "PanelGagOpen", Layer: "GagFlat", Pri: 5,
			Sprite: "PanelGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "Strap", Layer: "GagStraps", Pri: 17,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "Harness", Layer: "GagFlatStraps", Pri: 19,
			Sprite: "PanelHarness", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "SmallLeatherPanelGagOpenModel",
	Folder: "PlugGags/OpenGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "SmallLeatherPanelGagOpen", Layer: "GagFlat", Pri: 5,
			Sprite: "SmallLeatherPanelGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
		{ Name: "Strap", Layer: "GagStraps", Pri: 17,
			Sprite: "BallStrap", Folder: "GagLeather",
			OffsetX: 942, OffsetY: 200, Invariant: true },
	])
});

AddModel({
	Name: "CyberPlugGagOpenModel",
	Folder: "PlugGags/OpenGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag", "Cyber"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "CyberPlugGagOpen", Layer: "GagFlat", Pri: 5,
			Sprite: "CyberPlugGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
	])
});

AddModel({
	Name: "SteelMuzzleOpenModel",
	Folder: "PlugGags/OpenGags",
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
			Sprite: "OTNRivets", Folder: "PlugGags/SteelMuzzle",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			NoOverride: true, TieToLayer: "SteelMuzzleOpen" },
	])
});

AddModel({
	Name: "BlacksteelMuzzleOpenModel",
	Folder: "PlugGags/OpenGags",
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
		{ Name: "OTNStrap", Layer: "GagFlatStraps", Pri: 12,
			Sprite: "OTNStrap", Folder: "PlugGags/BlacksteelMuzzle",
			OffsetX: 942, OffsetY: 200, Invariant: true },
		{ Name: "OTNStrapRivets", Layer: "GagFlatStraps", Pri: 12.2,
			Sprite: "OTNStrapRivets", Folder: "PlugGags/BlacksteelMuzzle",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			NoOverride: true, TieToLayer: "OTNStrap" },
	])
});

AddModel({
	Name: "OrnamentalGagOpenModel",
	Folder: "PlugGags/OpenGags",
	TopLevel: true,
	Group: "Mouth",
	Restraint: true,
	Categories: ["Restraints", "Gags", "OpenGag"],
	AddPose: ["FaceGag", "StuffMouth", "BallMouth"],
	Layers: ToLayerMap([
		{ Name: "OrnamentalGagOpen", Layer: "GagFlat", Pri: 6,
			Sprite: "OrnamentalGagOpen",
			OffsetX: 942, OffsetY: 200, Invariant: true,
			DisplacementSources: ["Head", "FaceGag"] },
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
