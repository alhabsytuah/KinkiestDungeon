// PIXI.Assets.load("Models/Hair/XHairpin") 
// PIXI.Assets.load("Models/Hair/XHairpin2") 

AddModel({
	Name: "XHairpin",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "XHairpin", Layer: "HairFront", Pri: 20,
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "XHairpin2",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "XHairpin2", Layer: "HairFront", Pri: 20,
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "RoseHeadset",
	Folder: "Hair",
	TopLevel: true,
	Protected: true,
	Categories: ["Hairstyles", "Accessories", "Hairbands"],
	Layers: ToLayerMap([
		{ Name: "RoseHeadset", Layer: "HairFront", Pri: 20,
			NoOverride: true,
		},
		{ Name: "RoseHeadsetBack", Layer: "HatBack", Pri: -20,
			NoOverride: true,
		},
	])
});

AddModel({
	Name: "SniperRifle",
	Folder: "Weapon",
	TopLevel: true,
	Protected: false,
	Categories: ["Weapon"],
	Layers: ToLayerMap([{
				Name: "SniperRifle",
				Layer: "Wings",
				Pri: 0,
				NoOverride: true,
/* 				Poses: {
					Free: true
				}, */
			},
		]),
});
