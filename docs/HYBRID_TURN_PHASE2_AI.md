# Phase 2 — Enemy AI & Pathfinding (hybrid layer)

**Branch:** `feature/ringgags-port`  
**Module:** `Game/src/enemy/KDAIRealtime.ts`  
**Depends on:** Phase 1 `Game/src/base/KDTimeClock.ts`

## Goal
Make NPCs feel more continuous during exploration **without** replacing Ada's `KDAIType` / `KinkyDungeonFindPath` / full combat AI.

## What this is *not*
| Not included (later phases) | Why |
|-----------------------------|-----|
| Continuous sub-tile velocity | Needs movement rewrite |
| Per-frame attack / spell AI | Combat must stay turn-based |
| New A* implementation | Vanilla pathfinding stays canonical |
| Replacement of `KDAIType` profiles | Profiles already correct for turns |

## What Phase 2 *does*
| Feature | Behaviour |
|---------|------------|
| **Budgeted soft AI** | Each pass touches up to `KD_AI_RT_BUDGET` (default 12) enemies, nearest first |
| **Rotate cursor** | Far enemies still get occasional attention |
| **Wander goal refresh** | Stuck / missing / absurd `gx,gy` → new nearby or random point |
| **movePoints drip** | In explore only, gently reduce `movePoints` so next world tick steps sooner |
| **Noise investigate** | Soft retarget toward last heard noise (`KDAINotifyNoise` / SoundPresence if present) |
| **Engage gate** | Hostile within `KD_TIME_ENGAGE_RANGE` → **no** soft AI (combat = pure vanilla turns) |

## Enable
```js
KD_AI_RT_ENABLED = true;
KD_TIME_IDLE_TICK_ENABLED = true;  // recommended: world still advances via Phase 1
KD_AI_RT_BUDGET = 12;
KD_AI_RT_MOVEPOINTS_DRIP = 0.35;
KD_AI_RT_FOLLOW_NOISE = true;
KDAIRealtimeGetState()
```

## API
```js
KDAIRealtimeTick()           // one soft pass
KDAIRealtimeGetState()       // debug snapshot
KDAINotifyNoise(x, y)        // mark investigate point
```

## Architecture
```
Phase 1 KDTime (optional idle AdvanceTime)
    → vanilla enemy turn AI + pathfinding (unchanged)
    → Phase 2 soft-touch (goals, drip, noise) between / after ticks

Combat (engaged)
    → Phase 1 idle OFF automatically
    → Phase 2 soft AI OFF
    → only player-driven turns
```

## Next phases (not this commit)
3. Player movement continuous / dual input  
4. Combat cooldowns as timers (still optional)  
5. True velocity path following / visual interpolation  
