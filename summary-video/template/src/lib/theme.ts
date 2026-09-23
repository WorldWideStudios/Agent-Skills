import type React from 'react';

// Brand tokens. Swap these for your own; every scene reads from here.
// Values below are the Worldwide Studios / AI for Education set — see the
// video-brand-guide skill for how they were derived.

export const COLORS = {
  paper: '#ffffff', // the ground — flat, every card
  ink: '#0b0b0b', // all type, every size
  accent: '#fdc743', // ONE accent per film, as type colour on one line
} as const;

// One scale for 16:9 and 9:16 (both have a 1080px short edge). Use nothing else.
export const SCALE = {D1: 150, D2: 112, D3: 84, D4: 64, D5: 48, C: 46, D6: 34, D7: 24} as const;
export const MARGIN = 72;

export const BRAND = {
  // Title / end card lockup, exactly as the site's hero sets it.
  titleLines: [
    {text: 'AI FOR', accent: false},
    {text: 'EDUCATION', accent: true},
    {text: 'FELLOWSHIP', accent: false},
  ],
  domain: 'worldwide-studios.org',
  // Put your logo in public/ and name it here, or leave null to render without one.
  // A logo that is black art on an OPAQUE white box is fine on paper; never invert it.
  logo: null as string | null,
  logoWidth: 300,
};

// The site's own curve: fast in, long settle, no bounce. Entrances ~0.45s.
export const EASE = [0.16, 1, 0.3, 1] as const;
export const ENTER = 14; // frames

export const DISPLAY = (size: number): React.CSSProperties => ({
  textTransform: 'uppercase',
  fontWeight: 700,
  letterSpacing: size >= 84 ? '-0.04em' : size >= 48 ? '-0.03em' : '-0.02em',
  lineHeight: size >= 84 ? 1.1 : size >= 64 ? 1.16 : 1.22,
});

export const WORDMARK: React.CSSProperties = {
  textTransform: 'uppercase',
  fontWeight: 400,
  letterSpacing: '-0.01em',
};

export const LABEL: React.CSSProperties = {
  fontSize: SCALE.D7,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  lineHeight: 1.4,
};
