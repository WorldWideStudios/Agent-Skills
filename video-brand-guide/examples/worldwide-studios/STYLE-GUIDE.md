# Worldwide Studios — Summary Video Style Guide

**v2.4 · Sept 2026** (title/end lockup: shared left edge, block centred). Illustrated version: **[`index.html`](index.html)**
— type specimens and true-scale card layouts.

> Worked example for the `video-brand-guide` skill. This is the guide written for
> the Worldwide Studios *AI for Education Fellowship* summary videos, with the
> project-specific parts (the roster, frame audits of individual cuts, the
> per-file work list) removed. Swap the tokens and names for your own.

v1 described the *website* and contradicted every frame that shipped. This
replaces it. Tokens are read from `worldwide-studios.org`; where the site and
the cuts disagree, the cuts win.

---

## Colour

**The system is light.** White ground, black type — every card, every frame,
both aspect ratios. Dark is a deliberate exception, never a default and never a
fallback.

| Token | Hex | Role |
|---|---|---|
| Paper | `#ffffff` | The ground. Flat — no grid, glow, texture or tint. |
| Ink | `#0b0b0b` | All type, every size. Not `#000`. |

### Accents

One accent in a frame, carried as **type colour on a single line**. Amber
belongs to this fellowship; mint belongs to the org. The rest are for sibling
programmes and never mix.

| Token | Hex | Belongs to |
|---|---|---|
| Amber | `#fdc743` | AI for Education |
| Mint | `#32fc98` | Worldwide Studios |
| Royal | `#2979ff` | Cool accent |
| Pink | `#ff1b6b` | High-energy accent |
| Purple | `#8b2fff` | High-energy accent |

Amber is the only yellow in the system. It runs ~1.9:1 on white — that is not a
reason to put it on a fill, it is the reason it only lands on one short payoff
line per card, at D2 or larger. A fully saturated yellow breaks up on white
under h264 chroma subsampling, so render masters at `--crf=14`.

---

## Type scale — one ramp, both formats

16:9 is 1920×1080. 9:16 is 1080×1920. **Both have a 1080px short edge**, so
these values are correct in both and a card lifts between formats untouched.

| Step | Size | Face | Tracking | Leading | Job |
|---|---|---|---|---|---|
| D1 Hero | 150 | Audiowide | −0.01em | 1.08 | The one stat number. One per film. |
| D2 Title | 112 | Audiowide | −0.01em | 1.16 | Title and end card lockup. |
| D3 Payoff | 84 | Space Grotesk 700 | −0.04em | 1.10 | The line that lands. Amber lives here. |
| D4 Statement | 64 | Space Grotesk 700 | −0.03em | 1.16 | Display lines, 3–6 words. |
| D5 Secondary | 48 | Space Grotesk 700 | −0.03em | 1.22 | Stat labels, continuations. |
| C Caption | 46 | Inter 600 | 0 | 1.42 | Verbatim speech only. |
| D6 Name | 34 | Space Grotesk 700 | −0.02em | 1.20 | Speaker name. **Not Audiowide.** |
| D7 Label | 24 | Inter 600 | +0.14em | 1.40 | Roles, eyebrows, URL. The floor. |

- Nothing below **24**.
- Two steps per card, three at most. Never adjacent steps.
- **72px margin** on every edge, both formats.
- Max measure **34 characters** per display line. Break for sense, never mid-phrase.
- Labels and roles set in **ink**, not grey. Hierarchy comes from size and weight.

### The three faces
- **Audiowide** — D1 and D2 only, at the site's **−0.01em** (`.hero-summit-name`).
  The wordmark face. Never a name, role, label or sentence. The site's inline
  wordmark SVG stretches it with `lengthAdjust`; the video never does.
- **Space Grotesk 700** — carries the argument. Uppercase; tracking tightens as
  it grows, the way the site sets it (−0.03em at feature size, −0.04/−0.045em
  on the largest headlines).
- **Inter** — labels at the site's **+0.14em** (`.feature-eyebrow`), verbatim
  captions at C untracked. Nothing in between. Buttons, where they appear, +0.08em.

---

## Two text modes

**A · Display lines** (curated — you chose these words) — left-aligned,
uppercase, Space Grotesk, one amber payoff line, **word-synced**: each word
appears on the frame it is spoken, not a line at a time.

**B · Verbatim captions** (everything they said) — centred, sentence case,
Inter 600, the spoken word taking the accent as **colour**. Constant padding on
every word so the line never reflows.

Neither ever sits on a fill.

---

## Cards

**Title** — the logo, then three lines at D2: `AI FOR` / `EDUCATION` /
`FELLOWSHIP`, amber on EDUCATION alone. This is the site's own hero verbatim
(`.hero-summit-name`, `.accent-orange` on EDUCATION, `--text` on FELLOWSHIP).
No rule, no date strip, no eyebrow. The name is stated once, at the top.

**The lockup is one left-aligned block.** The logo (300px wide), the three
lines and — on the end card — the domain all share **one left edge**. The logo
is *not* centred over the lines; its left edge sits on the text's left edge.
That whole block is then centred on the card, both axes:

```
blockW = max(logoW, width("FELLOWSHIP"))      # FELLOWSHIP is always the widest
x_left = (W - blockW) / 2                      # every element's left edge
y_top  = (H - blockH) / 2                      # blockH = logo + 46 gap + 3×D2 lines (+ domain)
```

Same card, same numbers, in 16:9 and 9:16. Measure on the rendered frame (ink,
not layout boxes): logo, AI FOR, EDUCATION, FELLOWSHIP and domain left edges
within ~2px, block centre within ~4px of the card centre.

*History, so it isn't repeated:* v2.2 said "lines right-align" and its HTML
specimen centred the logo over them. Cuts copied the specimen, were then rebuilt
all-right-aligned (v2.3) — both wrong. Settled: **left edge, block centred.**

**End** — the same left-aligned block closing the film, plus
`worldwide-studios.org` at D7 in sentence case, flush left under FELLOWSHIP
(28px gap). No headline, no CTA, no wordmark on its own. The title and end card
are the same component with one flag — build it once and reuse it.

**Display** — curated line, left-aligned, D7 lead-in into D3, amber payoff last.

**Stat** — numbers **left-stacked**, all at D1 in Audiowide, all ink, all
landing on the same frame, label at D5 on the same baseline. No bars, no rules,
no colour-coding, no centred columns: Audiowide's glyph widths are unequal
enough that centring makes "5M" read smaller than "1,000" at the same size.
Keep a stat to the figure and a short label.

**Lower third** — name at D6, role at D7. White chip with a 10px amber edge
over footage; plain type when it sits on paper. Full names, always.

---

## Names

Full name, then the person's own credential — no "Fellow ·" prefix. Keep one
table of every person who may appear, and copy names from it, never from a
transcript or a meeting tile.

| Name | Role line |
|---|---|
| Full Name | Co-founder, Worldwide Studios |
| Full Name | 30 years in education |
| Full Name | Teacher · 10 years in the classroom |
| Full Name | Computer science student · City |

- Surname always. First-name-only and misspellings shipped in several cuts
  before this table existed.
- Someone whose camera was off is out of *that* edit only — they stay on the
  roster and their footage is used wherever it exists.
- Confirm preferred names against the legal / platform display name.
- A meeting platform's baked-in lowercase name label must be cropped or
  covered — never sitting next to a set name.

---

## Motion

- **`cubic-bezier(.16, 1, .3, 1)`** on everything — the site's own curve. Fast
  in, long settle, no bounce. Entrances ~0.45s.
- Cards wipe left to right so a speaker change is visible.
- **Nothing is still animating when the card is meant to be read.**

## Picture

- Cut on **detected silences**, never on SRT cue boundaries — cues run through
  sentence ends and clip words.
- People appear in their **full source frame**. Cropping in cuts heads and
  shoulders.
- Centre every card on one axis so consecutive beats don't jump.
- Pillarbox portrait feeds on **paper**, never black.
- Meeting spotlight view lags the speaker switch (1s+ is common) — grab the
  frame before trusting a timestamp.

## Sound

Audio is where most of the re-cuts came from. Lines arrived clipped, or with a
breath still hanging off the end.

- Find boundaries with **`silencedetect=n=-34dB:d=0.16`**, then confirm each one
  by cutting it and re-transcribing for **content**.
- Leave about **120ms of air before the first word** and **180ms after the last
  consonant**. Less clips the word; more reads as a stall.
- **Never cut on a consonant.** "a lot of opport—", "every two wee—" both
  shipped and both had to be re-cut.
- **Trim the trailing breath.** The tail after a line is audible even when the
  meter looks flat.
- **A fade does not hide the next phrase.** If a following sentence leaks in,
  shorten the clip — don't ramp the volume.
- Start a quote on the phrase that **introduces** it, not on the quote itself,
  or the line lands as a fragment.
- Every beat needs a **verbal hand-off**. A freeze with no audio bridge reads as
  lag, not as a pause.
- Whisper word timings **shift with the clip window**. Cut to final length
  first, read cues off that exact file, bias ~60ms early.
- Master around **−14 LUFS** at `--crf=14`, with a CRF-23 `+faststart` web copy
  alongside.

---

## Never

Amber behind type · two accents in one frame · rules, dividers and the progress
bar · numbered sections (a real site pattern — film has no navigation to anchor
it) · Audiowide set small · stretched Audiowide · black pillarbox · type on a
plate over faces · baked-in Meet labels · grid, glow or texture · clipping the
last word · leaving a trailing breath · the word **"launch"** — these are
*summary videos*, in titles, filenames, folders, post copy and alt text.

---

## Before you render

- [ ] Every size is one of 24, 34, 46, 48, 64, 84, 112, 150.
- [ ] One accent in the frame, as type, on one line.
- [ ] No rule, bar, divider or plate anywhere.
- [ ] Audiowide only at D1/D2, at −0.01em, unstretched.
- [ ] Title and end card: logo + three lines (+ domain) flush **left** on one shared edge, block centred on the card, amber on EDUCATION. Pull the frame and check every left edge lines up.
- [ ] Every name spelled as in the names table, with a surname.
- [ ] 72px margin on every edge.
- [ ] Nothing still animating when the card is meant to be read.
- [ ] No line clipped on a consonant; no trailing breath.
- [ ] Master at `--crf=14`, ~−14 LUFS, CRF-23 `+faststart` web copy alongside.
- [ ] "summary", not "launch", in the filename and the post copy.
