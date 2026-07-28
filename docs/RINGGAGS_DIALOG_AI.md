# RingGags Dialog AI (optional, removable)

Adaptive dialogue **banks** for open-mouth / drool / breath flavor.
Not required for core ring gags or drool overlays.

## Files

| Path | Role |
|------|------|
| `Game/src/restraint/special/RingGagsDialogAI.ts` | Banks, weighted pick, session learning, kill switch |
| This doc | Enable / disable / remove |

## Soft disable (keep file, no AI picks)

In `RingGagsDialogAI.ts`:

```ts
var RG_DIALOG_AI_ENABLED = false;
```

Rebuild. Call sites should fall back to `TextGet("KinkyDungeonOpenGagMumble" + n)` or static lines.

## Hard remove

1. Remove from `tsconfig.json`:
   ```json
   "Game/src/restraint/special/RingGagsDialogAI.ts",
   ```
2. Delete `Game/src/restraint/special/RingGagsDialogAI.ts`
3. Remove any `RG_PickDialog(...)` call sites (or leave them behind `typeof RG_PickDialog === "function"` guards)
4. `npm run build`

## Wire (optional, local)

After pull, add to `tsconfig.json` next to other RingGags entries:

```json
"Game/src/restraint/special/RingGagsDialogAI.ts",
```

Example speech pick:

```ts
if (typeof RG_DIALOG_AI_ENABLED !== "undefined" && RG_DIALOG_AI_ENABLED
	&& typeof RG_PickDialog === "function") {
	msg = RG_PickDialog({ bank: "OpenGag/Mumble", onlyOpenGag: true, turn: KinkyDungeonCurrentTick || 0 });
} else {
	msg = TextGet("KinkyDungeonOpenGagMumble" + gagMsg);
}
```

Drool flavor:

```ts
RG_PickDialog({ bank: "Drool/Start", droolStage: RG_State.DroolStage });
```

## Learning scope

- Session weights + anti-repeat only (not saved to disk by default).
- Failures are caught; fallback strings always return.
- Does not invent free-form text — only curated bank lines.

## Git

Branch: `feature/ringgags-port`  
Revert this add-on: `git revert` on the Dialog AI commit, or hard-remove steps above.
