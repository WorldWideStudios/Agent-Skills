import React from 'react';
import {Composition} from 'remotion';
import {SummaryFilm, TOTAL_FRAMES} from './SummaryFilm';
import cut from './cut.json';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SummaryFilm"
    component={SummaryFilm}
    durationInFrames={TOTAL_FRAMES}
    fps={cut.fps}
    width={cut.width}
    height={cut.height}
  />
);
