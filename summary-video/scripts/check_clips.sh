#!/usr/bin/env bash
# Pre-flight every clip against the beat table:
#   - beat frames >= clip file length (a shorter beat truncates the last word)
#   - where speech ends (last silence_start) and how much tail is left
#   - a contact sheet of first frames, to confirm the right face opens each clip
#
#   bash check_clips.sh [project_dir=.]
set -euo pipefail
P="${1:-.}"
python3 - "$P" <<'PY'
import json, subprocess, sys, os, re
p = sys.argv[1]
cut = json.load(open(os.path.join(p, 'src', 'cut.json')))
fps = cut['fps']; bad = 0
for b in cut['beats']:
    if 'src' not in b: continue
    f = os.path.join(p, 'public', 'clips', b['src'] + '.mp4')
    if not os.path.exists(f):
        print(f"MISSING  {b['src']}"); bad += 1; continue
    dur = float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
    log = subprocess.run(['ffmpeg','-i',f,'-af','silencedetect=noise=-34dB:d=0.10','-f','null','-'],capture_output=True,text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    speech_end = starts[-1] if starts and starts[-1] > dur * 0.5 else dur
    beat = b['frames'] / fps
    ok = beat + 1e-3 >= dur
    bad += not ok
    print(f"{'OK  ' if ok else 'SHORT'}  {b['src']:14} file {dur:6.3f}s  beat {beat:6.3f}s  speech ends {speech_end:6.3f}s  tail {dur-speech_end:5.2f}s")
sys.exit(1 if bad else 0)
PY
mkdir -p "$P/work/firsts"
for f in "$P"/public/clips/*.mp4; do
  ffmpeg -v error -y -i "$f" -frames:v 1 -vf "scale=384:-1" "$P/work/firsts/$(basename "$f" .mp4).png"
done
ffmpeg -v error -y -pattern_type glob -i "$P/work/firsts/*.png" -vf "tile=4x4:padding=6:color=white" -frames:v 1 "$P/work/contact-sheet.png" \
  && echo "contact sheet → $P/work/contact-sheet.png"
