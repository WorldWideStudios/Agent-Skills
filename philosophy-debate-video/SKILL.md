---
name: philosophy-debate-video
description: Make a vertical (1080x1920) ~90s narrated debate video between two philosophers on one question: three rounds (claim, cost, turn) scored on a balance, a narrator who rules on each round, a winner decided because the loser's last move borrows the winner's own rule, and a closing takeaway from both. HyperFrames for the animation, ElevenLabs v3 voices through OpenRouter, public-domain portraits. Use for "make a debate video between X and Y", "Camus vs Pascal on whether you need a reason to live", "a philosopher debate short for TikTok/Shorts", or turning a philosophical disagreement into a scored, looping explainer.
---

# Philosophy debate video

Two philosophers argue one question in three rounds. A narrator explains each
move, a bronze balance keeps score, and the winner wins because the loser's
last move uses the winner's own rule. The last frame rebuilds the first, so the
video loops.

What's in this skill:

| Path | What |
|---|---|
| `SKILL.md` | The procedure (this file) |
| `PROMPT.md` | A prompt to hand an agent to run the whole thing |
| `template/` | A HyperFrames project, set up as a finished debate (Socrates vs Machiavelli, "Is it better to be good, or effective?") |
| `template/lib/debate.mjs` | The engine: writes every scene from the script, word timings and a content object |
| `template/tools/` | `voice.mjs` (TTS), `prep-audio.sh` (trim, time, align), `portraits.py`, `get-sfx.sh`, `build.mjs` (the debate's drawings and copy) |
| `examples/reason-to-live/` | A second finished debate (Camus vs Pascal, "Do you need a reason to live?"): `script.json`, `build.mjs`, `portraits.json` |

Requirements: Node 18+, `ffmpeg`/`ffprobe`, Python 3 with Pillow, an
`OPENROUTER_API_KEY` with credit (ElevenLabs v3 speech), and the HyperFrames
CLI (`npx hyperframes@0.8.185`, fetched on first use). Load the `hyperframes`
skill too if it is installed; it explains the render contract this engine
follows.

---

## 1. The format

13 lines, one scene each. Side **A** is the winner (cobalt, enters from the
left), side **B** the loser (vermilion, enters from the right), the narrator
is on lime. The score goes 0–0 → 1–1 → 2–1 → 3–1.

| # | Who | Scene kind | Job |
|---|---|---|---|
| l01 | ref | `hook` | The question. "Two philosophers. You pick a side." Balance level, both portraits |
| l02 | B | `B` | Round 1: B's claim, in B's own vocabulary |
| l03 | ref | `claim1` | "His claim: …" plain restatement + a so-what line |
| l04 | A | `A` | A's claim |
| l05 | ref | `claim2` | "His claim: …" + gauge; a stone drops on each side (1–1, draw) |
| l06 | B | `B` | Round 2: B attacks A |
| l07 | A | `A` | A's proof (a fact, a life, a quote, not a metaphor) |
| l08 | ref | `point` | Why the proof wins: three stacked words, "Point, A." (2–1) |
| l09 | B | `B` | Round 3: B's pivot, which quietly uses A's rule |
| l10 | A | `A` | A's capture: names that B is now on A's ground |
| l11 | ref | `verdict` | "B did X. That's his rival's rule. A wins." Stamp (3–1) |
| l12 | ref | `test` | The takeaway: one thing to keep from each, as two panels |
| l13 | ref | `bridge` | "Which brings you back to the question." Rebuilds frame 0 |

## 2. Write the script

`script.json` holds the question, the voices and the 13 lines. Rules that
came out of review:

- **Each line rests on one named idea from that philosopher.** Pascal:
  diversion, the wager, "the heart has its reasons". Camus: the absurd,
  philosophical suicide, revolt, Sisyphus. Generic positions read as filler.
- **Real lines and real history,** paraphrased short. No misattributions
  (Machiavelli never wrote "the ends justify the means"). Note which lines are
  paraphrases so a reviewer can check them.
- **The winner is earned by the turn**, not by who sounds better: B's pivot in
  l09 must borrow A's rule, and l10–l11 say so out loud.
- **Narrator wording:** the hook ends "You pick a side." (not "the loser's
  answer leaves your life"). Do not say "That's the tell"; open the verdict
  with what the loser did. Open the takeaway with "So take what's useful for
  you." Avoid "now you're on my side" for the capture.
- **Platform-safe words.** Don't voice "suicide", "killed me" or "got rid of
  me". When the idea needs the word (Camus's *philosophical suicide*), keep it
  in `text`, cross it out on screen with the scene's `strike` list, and give
  the line a `say` that skips it (`"Your wager is philosophical... You kill
  the question…"`). Use "silenced" for a death.
- **Length.** ~190 words lands at 90–95s with ElevenLabs. For ~75s, cut to
  ~150 words; the longest speaker lines (over 125 characters) are the place to
  cut.
- Optional per line: `tag` (an unspoken ElevenLabs delivery cue such as
  `"[cutting]"`, `"[smug]"`) and `say` (spoken text when it must differ from the
  shown text, e.g. `"In 1512"` shown, `"In fifteen-twelve"` said).

## 3. Set up the project

```bash
cp -R template my-debate && cd my-debate
sh tools/get-sfx.sh          # sound effects from the HyperFrames package
```

Edit `script.json` (lines and voices) and `portraits.json`.

**Voices.** ElevenLabs v3 through OpenRouter's `/api/v1/audio/speech`. Use
voice **names** (`"Jessica"`, `"Callum"`, `"George"`, `"Daniel"`, `"Bill"`,
`"Brian"`, `"Alice"`…); some voice IDs are rejected by the route. A distinct
voice per philosopher, one narrator for both.

**Portraits.** `portraits.json` lists each philosopher's Wikimedia Commons
file title (check it is public domain; the script prints the licence), the
source width, the face centre and the face height in that image's pixels.
`python3 tools/portraits.py` writes the duotone card and the round medal.

## 4. Voice, trim and time

```bash
OPENROUTER_API_KEY=... node tools/voice.mjs          # all lines, in parallel
OPENROUTER_API_KEY=... node tools/voice.mjs l07 l11  # just these
sh tools/prep-audio.sh
```

`prep-audio.sh` trims pauses, speeds up 10%, normalises loudness, transcribes
each line with `hyperframes transcribe`, then **aligns the transcript to the
script's own tokens** (`words/all.json`). Words the transcriber spelled
differently are spread across the gap and printed as `guessed`; a guessed word
that you skipped on purpose (a struck word) is expected. Read the transcript
once to confirm no delivery tag was spoken.

## 5. Build: the drawings and the copy

`tools/build.mjs` calls `buildDebate(root, content)`. Everything specific to a
debate is in that content object:

| Key | What |
|---|---|
| `A`, `B` | `{ name, sub, img, medal }`; `sub` is the one-line descriptor under the name |
| `stakes` | `{ chip, text, cue }` for the hook's tag line (e.g. `Your call · pick a side`, cued on `pick`) |
| `question` | Lines of the title: `[text, px, colour ('ink'/'A'/'B'), marginTop]` |
| `scenes` | The 13 scenes: `kind`, `vo`, `pad` (hold after the voice), and for speakers `ill` (drawing), `hi` (words in the accent colour), optional `strike` |
| `ILL` | One drawing per speaker line, `(s, p, ink, acc, h) => { svg, js, initJs? }` in a 960x520 box |
| `claim1` | Ring of four things around "you" (`items`, `itemsCue`, `arrowsCue`, `inward`), or a custom `draw(s, p, h)` in a 960x760 box |
| `claim2` | Gauge: `left`, `right`, `hot` side, needle `moves` `[cue, degrees, duration, ease]`, `flash` |
| `point`, `verdict`, `test` | Card copy and cues; `verdict.dia` is the SVG of the tell, `verdict.chip` the label |
| `sfx` | Extra effects on cue words; the engine already places whooshes, stones, riser and stamp |

**Drawings are what make it.** Each speaker line gets a small animated
diagram of its own idea, timed to its words: `h.at(s, 'word', nth)` is the
scene time of a word in that line. Good ones from the examples: Pascal's reed,
diversions and an infinite hole only infinity fills; a soul orb that cracks on
"wrong" and heals on "suffer"; a boomerang wrong that grazes "them" and comes
back to crack "you"; Florence's dome falling in 1512; a hemlock timeline to
"today". A plain stick figure and two boxes is too weak; reviewers will ask for
more.

```bash
node tools/build.mjs
npx --yes hyperframes@0.8.185 check
```

Then look. Snapshot each scene just before it exits and read the frames:

```bash
npx --yes hyperframes@0.8.185 snapshot --at 5.2,15.1,20.0 --no-end --describe false
```

Gotchas:

- **GSAP x/y/scale replace an SVG element's `transform` attribute.** An
  element positioned with `transform="translate(..) scale(..)"` that you also
  animate must sit inside a `<g transform>` that holds the placement. If you
  skip the wrapper, the shape jumps to the corner or blows up.
- Long names (over 9 letters) get smaller type on the balance automatically;
  check stamps and panel titles for overflow ("Machiavelli wins" needs
  `stampSize: 76`).
- Labels near the 960 px edge of a drawing get clipped; anchor them inside.
- `check` warns that the closing question's hold is under 2s. That is the loop
  seam and is expected; so is the static ~3s hook at frame 0.

## 6. Render

```bash
npx --yes hyperframes@0.8.185 render --quiet -o renders/<name>-vertical.mp4
ffmpeg -nostats -i renders/<name>-vertical.mp4 -af volumedetect -vn -f null - 2>&1 | grep max_volume
```

Expect ~90s, 1080x1920, a peak around −1.5 dB. Watch it with sound before
publishing; the checks don't hear the voices.

## 7. Changing a finished debate

A changed line only needs its own voice: edit `script.json`, then
`node tools/voice.mjs l01 l11`, `sh tools/prep-audio.sh`, `node
tools/build.mjs`, check, snapshot the changed scenes and render again. Cue
words in `build.mjs` must still exist in the new text, or the build stops and
names the missing word.
