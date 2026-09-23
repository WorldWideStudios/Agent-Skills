---
name: summary-video
description: Cut a recorded live session (a Zoom/Google Meet kickoff, cohort call, demo day) into a 60–75s public summary video — title card, the premise, the hosts on why it exists, a montage of participants each giving one reason in their own words, the deal, the numbers, the ask, end card — with ffmpeg for the clips, Remotion for the edit and an original synthesised score. Use for "make a summary video of this call", "cut a recap of the kickoff", "turn this session recording into a short film for LinkedIn", or any montage-style cut of a group call.
---

# Summary video

A 60–75 second public film cut from a live group session, told from the host
organisation's point of view. Its middle is a montage of participants each
saying, in their own voice, why they are there.

What's in this skill:

| Path | What |
|---|---|
| `SKILL.md` | The procedure (this file) |
| `PROMPT.md` | A prompt to hand an agent to run the whole thing |
| `scripts/` | ffmpeg helpers: map the session, snap to pauses, cut clips, check clips, finish |
| `template/` | A Remotion project: the edit is one JSON beat table, the score reads the same table |

Pair it with the `video-brand-guide` skill: the template ships with an example
brand (tokens in `template/src/lib/theme.ts`); replace them with yours.

Requirements: `ffmpeg`/`ffprobe`, Node 18+, Python 3 (stdlib only).

---

## 0. What has to be true of the recording

The film only exists if the recording contains **a go-round where every
participant answers one question in their own words.** Everything else can be
worked around. If you are advising before the session:

| Requirement | Why | If it's missing |
|---|---|---|
| A go-round on one question ("Who are you and why are you here?"), uninterrupted | It's the whole middle of the film | No film. Record a separate round. |
| Cameras on | A voice with no face can't carry a beat | That person is out of this edit (not off the roster) |
| Speaker/spotlight view at 1080p, not gallery | Gallery tiles are too small | Use gallery for one wide beat only |
| The host says the thesis out loud | The premise card should be a quote | Write it as type |
| The host states the deal — what you give, what you require | The deal and the ask beats | Pull from the programme doc |
| **Public-use clearance stated on the record** | Faces and voices go public | Get it in writing before publishing |
| No AI notetaker bots | They take a tile in spotlight | Remove them at the start |
| Let people finish | A clean 2–6s answer with silence around it is cuttable | Talked-over lines are lost |

**Do not publish faces, names or voices without clearance.** If the call opens
with "this is internal", stop and ask the owner.

## 1. Inputs

```
session.mp4      the spotlight-view recording
transcript.srt   machine transcript (cue timing is fine — it is only for finding lines)
names table      every person's full name and exact role line (from the brand guide)
brand tokens     colours, faces, logo, title lockup
```

## 2. Map the session (~20 min)

```bash
bash scripts/map_session.sh session.mp4        # → work/full.wav, work/silences.tsv
```

The silence list is **the only legitimate source of cut points.** Subtitle cues
run straight through sentence ends and will clip words.

Read the transcript end to end and mark candidate lines with timecodes. Don't
skim — the best line is rarely someone's first sentence.

## 3. Choose the lines

1. **One line per person, and it answers the question** (why are you here). Not
   their job title — that goes on the name plate. The audio carries motive.
2. **2–6 seconds each.** Under 2s reads as a glitch; over 6s the montage sags.
3. **Their own words, no narrator over them.**
4. **Anyone without video is out of this edit.** They stay on the roster.
5. **Seven is plenty.** Pick range (student / teacher / operator / career
   changer), not seniority. Write down who you left out and why.
6. **Two host lines on why the thing exists, right after the premise.**

## 4. Cut the clips (where the bugs live)

For each line:

```bash
bash scripts/nearest_pause.sh <rough_start>     # snap the in-point to a pause
bash scripts/nearest_pause.sh <rough_end>       # snap the out-point to a pause
bash scripts/energy.sh <t0> <len>               # only if you must cut inside speech
bash scripts/frame.sh session.mp4 <in>          # whose face is actually on screen?
bash scripts/frame.sh session.mp4 <out>
bash scripts/cut_clip.sh session.mp4 <in> <dur> template/public/clips/<name>.mp4 [video_lag]
```

- **Air:** ~120ms before the first word, ~180ms after the last consonant.
  `nearest_pause.sh` prints both.
- **Never cut on a consonant.** "a lot of opport—" and "every two wee—" both
  shipped once and both had to be re-cut. Listen to the last 0.3s of every clip.
- **Trim the trailing breath**, and any "uh / so yeah" tail.
- **A fade does not hide a leaking next phrase.** Shorten the clip.
- **Start a quote on the phrase that introduces it** ("and the only requirement
  is…"), not on the quote, or it lands as a fragment. On a card beat, cover the
  lead-in with the eyebrow and land the lines ~1s ahead of the words
  (`linesAt`).
- **Spotlight lag.** Meet/Zoom switch the picture late — a few frames up to tens
  of seconds. A transcript timestamp often shows the *previous* speaker. Check
  the frame at both ends. For a lag of a few frames, don't move the audio: pass
  `video_lag` (e.g. `0.16`) and the clip holds its first correct frame over the
  gap. For a long lag, pick another line.
- Every clip is loudness-normalised (mics differ ~15 dB on a call), faded
  40ms/100ms, re-encoded to 30fps so beat maths is exact, and pillarboxed on
  white if portrait. `cut_clip.sh` prints the minimum beat length in frames.

## 5. Build the edit

```bash
cd template && npm install
```

**The edit is `src/cut.json`** — one row per beat: scene, length in frames, the
clip, the words. `make-music.py` reads the same file, and the score ducks off
the same rows, so picture, mix and music can't drift apart.

Scenes: `title`, `display`, `clip`, `voice` (a display card over a hidden clip,
for its audio), `stats`, `end`.

**Hard rule: a footage beat is at least as long as its clip file.** A shorter
beat truncates the file and clips the last word — the most repeated bug in
this workflow. Check:

```bash
bash ../scripts/check_clips.sh .    # beat vs file length, speech end, first-frame contact sheet
```

### Structure

| # | Beat | Share | Example |
|---|---|---|---|
| 1 | Title — logo + name lockup | 5% | 3.2s |
| 2 | Premise — the thesis, one sentence | 6% | "The world should look a lot different than it is today." |
| 3 | Why it exists — two host clips | 12% | 7s |
| 4 | Turn — the question the montage answers | 3% | "Why people are here." 1.8s |
| 5 | Montage — one reason each | 45–50% | 7 people, ~28s |
| 6 | The deal — what you provide | 7% | "We set the floor. You set the ceiling." |
| 7 | The proof — the numbers | 8% | 3 stats, 5s |
| 8 | The ask — what they owe you | 9% | "Ship something new every two weeks." |
| 9 | End card — lockup + domain | 5% | 3.2s |

- **Name the thing once, at the top.** Don't repeat it mid-film.
- **Hard cuts only.** No wipes, slides or dissolves. Pace comes from beat length.
- **One idea per beat.** No stat grids beside headlines, no tickers, no stacked
  cards, no letter-by-letter kinetic type. The first version of the reference
  film had all of it; the note was "too heavy — good structure, too much per
  sequence". The second note was "fast cuts that get to the point".
- **Wrap on the requirement**, not a summary. The last thing said is what
  participants have to do.
- **Stat cards: the number and a short label.** Nuance that is true of one
  person reads as true of everyone on a card.

### Design defaults (override with your brand guide)

- Flat light ground on every card, ink type, **one accent**, as type colour on
  the payoff line only — never a highlighter block behind text.
- Title and end card are one component: logo, name lines and domain share one
  left edge; the block is centred. Measure the rendered frame.
- Name plates are white chips with a 10px accent edge — text straight on
  webcam footage breaks over unpredictable backgrounds.
- Full source frame for people. Push a baked-in platform name label out with
  `punch` (~1.13) only if the plate can't cover it.
- No progress bar, rules, dividers, grids or texture.

## 6. The score

```bash
python3 make-music.py     # → public/audio/score.wav, ~15s, deterministic
```

Original and synthesised (pads, kick, sub, hats, pluck arpeggio, risers,
impacts) — nothing to licence. Tag beats in `cut.json` with
`"marker": "title" | "montage" | "floor" | "lift" | "end"` and the arrangement
lands on them: impact as the title lands, arpeggio in with the montage,
breakdown on the deal, lift on the numbers, hit on the end card. **Re-run after
any change to beat lengths.** 118 BPM suits "get to the point"; 100 felt like a
corporate sizzle reel. The mix ducks to 0.2 under speech and sits at 0.74 over
cards, with 9-frame ramps.

## 7. Render and deliver

```bash
npx remotion render SummaryFilm out/draft.mp4 --scale=0.5     # fast draft
rm -f out/master.mp4 && npx remotion render SummaryFilm out/master.mp4 --crf=14
bash ../scripts/finish.sh out/master.mp4                      # loudness + web copy
```

Render **one at a time, in the foreground, to a path you deleted first** — two
renders to one path leave a truncated file. Master at CRF 14 (a saturated
yellow breaks up on white at higher CRF); ~−14 LUFS; web copy CRF 23
`+faststart`, under ~30 MB.

Ship alongside: a long post, a short post, and alt text that states the runtime.
Call it a **summary video** in the filename, post and alt text — it summarises
a session that happened; "launch" claims a moment it isn't.

## 8. Pre-flight

- [ ] Clearance for faces and voices is on the record
- [ ] Every clip's first frame shows the right person (`work/contact-sheet.png`)
- [ ] Every beat ≥ its clip (`check_clips.sh` all OK)
- [ ] No clip starts or ends mid-word; no breath or filler tail
- [ ] Every name and role spelled from the names table, surname included
- [ ] One colour system, one accent; no stray dark card
- [ ] Score regenerated after the last beat change
- [ ] Master + web copy + post copy; runtime in the alt text is right

## 9. Failure modes already hit

| Symptom | Cause | Fix |
|---|---|---|
| Last word clipped | Cut on a subtitle cue | Snap to a detected pause |
| Last word clipped, again | Beat shorter than its clip | Beat ≥ file length |
| Quote opens on a fragment | In-point on the quote | Back up to its lead-in |
| Wrong face for a few frames | Spotlight lag | `video_lag` + held first frame |
| Counter settles on 999+ | `Easing.out(Easing.exp)` never reaches 1 | Snap > 0.995 to 1 (done in `Counter`) |
| Logo is a white box | Opaque white logo background, inverted | Use it as-is on light; never invert |
| Tops of capitals shaved | Masked reveal, tight line-height | Pad the mask by 0.1 × font size (done in `Line`) |
| Truncated output | Two renders to one path | Delete, render once, foreground |
| Score off the picture | Markers hard-coded | Markers come from `cut.json` |

## Budget

About four hours for a ~50-minute source: 20 min mapping, 60 min choosing and
cutting, 90 min building and revising, 20 min score, 30 min renders and copy.
