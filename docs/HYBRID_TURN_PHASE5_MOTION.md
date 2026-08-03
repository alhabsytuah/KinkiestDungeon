# Phase 5a — Continuous sub-tile positions / velocity

**Module:** `Game/src/base/KDContinuousMotion.ts`

## Gap closed
| Missing | Status |
|---------|--------|
| Continuous sub-tile positions / velocity | **Done (visual layer)** |

## How it works
- Logical position remains integer `entity.x` / `entity.y` (collision & AI unchanged).
- Each frame, `visual_x` / `visual_y` lerp toward logical tile.
- Player velocity exposed as `KDMotionPlayerVel` / `__kd_vx` on entities.
- Snap if distance &gt; `KD_MOTION_SNAP_DIST` (teleports / floor change).

Drawing code that already prefers `visual_x`/`visual_y` when present will look smooth. If a draw path only uses `x,y`, enable still helps systems that read visual fields.

## Enable
```js
KD_MOTION_LERP_ENABLED = true;
KD_MOTION_LERP_SPEED = 12;
KD_MOTION_INCLUDE_ENEMIES = true;
KDMotionGetState()
```

## Not yet (later items)
2. Per-frame enemy attacks / path following  
3. Real-time combat action economy  
4. Struggle as true per-second physics  
5. Full replacement of AdvanceTime / KDAIType / FindPath (not planned as hard cutover)
