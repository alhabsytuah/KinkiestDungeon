#!/bin/bash
# Apply 1.73 button fix to a Rika 1.72 (or 1.7.1) unpacked mod folder
set -e
cd "$(dirname "$0")"

for f in IsekaiWeapon.ks RikasCustomHairpin.ks RikasCustomRestraintsGraphic.ks; do
  if [ -f "$f" ]; then
    # Remove trailing naked Load calls
    sed -i '/^KinkyDungeonLoad()$/d;/^KinkyDungeonLoadStats()$/d' "$f"
    echo "Stripped Load calls from $f"
  fi
done

# Note: Graphic also needs the early Load pair removed and lock shim -
# if you still have buttons broken after this, replace Graphic from the 1.73 package.
echo "Done. Re-zip or use unpacked under Mods/RikasCustomRestraints/"
