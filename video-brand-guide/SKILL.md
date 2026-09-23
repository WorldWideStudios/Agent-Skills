---
name: video-brand-guide
description: Build a video brand guide (style guide) for an organisation from its website — colour tokens, a single type scale that works in both 16:9 and 9:16, card layouts, motion/picture/sound rules, a "Never" list and a pre-render checklist — as a Markdown file plus an illustrated HTML sheet. Use for "make a brand guide for our videos", "write a style guide from our site", "why do our cuts keep needing rework on typography", or before cutting the first branded video for a new org or programme.
---

# Video brand guide

A video style guide exists so every cut stops re-deciding the same things —
which colour, which face, what size, where the logo goes. If each new cut
still needs three or four rounds of notes on type and colour, the guide is
wrong, not the edits.

The output is two files that say the same thing:

- `STYLE-GUIDE.md` — the rules, short enough to read before every cut.
- `STYLE-GUIDE/index.html` — the illustrated version: true-scale type
  specimens, the cards drawn at real proportions, a small diagram per "Never"
  item.

A complete worked example is in `examples/worldwide-studios/`. Start from
`templates/STYLE-GUIDE.template.md`.

---

## The lesson that shaped this skill

The first version of the guide this skill came from was a **scrape of the
website**. It was accurate about the site and wrong about video: it named the
site's mint as the accent, told you to put accent colours on dark, set hero type
white on black and used numbered sections. Every shipped frame contradicted it,
so every cut re-litigated the same decisions. Three identical copies of it in
three folders made it worse.

So: **the website gives you tokens; the approved cuts give you rules.** Where
they disagree, the cuts win. Keep exactly one copy of the guide, version it, and
archive the previous version instead of leaving it lying around.

---

## Path

### 1. Scrape the tokens from the site

```bash
python3 scripts/scrape_tokens.py https://example.org            > tokens.txt
python3 scripts/scrape_tokens.py https://example.org/some/page  >> tokens.txt
```

It fetches the page and every linked stylesheet, then prints CSS custom
properties, every hex colour by frequency, font families, and every selector
that sets `letter-spacing` / `line-height` / `text-transform`. Run it on the
home page **and** on the page for the specific programme — programmes often
override the org accent inline (a `.accent-orange` on one page, mint
everywhere else).

Read the output for:

| What | Where it usually lives | Why it matters |
|---|---|---|
| Ground + ink | `--bg`, `--text`, `body{}` | Ink is rarely `#000`. Use the real value. |
| Org accent vs programme accent | `--accent`, page-level overrides | They must never share a frame. |
| Faces and their jobs | `--font-display`, `--font-body`, `--font-accent` | A wordmark face is not a text face. |
| **Tracking per selector** | `.hero-*`, `.eyebrow`, `.btn`, `h1` | Copy it; don't guess. Display type usually tightens as it grows (−0.03em → −0.045em); eyebrows are tracked out (+0.12–0.14em). |
| Radii | `--radius` | Cards vs pills. |
| The hero lockup | the programme page's `<h1>` | The title card should match it verbatim — same line breaks, same accented word. |

### 2. Get the fonts and the logo

```bash
bash scripts/fetch_fonts.sh "Space Grotesk" Inter Audiowide   # → fonts/*.ttf
```

`fonts.googleapis.com` returns a consent page to `curl`; the script pulls TTFs
straight from `github.com/google/fonts` instead. Variable fonts come as one file
— select the weight with the axis, not a filename.

Download the logo and **check whether its background is transparent**:

```bash
python3 -c "from PIL import Image; im=Image.open('logo.png'); print(im.mode, im.getpixel((0,0)))"
```

A logo that is black artwork on an *opaque* white background renders as a
white box on dark. Use it on light as-is, or put it on a white card — never
`invert()` it.

### 3. Decide the system, then write it down as one sentence

"White ground, black type, one accent as type colour on one line." Or the dark
equivalent. Pick one; the other is a deliberate exception, never a fallback.
Palette = ground + ink + accents. **Off-white and muted grey are not tokens** —
grey body text and tinted panels read as mistakes on video. Labels and roles set
in ink; hierarchy comes from size and weight.

Assign each accent an owner (org, programme, sibling programme) and state that
**one accent appears per frame**.

### 4. One type scale for both aspect ratios

1920×1080 and 1080×1920 share a **1080px short edge**, so a single set of pixel
sizes is correct in both and a card lifts between formats untouched. Define
steps, not sizes, and nothing else:

| Step | Size | Job |
|---|---|---|
| D1 | 150 | The one hero number |
| D2 | 112 | Title / end card lockup |
| D3 | 84 | The payoff line (the accent lives here) |
| D4 | 64 | Display statements, 3–6 words |
| D5 | 48 | Stat labels, continuations |
| C  | 46 | Verbatim captions |
| D6 | 34 | Speaker name |
| D7 | 24 | Labels, roles, eyebrows, URL — **the floor** |

Rules to state with it: nothing under the floor; two steps per card, three at
most, never adjacent; one margin on every edge (72px); a max measure per display
line (~34 characters). The project that produced this skill had **21 distinct
sizes across four cuts** before the scale existed; that is what "the typesetting
still isn't right" meant.

Give each face a fenced-off job: the wordmark face at D1/D2 only and never
stretched; the display face for the argument; the body face for labels
(tracked) and verbatim captions (untracked), nothing in between.

### 5. Name the two text modes

Most collisions come from mixing these:

- **Display lines** — words you chose. Left-aligned, uppercase display face, one
  accent payoff line, last.
- **Verbatim captions** — words they said. Centred, sentence case, body face,
  the spoken word taking the accent as *colour*, constant padding so the line
  never reflows.

Neither sits on a fill. Emphasis is a colour change, never a highlighter block.

### 6. Specify each card exactly

Title, end, display, stat, lower third. For the title/end lockup give the
geometry as a formula, not a description, and say how to check it:

```
blockW = max(logoW, widest line)
x_left = (W - blockW) / 2        # every element's left edge
y_top  = (H - blockH) / 2
```

"Measure ink edges on the rendered frame, not layout boxes." Ambiguous words
("right-justified", "centred") cost two rebuild rounds on this project — the
specimen in the HTML centred the logo, every agent copied the specimen, and it
was wrong. **The HTML specimen is what gets copied, so it must be exactly
right.**

For stats: left-stacked, all one colour, all landing on the same frame, number
and a short label only. Centring numbers in a display face with uneven glyph
widths makes "5M" look smaller than "1,000" at the same size.

### 7. Motion, picture, sound

Write the rules that caused re-cuts. Sound caused most of them: air before and
after words, never cutting on a consonant, trimming the trailing breath, a fade
not hiding a leaking phrase. Keep each rule to one line with a number in it.

### 8. The "Never" list — one diagram per item

A bare list gets skimmed. A 160×90 SVG thumbnail per rule (amber block behind a
word, two accents in a frame, a black pillarbox, a waveform cut through the last
word) makes each one legible at a glance. See the example's `index.html`.

### 9. A pre-render checklist

Ten or so checkboxes that can be verified on a rendered frame: every size on the
scale, one accent, no rules or bars, lockup edges aligned within 2px, names
spelled per the table, margins, nothing still animating when it should be read.

### 10. Build the illustrated sheet

`index.html`, light-mode only if the system is light, the real fonts from Google
Fonts, specimens at true proportion (size cards with container units: a frame of
width W uses `--u: calc(100cqw / 1920)` for 16:9 or `/1080` for 9:16, and every
size is `calc(<px> * var(--u))`). Sections as plain nouns — Colour, Type, Scale,
Cards, Never, Motion/Picture/Sound, Names. **Far less text than you think**: it
is a visual guide, not an essay.

Once you have cuts, add a section of frame audits — real stills, each tagged
Keep / Fix with one line — and a work list of which file in which cut breaks
which rule. Those sections are project-specific and are left out of the example
here.

---

## Feedback that shaped the example (apply by default)

- Section headings are plain nouns. Two-line poetic headings read as generated.
- The type section is a **specimen page** (waterfalls, character sets on
  white), not a row of cards.
- No grey body text and no grey panels in the guide itself.
- Tracking values come from the site's CSS, never from memory.
- A name table with every person's full name and exact role line; misspelled
  names shipped in three cuts before there was one.
- Version the guide in its first line (`v2.4 · <date> · what changed`) and keep
  a one-paragraph history of reversed decisions so they aren't repeated.

## Checklist for the guide itself

- [ ] Tokens scraped from the live site, programme page included
- [ ] Every rule checked against at least one approved frame
- [ ] One copy, versioned; previous version archived
- [ ] Type scale: steps only, both aspect ratios, a floor
- [ ] Two text modes defined
- [ ] Every card specified with numbers; lockup as a formula
- [ ] HTML specimens match the Markdown exactly
- [ ] Never list with a diagram per item
- [ ] Pre-render checklist
