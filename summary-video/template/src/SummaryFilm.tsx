import React from 'react';
import {AbsoluteFill, Audio, Series, staticFile} from 'remotion';

import cut from './cut.json';
import {COLORS} from './lib/theme';
import {TitleCard} from './scenes/TitleCard';
import {DisplayCard} from './scenes/DisplayCard';
import {StatCard, Stat} from './scenes/StatCard';
import {Clip} from './scenes/Clip';
import {VoiceCard} from './scenes/VoiceCard';

/**
 * The whole edit is src/cut.json: one row per beat, its length in frames, and
 * its scene. make-music.py reads the same file, so the score's section markers
 * follow the picture by construction.
 *
 * HARD RULE: a footage beat must be at least as long as its clip file, which is
 * cut to a real pause. A shorter beat truncates the file and clips the last word.
 */
type Beat = {
  scene: 'title' | 'end' | 'display' | 'stats' | 'clip' | 'voice';
  frames: number;
  marker?: string;
  src?: string;
  name?: string;
  role?: string;
  punch?: number;
  eyebrow?: string;
  lines?: string[];
  payoff?: string;
  linesAt?: number;
  stats?: Stat[];
};

const BEATS = cut.beats as Beat[];

const render = (b: Beat): React.ReactNode => {
  switch (b.scene) {
    case 'title':
      return <TitleCard />;
    case 'end':
      return <TitleCard end />;
    case 'display':
      return <DisplayCard eyebrow={b.eyebrow} lines={b.lines ?? []} payoff={b.payoff} linesAt={b.linesAt} />;
    case 'stats':
      return <StatCard eyebrow={b.eyebrow} stats={b.stats ?? []} />;
    case 'clip':
      return <Clip src={b.src!} name={b.name ?? ''} role={b.role ?? ''} punch={b.punch} />;
    case 'voice':
      return (
        <VoiceCard src={b.src!} eyebrow={b.eyebrow} lines={b.lines ?? []} payoff={b.payoff} linesAt={b.linesAt} />
      );
  }
};

export const TOTAL_FRAMES = BEATS.reduce((acc, b) => acc + b.frames, 0);

/** Anyone speaking → the score ducks. Derived from the beat table, not by ear. */
const SPEECH = new Set(['clip', 'voice']);
const DUCKED: [number, number][] = (() => {
  const out: [number, number][] = [];
  let at = 0;
  for (const b of BEATS) {
    if (SPEECH.has(b.scene)) out.push([at, at + b.frames]);
    at += b.frames;
  }
  return out;
})();

const RAMP = 9;
const LOUD = 0.74;
const QUIET = 0.2;

const scoreVolume = (frame: number): number => {
  for (const [start, end] of DUCKED) {
    if (frame >= start - RAMP && frame < start) return LOUD + ((QUIET - LOUD) * (frame - (start - RAMP))) / RAMP;
    if (frame >= start && frame < end) return QUIET;
    if (frame >= end && frame < end + RAMP) return QUIET + ((LOUD - QUIET) * (frame - end)) / RAMP;
  }
  return LOUD;
};

export const SummaryFilm: React.FC = () => (
  <AbsoluteFill style={{background: COLORS.paper}}>
    {cut.score ? <Audio src={staticFile(cut.score)} volume={scoreVolume} /> : null}
    <Series>
      {BEATS.map((b, i) => (
        <Series.Sequence key={i} durationInFrames={b.frames}>
          {render(b)}
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
