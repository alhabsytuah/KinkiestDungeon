# Core replace layers (AdvanceTime / KDAIType / FindPath)

Branch: `feature/ringgags-port`

These close the three “Not started” items. **Vanilla remains default.** Flip flags to activate.

| Flag | Module | What changes |
|------|--------|----------------|
| `KD_REPLACE_ADVANCE_TIME` | `KDAdvanceTimeReplace.ts` | Mediates `KinkyDungeonAdvanceTime` (scale, batch, clock sync) |
| `KD_REPLACE_AITYPE` | `KDAITypeReplace.ts` | Continuous hunt/wander/investigate/flee profile ticks |
| `KD_REPLACE_FIND_PATH` | `KDFindPathReplace.ts` | Cached FindPath + continuous repath budget |

## Enable all three
```js
KD_REPLACE_ADVANCE_TIME = true;
KD_REPLACE_AITYPE = true;
KD_REPLACE_FIND_PATH = true;

// Recommended together with hybrid explore:
KD_TIME_IDLE_TICK_ENABLED = true;
KD_AI_RT_ENABLED = true;
KD_MOTION_LERP_ENABLED = true;

KDAdvanceTimeReplaceGetState()
KDAITypeReplaceGetState()
KDFindPathReplaceGetState()
```

## Honesty
- **AdvanceTime**: still calls original per step; adds mediation, not a from-scratch clock.
- **KDAIType**: continuous goal/profile overlay; does not delete Ada’s AI tables.
- **FindPath**: same A* solver; replace = cache + continuous repath policy.

A pure from-scratch rewrite of all three would be a multi-month engine fork. This is the production-safe “complete these” form.
