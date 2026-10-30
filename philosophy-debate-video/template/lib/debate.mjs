// Shared engine for the vertical (1080x1920) three-round debate videos.
// A debate's tools/build.mjs passes its content (who, question, scenes, drawings,
// card copy, effects); this writes index.html and compositions/*.html from it,
// script.json and the word timings in words/all.json.
// Side A is the winner (cobalt, enters from the left), side B the loser
// (vermilion, enters from the right), the referee is lime.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

export const C = {
  lime: '#D9F24A', ink: '#101010', white: '#FFFFFF',
  cobalt: '#2441D6', vermilion: '#E63A1C', inkV: '#1A0805',
};
export const W = 1080, H = 1920;
export const r = (n) => Math.round(n * 1000) / 1000;
const SCALE_TOP = 980;

export const ground = (k) => (k === 'A' ? C.cobalt : k === 'B' ? C.vermilion : C.lime);
export const sideInk = (k) => (k === 'A' ? C.white : C.inkV);
export const sideAcc = (k) => (k === 'A' ? C.lime : C.white);
const colour = (c) => ({ A: C.cobalt, B: C.vermilion, ink: C.ink, white: C.white, lime: C.lime }[c] || c);

// ---------- motion helpers (each returns one timeline line) ----------
export const blurIn = (sel, t, d = 0.2) => `tl.fromTo("${sel}", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: ${d}, ease: "power4.out" }, ${r(t)});`;
export const blurOut = (sel, t) => `tl.to("${sel}", { opacity: 0, filter: "blur(8px)", duration: 0.16, ease: "power2.in" }, ${r(t)});`;
export const draw = (sel, t, d = 0.6, stagger = 0) => `tl.fromTo("${sel}", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: ${d}, ease: "power2.inOut", stagger: ${stagger} }, ${r(t)});`;
export const pop = (sel, t, from = 0.4) => `tl.fromTo("${sel}", { opacity: 0, scale: ${from}, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, ${r(t)});`;
export const drop = (sel, t, dy = -460, d = 0.45) => `tl.fromTo("${sel}", { opacity: 1, y: ${dy} }, { opacity: 1, y: 0, duration: ${d}, ease: "power3.in", immediateRender: false }, ${r(t)});`;

export async function buildDebate(root, D) {
  const script = JSON.parse(await readFile(new URL('script.json', root)));
  const words = JSON.parse(await readFile(new URL('words/all.json', root)));
  const line = Object.fromEntries(script.lines.map((l) => [l.id, l]));
  const probe = (rel) => Math.floor(Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', new URL(rel, root).pathname]).toString()) * 1000) / 1000;

  const SCENES = D.scenes.map((s) => ({ ...s }));
  let acc = 0;
  SCENES.forEach((s, i) => {
    s.dur = r(s.off + words[s.vo].at(-1)[2] + s.pad);
    s.start = r(acc);
    acc += s.dur;
    s.prevGround = i ? ground(SCENES[i - 1].kind) : C.lime;
  });
  const TOTAL = r(acc);

  /** Scene-local time of a word, by its index or by its text in the script line. */
  const norm = (t) => t.toLowerCase().replace(/[^a-z0-9']/g, '');
  function at(s, w, nth = 0) {
    const toks = line[s.vo].text.split(' ');
    let i = typeof w === 'number' ? w : -1;
    if (i < 0) {
      const hits = toks.map((t, k) => (norm(t) === norm(w) ? k : -1)).filter((k) => k >= 0);
      if (hits[nth] === undefined) throw new Error(`${s.id}: no word "${w}"`);
      i = hits[nth];
    }
    return r(s.off + words[s.vo][i][1]);
  }
  const voiceEnd = (s) => r(s.off + words[s.vo].at(-1)[2]);
  // A cue is a word, [word, nth] or [word, nth, offset].
  const cue = (s, c) => (Array.isArray(c) ? r(at(s, c[0], c[1] || 0) + (c[2] || 0)) : at(s, c));
  const h = { at, cue, voiceEnd, C, r, blurIn, blurOut, draw, pop, drop };

  const enter = (s, sel) => {
    if (s.prevGround === ground(s.kind)) return [];
    const from = s.kind === 'A' ? 'inset(0% 100% 0% 0%)' : s.kind === 'B' ? 'inset(0% 0% 0% 100%)' : 'inset(0% 0% 100% 0%)';
    return [`tl.fromTo("${sel}", { clipPath: "${from}" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "expo.out" }, 0);`];
  };
  const exitAll = (s, sel) => [`tl.to("${sel}", { opacity: 0, filter: "blur(8px)", duration: 0.12, ease: "power2.in" }, ${r(s.dur - 0.14)});`];

  const baseCss = (s) => `
    #root { position: absolute; inset: 0; overflow: hidden; background: ${s.prevGround}; }
    .stage { position: absolute; inset: 0; background: ${ground(s.kind)}; }
    .content { position: absolute; inset: 0; }
    .disp { font-family: "Archivo Black", sans-serif; text-transform: uppercase; line-height: 0.92; letter-spacing: -0.01em; margin: 0; }
    .chip { position: absolute; left: 60px; top: 190px; font-family: "Archivo Black", sans-serif; font-size: 34px; text-transform: uppercase; letter-spacing: 0.02em; background: ${C.ink}; color: ${C.lime}; padding: 10px 20px 8px; }
    .head { position: absolute; left: 60px; top: 266px; width: 900px; font-size: 92px; color: ${C.ink}; }
    .sowhat { position: absolute; left: 60px; width: 900px; font-family: "Outfit", sans-serif; font-weight: 600; font-size: 44px; line-height: 1.2; color: ${C.ink}; margin: 0; }
    .sowhat b { font-family: "Archivo Black", sans-serif; font-weight: 400; font-size: 30px; letter-spacing: 0.04em; text-transform: uppercase; display: block; margin-bottom: 8px; }
    svg text { font-family: "Archivo Black", sans-serif; text-transform: uppercase; }
    .draw { fill: none; stroke-dasharray: 1; stroke-dashoffset: 1; stroke-linecap: round; stroke-linejoin: round; }
    .hide { opacity: 0; }`;

  function wrap(s, html, style, js) {
    return `<template>
  <style>${baseCss(s)}${style}
  </style>
  <div id="root" data-composition-id="${s.id}" data-width="${W}" data-height="${H}">
    <div id="${s.id}-stage" class="stage">
      <div id="${s.id}-content" class="content">${html}
      </div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js.join('\n    ')}
    window.__timelines["${s.id}"] = tl;
  </script>
</template>
`;
  }

  // ---------- the balance (stakes) ----------
  const DEG = 7;
  const ends = (diff) => {
    const a = (-DEG * diff * Math.PI) / 180;
    return { L: { x: r(400 - 320 * Math.cos(a)), y: r(60 - 320 * Math.sin(a)) }, R: { x: r(400 + 320 * Math.cos(a)), y: r(60 + 320 * Math.sin(a)) }, deg: -DEG * diff };
  };
  function scaleSvg(p, a0, b0, top) {
    const stones = (side, have, col) =>
      [0, 1, 2].map((i) => `<rect id="${p}-w${side}${i}" x="${[-44, 44, 0][i] - 34}" y="${[100, 100, 68][i]}" width="68" height="32" rx="12" fill="${col}" stroke="${C.ink}" stroke-width="4" opacity="${i < have ? 1 : 0}"/>`).join('');
    const pan = (side, who, have, col) => `
      <g id="${p}-pan${side}">
        <line x1="0" y1="0" x2="-92" y2="136" stroke="${C.ink}" stroke-width="5"/>
        <line x1="0" y1="0" x2="92" y2="136" stroke="${C.ink}" stroke-width="5"/>
        ${stones(side, have, col)}
        <path d="M-112,132 L112,132 Q100,180 0,184 Q-100,180 -112,132 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>
        <circle cx="0" cy="268" r="70" fill="${col}"/>
        <image href="assets/img/${who.medal}" x="-62" y="206" width="124" height="124"/>
        <text x="0" y="392" text-anchor="middle" font-size="${who.name.length > 9 ? 32 : 42}" fill="${C.ink}">${who.name}</text>
        <text id="${p}-score${side}" x="0" y="478" text-anchor="middle" font-size="86" fill="${col}">${have}</text>
      </g>`;
    return `
      <svg id="${p}-scale" viewBox="-60 0 920 620" width="900" height="606" style="position:absolute;left:90px;top:${top}px" data-layout-allow-overflow>
        <path d="M290,600 L510,600 L480,556 L320,556 Z" fill="${C.ink}"/>
        <rect x="390" y="60" width="20" height="500" fill="${C.ink}"/>
        <g id="${p}-beam"><rect x="70" y="50" width="660" height="20" rx="10" fill="${C.ink}"/></g>
        <circle cx="400" cy="60" r="20" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>
        ${pan('A', D.A, a0, C.cobalt)}
        ${pan('B', D.B, b0, C.vermilion)}
      </svg>`;
  }
  function scaleInit(p, a, b) {
    const k = ends(a - b);
    return [
      `gsap.set("#${p}-beam", { rotation: ${k.deg}, svgOrigin: "400 60" });`,
      `gsap.set("#${p}-panA", { x: ${k.L.x}, y: ${k.L.y} });`,
      `gsap.set("#${p}-panB", { x: ${k.R.x}, y: ${k.R.y} });`,
    ];
  }
  function scaleDrop(p, t, side, idx, a, b, settle = 0.9, ease = 'elastic.out(1,0.5)') {
    const k = ends(a - b), land = r(t + 0.4);
    return [
      `tl.fromTo("#${p}-w${side}${idx}", { opacity: 1, y: -620 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.in", immediateRender: false }, ${r(t)});`,
      `tl.to("#${p}-beam", { rotation: ${k.deg}, svgOrigin: "400 60", duration: ${settle}, ease: "${ease}" }, ${land});`,
      `tl.to("#${p}-panA", { x: ${k.L.x}, y: ${k.L.y}, duration: ${settle}, ease: "${ease}" }, ${land});`,
      `tl.to("#${p}-panB", { x: ${k.R.x}, y: ${k.R.y}, duration: ${settle}, ease: "${ease}" }, ${land});`,
      `tl.set("#${p}-score${side}", { textContent: "${side === 'A' ? a : b}" }, ${land});`,
      `tl.fromTo("#${p}-score${side}", { scale: 1.5, transformOrigin: "50% 70%" }, { scale: 1, duration: 0.5, ease: "expo.out", immediateRender: false }, ${land});`,
    ];
  }

  // ---------- the question (frame 0 and the loop seam) ----------
  const questionHtml = (p) => `
      <div id="${p}-q" style="position:absolute;left:60px;top:230px;width:960px">
        ${D.question.map(([t, size, col, mt]) => `<h1 class="disp" style="font-size:${size}px;color:${colour(col)};margin-top:${mt || 0}px">${t}</h1>`).join('\n        ')}
      </div>`;

  // ---------- scene kinds ----------
  function speaker(s) {
    const p = s.id, A = s.kind === 'A', who = A ? D.A : D.B;
    const ink = sideInk(s.kind), acc = sideAcc(s.kind);
    const toks = line[s.vo].text.split(' ');
    const dlg = toks.map((t, i) => `<span id="${p}-w${i}" class="dw${s.hi.includes(t) ? ' hi' : ''}${(s.strike || []).includes(t) ? ' x' : ''}">${t}</span>`).join(' ');
    const ill = D.ILL[s.ill](s, p, ink, acc, h);
    // longer lines get smaller type, and the drawing moves down to make room
    const len = line[s.vo].text.length;
    const size = s.size || (len <= 85 ? 60 : len <= 125 ? 54 : 48);
    const illTop = s.illTop || (len <= 85 ? 1080 : len <= 125 ? 1100 : 1120);
    const style = `
    .photo { position: absolute; left: 0; top: 0; width: ${W}px; height: 640px; overflow: hidden; }
    .photo img { position: absolute; left: -108px; top: -40px; width: 1296px; height: 912px; }
    .tag { position: absolute; left: 60px; top: 600px; background: ${ground(s.kind)}; padding: 16px 24px 12px; }
    .tag h2 { font-size: 64px; color: ${ink}; }
    .tag p { font-family: "Outfit", sans-serif; font-weight: 500; font-size: 28px; color: ${ink}; opacity: 0.85; margin: 6px 0 0; }
    .dlg { position: absolute; left: 60px; top: 790px; width: 900px; font-family: "Outfit", sans-serif; font-weight: 700; font-size: ${size}px; line-height: 1.16; color: ${ink}; margin: 0; }
    .dw { opacity: 0.25; }
    .dw.hi { color: ${acc}; }
    .dw.x { text-decoration: line-through; text-decoration-thickness: 6px; }
    .ill { position: absolute; left: 60px; top: ${illTop}px; }`;
    const html = `
        <div id="${p}-photo" class="photo"><img id="${p}-img" src="assets/img/${who.img}" alt="${who.name}"></div>
        <div id="${p}-tag" class="tag"><h2 class="disp">${who.name}</h2><p>${who.sub}</p></div>
        <p id="${p}-dlg" class="dlg">${dlg}</p>
        <svg id="${p}-ill" class="ill" viewBox="0 0 960 520" width="960" height="520" data-layout-allow-overflow>${ill.svg}
        </svg>`;
    const js = [
      ...(ill.initJs || []),
      ...enter(s, `#${p}-stage`),
      `tl.fromTo("#${p}-img", { scale: 1 }, { scale: 1.07, duration: ${s.dur}, ease: "none" }, 0);`,
      `tl.fromTo("#${p}-tag", { x: ${A ? -420 : 420} }, { x: 0, duration: 0.5, ease: "expo.out" }, 0.12);`,
      ...toks.map((_, i) => `tl.to("#${p}-w${i}", { opacity: 1, duration: 0.1, ease: "power1.out" }, ${r(at(s, i) - 0.03)});`),
      ...ill.js,
      ...exitAll(s, `#${p}-content`),
    ];
    return wrap(s, html, style, js);
  }

  function hook(s) {
    const p = s.id, stakes = D.stakes || { chip: 'Stakes', text: "loser's answer leaves your life", cue: "loser's" };
    const html = `${questionHtml(p)}
        <div id="${p}-stakes" class="hide" style="position:absolute;left:60px;top:860px;font-family:'Outfit',sans-serif;font-weight:700;font-size:44px;color:${C.ink}">
          <span class="chip" style="position:static;display:inline-block;margin-right:14px">${stakes.chip}</span>${stakes.text}</div>
        ${scaleSvg(p, 0, 0, SCALE_TOP)}`;
    const js = [
      ...scaleInit(p, 0, 0),
      `tl.fromTo(["#${p}-panA image", "#${p}-panB image"], { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.inOut", stagger: 0.3 }, ${at(s, 'two')});`,
      blurIn(`#${p}-stakes`, at(s, stakes.cue) - 0.05),
      blurOut(`#${p}-q`, s.dur - 0.16), blurOut(`#${p}-stakes`, s.dur - 0.16), blurOut(`#${p}-scale`, s.dur - 0.16),
    ];
    return wrap(s, html, '', js);
  }

  // Round 1, first claim: a ring with "you" in the middle and four things around it.
  // Arrows point out to the things, or in to you (`inward`).
  // A debate can replace the ring with its own drawing: `draw(s, p, h)` returns { svg, js }.
  function claim1(s) {
    const p = s.id, K = D.claim1, col = colour(K.side);
    const head = `
        <div id="${p}-chip" class="chip">${K.chip}</div>
        <h1 id="${p}-head" class="disp head hide">${K.head}</h1>`;
    const so = `
        <p id="${p}-so" class="sowhat hide" style="top:1360px"><b>So what</b>${K.so}</p>`;
    if (K.draw) {
      const d = K.draw(s, p, h);
      return wrap(s, `${head}
        <svg id="${p}-dia" viewBox="0 0 960 760" width="960" height="760" style="position:absolute;left:60px;top:560px" data-layout-allow-overflow>${d.svg}
        </svg>${so}`, '', [
        ...(d.initJs || []),
        ...enter(s, `#${p}-stage`),
        blurIn(`#${p}-chip`, 0.2), blurIn(`#${p}-head`, at(s, 'claim:') + 0.1),
        ...d.js,
        blurIn(`#${p}-so`, voiceEnd(s) - 0.9),
        ...exitAll(s, `#${p}-content`),
      ]);
    }
    const tip = K.inward ? `marker-start="url(#${p}-tip2)"` : `marker-end="url(#${p}-tip)"`;
    const html = `${head}
        <svg id="${p}-dia" viewBox="0 0 960 760" width="960" height="760" style="position:absolute;left:60px;top:560px" data-layout-allow-overflow>
          <defs><marker id="${p}-tip" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.ink}"/></marker>
            <marker id="${p}-tip2" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M10,0 L0,5 L10,10 z" fill="${C.ink}"/></marker></defs>
          <circle class="draw ro" pathLength="1" cx="480" cy="390" r="340" stroke="${C.ink}" stroke-width="6"/>
          <circle id="${p}-you" cx="480" cy="390" r="150" fill="${col}"/>
          <text x="480" y="384" text-anchor="middle" font-size="46" fill="${C.white}">${K.center[0]}</text>
          <text x="480" y="428" text-anchor="middle" font-size="30" fill="${C.white}">${K.center[1]}</text>
          ${K.items.map(([t, x, y]) => `<path class="draw ar" pathLength="1" d="M${r(480 + (x - 480) * 0.42)},${r(390 + (y - 390) * 0.42)} L${r(480 + (x - 480) * 0.74)},${r(390 + (y - 390) * 0.74)}" stroke="${C.ink}" stroke-width="6" ${tip}/>
          <g class="it hide"><rect x="${x - 150}" y="${y - 36}" width="300" height="66" rx="33" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/><text x="${x}" y="${y + 10}" text-anchor="middle" font-size="30" fill="${C.ink}">${t}</text></g>`).join('')}
        </svg>${so}`;
    const js = [
      ...enter(s, `#${p}-stage`),
      blurIn(`#${p}-chip`, 0.2), blurIn(`#${p}-head`, at(s, 'claim:') + 0.1),
      draw(`#${p}-dia .ro`, 0.3, 0.7),
      `tl.fromTo("#${p}-dia .it", { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)", stagger: 0.12 }, ${r(cue(s, K.itemsCue) - 0.1)});`,
      draw(`#${p}-dia .ar`, cue(s, K.arrowsCue) - 0.1, 0.35, 0.1),
      ...(K.inward ? [`tl.fromTo("#${p}-you", { scale: 1, transformOrigin: "50% 50%" }, { scale: 0.86, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.inOut" }, ${r(cue(s, K.arrowsCue) + 0.3)});`] : []),
      blurIn(`#${p}-so`, voiceEnd(s) - 0.9),
      ...exitAll(s, `#${p}-content`),
    ];
    return wrap(s, html, '', js);
  }

  // Round 1, second claim: a gauge whose needle moves on the words, then the draw (1–1).
  function claim2(s) {
    const p = s.id, K = D.claim2;
    const ticks = Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * (1 - i / 8);
      return `<line x1="${r(480 + 250 * Math.cos(a))}" y1="${r(330 - 250 * Math.sin(a))}" x2="${r(480 + 290 * Math.cos(a))}" y2="${r(330 - 290 * Math.sin(a))}" stroke="${C.ink}" stroke-width="8"/>`;
    }).join('');
    const hot = K.hot === 'right' ? `<path d="M699,111 A310,310 0 0,1 790,330" fill="none" stroke="${colour(K.side)}" stroke-width="26"/>` : `<path d="M170,330 A310,310 0 0,1 261,111" fill="none" stroke="${colour(K.side)}" stroke-width="26"/>`;
    const html = `
        <div id="${p}-chip" class="chip">${K.chip}</div>
        <h1 id="${p}-head" class="disp head hide">${K.head}</h1>
        <svg id="${p}-dia" viewBox="0 0 960 400" width="960" height="400" style="position:absolute;left:60px;top:470px" data-layout-allow-overflow>
          <path d="M170,330 A310,310 0 0,1 790,330" fill="none" stroke="${C.ink}" stroke-width="10"/>
          ${hot}
          ${ticks}
          <text x="140" y="392" font-size="34" fill="${C.ink}" id="${p}-left">${K.left}</text>
          <text x="820" y="392" text-anchor="end" font-size="34" fill="${C.ink}" id="${p}-right">${K.right}</text>
          <g id="${p}-needle"><path d="M480,330 L230,330" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/><circle cx="480" cy="330" r="30" fill="${C.ink}"/></g>
        </svg>
        <p id="${p}-so" class="sowhat hide" style="top:890px"><b>So what</b>${K.so}</p>
        ${scaleSvg(p, 0, 0, SCALE_TOP + 60)}
        <div id="${p}-draw" class="chip hide" style="top:${SCALE_TOP + 640}px;left:340px">Round 1: draw</div>`;
    const bDrop = r(voiceEnd(s) + 0.3);
    const js = [
      ...enter(s, `#${p}-stage`), ...scaleInit(p, 0, 0),
      blurIn(`#${p}-chip`, 0.2), blurIn(`#${p}-head`, cue(s, K.headCue)),
      ...K.moves.map(([c, rot, d, ease]) => `tl.to("#${p}-needle", { rotation: ${rot}, svgOrigin: "480 330", duration: ${d}, ease: "${ease}" }, ${cue(s, c)});`),
      `tl.fromTo("#${p}-${K.flash[0]}", { fill: "${C.ink}" }, { fill: "${colour(K.side)}", duration: 0.1 }, ${cue(s, K.flash[1])});`,
      blurIn(`#${p}-so`, cue(s, K.flash[1]) + 0.1),
      ...scaleDrop(p, r(bDrop - 0.45), 'A', 0, 1, 0, 0.43, 'power2.out'),
      ...scaleDrop(p, bDrop, 'B', 0, 1, 1),
      pop(`#${p}-draw`, bDrop + 0.3),
      ...exitAll(s, `#${p}-content`),
    ];
    return wrap(s, html, '', js);
  }

  // Round 2 ruling: three stacked words, then the winner's stone (2–1).
  function point(s) {
    const p = s.id, K = D.point;
    const html = `
        <div id="${p}-chip" class="chip">Round 2 · Why it scores</div>
        <div style="position:absolute;left:60px;top:280px;width:960px">
          <h1 id="${p}-a" class="disp hide" style="font-size:${K.a[2]}px;color:${C.vermilion}">${K.a[0]}</h1>
          <h2 id="${p}-vs" class="disp hide" style="font-size:60px;color:${C.ink};margin:18px 0 12px">${K.vs[0]}</h2>
          <h1 id="${p}-b" class="disp hide" style="font-size:${K.b[2]}px;color:${C.cobalt}">${K.b[0]}</h1>
        </div>
        <p id="${p}-so" class="sowhat hide" style="top:${K.soTop || 770}px"><b>So what</b>${K.so}</p>
        ${scaleSvg(p, 1, 1, SCALE_TOP + 20)}`;
    const pt = at(s, 'point,');
    const js = [
      ...enter(s, `#${p}-stage`), ...scaleInit(p, 1, 1),
      blurIn(`#${p}-chip`, 0.2),
      blurIn(`#${p}-a`, cue(s, K.a[1]) - 0.1),
      blurIn(`#${p}-vs`, cue(s, K.vs[1]) - 0.05),
      blurIn(`#${p}-b`, cue(s, K.b[1]) - 0.1),
      ...scaleDrop(p, r(pt - 0.3), 'A', 1, 2, 1),
      blurIn(`#${p}-so`, pt + 0.6),
      ...exitAll(s, `#${p}-content`),
    ];
    return wrap(s, html, '', js);
  }

  // Round 3 ruling: the tell, the winner's last stone (3–1) and the stamp.
  function verdict(s) {
    const p = s.id, K = D.verdict;
    const html = `
        <div id="${p}-chip" class="chip">${K.chip || 'Round 3 · The tell'}</div>
        <h1 id="${p}-head" class="disp head hide" style="font-size:80px">${K.head}</h1>
        <svg id="${p}-dia" class="hide" viewBox="0 0 960 330" width="960" height="330" style="position:absolute;left:60px;top:560px">${K.dia}
          <text x="440" y="130" font-size="34" fill="${C.vermilion}">${K.lines[0]}</text>
          <text x="440" y="176" font-size="34" fill="${C.ink}">${K.lines[1]}</text>
          <text x="440" y="222" font-size="34" fill="${C.cobalt}">${K.lines[2]}</text>
        </svg>
        ${scaleSvg(p, 2, 1, SCALE_TOP + 20)}
        <div id="${p}-stamp" class="disp hide" style="position:absolute;left:${K.stampLeft || 150}px;top:1430px;font-size:${K.stampSize || 96}px;color:${C.white};background:${C.cobalt};padding:18px 30px 10px;border:8px solid ${C.ink}" data-layout-allow-overlap data-layout-allow-occlusion>${D.A.name} wins</div>`;
    const wins = at(s, 'wins.');
    const js = [
      ...enter(s, `#${p}-stage`), ...scaleInit(p, 2, 1),
      blurIn(`#${p}-chip`, 0.15), blurIn(`#${p}-head`, cue(s, K.headCue) - 0.1),
      `tl.fromTo("#${p}-dia", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, ${r(cue(s, K.diaCue) - 0.1)});`,
      ...scaleDrop(p, r(wins - 0.85), 'A', 2, 3, 1),
      `tl.fromTo("#${p}-stamp", { opacity: 0, scale: 1.8, rotation: -16 }, { opacity: 1, scale: 1, rotation: -6, duration: 0.2, ease: "power4.in" }, ${r(wins - 0.15)});`,
      ...exitAll(s, `#${p}-content`),
    ];
    return wrap(s, html, '', js);
  }

  // The takeaway: one panel per philosopher rises, each drops its lesson, then its verb.
  function test(s) {
    const p = s.id, K = D.test;
    const chipCss = `position:absolute;width:420px;min-height:76px;padding:14px 18px 10px;border-radius:38px;font-family:'Archivo Black',sans-serif;font-size:30px;line-height:1.05;text-transform:uppercase;display:flex;align-items:center;justify-content:center;text-align:center;border:5px solid ${C.ink};background:${C.white};color:${C.ink}`;
    const panel = (k, P, left) => `
        <div id="${p}-bin${k}" style="position:absolute;left:${left}px;top:560px;width:450px;height:960px;background:${k === 'L' ? C.vermilion : C.cobalt};border:6px solid ${C.ink}">
          <img src="assets/img/${P.who.medal}" style="position:absolute;left:24px;top:24px;width:110px;height:110px" alt="${P.who.name}">
          <p class="disp" style="position:absolute;left:150px;right:20px;top:40px;font-size:34px;color:${k === 'L' ? C.inkV : C.white};margin:0">From ${P.who.name}</p>
          <p id="${p}-v${k}" class="disp hide" style="position:absolute;left:24px;right:24px;bottom:28px;font-size:${P.verbSize || 60}px;color:${k === 'L' ? C.white : C.lime};margin:0">${P.verb}</p>
        </div>
        ${P.items.map(([t], i) => `<div id="${p}-${k}${i}" class="hide" style="${chipCss};left:${left + 15}px;top:${740 + i * 150}px">${t}</div>`).join('')}`;
    const html = `
        <div id="${p}-chip" class="chip">Your turn</div>
        <h1 id="${p}-head" class="disp head hide" style="font-size:84px">${K.head}</h1>
        ${panel('L', K.left, 60)}
        ${panel('R', K.right, 570)}`;
    const side = (k, P) => [
      `tl.fromTo("#${p}-bin${k}", { y: 1200 }, { y: 0, duration: 0.55, ease: "expo.out" }, ${r(cue(s, P.cue) - 0.3)});`,
      ...P.items.map(([, c], i) => `tl.fromTo("#${p}-${k}${i}", { opacity: 0, y: -60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${r(cue(s, c) - 0.1)});`),
      blurIn(`#${p}-v${k}`, cue(s, P.verbCue) - 0.1),
      `tl.fromTo("#${p}-v${k}", { scale: 1.3, transformOrigin: "0% 100%" }, { scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, ${r(cue(s, P.verbCue) - 0.1)});`,
    ];
    const js = [
      `gsap.set(["#${p}-binL", "#${p}-binR"], { y: 1200 });`,
      ...enter(s, `#${p}-stage`),
      blurIn(`#${p}-chip`, 0.1), blurIn(`#${p}-head`, 0.2),
      ...side('L', K.left), ...side('R', K.right),
      ...exitAll(s, `#${p}-content`),
    ];
    return wrap(s, html, '', js);
  }

  function bridge(s) {
    const p = s.id;
    const html = `${questionHtml(p)}
        ${scaleSvg(p, 0, 0, SCALE_TOP)}`;
    const js = [
      ...scaleInit(p, 0, 0),
      `tl.fromTo("#${p}-q h1", { opacity: 0, filter: "blur(10px)", y: 30 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.35, ease: "expo.out", stagger: 0.14 }, 0.05);`,
      `tl.fromTo("#${p}-scale", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, 0.4);`,
    ];
    return wrap(s, html, '', js);
  }

  const builders = { hook, A: speaker, B: speaker, claim1, claim2, point, verdict, test, bridge };
  await mkdir(new URL('compositions/', root), { recursive: true });
  for (const s of SCENES) await writeFile(new URL(`compositions/${s.id}.html`, root), builders[s.kind](s));

  // ---------- root: scene hosts, voice and effects ----------
  const SFX = [];
  const sfx = (file, t, vol, ms = 0, len = 0) => SFX.push({ file, t: r(t), vol, ms, len });
  const S = Object.fromEntries(SCENES.map((s) => [s.id, s]));
  const abs = (id, w, nth) => S[id].start + at(S[id], w, nth);
  const whoosh = ['whoosh-short', 'whoosh'];
  let wi = 0;
  for (const s of SCENES) if (s.prevGround !== ground(s.kind)) sfx(whoosh[wi++ % 2], s.start - 0.04, 0.3);
  const claim2Id = SCENES.find((s) => s.kind === 'claim2').id, pointId = SCENES.find((s) => s.kind === 'point').id, verdictId = SCENES.find((s) => s.kind === 'verdict').id;
  sfx('impact-bass-1', S[claim2Id].start + voiceEnd(S[claim2Id]) + 0.05, 0.4);
  sfx('impact-bass-2', S[claim2Id].start + voiceEnd(S[claim2Id]) + 0.5, 0.4);
  sfx('impact-bass-1', abs(pointId, 'point,') + 0.1, 0.5);
  sfx('impact-bass-1', abs(verdictId, 'wins.') - 0.45, 0.45);
  sfx('riser', abs(verdictId, 'wins.') - 2.6, 0.3, 7.43, 2.6);
  sfx('impact-bass-2', abs(verdictId, 'wins.') + 0.05, 0.6);
  D.sfx({ sfx, abs, S });

  const hosts = SCENES.map((s) => `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`).join('\n');
  const vo = SCENES.map((s) => `      <audio id="vo-${s.vo}" class="clip" src="assets/vo/${s.vo}.mp3" data-start="${r(s.start + s.off)}" data-duration="${probe(`assets/vo/${s.vo}.mp3`)}" data-track-index="2" data-volume="1"></audio>`).join('\n');
  const fx = SFX.map((x, i) => `      <audio id="fx-${String(i + 1).padStart(2, '0')}" class="clip" src="assets/sfx/${x.file}.mp3" data-start="${x.t}" data-duration="${x.len || probe(`assets/sfx/${x.file}.mp3`)}"${x.ms ? ` data-media-start="${x.ms}"` : ''} data-track-index="${3 + (i % 4)}" data-volume="${x.vol}"></audio>`).join('\n');

  await writeFile(new URL('index.html', root), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.lime}; }
      #root { width: 100%; height: 100%; position: relative; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
${hosts}
${vo}
${fx}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
  console.log('built', SCENES.length, 'scenes,', SFX.length, 'effects, total', TOTAL, 's');
}
