#!/usr/bin/env bash
# Pass 6 — measure the master and make the web copy.
#
#   bash finish.sh out/master.mp4 [out/web.mp4]
#
# Render the master ONCE, in the foreground, to a path you deleted first — two
# renders to the same path leave a truncated file. Target ~-14 LUFS integrated,
# true peak <= -1 dB. The web copy is CRF 23 +faststart, under ~30 MB.
set -euo pipefail
M="$1"; W="${2:-${M%.mp4}-web.mp4}"
echo "== loudness (master)"
ffmpeg -nostats -i "$M" -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:|LRA:)' | tail -3
ffmpeg -v error -y -i "$M" -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 160k -ar 48000 -movflags +faststart "$W"
echo "== web copy: $W  $(du -h "$W" | cut -f1)"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$W" | awk '{printf "runtime %d:%02d (put this in the alt text)\n", $1/60, $1%60}'
