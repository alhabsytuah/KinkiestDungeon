# Phase 5c / 5d — Action economy + struggle physics (items 3–4)

## Item 3 — Real-time combat action economy
**Module:** `KDActionEconomyRealtime.ts`  
Soft GCD on `KDSendInput` for struggle / attack / spell. Move gating optional (default off).

```js
KD_ACTION_ECON_ENABLED = true;
KD_ACTION_GCD_STRUGGLE_MS = 350;
KD_ACTION_GCD_ATTACK_MS = 400;
KDActionEconGetState()
```

## Item 4 — Struggle per-second physics
**Module:** `KDStruggleRealtime.ts`  
After a struggle input, for ~2.5s progress + SP drain continue in real time.

```js
KD_STRUGGLE_PHYS_ENABLED = true;
KD_STRUGGLE_PHYS_RATE = 0.08;
KD_STRUGGLE_PHYS_SP_PER_SEC = 0.6;
KDStrugglePhysGetState()
```

## Item 5 — Full replacement of AdvanceTime / KDAIType / FindPath
**Not implemented as a hard cutover.** That remains intentionally layered (Phases 1–5 wrap/extend, do not delete Ada's core).
