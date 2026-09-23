#!/usr/bin/env bash
# RMS level every 25ms — for finding a word boundary inside continuous speech.
# A dip to ~-35 dB between -18 dB stretches is a word boundary; below -45 dB is a real pause.
#
#   bash energy.sh <start_s> <length_s> [wav=work/full.wav]
set -euo pipefail
T0="$1"; LEN="$2"; WAV="${3:-work/full.wav}"
ffmpeg -v error -ss "$T0" -t "$LEN" -i "$WAV" \
  -af "asetnsamples=400,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" \
  -f null - 2>&1 | awk -v t0="$T0" '/RMS_level/{split($0,a,"="); printf "%8.3f  %6.1f dB\n", t0 + n*0.025, a[2]; n++}'
