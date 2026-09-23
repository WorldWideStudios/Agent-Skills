import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {BRAND, COLORS, SCALE, WORDMARK, LABEL} from '../lib/theme';
import {body, wordmark} from '../lib/fonts';
import {Line, useEnter} from '../lib/motion';

/**
 * Title and end card — one component, one flag. Logo, the name lines and (on the
 * end card) the domain share ONE LEFT EDGE; that block is centred on the card.
 * Check on a rendered frame: ink left edges within ~2px, block centre within ~4px.
 */
export const TitleCard: React.FC<{end?: boolean}> = ({end = false}) => {
  const logo = useEnter(0);
  const domain = useEnter(end ? 24 : 0);
  return (
    <AbsoluteFill style={{background: COLORS.paper, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
        {BRAND.logo ? (
          <Img
            src={staticFile(BRAND.logo)}
            style={{
              width: BRAND.logoWidth,
              display: 'block',
              marginBottom: end ? 38 : 46,
              opacity: logo,
              transform: `translateY(${(1 - logo) * 14}px)`,
            }}
          />
        ) : null}
        <div>
          {BRAND.titleLines.map((l, i) => (
            <Line
              key={l.text}
              fontSize={SCALE.D2}
              delay={4 + i * 5}
              fontFamily={wordmark}
              color={l.accent ? COLORS.accent : COLORS.ink}
              style={{...WORDMARK, lineHeight: 1.16}}
            >
              {l.text}
            </Line>
          ))}
        </div>
        {end ? (
          <div
            style={{
              marginTop: 28,
              fontFamily: body,
              color: COLORS.ink,
              ...LABEL,
              textTransform: 'none',
              letterSpacing: '0.06em',
              opacity: domain,
            }}
          >
            {BRAND.domain}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
