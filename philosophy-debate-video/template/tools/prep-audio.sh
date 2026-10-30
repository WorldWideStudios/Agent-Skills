#!/bin/sh
# Trims pauses, speeds 10%, normalises each raw TTS line, word-times it, then aligns
# the timed words onto the script's own tokens (words/all.json, one entry per token).
#   sh tools/prep-audio.sh
set -e
cd "$(dirname "$0")/.."
mkdir -p assets/vo words
for f in assets/voice/l*.mp3; do
  b=$(basename "$f")
  ffmpeg -v error -y -i "$f" -af "silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.02,silenceremove=stop_periods=-1:stop_duration=0.22:stop_threshold=-40dB,areverse,silenceremove=start_periods=1:start_threshold=-40dB:start_silence=0.05,areverse,atempo=1.1,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 -c:a libmp3lame -b:a 192k "assets/vo/$b"
  npx --yes hyperframes@0.8.185 transcribe "assets/vo/$b" --json >/dev/null 2>&1
  mv assets/vo/transcript.json "words/${b%.mp3}.json"
done
python3 - <<'PY'
import json, glob, re, difflib
script = {l['id']: l['text'].split(' ') for l in json.load(open('script.json'))['lines']}
norm = lambda t: re.sub(r"[^a-z0-9]", '', t.lower())
out = {}
for f in sorted(glob.glob('words/l*.json')):
    lid = f[6:9]
    d = json.load(open(f)); w = d if isinstance(d, list) else d.get('words', d.get('segments'))
    heard = [(x.get('text', x.get('word')), x['start'], x['end']) for x in w]
    toks = script[lid]
    times = [None] * len(toks)
    sm = difflib.SequenceMatcher(None, [norm(t) for t in toks], [norm(h[0]) for h in heard], autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): times[a + k] = (heard[b + k][1], heard[b + k][2])
    # tokens the transcript spelled differently: spread them across the gap between known neighbours
    end = heard[-1][2] if heard else 0
    i = 0
    while i < len(toks):
        if times[i] is None:
            j = i
            while j < len(toks) and times[j] is None: j += 1
            t0 = times[i - 1][1] if i else 0.0
            t1 = times[j][0] if j < len(toks) else end
            step = (t1 - t0) / (j - i)
            for k in range(i, j): times[k] = (t0 + step * (k - i), t0 + step * (k - i + 1))
            print(f'  {lid}: guessed {" ".join(toks[i:j])!r}')
            i = j
        else: i += 1
    out[lid] = [(t, round(s, 2), round(e, 2)) for t, (s, e) in zip(toks, times)]
json.dump(out, open('words/all.json', 'w'))
for k, v in out.items(): print(k, round(v[-1][2], 2), ' '.join(t for t, s, e in v))
PY
