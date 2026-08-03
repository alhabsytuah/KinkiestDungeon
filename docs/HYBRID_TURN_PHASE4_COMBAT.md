# Phase 4 — Combat & Restraints (hybrid layer)

**Branch:** `feature/ringgags-port`  
**Module:** `Game/src/player/KDCombatRestraintRealtime.ts`

## Critical design choice
**Combat while engaged remains turn-based.**  
This phase does *not* implement real-time attack queues or per-frame enemy swings. That would be a full combat rewrite.

Instead Phase 4 connects **restraints to the hybrid explore systems** (Phases 1–3) so being bound *feels* heavier in continuous exploration, and optionally softens struggle over time when safe.

## What it does

| Feature | Behaviour |
|---------|------------|
| **Pressure read** | slow level, freeze, restriction, arms/legs, gag, SP/WP ratios |
| **`moveMult`** | ≥1 multiplier for explore step interval |
| **Phase 3 coupling** | sets `KD_PLAYER_RT_STEP_MS = base × moveMult` when not engaged |
| **Phase 1 coupling** | optional slower `KD_TIME_IDLE_MS` when bound |
| **Phase 2 coupling** | scales AI `movePoints` drip down when player is slow |
| **Struggle drip** | optional tiny progress on restraint progress fields when **not** engaged |
| **Engage gate** | when hostile in range → rate rewrites stop; pure turns |

## Enable
```js
KD_COMBAT_RT_ENABLED = true;
KD_PLAYER_RT_ENABLED = true;      // feel slow steps
KD_TIME_IDLE_TICK_ENABLED = true; // optional
KD_STRUGGLE_RT_DRIP = false;      // opt-in; small passive struggle progress when safe

KDCombatRTGetState()
KDCombatRTReadPressure()
```

## Example feel
| State | Approximate step interval |
|-------|---------------------------|
| Free, full SP | ~120ms |
| Moderate rope + low SP | ~180–220ms |
| Heavy slow / freeze | up toward ~300ms+ (capped) |
| Hostile nearby | hold-to-step & rate rewrite off |

## Explicitly NOT Phase 4
- Real-time enemy attacks / spell cooldowns as timers that replace turns  
- Replacing `KinkyDungeonStruggle` success rolls  
- Removing telegraphs / turn order  
- Continuous sub-tile combat movement  

Those remain future work if desired.

## Stack
| Phase | Module |
|-------|--------|
| 1 Time | `KDTimeClock.ts` |
| 2 AI | `KDAIRealtime.ts` |
| 3 Move | `KDPlayerMoveRealtime.ts` |
| 4 Combat/Restraint | `KDCombatRestraintRealtime.ts` |
