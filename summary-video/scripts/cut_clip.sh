#!/usr/bin/env bash
# Cut one line out of the session as a normalised 30fps clip.
#
#   bash cut_clip.sh session.mp4 <audio_in_s> <dur_s> public/clips/<name>.mp4 [video_lag_s=0]
#
# audio_in / dur come from detected pauses (map_session.sh), never subtitle cues.
# video_lag: if the spotlight switches a few frames late, seek the picture that
# much later and hold its first frame over the gap, instead of moving the audio.
# Every clip is loudness-normalised (mics on a call differ by ~15 dB) and faded
# 40ms in / 100ms out. A fade does NOT hide a leaking next phrase — shorten dur.
set -euo pipefail
IN="$1"; A="$2"; DUR="$3"; OUT="$4"; LAG="${5:-0}"; FPS="${FPS:-30}"
V=$(python3 -c "print($A + $LAG)")
FO=$(python3 -c "print(max(0, $DUR - 0.10))")
mkdir -p "$(dirname "$OUT")"
ffmpeg -v error -y -ss "$V" -i "$IN" -ss "$A" -i "$IN" -t "$DUR" \
  -filter_complex "[0:v]tpad=start_duration=${LAG}:start_mode=clone,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:white,fps=${FPS}[v];
                   [1:a]loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.04,afade=t=out:st=${FO}:d=0.10[a]" \
  -map "[v]" -map "[a]" -t "$DUR" -c:v libx264 -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -ar 48000 -ac 2 "$OUT"
FRAMES=$(python3 -c "import math; print(math.ceil($DUR * $FPS))")
echo "$OUT  ${DUR}s → beat needs frames >= $FRAMES"
