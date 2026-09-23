#!/usr/bin/env bash
# Download Google Fonts TTFs straight from github.com/google/fonts.
# fonts.googleapis.com serves a consent page to curl, so go to the source.
#
#   bash fetch_fonts.sh "Space Grotesk" Inter Audiowide   # → ./fonts/
#
# Variable fonts arrive as one file (e.g. Inter[opsz,wght].ttf); pick the
# weight with the wght axis (PIL: font.set_variation_by_name('Bold')).
set -euo pipefail
OUT="${OUT:-fonts}"
mkdir -p "$OUT"

for family in "$@"; do
  slug=$(echo "$family" | tr '[:upper:]' '[:lower:]' | tr -d ' ')
  found=0
  for licence in ofl apache ufl; do
    api="https://api.github.com/repos/google/fonts/contents/${licence}/${slug}"
    list=$(curl -fsS "$api" 2>/dev/null || true)
    [ -z "$list" ] && continue
    echo "$list" | python3 -c '
import json, sys
for f in json.load(sys.stdin):
    if f["name"].endswith(".ttf"):
        print(f["download_url"])
' | while read -r url; do
      name=$(basename "$(python3 -c 'import sys,urllib.parse;print(urllib.parse.unquote(sys.argv[1]))' "$url")")
      curl -fsSL "$url" -o "$OUT/$name"
      echo "  $OUT/$name"
    done
    found=1
    break
  done
  [ "$found" = 1 ] || echo "!! $family not found in google/fonts" >&2
done
