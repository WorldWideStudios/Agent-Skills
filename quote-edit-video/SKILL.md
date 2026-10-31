---
name: quote-edit-video
description: Make a vertical (1080x1920) 57s narrated "quote edit" of one philosopher in the dark-portrait style of the stoic quote accounts on TikTok, turned hopeful: one deep narrator over one unbroken trap beat, gold typographic captions that build word by word, portraits of the author that open from an eye slit to full frame with slow eye pans, then a black reset, a flickering montage, the author's cut-out rising from the bottom, a white-orange burn flash on the beat and a held portrait. Remotion engine driven by one config per video; Deepgram Aura-2 voice through OpenRouter; public-domain/CC0 portraits from Wikimedia Commons. Use for "make a quote edit for Marcus Aurelius", "a Seneca TikTok like the stoic accounts but positive", "dark portrait quote video", or "another one like the Dostoevsky beauty video".
---

# Quote edit video

A 57-second narrated portrait edit. It opens on an eye slit with the first word
already on screen, grows shot by shot to full frame, cuts to black, rebuilds
through a flickering montage while the author's cut-out rises into frame, and
lands on the closing quote with a burn flash on the 32nd bar of the music.

It copies the structure of a viral dark edit (@thestoicprestige's Dostoevsky
"we are all monsters") cut by cut, but points it at hope: gold instead of red,
a warm grade, a hopeful beat, and a real closing line from the author.

What's in this skill:

| Path | What |
|---|---|
| `SKILL.md` | The procedure (this file) |
| `PROMPT.md` | A prompt to hand an agent to run the whole thing |
| `template/` | A Remotion project set up as a finished edit: Marcus Aurelius, "Very little is needed to make a happy life" |
| `template/src/quoteEdit.tsx` | The engine: builds a composition from one config |
| `template/src/edits/` | One config per video (`MarcusAureliusHappyLife.tsx`) |
| `template/scripts/` | One narration script per video |
| `template/tools/` | `get-music.sh`, `fetch-portraits.py`, `commons.py`, `eyes.swift`, `cutout.swift`, `voice.mjs`, `finish.sh` |
| `examples/seneca-life-is-long/` | A second finished edit (Seneca, "Life is long, if you know how to use it"): script, config, portrait sources |

Requirements: Node 18+, `ffmpeg`/`ffprobe`, Python 3 (stdlib), macOS with
Xcode command line tools (`swift`, for the Vision face finder and cut-out), and
an `OPENROUTER_API_KEY` with a little credit (Aura-2 is cheap; a full script is
cents). Captions use Bodoni 72 (ships with macOS); elsewhere they fall back to
Didot/Playfair/Georgia. Load the `remotion` skill too if it is installed.

---

## 1. The format

Everything sits on the music grid: 140 BPM, frame 0 is the track's drop, and
the flash is the track's own bass re-entry 32 bars later (54.86s). The video
ends 1.5 bars after that (57.4s, 1723 frames).

| Time | What happens |
|---|---|
| 0–~4s | **Eye slit** (a small window on the eyes), dead still. Frame 0 already shows the first word; it is the thumbnail |
| ~4–8s | **Band**: a full-width strip on the eyes; the face drifts up behind it |
| ~8–12s | **Deep band**: closer, taller; the face drifts down |
| then | **Box**, **top**, **tall**, then a run of **full-frame** shots, cut on the bar or beat nearest their anchor word, each drifting up or down and pushing in slowly |
| after l09 | **Black.** Captions carry on alone |
| l10 | **Reset**: a thin band of 4-frame flickering portraits grows over one bar, then opens to full frame |
| l10–l14 | The author's **cut-out slides up from the bottom edge** over a dimmed flicker until it fills the frame |
| 54.86s | **Burn flash**: the picture blows out to white with an orange burn on the bar, then settles on the **held portrait** with a warm glow and gold dust |

Captions: gold Bodoni, one phrase at a time, words snapping in on their spoken
time. A phrase marked `^` is a stacked lockup: big words stacked, small words
(to, be, the, of, a…) tucked to the right. Key words are drawn brighter.

**Music.** One continuous pass of the track; it never drops out. It ducks
under each spoken line, rises in the pauses and plays full from the flash.
"TODAY I DID GOOD (Gunna Trap Type Beat)" from Pixabay (Pixabay Content
License: free in a video, not redistributable on its own). `get-music.sh`
downloads it and makes the softened copy the engine plays. The beat grid,
drop and flash constants at the top of `quoteEdit.tsx` belong to this track;
a different track needs its own BPM, drop and a 32-bar landmark.

## 2. Write the script

`scripts/<name>.json`: `title`, `voice` (an Aura-2 voice; `aura-2-zeus-en` is
the deep narrator), `tempo` (0.86–0.9: slow and heavy), `lead` (0.3), `tail`
(3.2), and **14 lines** `{ id: "l01".."l14", text, gap }`. Optional `say` when
the spoken text must differ from the shown text.

The 14 lines follow the original's rhetoric, which is what makes it land:

| Line | Shape | Marcus example |
|---|---|---|
| l01 | Hook, a flat claim | "Every morning is a gift." |
| l02 | The twist on it | "Most of us just forget to open it." |
| l03 | "Man X, yet Y" | "Man complains of the night, yet the sun still rises for him." |
| l04 | "He X, yet Y" | "He curses the obstacle, yet the obstacle becomes the way." |
| l05 | "The greatest … are not … but …" (the longest line) | "The strongest men are not the ones who never fall, but the ones who rise each morning to do the work of a human being." |
| l06 | "A man who … will …" + three short fragments | "…will find peace anywhere. In a palace. In a war tent. In a storm." |
| l07 | "And so, he is far … than …" | "And so, he is far richer than the one who owns the world." |
| l08 | "Nothing is easier than …" | "Nothing is easier than to blame the world." |
| l09 | "Nothing is more … than …" (the screen goes black after it) | "Nothing is more powerful than to change your mind about it." |
| l10 | "The line between … is not … but …" (the reset) | "The line between a good day and a bad one is not drawn by fortune, but by your thoughts." |
| l11 | The author's idea, plainly | "Your soul takes the color of your thoughts." |
| l12 | The turn to the viewer | "So do not wait for a better life." |
| l13 | The command | "Begin it today." |
| l14 | **The real quote** (lands just before the flash) | "Very little is needed to make a happy life." |

Rules that came out of review:

- **Hopeful, not grim.** The point of the format is the dark style carrying an
  optimistic message.
- **Only l14 is presented as a quote, and it must be real** (Meditations 7.67;
  On the Shortness of Life 1). Everything else is narration built from the
  author's ideas; say so when you hand it over, and list sources.
- **Narration must end before ~54.6s.** `voice.mjs` prints where it ends.
  Tighten `gap`s or raise `tempo` slightly if it runs long; the engine throws
  if a line overlaps the flash.

## 3. Set up the project

```bash
cp -R template my-edits && cd my-edits
npm install
sh tools/get-music.sh
```

## 4. Portraits

Use **portraits of the author only**: busts, coins, engravings, paintings,
photos. Mixing in mood images (landscapes, light, other people) was rejected
in review. 9–12 images is right.

1. Find them: `python3 tools/commons.py "Marcus Aurelius" "Busts of Marcus Aurelius"`
   lists files in Commons categories with licence, size and a 1080px thumb URL.
   Use **public domain, CC0 or "No restrictions" only**, so no credit line is
   needed.
2. List them in `public/<folder>/SOURCES.txt`, one per line:
   `head-gray.jpg — File:Roman - Portrait of the Emperor Marcus Aurelius - Walters 23215.jpg — Public domain`
3. `python3 tools/fetch-portraits.py <folder>` downloads them at up to 1280px
   wide (re-checks the licence; safe to re-run after a rate limit).
4. Eyes: `swift tools/eyes.swift public/<folder>/*.jpg` prints each image's
   size, eye midpoint `fx fy` and face width `fw` as fractions. Vision often
   misses statues and engravings ("noface"). Measure those by eye on a grid:
   `ffmpeg -i img.jpg -vf "drawgrid=w=iw/10:h=ih/10:t=2:c=red@0.8" grid.jpg`.
   **Check every value**: a wrong `fy` puts hair or a chin in the eye slit.
5. Cut out the hold portrait (a front-facing bust on a plain background works
   best): `swift tools/cutout.swift public/<folder>/bust.jpg public/<folder>/bust-cutout.png`.
   Look at the PNG; the cut-out must be the same size as its source.

## 5. Voice

```bash
OPENROUTER_API_KEY=... node tools/voice.mjs scripts/<name>.json
```

It trims, sets the pace, times every word (syllable-weighted over the speech,
pauses skipped), then **masters** each line (EQ for warmth and presence,
compression, limiter at −1.5 dB) so the voice sits on top of the music.
Writes `public/vo/<name>/` and `src/timeline/<name>.json`. TTS is cached in
`vo-cache/`, so re-running after a script change only pays for changed lines.

## 6. The config

Copy `src/edits/MarcusAureliusHappyLife.tsx`, rename, and register it in
`src/Root.tsx`. Its keys:

| Key | What |
|---|---|
| `timeline`, `vo` | The timeline JSON and the `public/vo/` folder name |
| `phrases` | Per line, the caption phrases in order; `^` = stacked lockup. Word counts must add up to the line's words (the engine names the line if not) |
| `keyWords` | RegExp of upper-case words drawn brighter (the hopeful nouns) |
| `pics` | `pic(file, width, height, fx, fy, fw)` from step 4 |
| `shots` | `{ at: [line, wordIndex], on: "bar" \| "beat", pic, layout, face?, flip? }`. Layouts: `slit`, `band`, `deep`, `box`, `top`, `tall`, `full`. `face` overrides the face width in px (`W * 0.8`) |
| `flicker` | Pic ids for the ending montage |
| `hold` | `{ pic, cutout }`: the held portrait and its cut-out |

Shot list that works (14 shots): `slit` at l01 word 0 (bar), `band` on l02,
`deep` on l03, `box` on l04, `top` on l05, `tall` late in l05, then `full`
shots on beats through l06 (3–4 of them, on the fragments), l07, l08, and two
in l09. Alternate close faces (`face: W * 1.0–1.1`) with wider ones (`W * 0.5–0.7`).
Put the most striking images on the slit, the band and the final full shots.

## 7. Render and check

```bash
npx remotion studio                                    # scrub it
sh tools/finish.sh <CompositionId> out/<name>.mp4      # render + encode
```

`finish.sh` renders, encodes H.264 + AAC with loudness at −13 LUFS and prints
the levels. Then look:

```bash
ffmpeg -ss 0 -t 24 -i out/<name>.mp4 -vf "fps=2,scale=160:-1,tile=8x6" -frames:v 1 sheet-a.jpg
ffmpeg -ss 24 -t 34 -i out/<name>.mp4 -vf "fps=2,scale=160:-1,tile=8x9" -frames:v 1 sheet-b.jpg
```

Read both sheets: every window should show eyes (not hair, chin or
background), captions must be readable, the cut-out should rise smoothly and
fill the frame by the flash. You can't hear the result; say so and ask for a
listen before publishing.

Mix check, if a listener calls the music harsh or the voice buried: compare
band levels against a reference with
`ffmpeg -i out.mp4 -af "lowpass=f=100,astats=measure_perchannel=none" -f null -`
(and `bandpass=f=250:width_type=h:w=200`, `…f=800…w=600`). The sub-bass should
sit within ~2 dB of the 250 Hz band, where the voice lives. If the bass is well
above it, the loudness pass is squashing the voice to fit the 808.

## 8. Adding the example

From your project, with `EX` pointing at this skill's `examples/seneca-life-is-long`:

```bash
mkdir -p public/seneca && cp $EX/SOURCES.txt public/seneca/
cp $EX/seneca-life-is-long.json scripts/
cp $EX/SenecaLifeIsLong.tsx src/edits/
python3 tools/fetch-portraits.py seneca
swift tools/cutout.swift public/seneca/marble-pink.jpg public/seneca/marble-pink-cutout.png
OPENROUTER_API_KEY=... node tools/voice.mjs scripts/seneca-life-is-long.json
```

Then add it to `EDITS` in `src/Root.tsx` and render.
