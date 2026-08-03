# Hybrid continuous system — index

**Branch:** `feature/ringgags-port`  
**Status:** Completion pass finished (layered hybrid; Ada cores mediated, not deleted)

## Quick start
```js
KDHybridEnableRecommended()
// F8 = debug overlay
// KDHybridDisableAll()
```

```bat
git pull origin feature/ringgags-port
npm run build
```

## Module map

| Phase | File | Role |
|-------|------|------|
| 1 Time | `Game/src/base/KDTimeClock.ts` | World clock, idle tick, engage gate |
| 2 AI soft | `Game/src/enemy/KDAIRealtime.ts` | movePoints / goals while explore |
| 3 Move | `Game/src/player/KDPlayerMoveRealtime.ts` | Hold-to-step WASD |
| 4 Restraint | `Game/src/player/KDCombatRestraintRealtime.ts` | Bind → step rate |
| 5a Motion | `Game/src/base/KDContinuousMotion.ts` | visual_x/y lerp |
| 5b Path | `Game/src/enemy/KDAIPathFollow.ts` | Path visual + attack ready |
| 5c Econ | `Game/src/player/KDActionEconomyRealtime.ts` | Input GCD |
| 5d Struggle | `Game/src/player/KDStruggleRealtime.ts` | Per-second struggle window |
| Core | `Game/src/base/KDAdvanceTimeReplace.ts` | Mediate AdvanceTime |
| Core | `Game/src/enemy/KDAITypeReplace.ts` | Continuous AI profiles |
| Core | `Game/src/enemy/KDFindPathReplace.ts` | Path cache + clear |
| Pack | `Game/src/base/KDHybridComplete.ts` | Preset, flags, SendInput master, logical, debug |
| Pump | `Game/src/base/KDHybridPump.ts` | Unified callback registry |
| Final | `Game/src/base/KDHybridFinalize.ts` | Map clear, visual enforce, attack nudge, struggle harden |

## Design contract
- **Explore:** continuous-feeling (idle ticks, smooth visuals, hold-move).
- **Engage (hostile in range):** classic turn combat.
- **Vanilla functions** stay the source of truth for resolution; hybrid layers schedule, smooth, and mediate.

## Intentionally not a from-scratch engine
Full replacement of AdvanceTime body, KDAIType tables, and A* algorithm would be a separate multi-month fork. This branch ships **production-safe layered completion**.

## Verify
```js
KDTimeGetState()
KDHybridGetState()
KDHybridPumpGetState()
KDHybridFinalizeGetState()
KDFindPathReplaceGetState()
```
