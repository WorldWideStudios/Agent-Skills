#!/bin/sh
# Copies the sound effects the build uses out of the HyperFrames package into
# assets/sfx (Pixabay Content License: fine inside rendered videos, not for
# redistributing on their own, so they are not committed here).
#   sh tools/get-sfx.sh
set -e
cd "$(dirname "$0")/.."
bin=$(npx --yes -p hyperframes@0.8.185 which hyperframes)
src="$(dirname "$bin")/../hyperframes/dist/skills/media-use/audio/assets/sfx"
mkdir -p assets/sfx
for f in whoosh whoosh-short impact-bass-1 impact-bass-2 riser pop click-soft; do cp "$src/$f.mp3" assets/sfx/; done
cp "$src/CREDITS.md" assets/sfx/
ls assets/sfx
