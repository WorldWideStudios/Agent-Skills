import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, DISPLAY, EASE, ENTER, LABEL, SCALE} from './theme';
import {body, display} from './fonts';

const ease = Easing.bezier(...EASE);

/** 0 → 1 over ENTER frames from `delay`, on the brand curve. */
export const useEnter = (delay = 0, duration = ENTER): number => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
};

/**
 * A line of type that wipes up from behind a mask. The vertical padding keeps
 * the mask from shaving cap heights when line-height is tight.
 */
export const Line: React.FC<{
  children: React.ReactNode;
  delay?: number;
  fontSize: number;
  color?: string;
  fontFamily?: string;
  style?: React.CSSProperties;
}> = ({children, delay = 0, fontSize, color = COLORS.ink, fontFamily = display, style}) => {
  const p = useEnter(delay);
  return (
    <span style={{display: 'block', overflow: 'hidden', paddingTop: fontSize * 0.1, paddingBottom: fontSize * 0.1}}>
      <span
        style={{
          display: 'block',
          fontFamily,
          fontSize,
          color,
          ...DISPLAY(fontSize),
          ...style,
          transform: `translateY(${(1 - p) * 110}%)`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/** D7 label: eyebrows, roles, lead-ins. Ink, never grey. */
export const Eyebrow: React.FC<{children: React.ReactNode; delay?: number}> = ({children, delay = 0}) => {
  const p = useEnter(delay, 8);
  return <div style={{opacity: p, fontFamily: body, color: COLORS.ink, ...LABEL}}>{children}</div>;
};

/** Name plate over footage: a white chip with a 10px accent edge. */
export const LowerThird: React.FC<{name: string; role: string; delay?: number}> = ({name, role, delay = 4}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        bottom: 72,
        display: 'flex',
        background: COLORS.paper,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 18px 50px rgba(11,11,11,0.22)',
        opacity: p,
        transform: `translateY(${(1 - p) * 24}px)`,
      }}
    >
      <div style={{width: 10, background: COLORS.accent}} />
      <div style={{padding: '20px 32px 22px 26px'}}>
        <div style={{fontFamily: display, fontSize: SCALE.D6, color: COLORS.ink, ...DISPLAY(SCALE.D6)}}>{name}</div>
        <div style={{marginTop: 6, fontFamily: body, color: COLORS.ink, ...LABEL}}>{role}</div>
      </div>
    </div>
  );
};

/** Count-up number. */
export const Counter: React.FC<{
  to: number;
  delay?: number;
  duration?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({to, delay = 0, duration = 20, suffix = '', style}) => {
  const frame = useCurrentFrame();
  const eased = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });
  // Easing.out(Easing.exp) asymptotes just under 1 — snap the tail, or 1000 settles on 999.
  const value = Math.round((eased > 0.995 ? 1 : eased) * to).toLocaleString('en-US');
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {value}
      {suffix}
    </span>
  );
};
