# Phase 5b — Path following + soft attack readiness (item 2)

**Module:** `Game/src/enemy/KDAIPathFollow.ts`

## Gap
| Missing | Status |
|---------|--------|
| Per-frame enemy attacks / path following | **Partial** — path visual + readiness meter; **no** per-frame damage |

## Why attacks are not fully per-frame
Firing `doattack` every frame would break balance, telegraphs, and multiplayer assumptions. Attack **readiness** (0–1) builds in explore; real hits still need a turn/`AdvanceTime`.

## Enable
```js
KD_PATH_FOLLOW_ENABLED = true;
KD_ATTACK_READY_ENABLED = true;
KDAIPathFollowGetState()
```
