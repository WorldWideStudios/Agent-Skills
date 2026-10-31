#!/bin/sh
# Fetch the track and make the softened copy the engine plays.
# "TODAY I DID GOOD (Gunna Trap Type Beat)" on Pixabay, Pixabay Content License:
# free to use in a video, not to redistribute on its own, so it isn't committed.
# 140 BPM; its drop is at 13.77s and its bass re-enters 32 bars later (the flash).
set -e
cd "$(dirname "$0")/../public/music"
curl -sL -A "Mozilla/5.0" -o today-i-did-good.mp3 "https://cdn.pixabay.com/download/audio/2024/11/16/audio_f916054906.mp3"
# Shelve down the sub-bass and hi-hats so the voice sits on top (the original
# mix lets the 808 dominate and the loudness pass then squashes the voice).
ffmpeg -v error -y -i today-i-did-good.mp3 \
  -af "highpass=f=32,lowshelf=f=95:g=-9,equalizer=f=3000:t=q:w=0.9:g=-4,highshelf=f=7500:g=-5" \
  -c:a libmp3lame -b:a 256k today-i-did-good-soft.mp3
echo "music ready: $(ffprobe -v error -show_entries format=duration -of csv=p=0 today-i-did-good.mp3)s (expect ~150.9)"
