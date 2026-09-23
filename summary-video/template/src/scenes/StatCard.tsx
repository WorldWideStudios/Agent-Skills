import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, DISPLAY, MARGIN, SCALE, WORDMARK} from '../lib/theme';
import {display, wordmark} from '../lib/fonts';
import {Counter, Eyebrow, useEnter} from '../lib/motion';

export type Stat = {value: number; suffix?: string; label: string};

/**
 * Numbers left-stacked at D1, all ink, all landing on the same frame, label at
 * D5 on the same baseline. No bars, rules or colour-coding; keep each stat to
 * the figure and a short label. Centred columns make "5M" read smaller than
 * "1,000" at the same size — don't.
 */
export const StatCard: React.FC<{eyebrow?: string; stats: Stat[]}> = ({eyebrow, stats}) => {
  const p = useEnter(6);
  return (
    <AbsoluteFill style={{background: COLORS.paper, padding: `0 ${MARGIN * 1.5}px`, justifyContent: 'center'}}>
      {eyebrow ? (
        <div style={{marginBottom: 20}}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 44,
          alignItems: 'baseline',
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px)`,
        }}
      >
        {stats.map((s) => (
          <React.Fragment key={s.label}>
            <Counter
              to={s.value}
              suffix={s.suffix}
              delay={6}
              style={{fontFamily: wordmark, fontSize: SCALE.D1, lineHeight: 1.08, color: COLORS.ink, ...WORDMARK}}
            />
            <span style={{fontFamily: display, fontSize: SCALE.D5, color: COLORS.ink, ...DISPLAY(SCALE.D5)}}>
              {s.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
