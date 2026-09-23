#!/usr/bin/env bash
# Pass 1 — map the session. Writes work/full.wav and work/silences.tsv
# (start, end, length of every pause). The silence list is the ONLY legitimate
# source of cut points: subtitle cues run through sentence ends and clip words.
#
#   bash map_session.sh session.mp4 [noise_db=-32] [min_pause_s=0.12]
set -euo pipefail
IN="$1"; NOISE="${2:--32}"; MIN="${3:-0.12}"
mkdir -p work
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact "$IN"
ffmpeg -v error -y -i "$IN" -vn -ac 1 -ar 16000 work/full.wav
ffmpeg -i work/full.wav -af "silencedetect=noise=${NOISE}dB:d=${MIN}" -f null - 2>&1 \
  | awk '/silence_start/{s=$NF} /silence_end/{printf "%.3f\t%s\t%s\n", s, $5, $8}' > work/silences.tsv
echo "$(wc -l < work/silences.tsv | tr -d ' ') pauses → work/silences.tsv (start  end  length)"
