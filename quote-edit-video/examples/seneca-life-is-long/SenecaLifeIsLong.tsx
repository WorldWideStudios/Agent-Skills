/**
 * "Life is long, if you know how to use it" (On the Shortness of Life):
 * Seneca as an optimistic quote edit (see quoteEdit.tsx for the format).
 * Portraits are public domain / CC0 busts and engravings, in public/seneca/
 * (sources in public/seneca/SOURCES.txt; marble-pink-cutout.png is
 * marble-pink.jpg through macOS Vision's foreground mask).
 * Voice with: node tools/voice.mjs scripts/seneca-life-is-long.json
 */
import { Pic, W, quoteEdit } from "../quoteEdit";
import TL from "../timeline/seneca-life-is-long.json";

const pic = (src: string, iw: number, ih: number, fx: number, fy: number, fw: number): Pic => ({ src: `seneca/${src}`, iw, ih, fx, fy, fw });

const edit = quoteEdit({
  timeline: TL,
  vo: "seneca-life-is-long",
  phrases: {
    l01: ["^Your life", "is not", "^short."],
    l02: ["^Most of us", "just spend it", "like it is."],
    l03: ["Man fears", "a thousand storms,", "yet most of them", "^never come."],
    l04: ["He waits", "for tomorrow,", "yet tomorrow", "^never promised", "him anything."],
    l05: ["The happiest people", "are not", "the ones", "who have the most,", "but the ones", "who need the least", "^and love", "^what they have."],
    l06: ["^A man", "who lives each day", "as a complete life", "will never", "^run out of time.", "^Not in sorrow.", "^Not in exile.", "^Not in old age."],
    l07: ["^And so,", "he is", "^far freer", "than the one", "who owns everything."],
    l08: ["Nothing is easier", "than to postpone", "^your life."],
    l09: ["Nothing is", "^more beautiful", "than to", "^begin it now."],
    l10: ["The line", "between", "a wasted life", "and a full one", "is not", "^measured", "in years,", "but in", "^hours well used."],
    l11: ["Wherever there is", "^a human being,", "there is", "a chance", "^for kindness."],
    l12: ["^So do not", "wait", "^to live."],
    l13: ["^Begin", "^at once."],
    l14: ["^Life is long,", "if you know", "^how to use it."],
  },
  keyWords: /^(LIFE|SHORT|KINDNESS|HUMAN|BEING|BEAUTIFUL|LIVE|LONG|FREER|LOVE|NOW|HOURS|BEGIN)$/,
  pics: {
    marblePink: pic("marble-pink.jpg", 1280, 1920, 0.5, 0.36, 0.48),
    engraving: pic("engraving.jpg", 1280, 1768, 0.55, 0.34, 0.44),
    bustDark: pic("bust-dark.jpg", 1280, 1976, 0.484, 0.242, 0.518),
    headClose: pic("head-close.jpg", 1280, 1920, 0.5, 0.333, 0.73),
    niche: pic("niche.jpg", 1280, 1568, 0.36, 0.4, 0.48),
    bustGradient: pic("bust-gradient.jpg", 1280, 1707, 0.52, 0.29, 0.32),
    bustBlack: pic("bust-black.jpg", 1280, 1707, 0.468, 0.284, 0.49),
    engraving2: pic("engraving-2.jpg", 1280, 1860, 0.6, 0.31, 0.48),
    oval: pic("oval.jpg", 1280, 1702, 0.56, 0.4, 0.32),
    bronze: pic("bronze.jpg", 425, 789, 0.4, 0.26, 0.56),
    niche2: pic("niche-2.jpg", 1220, 1643, 0.48, 0.36, 0.36),
    terracotta: pic("terracotta.jpg", 410, 615, 0.49, 0.238, 0.529),
  },
  shots: [
    { at: ["l01", 0], on: "bar", pic: "marblePink", layout: "slit" },
    { at: ["l02", 3], on: "bar", pic: "engraving", layout: "band" },
    { at: ["l03", 0], on: "bar", pic: "headClose", layout: "deep" },
    { at: ["l04", 0], on: "bar", pic: "niche", layout: "box" },
    { at: ["l05", 0], on: "bar", pic: "bustGradient", layout: "top" },
    { at: ["l05", 14], on: "beat", pic: "engraving2", layout: "tall" },
    { at: ["l06", 0], on: "bar", pic: "bustDark", layout: "full", face: W * 0.8 },
    { at: ["l06", 16], on: "beat", pic: "oval", layout: "full", face: W * 0.7 },
    { at: ["l06", 19], on: "beat", pic: "bronze", layout: "full", face: W * 0.9 },
    { at: ["l06", 22], on: "beat", pic: "niche2", layout: "full", face: W * 0.7 },
    { at: ["l07", 0], on: "bar", pic: "bustBlack", layout: "full", face: W * 0.7 },
    { at: ["l08", 0], on: "beat", pic: "headClose", layout: "full", face: W * 1.0 },
    { at: ["l09", 0], on: "beat", pic: "engraving", layout: "full", face: W * 0.8 },
    { at: ["l09", 6], on: "beat", pic: "marblePink", layout: "full", face: W * 0.55 },
  ],
  flicker: ["marblePink", "engraving", "bustDark", "headClose", "niche", "bustGradient", "bustBlack", "engraving2", "oval", "bronze", "niche2", "terracotta"],
  hold: { pic: "marblePink", cutout: "seneca/marble-pink-cutout.png" },
});

export const SenecaLifeIsLong = edit.component;
export const SENECA_LIFE_IS_LONG_DURATION = edit.duration;
