
interface KDStruggleButtonGetData {
	StruggleType: string,
	x: number,
	y: number,
	ButtonWidth: number,
	sg: any,
	item: item,
}
interface KDStruggleButtonData extends KDStruggleButtonGetData {
	btn: string,
	button_index: number,
}

interface KDStruggleGroupReturn {
    i: number,
    allowed: boolean,
    type: string,
    action?: (bdata) => boolean,
    image?: string
}

// RingGags plug/unplug helpers (defined later in RingGagsPlug.ts; resolved at call time)
declare function RG_IsSwapPair(item: any): boolean;
declare function RG_IsPluggedVariant(name: string): boolean;
declare function RG_DoPlayerPlugSwap(item: any): boolean;

let KDStruggleButtons: Record<string, (data: KDStruggleButtonData, i: number, query: boolean, target: entity, entity: entity) => KDStruggleGroupReturn>  = {
	Struggle: (data, i, query, target, entity) => {
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let action = (_b) => {
            if ((KDGetCurse(item))) KDSendInput("struggleCurse", {
                group: sg.group,
                image: "Struggle",
                index: KDStruggleGroupLinkIndex[sg.group],
                curse: (KDGetCurse(item))});
			else {
				if (KinkyDungeonFastStruggle) {
					KinkyDungeonFastStruggleGroup = sg.group;
					KinkyDungeonFastStruggleType = "Struggle";
				} else
					KDSendInput("struggle", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], type: "Struggle"});
			}
			return true;
        }
        if (query) {
            return {
                i: 10,
                allowed: true,
                image: "Struggle",
                type: (KDGetCurse(data?.item)) ? "StruggleCurse" : "Struggle",
                action: action,
            };
        }
        let allowed = false;
		if (DrawButtonKDEx("sgStruggle" + button_index + sg.group, (_b) => {
			return action(_b);
		}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth,
		"", KDBaseWhite, KinkyDungeonRootDirectory + "Struggle.png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
			data.StruggleType = data.btn;
		i++;
        allowed = true;
		return {i: i,
            image: "Struggle", allowed: allowed, type: (KDGetCurse(item)) ? "StruggleCurse" : "Struggle"};
	},
	
	CurseInfo: (data, i, query, target, entity) => {
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let allowed = !!(KDGetCurse(item));
        let action = !allowed ? null : (_b) => {
            KinkyDungeonCurseInfo(item, (KDGetCurse(item)));
            return true;
        };
        if (query) {
            return {
                i: 8,
                allowed: allowed,
                image: "CurseInfo",
                type: "CurseInfo",
                action: action,
            };
        }
		if (allowed) {
			DrawButtonKDEx("sgCurseInfo" + button_index + sg.group, (_b) => {
				return action(_b);
			}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", KDBaseWhite, KinkyDungeonRootDirectory + ((KDGetCurse(item) && KDCurses[KDGetCurse(item)].customIcon_RemoveFailure) ? KDCurses[KDGetCurse(item)].customIcon_RemoveFailure : "CurseInfo") + ".png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true});
            i++;
		}
		return {i: i,
            image: "CurseInfo",allowed: allowed, type: "CurseInfo"};
	},
	CurseUnlock: (data, i, query, target, entity) => {
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let allowed = (KDGetCurse(data?.item))
            && !KinkyDungeonCurseAvailable(data?.item, (KDGetCurse(data?.item)));
        let action = !allowed ? null : (_b) => {
				KDSendInput("curseUnlock", {group: sg.group, index: KDStruggleGroupLinkIndex[sg.group], curse: (KDGetCurse(item))});
				return true;
			}
        if (query) {
            return {
                i: 9,
                allowed: allowed,
                image: "CurseUnlock",
                type: "CurseUnlock",
                action: action,
            };
        }
		if (allowed) {
			DrawButtonKDEx("sgCurseUnlock" + button_index + sg.group, (_b) => {
				return action(_b);
			}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", KDBaseWhite, KinkyDungeonRootDirectory + ((KDGetCurse(item) && KDCurses[KDGetCurse(item)].customIcon_RemoveSuccess) ? KDCurses[KDGetCurse(item)].customIcon_RemoveSuccess : "CurseUnlock") + ".png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true});
            i++;
		}
		return {i: i, allowed: allowed, type: "CurseUnlock"};
	},
	Remove: (data, i, query, target, entity) => {
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let allowed = !(KDGetCurse(item)) && !sg.blocked;
        let img = "Unlock";
        if (data?.item.lock) img = KinkyDungeonRootDirectory + "Locks/" + data?.item.lock + ".png";
        let action = (_b) => {
            if (KinkyDungeonFastStruggle) {
                KinkyDungeonFastStruggleGroup = sg.group;
                KinkyDungeonFastStruggleType = (item.lock) ? "Unlock" : "Remove";
            } else
                KDSendInput("struggle", {
                    group: sg.group,
                    image: data?.item.lock ? img : "Remove", index: KDStruggleGroupLinkIndex[sg.group], type: (item.lock) ? "Unlock" : "Remove"});
            return true;
        };
        if (query) {
            return {
                i: 9,
                allowed:allowed,
                image: data?.item.lock ? img : "Remove",
                type: data?.item.lock ? "Unlock" : "Remove",
                action: action,
            };
        }
		if (allowed) {

			let toolSprite = (item.lock) ? KDGetLockVisual(item) : "Buckle.png";
			if (DrawButtonKDEx("sgRemove" + button_index + sg.group, (_b) => {
				return action(_b);
			}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", KDBaseWhite, KinkyDungeonRootDirectory + toolSprite, "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
				data.StruggleType = (item.lock) ? "Unlock" : "Remove";
			i++;
		}
		return {i: i, allowed: allowed, type:
           item.lock ? "Unlock" : "Remove",
        image: data?.item.lock ? img : "Remove",
        };
	},
	Cut: (data, i, query, target, entity) => {
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let name = ((KinkyDungeonPlayerDamage && KinkyDungeonPlayerDamage.name && !KinkyDungeonPlayerDamage.unarmed) ? "Items/" + KDGetItemImage(KinkyDungeonPlayerDamage, KDPlayer()) : "Cut");

        let img = KinkyDungeonRootDirectory + name + ".png";
        let allowed = !(KDGetCurse(item))
            && !sg.blocked
            && (KinkyDungeonAllWeapon().some(
                (inv) => {return KDWeapon(inv).light
                    && KDWeapon(inv).cutBonus != undefined;})
                    || KinkyDungeonGetAffinity(false, "Sharp"))
            && !sg.noCut;
        let action = !allowed ? null : (_b) => {
            if (KinkyDungeonFastStruggle) {
                KinkyDungeonFastStruggleGroup = sg.group;
                KinkyDungeonFastStruggleType = "Cut";
            } else
                KDSendInput("struggle", {group: sg.group,
                    image: img, index: KDStruggleGroupLinkIndex[sg.group], type: "Cut"});
            return true;
        };
        if (query) {
            return {
                i: 5,
                allowed: allowed,
                type: "Cut",
                image: img,
                action: action,
            };
        }
		if (allowed) {
			if (
				DrawButtonKDEx("sgCut" + button_index + sg.group, (_b) => {
					return action(_b);
				}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "",
						(sg.magic) ? "#8394ff" : KDBaseWhite, KinkyDungeonRootDirectory + name + ".png",
                        "", undefined, true, (sg.magic) ? "#8394ff" : KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
				data.StruggleType = btn;
			i++;
		}
		return {i: i,
            image: img, allowed: allowed, type: "Cut"};
	},
	Pick: (data, i, query, target, entity) => {
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let allowed = !!(!(KDGetCurse(data?.item))
        && !data?.sg.blocked
        && data.btn == "Pick"
        && KinkyDungeonItemCount("Pick") > 0
        && data.item.lock);
        let action = !allowed ? null : (_b) => {
            if (KinkyDungeonFastStruggle) {
                KinkyDungeonFastStruggleGroup = sg.group;
                KinkyDungeonFastStruggleType = "Pick";
            } else
                KDSendInput("struggle", {group: sg.group,
                    image: "UseTool", index: KDStruggleGroupLinkIndex[sg.group], type: "Pick"});
            return true;
        };
        if (query) {
            return {
                i: 3,
                allowed: allowed,
                type: "Pick",
                image: "UseTool",
                action: action,
            };
        }
		if (allowed) {
			if (
				DrawButtonKDEx("sgPick" + button_index + sg.group, (_b) => {
					return action(_b);
				}, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", KDBaseWhite, KinkyDungeonRootDirectory + "UseTool.png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
				data.StruggleType = btn;

			i++;
		}
		return {i: i,
            image: "UseTool", allowed: allowed, type: "Pick"};
	},
	/** RingGags: plug / unplug for swap-pair plug gags */
	PlugSwap: (data, i, query, target, entity) => {
		let {x, y, ButtonWidth, sg, button_index, item} = {...data};
		let hasRG = typeof RG_IsSwapPair === "function";
		let isSwap = !!(hasRG && item && RG_IsSwapPair(item));
		let curse = item && KDGetCurse(item);
		let handsFree = !KinkyDungeonIsArmsBound() && !KinkyDungeonIsHandsBound();
		let allowed = !!(isSwap && !curse && sg && !sg.blocked && handsFree);
		let plugged = !!(hasRG && item && typeof RG_IsPluggedVariant === "function" && RG_IsPluggedVariant(item.name));
		let iconRel = plugged ? "InventoryAction/Unplug.png" : "InventoryAction/Plug.png";

		let action = (_b) => {
			if (!isSwap) return false;
			if (!handsFree) {
				KinkyDungeonSendTextMessage(6, "Your hands aren't free enough to manage the plug.", "#cc6680", 2);
				return true;
			}
			let itemIndex = (KDStruggleGroupLinkIndex && sg && KDStruggleGroupLinkIndex[sg.group])
				? KDStruggleGroupLinkIndex[sg.group] : 0;
			if (typeof KDSendInput === "function" && typeof KDInputTypes !== "undefined" && KDInputTypes["plugSwap"]) {
				KDSendInput("plugSwap", { group: sg.group, index: itemIndex });
			} else if (typeof RG_DoPlayerPlugSwap === "function") {
				RG_DoPlayerPlugSwap(item);
			}
			return true;
		};

		if (query) {
			return {
				i: 7,
				allowed: allowed,
				image: iconRel.replace(".png", ""),
				type: plugged ? "PlugSwapUnplug" : "PlugSwapPlug",
				action: action,
			};
		}

		// Only draw for actual swap-pair items (open/plugged plug gags)
		if (isSwap && !curse) {
			let btnColor = allowed ? KDButtonColorIntense : "rgba(255, 50, 50, 0.5)";
			if (DrawButtonKDEx(
				"sgPlugSwap" + button_index + sg.group,
				(_b) => action(_b),
				true,
				x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i),
				y, ButtonWidth, ButtonWidth, "",
				allowed ? KDBaseWhite : "#ff4444",
				KinkyDungeonRootDirectory + iconRel,
				"", undefined, true, btnColor, undefined, undefined, {scaleImage: true}
			)) {
				data.StruggleType = plugged ? "PlugSwapUnplug" : "PlugSwapPlug";
			}
			i++;
		}
		return {
			i: i,
			allowed: allowed,
			type: plugged ? "PlugSwapUnplug" : "PlugSwapPlug",
			image: iconRel.replace(".png", ""),
		};
	},
	ContextMenu: (data, i, query, target, entity) => {
        if (query) {
            return {
                i: 0,
                allowed: false,
                type: "ContextMenu",
            };
        }
		let {btn, StruggleType, x, y, ButtonWidth, sg, button_index, item} = {...data};
        let allowed = false;
        if (
            DrawButtonKDExContext("sgContext" + button_index + sg.group, "RestraintContext", (_b) => {
                if (KDContextMenu && KDCurrentHoverButton?.contextMenu) {
                    if (KDDrawGameContextMenu[KDCurrentHoverButton.contextMenu](false, MouseX, MouseY).length > 0) {
                        KDContextMenu = !KDContextMenu;
                    }
                } else if (KDDrawGameContextMenu[KinkyDungeonDrawState]) {
                    if (KDDrawGameContextMenu[KinkyDungeonDrawState](false, MouseX, MouseY).length > 0) {
                        KDContextMenu = !KDContextMenu;
                    }
                } else KDContextMenu = false;
                if (KDContextMenu) {
                    KDContextX = MouseX - 350;
                    KDContextY = MouseY;
                    KDContextStage = "";
                }
                return true;
            }, true, x + 495 - ButtonWidth + ((sg.left) ? -(ButtonWidth)*i : (ButtonWidth)*i), y, ButtonWidth, ButtonWidth, "", KDBaseWhite, KinkyDungeonRootDirectory + "ContextMenu.png", "", undefined, true, KDButtonColorIntense, undefined, undefined, {scaleImage: true}))
            data.StruggleType = btn;

        i++;
        allowed = true;
		return {i: i, allowed: allowed, type: "ContextMenu"};
	},
}

function KDGetStruggleButtons(data: KDStruggleButtonGetData) {
	if (KDToggles.StruggleContext) return ["ContextMenu"];
	// PlugSwap always listed; KDStruggleButtons.PlugSwap only draws for swap-pair gags
	return ["Struggle", "CurseInfo", "CurseUnlock", "Cut", "Remove", "Pick", "PlugSwap"];
}

function KDGetStruggleContextMenu(item: item, sg: StruggleGroup, target: entity, entity: entity) {
	return ["Struggle", "CurseInfo", "CurseUnlock", "Cut", "Remove", "Pick", "PlugSwap"];
}
