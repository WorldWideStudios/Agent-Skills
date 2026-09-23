import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {LowerThird} from '../lib/motion';
import {COLORS} from '../lib/theme';

/**
 * A slice of the session: the footage, its own audio, one name plate.
 * People appear in their full source frame; portrait feeds pillarbox on paper.
 * `punch` (e.g. 1.13) pushes a meeting platform's baked-in name chip out of
 * frame — use it only when the chip can't be covered by the lower third.
 */
export const Clip: React.FC<{src: string; name: string; role: string; punch?: number}> = ({
  src,
  name,
  role,
  punch = 1,
}) => (
  <AbsoluteFill style={{background: COLORS.paper}}>
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(`clips/${src}.mp4`)}
        style={{width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${punch})`}}
      />
    </AbsoluteFill>
    <LowerThird name={name} role={role} />
  </AbsoluteFill>
);
