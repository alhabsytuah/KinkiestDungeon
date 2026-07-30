# Naked Outfit — base-game port

Port of **Naked Outfit v1.12** (Ilyasnow) into KinkiestDungeon as first-class content.

## Branch

`feature/ringgags-port` (shared with RingGags work)

## Features

| Feature | Status |
|---------|--------|
| Always-available **Naked** outfit (`None`) | Done |
| Non-droppable; kept first in outfit inventory | Done |
| Exposure resists (ice/tickle/grope −0.2, acid/soap +0.3) | Done |
| Sneak −0.2 + mana efficiency +0.1 | Done |
| Empty dress `None` | Done |
| BodyPlus torso / nipple atlas override | Done (needs `TextureAtlas/BodyPlus-0.*`) |
| PussyToy / VibeToy models for plugs & vibes | Done (needs `Models/Toys/*`) |

## Files

| Path | Role |
|------|------|
| `Game/src/player/NakedOutfit.ts` | Runtime (outfit, inventory, toys, atlas) |
| `TextureAtlas/BodyPlus-0.json` | Atlas frames |
| `TextureAtlas/BodyPlus-0.png` | Atlas image |
| `Models/Toys/*.png` | Toy sprites |

## Config (`NO_CFG` in source)

```ts
AddNakedOutfit: true
NakedOutfitBuffEvents: true
ReplaceBody: true
ReplaceNipples: true
EnableToys: true
```

## Build

```bat
git pull
npm run pack
npm run build
```

## Notes

- Inventory icon falls back to `Game/Poses/Free.png` when `Game/Outfits/None.png` is missing.
- Toy assignment: TrapPlug 1–5, SteelPlugF, TrapVibe / Proto / MaidVibe.
- Body override uses atlas + `modAtlasLoader` (same as original mod).
- Orthogonal to RingGags.
