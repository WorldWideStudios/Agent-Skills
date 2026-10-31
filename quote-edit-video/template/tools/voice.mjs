/**
 * Voices a quote-edit script with one Deepgram Aura-2 voice (via OpenRouter)
 * and lays it on a clock for Remotion. Usage:
 *   OPENROUTER_API_KEY=... node tools/voice.mjs scripts/marcus-happy-life.json
 * Script: { title, voice, tempo, lead, tail, lines: [{ id, text, gap?, say? }] }.
 * Each line is trimmed, slowed/sped to `tempo` (pitch kept), timed (per-word
 * times by syllable weight over the line's speech, pauses skipped), then
 * mastered (EQ, compression, limiter at -1.5 dB) so it sits on top of music.
 * Writes public/vo/<name>/<id>.wav and src/timeline/<name>.json. TTS is
 * cached in vo-cache/ by voice + text, so re-running costs nothing.
 */
import { readFile, writeFile, mkdir, access, rm, rename } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FPS = 30;
const GAP = 0.45; // default breath between lines
// Voice-over master: warmth + presence, even level (~-18 dB RMS speech), peaks at -1.5 dB.
const MASTER = "highpass=f=70,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-28dB:ratio=3:attack=4:release=140:makeup=9dB,volume=7dB,alimiter=limit=-1.5dB:level=false";

const scriptPath = path.resolve(process.argv[2]);
const name = path.basename(scriptPath, ".json");
const script = JSON.parse(await readFile(scriptPath, "utf8"));
const key = process.env.OPENROUTER_API_KEY;
if (!key) throw new Error("set OPENROUTER_API_KEY");
const ff = (...a) => execFileSync("ffmpeg", ["-hide_banner", "-y", ...a], { stdio: ["ignore", "pipe", "pipe"] });
const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

await mkdir(path.join(ROOT, "vo-cache"), { recursive: true });
await rm(path.join(ROOT, "public/vo", name), { recursive: true, force: true });
await mkdir(path.join(ROOT, "public/vo", name), { recursive: true });
await mkdir(path.join(ROOT, "src/timeline"), { recursive: true });

const lines = [];
let t = script.lead ?? 0.3;
for (const l of script.lines) {
  const input = l.say || l.text;
  const mp3 = path.join(ROOT, "vo-cache", createHash("sha1").update(script.voice + input).digest("hex").slice(0, 12) + ".mp3");
  try {
    await access(mp3);
  } catch {
    const r = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: "deepgram/aura-2", input, voice: script.voice, response_format: "mp3" }),
    });
    if (!r.ok) throw new Error(`${l.id} ${r.status} ${(await r.text()).slice(0, 300)}`);
    await writeFile(mp3, Buffer.from(await r.arrayBuffer()));
    console.log("voiced", l.id);
  }
  // Trim head/tail silence and set the pace (pitch preserved).
  const wav = path.join(ROOT, "public/vo", name, `${l.id}.wav`);
  ff("-i", mp3, "-af",
    `silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,atempo=${script.tempo ?? 1}`,
    "-ar", "48000", "-ac", "1", wav);
  const d = dur(wav);

  // Words share the line's speech time (internal pauses skipped) by syllable weight.
  const err = spawnSync("ffmpeg", ["-hide_banner", "-i", wav, "-af", "silencedetect=n=-38dB:d=0.09", "-f", "null", "-"]).stderr.toString();
  const segs = [];
  let s0 = 0;
  for (const m of err.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)) {
    if (+m[1] - s0 > 0.05) segs.push([s0, +m[1]]);
    s0 = +m[2];
  }
  if (d - s0 > 0.05) segs.push([s0, d]);
  const speech = segs.reduce((a, [x, y]) => a + y - x, 0);
  const warp = (u) => {
    let r = u * speech;
    for (const [a, b] of segs) {
      if (r <= b - a + 1e-6) return a + r;
      r -= b - a;
    }
    return d;
  };
  // Master after timing, so word times don't depend on it.
  ff("-i", wav, "-af", MASTER, wav + ".tmp.wav");
  await rename(wav + ".tmp.wav", wav);

  const syl = (w) => Math.max(1, (w.toLowerCase().replace(/[^a-z]/g, "").match(/[aeiouy]+/g) || []).length) + 0.7;
  const words = l.text.split(/\s+/);
  const total = words.reduce((a, w) => a + syl(w), 0);
  let acc = 0;
  t += l.gap ?? GAP;
  const start = t;
  lines.push({
    id: l.id,
    start: +start.toFixed(3),
    dur: +d.toFixed(3),
    words: words.map((w) => {
      const t0 = warp(acc / total);
      acc += syl(w);
      return { w, t: +(start + t0).toFixed(3) };
    }),
  });
  t += d;
}
await writeFile(path.join(ROOT, "src/timeline", `${name}.json`), JSON.stringify({ fps: FPS, lines }) + "\n");
const end = t + (script.tail ?? 3.2);
console.log(name, "narration ends", t.toFixed(2), "s (must be under 54.6)", "total", end.toFixed(2), "s");
for (const l of lines) console.log(l.id.padEnd(4), l.start.toFixed(2), l.dur.toFixed(2));
