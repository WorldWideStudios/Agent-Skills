# <Org> — Video Style Guide

**v1 · <date>** (<what changed in this version>). Illustrated version: [`index.html`](index.html)

Tokens are read from `<site>`; where the site and the approved cuts disagree,
the cuts win. One copy of this file exists. Previous versions are archived, not
duplicated.

---

## Colour

**The system is <light | dark>.** <Ground>, <ink> — every card, every frame,
both aspect ratios. <The other mode> is a deliberate exception, never a default
and never a fallback.

| Token | Hex | Role |
|---|---|---|
| Paper | `#______` | The ground. Flat — no grid, glow, texture or tint. |
| Ink | `#______` | All type, every size. |

### Accents

One accent in a frame, carried as **type colour on a single line**.

| Token | Hex | Belongs to |
|---|---|---|
| <Programme accent> | `#______` | <This programme> |
| <Org accent> | `#______` | <The org> |
| … | | |

<Contrast note for any accent below ~3:1 on the ground: where it may appear, at what minimum size.>

---

## Type scale — one ramp, both formats

1920×1080 and 1080×1920 share a 1080px short edge, so these values are correct
in both.

| Step | Size | Face | Tracking | Leading | Job |
|---|---|---|---|---|---|
| D1 Hero | 150 | <wordmark face> | <from site> | 1.08 | The one stat number. |
| D2 Title | 112 | <wordmark face> | <from site> | 1.16 | Title and end card lockup. |
| D3 Payoff | 84 | <display face> | <from site> | 1.10 | The line that lands. Accent lives here. |
| D4 Statement | 64 | <display face> | <from site> | 1.16 | Display lines, 3–6 words. |
| D5 Secondary | 48 | <display face> | <from site> | 1.22 | Stat labels, continuations. |
| C Caption | 46 | <body face> | 0 | 1.42 | Verbatim speech only. |
| D6 Name | 34 | <display face> | <from site> | 1.20 | Speaker name. |
| D7 Label | 24 | <body face> | <from site> | 1.40 | Roles, eyebrows, URL. The floor. |

- Nothing below **24**. Two steps per card, three at most, never adjacent.
- **72px margin** on every edge, both formats. Max **34 characters** per display line.
- Labels and roles in ink. Hierarchy from size and weight, not grey.

### The faces
- **<Wordmark face>** — D1/D2 only. Never a name, role, label or sentence. Never stretched.
- **<Display face>** — carries the argument. <Case>, tracking <values from site>.
- **<Body face>** — labels at <site eyebrow tracking>, captions untracked.

---

## Two text modes

**A · Display lines** (words you chose) — left-aligned, <case>, display face,
one accent payoff line, last.

**B · Verbatim captions** (words they said) — centred, sentence case, body face,
the spoken word taking the accent as colour. Constant padding per word.

Neither sits on a fill.

---

## Cards

**Title** — logo, then <the programme name exactly as the site's hero sets it>.

```
blockW = max(logoW, widest line)
x_left = (W - blockW) / 2     # every element's left edge
y_top  = (H - blockH) / 2
```

Check on the rendered frame: left ink edges within ~2px, block centre within ~4px.

**End** — the title block plus the domain at D7. Same component, one flag.

**Display** — D7 lead-in, D3 lines, accent payoff last.

**Stat** — left-stacked, all ink, same frame, figure + short label only.

**Lower third** — name D6, role D7, <chip treatment over footage>.

---

## Names

| Name | Role line |
|---|---|
| | |

---

## Motion

- <easing curve from the site>. Entrances ~0.45s. No bounce.
- Nothing still animating when the card is meant to be read.

## Picture

- Cut on detected silences, never subtitle cue boundaries.
- People in their full source frame; pillarbox on the ground colour.
- Grab the frame at every cut point before trusting a timestamp.

## Sound

- ~120ms air before the first word, ~180ms after the last consonant.
- Never cut on a consonant. Trim the trailing breath.
- A fade does not hide a leaking next phrase — shorten the clip.
- Start a quote on the phrase that introduces it.
- Master ~−14 LUFS; a CRF-23 `+faststart` web copy alongside.

---

## Never

<One line each; one diagram each in the HTML.>

---

## Before you render

- [ ] Every size is one of 24, 34, 46, 48, 64, 84, 112, 150.
- [ ] One accent in the frame, as type, on one line.
- [ ] Wordmark face only at D1/D2, unstretched.
- [ ] Title and end card edges aligned; block centred.
- [ ] Every name spelled as in the table, with a surname.
- [ ] 72px margin on every edge.
- [ ] Nothing still animating when it should be read.
- [ ] No line clipped on a consonant; no trailing breath.
