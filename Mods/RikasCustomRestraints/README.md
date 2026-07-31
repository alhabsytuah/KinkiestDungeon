# Rika's Custom Restraints — 5.5-compatible (modbuild 1.73)

Ported/fixed for KinkiestDungeon **5.5** on the `feature/ringgags-port` line.

## Status on this branch
| File | In repo? |
|------|----------|
| `mod.json` (1.73) | yes |
| `RikasCustomHairpin.ks` (no early Load) | yes |
| `IsekaiWeapon.ks` | **add locally** — run `APPLY_1.73_FIX.sh` on your 1.72 pack |
| `RikasCustomRestraintsGraphic.ks` | **add locally** — run `APPLY_1.73_FIX.sh` + remove early Load near top |
| Asset folders (TextureAtlas, Models, …) | **copy from original pack** |

## Quick setup
1. Unpack the original Rika 1.7.1 (or the 1.72 5.5_compat zip) into `Mods/RikasCustomRestraints/`.
2. Overwrite `mod.json` and `RikasCustomHairpin.ks` with the versions from this folder.
3. Run:
   ```bash
   bash APPLY_1.73_FIX.sh
   ```
4. In `RikasCustomRestraintsGraphic.ks`, also delete the **early** pair near the top:
   ```js
   KinkyDungeonLoad()
   KinkyDungeonLoadStats()
   ```
   (Leave the `originalKinkyDungeonLoad` override intact.)
5. Launch the game — buttons should work again.

See also [`docs/RIKA_5.5_COMPAT.md`](../../docs/RIKA_5.5_COMPAT.md).

## Credit
Original mod by 核_弹 (Rika). 5.5 compatibility + English + UI fix on this fork.
