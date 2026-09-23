#!/usr/bin/env bash
# Grab the exact frame at a timecode. Meeting spotlight views lag the audio by a
# few frames to tens of seconds, so a transcript timestamp often shows the
# PREVIOUS speaker. Check the in-point and the out-point of every clip.
#
#   bash frame.sh session.mp4 <t_s> [out.png]
set -euo pipefail
OUT="${3:-work/frame-$2.png}"; mkdir -p "$(dirname "$OUT")"
ffmpeg -v error -y -ss "$2" -i "$1" -frames:v 1 -vf scale=480:-1 "$OUT" && echo "$OUT"
