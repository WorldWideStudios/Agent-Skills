#!/bin/sh
# Render a composition and encode it for TikTok/Reels/Shorts.
# usage: sh tools/finish.sh MarcusAureliusHappyLife out/marcus-happy-life.mp4
set -e
cd "$(dirname "$0")/.."
mkdir -p "$(dirname "$2")"
npx remotion render src/index.ts "$1" out/raw.mp4
ffmpeg -v error -y -i out/raw.mp4 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -af loudnorm=I=-13:TP=-1:LRA=9 -c:a aac -b:a 192k -movflags +faststart "$2"
rm out/raw.mp4
ffmpeg -nostats -i "$2" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"
