/**
 * "Very little is needed to make a happy life" (Meditations 7.67): Marcus
 * Aurelius as an optimistic quote edit (see quoteEdit.tsx for the format).
 * Portraits are public domain / CC0 busts, coins and prints, in
 * public/marcus/ (sources in public/marcus/SOURCES.txt; bust-red-cutout.png is
 * bust-red.jpg through macOS Vision's foreground mask).
 * Voice with: node tools/voice.mjs scripts/marcus-happy-life.json
 */
import { Pic, W, quoteEdit } from "../quoteEdit";
import TL from "../timeline/marcus-happy-life.json";

const pic = (src: string, iw: number, ih: number, fx: number, fy: number, fw: number): Pic => ({ src: `marcus/${src}`, iw, ih, fx, fy, fw });

const edit = quoteEdit({
  timeline: TL,
  vo: "marcus-happy-life",
  phrases: {
    l01: ["^Every morning", "is a", "^gift."],
    l02: ["^Most of us", "just forget", "to open it."],
    l03: ["Man complains", "of the night,", "yet the sun", "^still rises", "for him."],
    l04: ["He curses", "the obstacle,", "yet the obstacle", "^becomes the way."],
    l05: ["The strongest men", "are not", "the ones", "who never fall,", "but the ones", "^who rise", "each morning", "to do the work", "^of a human being."],
    l06: ["^A man", "who masters", "his own mind", "will find", "^peace anywhere.", "^In a palace.", "^In a war tent.", "^In a storm."],
    l07: ["^And so,", "he is", "^far richer", "than the one", "who owns the world."],
    l08: ["Nothing is easier", "than to blame", "^the world."],
    l09: ["Nothing is", "^more powerful", "than to change", "^your mind", "about it."],
    l10: ["The line", "between", "a good day", "and a bad one", "is not", "^drawn", "by fortune,", "but by", "^your thoughts."],
    l11: ["^Your soul", "takes the color", "^of your thoughts."],
    l12: ["^So do not", "wait for", "^a better life."],
    l13: ["^Begin it", "^today."],
    l14: ["^Very little", "^is needed", "to make", "^a happy life."],
  },
  keyWords: /^(GIFT|MORNING|RISES|WAY|HUMAN|BEING|PEACE|RICHER|POWERFUL|THOUGHTS|SOUL|TODAY|HAPPY|LIFE)$/,
  pics: {
    headGray: pic("head-gray.jpg", 1280, 1757, 0.517, 0.408, 0.521),
    coin: pic("coin.jpg", 1280, 1282, 0.6, 0.3, 0.36),
    bustBlack: pic("bust-black.jpg", 1280, 1774, 0.525, 0.275, 0.19),
    lithograph: pic("lithograph.jpg", 1280, 1443, 0.582, 0.182, 0.27),
    bustRedWide: pic("bust-red-wide.jpg", 1280, 853, 0.506, 0.334, 0.305),
    bustRed: pic("bust-red.jpg", 1280, 1920, 0.523, 0.228, 0.362),
    headRed: pic("head-red.jpg", 1280, 1889, 0.44, 0.339, 0.643),
    headDark: pic("head-dark.jpg", 1280, 1967, 0.5, 0.373, 0.62),
    cuirass: pic("cuirass.jpg", 1213, 2157, 0.384, 0.333, 0.602),
    terracotta: pic("terracotta.jpg", 469, 640, 0.46, 0.19, 0.18),
    engraving: pic("engraving.jpg", 697, 1079, 0.58, 0.3, 0.28),
    whiteBust: pic("white-bust.jpg", 987, 1029, 0.5, 0.21, 0.22),
  },
  shots: [
    { at: ["l01", 0], on: "bar", pic: "headGray", layout: "slit" },
    { at: ["l02", 3], on: "bar", pic: "headRed", layout: "band" },
    { at: ["l03", 0], on: "bar", pic: "headDark", layout: "deep" },
    { at: ["l04", 0], on: "bar", pic: "bustBlack", layout: "box" },
    { at: ["l05", 0], on: "bar", pic: "lithograph", layout: "top" },
    { at: ["l05", 13], on: "beat", pic: "whiteBust", layout: "tall" },
    { at: ["l06", 0], on: "bar", pic: "headGray", layout: "full", face: W * 0.9 },
    { at: ["l06", 11], on: "beat", pic: "bustRedWide", layout: "full", face: W * 0.6 },
    { at: ["l06", 14], on: "beat", pic: "cuirass", layout: "full", face: W * 0.8 },
    { at: ["l06", 18], on: "beat", pic: "headDark", layout: "full", face: W * 1.1 },
    { at: ["l07", 0], on: "bar", pic: "headRed", layout: "full", face: W * 0.75 },
    { at: ["l08", 0], on: "beat", pic: "coin", layout: "full", face: W * 0.9 },
    { at: ["l09", 0], on: "beat", pic: "engraving", layout: "full", face: W * 0.7 },
    { at: ["l09", 5], on: "beat", pic: "bustRed", layout: "full", face: W * 0.55 },
  ],
  flicker: ["headGray", "coin", "headRed", "bustBlack", "lithograph", "headDark", "cuirass", "whiteBust", "engraving", "terracotta", "bustRedWide"],
  hold: { pic: "bustRed", cutout: "marcus/bust-red-cutout.png" },
});

export const MarcusAureliusHappyLife = edit.component;
export const MARCUS_HAPPY_LIFE_DURATION = edit.duration;
