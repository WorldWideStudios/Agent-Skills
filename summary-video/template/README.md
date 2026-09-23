# Summary video — Remotion template

```bash
npm install
python3 make-music.py                 # writes public/audio/score.wav from src/cut.json
npm run dev                           # Remotion Studio, to scrub and edit
npm run draft                         # half-scale render → out/draft.mp4
npm run render                        # master at CRF 14 → out/master.mp4
```

| File | What to change |
|---|---|
| `src/cut.json` | **The edit.** One row per beat. Frames at 30fps. |
| `src/lib/theme.ts` | Brand: colours, type scale, title lines, domain, logo. |
| `src/lib/fonts.ts` | The three faces (Google Fonts via `@remotion/google-fonts`). |
| `public/clips/` | Clips cut with `../scripts/cut_clip.sh`, named as the `src` in `cut.json`. |
| `public/` | Your logo, if `BRAND.logo` names one. |

## Beat rows

```jsonc
{"scene": "title",   "frames": 96, "marker": "title"}
{"scene": "display", "frames": 108, "eyebrow": "optional", "lines": ["…"], "payoff": "accent line"}
{"scene": "clip",    "frames": 147, "src": "p1", "name": "Full Name", "role": "Role line", "punch": 1}
{"scene": "voice",   "frames": 163, "src": "ask", "eyebrow": "…", "lines": ["…"], "payoff": "…", "linesAt": 40}
{"scene": "stats",   "frames": 150, "eyebrow": "…", "stats": [{"value": 5, "suffix": "M+", "label": "…"}]}
{"scene": "end",     "frames": 96, "marker": "end"}
```

- `clip` and `voice` beats must be **≥ their clip file's length** in frames —
  `cut_clip.sh` prints the minimum; `../scripts/check_clips.sh .` verifies all.
- `voice` shows the card and plays the clip's audio (picture hidden). Use it for
  the deal, the ask and screen-share moments. `linesAt` is the frame the lines
  land — set it ~1s before the words.
- `marker` drives the score: `title`, `montage`, `floor`, `lift`, `end`.
  Re-run `make-music.py` after any length change.
- Speech beats duck the score automatically.
