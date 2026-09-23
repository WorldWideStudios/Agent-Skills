import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {COLORS} from '../lib/theme';
import {DisplayCard, DisplayProps} from './DisplayCard';

/**
 * A display card carrying a speaker's voice: the clip is mounted at zero
 * opacity for its audio, and the picture is the plain card. Use it for the
 * deal and the ask, and for any screen-share moment. Start the clip on the
 * phrase that introduces the quote; `linesAt` lands the lines ~1s ahead of
 * the words while the eyebrow covers the lead-in.
 */
export const VoiceCard: React.FC<DisplayProps & {src: string}> = ({src, ...display}) => (
  <AbsoluteFill style={{background: COLORS.paper}}>
    <AbsoluteFill style={{opacity: 0}}>
      <OffthreadVideo src={staticFile(`clips/${src}.mp4`)} />
    </AbsoluteFill>
    <DisplayCard {...display} transparent />
  </AbsoluteFill>
);
