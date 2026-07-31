# Rika's Custom Restraints — 5.5-compatible (modbuild 1.73)

Ported/fixed for KinkiestDungeon **5.5** on the `feature/ringgags-port` line.

## What this folder contains
- Fixed scripts only (English, safe lock shim, **no top-level `KinkyDungeonLoad()`**).
- This is the button-unclickable fix (1.73).

## You still need the assets
Copy these folders/files from the original Rika pack (or from `RikasCustomRestraints_5.5_compat.zip` / the 1.7.1 release) into this folder:

- `TextureAtlas/` (rika-0/1/2 .json + .png)
- `Models/`
- `DisplacementMaps/`
- `Items/`, `Locks/`, `Spells/`, `Outfits/`, `Buffs/`, `Bullets/`, `Enemies/`, `EnemiesBound/`

Then either:
- Zip the whole `RikasCustomRestraints/` folder and drop the zip into the game `Mods/` folder, **or**
- Keep it unpacked under `Mods/RikasCustomRestraints/` (same layout as the example mods).

## Changes vs upstream 1.7.1
| Version | Notes |
|---------|--------|
| 1.71 | `mod.json` gate for 5.5 + Red_Hi lock shim |
| 1.72 | Full English (all CN branches removed), robust atlas/displacement load |
| **1.73** | Removed top-level `KinkyDungeonLoad()` / `KinkyDungeonLoadStats()` from all three `.ks` files (fixes unclickable UI buttons in 5.5). Safer lock shim. Guard on the `KinkyDungeonLoad` override. |

## Credit
Original mod by 核_弹 (Rika). 5.5 compatibility + English + UI fix by the ringgags-port work.
