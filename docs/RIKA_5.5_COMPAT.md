# Rika's Custom Restraints — 5.5 compatibility notes

Scripts live under [`Mods/RikasCustomRestraints/`](../Mods/RikasCustomRestraints/) on branch `feature/ringgags-port`.

## Button unclickable fix (modbuild 1.73)

**Cause:** All three `.ks` files called `KinkyDungeonLoad()` / `KinkyDungeonLoadStats()` at parse time. In 5.5 this re-enters init and breaks UI input.

**Fix:** Remove every top-level occurrence of those two calls. Keep the `originalKinkyDungeonLoad` override inside `RikasCustomRestraintsGraphic.ks`.

Quick local fix on an unpacked pack:

```bash
cd Mods/RikasCustomRestraints
bash APPLY_1.73_FIX.sh
```

(Also remove the *early* `KinkyDungeonLoad()` pair near the top of `RikasCustomRestraintsGraphic.ks` if present.)

## Assets
Copy `TextureAtlas/`, `Models/`, `DisplacementMaps/`, and the other asset folders from the original Rika release into `Mods/RikasCustomRestraints/`.

## Version history
- **1.71** — mod.json 5.5 gate + Red_Hi shim
- **1.72** — full English, atlas/displacement hardening
- **1.73** — no early Load (button fix), safer lock shim, Load override guard
