import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, MARGIN, SCALE} from '../lib/theme';
import {Eyebrow, Line} from '../lib/motion';

export type DisplayProps = {
  eyebrow?: string;
  lines: string[];
  payoff?: string;
  /** Frame the first display line lands on. Use it to land the lines ~1s ahead of the spoken words. */
  linesAt?: number;
  transparent?: boolean;
};

/**
 * Curated words: left-aligned, uppercase, D7 lead-in into D3, the accent on the
 * payoff line only, always last. One idea per card.
 */
export const DisplayCard: React.FC<DisplayProps> = ({eyebrow, lines, payoff, linesAt, transparent}) => {
  const start = linesAt ?? (eyebrow ? 4 : 0);
  const all = payoff ? [...lines, payoff] : lines;
  return (
    <AbsoluteFill
      style={{
        background: transparent ? 'transparent' : COLORS.paper,
        padding: `0 ${MARGIN * 1.5}px`,
        justifyContent: 'center',
      }}
    >
      {eyebrow ? (
        <div style={{marginBottom: 22}}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      {all.map((text, i) => (
        <Line
          key={i}
          fontSize={SCALE.D3}
          delay={start + i * 7}
          color={payoff && i === all.length - 1 ? COLORS.accent : COLORS.ink}
        >
          {text}
        </Line>
      ))}
    </AbsoluteFill>
  );
};
