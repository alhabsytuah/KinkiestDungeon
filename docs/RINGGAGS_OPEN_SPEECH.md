# RingGags open-mouth speech (OpenGag keys)

## What shipped

- `Game/src/restraint/special/RingGagsDialogue.ts` registers:
  - `KinkyDungeonOpenGagMumble0`–`9`
  - `KinkyDungeonOpenGagMumbleAroused0`–`9`
  - `KinkyDungeonOpenGagStruggle` / `StruggleQuiet` / `Restraint` 0–9
- Idle mumble is routed via **`KDDoMumble`** when `RG_HasOnlyOpenGags()` (does not overwrite vanilla `KinkyDungeonGagMumble*`).
- `TextGet` fallback still remaps `KinkyDungeonGag*` → `KinkyDungeonOpenGag*` for struggle/restraint paths.

## Local build (Windows CMD)

```cmd
cd /d D:\Games\SET\KinkiestDungeon
git fetch origin
git checkout feature/ringgags-port
git pull

REM If RingGags.ts is still a stub on the branch:
git checkout 958321e682171d7586fd2d186d296297b5be700d -- Game\src\restraint\special\RingGags.ts

REM Ensure tsconfig lists RingGagsDialogue.ts right after RingGags.ts

REM Fix silent helpers if needed: var g: any = ...
npm run build
npm run serve
```

## Verify (browser console)

```js
TextGet("KinkyDungeonOpenGagMumble0")   // expect "Aahh..."
RG_HasOnlyOpenGags()                    // true with only ring gag
```

Idle mumble with only a ring gag should show open sounds, not `Mmmph...`.
