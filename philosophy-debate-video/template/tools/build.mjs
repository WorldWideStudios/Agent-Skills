// "Is it better to be good, or effective?" Machiavelli (A, wins) vs Socrates (B).
// Writes index.html and compositions/*.html through the shared debate engine.
//   node tools/build.mjs
import { buildDebate, C, r } from '../lib/debate.mjs';

const figure = (x, y, ink, sw = 7) => `<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${ink}" stroke-width="${sw}"/>
          <path d="M${x},${y + 24} V${y + 100} M${x - 36},${y + 60} L${x},${y + 44} L${x + 36},${y + 60} M${x},${y + 100} L${x - 26},${y + 150} M${x},${y + 100} L${x + 26},${y + 150}" fill="none" stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
const pill = (id, x, y, w, t, bg, fg) => `<g id="${id}" class="hide"><rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="58" rx="29" fill="${bg}"/><text x="${x}" y="${y + 11}" text-anchor="middle" font-size="30" fill="${fg}">${t}</text></g>`;
const LAUREL = (x, y, s, fill) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="70" fill="${fill}" stroke="${C.ink}" stroke-width="8"/>
          <path d="M-40,30 Q-60,-10 -30,-50 M40,30 Q60,-10 30,-50 M-48,0 l-16,-6 M-44,-26 l-16,-10 M48,0 l16,-6 M44,-26 l16,-10" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/></g>`;

const ILL = {
  // The soul is the real you: a bright orb. Doing wrong cracks it; suffering a wrong leaves it whole.
  soul(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const rays = Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<line x1="${r(220 + 168 * Math.cos(a))}" y1="${r(270 + 168 * Math.sin(a))}" x2="${r(220 + 200 * Math.cos(a))}" y2="${r(270 + 200 * Math.sin(a))}" stroke="${acc}" stroke-width="8" stroke-linecap="round"/>`;
    }).join('');
    const orb = (x, y, rr) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${acc}" stroke="${ink}" stroke-width="6"/>`;
    const svg = `
        <g id="${p}-rays">${rays}</g>
        <g id="${p}-orb">${orb(220, 270, 150)}
          <text id="${p}-sl" class="hide" x="220" y="290" text-anchor="middle" font-size="60" fill="${C.vermilion}">Soul</text>
          <g id="${p}-cracks"><path class="draw ck" pathLength="1" d="M170,130 L205,200 L175,240 L220,300 L195,350" stroke="${ink}" stroke-width="8"/>
            <path class="draw ck" pathLength="1" d="M330,200 L285,245 L310,285 L255,320" stroke="${ink}" stroke-width="7"/>
            <path class="draw ck" pathLength="1" d="M120,330 L170,320 L190,380" stroke="${ink}" stroke-width="7"/></g>
        </g>
        <text id="${p}-real" class="hide" x="220" y="40" text-anchor="middle" font-size="34" fill="${acc}">The real you</text>
        <g id="${p}-a" class="hide">${orb(500, 150, 52)}
          <text x="580" y="146" font-size="40" fill="${acc}">Suffer it</text><text x="580" y="186" font-size="28" fill="${ink}">Soul stays whole</text></g>
        <g id="${p}-b" class="hide">${orb(500, 380, 52)}
          <path class="draw ck2" pathLength="1" d="M485,335 L508,370 L488,392 L512,425" stroke="${ink}" stroke-width="7"/>
          <text x="580" y="376" font-size="40" fill="${acc}">Commit it</text><text x="580" y="416" font-size="28" fill="${ink}">Soul cracks</text></g>`;
    const hit = at(s, 'damages');
    return {
      svg,
      js: [
        `tl.fromTo("#${p}-orb", { opacity: 0, scale: 0.4, transformOrigin: "220px 270px" }, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.8)" }, 0.25);`,
        `tl.fromTo("#${p}-rays line", { opacity: 0, scale: 0.6, transformOrigin: "220px 270px" }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out", stagger: 0.03 }, 0.5);`,
        `tl.to("#${p}-rays", { rotation: 30, svgOrigin: "220 270", duration: ${r(s.dur)}, ease: "none" }, 0);`,
        draw(`#${p}-ill .ck`, hit - 0.1, 0.25, 0.08),
        `tl.to("#${p}-orb", { keyframes: [{ x: -14, duration: 0.05 }, { x: 12, duration: 0.05 }, { x: -8, duration: 0.05 }, { x: 0, duration: 0.05 }] }, ${hit});`,
        `tl.to("#${p}-rays", { opacity: 0.15, duration: 0.3 }, ${hit});`,
        blurIn(`#${p}-real`, at(s, 'really') - 0.1),
        pop(`#${p}-sl`, at(s, 'soul.') - 0.1, 0.5),
        // suffering a wrong: the cracks heal, the glow returns
        `tl.to("#${p}-cracks", { opacity: 0, duration: 0.4 }, ${at(s, 'suffer') - 0.1});`,
        `tl.to("#${p}-rays", { opacity: 1, duration: 0.4 }, ${at(s, 'suffer') - 0.1});`,
        pop(`#${p}-a`, at(s, 'suffer') - 0.1, 0.7),
        pop(`#${p}-b`, at(s, 'commit') - 0.1, 0.7), draw(`#${p}-ill .ck2`, at(s, 'commit') + 0.25, 0.25),
      ],
    };
  },
  // How people should live vs how they do; the one good man among wolves goes down.
  wolves(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const crowd = [[140, 300], [300, 280], [660, 280], [820, 300]].map(([x, y], i) => `<g class="cr" data-i="${i}">${figure(x, y, ink, 7)}</g>`).join('');
    const svg = `
        <text id="${p}-act" class="hide" x="60" y="60" font-size="44" fill="${acc}">Actually</text>
        <text id="${p}-sh" class="hide" x="900" y="60" text-anchor="end" font-size="44" fill="${ink}">Should</text>
        <path id="${p}-shx" class="draw" pathLength="1" d="M690,44 H905" stroke="${ink}" stroke-width="8"/>
        <path class="draw gnd" pathLength="1" d="M60,472 H900" stroke="${ink}" stroke-width="6"/>
        <g id="${p}-good" class="hide">${figure(480, 300, acc, 8)}<ellipse cx="480" cy="262" rx="40" ry="10" fill="none" stroke="${acc}" stroke-width="6"/></g>
        <g id="${p}-crowd">${crowd}</g>`;
    return {
      svg,
      initJs: [`gsap.set("#${p}-crowd .cr", { opacity: 0 });`],
      js: [
        blurIn(`#${p}-act`, at(s, 'actually') - 0.05),
        blurIn(`#${p}-sh`, at(s, 'should.') - 0.2), draw(`#${p}-shx`, at(s, 'should.') + 0.05, 0.25),
        draw(`#${p}-ill .gnd`, at(s, 'man') - 0.3, 0.4),
        pop(`#${p}-good`, at(s, 'good') - 0.05, 0.6),
        `tl.to("#${p}-good", { rotation: 90, svgOrigin: "480 450", duration: 0.5, ease: "power3.in" }, ${at(s, 'ruined')});`,
        `tl.fromTo("#${p}-crowd .cr", { opacity: 0, x: (i) => (i < 2 ? -120 : 120) }, { opacity: 1, x: (i) => (i < 2 ? 60 : -60), duration: 0.45, ease: "power3.out", stagger: 0.08 }, ${at(s, 'among') - 0.1});`,
      ],
    };
  },
  // The prince takes the city and loses himself.
  crown(s, p, ink, acc, { at, draw, pop }) {
    const svg = `
        <g id="${p}-prince">${figure(180, 250, ink, 8)}<path d="M150,222 L150,180 L166,200 L180,172 L194,200 L210,180 L210,222 Z" fill="${acc}" stroke="${ink}" stroke-width="5"/></g>
        ${pill(`${p}-t0`, 440, 80, 160, 'Lies', acc, C.inkV)}
        ${pill(`${p}-t1`, 640, 80, 170, 'Kills', acc, C.inkV)}
        ${pill(`${p}-t2`, 700, 160, 360, 'Breaks his word', acc, C.inkV)}
        <path class="draw city" pathLength="1" d="M420,470 V330 H470 V300 H500 V330 H560 V250 H600 V210 H640 V250 H680 V330 H740 V290 H780 V330 H860 V470" stroke="${ink}" stroke-width="7"/>
        <path class="draw gnd" pathLength="1" d="M60,472 H900" stroke="${ink}" stroke-width="6"/>`;
    return {
      svg,
      js: [
        draw(`#${p}-ill .gnd`, 0.3, 0.4),
        pop(`#${p}-t0`, at(s, 'lies,') - 0.05), pop(`#${p}-t1`, at(s, 'kills,') - 0.05), pop(`#${p}-t2`, at(s, 'breaks') - 0.05),
        draw(`#${p}-ill .city`, at(s, 'city') - 0.2, 0.6),
        `tl.to("#${p}-prince", { opacity: 0.12, filter: "blur(4px)", duration: 0.5, ease: "power2.in" }, ${at(s, 'loses') - 0.05});`,
      ],
    };
  },
  // Florence's republic: good men, the fall in 1512, a goodness that shields nobody.
  florence(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const svg = `
        <g id="${p}-dome">
          <path class="draw dm" pathLength="1" d="M90,470 V330 H330 V470 M110,330 Q210,160 310,330 M210,190 V150 M195,150 H225 M150,330 V470 M270,330 V470" stroke="${ink}" stroke-width="7"/>
          <g id="${p}-men" class="hide"><circle cx="165" cy="400" r="14" fill="${acc}"/><circle cx="210" cy="400" r="14" fill="${acc}"/><circle cx="255" cy="400" r="14" fill="${acc}"/></g>
        </g>
        ${pill(`${p}-yr`, 210, 70, 150, '1512', acc, C.cobalt)}
        <text id="${p}-tort" class="hide" x="470" y="110" font-size="40" fill="${acc}">Tortured</text>
        <path id="${p}-rope" class="draw" pathLength="1" d="M520,140 V300" stroke="${ink}" stroke-width="6"/>
        <g id="${p}-me" class="hide">${figure(520, 300, ink, 6)}</g>
        <path class="draw sh" pathLength="1" d="M730,160 H890 V300 Q890,400 810,450 Q730,400 730,300 Z" stroke="${ink}" stroke-width="8"/>
        <path id="${p}-shx" class="draw" pathLength="1" d="M800,170 L830,250 L790,320 L820,440" stroke="${acc}" stroke-width="8"/>
        <text id="${p}-nob" class="hide" x="770" y="505" text-anchor="middle" font-size="30" fill="${ink}">Protects nobody</text>`;
    return {
      svg,
      js: [
        draw(`#${p}-ill .dm`, at(s, "florence's") - 0.1, 0.6),
        pop(`#${p}-men`, at(s, 'good', 0) - 0.05, 0.5),
        pop(`#${p}-yr`, at(s, '1512') - 0.05),
        `tl.to("#${p}-dome", { rotation: 14, y: 30, opacity: 0.35, svgOrigin: "330 470", duration: 0.5, ease: "power3.in" }, ${at(s, 'fell') - 0.05});`,
        draw(`#${p}-rope`, at(s, 'winners') - 0.1, 0.3), pop(`#${p}-me`, at(s, 'tortured') - 0.1, 0.8), blurIn(`#${p}-tort`, at(s, 'tortured')),
        draw(`#${p}-ill .sh`, at(s, 'goodness') - 0.1, 0.5),
        draw(`#${p}-shx`, at(s, 'nobody.') - 0.2, 0.25), blurIn(`#${p}-nob`, at(s, 'nobody.')),
      ],
    };
  },
  // Hemlock in 399 BC; 2,400 years of people still quoting him.
  hemlock(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const bubble = (x, y) => `<path d="M${x - 60},${y - 34} h120 a20,20 0 0 1 20,20 v40 a20,20 0 0 1 -20,20 h-80 l-26,22 v-22 h-14 a20,20 0 0 1 -20,-20 v-40 a20,20 0 0 1 20,-20 z" fill="${acc}" stroke="${ink}" stroke-width="4"/>`;
    const svg = `
        <path class="draw tline" pathLength="1" d="M120,330 H860" stroke="${ink}" stroke-width="8"/>
        <g id="${p}-cup" class="hide"><path d="M80,170 H160 L150,240 Q120,262 90,240 Z M120,256 V300 M96,302 H144" fill="${acc}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
          <text x="120" y="390" text-anchor="middle" font-size="32" fill="${ink}">399 BC</text></g>
        <g id="${p}-mk"><circle cx="120" cy="330" r="18" fill="${ink}"/></g>
        <text id="${p}-yrs" class="hide" x="490" y="300" text-anchor="middle" font-size="40" fill="${acc}">2,400 years</text>
        <text id="${p}-now" class="hide" x="860" y="390" text-anchor="middle" font-size="32" fill="${ink}">Today</text>
        <g id="${p}-qs" class="hide">${bubble(720, 150)}${bubble(840, 90)}${bubble(860, 220)}</g>`;
    return {
      svg,
      js: [
        draw(`#${p}-ill .tline`, at(s, 'long') - 0.1, 0.6),
        pop(`#${p}-cup`, at(s, 'silenced') - 0.1, 0.5),
        `tl.to("#${p}-mk", { x: 740, duration: 0.9, ease: "power2.inOut" }, ${at(s, 'twenty-four') - 0.1});`,
        blurIn(`#${p}-yrs`, at(s, 'centuries') - 0.05), blurIn(`#${p}-now`, at(s, 'later,')),
        `tl.fromTo("#${p}-qs path", { opacity: 0, scale: 0.3, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.5)", stagger: 0.12 }, ${at(s, 'quoting') - 0.1});`,
        `tl.set("#${p}-qs", { opacity: 1 }, ${at(s, 'quoting') - 0.1});`,
      ],
    };
  },
  // Socrates's laurel lands inside Machiavelli's book.
  book(s, p, ink, acc, { at, draw, pop, blurIn }) {
    const svg = `
        <path class="draw bk" pathLength="1" d="M200,40 H760 V500 H200 Z M240,40 V500" stroke="${ink}" stroke-width="8"/>
        <text id="${p}-ttl" class="hide" x="500" y="110" text-anchor="middle" font-size="44" fill="${acc}">The Prince</text>
        <g id="${p}-lr">${LAUREL(500, 250, 1, C.vermilion)}</g>
        ${pill(`${p}-r0`, 345, 420, 190, 'Results', acc, C.cobalt)}
        ${pill(`${p}-r1`, 595, 420, 290, 'Appearances', acc, C.cobalt)}`;
    return {
      svg,
      initJs: [`gsap.set("#${p}-lr", { x: 520, y: -160 });`],
      js: [
        `tl.fromTo("#${p}-lr", { x: 520, y: -160 }, { x: 0, y: 0, duration: 0.6, ease: "power3.out" }, 0.25);`,
        pop(`#${p}-r0`, at(s, 'results') - 0.05), pop(`#${p}-r1`, at(s, 'appearances.') - 0.05),
        draw(`#${p}-ill .bk`, at(s, 'my') - 0.2, 0.5),
        blurIn(`#${p}-ttl`, at(s, 'book.') - 0.05),
      ],
    };
  },
};

await buildDebate(new URL('../', import.meta.url), {
  A: { name: 'Machiavelli', sub: 'Florentine diplomat · 1469–1527', img: 'machiavelli.jpg', medal: 'machiavelli-medal.png' },
  B: { name: 'Socrates', sub: 'Athenian · executed 399 BC', img: 'socrates.jpg', medal: 'socrates-medal.png' },
  stakes: { chip: 'Your call', text: 'pick a side', cue: 'pick' },
  question: [['Is it better to be', 76, 'ink'], ['good,', 200, 'B', 12], ['or', 90, 'ink', 10], ['effective?', 124, 'A', 8]],
  scenes: [
    { id: 's01', kind: 'hook', vo: 'l01', off: 0.05, pad: 0.8 },
    { id: 's02', kind: 'B', vo: 'l02', off: 0.2, pad: 0.5, ill: 'soul', hi: ['Good.', 'soul.', 'suffer'] },
    { id: 's03', kind: 'claim1', vo: 'l03', off: 0.15, pad: 1.6 },
    { id: 's04', kind: 'A', vo: 'l04', off: 0.2, pad: 0.6, ill: 'wolves', hi: ['actually', 'ruined'] },
    { id: 's05', kind: 'claim2', vo: 'l05', off: 0.15, pad: 2.3 },
    { id: 's06', kind: 'B', vo: 'l06', off: 0.2, pad: 0.5, ill: 'crown', hi: ['city', 'himself.'] },
    { id: 's07', kind: 'A', vo: 'l07', off: 0.2, pad: 0.5, ill: 'florence', hi: ['1512', 'tortured', 'nobody.'] },
    { id: 's08', kind: 'point', vo: 'l08', off: 0.15, pad: 2.1 },
    { id: 's09', kind: 'B', vo: 'l09', off: 0.2, pad: 0.8, ill: 'hemlock', hi: ['silenced', 'quoting'] },
    { id: 's10', kind: 'A', vo: 'l10', off: 0.15, pad: 1.0, ill: 'book', hi: ['reputation.', 'book.'] },
    { id: 's11', kind: 'verdict', vo: 'l11', off: 0.15, pad: 1.4 },
    { id: 's12', kind: 'test', vo: 'l12', off: 0.15, pad: 0.9 },
    { id: 's13', kind: 'bridge', vo: 'l13', off: 0.05, pad: 0.5 },
  ],
  ILL,
  claim1: {
    side: 'B', chip: "Round 1 · Socrates's claim", head: 'Doing wrong = harming yourself',
    // The wrong you do grazes them and comes back to hit you.
    draw(s, p, { at, pop, blurIn }) {
      const svg = `
          <circle id="${p}-you" cx="250" cy="470" r="125" fill="${C.vermilion}" stroke="${C.ink}" stroke-width="6"/>
          <text x="250" y="470" text-anchor="middle" font-size="52" fill="${C.white}">You</text>
          <text x="250" y="512" text-anchor="middle" font-size="28" fill="${C.white}">the doer</text>
          <path id="${p}-yx" class="draw" pathLength="1" d="M200,360 L240,420 L215,455 L265,520 L240,575" stroke="${C.white}" stroke-width="8"/>
          <g id="${p}-them"><circle cx="770" cy="470" r="95" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>
            <text x="770" y="484" text-anchor="middle" font-size="40" fill="${C.ink}">Them</text></g>
          <g id="${p}-wr" opacity="0"><rect x="120" y="268" width="210" height="64" rx="32" fill="${C.ink}"/><text x="225" y="311" text-anchor="middle" font-size="30" fill="${C.lime}">A wrong</text></g>
          <text id="${p}-sc" class="hide" x="770" y="620" text-anchor="middle" font-size="32" fill="${C.ink}">A scratch</text>
          <text id="${p}-dm" class="hide" x="250" y="650" text-anchor="middle" font-size="36" fill="${C.vermilion}">The real damage</text>`;
      const go = at(s, 'doing') - 0.1, out = r(at(s, 'wrong') + 0.25), back = at(s, 'doer');
      const d1 = r(Math.max(0.35, out - go)), d2 = r(Math.max(0.5, back - out));
      return {
        svg,
        js: [
          `tl.set("#${p}-wr", { opacity: 1 }, ${r(go)});`,
          `tl.fromTo("#${p}-wr", { x: 0, y: 0, rotation: 0 }, { keyframes: [{ x: 440, y: 120, rotation: 200, duration: ${d1}, ease: "power2.out" }, { x: 260, y: -120, rotation: 400, duration: ${r(d2 * 0.5)}, ease: "sine.inOut" }, { x: 25, y: 150, rotation: 540, duration: ${r(d2 * 0.5)}, ease: "power2.in" }] }, ${r(go)});`,
          `tl.to("#${p}-them", { keyframes: [{ x: 8, duration: 0.06 }, { x: -5, duration: 0.06 }, { x: 0, duration: 0.06 }] }, ${r(go + d1)});`,
          blurIn(`#${p}-sc`, go + d1),
          `tl.to("#${p}-wr", { opacity: 0, scale: 1.6, duration: 0.2 }, ${r(go + d1 + d2)});`,
          `tl.to("#${p}-you", { keyframes: [{ scale: 0.88, transformOrigin: "250px 470px", duration: 0.08 }, { scale: 1.04, duration: 0.12 }, { scale: 1, duration: 0.2 }] }, ${r(go + d1 + d2)});`,
          `tl.fromTo("#${p}-yx", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.2, ease: "power2.out" }, ${r(go + d1 + d2)});`,
          pop(`#${p}-dm`, r(Math.max(go + d1 + d2 + 0.1, at(s, 'most.') - 0.1)), 0.6),
        ],
      };
    },
    so: 'Every wrong you do, you have to live inside.',
  },
  claim2: {
    side: 'A', chip: "Round 1 · Machiavelli's claim", head: 'Pure goodness = easy prey', headCue: ['claim:', 0, 0.1],
    left: 'Loses', right: 'Wins', hot: 'left',
    moves: [['pure', 150, 0.6, 'power3.out'], ['loses.', 0, 0.6, 'power3.in']],
    flash: ['left', 'loses.'],
    so: 'Rules only protect you if everyone else follows them.',
  },
  point: {
    a: ['Goodness', 'goodness', 150], vs: ["that can't protect", 'protect'], b: ["Isn't enough", 'enough.', 104],
    so: 'Good intentions need the power to act on them.',
  },
  verdict: {
    chip: 'Round 3 · Verdict', head: 'He defended good by what it won', headCue: 'defended', diaCue: "rival's",
    dia: `
          <rect x="120" y="20" width="260" height="290" fill="none" stroke="${C.cobalt}" stroke-width="10"/>
          <path d="M150,20 V310" stroke="${C.cobalt}" stroke-width="8"/>
          ${LAUREL(265, 165, 1.1, C.vermilion)}`,
    lines: ["Socrates's legacy", 'judged by results', "is Machiavelli's rule"],
    stampSize: 76, stampLeft: 100,
  },
  test: {
    head: "Take what's useful",
    left: { who: { name: 'Socrates', medal: 'socrates-medal.png' }, cue: 'socrates', items: [['A line', 'line'], ["you won't cross", 'cross.']], verb: 'Know your line', verbCue: ['line', 1], verbSize: 56 },
    right: { who: { name: 'Machiavelli', medal: 'machiavelli-medal.png' }, cue: 'machiavelli', items: [['How others win', 'others'], ['by crossing it', 'crossing']], verb: 'Know the game', verbCue: 'game.', verbSize: 56 },
  },
  sfx({ sfx, abs }) {
    sfx('click-soft', abs('s02', 'damages'), 0.45);
    sfx('pop', abs('s06', 'lies,'), 0.3);
    sfx('pop', abs('s06', 'kills,'), 0.3);
    sfx('impact-bass-2', abs('s07', 'fell') + 0.35, 0.4);
    sfx('click-soft', abs('s09', 'silenced'), 0.45);
    sfx('pop', abs('s09', 'quoting'), 0.35);
    sfx('impact-bass-1', abs('s10', 'book.') + 0.05, 0.35);
    sfx('pop', abs('s12', 'line', 1), 0.35);
    sfx('click-soft', abs('s12', 'game.'), 0.45);
  },
});
