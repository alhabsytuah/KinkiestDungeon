# RingGags vanilla port

Branch: `feature/ringgags-port`

## Code
- `Game/src/restraint/special/RingGags.ts` — restraints, drool/breath tick, silent overlays, sequential DroolS1–S4, audio helpers
- `Game/src/restraint/special/RingGagsPlug.ts` — plug/unplug swap pairs + struggle UI
- `Game/src/restraint/special/RingGagsDialogue.ts` — open-mouth speech + flavor
- `Data/ModelList_RingGags.ts` — AddModel definitions
- Listed in `tsconfig.json` files[]

## Latest fixes (2026-07-30)
- **Sequential drool visuals**: stage N → `RingGagDroolSNFX` (DroolS1–S4 buildup, not random)
- **Audio helpers**: `RG_PlayDrip` / `RG_PlayGulp` / `RG_PlayUnplug` (paths under `Game/Audio/`)
- Occasional drip SFX while open + drooling; gulp on cycle return to S2
- **DroolPuddle.png** uploaded to `Game/EffectTiles/` (wake puddles + slip)
- Silent add/remove of cosmetic FX; RG_State module-level state

## Open-mouth mechanisms

### 1. Muffled → open-mouth speech
When **only** OpenGags are worn (`RG_HasOnlyOpenGags()`), speech uses open-mouth pools (Aahh… / Haahhh~ etc.) via `RingGagsDialogue.ts`.

### 2. Saliva & drooling
Episode start messages + escalating bound tiers; cycle S2 false-hope lines + gulp.

### 3. Breath overlay
Stamina &lt; 50% / &lt; 25% or arousal ≥ 40% → breath FX while mouth open.

### 4. Audible noise
Open-mouth speech can alert via `KinkyDungeonMakeNoise` (wired in dialogue module).

## Assets status

| Asset | Status |
|-------|--------|
| `Models/RingGags/` | Present |
| `Models/SFX/` (DroolS1–4, Breath, strands, aaa) | Present |
| `Models/PlugGags/`, `Models/Common/` | Present |
| `Game/EffectTiles/DroolPuddle.png` | **Present** (uploaded) |
| `Game/Audio/drip*.ogg`, `gulp*.ogg`, `unplug.ogg` | Still needed for SFX |
| `Game/InventoryAction/Plug.png`, `Unplug.png` | Confirm |
| `Game/Buffs/opengag_debuff.png` | Confirm |

After remaining audio/icons:
```
npm run pack
npm run build
```
