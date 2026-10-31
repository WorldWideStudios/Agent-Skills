/**
 * The quote-edit engine: an optimistic answer to the dark-portrait quote edits
 * on TikTok (rebuilt from @thestoicprestige's "we are all monsters" frame by
 * frame). One narrated 14-line script (voiced by tools/voice.mjs) over one
 * unbroken pass of a hopeful trap track (public/music/today-i-did-good.mp3,
 * 140 BPM, Pixabay licence; played as today-i-did-good-soft.mp3, the same file
 * with its sub-bass and hi-hats shelved down, see tools/get-music.sh) that
 * starts on its drop at frame 0 and ducks under the voice, then swells into the
 * gaps and the flash:
 * - narration lines snap to beats (l03, l05, l07 to downbeats); captions build
 *   phrase by phrase as typographic lockups (big words, small words tucked
 *   right), snapping in;
 * - portrait shots cut on the bar or beat nearest their anchor word and grow
 *   eye slit → band → box → full frame; the opening slit holds dead still,
 *   then each shot pans the face slowly up or down behind its window
 *   (alternating), and from the fourth shot on also pushes in;
 * - after l09 the screen goes black; on l10 a thin band of flickering portraits
 *   grows, opens to full frame, and the subject's cut-out slides up from the
 *   bottom edge through a 4-frame flicker until it fills the frame; on the
 *   track's 32nd bar (its own bass re-entry) the picture burns out to white
 *   and settles on the held portrait.
 * Each video is a config: its timeline, phrase breaks, portraits (with eye
 * positions), shot list, flicker pool and hold portrait + cut-out.
 */
import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame } from "remotion";
export const W = 1080;
export const H = 1920;

const SERIF = '"Bodoni 72", Didot, "Playfair Display", Georgia, serif';
const GOLD = "#ebb95c";
const GRADE = "sepia(0.55) saturate(1.5) hue-rotate(-10deg) contrast(1.15) brightness(0.72)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (p: number) => p * p * (3 - 2 * p);

// ---------- music grid ----------

const TRACK = "music/today-i-did-good-soft.mp3";
const BEAT = 60 / 140;
const BAR = BEAT * 4;
const DROP = 13.77; // track time of the drop = frame 0
const FLASH = 32 * BAR; // the track's own bass re-entry
const END = FLASH + BAR * 1.5;
const snap = (t: number, unit: number) => Math.round(t / unit) * unit;
const DOWNBEAT_LINES = ["l03", "l05", "l07"];
// music gain: under the voice, between lines, and from the flash on
const DUCK = { talk: 0.4, gap: 0.75, flash: 1 };

// ---------- types ----------

type Timeline = { fps: number; lines: { id: string; start: number; dur: number; words: { w: string; t: number }[] }[] };
/** Image path under public/, size, the eyes' position (fractions) and the face's width as a fraction of the image. */
export type Pic = { src: string; iw: number; ih: number; fx: number; fy: number; fw: number };
type Rect = { x: number; y: number; w: number; h: number };
const FULL: Rect = { x: 0, y: 0, w: 1, h: 1 };
const band = (y: number, h: number): Rect => ({ x: 0, y, w: 1, h });

/** Frame layouts, smallest to largest. `ty` = caption top. */
const LAYOUT = {
  slit: { rect: { x: 0.32, y: 0.27, w: 0.36, h: 0.075 }, face: W * 0.42, ey: 0.5, ty: 0.37 },
  band: { rect: band(0.31, 0.14), face: W * 0.95, ey: 0.62, ty: 0.5 },
  deep: { rect: band(0.29, 0.22), face: W * 1.3, ey: 0.5, ty: 0.56 },
  box: { rect: band(0.3, 0.42), face: W * 0.7, ey: 0.42, ty: 0.76 },
  top: { rect: band(0.1, 0.36), face: W * 0.6, ey: 0.45, ty: 0.52 },
  tall: { rect: band(0.08, 0.8), face: W * 0.5, ey: 0.35, ty: 0.5 },
  full: { rect: FULL, face: W * 0.55, ey: 0.36, ty: 0.46 },
};

/** A shot, anchored to word `at[1]` of line `at[0]` and cut on the bar or beat nearest it. */
export type Shot = { at: [string, number]; on: "bar" | "beat"; pic: string; layout: keyof typeof LAYOUT; face?: number; flip?: boolean };

export type QuoteEditConfig = {
  timeline: Timeline;
  /** Folder of the voiced lines under public/vo/. */
  vo: string;
  /** Phrase breaks per line; ^ marks a stacked lockup. Word counts must match the line text. */
  phrases: Record<string, string[]>;
  /** Words drawn brighter. */
  keyWords: RegExp;
  pics: Record<string, Pic>;
  shots: Shot[];
  flicker: string[];
  /** The held portrait and its background-removed cut-out (same size and framing). */
  hold: { pic: string; cutout: string };
};

const SMALL = /^(TO|BE|THE|OF|A|AN|IT|IS|US|ALL|AND|WHO|WILL|SO)$/;

// ---------- pieces ----------

/**
 * `pic` cropped into `rect` (fractions of the frame) with the face `face` px
 * wide and the eyes at height `ey` of the rect (moved down by `dy` px), pushed in
 * by `push` over `drift`.
 */
const Crop: React.FC<{ pic: Pic; rect: Rect; face: number; ey?: number; drift?: number; push?: number; dy?: number; flip?: boolean }> = ({
  pic,
  rect,
  face,
  ey = 0.5,
  drift = 0,
  push = 0,
  dy = 0,
  flip = false,
}) => {
  const w = rect.w * W;
  const h = rect.h * H;
  const s = Math.max(face / (pic.fw * pic.iw), w / pic.iw, h / pic.ih) * (1 + push * drift);
  const iw = pic.iw * s;
  const ih = pic.ih * s;
  const left = Math.min(0, Math.max(w - iw, w / 2 - pic.fx * iw));
  const top = Math.min(0, Math.max(h - ih, h * ey + dy - pic.fy * ih));
  return (
    <div style={{ position: "absolute", left: rect.x * W, top: rect.y * H, width: w, height: h, overflow: "hidden" }}>
      <Img
        src={staticFile(pic.src)}
        style={{ position: "absolute", left, top, width: iw, height: ih, filter: GRADE, transform: flip ? "scaleX(-1)" : undefined }}
      />
    </div>
  );
};

type Phrase = { stacked: boolean; from: number; to: number; words: { w: string; at: number }[] };

/** The current phrase as a lockup: stacked big words with small words tucked to the right, or one small line. */
const Captions: React.FC<{ phrases: Phrase[]; keyWords: RegExp; frame: number; top: number }> = ({ phrases, keyWords, frame, top }) => {
  const p = phrases.find((x) => frame >= x.from && frame < x.to);
  if (!p) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: top * H - 60,
        left: 0,
        width: W,
        padding: "60px 60px",
        display: "flex",
        justifyContent: "center",
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,0,0,0.5), transparent)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: p.stacked ? "column" : "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: SERIF,
          fontWeight: 700,
          lineHeight: p.stacked ? 0.9 : 1.05,
          letterSpacing: 1,
        }}
      >
        {p.words.map((w) => {
          const small = p.stacked && SMALL.test(w.w);
          return (
            <span
              key={w.w + w.at}
              style={{
                visibility: frame >= w.at ? "visible" : "hidden",
                fontSize: p.stacked ? (small ? 62 : Math.min(168, 1450 / w.w.length)) : 76,
                alignSelf: small ? "flex-end" : undefined,
                color: keyWords.test(w.w) ? "#ffdc94" : GOLD,
                textShadow: "0 3px 10px rgba(0,0,0,0.95), 0 0 36px rgba(0,0,0,0.85)",
                margin: p.stacked ? 0 : "0 12px",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Gold dust in the final hold. */
const Motes: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 36 }, (_, i) => {
      const y = (random(`y${i}`) * H - frame * (0.6 + random(`s${i}`) * 1.4) + H * 4) % (H + 40);
      const x = random(`x${i}`) * W + Math.sin(frame / 40 + i) * 18;
      const r = 2 + random(`r${i}`) * 4;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: r,
            height: r,
            borderRadius: r,
            background: GOLD,
            boxShadow: `0 0 ${r * 4}px ${GOLD}`,
            opacity: amount * (0.25 + 0.6 * random(`o${i}`)),
          }}
        />
      );
    })}
  </AbsoluteFill>
);

// ---------- the engine ----------

/** Builds a quote-edit composition and its length in frames from a config. */
export function quoteEdit(cfg: QuoteEditConfig): { component: React.FC; duration: number } {
  const FPS = cfg.timeline.fps;
  const fr = (s: number) => Math.round(s * FPS);
  const pic = (id: string) => {
    const p = cfg.pics[id];
    if (!p) throw new Error(`unknown pic ${id}`);
    return p;
  };

  // narration on the grid
  const LINES: Timeline["lines"] = [];
  for (const l of cfg.timeline.lines) {
    const prev = LINES[LINES.length - 1];
    const min = prev ? prev.start + prev.dur + 0.12 : 0;
    let s = snap(l.start, DOWNBEAT_LINES.includes(l.id) ? BAR : BEAT);
    while (s < min) s += BEAT;
    const d = s - l.start;
    LINES.push({ id: l.id, start: s, dur: l.dur, words: l.words.map((w) => ({ w: w.w, t: w.t + d })) });
  }
  const line = (id: string) => LINES.find((l) => l.id === id)!;
  const lineEnd = (id: string) => line(id).start + line(id).dur;
  const BLACK = lineEnd("l09") + 0.25; // portraits out
  const RESET = line("l10").start; // the band appears
  const OPEN = RESET + BAR; // the band opens to full frame and the figure starts to rise
  const OPENED = OPEN + 2 * BEAT;
  const last = LINES[LINES.length - 1];
  if (last.start + last.dur > FLASH) throw new Error(`${cfg.vo}: narration runs past the flash`);

  // captions
  const PHRASES: Phrase[] = LINES.flatMap((l) => {
    const spec = cfg.phrases[l.id];
    const n = spec.reduce((a, p) => a + p.replace("^", "").split(" ").length, 0);
    if (n !== l.words.length) throw new Error(`${cfg.vo} phrases.${l.id} has ${n} words, line has ${l.words.length}`);
    let k = 0;
    const out = spec.map((p) => {
      const ws = p.replace("^", "").split(" ").map(() => l.words[k++]);
      return {
        stacked: p.startsWith("^"),
        from: fr(ws[0].t),
        to: 0,
        words: ws.map((w) => ({ w: w.w.replace(/[.,]/g, "").toUpperCase(), at: fr(w.t) })),
      };
    });
    out.forEach((p, i) => (p.to = out[i + 1]?.from ?? fr(l.start + l.dur + 0.35)));
    return out;
  });
  PHRASES[0].from = 0; // frame 0 is the thumbnail: the first word is already up
  PHRASES[0].words[0].at = 0;

  // shots up to the black; the opening slit holds dead still, the next two only pan
  const SHOTS = cfg.shots.map((s, i) => ({
    ...s,
    from: i === 0 ? 0 : fr(snap(line(s.at[0]).words[s.at[1]].t, s.on === "bar" ? BAR : BEAT)),
  }));
  const STILL_SHOTS = 3;
  /** Steady vertical drift in px/s, alternating direction shot to shot: strongest in the thin windows, like the original. */
  const PAN = (h: number) => (h < 0.3 ? 45 : h < 0.9 ? 32 : 22);

  // the ending
  const CUT = 4; // frames per flicker image
  const HOLD = { face: W * 0.44, ey: 0.36 }; // final framing; the rising figure lands on it
  const holdPic = pic(cfg.hold.pic);

  const Flicker: React.FC<{ frame: number; rect: Rect }> = ({ frame, rect }) => {
    const i = Math.floor((frame - fr(RESET)) / CUT);
    return (
      <Crop
        pic={pic(cfg.flicker[(i * 3) % cfg.flicker.length])}
        rect={rect}
        face={W * (0.5 + 0.5 * random(`z${i}`))}
        ey={rect.h < 1 ? 0.5 : 0.36}
        flip={random(`f${i}`) > 0.6}
      />
    );
  };

  /** The cut-out sliding up from below the frame until it is the hold framing. */
  const Figure: React.FC<{ t: number }> = ({ t }) => {
    const e = ease(interpolate(t, [OPEN, FLASH - 2 * BEAT], [0, 1], clamp));
    const face = interpolate(e, [0, 1], [W * 0.3, HOLD.face]);
    const eyesY = interpolate(e, [0, 1], [H * 1.0, H * HOLD.ey]);
    const s = face / (holdPic.fw * holdPic.iw);
    return (
      <Img
        src={staticFile(cfg.hold.cutout)}
        style={{
          position: "absolute",
          width: holdPic.iw * s,
          height: holdPic.ih * s,
          left: W / 2 - holdPic.fx * holdPic.iw * s,
          top: eyesY - holdPic.fy * holdPic.ih * s,
          filter: `${GRADE} drop-shadow(0 0 60px rgba(0,0,0,0.9))`,
        }}
      />
    );
  };

  /** The flash: the picture burns out to white over 5 frames, holds 3, and settles back through an orange burn. */
  const burn = (frame: number) => {
    const k = frame - fr(FLASH);
    if (k < -5 || k > 14) return { filter: undefined, white: 0 };
    const b = interpolate(k, [-5, -1, 3, 6, 14], [1, 3.5, 6, 2.6, 1], clamp);
    const sep = interpolate(k, [-5, -1, 3, 14], [0, 0.6, 1, 0], clamp);
    return {
      filter: `brightness(${b}) sepia(${sep}) saturate(${1 + sep * 2}) contrast(${1 + sep * 0.4})`,
      white: interpolate(k, [-2, 0, 3, 5], [0, 1, 1, 0], clamp),
    };
  };

  /** Music gain at frame f: ducked while a line plays (0.15s ramps), up between lines, full from the flash, out over the last 1.2s. */
  const music = (f: number) => {
    const t = f / FPS;
    const talk = Math.max(0, ...LINES.map((l) => interpolate(t, [l.start - 0.15, l.start, l.start + l.dur, l.start + l.dur + 0.3], [0, 1, 1, 0], clamp)));
    const base = interpolate(t, [FLASH - BEAT, FLASH], [DUCK.gap, DUCK.flash], clamp);
    return interpolate(talk, [0, 1], [base, DUCK.talk]) * interpolate(f, [fr(END) - fr(1.2), fr(END)], [1, 0], clamp);
  };

  const component: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame / FPS;

    let scene: React.ReactNode = null;
    let ty = 0.45;
    if (frame < fr(BLACK)) {
      const i = SHOTS.findLastIndex((s) => frame >= s.from);
      const s = SHOTS[i];
      const L = LAYOUT[s.layout];
      const next = SHOTS[i + 1]?.from ?? fr(BLACK);
      scene = (
        <Crop
          pic={pic(s.pic)}
          rect={L.rect}
          face={s.face ?? L.face}
          ey={L.ey}
          flip={s.flip}
          drift={(frame - s.from) / (next - s.from)}
          push={i < STILL_SHOTS ? 0 : 0.06}
          dy={i === 0 ? 0 : (i % 2 ? -1 : 1) * PAN(L.rect.h) * ((frame - s.from) - (next - s.from) / 2) / FPS}
        />
      );
      ty = L.ty;
    } else if (frame >= fr(RESET) && frame < fr(FLASH)) {
      // a thin band grows, opens to full frame, then the figure rises through the flicker
      const h = t < OPEN ? interpolate(t, [RESET, OPEN], [0.025, 0.2], clamp) : 0;
      const o = ease(interpolate(t, [OPEN, OPENED], [0, 1], clamp));
      const rect = t < OPEN ? band(0.48 - h / 2, h) : { x: 0, y: 0.38 * (1 - o), w: 1, h: 0.2 + 0.8 * o };
      scene = (
        <>
          <Flicker frame={frame} rect={rect} />
          {t >= OPEN && <AbsoluteFill style={{ background: "rgba(0,0,0,0.25)" }} />}
          {t >= OPEN && <Figure t={t} />}
        </>
      );
      ty = t < OPEN ? 0.48 + h / 2 + 0.02 : interpolate(t, [OPEN, FLASH - 2 * BAR, FLASH], [0.4, 0.3, 0.1], clamp);
    } else if (frame >= fr(FLASH)) {
      const k = frame - fr(FLASH);
      scene = (
        <>
          <Crop pic={holdPic} rect={FULL} face={HOLD.face} ey={HOLD.ey} drift={k / (fr(END) - fr(FLASH))} push={0.05} />
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% ${HOLD.ey * 100 - 6}%, rgba(255,190,110,0.9) 0%, rgba(255,150,60,0.35) 16%, transparent 40%)`,
              mixBlendMode: "screen",
              opacity: interpolate(k, [0, fr(1.8)], [0.9, 0.15], clamp),
            }}
          />
          <Motes frame={frame} amount={interpolate(k, [6, fr(1.2)], [0, 0.7], clamp)} />
        </>
      );
    }

    const { filter, white } = burn(frame);
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <AbsoluteFill style={{ filter }}>{scene}</AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(8,3,0,0.8) 100%)" }} />
        {frame < fr(FLASH) - 2 && <Captions phrases={PHRASES} keyWords={cfg.keyWords} frame={frame} top={ty} />}
        <AbsoluteFill style={{ background: "#fff7e8", opacity: white }} />

        <Audio src={staticFile(TRACK)} trimBefore={fr(DROP)} volume={music} />
        {LINES.map((l) => (
          <Sequence key={l.id} from={fr(l.start)}>
            <Audio src={staticFile(`vo/${cfg.vo}/${l.id}.wav`)} />
          </Sequence>
        ))}
      </AbsoluteFill>
    );
  };

  return { component, duration: fr(END) };
}
