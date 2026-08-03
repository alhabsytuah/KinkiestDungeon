# Core Time & Turn Loop — Phase 1

**Branch:** `feature/ringgags-port`  
**Module:** `Game/src/base/KDTimeClock.ts`

## Goal
Foundation for hybrid / continuous gameplay without rewriting Ada's turn engine yet.

## Default behaviour
**Fully turn-based** (unchanged). Player acts → `KinkyDungeonAdvanceTime(1)` as before.

## What Phase 1 adds
| Piece | Role |
|--------|------|
| `KDTime` state | `worldTime` (seconds), `turnCount`, `mode` |
| `KDTimeUpdate(dt)` | Frame pump (rAF); tracks real time |
| `KDTimeIsEngaged()` | Hostile within `KD_TIME_ENGAGE_RANGE` (default 6) |
| `KDTimeGetMode()` | `TurnBased` if engaged; else `RealTimeExplore` if idle tick on |
| Idle auto-advance | **OFF by default** — when enabled, advances discrete turns while exploring |

## Enable continuous-feeling exploration (still discrete turns)
In console after load:
```js
KD_TIME_IDLE_TICK_ENABLED = true;
KD_TIME_IDLE_MS = 100;        // ~10 turns/sec while safe
KD_TIME_ENGAGE_RANGE = 6;     // pause auto-tick if hostile this close
KDTimeGetState()
```

When a hostile enters range, idle ticking **stops** so combat stays player-paced.

## Not in Phase 1
- Continuous sub-tile movement
- Per-frame enemy AI rewrite
- Real-time struggle / stamina drain
- WASD velocity movement

Those are later phases (AI, combat, restraints).

## API
```js
KDTimeGetState()
KDTimeGetMode()
KDTimeIsEngaged()
KDTimeAdvanceTurn(reason?)
KDTimeReset()
KDTimeUpdate(dtSec?)  // usually called by internal rAF
```

## Safety
- Feature flags default **safe**
- Does not wrap or replace `KinkyDungeonAdvanceTime` for player actions
- Only *extra* advances when idle tick is explicitly enabled
