#!/usr/bin/env bash
# Snap a rough timecode to the nearest detected pause from work/silences.tsv.
# Prints the pause and suggested in/out points with the air rules applied:
# ~120ms before the first word (in-point), ~180ms after the last consonant (out-point).
#
#   bash nearest_pause.sh 1234.5 [window_s=3]
set -euo pipefail
T="$1"; W="${2:-3}"
awk -v t="$T" -v w="$W" -F'\t' '
  { s=$1; e=$2; if (e+0 >= t-w && s+0 <= t+w)
      printf "pause %8.3f – %8.3f (%.2fs)   a clip STARTING after it: in %.3f   a clip ENDING into it: out %.3f\n", s, e, $3, e-0.12, s+0.18 }
' work/silences.tsv
