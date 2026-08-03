# Hybrid completion pack

**Module:** `Game/src/base/KDHybridComplete.ts`

Closes the residual “still incomplete” continuous list as far as is safe without rewriting Ada’s engine from zero.

| Gap | How addressed |
|-----|----------------|
| Continuous logical positions | `KD_LOGICAL_MOTION` fractional move toward next tile + visual track |
| Draw paths → visual_x/y | `KDEntityVisualPos()` helper + `KD_DRAW_VISUAL_HOOK` |
| Per-frame enemy damage | `KD_RT_ENEMY_DAMAGE` adjacent soft charge → wantAttack |
| Full RT combat | `KD_RT_COMBAT_FULL` player GCD on attack/spell |
| Struggle RT unlock | `KD_STRUGGLE_RT_UNLOCK` at threshold fires real struggle |
| Balanced preset | `KDHybridEnableRecommended()` |
| In-game debug UI | F8 overlay |
| Save/load RT flags | localStorage `KDHybridFlags_v1` |
| Performance | completion logic on one pump; other modules still own theirs |
| KDSendInput wrap order | single master wrap: GCD → econ → struggle → logical |

## From-scratch rewrites
AdvanceTime / KDAIType / FindPath remain **mediated** (replace layers). A pure from-scratch body is not shipped — that is a multi-month fork.

## Enable everything
```js
KDHybridEnableRecommended()
```

Disable:
```js
KDHybridDisableAll()
```
