# Naked Outfit — complete base-game port (Ilyasnow v1.12)

**Nothing left behind.** Every functional piece of the original mod is present as first-class vanilla content on `feature/ringgags-port`.

Original mod: `NakedOutfit-v1.12` (author Ilyasnow, gamemajor 5 / minor 4 / patch ≥81).

## Source of truth

| Original mod file | Vanilla destination |
|-------------------|---------------------|
| `NakedOutfit.ks` | `Game/src/player/NakedOutfit.ts` |
| `TextureAtlas/BodyPlus-0.json` | `TextureAtlas/BodyPlus-0.json` (identical) |
| `TextureAtlas/BodyPlus-0.png` | `TextureAtlas/BodyPlus-0.png` (identical) |
| `mod.json` | N/A (settings → hard `NO_CFG`) |

The original mod ships **no** loose `Models/Toys/*.png`. All toy/body frames live inside the BodyPlus atlas. The port does the same.

## Feature parity checklist

| Original behavior | Vanilla status | Notes |
|-------------------|----------------|-------|
| Always-available **Naked** outfit (`None`) | **Done** | `NO_RegisterOutfit` + `NO_EnsureInventoryNone` |
| Kept first in outfit inventory | **Done** | `new Map([["None", …], …old])` |
| Non-droppable | **Done** | Hook on `KDInventoryAction.Drop.valid` |
| Inventory icon alias (`None.png` → Free.png) | **Done** | Both `KDModFiles` and `kdpixitex` (port is stricter than original) |
| Exposure resists (ice/tickle/grope −0.2, acid/soap +0.3) | **Done** | Copied verbatim from bikini |
| Sneak −0.2 + mana efficiency +0.1 | **Done** | Gated by `NO_CFG.NakedOutfitBuffEvents` |
| Empty dress `None` | **Done** | `NO_EnsureDressNone` |
| BodyPlus torso overwrite (Torso / Spread / Closed) | **Done** | Atlas + `kdpixitex` |
| Nipples overwrite | **Done** | + force-visible every tick |
| VibeToy model + assignment | **Done** | TrapVibe / TrapVibeProto / MaidVibe |
| PussyToy model + assignment | **Done** | TrapPlug 1–5, SteelPlugF |
| Skin color on PussyToy (postApply) | **Done** | `nakedPussyToySkin` |
| Config toggles | **Done** | Hardcoded `NO_CFG` (vanilla has no mod-settings UI) |
| `modAtlasLoader` load path | **Done** | Primary path; plain spritesheet fallback |
| Late re-apply against main-atlas race | **Done** | 1.5 s + 4 s (improvement over original) |

Dead code in original (`RestraintPlugsR = ["RearVibe1", "SteelPlugR"]`) was never used and is intentionally omitted.

## Config (`NO_CFG`)

```ts
var NO_CFG = {
  AddNakedOutfit: true,        // original: NakedOutfitAddNakedOutfit
  NakedOutfitBuffEvents: true, // original: NakedOutfitNakedOutfitBuffEvents
  ReplaceBody: true,           // original: NakedOutfitReplaceBody
  ReplaceNipples: true,        // original: NakedOutfitReplaceNipples
  EnableToys: true,            // original: NakedOutfitEnableToys
};
```

Change any flag and rebuild. No restart-of-mod-settings required.

## Runtime flow (mirrors original AfterModLoad)

1. `NO_AliasNoneIcon`
2. `NO_RegisterOutfit` (text keys, events, `KinkyDungeonOutfitsBase`)
3. `NO_WireInventory` (KDInitInventory wrap, tick ensure, drop block)
4. `NO_RegisterToyModels` (AddModel + restraint.Model assignment)
5. `NO_WireToySkin` (postApply skin color)
6. `NO_LoadBodyPlusAtlas` → `NO_ApplyBodyPlusOverrides`
7. Delayed re-apply (1.5 s / 4 s) so the main game atlas cannot clobber BodyPlus

## Build

```bash
npm run pack   # only if you change images
npm run build
npm run serve
```

## Files touched

- `Game/src/player/NakedOutfit.ts` — sole runtime module (listed in `tsconfig.json`)
- `TextureAtlas/BodyPlus-0.json`
- `TextureAtlas/BodyPlus-0.png`
- `docs/NAKED_OUTFIT_PORT.md` (this file)

Orthogonal to RingGags work on the same branch.
