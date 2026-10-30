// "Do you need a reason to live?" Camus (A, wins) vs Pascal (B).
// Writes index.html and compositions/*.html through the shared debate engine.
//   node tools/build.mjs
import { buildDebate, C, r } from '../lib/debate.mjs';

// infinity sign and heart, drawn around (0, 0)
const INF = 'M0,0 C-30,-40 -100,-40 -100,0 C-100,40 -30,40 0,0 C30,-40 100,-40 100,0 C100,40 30,40 0,0 Z';
const HEART = 'M0,70 C-130,-10 -100,-140 0,-70 C100,-140 130,-10 0,70 Z';
const figure = (x, y, ink, sw = 7) => `<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${ink}" stroke-width="${sw}"/>
          <path d="M${x},${y + 24} V${y + 100} M${x - 36},${y + 60} L${x},${y + 44} L${x + 36},${y + 60} M${x},${y + 100} L${x - 26},${y + 150} M${x},${y + 100} L${x + 26},${y + 150}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const pill = (id, x, y, w, t, bg, fg) => `<g id="${id}" class="hide"><rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="58" rx="29" fill="${bg}"/><text x="${x}" y="${y + 11}" text-anchor="middle" font-size="30" fill="${fg}">${t}</text></g>`;

const ILL = {
  // A reed that knows it dies; the diversions it runs to; an infinite hole only infinity fills.
  reed(s, p, ink, acc, { at, cue, draw, pop, blurIn }) {
    const svg = `
        <path class="draw gnd" pathLength="1" d="M60,472 H900" stroke="${ink}" stroke-width="6"/>
        <path class="draw rd" pathLength="1" d="M170,472 Q160,300 205,110" stroke="${ink}" stroke-width="8"/>
        <path class="draw rd" pathLength="1" d="M166,360 Q110,320 96,250 M178,260 Q232,230 250,170" stroke="${ink}" stroke-width="6"/>
        <text id="${p}-rl" class="hide" x="60" y="60" font-size="30" fill="${acc}">Thinking reed</text>
        ${pill(`${p}-t0`, 470, 120, 200, 'Games', acc, C.inkV)}
        ${pill(`${p}-t1`, 700, 80, 210, 'Gossip', acc, C.inkV)}
        ${pill(`${p}-t2`, 620, 205, 260, 'Scrolling', acc, C.inkV)}
        <path id="${p}-br" class="draw" pathLength="1" d="M370,262 Q370,282 390,282 H850 Q870,282 870,262" stroke="${ink}" stroke-width="6"/>
        <text id="${p}-dv" class="hide" x="620" y="326" text-anchor="middle" font-size="34" fill="${ink}">Diversion</text>
        <ellipse id="${p}-hole" class="hide" cx="640" cy="420" rx="190" ry="40" fill="${ink}"/>
        <g transform="translate(640 372) scale(0.9)"><path id="${p}-inf" d="${INF}" fill="none" stroke="${acc}" stroke-width="16" opacity="0"/></g>
        <text id="${p}-hl" class="hide" x="900" y="505" text-anchor="end" font-size="30" fill="${ink}">Only infinity fills it</text>`;
    return {
      svg,
      js: [
        draw(`#${p}-ill .gnd`, 0.3, 0.4),
        draw(`#${p}-ill .rd`, at(s, 'reed') - 0.15, 0.5, 0.15),
        blurIn(`#${p}-rl`, at(s, 'die.') - 0.1),
        pop(`#${p}-t0`, at(s, 'games,') - 0.05), pop(`#${p}-t1`, at(s, 'gossip,') - 0.05), pop(`#${p}-t2`, at(s, 'scrolling.') - 0.05),
        draw(`#${p}-br`, at(s, 'diversion.') - 0.2, 0.35), blurIn(`#${p}-dv`, at(s, 'diversion.')),
        pop(`#${p}-hole`, at(s, 'infinite', 0) - 0.1, 0.2),
        `tl.fromTo("#${p}-inf", { opacity: 1, y: -260 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.in" }, ${r(at(s, 'fills') - 0.2)});`,
        blurIn(`#${p}-hl`, at(s, 'hole.') - 0.1),
      ],
    };
  },
  // A person asks why; the universe says nothing; the clash between them is the absurd.
  clash(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const stars = [[640, 170], [770, 120], [830, 260], [700, 330], [600, 280], [760, 210]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${ink}"/>`).join('');
    const svg = `
        <g id="${p}-man">${figure(150, 250, ink)}</g>
        <g id="${p}-ask" class="hide"><path d="M190,130 h170 a24,24 0 0 1 24,24 v56 a24,24 0 0 1 -24,24 h-120 l-40,30 v-30 h-10 a24,24 0 0 1 -24,-24 v-56 a24,24 0 0 1 24,-24 z" fill="${acc}"/>
          <text x="275" y="196" text-anchor="middle" font-size="40" fill="${C.cobalt}">Why?</text></g>
        <circle class="draw uv" pathLength="1" cx="720" cy="230" r="180" stroke="${ink}" stroke-width="7"/>
        <g id="${p}-stars" class="hide">${stars}</g>
        <text id="${p}-sil" class="hide" x="720" y="242" text-anchor="middle" font-size="36" fill="${ink}">Silence</text>
        <path id="${p}-bolt" class="hide" d="M470,120 L430,250 H480 L440,380 L560,220 H500 L540,120 Z" fill="${acc}" stroke="${ink}" stroke-width="5"/>
        <text id="${p}-abs" class="hide" x="490" y="470" text-anchor="middle" font-size="40" fill="${acc}">The absurd</text>
        <g id="${p}-eye" class="hide"><path d="M70,330 Q150,270 230,330 Q150,390 70,330 Z" fill="${ink}"/><circle cx="150" cy="330" r="24" fill="${C.cobalt}"/></g>`;
    return {
      svg,
      js: [
        pop(`#${p}-ask`, at(s, 'demand') - 0.05),
        draw(`#${p}-ill .uv`, at(s, 'universe') - 0.2, 0.5),
        `tl.fromTo("#${p}-stars", { opacity: 0, scale: 0.6, transformOrigin: "720px 230px" }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, ${at(s, 'universe')});`,
        blurIn(`#${p}-sil`, at(s, 'silent.') - 0.05),
        `tl.to("#${p}-ask", { opacity: 0.3, duration: 0.3 }, ${at(s, 'silent.')});`,
        pop(`#${p}-bolt`, at(s, 'clash') - 0.05, 0.2),
        blurIn(`#${p}-abs`, at(s, 'absurd.') - 0.1),
        `tl.to("#${p}-man", { opacity: 0, duration: 0.2 }, ${at(s, 'open.') - 0.1});`,
        pop(`#${p}-eye`, at(s, 'open.') - 0.1),
      ],
    };
  },
  // Already at sea; not betting is a bet; one small life against infinity.
  boat(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const svg = `
        <path class="draw wv" pathLength="1" d="M40,470 q40,-26 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0" stroke="${ink}" stroke-width="6"/>
        <g id="${p}-boat"><path d="M80,400 H340 L300,460 H120 Z" fill="${acc}" stroke="${ink}" stroke-width="6"/>${figure(210, 230, ink, 6)}</g>
        ${pill(`${p}-nb`, 210, 120, 220, 'No bet', acc, C.inkV)}
        <path id="${p}-x" class="draw" pathLength="1" d="M110,120 H310" stroke="${ink}" stroke-width="8"/>
        <text id="${p}-isb" class="hide" x="210" y="70" text-anchor="middle" font-size="32" fill="${ink}">= a bet</text>
        <g id="${p}-coin" class="hide"><circle cx="520" cy="250" r="62" fill="${acc}" stroke="${ink}" stroke-width="6"/><text x="520" y="246" text-anchor="middle" font-size="32" fill="${C.inkV}">1</text><text x="520" y="282" text-anchor="middle" font-size="28" fill="${C.inkV}">life</text></g>
        <text id="${p}-vs" class="hide" x="628" y="268" text-anchor="middle" font-size="44" fill="${ink}">vs</text>
        <g transform="translate(800 250) scale(0.85)"><path id="${p}-inf" class="hide" d="${INF}" fill="none" stroke="${ink}" stroke-width="18"/></g>
        <text id="${p}-fool" class="hide" x="680" y="420" text-anchor="middle" font-size="36" fill="${acc}">Only a fool passes</text>`;
    return {
      svg,
      js: [
        draw(`#${p}-ill .wv`, 0.2, 0.6),
        `tl.fromTo("#${p}-boat", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }, ${at(s, 'boat.') - 0.2});`,
        `tl.to("#${p}-boat", { rotation: 3, svgOrigin: "210 430", duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 5 }, ${at(s, 'boat.') + 0.3});`,
        pop(`#${p}-nb`, at(s, 'refuse') - 0.05),
        draw(`#${p}-x`, at(s, 'bet', 1) - 0.15, 0.25),
        blurIn(`#${p}-isb`, at(s, 'bet', 1)),
        pop(`#${p}-coin`, at(s, 'stake') - 0.05),
        blurIn(`#${p}-vs`, at(s, 'win') - 0.1),
        pop(`#${p}-inf`, at(s, 'infinity.') - 0.1, 0.2),
        blurIn(`#${p}-fool`, at(s, 'fool') - 0.1),
      ],
    };
  },
  // The wager kills the question; Sisyphus keeps the question and the rock.
  boulder(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const svg = `
        <text id="${p}-q" x="150" y="230" text-anchor="middle" font-size="230" fill="${ink}" opacity="0">?</text>
        <path id="${p}-slash" class="draw" pathLength="1" d="M60,40 L250,280" stroke="${acc}" stroke-width="14"/>
        <text id="${p}-ps" class="hide" x="150" y="330" text-anchor="middle" font-size="28" fill="${acc}">Philosophical</text>
        <text id="${p}-ps2" class="hide" x="150" y="364" text-anchor="middle" font-size="28" fill="${acc}">suicide</text>
        <path id="${p}-psx" class="draw" pathLength="1" d="M95,354 H205" stroke="${acc}" stroke-width="5"/>
        <path class="draw hill" pathLength="1" d="M330,500 L920,150" stroke="${ink}" stroke-width="8"/>
        <g id="${p}-sis" class="hide">
          <circle cx="560" cy="300" r="56" fill="${acc}" stroke="${ink}" stroke-width="6"/>
          <circle cx="470" cy="330" r="20" fill="${ink}"/>
          <path d="M470,350 L470,400 M470,370 L505,350 M470,400 L450,440 M470,400 L490,436" stroke="${ink}" stroke-width="8" stroke-linecap="round" fill="none"/>
        </g>
        <g transform="translate(560 120) scale(0.5)"><path id="${p}-heart" class="hide" d="${HEART}" fill="${acc}" stroke="${ink}" stroke-width="10"/></g>
        <text id="${p}-en" class="hide" x="640" y="130" font-size="30" fill="${ink}">Enough</text>`;
    const push = at(s, 'struggle');
    return {
      svg,
      js: [
        `tl.fromTo("#${p}-q", { opacity: 0, scale: 0.5, transformOrigin: "150px 160px" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 0.25);`,
        blurIn(`#${p}-ps`, at(s, 'philosophical') - 0.05), blurIn(`#${p}-ps2`, at(s, 'suicide.') - 0.05), draw(`#${p}-psx`, at(s, 'suicide.') + 0.1, 0.2),
        draw(`#${p}-slash`, at(s, 'kill') - 0.1, 0.25),
        `tl.to("#${p}-q", { opacity: 0.25, duration: 0.3 }, ${at(s, 'kill') + 0.1});`,
        draw(`#${p}-ill .hill`, at(s, 'sisyphus') - 0.25, 0.5),
        pop(`#${p}-sis`, at(s, 'sisyphus') + 0.1, 0.6),
        `tl.to("#${p}-sis", { x: 180, y: -107, duration: ${r(Math.max(0.8, at(s, 'heart.') - push))}, ease: "power1.inOut" }, ${push});`,
        pop(`#${p}-heart`, at(s, 'heart.') - 0.1, 0.2),
        blurIn(`#${p}-en`, at(s, 'enough') - 0.1),
      ],
    };
  },
  // Proof falls away; the heart's reasons stay.
  proof(s, p, ink, acc, { at, draw, blurIn }) {
    const svg = `
        <g id="${p}-pf"><rect x="90" y="150" width="260" height="120" fill="${acc}" stroke="${ink}" stroke-width="6"/><text x="220" y="228" text-anchor="middle" font-size="48" fill="${C.inkV}">Proof</text></g>
        <path class="draw ht" pathLength="1" d="${HEART}" transform="translate(640 270) scale(1.45)" stroke="${ink}" stroke-width="6"/>
        <text id="${p}-rs" class="hide" x="640" y="250" text-anchor="middle" font-size="40" fill="${ink}">Reasons</text>
        <text id="${p}-rs2" class="hide" x="640" y="440" text-anchor="middle" font-size="30" fill="${ink}">reason can't see</text>`;
    return {
      svg,
      js: [
        `tl.to("#${p}-pf", { y: 360, rotation: 24, svgOrigin: "220 210", opacity: 0, duration: 0.5, ease: "power3.in" }, ${at(s, 'forget') - 0.05});`,
        draw(`#${p}-ill .ht`, at(s, 'heart') - 0.2, 0.6),
        blurIn(`#${p}-rs`, at(s, 'reasons') - 0.05),
        blurIn(`#${p}-rs2`, at(s, 'cannot') - 0.05),
      ],
    };
  },
  // Pascal's heart lands inside Camus's circle: passion with no proof.
  capture(s, p, ink, acc, { at, draw, blurIn }) {
    const svg = `
        <circle class="draw ring" pathLength="1" cx="480" cy="270" r="230" stroke="${ink}" stroke-width="8"/>
        <text id="${p}-mine" class="hide" x="480" y="20" text-anchor="middle" font-size="32" fill="${ink}">Live without proof</text>
        <g transform="translate(480 280) scale(0.9)"><path id="${p}-ht" d="${HEART}" fill="${C.vermilion}" stroke="${C.ink}" stroke-width="8"/></g>
        <text id="${p}-hero" class="hide" x="480" y="560" text-anchor="middle" font-size="36" fill="${acc}">The absurd hero</text>`;
    return {
      svg,
      initJs: [`gsap.set("#${p}-ht", { x: 520, y: -160 });`],
      js: [
        `tl.fromTo("#${p}-ht", { x: 520, y: -160 }, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, 0.25);`,
        draw(`#${p}-ill .ring`, at(s, 'passion') - 0.1, 0.5),
        blurIn(`#${p}-mine`, at(s, 'proof.') - 0.1),
        blurIn(`#${p}-hero`, at(s, 'hero.') - 0.2),
      ],
    };
  },
};

await buildDebate(new URL('../', import.meta.url), {
  A: { name: 'Camus', sub: 'Absurdist · 1913–1960', img: 'camus.jpg', medal: 'camus-medal.png' },
  B: { name: 'Pascal', sub: 'Mathematician, believer · 1623–1662', img: 'pascal.jpg', medal: 'pascal-medal.png' },
  stakes: { chip: 'Your call', text: 'pick a side', cue: 'pick' },
  question: [['Do you need', 110, 'ink'], ['a reason', 150, 'B', 10], ['to live?', 168, 'A', 8]],
  scenes: [
    { id: 's01', kind: 'hook', vo: 'l01', off: 0.05, pad: 0.8 },
    { id: 's02', kind: 'B', vo: 'l02', off: 0.2, pad: 1.0, ill: 'reed', hi: ['reed', 'diversion.', 'infinite'] },
    { id: 's03', kind: 'claim1', vo: 'l03', off: 0.15, pad: 1.6 },
    { id: 's04', kind: 'A', vo: 'l04', off: 0.2, pad: 0.6, ill: 'clash', hi: ['silent.', 'absurd.', 'open.'] },
    { id: 's05', kind: 'claim2', vo: 'l05', off: 0.15, pad: 1.9 },
    { id: 's06', kind: 'B', vo: 'l06', off: 0.2, pad: 0.4, ill: 'boat', hi: ['boat.', 'infinity.'] },
    { id: 's07', kind: 'A', vo: 'l07', off: 0.2, pad: 0.5, ill: 'boulder', hi: ['suicide.', 'Sisyphus', 'heart.'], strike: ['suicide.'] },
    { id: 's08', kind: 'point', vo: 'l08', off: 0.15, pad: 2.3 },
    { id: 's09', kind: 'B', vo: 'l09', off: 0.2, pad: 0.9, ill: 'proof', hi: ['proof.', 'heart', 'reasons'] },
    { id: 's10', kind: 'A', vo: 'l10', off: 0.15, pad: 1.0, ill: 'capture', hi: ['Passion', 'hero.'] },
    { id: 's11', kind: 'verdict', vo: 'l11', off: 0.15, pad: 1.4 },
    { id: 's12', kind: 'test', vo: 'l12', off: 0.15, pad: 0.9 },
    { id: 's13', kind: 'bridge', vo: 'l13', off: 0.05, pad: 0.5 },
  ],
  ILL,
  claim1: {
    side: 'B', chip: "Round 1 · Pascal's claim", head: 'No reason = running from death',
    center: ['You', 'facing death'],
    items: [['Your phone', 160, 150], ['Work', 800, 200], ['Games', 760, 600], ['Gossip', 200, 640]],
    itemsCue: 'distraction', arrowsCue: 'death.',
    so: 'Notice what you grab the second it gets quiet.',
  },
  claim2: {
    side: 'A', chip: "Round 1 · Camus's claim", head: 'No reason = no excuses', headCue: ['coming.', 0, -0.2],
    left: 'Wait', right: 'Live', hot: 'right',
    moves: [['coming.', 18, 0.4, 'power2.out'], ['live', 150, 0.8, 'elastic.out(1,0.45)']],
    flash: ['right', 'excuses.'],
    so: 'Stop waiting for permission to live.',
  },
  point: {
    a: ['Hope', 'hope', 190], vs: ['is just one more', 'just'], b: ['Diversion', 'diversion.', 128],
    so: 'If a belief mostly calms you, ask what it helps you avoid.',
  },
  verdict: {
    chip: 'Round 3 · Verdict', head: 'He dropped proof to stay in', headCue: 'dropped', diaCue: "camus's",
    dia: `
          <circle cx="250" cy="165" r="150" fill="none" stroke="${C.cobalt}" stroke-width="10"/>
          <path d="${HEART}" transform="translate(250 175) scale(0.6)" fill="${C.vermilion}" stroke="${C.ink}" stroke-width="8"/>`,
    lines: ["Pascal's heart", 'with no proof', "is Camus's rule"],
  },
  test: {
    head: 'Keep both',
    left: { who: { name: 'Pascal', medal: 'pascal-medal.png' }, cue: 'pascal:', items: [['Notice what you reach for', 'notice'], ["When it's quiet", 'quiet.']], verb: 'Stop running', verbCue: 'running.' },
    right: { who: { name: 'Camus', medal: 'camus-medal.png' }, cue: 'camus:', items: [['No answer needed', 'answer'], ['Push the rock', 'push']], verb: 'Keep pushing', verbCue: 'pushing.' },
  },
  sfx({ sfx, abs }) {
    sfx('pop', abs('s02', 'games,'), 0.3);
    sfx('pop', abs('s02', 'scrolling.'), 0.3);
    sfx('impact-bass-1', abs('s02', 'fills') + 0.25, 0.35);
    sfx('impact-bass-2', abs('s04', 'clash') + 0.05, 0.35);
    sfx('pop', abs('s06', 'infinity.'), 0.35);
    sfx('click-soft', abs('s07', 'kill') + 0.05, 0.5);
    sfx('whoosh-short', abs('s09', 'forget'), 0.25);
    sfx('pop', abs('s12', 'running.'), 0.35);
    sfx('click-soft', abs('s12', 'pushing.'), 0.45);
  },
});
