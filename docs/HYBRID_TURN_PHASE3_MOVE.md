# Phase 3 — Player Movement & Input

**Branch:** `feature/ringgags-port`  
**Module:** `Game/src/player/KDPlayerMoveRealtime.ts`  
**Depends on:** Phase 1 `KDTimeClock` (engage check), optional Phase 2 AI

## Goal
Continuous-*feeling* exploration movement without replacing Ada's turn movement.

## Default (flags off)
Unchanged:
- Click tile to move
- Single key presses still handled by vanilla
- One action → one turn

## When `KD_PLAYER_RT_ENABLED = true` (explore only)
| Input | Behaviour |
|-------|------------|
| **Hold WASD / arrows / numpad** | Discrete tile steps every `KD_PLAYER_RT_STEP_MS` (default 120ms) |
| **Shift** | Sprint flag passed into move input |
| **Diagonal** | Allowed if `KD_PLAYER_RT_DIAGONAL` (default true) |
| **Hostile in engage range** | Hold-to-step **stops**; combat is classic turns |

Each step uses the official pipeline:
```js
KDSendInput("move", { dir, delta: 1, ... })
```
or fallback `KinkyDungeonMove(...)`.

So stamina, slow, restraints, collision, and world advance stay vanilla.

## Enable
```js
KD_PLAYER_RT_ENABLED = true;
KD_PLAYER_RT_STEP_MS = 120;
KD_TIME_IDLE_TICK_ENABLED = true; // optional: NPCs keep acting while you walk
KD_AI_RT_ENABLED = true;          // optional Phase 2
KDPlayerMoveRTGetState()
```

## Not in Phase 3
- True continuous coordinates / velocity physics
- Replacing click-pathfinding
- Real-time combat movement while engaged

## Stack so far
| Phase | Module |
|-------|--------|
| 1 Time | `KDTimeClock.ts` |
| 2 AI | `KDAIRealtime.ts` |
| 3 Move | `KDPlayerMoveRealtime.ts` |
