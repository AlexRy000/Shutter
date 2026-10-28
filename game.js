/* Shutter — a first-person camera-gun puzzle.
   Photograph an orange object to take it out of the world. You hold it on your crosshair, as far away as it
   was, and print it wherever you aim.
   Free placement (no grid), real rigid-body physics via cannon.js, rendering via three.js. */
(function () {
  'use strict';

  // If something breaks, say so on screen rather than leaving dead buttons: a screenshot of this is a bug report.
  (function () {
    let count = 0;
    function report(msg, where) {
      if (count++ >= 3) return;
      try {
        let el = document.getElementById('oops');
        if (!el) {
          el = document.createElement('div');
          el.id = 'oops'; el.setAttribute('role', 'alert');
          const x = document.createElement('button');
          x.type = 'button'; x.textContent = 'Close';
          x.addEventListener('click', () => el.remove());
          el.appendChild(x);
          const h = document.createElement('strong');
          h.textContent = 'Something went wrong in Shutter. A screenshot of this message helps fix it.';
          el.appendChild(h);
          document.body.appendChild(el);
        }
        const line = document.createElement('div');
        line.textContent = String(msg).slice(0, 300) + (where ? '  (' + where + ')' : '');
        el.appendChild(line);
      } catch (e) { /* nothing more to do */ }
    }
    window.addEventListener('error', (e) => {
      const file = (e.filename || '').split('/').pop().split('?')[0];
      if (!/^(game|levels|audio)\.js$/.test(file)) return;
      report(e.message || e.error, file + ':' + e.lineno);
    });
    window.__shutterReport = report;
  })();

  const T = window.THREE, C = window.CANNON;
  const $ = (id) => document.getElementById(id);

  const canvas = $('view');
  const menu = $('menu'), menuNote = $('menuNote'), menuEyebrow = $('menuEyebrow');
  const playBtn = $('playBtn'), restartBtn = $('restartBtn'), logoBtn = $('logoBtn'), sheetEl = $('sheet'), progressText = $('progressText'), rollNav = $('rollNav');
  const nowImg = $('nowImg'), nowName = $('nowName'), nowEyebrow = $('nowEyebrow'), nowFilm = $('nowFilm');
  const hud = $('hud'), hintEl = $('hint'), hintText = $('hintText'), toastEl = $('toast');
  const aimLabel = $('aimLabel'), keysEl = $('keys'), readout = $('readout'), holdRing = $('holdRing'), holdLabel = holdRing.querySelector('span');
  const stripEl = $('strip'), filmCount = $('filmCount'), filmName = $('filmName'), filmEdge = $('filmEdge');
  const flashEl = $('flash'), reticle = $('reticle');
  const filmChip = $('filmChip'), filmIco = $('filmIco'), filmEl = $('film');
  const titleCard = $('titleCard'), tcEyebrow = $('tcEyebrow'), tcName = $('tcName'), tcFilms = $('tcFilms');
  const lvlNum = $('lvlNum'), lvlName = $('lvlName');
  const doneEl = $('done'), doneTitle = $('doneTitle'), doneSub = $('doneSub'), doneImg = $('doneImg'), doneProg = $('doneProg');

  if (!T || !C) {
    menuNote.textContent = 'The game engine did not load. Check your connection and reload the page.';
    playBtn.disabled = true;
    return;
  }

  const IS_MAC = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
  document.documentElement.classList.toggle('mac', IS_MAC);

  // ------------------------------------------------------------------ settings (saved per browser)
  const SET = { sens: 1, rot: 1, invertY: false, swipeFlip: false, fov: 74, arrows: 'move', hints: true, volume: 0.8, music: 0.4, rig: true, bob: true };
  try { Object.assign(SET, JSON.parse(localStorage.getItem('shutter.settings') || '{}')); } catch (e) { /* storage unavailable */ }
  function saveSettings() { try { localStorage.setItem('shutter.settings', JSON.stringify(SET)); } catch (e) { /* ignore */ } }

  // ------------------------------------------------------------------ constants
  const LOWFI = !!window.__SHUTTER_LOWFI;
  // (for the test bot: it drives the game itself and never needs a picture, so nothing is drawn at all)
  const NORENDER = !!window.__SHUTTER_NORENDER;
  const PR = 0.32, PH = 1.62, EYE = 1.5;
  const GRAV = 24, JUMP = 8.4, SPEED = 5.4, PAD_V = 16.5, CRATE_PAD_V = 12, REACH = 30;
  const BREAK_V = 6;  // impact speed (m/s) that smashes fragile glass
  const STEP = 1 / 120;
  const PORTAL_RES = 0.75;  // portal render scale, relative to the screen
  const DEG = Math.PI / 180;
  const pad2 = (n) => String(n).padStart(2, '0');
  const V3 = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const AX = [V3(1, 0, 0), V3(0, 1, 0), V3(0, 0, 1)];
  const UP = V3(0, 1, 0);
  const CENTER = new T.Vector2(0, 0);
  const yawQuat = (y) => new T.Quaternion().setFromAxisAngle(UP, y);

  // ------------------------------------------------------------------ renderer
  const renderer = new T.WebGLRenderer({ canvas, antialias: !LOWFI, preserveDrawingBuffer: true });
  renderer.setPixelRatio(LOWFI ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = !LOWFI;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);

  const scene = new T.Scene();
  // the void is black: far off, and at the bottom of every shaft, everything fades into it
  const BG = new T.Color(0x000000);
  scene.background = BG;
  scene.fog = new T.Fog(BG, 30, 75);

  const camera = new T.PerspectiveCamera(74, 1, 0.05, 200);
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  const hemi = new T.HemisphereLight(0xf3f6f7, 0x495157, 0.55);
  const sun = new T.DirectionalLight(0xfff1e0, 1.65);
  sun.castShadow = !LOWFI;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 100 });
  sun.shadow.camera.updateProjectionMatrix();
  const fill = new T.DirectionalLight(0xbcd6ff, 0.28);
  fill.position.set(-6, 8, -10);
  scene.add(hemi, sun, sun.target, fill);

  const dustU = { uScale: { value: 400 }, uColor: { value: new T.Color(0xfff1d8) } };
  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dustU.uScale.value = h * renderer.getPixelRatio() / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  // soft studio environment for reflections (glass, mirrors, metal, glossy emulsion)
  (function buildEnv() {
    const s = new T.Scene();
    const g = new T.SphereGeometry(40, 32, 16);
    const cols = [], pos = g.attributes.position, lo = new T.Color(0x20262a), hi = new T.Color(0xeef2f2), tmp = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const k = (pos.getY(i) / 40 + 1) / 2;
      tmp.copy(lo).lerp(hi, Math.pow(k, 1.5));
      cols.push(tmp.r, tmp.g, tmp.b);
    }
    g.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
    s.add(new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide })));
    const pm = new T.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 5; i++) {
      const p = new T.Mesh(new T.PlaneGeometry(16, 3), pm);
      const a = (i / 5) * Math.PI * 2;
      p.position.set(Math.cos(a) * 22, 26, Math.sin(a) * 22);
      p.lookAt(0, 0, 0);
      s.add(p);
    }
    const pmrem = new T.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(s, 0.03).texture;
    pmrem.dispose();
  })();

  // ------------------------------------------------------------------ procedural textures
  const TS = LOWFI ? 128 : 512;
  function cnv(s) { const c = document.createElement('canvas'); c.width = c.height = s; return c; }
  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; }
  function tex(c, srgb) {
    const t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.anisotropy = ANISO;
    if (srgb) t.encoding = T.sRGBEncoding;
    return t;
  }
  const gray = (v) => { v = clamp(v | 0, 0, 255); return `rgb(${v},${v},${v})`; };
  function speck(ctx, S, r, n, rgb, a) {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = `rgba(${rgb},${(r() * a).toFixed(3)})`;
      const z = 1 + r() * (S / 256) * 1.5;
      ctx.fillRect(r() * S, r() * S, z, z);
    }
  }
  function bevel(h, x, y, w, ht, base, steps, step) {
    for (let k = 0; k < steps; k++) {
      h.fillStyle = gray(base + ((k + 1) / steps) * (255 - base) * 0.6);
      const i = k * step;
      h.fillRect(x + i, y + i, w - 2 * i, ht - 2 * i);
    }
  }
  function rr(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }
  function paint(S, seed, fn) {
    const c = cnv(S), h = cnv(S);
    fn(c.getContext('2d'), h.getContext('2d'), S, rng(seed));
    return { c, h };
  }
  function normalTex(hc, strength) {
    const S = hc.width, src = hc.getContext('2d').getImageData(0, 0, S, S).data;
    const out = cnv(S), ctx = out.getContext('2d'), img = ctx.createImageData(S, S), d = img.data;
    const H = (x, y) => src[((((y % S) + S) % S) * S + (((x % S) + S) % S)) * 4];
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const dx = ((H(x + 1, y) - H(x - 1, y)) / 255) * strength;
        const dy = ((H(x, y + 1) - H(x, y - 1)) / 255) * strength;
        let nx = -dx, ny = dy, nz = 1;
        const l = Math.hypot(nx, ny, nz);
        nx /= l; ny /= l; nz /= l;
        const i = (y * S + x) * 4;
        d[i] = (nx * 0.5 + 0.5) * 255; d[i + 1] = (ny * 0.5 + 0.5) * 255; d[i + 2] = (nz * 0.5 + 0.5) * 255; d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return tex(out, false);
  }
  const bolts = (c, h, x, y, P, rad, col) => {
    for (const [u, v] of [[0.09, 0.09], [0.91, 0.09], [0.09, 0.91], [0.91, 0.91]]) {
      c.fillStyle = col; c.beginPath(); c.arc(x + u * P, y + v * P, rad, 0, 7); c.fill();
      h.fillStyle = gray(250); h.beginPath(); h.arc(x + u * P, y + v * P, rad, 0, 7); h.fill();
    }
  };

  // chamber wall panels: one texture spans 2×2 units
  const wallP = paint(TS, 11, (c, h, S, r) => {
    c.fillStyle = '#aab1b1'; c.fillRect(0, 0, S, S);
    h.fillStyle = gray(25); h.fillRect(0, 0, S, S);
    const P = S / 2, g = S / 128;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const x = i * P, y = j * P, t = (222 + r() * 16) | 0;
      c.fillStyle = `rgb(${t},${t + 3},${t + 3})`;
      c.fillRect(x + g, y + g, P - 2 * g, P - 2 * g);
      bevel(h, x + g, y + g, P - 2 * g, P - 2 * g, 60, 5, (S / 512) * 1.6);
      const gr = c.createLinearGradient(0, y, 0, y + P);
      gr.addColorStop(0.5, 'rgba(70,78,82,0)'); gr.addColorStop(1, 'rgba(70,78,82,0.12)');
      c.fillStyle = gr; c.fillRect(x + g, y + g, P - 2 * g, P - 2 * g);
      bolts(c, h, x, y, P, S / 170, '#98a0a1');
    }
    speck(c, S, r, S * 8, '40,46,50', 0.05);
    speck(c, S, r, S * 3, '255,255,255', 0.25);
    for (let k = 0; k < 12; k++) {
      c.fillStyle = `rgba(80,88,92,${(0.02 + r() * 0.04).toFixed(3)})`;
      c.fillRect(r() * S, r() * S * 0.5, 1 + r() * 2, S * (0.15 + r() * 0.35));
    }
  });
  // floor tiles: one texture spans 2×2 units
  const floorP = paint(TS, 23, (c, h, S, r) => {
    c.fillStyle = '#4f575b'; c.fillRect(0, 0, S, S);
    h.fillStyle = gray(40); h.fillRect(0, 0, S, S);
    const P = S / 2, g = S / 170;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const x = i * P, y = j * P, t = (128 + r() * 14) | 0;
      c.fillStyle = `rgb(${t - 4},${t + 2},${t + 5})`;
      c.fillRect(x + g, y + g, P - 2 * g, P - 2 * g);
      bevel(h, x + g, y + g, P - 2 * g, P - 2 * g, 90, 3, (S / 512) * 1.6);
      c.fillStyle = 'rgba(30,36,40,0.16)';
      h.fillStyle = gray(140);
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) {
        const dx = x + P * (0.14 + a * 0.144), dy = y + P * (0.14 + b * 0.144), rad = S / 300;
        c.beginPath(); c.arc(dx, dy, rad, 0, 7); c.fill();
        h.beginPath(); h.arc(dx, dy, rad, 0, 7); h.fill();
      }
    }
    speck(c, S, r, S * 10, '20,24,26', 0.08);
    for (let k = 0; k < 18; k++) {
      c.fillStyle = `rgba(30,34,36,${(0.03 + r() * 0.05).toFixed(3)})`;
      c.beginPath(); c.ellipse(r() * S, r() * S, S * (0.02 + r() * 0.06), S * (0.005 + r() * 0.015), r() * 3, 0, 7); c.fill();
    }
  });
  // dark brushed metal trim: 1 unit
  const trimP = paint(TS / 2, 31, (c, h, S, r) => {
    c.fillStyle = '#434b51'; c.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y++) { c.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${(r() * 0.06).toFixed(3)})`; c.fillRect(0, y, S, 1); }
    h.fillStyle = gray(60); h.fillRect(0, 0, S, S);
    bevel(h, 0, 0, S, S, 60, 4, S / 128);
    c.strokeStyle = 'rgba(20,24,27,0.85)'; c.lineWidth = S / 64; c.strokeRect(0, 0, S, S);
    bolts(c, h, 0, 0, S, S / 40, '#6b747a');
  });
  // non-photographable ("anchored") hatch
  const lockedP = paint(TS / 2, 37, (c, h, S, r) => {
    c.fillStyle = '#5d656b'; c.fillRect(0, 0, S, S);
    speck(c, S, r, S * 6, '0,0,0', 0.12);
    h.fillStyle = gray(70); h.fillRect(0, 0, S, S);
    bevel(h, 0, 0, S, S, 70, 4, S / 96);
    c.save(); c.beginPath(); c.rect(S * 0.16, S * 0.16, S * 0.68, S * 0.68); c.clip();
    c.fillStyle = '#41484e';
    for (let i = -S; i < S * 2; i += S / 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + S / 16, 0); c.lineTo(i + S / 16 - S, S); c.lineTo(i - S, S); c.fill(); }
    c.restore();
    c.strokeStyle = '#3a4045'; c.lineWidth = S / 50; c.strokeRect(S * 0.16, S * 0.16, S * 0.68, S * 0.68);
  });
  // photographable emulsion: 1 unit, film sprocket holes along two edges
  // photographable surfaces come in two inks: orange emulsion (has weight) and blue cyanotype (stays put)
  const INK = {
    orange: { a: '#f7a53b', b: '#e8851e', dark: '120,50,0', light: '255,230,180', line: 'rgba(140,62,8,0.55)', hole: '#6e3307', glow: 'rgba(255,236,200,0.22)',
      crate: '#e48a26', crateDark: '#b5631a', crateSpeck: '110,45,0', bolt: '#8a4a12', pad: '#e8861f', padDark: '#7a3a08' },
    blue: { a: '#3f8fe6', b: '#1f5fb8', dark: '6,24,70', light: '210,238,255', line: 'rgba(8,36,92,0.6)', hole: '#0b2350', glow: 'rgba(214,240,255,0.2)',
      crate: '#2f78d0', crateDark: '#174a8f', crateSpeck: '4,20,60', bolt: '#0f3570', pad: '#2f7fd6', padDark: '#0b2a5e' },
  };
  // film stocks: every special film has its own colour and icon, used on the HUD, the chamber walls and the menus
  const FILMS = {
    shutter: { key: 'shutter', name: 'Shutter 400', short: 'Shutter', color: '#cfd8dc', glow: 0xffffff,
      rule: 'Photograph a thing to take it. Print it to put it back wherever you aim.' },
    zoom: { key: 'zoom', name: 'Zoom 400', short: 'Zoom', color: '#3fd6ff', glow: 0x3fd6ff,
      rule: 'A print keeps its size in your viewfinder: push it farther away and it grows, pull it in and it shrinks.' },
    copy: { key: 'copy', name: 'Double-X 400', short: 'Double-X', color: '#b583ff', glow: 0xb583ff,
      rule: 'Photos copy things instead of taking them. The original stays put.' },
    motion: { key: 'motion', name: 'Action 800', short: 'Action', color: '#ffd23f', glow: 0xffd23f,
      rule: 'A photo of something moving keeps its speed. Print it and it flies the way you are looking.' },
    postcard: { key: 'postcard', name: 'Postcard 100', short: 'Postcard', color: '#ff62b0', glow: 0xff62b0,
      rule: 'Photograph a photo spot, print the postcard, and walk through it: it is a doorway to that spot.' },
    exposure: { key: 'exposure', name: 'Slow 25', short: 'Slow', color: '#8f8dff', glow: 0x8f8dff,
      rule: 'Hold the shutter on something moving. Everywhere it went prints as one long solid streak.' },
  };
  const FILM_ORDER = ['zoom', 'copy', 'motion', 'postcard', 'exposure'];
  const levelFilms = (d) => { const f = FILM_ORDER.filter((k) => d[k]); return f.length ? f : ['shutter']; };
  const FILM_ICON = {
    shutter: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8.5 7l1.6-2.6h3.8L15.5 7"/><circle cx="12" cy="13.5" r="3.6"/></svg>',
    zoom: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5M10.5 7.8v5.4M7.8 10.5h5.4"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="3.5" y="7.5" width="11" height="13" rx="1.5"/><path d="M8.5 4.5h10a1.5 1.5 0 0 1 1.5 1.5v11"/></svg>',
    motion: '<svg viewBox="0 0 24 24"><path d="M3 8h6M2 12h7M3 16h6"/><circle cx="15.5" cy="12" r="5.5"/><path d="M15.5 9v3l2 1.6"/></svg>',
    postcard: '<svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="1.5"/><rect x="15" y="7.5" width="4" height="4.5"/><path d="M5.5 10h6M5.5 13h6M5.5 16h4"/></svg>',
    exposure: '<svg viewBox="0 0 24 24"><path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/><path d="M15 4.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/></svg>',
  };

  function emulsionPaint(ink, seed) {
    return paint(TS / 2, seed, (c, h, S, r) => {
      const gr = c.createLinearGradient(0, 0, S, S);
      gr.addColorStop(0, ink.a); gr.addColorStop(1, ink.b);
      c.fillStyle = gr; c.fillRect(0, 0, S, S);
      speck(c, S, r, S * 14, ink.dark, 0.12);
      speck(c, S, r, S * 6, ink.light, 0.2);
      h.fillStyle = gray(70); h.fillRect(0, 0, S, S);
      bevel(h, 0, 0, S, S, 70, 4, S / 96);
      c.strokeStyle = ink.line; c.lineWidth = S / 50;
      c.strokeRect(S * 0.03, S * 0.03, S * 0.94, S * 0.94);
      const n = 6, hw = S * 0.075, hh = S * 0.05;
      for (let k = 0; k < n; k++) {
        const x = S * (0.12 + k * 0.152) - hw / 2;
        for (const y of [S * 0.1, S * 0.9 - hh]) {
          c.fillStyle = ink.hole; rr(c, x, y, hw, hh, hh * 0.3); c.fill();
          h.fillStyle = gray(15); rr(h, x, y, hw, hh, hh * 0.3); h.fill();
        }
      }
      c.fillStyle = ink.glow;
      c.fillRect(S * 0.2, S * 0.3, S * 0.6, S * 0.4);
      h.fillStyle = gray(200); h.fillRect(S * 0.2, S * 0.3, S * 0.6, S * 0.4);
    });
  }
  function cratePaint(ink, seed) {
    return paint(TS / 2, seed, (c, h, S, r) => {
      c.fillStyle = ink.crate; c.fillRect(0, 0, S, S);
      speck(c, S, r, S * 10, ink.crateSpeck, 0.14);
      h.fillStyle = gray(140); h.fillRect(0, 0, S, S);
      const f = S * 0.11;
      c.fillStyle = ink.crateDark; h.fillStyle = gray(235);
      for (const ctx of [c, h]) { ctx.fillRect(0, 0, S, f); ctx.fillRect(0, S - f, S, f); ctx.fillRect(0, 0, f, S); ctx.fillRect(S - f, 0, f, S); }
      c.strokeStyle = ink.crateDark; h.strokeStyle = gray(220);
      for (const ctx of [c, h]) { ctx.lineWidth = f * 0.8; ctx.beginPath(); ctx.moveTo(f, f); ctx.lineTo(S - f, S - f); ctx.moveTo(S - f, f); ctx.lineTo(f, S - f); ctx.stroke(); }
      bolts(c, h, 0, 0, S, S / 40, ink.bolt);
    });
  }
  const emuP = emulsionPaint(INK.orange, 47), cyanP = emulsionPaint(INK.blue, 53);
  const crateP = cratePaint(INK.orange, 59), crateCyanP = cratePaint(INK.blue, 67);
  const doorP = paint(TS / 2, 61, (c, h, S, r) => {
    c.fillStyle = '#262d32'; c.fillRect(0, 0, S, S);
    speck(c, S, r, S * 8, '0,0,0', 0.2);
    h.fillStyle = gray(80); h.fillRect(0, 0, S, S);
    for (let x = S * 0.08; x < S - S * 0.1; x += S * 0.21) {
      c.fillStyle = '#3c454c'; c.fillRect(x, S * 0.06, S * 0.11, S * 0.88);
      h.fillStyle = gray(210); h.fillRect(x, S * 0.06, S * 0.11, S * 0.88);
    }
  });
  // ceiling: one texture spans 4×4 units, with emissive light strips
  const ceilP = paint(TS, 71, (c, h, S) => {
    c.fillStyle = '#1e2428'; c.fillRect(0, 0, S, S);
    h.fillStyle = gray(60); h.fillRect(0, 0, S, S);
    const P = S / 4;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      c.fillStyle = '#272e33'; c.fillRect(i * P + 2, j * P + 2, P - 4, P - 4);
      bevel(h, i * P + 2, j * P + 2, P - 4, P - 4, 60, 2, 2);
    }
    for (let j = 0; j < 2; j++) { c.fillStyle = '#e8eeef'; c.fillRect(S * 0.1, S * (0.22 + j * 0.5), S * 0.8, S * 0.05); }
  });
  const ceilEmit = cnv(TS);
  (function () {
    const c = ceilEmit.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, TS, TS);
    for (let j = 0; j < 2; j++) { c.fillStyle = '#fff'; c.fillRect(TS * 0.1, TS * (0.22 + j * 0.5), TS * 0.8, TS * 0.05); }
  })();
  // receptor / plate target + its glow
  // exit: amber rings on the floor and a column of light that fades out as it rises
  const exitRingC = cnv(256), exitFadeC = document.createElement('canvas');
  (function () {
    const c = exitRingC.getContext('2d');
    c.clearRect(0, 0, 256, 256);
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,190,105,0.55)'); g.addColorStop(0.75, 'rgba(255,170,80,0.18)'); g.addColorStop(1, 'rgba(255,170,80,0)');
    c.fillStyle = g; c.beginPath(); c.arc(128, 128, 128, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,170,70,0.95)';
    for (const [r, w] of [[112, 7], [84, 4], [58, 4]]) { c.lineWidth = w; c.beginPath(); c.arc(128, 128, r, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = 'rgba(255,214,150,0.95)'; c.beginPath(); c.arc(128, 128, 16, 0, Math.PI * 2); c.fill();
    exitFadeC.width = 4; exitFadeC.height = 128;
    const f = exitFadeC.getContext('2d'), fg = f.createLinearGradient(0, 0, 0, 128);
    fg.addColorStop(0, 'rgba(255,255,255,0)'); fg.addColorStop(0.55, 'rgba(255,255,255,0.12)'); fg.addColorStop(1, 'rgba(255,255,255,0.42)');
    f.fillStyle = fg; f.fillRect(0, 0, 4, 128);
  })();
  const targetC = cnv(256), targetE = cnv(256);
  (function () {
    const c = targetC.getContext('2d'), e = targetE.getContext('2d');
    c.fillStyle = '#8d969b'; c.fillRect(0, 0, 256, 256);
    e.fillStyle = '#000'; e.fillRect(0, 0, 256, 256);
    c.strokeStyle = '#2a3036'; c.lineWidth = 14; c.strokeRect(7, 7, 242, 242);
    c.lineWidth = 12; c.beginPath(); c.arc(128, 128, 78, 0, 7); c.stroke();
    e.strokeStyle = '#fff'; e.lineWidth = 8; e.beginPath(); e.arc(128, 128, 78, 0, 7); e.stroke();
    c.fillStyle = '#2a3036'; c.beginPath(); c.arc(128, 128, 30, 0, 7); c.fill();
    e.fillStyle = '#fff'; e.beginPath(); e.arc(128, 128, 22, 0, 7); e.fill();
  })();
  // jump-pad top: concentric rings, since it launches straight up whichever way you face
  const padE = cnv(256);
  function padPaint(ink) {
    const c0 = cnv(256), c = c0.getContext('2d'), e = padE.getContext('2d');
    c.fillStyle = ink.pad; c.fillRect(0, 0, 256, 256);
    e.fillStyle = '#000'; e.fillRect(0, 0, 256, 256);
    c.strokeStyle = ink.padDark; c.lineWidth = 12; c.strokeRect(6, 6, 244, 244);
    for (const [ctx, col] of [[c, ink.padDark], [e, '#fff']]) {
      ctx.strokeStyle = col; ctx.lineWidth = 10;
      for (const r of [96, 70, 44]) { ctx.beginPath(); ctx.arc(128, 128, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(128, 128, 18, 0, Math.PI * 2); ctx.fill();
    }
    c.fillStyle = ink.padDark;
    for (const [x, y] of [[26, 26], [230, 26], [26, 230], [230, 230]]) { c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill(); }
    return c0;
  }
  const padC = padPaint(INK.orange), padCyanC = padPaint(INK.blue);
  // light-leak streaks
  const leakC = cnv(128);
  (function () {
    const c = leakC.getContext('2d'), r = rng(5);
    c.fillStyle = '#000'; c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 40; i++) {
      const x = r() * 128, w = 2 + r() * 10;
      const g = c.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, 'rgba(255,90,40,0)');
      g.addColorStop(0.5, `rgba(255,${(80 + r() * 90) | 0},40,${(0.3 + r() * 0.5).toFixed(2)})`);
      g.addColorStop(1, 'rgba(255,90,40,0)');
      c.fillStyle = g; c.fillRect(x, 0, w, 128);
    }
  })();

  // glass: a faint tint, a brighter rim around every pane, soft diagonal reflections and a little dust,
  // so it reads as glass from any angle instead of disappearing
  function glassPaint(seed, frosted) {
    const c0 = cnv(256), c = c0.getContext('2d'), r = rng(seed);
    c.fillStyle = frosted ? 'rgba(226,240,246,0.62)' : 'rgba(178,222,240,0.16)';
    c.fillRect(0, 0, 256, 256);
    if (frosted) {
      speck(c, 256, r, 2600, '255,255,255', 0.35);
      speck(c, 256, r, 900, '150,180,190', 0.18);
    }
    const band = (x, w, a) => {
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const k = 1 - Math.abs((i + 0.5) / steps * 2 - 1);
        c.fillStyle = `rgba(255,255,255,${(a * k).toFixed(3)})`;
        const xx = x + (i / steps) * w, ww = w / steps + 0.6;
        c.beginPath(); c.moveTo(xx, 0); c.lineTo(xx + ww, 0); c.lineTo(xx + ww - 256, 256); c.lineTo(xx - 256, 256); c.closePath(); c.fill();
      }
    };
    for (const [x, w, a] of [[150, 70, 0.16], [232, 16, 0.3], [262, 6, 0.24], [330, 40, 0.1], [395, 9, 0.18]]) band(x, w, frosted ? a * 0.6 : a);
    speck(c, 256, r, 500, '255,255,255', 0.22);
    // a brighter rim, like the thick green-white edge of real plate glass
    for (let i = 0; i < 9; i++) {
      c.strokeStyle = `rgba(225,246,255,${(0.42 - i * 0.045).toFixed(3)})`;
      c.lineWidth = 1;
      c.strokeRect(i + 0.5, i + 0.5, 255 - 2 * i, 255 - 2 * i);
    }
    if (frosted) {
      // hairline cracks say "this one breaks"
      c.strokeStyle = 'rgba(70,96,108,0.55)'; c.lineWidth = 1.2;
      for (let k = 0; k < 7; k++) {
        let x = 128 + (r() - 0.5) * 60, y = 128 + (r() - 0.5) * 60;
        c.beginPath(); c.moveTo(x, y);
        for (let j = 0; j < 5; j++) { x += (r() - 0.5) * 70; y += (r() - 0.5) * 70; c.lineTo(x, y); }
        c.stroke();
      }
    }
    return c0;
  }
  const glassC = glassPaint(91, false), frostC = glassPaint(97, true);
  // long-exposure streaks: the ink smeared along its length
  function streakPaint(ink, seed) {
    const c0 = cnv(256), c = c0.getContext('2d'), r = rng(seed);
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, ink.b); g.addColorStop(0.5, ink.a); g.addColorStop(1, ink.b);
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const y = r() * 256, hgt = 1 + r() * 5, a = 0.05 + r() * 0.22;
      c.fillStyle = `rgba(${r() < 0.6 ? ink.light : ink.dark},${a.toFixed(3)})`;
      c.fillRect(0, y, 256, hgt);
    }
    c.fillStyle = `rgba(${ink.light},0.35)`; c.fillRect(0, 118, 256, 6);
    return c0;
  }
  const streakBlueC = streakPaint(INK.blue, 101), streakOrangeC = streakPaint(INK.orange, 103);
  // photo spot: a big pink target on the floor with a camera in it and an arrow for the way you'll face
  const SPOT_RGB = '255,98,176';
  const spotC = cnv(512);
  (function () {
    const c = spotC.getContext('2d'), S = 512, m = S / 2;
    c.clearRect(0, 0, S, S);
    const g = c.createRadialGradient(m, m, 30, m, m, m);
    g.addColorStop(0, `rgba(${SPOT_RGB},0.42)`); g.addColorStop(0.8, `rgba(${SPOT_RGB},0.16)`); g.addColorStop(1, `rgba(${SPOT_RGB},0)`);
    c.fillStyle = g; c.beginPath(); c.arc(m, m, m, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,214,236,0.98)'; c.lineWidth = 16;
    c.beginPath(); c.arc(m, m, 200, 0, Math.PI * 2); c.stroke();
    // camera glyph
    c.fillStyle = 'rgba(255,236,246,0.98)';
    rr(c, m - 92, m - 46, 184, 122, 20); c.fill();
    rr(c, m - 46, m - 74, 64, 36, 8); c.fill();
    c.fillStyle = `rgba(${SPOT_RGB},1)`; c.beginPath(); c.arc(m, m + 14, 40, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,236,246,0.98)'; c.beginPath(); c.arc(m, m + 14, 19, 0, Math.PI * 2); c.fill();
    // arrow: the way you (and anything you send) will be facing when you arrive
    c.fillStyle = 'rgba(255,226,240,1)';
    c.beginPath(); c.moveTo(m, 6); c.lineTo(m - 58, 78); c.lineTo(m - 20, 78); c.lineTo(m - 20, 118); c.lineTo(m + 20, 118); c.lineTo(m + 20, 78); c.lineTo(m + 58, 78); c.closePath(); c.fill();
  })();
  // a dashed ring that turns slowly around the spot, and a solid one that pulses outward
  const spotRingC = cnv(256);
  (function () {
    const c = spotRingC.getContext('2d');
    c.clearRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(255,220,240,0.95)'; c.lineWidth = 7; c.setLineDash([22, 14]);
    c.beginPath(); c.arc(128, 128, 118, 0, Math.PI * 2); c.stroke();
  })();
  const spotPulseC = cnv(256);
  (function () {
    const c = spotPulseC.getContext('2d');
    c.clearRect(0, 0, 256, 256);
    c.strokeStyle = `rgba(${SPOT_RGB},1)`; c.lineWidth = 10;
    c.beginPath(); c.arc(128, 128, 120, 0, Math.PI * 2); c.stroke();
  })();
  // the floating badge above a spot, visible from across the chamber
  const spotBadgeC = cnv(256);
  (function () {
    const c = spotBadgeC.getContext('2d');
    c.clearRect(0, 0, 256, 256);
    const g = c.createRadialGradient(128, 112, 10, 128, 112, 128);
    g.addColorStop(0, `rgba(${SPOT_RGB},0.55)`); g.addColorStop(1, `rgba(${SPOT_RGB},0)`);
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    c.fillStyle = `rgba(${SPOT_RGB},0.96)`; rr(c, 48, 40, 160, 148, 28); c.fill();
    c.strokeStyle = 'rgba(255,236,246,1)'; c.lineWidth = 6; rr(c, 48, 40, 160, 148, 28); c.stroke();
    c.fillStyle = 'rgba(255,240,248,1)';
    rr(c, 76, 86, 104, 72, 12); c.fill();
    rr(c, 104, 70, 38, 22, 6); c.fill();
    c.fillStyle = `rgba(${SPOT_RGB},1)`; c.beginPath(); c.arc(128, 122, 23, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,240,248,1)'; c.beginPath(); c.arc(128, 122, 11, 0, Math.PI * 2); c.fill();
    c.fillStyle = `rgba(${SPOT_RGB},0.96)`;
    c.beginPath(); c.moveTo(108, 186); c.lineTo(148, 186); c.lineTo(128, 214); c.closePath(); c.fill();
  })();
  // the back of a postcard: address lines and a stamp
  const cardBackC = document.createElement('canvas');
  (function () {
    cardBackC.width = 256; cardBackC.height = 464;
    const c = cardBackC.getContext('2d');
    c.fillStyle = '#efece3'; c.fillRect(0, 0, 256, 464);
    c.strokeStyle = 'rgba(60,70,80,0.35)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(128, 40); c.lineTo(128, 424); c.stroke();
    for (let y = 250; y < 420; y += 34) { c.beginPath(); c.moveTo(142, y); c.lineTo(236, y); c.stroke(); }
    c.strokeStyle = 'rgba(40,110,200,0.8)'; c.lineWidth = 3; c.setLineDash([6, 4]);
    c.strokeRect(170, 36, 62, 74); c.setLineDash([]);
    c.fillStyle = 'rgba(40,110,200,0.85)'; c.fillRect(176, 42, 50, 62);
    c.strokeStyle = 'rgba(40,110,200,0.6)'; c.lineWidth = 3;
    c.beginPath(); c.arc(160, 120, 34, 0, Math.PI * 2); c.stroke();
    c.fillStyle = 'rgba(60,70,80,0.75)'; c.font = '600 15px "IBM Plex Mono", monospace';
    c.fillText('POSTCARD', 18, 48);
    c.font = 'italic 500 17px "IBM Plex Sans", sans-serif';
    c.fillText('Step in to', 18, 300); c.fillText('go there.', 18, 324);
  })();
  // iris door blades: dark steel with a bright worn inner edge
  const bladeC = cnv(256);
  (function () {
    const c = bladeC.getContext('2d');
    const g = c.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, '#b9c4ca'); g.addColorStop(0.025, '#7a868d'); g.addColorStop(0.07, '#353e44'); g.addColorStop(0.5, '#262d32'); g.addColorStop(1, '#1b2125');
    c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(255,255,255,0.045)'; c.lineWidth = 1;
    for (let i = -256; i < 512; i += 7) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 60, 256); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(30, 0, 2, 256);
  })();
  // yellow and black hazard stripes for anything breakable
  const hazardC = cnv(128);
  (function () {
    const c = hazardC.getContext('2d');
    c.fillStyle = '#1d2226'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#f2c230';
    for (let i = -128; i < 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 16, 0); c.lineTo(i + 16 - 128, 128); c.lineTo(i - 128, 128); c.closePath(); c.fill(); }
  })();
  // amber chevrons on the floor in front of a one-way door
  // one-way doors: amber and black hazard stripes on the housing, and a sign on each face
  const onewayHazC = cnv(256);
  (function () {
    const c = onewayHazC.getContext('2d');
    c.fillStyle = '#1b1e20'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#f2a33a';
    for (let k = -2; k < 6; k++) { c.beginPath(); c.moveTo(k * 64, 0); c.lineTo(k * 64 + 32, 0); c.lineTo(k * 64 + 32 + 256, 256); c.lineTo(k * 64 + 256, 256); c.closePath(); c.fill(); }
    const r = rng(31);
    for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(0,0,0,${(r() * 0.12).toFixed(3)})`; c.fillRect(r() * 256, r() * 256, 1 + r() * 3, 1 + r() * 2); }
  })();
  function onewayDecal(W, lo, hi, R) {
    const ppm = 96, cw = Math.max(8, Math.round(W * ppm)), chh = Math.max(8, Math.round((hi - lo) * ppm));
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = chh;
    const c = cv.getContext('2d');
    // stripes everywhere first
    c.fillStyle = '#1b1e20'; c.fillRect(0, 0, cw, chh);
    c.fillStyle = '#f2a33a';
    const P = 0.34 * ppm;
    for (let x = -chh; x < cw + chh; x += P) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + P / 2, 0); c.lineTo(x + P / 2 + chh, chh); c.lineTo(x + chh, chh); c.closePath(); c.fill(); }
    // then fade them with masks (no pixel reads, which are slow on a GPU canvas): solid right round the
    // opening and gone by about half a metre out, and gone again before any edge of the housing
    c.globalCompositeOperation = 'destination-in';
    const cx = cw / 2, cy = hi * ppm;
    const rg = c.createRadialGradient(cx, cy, (R + 0.16) * ppm, cx, cy, (R + 0.5) * ppm);
    rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.5, 'rgba(0,0,0,0.5)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = rg; c.fillRect(0, 0, cw, chh);
    const e = 0.09 * ppm;
    const hg = c.createLinearGradient(0, 0, cw, 0);
    hg.addColorStop(0, 'rgba(0,0,0,0)'); hg.addColorStop(Math.min(0.49, e / cw), 'rgba(0,0,0,1)');
    hg.addColorStop(Math.max(0.51, 1 - e / cw), 'rgba(0,0,0,1)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = hg; c.fillRect(0, 0, cw, chh);
    const vg = c.createLinearGradient(0, 0, 0, chh);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(Math.min(0.49, e / chh), 'rgba(0,0,0,1)');
    vg.addColorStop(Math.max(0.51, 1 - e / chh), 'rgba(0,0,0,1)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = vg; c.fillRect(0, 0, cw, chh);
    c.globalCompositeOperation = 'source-over';
    const t = new T.CanvasTexture(cv);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = ANISO;
    t.repeat.set(1 / W, 1 / (hi - lo));
    t.offset.set(0.5, -lo / (hi - lo));
    return t;
  }
  function onewaySign(entry) {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 128;
    const c = cv.getContext('2d');
    if (entry) {
      c.fillStyle = '#f2a33a'; c.fillRect(0, 0, 512, 128);
      c.fillStyle = '#1b1e20';
      for (let x = -40; x < 560; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 20, 0); c.lineTo(x + 6, 14); c.lineTo(x - 14, 14); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x, 114); c.lineTo(x + 20, 114); c.lineTo(x + 6, 128); c.lineTo(x - 14, 128); c.closePath(); c.fill(); }
      c.textAlign = 'center'; c.fillStyle = '#14171a';
      c.font = '900 56px "Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
      c.fillText('ONE WAY', 256, 74);
      c.font = '700 17px "IBM Plex Mono", Menlo, monospace';
      c.fillText('IT LOCKS BEHIND YOU', 256, 100);
    } else {
      c.fillStyle = '#16191b'; c.fillRect(0, 0, 512, 128);
      c.strokeStyle = '#ff3b4a'; c.lineWidth = 8; c.strokeRect(6, 6, 500, 116);
      c.beginPath(); c.arc(78, 64, 34, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(54, 40); c.lineTo(102, 88); c.stroke();
      c.textAlign = 'left'; c.fillStyle = '#ff3b4a';
      c.font = '900 54px "Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
      c.fillText('NO WAY BACK', 136, 84);
    }
    const t = new T.CanvasTexture(cv);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = ANISO;
    return t;
  }
  const onewayC = cnv(256);
  (function () {
    const c = onewayC.getContext('2d');
    c.clearRect(0, 0, 256, 256);
    c.fillStyle = 'rgba(242,163,58,0.9)';
    for (const y of [40, 110, 180]) { c.beginPath(); c.moveTo(128, y - 34); c.lineTo(212, y + 30); c.lineTo(180, y + 30); c.lineTo(128, y - 6); c.lineTo(76, y + 30); c.lineTo(44, y + 30); c.closePath(); c.fill(); }
  })();
  // a skylight: frosted glass with daylight behind it, brightest in the middle of each pane
  const skyC = cnv(128);
  (function () {
    const c = skyC.getContext('2d'), r = rng(19);
    const g = c.createRadialGradient(64, 64, 6, 64, 64, 92);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfdde4');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    speck(c, 128, r, 900, '120,140,150', 0.08);
    c.strokeStyle = 'rgba(70,82,90,0.55)'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, 125, 125);
  })();
  // teal and black stripes: glass that grows back
  const healC = cnv(128);
  (function () {
    const c = healC.getContext('2d');
    c.fillStyle = '#16222a'; c.fillRect(0, 0, 128, 128);
    c.fillStyle = '#3fe0d0';
    for (let i = -128; i < 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 16, 0); c.lineTo(i + 16 - 128, 128); c.lineTo(i - 128, 128); c.closePath(); c.fill(); }
  })();
  const leakTex = tex(leakC, true);
  leakTex.repeat.set(2.5, 1);
  const targetTex = tex(targetC, true), targetEmit = tex(targetE, true);
  const M = {
    wall: new T.MeshStandardMaterial({ map: tex(wallP.c, true), normalMap: normalTex(wallP.h, 3), roughness: 0.8, envMapIntensity: 0.45 }),
    floor: new T.MeshStandardMaterial({ map: tex(floorP.c, true), normalMap: normalTex(floorP.h, 3), roughness: 0.88, envMapIntensity: 0.35 }),
    trim: new T.MeshStandardMaterial({ map: tex(trimP.c, true), normalMap: normalTex(trimP.h, 2.5), roughness: 0.42, metalness: 0.6, envMapIntensity: 0.9 }),
    ceil: new T.MeshStandardMaterial({ map: tex(ceilP.c, true), normalMap: normalTex(ceilP.h, 2), emissiveMap: tex(ceilEmit, true), emissive: 0xffffff, emissiveIntensity: 1.25, roughness: 0.9 }),
    emu: new T.MeshStandardMaterial({ map: tex(emuP.c, true), normalMap: normalTex(emuP.h, 2.5), roughness: 0.36, envMapIntensity: 0.85, emissive: 0x3a1600, emissiveIntensity: 0.55 }),
    crate: new T.MeshStandardMaterial({ map: tex(crateP.c, true), normalMap: normalTex(crateP.h, 2.5), roughness: 0.5, envMapIntensity: 0.7, emissive: 0x2e1200, emissiveIntensity: 0.5 }),
    cyan: new T.MeshStandardMaterial({ map: tex(cyanP.c, true), normalMap: normalTex(cyanP.h, 2.5), roughness: 0.32, envMapIntensity: 0.9, emissive: 0x061a40, emissiveIntensity: 0.6 }),
    crateCyan: new T.MeshStandardMaterial({ map: tex(crateCyanP.c, true), normalMap: normalTex(crateCyanP.h, 2.5), roughness: 0.45, envMapIntensity: 0.75, emissive: 0x04122e, emissiveIntensity: 0.5 }),
    locked: new T.MeshStandardMaterial({ map: tex(lockedP.c, true), normalMap: normalTex(lockedP.h, 2.5), roughness: 0.55, metalness: 0.35, envMapIntensity: 0.7 }),
    door: new T.MeshStandardMaterial({ map: tex(doorP.c, true), normalMap: normalTex(doorP.h, 2.5), roughness: 0.5, metalness: 0.4, envMapIntensity: 0.8 }),
    glass: new T.MeshStandardMaterial({ map: tex(glassC, true), color: 0xffffff, transparent: true, roughness: 0.04, metalness: 0.25, envMapIntensity: 2.2, depthWrite: false, side: T.DoubleSide }),
    frost: new T.MeshStandardMaterial({ map: tex(frostC, true), color: 0xffffff, transparent: true, roughness: 0.35, metalness: 0.1, envMapIntensity: 1.2, depthWrite: false, side: T.DoubleSide }),
    shard: new T.MeshStandardMaterial({ color: 0xe8f7ff, transparent: true, opacity: 0.75, roughness: 0.05, metalness: 0.3, envMapIntensity: 2, side: T.DoubleSide }),
    hazard: new T.MeshStandardMaterial({ map: tex(hazardC, true), roughness: 0.55, metalness: 0.2 }),
    hazardHeal: new T.MeshStandardMaterial({ map: tex(healC, true), roughness: 0.5, metalness: 0.2, emissive: 0x0c3a36, emissiveIntensity: 0.8 }),
    blade: new T.MeshStandardMaterial({ map: tex(bladeC, true), roughness: 0.36, metalness: 0.65, envMapIntensity: 1.1, side: T.DoubleSide }),
    bladeOneway: new T.MeshStandardMaterial({ map: tex(bladeC, true), color: 0xffb54d, emissive: 0x3a2000, roughness: 0.4, metalness: 0.5, envMapIntensity: 0.9, side: T.DoubleSide }),
    onewayHousing: new T.MeshStandardMaterial({ map: tex(onewayHazC, true), roughness: 0.55, metalness: 0.25, envMapIntensity: 0.6 }),
    irisTube: new T.MeshStandardMaterial({ map: tex(trimP.c, true), color: 0x8a959c, roughness: 0.6, metalness: 0.3, envMapIntensity: 0.35, side: T.BackSide }),
    void: new T.MeshBasicMaterial({ color: 0x050607 }),
    spot: new T.MeshBasicMaterial({ map: tex(spotC, true), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }),
    spotShaft: new T.MeshBasicMaterial({ map: tex(exitFadeC, true), color: 0xff62b0, transparent: true, opacity: 1, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }),
    spotRing: new T.MeshBasicMaterial({ map: tex(spotRingC, true), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }),
    spotPulse: new T.MeshBasicMaterial({ map: tex(spotPulseC, true), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, toneMapped: false }),
    spotBadge: new T.SpriteMaterial({ map: tex(spotBadgeC, true), transparent: true, depthWrite: false, toneMapped: false }),
    cardBack: new T.MeshStandardMaterial({ map: tex(cardBackC, true), roughness: 0.8 }),
    cardEdge: new T.MeshStandardMaterial({ color: 0xefe9dc, roughness: 0.85, emissive: 0x3a1028, emissiveIntensity: 0.4 }),
    streakBlue: new T.MeshStandardMaterial({ map: tex(streakBlueC, true), roughness: 0.3, envMapIntensity: 0.9, emissive: 0x0a2a60, emissiveIntensity: 0.7, transparent: true, opacity: 0.94 }),
    streakOrange: new T.MeshStandardMaterial({ map: tex(streakOrangeC, true), roughness: 0.35, envMapIntensity: 0.8, emissive: 0x3a1600, emissiveIntensity: 0.6, transparent: true, opacity: 0.94 }),
    rail: new T.MeshStandardMaterial({ color: 0x30383e, metalness: 0.7, roughness: 0.35, emissive: 0x0a2a55, emissiveIntensity: 0.6 }),
    arcHit: new T.MeshBasicMaterial({ color: 0xffd38a, transparent: true, opacity: 0.9, depthTest: false }),
    mirror: new T.MeshStandardMaterial({ color: 0xe9eff2, metalness: 1, roughness: 0.04, envMapIntensity: 1.6 }),
    padTop: new T.MeshStandardMaterial({ map: tex(padC, true), emissiveMap: tex(padE, true), emissive: 0xffc27a, emissiveIntensity: 0.6, roughness: 0.4 }),
    padTopCyan: new T.MeshStandardMaterial({ map: tex(padCyanC, true), emissiveMap: tex(padE, true), emissive: 0x9fd6ff, emissiveIntensity: 0.6, roughness: 0.4 }),
    lens: new T.MeshStandardMaterial({ color: 0xff3b5c, emissive: 0xff2244, emissiveIntensity: 1.6, roughness: 0.2 }),
    exit: new T.MeshStandardMaterial({ color: 0x2a2116, emissive: 0xffc77a, emissiveIntensity: 2.2, roughness: 0.4 }),
    beam: new T.MeshBasicMaterial({ color: 0xff6f88, toneMapped: false }),
    beamGlow: new T.MeshBasicMaterial({ color: 0xff1f45, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }),
    spark: new T.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending }),
    ghostOk: new T.MeshBasicMaterial({ color: 0xf2a33a, transparent: true, opacity: 0.3, depthWrite: false }),
    ghostFixed: new T.MeshBasicMaterial({ color: 0x3f8fe6, transparent: true, opacity: 0.3, depthWrite: false }),
    ghostBad: new T.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.3, depthWrite: false }),
    ghostEdge: new T.LineBasicMaterial({ color: 0xd9780f, transparent: true, opacity: 0.95 }),
    glassEdge: new T.LineBasicMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.85 }),
    pipe: new T.MeshStandardMaterial({ color: 0x7d878d, metalness: 0.85, roughness: 0.32, envMapIntensity: 1.1 }),
    exitFloor: new T.MeshBasicMaterial({ map: tex(exitRingC, true), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    exitShaft: new T.MeshBasicMaterial({ map: tex(exitFadeC, true), color: 0xffb55c, transparent: true, side: T.DoubleSide, depthWrite: false }),
    leak: new T.MeshBasicMaterial({ map: leakTex, color: 0xffffff, transparent: true, opacity: 0.42, blending: T.AdditiveBlending, side: T.DoubleSide, depthWrite: false }),
    leakBase: new T.MeshStandardMaterial({ color: 0x2a1410, emissive: 0xff4a1c, emissiveIntensity: 1.6, roughness: 0.6 }),
    accentA: new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    oneway: new T.MeshBasicMaterial({ map: tex(onewayC, true), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }),
    // rings of faint light down the sides of a shaft into the void, a skylight's glass, a work lamp
    voidLight: new T.MeshBasicMaterial({ color: 0x7d95a1, side: T.DoubleSide }),
    skyPanel: new T.MeshBasicMaterial({ map: tex(skyC, true), color: 0xf4f8fa }),
    lamp: new T.MeshBasicMaterial({ color: 0xfff1d6 }),
    safe: new T.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, toneMapped: false }),
    safeLamp: new T.MeshBasicMaterial({ color: 0xff3a24, toneMapped: false }),
    accentB: new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
  };
  // The void. Fall in and you drop for FALL_TIME seconds before you're out of frame, so it goes down FALL_DEPTH
  // below the lowest floor (you hit terminal speed, FALL_VT, partway down). The sides of a shaft run on down past
  // that, ringed with faint lights every so often so you can feel yourself falling; openings in a roof lead into
  // wells WELL_H tall (solid for the first WELL_SOLID). Everything in a chamber darkens the further it is below
  // its lowest floor or above its roof, so pits and wells fade into the dark.
  const FALL_TIME = 4, FALL_VT = 40;
  const FALL_DEPTH = (() => { const t1 = FALL_VT / GRAV; return 0.5 * GRAV * t1 * t1 + FALL_VT * Math.max(0, FALL_TIME - t1); })();
  const VOID_LIGHTS = [-8, -16, -25, -35, -46], WELL_LIGHTS = [2.6, 6.2, 11, 17, 24];
  // the rings of light down a shaft: closer together near the top, then one every 11 m all the way down
  const voidLights = (bottom) => { const out = VOID_LIGHTS.slice(); for (let y = -57; y > bottom; y -= 11) out.push(y); return out; };
  const WELL_H = 28, WELL_SOLID = 9;
  const DEEP_MATS = { wall: true, floor: true, trim: true };
  const VOIDU = { voidLo: { value: -1e4 }, voidHi: { value: 1e4 } };
  function voidShade(shader) {
    shader.uniforms.voidLo = VOIDU.voidLo;
    shader.uniforms.voidHi = VOIDU.voidHi;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vVoidY;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n  vVoidY = (modelMatrix * vec4(transformed, 1.0)).y;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vVoidY;\nuniform float voidLo, voidHi;')
      .replace('#include <fog_fragment>', 'gl_FragColor.rgb *= exp(-max(0.0, voidLo - vVoidY) * 0.11 - max(0.0, vVoidY - voidHi) * 0.3);\n#include <fog_fragment>');
  }
  for (const k in M) if (M[k].isMeshStandardMaterial) M[k].onBeforeCompile = voidShade;
  // the fade for whichever chamber is being drawn
  function voidLook(st) {
    VOIDU.voidLo.value = st && st.voidLo != null ? st.voidLo : -1e4;
    VOIDU.voidHi.value = st && st.voidHi != null ? st.voidHi : 1e4;
  }
  // chambers whose puzzles lean on their ceiling (how high you can jump, or how far something can drop) keep it whole
  const FLAT_ROOFS = new Set(['crossfire', 'skylight', 'terminal-velocity', 'glass-ceiling', 'dunk', 'pull-the-rug', 'overdrive', 'plummet', 'curtain']);

  // the score for a chamber: its first special film, or the finale for the last stretch
  const musicKey = (i) => (i >= LEVELS.length - 6 ? 'finale' : levelFilms(LEVELS[i])[0]);
  // the look of a chamber's film: accent bands and a tint in the ceiling lights
  const CEIL_WHITE = new T.Color(0xffffff);
  function applyFilmLook(def) {
    const f = levelFilms(def), a = FILMS[f[0]], b = FILMS[f[1] || f[0]];
    M.accentA.color.set(a.glow);
    M.accentB.color.set(b.glow);
    M.ceil.emissive.copy(CEIL_WHITE).lerp(new T.Color(a.glow), f[0] === 'shutter' ? 0 : 0.45);
  }
  const C_EDGE = new T.Color(0xffd9a0), C_EDGE_FIXED = new T.Color(0xbfe2ff), C_LOCK = new T.Color(0x8c959c), WHITE = new T.Color(0xffffff);
  const edgeColor = (o) => (o.locked ? C_LOCK : o.fixed ? C_EDGE_FIXED : C_EDGE);
  const C_SIG_OFF = new T.Color(0x5a1020), C_SIG_ON = new T.Color(0x61e294), C_SIG_WAIT = new T.Color(0xf2a33a);

  // ------------------------------------------------------------------ geometry helpers
  // dust motes: tiny, capped in size, and faded out right in front of the lens so none of them turn into blobs
  M.dust = new T.ShaderMaterial({
    uniforms: dustU,
    vertexShader: `
      uniform float uScale;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float d = max(-mv.z, 0.001);
        gl_PointSize = clamp(0.022 * uScale / d, 1.0, 3.5);
        vA = smoothstep(0.9, 2.4, d) * (1.0 - smoothstep(12.0, 20.0, d));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        gl_FragColor = vec4(uColor, smoothstep(0.5, 0.1, r) * 0.42 * vA);
      }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  });
  const GEO = {
    ring: new T.TorusGeometry(0.29, 0.045, 10, 28),
    unit: new T.BoxGeometry(1, 1, 1),
    lens: new T.CylinderGeometry(0.22, 0.27, 0.16, 24),
    plate: new T.BoxGeometry(0.86, 0.06, 0.86),
    spark: new T.BoxGeometry(0.06, 0.06, 0.06),
    shard: (function () {
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute([-0.09, -0.06, 0, 0.1, -0.04, 0, -0.01, 0.11, 0], 3));
      g.computeVertexNormals();
      return g;
    })(),
    crate: new T.BoxGeometry(0.9, 0.9, 0.9),
    card: new T.BoxGeometry(1.1, 2, 0.1),
    cardFace: new T.PlaneGeometry(1.1, 2),
  };
  // static world box with UVs in world units so tiles line up across boxes
  function worldBoxGeo(min, max, uvs) {
    const w = max[0] - min[0], h = max[1] - min[1], d = max[2] - min[2];
    const g = new T.BoxGeometry(w, h, d);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    const cx = min[0] + w / 2, cy = min[1] + h / 2, cz = min[2] + d / 2;
    for (let i = 0; i < pos.count; i++) {
      const X = pos.getX(i) + cx, Y = pos.getY(i) + cy, Z = pos.getZ(i) + cz;
      if (Math.abs(nor.getX(i)) > 0.5) uv.setXY(i, Z * uvs, Y * uvs);
      else if (Math.abs(nor.getY(i)) > 0.5) uv.setXY(i, X * uvs, Z * uvs);
      else uv.setXY(i, X * uvs, Y * uvs);
    }
    return { g, c: [cx, cy, cz] };
  }
  const objGeoCache = new Map(), edgeGeoCache = new Map();
  function objBoxGeo(s) {
    const key = s.join(',');
    if (objGeoCache.has(key)) return objGeoCache.get(key);
    const g = new T.BoxGeometry(s[0], s[1], s[2]);
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const X = pos.getX(i) + s[0] / 2, Y = pos.getY(i) + s[1] / 2, Z = pos.getZ(i) + s[2] / 2;
      if (Math.abs(nor.getX(i)) > 0.5) uv.setXY(i, Z, Y);
      else if (Math.abs(nor.getY(i)) > 0.5) uv.setXY(i, X, Z);
      else uv.setXY(i, X, Y);
    }
    objGeoCache.set(key, g);
    return g;
  }
  function objEdgeGeo(s) {
    const key = s.join(',');
    if (!edgeGeoCache.has(key)) edgeGeoCache.set(key, new T.EdgesGeometry(new T.BoxGeometry(s[0] + 0.012, s[1] + 0.012, s[2] + 0.012)));
    return edgeGeoCache.get(key);
  }

  // ------------------------------------------------------------------ physics setup
  const matWorld = new C.Material('world'), matPlayer = new C.Material('player'), matCrate = new C.Material('crate');
  function makeWorld() {
    const w = new C.World();
    w.gravity.set(0, -GRAV, 0);
    w.broadphase = new C.NaiveBroadphase();
    w.solver.iterations = 12;
    w.allowSleep = true;
    w.defaultContactMaterial.friction = 0.3;
    w.addContactMaterial(new C.ContactMaterial(matPlayer, matWorld, { friction: 0, restitution: 0 }));
    w.addContactMaterial(new C.ContactMaterial(matPlayer, matCrate, { friction: 0, restitution: 0 }));
    w.addContactMaterial(new C.ContactMaterial(matCrate, matWorld, { friction: 0.45, restitution: 0.04 }));
    w.addContactMaterial(new C.ContactMaterial(matCrate, matCrate, { friction: 0.55, restitution: 0.02 }));
    return w;
  }
  function makePlayer() {
    const b = new C.Body({ mass: 5, material: matPlayer, fixedRotation: true, linearDamping: 0, allowSleep: false });
    b.addShape(new C.Sphere(PR), new C.Vec3(0, PR, 0));
    b.addShape(new C.Sphere(PR), new C.Vec3(0, PH / 2, 0));
    b.addShape(new C.Sphere(PR), new C.Vec3(0, PH - PR, 0));
    b.updateMassProperties();
    b.isPlayer = true;
    return b;
  }

  // ------------------------------------------------------------------ levels (levels.js)
  // Static geometry is authored on a 1-unit grid (floor top is y=1); everything orange is free.
  // Orange prints have weight (rigid bodies). Blue prints ({ fixed: true }) stay exactly where you print them.
  const ROLL_SIZE = 20;
  // chambers play in the order SHUTTER_ORDER gives (easiest first); anything it leaves out goes at the end.
  // Rolls are twenty chambers each.
  const LEVELS = (function () {
    const all = window.SHUTTER_LEVELS || [], order = window.SHUTTER_ORDER || [];
    const by = new Map(all.map((l) => [l.name, l])), out = [];
    for (const n of order) if (by.has(n)) { out.push(by.get(n)); by.delete(n); }
    for (const l of all) if (by.has(l.name)) out.push(l);
    out.forEach((l, i) => { l.roll = Math.floor(i / ROLL_SIZE) + 1; });
    return out;
  })();
  const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  LEVELS.forEach((lv) => { if (!lv.id) lv.id = slug(lv.name); });

  // ------------------------------------------------------------------ state
  let L = null, world = null, player = null;
  const P = { onGround: false, coyote: 0, jumpBuf: 0, jumpLock: 0, padCool: 0, stepCool: 0, cardCool: 0, wish: V3(), prev: V3(), bob: 0, bobAmp: 0,
    // support: the object you last stood on (null for solid ground). airCeil: how high a mid-air print may reach
    support: null, airCeil: 1 };
  const EYEPOS = V3();
  let yaw = 0, pitch = 0, acc = 0;
  const keys = Object.create(null);
  let running = false, paused = true, locked = false, fallback = false, transition = false;
  let pendingCapture = null, aim = null, aimSpot = null, time = 0, photoSeq = 0, frameCounter = 0;
  const effects = [];
  // progress is saved by chamber id, so chambers can be reordered or added without scrambling it
  const V3_ORDER = ['step', 'cut-the-floor', 'hover', 'leapfrog', 'drop', 'stack', 'spring', 'updraft', 'tripwire', 'aim', 'mirror', 'light-leak',
    'two-frames', 'stairwell', 'pocket-bridge', 'big-picture', 'double-exposure', 'contact-sheet', 'key', 'ladder', 'crossfire', 'periscope',
    'copy-shop', 'mouse-hole', 'fastball', 'breakthrough', 'window-shopping', 'wish-you-were-here', 'return-to-sender', 'postmark', 'round-trip',
    'bulb', 'time-lapse', 'express', 'double-glazing', 'heavy-exposure', 'second-exposure', 'air-mail'];
  const doneIds = new Set(), doneSet = new Set();
  try {
    const v4 = localStorage.getItem('shutter.v4.done');
    if (v4) (JSON.parse(v4) || []).forEach((id) => doneIds.add(String(id)));
    else (JSON.parse(localStorage.getItem('shutter.v3.done') || '[]') || []).forEach((i) => { if (V3_ORDER[i]) doneIds.add(V3_ORDER[i]); });
  } catch (e) { /* storage unavailable */ }
  LEVELS.forEach((lv, i) => { if (doneIds.has(lv.id)) doneSet.add(i); });
  function saveDone() {
    doneSet.forEach((i) => doneIds.add(LEVELS[i].id));
    try { localStorage.setItem('shutter.v4.done', JSON.stringify(Array.from(doneIds))); } catch (e) { /* ignore */ }
  }
  function clearDone() { doneSet.clear(); doneIds.clear(); saveDone(); }
  const nextChamber = () => { for (let i = 0; i < LEVELS.length; i++) if (!doneSet.has(i)) return i; return 0; };

  // ------------------------------------------------------------------ level building
  function makeBuilder() {
    const UVS = { wall: 0.5, floor: 0.5, trim: 1, ceil: 0.25, door: 1 };
    const cellRange = (x0, y0, z0, x1, y1, z1) => [
      [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)],
      [Math.max(x0, x1) + 1, Math.max(y0, y1) + 1, Math.max(z0, z1) + 1],
    ];
    // (extra: the walls carried down into the void and the wells over roof openings stay out of the chamber's
    // bounds, which aim the sun's shadows and frame the overview map)
    function addStatic(min, max, extra) {
      const s = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
      L.staticBody.addShape(new C.Box(new C.Vec3(s[0] / 2, s[1] / 2, s[2] / 2)), new C.Vec3(min[0] + s[0] / 2, min[1] + s[1] / 2, min[2] + s[2] / 2));
      L.statics.push({ min: V3(min[0], min[1], min[2]), max: V3(max[0], max[1], max[2]) });
      if (extra) return;
      L.bounds.expandByPoint(V3(min[0], min[1], min[2]));
      L.bounds.expandByPoint(V3(max[0], max[1], max[2]));
    }
    // purely visual geometry: no physics, and beams and photos pass straight through it
    function decor(min, max, mat, uvs = 1, shadow = false) {
      const { g, c } = worldBoxGeo(min, max, uvs);
      L.geos.push(g);
      const m = new T.Mesh(g, mat);
      m.position.set(c[0], c[1], c[2]);
      m.castShadow = shadow;
      m.receiveShadow = true;
      L.root.add(m);
      return m;
    }
    // ---------------------------------------------------------------- the void under the chambers
    // A wall that only has to be seen (and seen past): no physics of its own, and left out of the overview map.
    function voidBox(min, max, mat, uvs) {
      const { g, c } = worldBoxGeo(min, max, uvs);
      L.geos.push(g);
      const m = new T.Mesh(g, mat);
      m.position.set(c[0], c[1], c[2]);
      m.receiveShadow = true;
      m.userData.overhead = true;
      L.root.add(m);
      L.rayStatic.push(m);
      return m;
    }
    const ckey = (x, z) => x + ',' + z, unkey = (k) => k.split(',').map(Number);
    // the faint lights that ring the shafts going down and the wells going up, all drawn as one mesh
    const glints = [];
    function drawGlints() {
      if (!glints.length || NORENDER) return;
      const P = new Float32Array(glints.length * 108);
      const F = [0, 4, 6, 0, 6, 2, 1, 3, 7, 1, 7, 5, 0, 1, 5, 0, 5, 4, 2, 6, 7, 2, 7, 3, 0, 2, 3, 0, 3, 1, 4, 5, 7, 4, 7, 6];
      glints.forEach(([a, b], n) => {
        for (let i = 0; i < 36; i++) {
          const c = F[i];
          P[n * 108 + i * 3] = c & 1 ? b[0] : a[0]; P[n * 108 + i * 3 + 1] = c & 2 ? b[1] : a[1]; P[n * 108 + i * 3 + 2] = c & 4 ? b[2] : a[2];
        }
      });
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.BufferAttribute(P, 3));
      L.geos.push(g);
      const m = new T.Mesh(g, M.voidLight);
      m.userData.overhead = true;
      L.root.add(m);
    }
    // Find the open columns: cells of the chamber with nothing at all under them, however deep. Their sides go on
    // down into the dark (drawn as whatever stands beside them), solid far enough down that whatever falls stays in
    // its shaft until it's gone; faint lights ring the shafts going down, and the openings breathe a cold draught.
    function voidShafts() {
      const r = L.room;
      if (!r) return;
      const foot = new Set();
      if (r.cells) r.cells.forEach((h, k) => foot.add(k));
      else for (let x = r.xa; x <= r.xb; x++) for (let z = r.za; z <= r.zb; z++) foot.add(ckey(x, z));
      const lows = new Map();
      const lowAt = (x, z) => {
        const k = ckey(x, z);
        if (lows.has(k)) return lows.get(k);
        let lo = Infinity;
        for (const s of L.statics) if (s.min.y < 0.5 && s.min.x < x + 0.92 && s.max.x > x + 0.08 && s.min.z < z + 0.92 && s.max.z > z + 0.08) lo = Math.min(lo, s.min.y);
        lows.set(k, lo);
        return lo;
      };
      const open = new Set();
      foot.forEach((k) => { const [x, z] = unkey(k); if (lowAt(x, z) === Infinity) open.add(k); });
      if (!open.size) return;
      // what the side of a shaft is made of: whatever stands lowest in the column beside it (glass and the like
      // aren't drawn on down: you see through them anyway)
      const matAt = (x, z, top) => {
        const g = L.grounds.find((q) => Math.abs(q.min[1] - top) < 1e-3 && q.min[0] < x + 0.5 && q.max[0] > x + 0.5 && q.min[2] < z + 0.5 && q.max[2] > z + 0.5);
        return g ? g.mat : null;
      };
      // the sides of each shaft, cell edge by cell edge, then joined into runs
      const edges = [];
      open.forEach((k) => {
        const [x, z] = unkey(k);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (open.has(ckey(x + dx, z + dz))) continue;
          const lo = lowAt(x + dx, z + dz), top = Math.min(0, lo === Infinity ? 0 : lo), mat = lo === Infinity ? null : matAt(x + dx, z + dz, lo);
          if (dx) edges.push({ ax: 'z', at: dx > 0 ? x + 1 : x, from: z, to: z + 1, side: dx, top, mat });
          else edges.push({ ax: 'x', at: dz > 0 ? z + 1 : z, from: x, to: x + 1, side: dz, top, mat });
        }
      });
      const ek = (e) => `${e.ax}|${e.at}|${e.side}|${e.top}|${e.mat}`;
      edges.sort((a, b) => (ek(a) < ek(b) ? -1 : ek(a) > ek(b) ? 1 : a.from - b.from));
      const runs = [];
      for (const e of edges) {
        const m = runs[runs.length - 1];
        if (m && ek(m) === ek(e) && Math.abs(m.to - e.from) < 1e-6) m.to = e.to;
        else runs.push({ ...e });
      }
      // a box hugging one side of a shaft: d into the solid (d > 0) or out into the shaft (d < 0)
      const slab = (e, y0, y1, d, from = e.from, to = e.to) => {
        const s = e.side * Math.sign(d), lo = s > 0 ? e.at : e.at - Math.abs(d), hi = s > 0 ? e.at + Math.abs(d) : e.at;
        return e.ax === 'z' ? [[lo, y0, from], [hi, y1, to]] : [[from, y0, lo], [to, y1, hi]];
      };
      const lights = voidLights(L.abyss + 6);
      for (const e of runs) {
        // solid in short pieces near the top (so things resting by the edge don't test against long slabs),
        // longer ones further down
        const mid = Math.min(-12, e.top), deep = Math.min(-36, L.deathY - 8);
        if (e.top > mid) for (let f = e.from; f < e.to - 1e-6; f += 3) { const [a, b] = slab(e, mid, e.top, 0.2, f, Math.min(e.to, f + 3)); addStatic(a, b, true); }
        const [a, b] = slab(e, deep, mid, 0.2);
        addStatic(a, b, true);
        // and drawn on down into the dark, as whatever it was made of
        if (e.mat) {
          const [c, d] = slab(e, L.abyss, e.top, 0.45);
          voidBox(c, d, M[e.mat], UVS[e.mat] || 1);
          L.statics.push({ min: V3(c[0], c[1], c[2]), max: V3(d[0], d[1], d[2]) });
        }
        if (e.to - e.from > 0.5) for (const y of lights) if (y < e.top - 2) glints.push(slab(e, y, y + 0.06, -0.035, e.from + 0.12, e.to - 0.12));
      }
      // the openings themselves, as rectangles (for the draught you hear near them)
      const om = new Map();
      open.forEach((k) => om.set(k, 1));
      mergeCells(om, (x0, z0, x1, z1) => L.voids.push({ min: V3(x0, L.abyss, z0), max: V3(x1 + 1, 1, z1 + 1) }));
    }
    // greedy rectangles over a map of cells with equal values: fn(x0, z0, x1, z1, value), inclusive cells
    function mergeCells(map, fn) {
      let xa = Infinity, xb = -Infinity, za = Infinity, zb = -Infinity;
      map.forEach((v, k) => { const [x, z] = unkey(k); xa = Math.min(xa, x); xb = Math.max(xb, x); za = Math.min(za, z); zb = Math.max(zb, z); });
      const left = new Set(map.keys());
      for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) {
        const k0 = ckey(x, z);
        if (!left.has(k0)) continue;
        const v = map.get(k0);
        let x1 = x;
        while (left.has(ckey(x1 + 1, z)) && map.get(ckey(x1 + 1, z)) === v) x1++;
        let z1 = z;
        for (;;) {
          let ok = true;
          for (let xx = x; xx <= x1; xx++) if (!left.has(ckey(xx, z1 + 1)) || map.get(ckey(xx, z1 + 1)) !== v) { ok = false; break; }
          if (!ok) break;
          z1++;
        }
        for (let zz = z; zz <= z1; zz++) for (let xx = x; xx <= x1; xx++) left.delete(ckey(xx, zz));
        fn(x, z, x1, z1, v);
      }
    }

    // ---------------------------------------------------------------- roofs
    // Every chamber gets a roof of its own: flat, holed through to the dark above, lit by skylights, opened into an
    // atrium with girders across, raised into a tall bay, or slatted. Openings only go where nothing in the
    // chamber comes near the ceiling, a cell clear of the walls, and each opens into a walled well of its own
    // (solid partway up, then capped), so nothing that gets up there can get over a wall.
    const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
    function roofStyle() {
      const d = L.def;
      if (d.roof) return d.roof;
      if (FLAT_ROOFS.has(d.id)) return 'flat';
      const r = (hashStr(d.id + '/roof') % 1000) / 1000;
      return r < 0.18 ? 'flat' : r < 0.38 ? 'holes' : r < 0.56 ? 'skylights' : r < 0.72 ? 'atrium' : r < 0.87 ? 'raised' : 'slats';
    }
    // cells where the roof may open: well inside the top part of the room, with nothing within reach of the ceiling
    function roofCells(R) {
      const top = R.hmax + 1, box = [];
      const add = (a, b) => box.push([a.x, a.y, a.z, b.x, b.y, b.z]);
      for (const s of L.statics) add(s.min, s.max);
      for (const p of L.panes) add(p.min, p.max);
      for (const d of L.doors) add(d.min, d.max);
      for (const o of L.objs) {
        const b = unionBounds(objObbs(o));
        add(b.min, b.max);
        if (o.track) { const A = o.track.A, Bq = o.track.B; add(V3(Math.min(A.x, Bq.x) - 1, Math.min(A.y, Bq.y) - 1, Math.min(A.z, Bq.z) - 1), V3(Math.max(A.x, Bq.x) + 1, Math.max(A.y, Bq.y) + 1, Math.max(A.z, Bq.z) + 1)); }
      }
      for (const s of L.safes) add(s.min, s.max);
      for (const s of L.leaks) add(s.min, s.max);
      for (const c of L.chutes) box.push([c.cx - 0.8, c.y0, c.cz - 0.8, c.cx + 0.8, c.y1 + 0.6, c.cz + 0.8]);
      for (const s of L.spots) box.push([s.x - 0.8, s.y, s.z - 0.8, s.x + 0.8, s.y + 3.2, s.z + 0.8]);
      for (const e of L.exits) box.push([e.x - 0.3, e.y, e.z - 0.3, e.x + 1.3, e.y + 2.8, e.z + 1.3]);
      const ok = new Set();
      R.room.forEach((k) => {
        const [x, z] = unkey(k);
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { const n = ckey(x + dx, z + dz); if (!R.room.has(n) || R.cells.get(n) !== R.hmax) return; }
        const a = [x - 0.4, top - 2.6, z - 0.4], b = [x + 1.4, top + 16, z + 1.4];
        for (const q of box) if (q[0] < b[0] && q[3] > a[0] && q[1] < b[1] && q[4] > a[1] && q[2] < b[2] && q[5] > a[2]) return;
        ok.add(k);
      });
      return ok;
    }
    // the biggest rectangle of cells in a set, [x0, z0, x1, z1] inclusive
    function biggestRect(ok) {
      if (!ok.size) return null;
      let xa = Infinity, xb = -Infinity, za = Infinity, zb = -Infinity;
      ok.forEach((k) => { const [x, z] = unkey(k); xa = Math.min(xa, x); xb = Math.max(xb, x); za = Math.min(za, z); zb = Math.max(zb, z); });
      const W = xb - xa + 1, hist = new Array(W + 1).fill(0);
      let best = null, bestA = 0;
      for (let z = za; z <= zb; z++) {
        for (let i = 0; i < W; i++) hist[i] = ok.has(ckey(xa + i, z)) ? hist[i] + 1 : 0;
        const st = [];
        for (let i = 0; i <= W; i++) {
          const hh = i < W ? hist[i] : 0;
          while (st.length && hist[st[st.length - 1]] >= hh) {
            const hgt = hist[st.pop()], left = st.length ? st[st.length - 1] + 1 : 0, area = hgt * (i - left);
            // (a squarer one wins a near tie: it reads better overhead)
            if (hgt && area > bestA) { bestA = area; best = [xa + left, z - hgt + 1, xa + i - 1, z]; }
          }
          st.push(i);
        }
      }
      return best;
    }
    // up to n rectangles of the sizes pick() gives, with a cell of roof between any two
    function placeRects(ok, n, pick, rnd) {
      const out = [], taken = new Set();
      for (let t = 0; t < n; t++) {
        const [w, d] = pick(), cands = [];
        ok.forEach((k) => {
          const [x, z] = unkey(k);
          for (const [W, D] of w === d ? [[w, d]] : [[w, d], [d, w]]) {
            let fits = true;
            for (let i = -1; i <= W && fits; i++) for (let j = -1; j <= D && fits; j++) {
              const kk = ckey(x + i, z + j);
              if (taken.has(kk) || (i >= 0 && i < W && j >= 0 && j < D && !ok.has(kk))) fits = false;
            }
            if (fits) cands.push([x, z, x + W - 1, z + D - 1]);
          }
        });
        if (!cands.length) continue;
        const r = cands[Math.floor(rnd() * cands.length)];
        out.push(r);
        for (let x = r[0]; x <= r[2]; x++) for (let z = r[1]; z <= r[3]; z++) taken.add(ckey(x, z));
      }
      return out;
    }
    function buildRoof(R, n) {
      const rnd = rng(hashStr(L.def.id + '/roof/' + n)), feats = [];
      let style = roofStyle();
      if (style !== 'flat' && R.hmax >= 5) {
        const ok = roofCells(R);
        if (style === 'atrium' || style === 'raised' || style === 'slats') {
          const r = biggestRect(ok), w = r ? r[2] - r[0] + 1 : 0, d = r ? r[3] - r[1] + 1 : 0;
          if (r && Math.min(w, d) >= 2 && w * d >= (style === 'raised' ? 4 : 6)) feats.push({ r, kind: style });
          else style = 'holes';
        }
        if (style === 'holes') {
          const SZ = [[1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [1, 3]];
          for (const r of placeRects(ok, 1 + Math.floor(rnd() * 3), () => SZ[Math.floor(rnd() * SZ.length)], rnd)) feats.push({ r, kind: 'hole' });
        } else if (style === 'skylights') {
          const sz = rnd() < 0.5 ? [1, 2] : [2, 2];
          for (const r of placeRects(ok, 2 + Math.floor(rnd() * 3), () => sz, rnd)) feats.push({ r, kind: 'sky' });
        }
      }
      const inFeat = (x, z) => feats.some((f) => x >= f.r[0] && x <= f.r[2] && z >= f.r[1] && z <= f.r[3]);
      const ceil = new Map();
      R.cells.forEach((h, k) => { const [x, z] = unkey(k); if (!inFeat(x, z)) ceil.set(k, h); });
      mergeCells(ceil, (x0, z0, x1, z1, h) => B.box([x0, h + 1, z0], [x1 + 1, h + 1.4, z1 + 1], 'ceil', { shadow: false }));
      for (const f of feats) buildOpening(f, R.hmax + 1, rnd);
      L.roofKinds.push(...feats.map((f) => f.kind));
      L.roofFeats.push(...feats);
    }
    // a solid roof box that leaves the chamber's bounds alone and the overview map out
    const roofBox = (a, b, mat) => B.box(a, b, mat, { shadow: false, overhead: true, extra: true });
    function buildOpening(f, yb, rnd) {
      const [x0, z0, x1, z1] = f.r, X1 = x1 + 1, Z1 = z1 + 1, yt = yb + 0.4, t = 0.4;
      const around = (y0, y1) => [
        [[x0 - t, y0, z0 - t], [x0, y1, Z1 + t]], [[X1, y0, z0 - t], [X1 + t, y1, Z1 + t]],
        [[x0, y0, z0 - t], [X1, y1, z0]], [[x0, y0, Z1], [X1, y1, Z1 + t]],
      ];
      const mark = (m) => { m.userData.overhead = true; return m; };
      // a steel lip round the edge of the opening
      const w = 0.06;
      for (const [a, b] of [
        [[x0 - w, yb - 0.08, z0 - w], [X1 + w, yb + 0.02, z0 + w]], [[x0 - w, yb - 0.08, Z1 - w], [X1 + w, yb + 0.02, Z1 + w]],
        [[x0 - w, yb - 0.08, z0 + w], [x0 + w, yb + 0.02, Z1 - w]], [[X1 - w, yb - 0.08, z0 + w], [X1 + w, yb + 0.02, Z1 - w]],
      ]) mark(decor(a, b, M.trim));
      if (f.kind === 'raised') {
        // a tall bay: walls up to a second, higher ceiling with its own lights and cornice
        const top = yb + 3 + Math.floor(rnd() * 3);
        L.voidHi = Math.max(L.voidHi, top + 0.7);
        for (const [a, b] of around(yt, top + 0.4)) roofBox(a, b, 'wall');
        roofBox([x0, top, z0], [X1, top + 0.4, Z1], 'ceil');
        for (const [a, b] of [
          [[x0, top - 0.16, z0], [X1, top, z0 + 0.07]], [[x0, top - 0.16, Z1 - 0.07], [X1, top, Z1]],
          [[x0, top - 0.16, z0 + 0.07], [x0 + 0.07, top, Z1 - 0.07]], [[X1 - 0.07, top - 0.16, z0 + 0.07], [X1, top, Z1 - 0.07]],
        ]) mark(decor(a, b, M.trim));
        return;
      }
      if (f.kind === 'sky') {
        // a short shaft up to a glowing panel of frosted glass
        const top = yb + 2.2 + rnd() * 1.6;
        L.voidHi = Math.max(L.voidHi, top + 0.5);
        for (const [a, b] of around(yt, top + 0.2)) roofBox(a, b, 'wall');
        addStatic([x0, top, z0], [X1, top + 0.2, Z1], true);
        mark(decor([x0, top, z0], [X1, top + 0.2, Z1], M.skyPanel, 0.5));
        for (let x = x0 + 1; x < X1 - 0.5; x++) mark(decor([x - 0.04, top - 0.06, z0], [x + 0.04, top, Z1], M.trim));
        for (let z = z0 + 1; z < Z1 - 0.5; z++) mark(decor([x0, top - 0.06, z - 0.04], [X1, top, z + 0.04], M.trim));
        return;
      }
      // a well up into the dark: drawn a long way up, solid partway, then capped (unseen). Nothing can be
      // printed above the cap either.
      for (const [a, b] of around(yt, yt + WELL_H)) {
        voidBox(a, b, M.wall, UVS.wall);
        addStatic(a, [b[0], yt + WELL_SOLID, b[2]], true);
        L.statics.push({ min: V3(a[0], yt + WELL_SOLID, a[2]), max: V3(b[0], b[1], b[2]) });
      }
      addStatic([x0, yt + WELL_SOLID, z0], [X1, yt + WELL_SOLID + 0.3, Z1], true);
      L.statics.push({ min: V3(x0, yt + WELL_SOLID, z0), max: V3(X1, yt + WELL_H, Z1) });
      for (const dy of WELL_LIGHTS) {
        const y = yt + dy, g = 0.035, m = 0.1;
        glints.push([[x0, y, z0 + m], [x0 + g, y + 0.06, Z1 - m]], [[X1 - g, y, z0 + m], [X1, y + 0.06, Z1 - m]],
          [[x0 + m, y, z0], [X1 - m, y + 0.06, z0 + g]], [[x0 + m, y, Z1 - g], [X1 - m, y + 0.06, Z1]]);
      }
      const alongX = X1 - x0 >= Z1 - z0;
      if (f.kind === 'slats') {
        // louvres across the opening, a hand's width apart: light and dark in strips
        if (alongX) for (let z = z0; z < Z1 - 1e-6; z++) roofBox([x0, yb, z + 0.28], [X1, yt, z + 0.72], 'trim');
        else for (let x = x0; x < X1 - 1e-6; x++) roofBox([x + 0.28, yb, z0], [x + 0.72, yt, Z1], 'trim');
      }
      if (f.kind === 'atrium') {
        // girders across it, a pair running the length above those, and work lamps hung off every other one
        const gy = yt + 1.1, n = alongX ? X1 - x0 : Z1 - z0;
        for (let i = 1, j = 0; i < n; i += 2, j++) {
          const at = (alongX ? x0 : z0) + i;
          const a = alongX ? [at - 0.11, gy, z0 - t] : [x0 - t, gy, at - 0.11], b = alongX ? [at + 0.11, gy + 0.34, Z1 + t] : [X1 + t, gy + 0.34, at + 0.11];
          mark(decor(a, b, M.trim, 1, false));
          if (j % 2 === 0) {
            const mid = alongX ? (z0 + Z1) / 2 : (x0 + X1) / 2, lx = alongX ? at : mid, lz = alongX ? mid : at;
            mark(decor([lx - 0.012, gy - 0.5, lz - 0.012], [lx + 0.012, gy, lz + 0.012], M.pipe));
            mark(decor([lx - 0.26, gy - 0.62, lz - 0.12], [lx + 0.26, gy - 0.5, lz + 0.12], M.trim));
            mark(decor([lx - 0.22, gy - 0.635, lz - 0.09], [lx + 0.22, gy - 0.62, lz + 0.09], M.lamp));
          }
        }
        const sy = yt + 2.6;
        for (const fr of [1 / 3, 2 / 3]) {
          if (alongX) { const z = z0 + (Z1 - z0) * fr; mark(decor([x0 - t, sy, z - 0.1], [X1 + t, sy + 0.3, z + 0.1], M.trim)); }
          else { const x = x0 + (X1 - x0) * fr; mark(decor([x - 0.1, sy, z0 - t], [x + 0.1, sy + 0.3, Z1 + t], M.trim)); }
        }
      }
    }

    const solidAt = (x, y, z) => L.statics.some((q) => x > q.min.x && x < q.max.x && y > q.min.y && y < q.max.y && z > q.min.z && z < q.max.z);
    // the glass slab through the middle of a 1-cell-thick range. A square footprint follows the wall it sits in.
    function thinPane(a, b, th, axis, face) {
      const s = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      let ax = axis === 'x' ? 0 : axis === 'y' ? 1 : axis === 'z' ? 2 : -1;
      if (ax < 0) {
        if (s[1] < Math.min(s[0], s[2])) ax = 1;
        else if (Math.abs(s[0] - s[2]) > 1e-6) ax = s[0] < s[2] ? 0 : 2;
        else {
          const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2, cz = (a[2] + b[2]) / 2;
          const alongX = (solidAt(a[0] - 0.5, cy, cz) ? 1 : 0) + (solidAt(b[0] + 0.5, cy, cz) ? 1 : 0);
          const alongZ = (solidAt(cx, cy, a[2] - 0.5) ? 1 : 0) + (solidAt(cx, cy, b[2] + 0.5) ? 1 : 0);
          ax = alongX >= alongZ ? 2 : 0;
        }
      }
      const mn = a.slice(), mx = b.slice();
      // 'min'/'max' put the pane flush with that face of the cell instead of through its middle
      const mid = face === 'min' ? a[ax] + th / 2 : face === 'max' ? b[ax] - th / 2 : (a[ax] + b[ax]) / 2;
      mn[ax] = mid - th / 2; mx[ax] = mid + th / 2;
      return [mn, mx];
    }
    function glassMesh(a, b, mat, noSight) {
      const w = b[0] - a[0], h = b[1] - a[1], d = b[2] - a[2];
      const g = new T.BoxGeometry(w, h, d);
      L.geos.push(g);
      const m = new T.Mesh(g, mat);
      m.position.set(a[0] + w / 2, a[1] + h / 2, a[2] + d / 2);
      m.renderOrder = 3;
      L.root.add(m);
      if (!noSight) L.glass.push(m);
      const eg = new T.EdgesGeometry(g);
      L.geos.push(eg);
      const e = new T.LineSegments(eg, M.glassEdge);
      e.position.copy(m.position);
      L.root.add(e);
      m.userData.edges = e;
      return m;
    }
    // metal bars along the edges of a box (just the long sides of a thin pane)
    function frameBox(a, b, t, paneOnly, mat = M.trim) {
      const s = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const thin = paneOnly ? s.indexOf(Math.min(...s)) : -1;
      for (let ax = 0; ax < 3; ax++) {
        if (ax === thin) continue;
        const o1 = (ax + 1) % 3, o2 = (ax + 2) % 3;
        for (const u of [0, 1]) for (const v of [0, 1]) {
          if (thin === o1 && u === 1) continue;
          if (thin === o2 && v === 1) continue;
          const mn = [0, 0, 0], mx = [0, 0, 0];
          mn[ax] = a[ax] - (ax === 1 ? 0 : t / 2); mx[ax] = b[ax] + (ax === 1 ? 0 : t / 2);
          for (const [o, w] of [[o1, u], [o2, v]]) {
            if (o === thin) { mn[o] = a[o] - t / 2 + 0.0; mx[o] = b[o] + t / 2; continue; }
            const edge = w ? b[o] : a[o];
            mn[o] = edge - t / 2; mx[o] = edge + t / 2;
          }
          decor(mn, mx, mat, 1, true);
        }
      }
    }
    const B = {
      box(min, max, mat = 'wall', opt = {}) {
        const { g, c } = worldBoxGeo(min, max, UVS[mat] || 1);
        L.geos.push(g);
        const m = new T.Mesh(g, M[mat] || M.wall);
        m.position.set(c[0], c[1], c[2]);
        m.castShadow = opt.shadow !== false;
        m.receiveShadow = true;
        if (mat === 'ceil' || opt.overhead) m.userData.overhead = true;
        L.root.add(m);
        L.rayStatic.push(m);
        addStatic(min, max, opt.extra);
        // (what stands on the bottom of the chamber: the sides of a shaft into the void are drawn on down in it)
        if (min[1] < 0.01 && DEEP_MATS[mat]) L.grounds.push({ min: min.slice(), max: max.slice(), mat });
        return m;
      },
      solid(x0, y0, z0, x1, y1, z1, mat) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        return B.box(a, b, mat);
      },
      shell(xa, xb, za, zb, h, floor = true) {
        if (floor) B.solid(xa, 0, za, xb, 0, zb, 'floor');
        B.solid(xa - 1, -4, za - 1, xa - 1, h, zb + 1);
        B.solid(xb + 1, -4, za - 1, xb + 1, h, zb + 1);
        B.solid(xa, -4, za - 1, xb, h, za - 1);
        B.solid(xa, -4, zb + 1, xb, h, zb + 1);
        // the roof goes on last, once everything in the chamber is known (see buildRoof); it spans the walls too
        const rc = new Map(), room = new Set();
        for (let x = xa - 1; x <= xb + 1; x++) for (let z = za - 1; z <= zb + 1; z++) {
          rc.set(x + ',' + z, h);
          if (x >= xa && x <= xb && z >= za && z <= zb) room.add(x + ',' + z);
        }
        L.roofs.push({ cells: rc, room, hmax: h });
        L.room = { xa, xb, za, zb, h, floor };
        // trim: cornice under the ceiling, skirting along the floor, service pipes in the corners
        // (with no floor, the corner pipes run on down into the dark with the walls)
        const x0 = xa, x1 = xb + 1, z0 = za, z1 = zb + 1, top = h + 1, bottom = floor ? 1 : -60;
        const band = (y0, y1, d, mat = M.trim) => {
          decor([x0, y0, z0], [x1, y1, z0 + d], mat);
          decor([x0, y0, z1 - d], [x1, y1, z1], mat);
          decor([x0, y0, z0 + d], [x0 + d, y1, z1 - d], mat);
          decor([x1 - d, y0, z0 + d], [x1, y1, z1 - d], mat);
        };
        band(top - 0.16, top, 0.07);
        if (floor) band(1, 1.13, 0.05);
        // a special film colours the room: glowing bands at eye level and under the cornice
        if (levelFilms(L.def)[0] !== 'shutter') {
          band(2.32, 2.4, 0.03, M.accentA);
          band(2.44, 2.47, 0.03, M.accentB);
          band(top - 0.26, top - 0.18, 0.03, M.accentB);
          if (floor) band(1.13, 1.16, 0.06, M.accentA);
        }
        const pg = new T.CylinderGeometry(0.07, 0.07, top - bottom, 12);
        L.geos.push(pg);
        for (const [px, pz] of [[x0 + 0.17, z0 + 0.17], [x1 - 0.17, z0 + 0.17], [x0 + 0.17, z1 - 0.17], [x1 - 0.17, z1 - 0.17]]) {
          const pm = new T.Mesh(pg, M.pipe);
          pm.position.set(px, (top + bottom) / 2, pz);
          pm.castShadow = true;
          L.root.add(pm);
          for (let y = Math.max(bottom, -4) + 1.4; y < top - 0.6; y += 2.4) {
            const sx = px < (x0 + x1) / 2 ? x0 : x1 - 0.06, sz = pz < (z0 + z1) / 2 ? z0 : z1 - 0.06;
            decor([Math.min(sx, px - 0.03), y, pz - 0.03], [Math.max(sx + 0.06, px + 0.03), y + 0.07, pz + 0.03], M.pipe);
            decor([px - 0.03, y, Math.min(sz, pz - 0.03)], [px + 0.03, y + 0.07, Math.max(sz + 0.06, pz + 0.03)], M.pipe);
          }
        }
      },
      // A room of any shape: a union of rectangles [x0, z0, x1, z1, h] in cells (h = ceiling height, as for shell).
      // opt.pits: rectangles left without floor. opt.floor === false: no floor at all.
      // Walls run around the outline, and where a low part meets a tall one the low part is roofed and filled above.
      plan(rects, opt = {}) {
        const key = (x, z) => x + ',' + z, cells = new Map();
        let xa = Infinity, xb = -Infinity, za = Infinity, zb = -Infinity, hmax = 0;
        for (const r of rects) {
          const x0 = Math.min(r[0], r[2]), x1 = Math.max(r[0], r[2]), z0 = Math.min(r[1], r[3]), z1 = Math.max(r[1], r[3]);
          const h = r[4] != null ? r[4] : (opt.h || 6);
          for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) cells.set(key(x, z), Math.max(cells.get(key(x, z)) || 0, h));
          xa = Math.min(xa, x0); xb = Math.max(xb, x1); za = Math.min(za, z0); zb = Math.max(zb, z1); hmax = Math.max(hmax, h);
        }
        const inPit = (x, z) => (opt.pits || []).some((p) => x >= Math.min(p[0], p[2]) && x <= Math.max(p[0], p[2]) && z >= Math.min(p[1], p[3]) && z <= Math.max(p[1], p[3]));
        // greedy rectangles over a set of cells with the same value
        const merge = (set, fn) => {
          const left = new Set(set.keys());
          for (let z = za - 1; z <= zb + 1; z++) for (let x = xa - 1; x <= xb + 1; x++) {
            const k0 = key(x, z);
            if (!left.has(k0)) continue;
            const v = set.get(k0);
            let x1 = x;
            while (left.has(key(x1 + 1, z)) && set.get(key(x1 + 1, z)) === v) x1++;
            let z1 = z;
            for (;;) {
              let ok = true;
              for (let xx = x; xx <= x1; xx++) if (!left.has(key(xx, z1 + 1)) || set.get(key(xx, z1 + 1)) !== v) { ok = false; break; }
              if (!ok) break;
              z1++;
            }
            for (let zz = z; zz <= z1; zz++) for (let xx = x; xx <= x1; xx++) left.delete(key(xx, zz));
            fn(x, z, x1, z1, v);
          }
        };
        // floor
        if (opt.floor !== false) {
          const fl = new Map();
          cells.forEach((h, k) => { const [x, z] = k.split(',').map(Number); if (!inPit(x, z)) fl.set(k, 1); });
          merge(fl, (x0, z0, x1, z1) => B.solid(x0, 0, z0, x1, 0, z1, 'floor'));
        }
        // walls: every outside cell touching the room, full height
        const walls = new Map();
        cells.forEach((h, k) => {
          const [x, z] = k.split(',').map(Number);
          for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) { const n = key(x + dx, z + dz); if (!cells.has(n)) walls.set(n, 1); }
        });
        merge(walls, (x0, z0, x1, z1) => B.solid(x0, -4, z0, x1, hmax, z1));
        // solid fill above the lower parts; the ceilings themselves, each at its own part's height, go on last
        merge(cells, (x0, z0, x1, z1, h) => {
          if (h < hmax) B.box([x0, h + 1.4, z0], [x1 + 1, hmax + 1.4, z1 + 1], 'wall', { shadow: false, overhead: true });
        });
        L.roofs.push({ cells, room: new Set(cells.keys()), hmax });
        L.room = { xa, xb, za, zb, h: hmax, floor: opt.floor !== false, cells };
        // skirting, cornice and (for special films) glowing bands, along every stretch of wall
        const special = levelFilms(L.def)[0] !== 'shutter';
        const runs = [];
        cells.forEach((h, k) => {
          const [x, z] = k.split(',').map(Number);
          const pit = opt.floor === false || inPit(x, z);
          if (!cells.has(key(x, z - 1))) runs.push({ ax: 'x', at: z, from: x, to: x + 1, side: 1, h, pit });
          if (!cells.has(key(x, z + 1))) runs.push({ ax: 'x', at: z + 1, from: x, to: x + 1, side: -1, h, pit });
          if (!cells.has(key(x - 1, z))) runs.push({ ax: 'z', at: x, from: z, to: z + 1, side: 1, h, pit });
          if (!cells.has(key(x + 1, z))) runs.push({ ax: 'z', at: x + 1, from: z, to: z + 1, side: -1, h, pit });
        });
        const rk = (a) => `${a.ax}|${a.at}|${a.side}|${a.h}|${a.pit}`;
        runs.sort((a, b) => rk(a).localeCompare(rk(b)) || a.from - b.from);
        const merged = [];
        for (const r of runs) {
          const m = merged[merged.length - 1];
          if (m && rk(m) === rk(r) && Math.abs(m.to - r.from) < 1e-6) m.to = r.to;
          else merged.push({ ...r });
        }
        for (const r of merged) {
          const strip = (y0, y1, d, mat) => {
            const a = r.side > 0 ? r.at : r.at - d, b = r.side > 0 ? r.at + d : r.at;
            if (r.ax === 'x') decor([r.from, y0, a], [r.to, y1, b], mat);
            else decor([a, y0, r.from], [b, y1, r.to], mat);
          };
          const top = r.h + 1;
          strip(top - 0.16, top, 0.07, M.trim);
          if (!r.pit) strip(1, 1.13, 0.05, M.trim);
          if (special) {
            strip(2.32, 2.4, 0.03, M.accentA);
            strip(2.44, 2.47, 0.03, M.accentB);
            strip(top - 0.26, top - 0.18, 0.03, M.accentB);
            if (!r.pit) strip(1.13, 1.16, 0.06, M.accentA);
          }
        }
      },
      glassCase(x0, y0, z0, x1, y1, z1) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1), t = 0.06;
        const panes = [
          [[a[0], a[1], a[2]], [a[0] + t, b[1], b[2]]],
          [[b[0] - t, a[1], a[2]], [b[0], b[1], b[2]]],
          [[a[0] + t, a[1], a[2]], [b[0] - t, b[1], a[2] + t]],
          [[a[0] + t, a[1], b[2] - t], [b[0] - t, b[1], b[2]]],
          [[a[0] + t, b[1] - t, a[2] + t], [b[0] - t, b[1], b[2] - t]],
        ];
        for (const [mn, mx] of panes) addStatic(mn, mx);
        glassMesh(a, b, M.glass);
        // the frame's bottom edges and a dark plinth sit just under the case floor: a scale model a few
        // centimetres tall lies on that floor, and anything standing proud of it would hide the model
        frameBox([a[0], a[1] - 0.035, a[2]], b, 0.07);
        decor([a[0] - 0.05, a[1] - 0.07, a[2] - 0.05], [b[0] + 0.05, a[1] + 0.004, b[2] + 0.05], M.trim, 1, false);
      },
      // a glass wall: one cell thick in the range given, drawn as a thin framed pane through its middle
      glass(x0, y0, z0, x1, y1, z1, opt = {}) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        const [mn, mx] = thinPane(a, b, 0.12, opt.axis, opt.face);
        addStatic(mn, mx);
        glassMesh(mn, mx, M.glass);
        if (opt.frame !== false) frameBox(mn, mx, 0.08, true);
      },
      // a blue platform gliding back and forth between two places, forever. a and b are [cellX, bottomY, cellZ].
      shuttle(a, b, opt = {}) {
        const s = opt.size || [1, 0.3, 1];
        const A = V3(a[0] + 0.5, a[1] + s[1] / 2, a[2] + 0.5), Bp = V3(b[0] + 0.5, b[1] + s[1] / 2, b[2] + 0.5);
        const len = A.distanceTo(Bp);
        const o = spawnObj({ kind: 'shuttle', pos: [A.x, A.y, A.z], yaw: 0, boxes: [{ c: [0, 0, 0], s }], fixed: !opt.orange,
          extra: { track: { A, B: Bp, len, s: opt.phase ? opt.phase * len : 0, dir: 1, speed: opt.speed || 3 } } });
        o.settles = false;
        o.body.type = C.Body.KINEMATIC;
        o.body.mass = 0;
        o.body.updateMassProperties();
        // the rail it runs along
        if (Math.abs(A.y - Bp.y) < 0.01) {
          const y = A.y - s[1] / 2;
          decor([Math.min(A.x, Bp.x) - 0.08, y - 0.06, Math.min(A.z, Bp.z) - 0.08], [Math.max(A.x, Bp.x) + 0.08, y - 0.02, Math.max(A.z, Bp.z) + 0.08], M.rail);
        } else {
          const x = A.x + s[0] / 2 + 0.01;
          decor([x, Math.min(A.y, Bp.y) - s[1] / 2, A.z - 0.08], [x + 0.05, Math.max(A.y, Bp.y) + s[1] / 2, A.z + 0.08], M.rail);
        }
        return o;
      },
      // a photo spot: photograph it on Postcard film, print the postcard, step in and you arrive here
      spot(x, y, z, yawDeg = 0) {
        const spot = { x: x + 0.5, y, z: z + 0.5, yaw: yawDeg * DEG };
        const dg = new T.CircleGeometry(0.62, 48), ringG = new T.CircleGeometry(0.78, 48), pulseG = new T.CircleGeometry(0.62, 48);
        const sg = new T.CylinderGeometry(0.46, 0.56, 2.6, 40, 1, true), rg = new T.CylinderGeometry(0.52, 0.52, 2.9, 16);
        L.geos.push(dg, ringG, pulseG, sg, rg);
        const flat = (geo, mat, lift) => { const m = new T.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(spot.x, y + lift, spot.z); m.renderOrder = 2; return m; };
        // the floor target, turned so its arrow points the way you'll face when you arrive
        const decal = flat(dg, M.spot, 0.016);
        decal.rotation.z = spot.yaw;
        const ring = flat(ringG, M.spotRing, 0.02);
        const pulseMat = M.spotPulse.clone();
        L.mats.push(pulseMat);
        const pulse = flat(pulseG, pulseMat, 0.018);
        // a tall column of pink light and a floating camera badge you can see from across the room
        const shaft = new T.Mesh(sg, M.spotShaft);
        shaft.position.set(spot.x, y + 1.3, spot.z);
        shaft.renderOrder = 2;
        const badge = new T.Sprite(M.spotBadge);
        badge.scale.set(0.78, 0.78, 1);
        badge.position.set(spot.x, y + 2.55, spot.z);
        badge.renderOrder = 5;
        const ray = new T.Mesh(rg, M.void);
        ray.visible = false;
        ray.position.set(spot.x, y + 1.45, spot.z);
        ray.userData.spot = spot;
        L.root.add(decal, ring, pulse, shaft, badge, ray);
        ray.updateMatrixWorld();
        spot.fx = { ring, pulse, pulseMat, badge, shaft, seed: Math.random() * 6 };
        spot.meshes = [decal, ring, pulse, shaft, badge];
        L.spotMeshes.push(ray);
        L.spots.push(spot);
        return spot;
      },
      // a postcard already standing in the chamber, a doorway to a photo spot made with B.spot. Its face shows a
      // placeholder until the chamber is built, then the real view. opt.locked: it can't be photographed.
      card(x, y, z, yawDeg, spot, opt = {}) {
        const dest = { x: spot.x, y: spot.y, z: spot.z, yaw: spot.yaw, spot };
        const c = document.createElement('canvas');
        c.width = 352; c.height = 640;
        const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 640);
        gr.addColorStop(0, '#3a1428'); gr.addColorStop(1, '#14080f');
        g.fillStyle = gr; g.fillRect(0, 0, 352, 640);
        const o = spawnObj({ kind: 'postcard', boxes: [{ c: [0, 0, 0], s: [1.1, 2, 0.1] }], pos: [x + 0.5, y + 1, z + 0.5], yaw: yawDeg * DEG,
          fixed: true, locked: !!opt.locked, extra: { dest, card: c, ghostly: true } });
        if (opt.locked) o.edgeMat.color.set(FILMS.postcard.glow);
        L.preCards.push(o);
        return o;
      },
      // an endless drop: whatever falls out of the bottom comes back in at the top, so it is always moving fast.
      // Aim anywhere at the tube to photograph what's inside.
      chute(x, z, y0, y1, opt = {}) {
        const cx = x + 0.5, cz = z + 0.5, t = 0.06;
        const ch = { cx, cz, y0, y1, loop: opt.loop !== false, vmax: opt.vmax || 16, recycle: opt.recycle !== false, empty: 0, crate: null, spawn: null };
        for (const [mn, mx] of [
          [[x - t, y0, z], [x, y1, z + 1]], [[x + 1, y0, z], [x + 1 + t, y1, z + 1]],
          [[x, y0, z - t], [x + 1, y1, z]], [[x, y0, z + 1], [x + 1, y1, z + 1 + t]],
        ]) addStatic(mn, mx);
        const top = ch.loop ? y1 - 0.8 : y1, bottom = ch.loop ? y0 + 0.8 : y0;
        const gm = glassMesh([x - t, bottom, z - t], [x + 1 + t, top, z + 1 + t], M.glass);
        gm.userData.chute = ch;
        L.aimProxies.push(gm);
        frameBox([x - t, y0, z - t], [x + 1 + t, y1, z + 1 + t], 0.07);
        if (ch.loop) {
          // the dispenser up top and the intake at the bottom
          B.box([x - 0.1, y1 - 0.8, z - 0.1], [x + 1.1, y1, z + 1.1], 'trim');
          decor([x - 0.11, y1 - 0.3, z - 0.11], [x + 1.11, y1 - 0.2, z + 1.11], M.hazard);
          decor([x - 0.1, y0, z - 0.1], [x + 1.1, y0 + 0.8, z + 1.1], M.trim, 1, true);
          decor([x - 0.11, y0 + 0.62, z - 0.11], [x + 1.11, y0 + 0.72, z + 1.11], M.hazard);
          decor([x + 0.12, y0 + 0.8, z + 0.12], [x + 0.88, y0 + 0.805, z + 0.88], M.void);
        }
        L.chutes.push(ch);
        if (opt.crate !== false) {
          const py = ch.loop ? y1 - 1.3 : y0 + 2;
          ch.spawn = { pos: [cx, py, cz], yaw: 0, scale: 1 };
          spawnObj({ kind: 'crate', pos: [cx, py, cz], yaw: 0, boxes: [{ c: [0, 0, 0], s: [0.9, 0.9, 0.9] }], spawn: ch.spawn, pinned: opt.pinned, extra: { chute: ch } });
        }
        return ch;
      },
      // breakable glass: anything fast that hits it smashes it. Frosted panes also stop beams and your view.
      fragile(x0, y0, z0, x1, y1, z1, opt = {}) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        const [mn, mx] = opt.slab ? [a, b] : thinPane(a, b, 0.12, opt.axis, opt.face);
        const s = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
        const body = new C.Body({ mass: 0, material: matWorld });
        body.addShape(new C.Box(new C.Vec3(s[0] / 2, s[1] / 2, s[2] / 2)));
        body.position.set(mn[0] + s[0] / 2, mn[1] + s[1] / 2, mn[2] + s[2] / 2);
        world.addBody(body);
        const frosted = opt.frosted !== false;
        const mesh = glassMesh(mn, mx, frosted ? M.frost : M.glass, true);
        const pane = { min: V3(mn[0], mn[1], mn[2]), max: V3(mx[0], mx[1], mx[2]), body, mesh, frosted, broken: false, hitBy: null, hitVel: null, hitSpin: null,
          // self-healing glass re-forms a moment after it breaks, unless every pane in its group broke together
          group: opt.group || null, heal: opt.heal || 0, healAt: 0, sealed: false, fade: 1 };
        if (pane.heal) { mesh.material = mesh.material.clone(); L.mats.push(mesh.material); }
        mesh.userData.pane = pane;
        body.addEventListener('collide', (e) => {
          const ob = e.body;
          if (pane.broken || pane.hitBy || !ob || !ob.obj || !ob.obj.dynamic) return;
          // only a throw breaks glass: a crate you're shoving into the pane just stops against it
          if (ob.obj.shovedAt != null && time - ob.obj.shovedAt < 0.4) return;
          if (Math.abs(e.contact.getImpactVelocityAlongNormal()) >= BREAK_V) { pane.hitBy = ob; pane.hitVel = ob.velocity.clone(); pane.hitSpin = ob.angularVelocity.clone(); }
        });
        L.panes.push(pane);
        if (!opt.slab) frameBox(mn, mx, 0.08, true, pane.heal ? M.hazardHeal : M.hazard);
        L.bounds.expandByPoint(pane.min); L.bounds.expandByPoint(pane.max);
      },
      block(x0, y0, z0, x1, y1, z1, opt = {}) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        const s = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        spawnObj({ kind: 'block', pos: [a[0] + s[0] / 2, a[1] + s[1] / 2, a[2] + s[2] / 2], yaw: 0, boxes: [{ c: [0, 0, 0], s }], locked: opt.locked, fixed: opt.fixed });
      },
      plank(x0, z0, x1, z1, opt = {}) {
        const top = opt.top != null ? opt.top : 1, thick = opt.thick != null ? opt.thick : 0.3;
        const a = [Math.min(x0, x1), top - thick, Math.min(z0, z1)], b = [Math.max(x0, x1) + 1, top, Math.max(z0, z1) + 1];
        const s = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        spawnObj({ kind: 'plank', pos: [a[0] + s[0] / 2, a[1] + s[1] / 2, a[2] + s[2] / 2], yaw: 0, boxes: [{ c: [0, 0, 0], s }], fixed: opt.fixed });
      },
      stairs(x, y, z, n, opt = {}) {
        const cx = x + n / 2, cy = y + n / 2, cz = z + 0.5, boxes = [];
        for (let i = 0; i < n; i++) boxes.push({ c: [x + i + 0.5 - cx, y + (i + 1) / 2 - cy, 0], s: [1, i + 1, 1] });
        spawnObj({ kind: 'stairs', pos: [cx, cy, cz], yaw: 0, boxes, fixed: opt.fixed });
      },
      // a scale model: centre position in world units, sitting at the given scale
      miniStairs(px, py, pz, n, k, opt = {}) {
        const boxes = [];
        for (let i = 0; i < n; i++) boxes.push({ c: [i + 0.5 - n / 2, (i + 1) / 2 - n / 2, 0], s: [1, i + 1, 1] });
        spawnObj({ kind: 'stairs', pos: [px, py + (n / 2) * k, pz], yaw: 0, boxes, scale: k, fixed: opt.fixed });
      },
      // scale models of a pad, a mirror or a block: centred at (px, pz), sitting on py
      miniPad(px, py, pz, k, opt = {}) {
        spawnObj({ kind: 'pad', pos: [px, py + 0.125 * k, pz], yaw: (opt.yaw || 0) * DEG, boxes: [{ c: [0, 0, 0], s: [1, 0.25, 1] }], scale: k, fixed: opt.fixed, locked: opt.locked });
      },
      miniMirror(px, py, pz, k, opt = {}) {
        const boxes = opt.fixed
          ? [{ c: [0, 0, 0], s: [1, 2, 0.16], reflect: true }]
          : [{ c: [0, -0.94, 0], s: [1, 0.12, 0.8] }, { c: [0, 0.06, 0], s: [1, 1.88, 0.16], reflect: true }];
        spawnObj({ kind: 'mirror', pos: [px, py + 1 * k, pz], yaw: (opt.yaw || 0) * DEG, fixed: opt.fixed, boxes, scale: k });
      },
      miniBlock(px, py, pz, k, opt = {}) {
        spawnObj({ kind: 'block', pos: [px, py + 0.5 * k, pz], yaw: 0, boxes: [{ c: [0, 0, 0], s: [1, 1, 1] }], scale: k, fixed: opt.fixed, locked: opt.locked });
      },
      miniPlank(px, py, pz, len, k, opt = {}) {
        spawnObj({ kind: 'plank', pos: [px, py + 0.15 * k, pz], yaw: (opt.yaw || 0) * DEG, boxes: [{ c: [0, 0, 0], s: [1, 0.3, len] }], scale: k, fixed: opt.fixed });
      },
      crate(x, y, z, opt = {}) {
        spawnObj({ kind: 'crate', pos: [x + 0.5, y + 0.45, z + 0.5], yaw: 0, boxes: [{ c: [0, 0, 0], s: [0.9, 0.9, 0.9] }], fixed: opt.fixed, pinned: opt.pinned, scale: opt.scale });
      },
      emitter(x, y, z, yawDeg, opt = {}) {
        spawnObj({ kind: 'emitter', pos: [x + 0.5, y + 0.5, z + 0.5], yaw: yawDeg * DEG, boxes: [{ c: [0, 0, 0], s: [1, 1, 1] }], locked: opt.locked, fixed: opt.fixed });
      },
      // orange mirrors get a weighted foot so they stand up by themselves; blue ones just hang
      mirror(x, y, z, yawDeg = 0, opt = {}) {
        const boxes = opt.fixed
          ? [{ c: [0, 0, 0], s: [1, 2, 0.16], reflect: true }]
          : [{ c: [0, -0.94, 0], s: [1, 0.12, 0.8] }, { c: [0, 0.06, 0], s: [1, 1.88, 0.16], reflect: true }];
        spawnObj({ kind: 'mirror', pos: [x + 0.5, y + 1, z + 0.5], yaw: yawDeg * DEG, fixed: opt.fixed, boxes });
      },
      pad(x, y, z, opt = {}) {
        // opt.scale makes a bigger (bouncier) or smaller pad, centred on the cell
        const k = opt.scale || 1;
        spawnObj({ kind: 'pad', pos: [x + 0.5, y + 0.125 * k, z + 0.5], yaw: 0, boxes: [{ c: [0, 0, 0], s: [1, 0.25, 1] }], scale: opt.scale, fixed: opt.fixed, locked: opt.locked });
      },
      leak(x0, y0, z0, x1, y1, z1) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        const w = b[0] - a[0], h = b[1] - a[1], d = b[2] - a[2];
        const g = new T.BoxGeometry(w, h, d);
        L.geos.push(g);
        const m = new T.Mesh(g, M.leak);
        m.position.set(a[0] + w / 2, a[1] + h / 2, a[2] + d / 2);
        m.renderOrder = 4;
        L.root.add(m);
        for (const y of [a[1] + 0.012, b[1] - 0.012]) {
          const sg = new T.BoxGeometry(w, 0.024, d + 0.1);
          L.geos.push(sg);
          const strip = new T.Mesh(sg, M.leakBase);
          strip.position.set(a[0] + w / 2, y, a[2] + d / 2);
          L.root.add(strip);
        }
        L.leaks.push({ min: V3(a[0], a[1], a[2]), max: V3(b[0], b[1], b[2]), mesh: m });
      },
      // (pits used to hold fixer. They're open void now, all the way down, and finish() finds them by itself)
      bath() {},
      // a red safelight: anything standing in its light won't show up on film
      safelight(x0, y0, z0, x1, y1, z1) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        const g = new T.BoxGeometry(b[0] - a[0] - 0.02, b[1] - a[1] - 0.02, b[2] - a[2] - 0.02);
        L.geos.push(g);
        const m = new T.Mesh(g, M.safe);
        m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
        m.renderOrder = 4;
        L.root.add(m);
        // the lamp itself, hanging at the top
        decor([(a[0] + b[0]) / 2 - 0.35, b[1] - 0.12, (a[2] + b[2]) / 2 - 0.2], [(a[0] + b[0]) / 2 + 0.35, b[1], (a[2] + b[2]) / 2 + 0.2], M.trim);
        decor([(a[0] + b[0]) / 2 - 0.28, b[1] - 0.16, (a[2] + b[2]) / 2 - 0.14], [(a[0] + b[0]) / 2 + 0.28, b[1] - 0.12, (a[2] + b[2]) / 2 + 0.14], M.safeLamp);
        if (!LOWFI) { const lt = new T.PointLight(0xff2a1a, 1.4, Math.max(6, b[1] - a[1] + 3), 2); lt.position.set((a[0] + b[0]) / 2, b[1] - 0.5, (a[2] + b[2]) / 2); L.root.add(lt); }
        L.safes.push({ min: V3(a[0], a[1], a[2]), max: V3(b[0], b[1], b[2]) });
      },
      // a round iris door: aperture blades swirl open inside a circular frame, like a camera shutter
      door(needs, x0, y0, z0, x1, y1, z1, opt = {}) {
        const [a, b] = cellRange(x0, y0, z0, x1, y1, z1);
        const s = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const c = [a[0] + s[0] / 2, a[1] + s[1] / 2, a[2] + s[2] / 2];
        const body = new C.Body({ mass: 0, material: matWorld });
        body.addShape(new C.Box(new C.Vec3(s[0] / 2, s[1] / 2, s[2] / 2)));
        body.position.set(c[0], c[1], c[2]);
        world.addBody(body);
        // which way does the wall run? (u = along the wall, t = through it)
        const u = solidAt(a[0] - 0.5, c[1], c[2]) || solidAt(b[0] + 0.5, c[1], c[2]) ? 0 : 2, t = 2 - u;
        const P3 = (uv, yv, tv) => { const r = [0, 0, 0]; r[u] = uv; r[1] = yv; r[t] = tv; return r; };
        const W = s[u], D = s[t], cu = c[u];
        // the circle sits low, its bottom half a metre under the floor, so the opening is wide where you walk
        const R = Math.min(W, s[1]) / 2 - 0.2, cy = a[1] + R - 0.5;
        // the corners of the doorway outside the circle are solid, in thin slices
        for (let y = a[1]; y < b[1] - 1e-6; y += 0.2) {
          const y2 = Math.min(b[1], y + 0.2), l1 = y - cy, l2 = y2 - cy;
          let w;
          if (l1 <= 0 && l2 >= 0) w = R;
          else { const m = Math.min(Math.abs(l1), Math.abs(l2)); w = m >= R ? 0 : Math.sqrt(R * R - m * m); }
          if (w <= 0) { addStatic(P3(a[u], y, a[t]), P3(b[u], y2, b[t])); continue; }
          if (cu - w > a[u] + 0.01) addStatic(P3(a[u], y, a[t]), P3(cu - w, y2, b[t]));
          if (cu + w < b[u] - 0.01) addStatic(P3(cu + w, y, a[t]), P3(b[u], y2, b[t]));
        }
        const g = new T.Group();
        const gp = P3(cu, cy, c[t]);
        g.position.set(gp[0], gp[1], gp[2]);
        if (u === 2) g.rotation.y = -Math.PI / 2;
        L.root.add(g);
        // a housing plate on each face with the round hole cut out of it
        const shape = new T.Shape();
        const lo = -R - 0.12, hi = b[1] - cy;
        shape.moveTo(-W / 2, lo); shape.lineTo(W / 2, lo); shape.lineTo(W / 2, hi); shape.lineTo(-W / 2, hi); shape.lineTo(-W / 2, lo);
        const hole = new T.Path();
        hole.absarc(0, 0, R, 0, Math.PI * 2, true);
        shape.holes.push(hole);
        const pg = new T.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false, curveSegments: 48 });
        L.geos.push(pg);
        if (opt.oneway) {
          const uv = pg.attributes.uv, ps = pg.attributes.position;
          for (let i = 0; i < ps.count; i++) uv.setXY(i, (cu + ps.getX(i)) * 0.5, (cy + ps.getY(i)) * 0.5);
          uv.needsUpdate = true;
          const dg = new T.ShapeGeometry(shape, 48);
          L.geos.push(dg);
          const dt = onewayDecal(W, lo, hi, R);
          L.texs.push(dt);
          const dm = new T.MeshStandardMaterial({ map: dt, transparent: true, depthWrite: false, roughness: 0.5, metalness: 0.15, envMapIntensity: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
          L.mats.push(dm);
          for (const side of [1, -1]) {
            const dmesh = new T.Mesh(dg, dm);
            dmesh.position.z = side > 0 ? D / 2 + 0.082 : -D / 2 - 0.082;
            if (side < 0) dmesh.rotation.y = Math.PI;
            dmesh.receiveShadow = true;
            g.add(dmesh);
          }
        }
        for (const side of [1, -1]) {
          const m = new T.Mesh(pg, opt.oneway ? M.wall : M.trim);
          m.position.z = side > 0 ? D / 2 : -D / 2 - 0.08;
          m.castShadow = m.receiveShadow = true;
          g.add(m);
          L.rayStatic.push(m);
        }
        // the round tunnel through the wall
        const tg = new T.CylinderGeometry(R, R, D + 0.16, 48, 1, true);
        L.geos.push(tg);
        const tube = new T.Mesh(tg, M.irisTube);
        tube.rotation.x = Math.PI / 2;
        tube.receiveShadow = true;
        g.add(tube);
        // seven blades in the middle of the wall; each one's straight inner edge forms one side of the aperture.
        // Opening, they swing a long way out into the wall, so each is trimmed to the doorway as it moves (see
        // setIris): they never show through glass beside or above it, and never block a view or a beam out there.
        const NB = 7, blades = [];
        const bladeBox = { w: 2.3 * R, h: 2.4 * R, x0: -W / 2, x1: W / 2, y0: a[1] - 0.7 - cy, y1: b[1] - cy };
        for (let k = 0; k < NB; k++) {
          const bg = new T.BufferGeometry(), nrm = new Float32Array(18 * 3);
          for (let i = 2; i < nrm.length; i += 3) nrm[i] = 1;
          bg.setAttribute('position', new T.BufferAttribute(new Float32Array(18 * 3), 3));
          bg.setAttribute('normal', new T.BufferAttribute(nrm, 3));
          bg.setAttribute('uv', new T.BufferAttribute(new Float32Array(18 * 2), 2));
          L.geos.push(bg);
          const m = new T.Mesh(bg, opt.oneway ? M.bladeOneway : M.blade);
          m.position.z = (k - (NB - 1) / 2) * 0.008;
          m.castShadow = true;
          g.add(m);
          blades.push(m);
        }
        // status ring around the opening on both faces: red while locked, green while powered
        const lampMat = new T.MeshStandardMaterial({ color: 0x1a1d20, emissive: C_SIG_OFF.clone(), emissiveIntensity: 2.4, roughness: 0.4 });
        L.mats.push(lampMat);
        const rg = new T.RingGeometry(R + 0.04, R + 0.12, 64);
        L.geos.push(rg);
        for (const side of [1, -1]) {
          const r = new T.Mesh(rg, lampMat);
          r.position.z = side * (D / 2 + 0.09);
          if (side < 0) r.rotation.y = Math.PI;
          g.add(r);
        }
        const door = { needs, min: V3(a[0], a[1], a[2]), max: V3(b[0], b[1], b[2]), body, open: false, p: 0, blades, bladeBox, R, lampMat, group: g, t, D };
        if (opt.oneway) {
          // a one-way door stands open until you've gone through it, then shuts and stays shut
          door.oneway = true; door.locked = false;
          const ct = c[t], st = L.start[t];
          door.side0 = Math.sign(st - ct) || 1;
          door.ct = ct;
          const arrows = new T.Mesh(new T.PlaneGeometry(W - 0.3, 1.3), M.oneway);
          L.geos.push(arrows.geometry);
          arrows.rotation.x = -Math.PI / 2;
          const ap = P3(cu, a[1] + 0.013, ct + door.side0 * (D / 2 + 0.9));
          arrows.position.set(ap[0], ap[1], ap[2]);
          // chevrons point away from the start side
          arrows.rotation.z = t === 2 ? (door.side0 > 0 ? 0 : Math.PI) : (door.side0 > 0 ? Math.PI / 2 : -Math.PI / 2);
          L.root.add(arrows);
          const local0 = u === 2 ? -door.side0 : door.side0, sw = Math.min(W - 0.3, 2.6);
          const sg = new T.PlaneGeometry(sw, sw / 4);
          L.geos.push(sg);
          for (const side of [1, -1]) {
            const st2 = onewaySign(side === local0);
            const sm = new T.MeshStandardMaterial({ map: st2, emissive: 0xffffff, emissiveMap: st2, emissiveIntensity: 0.35, roughness: 0.6 });
            L.mats.push(sm); L.texs.push(st2);
            const sign = new T.Mesh(sg, sm);
            sign.position.set(0, hi + sw / 8 + 0.18, side * (D / 2 + 0.1));
            if (side < 0) sign.rotation.y = Math.PI;
            g.add(sign);
          }
        }
        setIris(door, 0);
        L.doors.push(door);
      },
      plate(id, x, y, z) {
        const mat = new T.MeshStandardMaterial({ map: targetTex, emissiveMap: targetEmit, emissive: C_SIG_OFF.clone(), emissiveIntensity: 2, roughness: 0.5, metalness: 0.3 });
        L.mats.push(mat);
        decor([x + 0.03, y, z + 0.03], [x + 0.97, y + 0.025, z + 0.97], M.trim);
        const m = new T.Mesh(GEO.plate, mat);
        m.position.set(x + 0.5, y + 0.03, z + 0.5);
        m.receiveShadow = true;
        L.root.add(m);
        L.plates.push({ id, x, y, z, mesh: m, mat, on: false });
      },
      receptor(id, x, y, z) {
        const mat = new T.MeshStandardMaterial({ map: targetTex, emissiveMap: targetEmit, emissive: C_SIG_OFF.clone(), emissiveIntensity: 2, roughness: 0.45, metalness: 0.3 });
        L.mats.push(mat);
        const m = new T.Mesh(GEO.unit, mat);
        m.position.set(x + 0.5, y + 0.5, z + 0.5);
        m.castShadow = m.receiveShadow = true;
        L.root.add(m);
        const rec = { id, mesh: m, mat, lit: false };
        m.userData.receptor = rec;
        L.rayStatic.push(m);
        addStatic([x, y, z], [x + 1, y + 1, z + 1]);
        L.receptors.push(rec);
      },
      exit(x, y, z) {
        const g = new T.Group();
        // a dark gantry with warm light strips on its inner faces, over a column of light
        const post = new T.BoxGeometry(0.14, 2.42, 0.22), bar = new T.BoxGeometry(1.42, 0.14, 0.22);
        const strip = new T.BoxGeometry(0.035, 2.16, 0.07), stripTop = new T.BoxGeometry(1.08, 0.035, 0.07), foot = new T.BoxGeometry(0.24, 0.06, 0.34);
        L.geos.push(post, bar, strip, stripTop, foot);
        for (const sx of [-0.64, 0.64]) {
          const pm = new T.Mesh(post, M.trim); pm.position.set(sx, 1.21, 0); pm.castShadow = pm.receiveShadow = true;
          const fm = new T.Mesh(foot, M.trim); fm.position.set(sx, 0.03, 0); fm.receiveShadow = true;
          const sm = new T.Mesh(strip, M.exit); sm.position.set(sx - Math.sign(sx) * 0.07, 1.16, 0);
          g.add(pm, fm, sm);
        }
        const top = new T.Mesh(bar, M.trim); top.position.set(0, 2.42, 0); top.castShadow = true;
        const ts = new T.Mesh(stripTop, M.exit); ts.position.set(0, 2.33, 0);
        g.add(top, ts);
        const discG = new T.CircleGeometry(0.62, 48), shaftG = new T.CylinderGeometry(0.5, 0.56, 2.3, 40, 1, true);
        L.geos.push(discG, shaftG);
        const disc = new T.Mesh(discG, M.exitFloor); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.012;
        const shaft = new T.Mesh(shaftG, M.exitShaft); shaft.position.y = 1.15; shaft.renderOrder = 2;
        g.add(disc, shaft);
        if (!LOWFI) { const light = new T.PointLight(0xffc98a, 0.9, 6, 2); light.position.set(0, 1.3, 0.3); g.add(light); }
        g.position.set(x + 0.5, y, z + 0.5);
        L.root.add(g);
        L.exits.push({ x, y, z, group: g, shaft });
      },
      start(x, y, z, yawDeg = 0) { L.start = [x + 0.5, y + 0.02, z + 0.5]; L.startYaw = yawDeg * DEG; },
      // once the whole chamber is built: its roof, the void under it, and its walls carried on down into the dark
      finish() {
        // how far down things can go before they're gone: well under the lowest floor in the chamber, and under the
        // bottom of anything built down into the dark (a shaft for something to pick up speed in, say)
        let lowest = 1, deepest = -4;
        for (const s of L.statics) { lowest = Math.min(lowest, s.max.y); deepest = Math.min(deepest, s.min.y); }
        L.lostY = Math.min(-9, lowest - 6, deepest - 1);
        L.deathY = Math.min(lowest - FALL_DEPTH, deepest - 2);
        // the sides of a shaft run on far past where you drop out of frame, further than you can see from there
        L.abyss = L.deathY - 90;
        // and the dark: it closes in below the lowest floor and above the roof
        L.voidLo = lowest - 0.5;
        L.voidHi = -Infinity;
        for (const R of L.roofs) L.voidHi = Math.max(L.voidHi, R.hmax + 0.9);
        if (!isFinite(L.voidHi)) L.voidHi = 1e4;
        L.roofs.forEach((R, n) => buildRoof(R, n));
        voidShafts();
        drawGlints();
        // a safelight standing over a drop shines on down it, all the way into the dark (and anything down there
        // is in its light too). Just the sides of the column: its top would double up where it meets the lamp's.
        for (const sf of L.safes.slice()) {
          if (sf.min.y > 1.05) continue;
          for (const v of L.voids) {
            const x0 = Math.max(sf.min.x, v.min.x), x1 = Math.min(sf.max.x, v.max.x), z0 = Math.max(sf.min.z, v.min.z), z1 = Math.min(sf.max.z, v.max.z);
            if (x1 - x0 < 0.01 || z1 - z0 < 0.01) continue;
            const top = Math.min(sf.min.y, 1), g = new T.BoxGeometry(x1 - x0 - 0.02, top - L.abyss, z1 - z0 - 0.02);
            g.setIndex(Array.from(g.index.array).filter((q, i) => { const f = Math.floor(i / 6); return f !== 2 && f !== 3; }));
            g.clearGroups();
            L.geos.push(g);
            const m = new T.Mesh(g, M.safe);
            m.position.set((x0 + x1) / 2, (top + L.abyss) / 2, (z0 + z1) / 2);
            m.renderOrder = 4;
            m.userData.overhead = true;
            L.root.add(m);
            L.safes.push({ min: V3(x0, L.abyss, z0), max: V3(x1, top, z1) });
          }
        }
      },
    };
    return B;
  }

  function newLevelState(idx, def) {
    return {
      idx, def, root: new T.Group(), geos: [], mats: [], texs: [], statics: [], rayStatic: [],
      objs: [], doors: [], plates: [], receptors: [], exits: [], leaks: [], baths: [], safes: [],
      grounds: [], roofs: [], roofKinds: [], roofFeats: [], voids: [], lostY: -20, deathY: -126, abyss: -216,
      photos: [], sel: 0, film: def.film || 1, nextId: 1, start: [0.5, 1.02, 0.5], startYaw: 0,
      bounds: new T.Box3(), sig: {}, beamPool: [], beamSegs: [], room: null, dust: null, sign: null,
      glass: [], panes: [], chutes: [], spots: [], spotMeshes: [], aimProxies: [], preCards: [], beamEnds: [], markers: [],
      staticBody: new C.Body({ mass: 0, material: matWorld }),
    };
  }
  function freeLevelState(st) {
    st.geos.forEach((g) => g.dispose());
    st.mats.forEach((m) => m.dispose());
    st.texs.forEach((t) => t.dispose());
    st.objs.forEach((o) => { o.edgeMat.dispose(); if (o.own) { o.own.mats.forEach((m) => m.dispose()); o.own.texs.forEach((t) => t.dispose()); if (o.own.rts) o.own.rts.forEach((r) => r.dispose()); } });
    st.photos.forEach((ph) => { if (ph.cardTex) { ph.cardTex.dispose(); ph.cardMat.dispose(); } });
  }

  // stencilled chamber number on the wall beside the start
  function drawSign(st) {
    const c = st.sign.canvas, x = c.getContext('2d');
    x.clearRect(0, 0, c.width, c.height);
    const films = levelFilms(st.def), special = films[0] !== 'shutter';
    x.fillStyle = special ? FILMS[films[0]].color : 'rgba(242,163,58,0.9)';
    x.fillRect(0, 22, 14, c.height - 44);
    x.fillStyle = 'rgba(36,42,47,0.86)';
    x.font = '900 190px "Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
    x.textBaseline = 'alphabetic';
    x.fillText(pad2(st.idx + 1), 34, 186);
    x.font = '600 34px "IBM Plex Mono", Menlo, monospace';
    x.fillText(st.def.name.toUpperCase(), 40, 236);
    if (special) {
      // the film, painted big in its own colour (one badge per film, stacked)
      x.font = '800 40px "Big Shoulders Display", "Arial Narrow", Impact, sans-serif';
      films.slice(0, 2).forEach((k, i) => {
        const f = FILMS[k], y = 36 + i * 74;
        x.fillStyle = f.color;
        rr(x, 300, y, 196, 64, 10); x.fill();
        x.fillStyle = '#14191c';
        x.fillText(f.short.toUpperCase(), 316, y + 48);
      });
    }
    st.sign.tex.needsUpdate = true;
  }
  function addSign(st) {
    const r = st.room;
    if (!r) return;
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const t = new T.CanvasTexture(c);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = ANISO;
    const geo = new T.PlaneGeometry(2.4, 1.2), mat = new T.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.85, depthWrite: false });
    st.geos.push(geo); st.mats.push(mat); st.texs.push(t);
    const m = new T.Mesh(geo, mat);
    m.rotation.y = Math.PI / 2;
    let wx = r.xa, sz = st.start[2] - 1.8;
    if (r.cells) {
      const cz = Math.floor(sz), has = (x, z) => r.cells.has(x + ',' + z);
      let x = Math.floor(st.start[0]);
      if (!has(x, cz)) sz = st.start[2];
      const z = Math.floor(sz);
      while (has(x - 1, z) && x > r.xa - 1) x--;
      wx = x;
    }
    m.position.set(wx + 0.015, Math.min(3.4, r.h - 0.5), sz);
    m.renderOrder = 1;
    st.root.add(m);
    st.sign = { canvas: c, tex: t };
    drawSign(st);
  }

  // dust drifting through the light
  function addDust(st) {
    const r = st.room;
    if (!r || LOWFI) return;
    const n = 240, pos = new Float32Array(n * 3), seed = [];
    const box = [r.xa, r.xb + 1, 1, r.h + 1, r.za, r.zb + 1];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = box[0] + Math.random() * (box[1] - box[0]);
      pos[i * 3 + 1] = box[2] + Math.random() * (box[3] - box[2]);
      pos[i * 3 + 2] = box[4] + Math.random() * (box[5] - box[4]);
      seed.push(Math.random() * Math.PI * 2);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    st.geos.push(g);
    const pts = new T.Points(g, M.dust);
    pts.frustumCulled = false;
    st.root.add(pts);
    st.dust = { g, pos, seed, box };
  }
  // photo spots breathe: the dashed ring turns, a ring pulses outward and the badge bobs
  function updateMarkers() {
    for (const mk of L.markers) {
      if (!L.objs.includes(mk.o)) { mk.sp.visible = false; continue; }
      const q = mk.o.group.position;
      mk.sp.position.set(q.x, q.y + mk.top + 0.34 + Math.sin(time * 2.6 + mk.seed) * 0.06, q.z);
      mk.sp.material.opacity = 0.75 + 0.25 * Math.sin(time * 5 + mk.seed);
    }
  }
  function updateSpots() {
    if (L.markers.length) updateMarkers();
    for (const sp of L.spots) {
      const f = sp.fx;
      if (!f) continue;
      f.ring.rotation.z = time * 0.6 + f.seed;
      const k = (time * 0.7 + f.seed) % 1;
      f.pulse.scale.setScalar(1 + k * 1.1);
      f.pulseMat.opacity = (1 - k) * 0.9;
      f.badge.position.y = sp.y + 2.55 + Math.sin(time * 2 + f.seed) * 0.08;
      f.shaft.material.opacity = 0.85 + Math.sin(time * 3 + f.seed) * 0.15;
    }
  }
  function updateDust(dt) {
    const d = L && L.dust;
    if (!d) return;
    const p = d.pos, b = d.box;
    for (let i = 0; i < d.seed.length; i++) {
      const s = d.seed[i];
      p[i * 3] += Math.sin(time * 0.3 + s) * 0.05 * dt;
      p[i * 3 + 1] += (0.035 + Math.sin(time * 0.5 + s * 2) * 0.03) * dt;
      p[i * 3 + 2] += Math.cos(time * 0.27 + s) * 0.05 * dt;
      if (p[i * 3 + 1] > b[3]) p[i * 3 + 1] = b[2];
    }
    d.g.attributes.position.needsUpdate = true;
  }

  function disposeLevel() {
    if (!L) return;
    scene.remove(L.root);
    freeLevelState(L);
    effects.length = 0;
    L = null;
    world = null;
    player = null;
  }

  let completeTimer = 0, hintTimer = 0;
  function loadLevel(idx, msg) {
    clearTimeout(completeTimer);
    transition = false;
    doneEl.hidden = true;
    disposeLevel();
    FX.clear(); shakeK = 0;
    // a new chamber develops in (not a restart: that should be quick)
    if (running && !msg && !LOWFI && !CALM) { canvas.classList.remove('develop'); void canvas.offsetWidth; canvas.classList.add('develop'); }
    const def = LEVELS[idx];
    world = makeWorld();
    L = newLevelState(idx, def);
    scene.add(L.root);
    applyFilmLook(def);
    { const B = makeBuilder(); def.build(B); B.finish(); }
    voidLook(L);
    addSign(L);
    if (!paused) aud((A) => A.setMusic(musicKey(idx), idx));
    addDust(L);
    world.addBody(L.staticBody);
    player = makePlayer();
    player.position.set(L.start[0], L.start[1], L.start[2]);
    world.addBody(player);
    P.prev.set(L.start[0], L.start[1], L.start[2]);
    P.onGround = false; P.coyote = 0; P.jumpBuf = 0; P.jumpLock = 0; P.padCool = 0; P.bob = 0; P.bobAmp = 0;
    P.support = null; P.airCeil = L.start[1]; P.voidCry = false;
    aud((A) => { if (A.stopVoice) A.stopVoice(); });
    yaw = L.startYaw; pitch = 0; acc = 0;
    pendingCapture = null; aim = null; expo = null;
    ghost.key = '';

    const c = L.bounds.getCenter(V3());
    sun.position.set(c.x + 9, c.y + 26, c.z + 7);
    sun.target.position.copy(c);

    lvlNum.textContent = pad2(idx + 1);
    lvlName.textContent = def.name;
    hintText.textContent = def.hint;
    hintEl.classList.remove('faded');
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hintEl.classList.add('faded'), 18000);
    renderStrip();
    if (running) flash('dark');
    if (msg) toast(msg);
    else if (running) showTitle();
    saveHot();
  }

  // ------------------------------------------------------------------ objects
  const scaleBoxes = (boxes, k) => (k === 1 ? boxes : boxes.map((b) => ({ c: b.c.map((v) => v * k), s: b.s.map((v) => v * k) })));
  function massOf(kind, boxes) {
    const vol = boxes.reduce((v, b) => v + b.s[0] * b.s[1] * b.s[2], 0);
    return kind === 'pad' ? Math.max(3, vol * 2.5) : clamp(vol * 2.5, 1.2, 40);
  }
  function spawnObj(spec) {
    const pinned = !!spec.pinned, locked = !!spec.locked || pinned, fixed = !!spec.fixed && !locked, dyn = (!locked && !fixed) || pinned;
    const k = spec.scale || 1;
    const o = {
      id: L.nextId++, kind: spec.kind, baseBoxes: spec.boxes, boxes: scaleBoxes(spec.boxes, k), scale: k,
      locked, fixed, pinned, dynamic: dyn, yaw: spec.yaw || 0, flash: spec.printed ? 1 : 0, meshes: [],
      // orange structural pieces lock in place once they come to rest, so walking into them can't shove them off a ledge
      settles: dyn && spec.kind !== 'crate', frozen: false,
      // where this object first appeared, so it can be reprinted if it falls out of the world
      spawn: spec.spawn || (spec.printed ? null : { pos: spec.pos.slice(), yaw: spec.yaw || 0, scale: k }),
    };
    if (spec.extra) Object.assign(o, spec.extra);
    o.mass = dyn ? massOf(o.kind, o.boxes) : 0;
    o.edgeMat = new T.LineBasicMaterial({ color: edgeColor(o), transparent: true, opacity: 0.85 });
    o.group = buildObjGroup(o);
    o.group.scale.setScalar(k);
    const body = new C.Body({ mass: o.mass, material: dyn ? matCrate : matWorld });
    for (const b of o.boxes) body.addShape(new C.Box(new C.Vec3(b.s[0] / 2, b.s[1] / 2, b.s[2] / 2)), new C.Vec3(b.c[0], b.c[1], b.c[2]));
    if (o.ghostly) body.collisionResponse = false;
    body.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
    body.quaternion.setFromAxisAngle(new C.Vec3(0, 1, 0), o.yaw);
    if (dyn) {
      body.linearDamping = 0.05;
      body.angularDamping = 0.15;
      body.sleepSpeedLimit = 0.2;
      body.sleepTimeLimit = 0.5;
      body.addEventListener('collide', onCrateHit);
      body.updateMassProperties();
    }
    body.obj = o;
    o.body = body;
    world.addBody(body);
    L.root.add(o.group);
    L.objs.push(o);
    syncObj(o);
    wakeDynamics();
    return o;
  }

  function buildObjGroup(o) {
    const g = new T.Group();
    const base = o.locked ? M.locked : o.kind === 'crate' ? (o.fixed ? M.crateCyan : M.crate)
      : o.kind === 'streak' ? (o.fixed ? M.streakBlue : M.streakOrange) : (o.fixed ? M.cyan : M.emu);
    const padTop = o.fixed ? M.padTopCyan : M.padTop;
    for (const b of o.baseBoxes) {
      let mat = base;
      if (b.reflect) mat = [base, base, base, base, M.mirror, M.mirror];
      if (o.kind === 'pad') mat = [base, base, padTop, base, base, base];
      const m = new T.Mesh(o.kind === 'crate' ? GEO.crate : o.kind === 'postcard' ? GEO.card : objBoxGeo(b.s), mat);
      m.position.set(b.c[0], b.c[1], b.c[2]);
      m.castShadow = m.receiveShadow = true;
      m.userData.obj = o;
      m.userData.reflective = !!b.reflect;
      o.meshes.push(m);
      const e = new T.LineSegments(objEdgeGeo(b.s), o.edgeMat);
      e.position.copy(m.position);
      g.add(m, e);
    }
    if (o.kind === 'postcard') {
      const t = new T.CanvasTexture(o.card);
      t.encoding = T.sRGBEncoding;
      t.anisotropy = ANISO;
      const front = portalMaterial(t);
      o.own = { mats: [front], texs: [t], rts: [] };
      o.portal = { mat: front, rt: null };
      o.meshes[0].material = [M.cardEdge, M.cardEdge, M.cardEdge, M.cardEdge, front, M.cardBack];
      o.edgeMat.color.set(FILMS.postcard.glow);
    }
    if (o.kind === 'emitter') {
      const lens = new T.Mesh(GEO.lens, M.lens);
      lens.position.set(0, 0, -0.55);
      lens.rotation.x = Math.PI / 2;
      const ring = new T.Mesh(GEO.ring, M.pipe);
      ring.position.set(0, 0, -0.53);
      g.add(lens, ring);
    }
    return g;
  }

  function syncObj(o) {
    const p = o.body.position, q = o.body.quaternion;
    o.group.position.set(p.x, p.y, p.z);
    o.group.quaternion.set(q.x, q.y, q.z, q.w);
  }

  function removeObj(o, fx) {
    if (fx) burst(o, true);
    const bb = unionBounds(objObbs(o));
    world.remove(o.body);
    L.root.remove(o.group);
    L.objs.splice(L.objs.indexOf(o), 1);
    o.edgeMat.dispose();
    if (o.own) { o.own.mats.forEach((m) => m.dispose()); o.own.texs.forEach((t) => t.dispose()); if (o.own.rts) o.own.rts.forEach((r) => r.dispose()); }
    disturb(bb);
  }

  // settled orange pieces become static; anything that changes nearby lets them fall again
  function freeze(o) {
    const b = o.body;
    o.frozen = true;
    b.type = C.Body.STATIC;
    b.mass = 0;
    b.updateMassProperties();
    b.velocity.set(0, 0, 0);
    b.angularVelocity.set(0, 0, 0);
  }
  function thaw(o) {
    const b = o.body;
    o.frozen = false;
    b.type = C.Body.DYNAMIC;
    b.mass = o.mass;
    b.updateMassProperties();
    b.wakeUp();
  }
  function wakeDynamics() {
    if (world) for (const b of world.bodies) if (b.type === C.Body.DYNAMIC) b.wakeUp();
  }
  function disturb(bounds) {
    const zone = { min: bounds.min.clone().subScalar(0.6), max: bounds.max.clone().addScalar(0.6) };
    for (const o of L.objs) if (o.frozen && aabbOverlap(zone, unionBounds(objObbs(o)))) thaw(o);
    wakeDynamics();
  }
  function settleObjects() {
    for (const o of L.objs) if (o.settles && !o.frozen && o.body.sleepState === C.Body.SLEEPING) freeze(o);
    // a moving crate that bumps a settled piece knocks it loose
    for (const c of L.objs) {
      if (!c.dynamic || c.settles) continue;
      const v = c.body.velocity;
      if (v.x * v.x + v.y * v.y + v.z * v.z < 0.25) continue;
      const cb = unionBounds(objObbs(c));
      cb.min.subScalar(0.12); cb.max.addScalar(0.12);
      for (const o of L.objs) if (o.frozen && aabbOverlap(cb, unionBounds(objObbs(o)))) thaw(o);
    }
  }

  // ------------------------------------------------------------------ geometry queries
  const objPos = (o) => V3(o.body.position.x, o.body.position.y, o.body.position.z);
  const objQuat = (o) => new T.Quaternion(o.body.quaternion.x, o.body.quaternion.y, o.body.quaternion.z, o.body.quaternion.w);
  function obbsFrom(boxes, pos, quat) {
    const u = [AX[0].clone().applyQuaternion(quat), AX[1].clone().applyQuaternion(quat), AX[2].clone().applyQuaternion(quat)];
    return boxes.map((b) => ({ c: V3(b.c[0], b.c[1], b.c[2]).applyQuaternion(quat).add(pos), u, e: [b.s[0] / 2, b.s[1] / 2, b.s[2] / 2] }));
  }
  const objObbs = (o) => obbsFrom(o.boxes, objPos(o), objQuat(o));
  function obbBounds(b) {
    const ex = [0, 1, 2].map((i) => Math.abs(b.u[0].getComponent(i)) * b.e[0] + Math.abs(b.u[1].getComponent(i)) * b.e[1] + Math.abs(b.u[2].getComponent(i)) * b.e[2]);
    return { min: V3(b.c.x - ex[0], b.c.y - ex[1], b.c.z - ex[2]), max: V3(b.c.x + ex[0], b.c.y + ex[1], b.c.z + ex[2]) };
  }
  function unionBounds(obbs) {
    const r = { min: V3(Infinity, Infinity, Infinity), max: V3(-Infinity, -Infinity, -Infinity) };
    for (const b of obbs) { const bb = obbBounds(b); r.min.min(bb.min); r.max.max(bb.max); }
    return r;
  }
  const aabbOverlap = (a, b) => a.min.x < b.max.x && a.max.x > b.min.x && a.min.y < b.max.y && a.max.y > b.min.y && a.min.z < b.max.z && a.max.z > b.min.z;
  const aabbObb = (min, max) => ({ c: min.clone().add(max).multiplyScalar(0.5), u: AX, e: [(max.x - min.x) / 2, (max.y - min.y) / 2, (max.z - min.z) / 2] });
  function playerBox() {
    const p = player.position;
    return { min: V3(p.x - PR, p.y, p.z - PR), max: V3(p.x + PR, p.y + PH, p.z + PR) };
  }
  function objYaw(o) {
    if (!o.dynamic) return o.yaw;
    const q = objQuat(o);
    const f = V3(0, 0, -1).applyQuaternion(q);
    if (Math.hypot(f.x, f.z) > 0.35) return Math.atan2(-f.x, -f.z);
    const r = V3(1, 0, 0).applyQuaternion(q);
    return Math.atan2(-r.z, r.x);
  }

  // separating-axis test for two oriented boxes (Ericson, Real-Time Collision Detection 4.4)
  function obbObb(a, b) {
    const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], AR = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { R[i][j] = a.u[i].dot(b.u[j]); AR[i][j] = Math.abs(R[i][j]) + 1e-6; }
    const tv = b.c.clone().sub(a.c);
    const t = [tv.dot(a.u[0]), tv.dot(a.u[1]), tv.dot(a.u[2])];
    const ae = a.e, be = b.e;
    let ra, rb;
    for (let i = 0; i < 3; i++) { ra = ae[i]; rb = be[0] * AR[i][0] + be[1] * AR[i][1] + be[2] * AR[i][2]; if (Math.abs(t[i]) > ra + rb) return false; }
    for (let i = 0; i < 3; i++) { ra = ae[0] * AR[0][i] + ae[1] * AR[1][i] + ae[2] * AR[2][i]; rb = be[i]; if (Math.abs(t[0] * R[0][i] + t[1] * R[1][i] + t[2] * R[2][i]) > ra + rb) return false; }
    ra = ae[1] * AR[2][0] + ae[2] * AR[1][0]; rb = be[1] * AR[0][2] + be[2] * AR[0][1]; if (Math.abs(t[2] * R[1][0] - t[1] * R[2][0]) > ra + rb) return false;
    ra = ae[1] * AR[2][1] + ae[2] * AR[1][1]; rb = be[0] * AR[0][2] + be[2] * AR[0][0]; if (Math.abs(t[2] * R[1][1] - t[1] * R[2][1]) > ra + rb) return false;
    ra = ae[1] * AR[2][2] + ae[2] * AR[1][2]; rb = be[0] * AR[0][1] + be[1] * AR[0][0]; if (Math.abs(t[2] * R[1][2] - t[1] * R[2][2]) > ra + rb) return false;
    ra = ae[0] * AR[2][0] + ae[2] * AR[0][0]; rb = be[1] * AR[1][2] + be[2] * AR[1][1]; if (Math.abs(t[0] * R[2][0] - t[2] * R[0][0]) > ra + rb) return false;
    ra = ae[0] * AR[2][1] + ae[2] * AR[0][1]; rb = be[0] * AR[1][2] + be[2] * AR[1][0]; if (Math.abs(t[0] * R[2][1] - t[2] * R[0][1]) > ra + rb) return false;
    ra = ae[0] * AR[2][2] + ae[2] * AR[0][2]; rb = be[0] * AR[1][1] + be[1] * AR[1][0]; if (Math.abs(t[0] * R[2][2] - t[2] * R[0][2]) > ra + rb) return false;
    ra = ae[0] * AR[1][0] + ae[1] * AR[0][0]; rb = be[1] * AR[2][2] + be[2] * AR[2][1]; if (Math.abs(t[1] * R[0][0] - t[0] * R[1][0]) > ra + rb) return false;
    ra = ae[0] * AR[1][1] + ae[1] * AR[0][1]; rb = be[0] * AR[2][2] + be[2] * AR[2][0]; if (Math.abs(t[1] * R[0][1] - t[0] * R[1][1]) > ra + rb) return false;
    ra = ae[0] * AR[1][2] + ae[1] * AR[0][2]; rb = be[0] * AR[2][1] + be[1] * AR[2][0]; if (Math.abs(t[1] * R[0][2] - t[0] * R[1][2]) > ra + rb) return false;
    return true;
  }

  // would these boxes overlap anything solid? (a hair of tolerance so things can sit flush)
  const shrink = (obbs, m = 0.03) => obbs.map((b) => ({ c: b.c, u: b.u, e: b.e.map((v) => Math.max(0.02, v - m)) }));
  function blocked(obbs, ignore, onlyWorld, tight, smashed) {
    const cand = shrink(obbs, tight ? 0.015 : 0.03);
    const cb = unionBounds(cand);
    const hit = (other) => cand.some((c) => obbObb(c, other));
    for (const s of L.statics) if (aabbOverlap(cb, s) && hit(aabbObb(s.min, s.max))) return true;
    for (const p of L.panes) if (!p.broken && !(smashed && smashed.includes(p)) && aabbOverlap(cb, p) && hit(aabbObb(p.min, p.max))) return true;
    for (const d of L.doors) if (!d.open && aabbOverlap(cb, d) && hit(aabbObb(d.min, d.max))) return true;
    if (onlyWorld) return false;
    for (const o of L.objs) {
      if (o === ignore || o.ghostly) continue;
      const oo = objObbs(o);
      if (!aabbOverlap(cb, unionBounds(oo))) continue;
      for (const a of oo) if (hit(a)) return true;
    }
    return false;
  }
  function hitsPlayer(obbs) {
    const cand = shrink(obbs), pb = playerBox();
    pb.min.y -= 0.02;
    return aabbOverlap(unionBounds(cand), pb) && cand.some((c) => obbObb(c, aabbObb(pb.min, pb.max)));
  }
  // a print can only appear somewhere you can actually see: not behind walls, under floors or through glass
  const sightRay = new T.Raycaster();
  function inSight(eye, pos, obbs) {
    const walls = sightTargets();
    const bb = unionBounds(obbs);
    const pts = [pos, V3(pos.x, bb.max.y - 0.04, pos.z), V3(pos.x, (pos.y + bb.max.y) / 2, pos.z)];
    for (const p of pts) {
      const d = p.clone().sub(eye), len = d.length();
      if (len < 0.05) return true;
      sightRay.set(eye, d.divideScalar(len));
      sightRay.near = 0; sightRay.far = len;
      const hit = sightRay.intersectObjects(walls, false)[0];
      if (!hit || hit.distance > len - 0.06) return true;
    }
    return false;
  }

  // ------------------------------------------------------------------ camera gun
  const eyePos = () => EYEPOS.clone();
  const camQuat = () => new T.Quaternion().setFromEuler(new T.Euler(pitch, yaw, 0, 'YXZ'));

  const MIN_SCALE = 0.2, MAX_SCALE = 4.5;
  // a print that just grazes a wall slides out sideways instead of hopping on top
  const SIDE_SLIDE = window.__SHUTTER_SIDESLIDE !== false;
  const printScale = (ph) => clamp(L.def.zoom ? ph.scale0 * ph.dist : ph.scale0, MIN_SCALE, MAX_SCALE);
  function computePose(ph, snap) {
    const eye = eyePos();
    const pos = eye.clone().add(ph.relPos.clone().multiplyScalar(ph.dist).applyQuaternion(camQuat()));
    const scale = printScale(ph);
    const boxes = scaleBoxes(ph.boxes, scale);
    let y = (ph.viewYaw ? yaw : ph.yaw0) + ph.spin;
    if (snap) {
      y = Math.round(y / (Math.PI / 4)) * (Math.PI / 4);
      const bb = unionBounds(obbsFrom(boxes, pos, yawQuat(y)));
      pos.x += Math.round(bb.min.x * 2) / 2 - bb.min.x;
      pos.y += Math.round(bb.min.y * 2) / 2 - bb.min.y;
      pos.z += Math.round(bb.min.z * 2) / 2 - bb.min.z;
    }
    const q = yawQuat(y);
    const res = { pos, yaw: y, quat: q, valid: false, scale, why: '' };
    const aimAt = pos.clone();
    let obbs = obbsFrom(boxes, pos, q);
    // never shove you out of the way, and never stack a print on your head to dodge you
    if (hitsPlayer(obbs)) { res.why = 'player'; return res; }
    const ghostly = ph.kind === 'postcard';
    // how far from your eye it has to stay, so pulling it toward you never pulls it into you
    const reach = (bb) => 0.5 * Math.hypot(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z) + 0.35;
    if (blocked(obbs, null, ghostly)) {
      // buried in something: move it out the shortest way. Just grazing a wall, it slides a hair sideways; sunk
      // into a floor or a ledge, it rests on top; aimed into a wall, it comes back toward you and sits against it
      let side = null;
      if (!snap && SIDE_SLIDE) {
        outer: for (const d of [0.03, 0.06, 0.09, 0.12, 0.15]) {
          for (const [ox, oz] of [[d, 0], [-d, 0], [0, d], [0, -d]]) {
            if (!blocked(obbsFrom(boxes, V3(pos.x + ox, pos.y, pos.z + oz), q), null, ghostly)) { side = [ox, oz, d]; break outer; }
          }
        }
      }
      const bb = unionBounds(obbs), h = bb.max.y - bb.min.y;
      const maxLift = snap ? 1.01 : Math.max(1.2, Math.min(2.0, h + 0.5));
      const step = snap ? 0.5 : 0.12;
      let lo = 0, hi = -1;
      for (let d = step; d <= maxLift + 1e-6; d += step) {
        if (!blocked(obbsFrom(boxes, V3(pos.x, pos.y + d, pos.z), q), null, ghostly)) { hi = d; break; }
        lo = d;
      }
      if (!snap && hi > 0) {
        for (let i = 0; i < 7; i++) {
          const mid = (lo + hi) / 2;
          if (blocked(obbsFrom(boxes, V3(pos.x, pos.y + mid, pos.z), q), null, ghostly)) lo = mid; else hi = mid;
        }
        hi += 0.004;
      }
      // or back along your line of sight, toward you: aimed into a wall, it sits against the wall where you're
      // aiming instead of hopping up on top of it
      let back = null;
      const ray = pos.clone().sub(eye), len = ray.length();
      if (!snap && len > 1e-3) {
        const at = (t) => eye.clone().addScaledVector(ray, t);
        let a = Math.min(1, reach(bb) / len), b = 1;
        if (a < 1 && !blocked(obbsFrom(boxes, at(a), q), null, ghostly)) {
          for (let i = 0; i < 9; i++) { const m = (a + b) / 2; if (blocked(obbsFrom(boxes, at(m), q), null, ghostly)) b = m; else a = m; }
          back = { p: at(a), d: (1 - a) * len };
        }
      }
      // whichever moves it least, so it stays as close as it can to where you're aiming
      let best = null;
      if (side) best = { d: side[2], p: V3(pos.x + side[0], pos.y, pos.z + side[1]) };
      if (hi > 0 && (!best || hi < best.d)) best = { d: hi, p: V3(pos.x, pos.y + hi, pos.z) };
      if (back && (!best || back.d < best.d)) best = back;
      if (!best) { res.why = 'blocked'; return res; }
      pos.copy(best.p);
      obbs = obbsFrom(boxes, pos, q);
      if (hitsPlayer(obbs)) { res.why = 'player'; return res; }
    }
    if (!inSight(eye, pos, obbs)) {
      // out of sight (say, aimed through a wall at the room behind it): bring it back along your line of sight to
      // this side of whatever's in the way, so it sits against the wall you're looking at
      let ok = false;
      const fwd = aimAt.clone().sub(eye), flen = fwd.length();
      if (!snap && flen > 1e-3) {
        fwd.divideScalar(flen);
        sightRay.set(eye, fwd); sightRay.near = 0; sightRay.far = flen;
        const hit = sightRay.intersectObjects(sightTargets(), false)[0];
        const near = reach(unionBounds(obbs));
        if (hit && hit.distance > near) {
          const at = (d) => eye.clone().addScaledVector(fwd, d);
          let a = near, b = hit.distance;
          if (!blocked(obbsFrom(boxes, at(a), q), null, ghostly)) {
            for (let i = 0; i < 9; i++) { const m = (a + b) / 2; if (blocked(obbsFrom(boxes, at(m), q), null, ghostly)) b = m; else a = m; }
            const np = at(a), no = obbsFrom(boxes, np, q);
            if (!hitsPlayer(no) && inSight(eye, np, no)) { pos.copy(np); obbs = no; ok = true; }
          }
        }
      }
      if (!ok) { res.why = 'sight'; return res; }
    }
    // in mid-air you can't print a blue foothold (or any jump pad) above the height you took off from, so you can't
    // climb your own prints. Orange prints just fall, and postcards and Action throws can't hold you up.
    if (!grounded() && !ghostly && (ph.fixed || ph.kind === 'pad') && !(ph.speed > 0.5 && !ph.fixed)) {
      if (unionBounds(obbs).max.y > P.airCeil + 0.05) { res.why = 'air'; return res; }
    }
    res.valid = true;
    return res;
  }

  function tryCapture() {
    if (!canAct()) return;
    if (!aim && aimSpot && L.def.postcard) {
      if (safeSpot(aimSpot)) { toast(SAFE_MSG); sfx('err'); return; }
      if (L.photos.length >= L.film) { toast('Out of film. Print a photo first.'); sfx('err'); return; }
      pendingCapture = { spot: aimSpot };
      return;
    }
    if (!aim) return;
    if (aim.locked) { toast('Anchored. This one can’t be photographed.'); sfx('err'); return; }
    if (underfoot(aim)) { toast(underfootMsg()); sfx('err'); return; }
    if (safeObj(aim)) { toast(SAFE_MSG); sfx('err'); return; }
    if (L.photos.length >= L.film) { toast('Out of film. Print a photo first.'); sfx('err'); return; }
    pendingCapture = aim;
  }
  // you can't photograph what you're standing on, or what you just jumped off until your feet touch something else
  // (Double-X copies leave the original where it is, so they're fine)
  const underfoot = (o) => !!o && o === P.support && !L.def.copy;
  // safelights: anything in red light (or a photo spot in it) won't show up on film
  const inSafe = (p) => L.safes.some((z) => p.x > z.min.x && p.x < z.max.x && p.y > z.min.y && p.y < z.max.y && p.z > z.min.z && p.z < z.max.z);
  const safeObj = (o) => !!o && L.safes.length > 0 && inSafe(objPos(o));
  const safeSpot = (sp) => !!sp && L.safes.length > 0 && inSafe(V3(sp.x, sp.y + 0.8, sp.z));
  const SAFE_MSG = 'In safelight. Red light doesn’t show up on film: get it out of the light first.';
  const underfootMsg = () => (P.onGround ? 'You’re standing on that. Step off it first.' : 'You just left that. Land on something else first.');

  function finishCapture(o) {
    if (!L || !L.objs.includes(o)) return;
    const thumb = makeThumb();
    const p = objPos(o), oy = objYaw(o);
    const inv = camQuat().invert();
    const copy = !!L.def.copy;
    const photo = {
      id: ++photoSeq, kind: o.kind, boxes: o.baseBoxes, scale0: o.scale, copy,
      relPos: p.clone().sub(eyePos()).applyQuaternion(inv), yaw0: oy, dist: 1, spin: 0,
      home: { pos: [p.x, p.y, p.z], yaw: oy, scale: o.scale }, fixed: o.fixed, spawn: copy ? null : o.spawn, thumb, frame: ++frameCounter,
      speed: L.def.motion && o.dynamic ? Math.min(MAX_LAUNCH, o.body.velocity.length()) : 0,
    };
    // you hold what you take right on your crosshair, as far away as it was, wherever in the frame it sat (so a
    // throw goes where you look, too), and it turns with you: it keeps the angle it had to you when you took it.
    // A throw keeps the way it was facing instead, so a crate you caught falling flies square at a window.
    photo.relPos = V3(0, 0, -Math.max(0.5, photo.relPos.length()));
    if (!(photo.speed > 0.5)) { photo.viewYaw = true; photo.yaw0 = 0; photo.spin = oy - yaw; }
    if (o.chute) photo.extra = { chute: o.chute };
    if (o.kind === 'postcard') { photo.extra = { dest: o.dest, card: o.card, ghostly: true }; photo.viewYaw = true; photo.yaw0 = 0; photo.spin = 0; }
    if (copy && photo.extra) delete photo.extra.chute;
    captureFX(o);
    if (copy) { burst(o, true); sfx('copy'); } else removeObj(o, true);
    aim = null;
    L.photos.push(photo);
    L.sel = L.photos.length - 1;
    ghost.key = '';
    renderStrip();
    sfx('shutter');
    HAND.kick();
    FX.flash(1);
  }

  const WHY = {
    player: 'Too close. That print would land on you.',
    blocked: 'Blocked. Something is in the way of the print.',
    sight: 'Out of sight. You can only print where you can see.',
    air: 'Too high. In mid-air, blue prints and pads can only go as high as you jumped from.',
  };
  const WHY_SHORT = { player: 'Too close to you', blocked: 'Print blocked', sight: 'Out of sight', air: 'Above your take-off' };
  const grounded = () => P.onGround || P.coyote > 0;
  // nothing at all underneath you, however far down: you've fallen out of the map
  const voidRay = new T.Raycaster(), _down = new T.Vector3(0, -1, 0);
  function overVoid() {
    const p = player.position;
    voidRay.set(V3(p.x, p.y + 0.3, p.z), _down); voidRay.near = 0; voidRay.far = 120;
    const under = L.rayStatic.concat(L.glass);
    for (const o of L.objs) if (o.fixed && o.meshes) for (const m of o.meshes) under.push(m);
    // (a floor so far down you'd drop out of the bottom before reaching it doesn't count)
    const hit = voidRay.intersectObjects(under, false)[0];
    return !hit || hit.point.y < L.deathY + 0.5;
  }
  // how long you've got left to fall before you drop out of frame (gravity, up to terminal speed)
  function fallTimeLeft() {
    const h = Math.max(0, player.position.y - L.deathY), v = Math.max(0, -player.velocity.y);
    if (v >= FALL_VT) return h / FALL_VT;
    const t1 = (FALL_VT - v) / GRAV, d1 = v * t1 + 0.5 * GRAV * t1 * t1;
    if (d1 >= h) return (-v + Math.sqrt(v * v + 2 * GRAV * h)) / GRAV;
    return t1 + (h - d1) / FALL_VT;
  }
  // ------------------------------------------------------------------ Slow film: bulb exposures
  // Hold the shutter open on something moving and the photo captures everywhere it went: one long solid streak.
  // The subject stays where it is. A subject that doesn't move is just photographed normally.
  const EXPO_MAX = 3;
  let expo = null;
  function startExposure() {
    if (!canAct() || expo || !aim) return;
    if (aim.locked) { toast('Anchored. This one can’t be photographed.'); sfx('err'); return; }
    if (safeObj(aim)) { toast(SAFE_MSG); sfx('err'); return; }
    if (L.photos.length >= L.film) { toast('Out of film. Print a photo first.'); sfx('err'); return; }
    const bb = unionBounds(objObbs(aim));
    expo = { o: aim, t: 0, min: bb.min.clone(), max: bb.max.clone(), s0: bb.max.clone().sub(bb.min) };
    sfx('open');
    aud((A) => A.exposure(true));
  }
  function trackExposure(dt) {
    if (!expo) return;
    if (!L.objs.includes(expo.o)) { expo = null; return; }
    expo.t += dt;
    const bb = unionBounds(objObbs(expo.o));
    expo.min.min(bb.min); expo.max.max(bb.max);
    if (expo.t >= EXPO_MAX) endExposure();
  }
  const expoLength = (e) => { const x = e.max.clone().sub(e.min); return Math.max(x.x, x.y, x.z); };
  function endExposure() {
    if (!expo) return;
    const e = expo;
    expo = null;
    aud((A) => A.exposure(false));
    if (!L || !L.objs.includes(e.o) || L.photos.length >= L.film) return;
    const ext = e.max.clone().sub(e.min), grow = ext.clone().sub(e.s0);
    // a click lasts a tenth of a second or so: that's a snapshot, not a long exposure
    if (e.t < 0.2 || Math.max(grow.x, grow.y, grow.z) < 0.15) {
      if (underfoot(e.o)) { toast(underfootMsg()); sfx('err'); return; }
      finishCapture(e.o);
      return;
    }
    const axis = grow.x >= grow.z && grow.x >= grow.y ? 'x' : grow.z >= grow.y ? 'z' : 'y';
    const sz = axis === 'z' ? [ext.z, ext.y, ext.x] : [ext.x, ext.y, ext.z];
    const c = e.min.clone().add(e.max).multiplyScalar(0.5);
    const photo = {
      id: ++photoSeq, kind: 'streak', boxes: [{ c: [0, 0, 0], s: sz.map((v) => Math.round(v * 100) / 100) }], scale0: 1, copy: false,
      relPos: V3(0, 0, -Math.max(0.5, c.clone().sub(eyePos()).length())), viewYaw: true, yaw0: 0, dist: 1, spin: (axis === 'z' ? Math.PI / 2 : 0) - yaw,
      home: null, fixed: e.o.fixed, spawn: null, thumb: makeThumb(), frame: ++frameCounter, speed: 0,
    };
    L.photos.push(photo);
    L.sel = L.photos.length - 1;
    ghost.key = '';
    renderStrip();
    sfx('shutter');
    HAND.kick();
    FX.flash(1);
  }

  // a postcard of a photo spot shows the view from that spot: where you'll come out when you step through.
  // The whole face is picture. (With a GPU to spare, the printed card shows it live, like a doorway.)
  const destCam = new T.PerspectiveCamera(74, 1, 0.05, 200);
  destCam.rotation.order = 'YXZ';
  function snapDest(dest) {
    const card = document.createElement('canvas'), thumb = document.createElement('canvas');
    card.width = 352; card.height = 640;
    thumb.width = 264; thumb.height = 176;
    if (NORENDER) return { card, thumb };
    const src = renderer.domElement;
    destCam.fov = camera.fov; destCam.aspect = camera.aspect; destCam.updateProjectionMatrix();
    destCam.position.set(dest.x, dest.y + EYE, dest.z);
    destCam.rotation.set(-0.04, dest.yaw, 0);
    destCam.updateMatrixWorld();
    const hide = (dest.spot && dest.spot.meshes) || [];
    hide.forEach((m) => { m.visible = false; });
    const gv = ghost.group.visible;
    ghost.group.visible = false;
    try {
      renderer.render(scene, destCam);
      const cx = card.getContext('2d'), ar = card.width / card.height;
      const sh = Math.min(src.height, src.width / ar), sw = sh * ar;
      cx.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, card.width, card.height);
      const tx = thumb.getContext('2d'), ar2 = thumb.width / thumb.height;
      const th = Math.min(src.height, src.width / ar2), tw = th * ar2;
      tx.drawImage(src, (src.width - tw) / 2, (src.height - th) / 2, tw, th, 0, 0, thumb.width, thumb.height);
    } catch (e) { /* ignore */ }
    hide.forEach((m) => { m.visible = true; });
    ghost.group.visible = gv;
    renderer.render(scene, camera);
    return { card, thumb };
  }
  function finishPostcard(spot) {
    if (!L || !L.spots.includes(spot) || L.photos.length >= L.film) return;
    const dest = { x: spot.x, y: spot.y, z: spot.z, yaw: spot.yaw, spot };
    const snap = snapDest(dest);
    const photo = {
      id: ++photoSeq, kind: 'postcard', boxes: [{ c: [0, 0, 0], s: [1.1, 2, 0.1] }], scale0: 1, copy: false,
      relPos: V3(0, 0, -3.2), viewYaw: true, yaw0: 0, dist: 1, spin: 0, home: null, fixed: true, spawn: null,
      thumb: snap.thumb, frame: ++frameCounter, speed: 0,
      extra: { dest, card: snap.card, ghostly: true },
    };
    L.photos.push(photo);
    L.sel = L.photos.length - 1;
    ghost.key = '';
    renderStrip();
    sfx('shutter');
    HAND.kick();
    FX.flash(1);
  }

  // ------------------------------------------------------------------ postcard portals
  // The card's face samples a render of the destination taken from where your eye would be if the card were a
  // doorway, so looking into it is looking through it. Screen-space lookup keeps it seamless at any angle.
  function portalMaterial(still) {
    return new T.ShaderMaterial({
      uniforms: { live: { value: null }, still: { value: still }, useLive: { value: 0 }, res: { value: new T.Vector2(1, 1) },
        tint: { value: new T.Color(FILMS.postcard.color) }, time: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform sampler2D live; uniform sampler2D still; uniform float useLive; uniform vec2 res; uniform vec3 tint; uniform float time;
        varying vec2 vUv;
        void main() {
          vec3 c = useLive > 0.5 ? texture2D(live, gl_FragCoord.xy / res).rgb : texture2D(still, vUv).rgb;
          float e = min(min(vUv.x, 1.0 - vUv.x) * 1.1, min(vUv.y, 1.0 - vUv.y) * 2.0);
          float rim = 1.0 - smoothstep(0.0, 0.035, e);
          float glow = (1.0 - smoothstep(0.0, 0.12, e)) * (0.18 + 0.08 * sin(time * 3.0));
          c = mix(c, tint, clamp(rim * 0.9 + glow, 0.0, 1.0));
          gl_FragColor = vec4(c, 1.0);
        }`,
    });
  }
  const portalCam = new T.PerspectiveCamera(74, 1, 0.05, 200);
  const portalPlane = new T.Plane(), _pm1 = new T.Matrix4(), _pm2 = new T.Matrix4(), _pm3 = new T.Matrix4(), _one = V3(1, 1, 1);
  const _frustum = new T.Frustum(), _sphere = new T.Sphere(), _buf = new T.Vector2();
  let portalsOn = true;
  // Lengyel's oblique near plane (the same trick three's Reflector uses): the near plane becomes the given plane
  const _q4 = new T.Vector4(), _c4 = new T.Vector4();
  function obliqueNear(pm, plane) {
    const e = pm.elements;
    _c4.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
    _q4.set((Math.sign(_c4.x) + e[8]) / e[0], (Math.sign(_c4.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
    _c4.multiplyScalar(2 / _c4.dot(_q4));
    e[2] = _c4.x; e[6] = _c4.y; e[10] = _c4.z + 1; e[14] = _c4.w;
  }
  function cardFrame(o, out) {
    const p = objPos(o);
    p.y -= o.boxes[0].s[1] / 2;
    return out.compose(p, objQuat(o), _one);
  }
  function renderPortals() {
    if (!L || LOWFI || !portalsOn) return;
    const cards = L.objs.filter((o) => o.portal);
    if (!cards.length) return;
    renderer.getDrawingBufferSize(_buf);
    camera.updateMatrixWorld();
    _frustum.setFromProjectionMatrix(_pm3.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    const shown = [];
    for (const o of cards) {
      const mat = o.portal.mat;
      mat.uniforms.time.value = time;
      mat.uniforms.res.value.copy(_buf);
      // only when you can see its face
      const local = camera.position.clone().sub(objPos(o)).applyQuaternion(objQuat(o).invert());
      _sphere.set(objPos(o), 1.2 * o.scale);
      if (local.z <= 0.02 || !_frustum.intersectsSphere(_sphere)) { mat.uniforms.useLive.value = 0; continue; }
      shown.push(o);
    }
    if (!shown.length) return;
    // nothing that shows a portal may be drawn into one, and nothing of yours should be in the shot
    const hidden = [];
    const hide = (m) => { if (m.visible) { m.visible = false; hidden.push(m); } };
    for (const o of cards) hide(o.group);
    hide(ghost.group); hide(ghost.beam); hide(ghost.drop); hide(ghost.arc); hide(ghost.hit);
    ghost.dots.forEach(hide);
    ghost.lz.dots.forEach(hide); ghost.lz.cores.forEach(hide); hide(ghost.lz.end);
    const sm = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = false;
    const w = Math.max(2, Math.round(_buf.x * PORTAL_RES)), h = Math.max(2, Math.round(_buf.y * PORTAL_RES));
    for (const o of shown) {
      const d = o.dest;
      if (!o.portal.rt) {
        o.portal.rt = new T.WebGLRenderTarget(w, h);
        o.portal.rt.texture.encoding = T.sRGBEncoding;
        o.own.rts.push(o.portal.rt);
      } else if (o.portal.rt.width !== w || o.portal.rt.height !== h) o.portal.rt.setSize(w, h);
      // where your eye would be relative to the spot, if the card were a door onto it
      _pm1.compose(V3(d.x, d.y, d.z), yawQuat(d.yaw), _one);
      cardFrame(o, _pm2).invert();
      _pm3.multiplyMatrices(_pm1, _pm2).multiply(camera.matrixWorld);
      _pm3.decompose(portalCam.position, portalCam.quaternion, portalCam.scale);
      portalCam.fov = camera.fov; portalCam.aspect = camera.aspect; portalCam.near = camera.near; portalCam.far = camera.far;
      portalCam.updateProjectionMatrix();
      portalCam.updateMatrixWorld();
      // and don't draw anything between that eye and the doorway: an oblique near plane on the doorway itself
      const n = V3(-Math.sin(d.yaw), 0, -Math.cos(d.yaw));
      portalPlane.setFromNormalAndCoplanarPoint(n, V3(d.x, d.y, d.z).addScaledVector(n, -0.04));
      portalPlane.applyMatrix4(portalCam.matrixWorldInverse);
      obliqueNear(portalCam.projectionMatrix, portalPlane);
      portalCam.projectionMatrixInverse.copy(portalCam.projectionMatrix).invert();
      const sp = (d.spot && d.spot.meshes) || [];
      sp.forEach(hide);
      renderer.setRenderTarget(o.portal.rt);
      renderer.clear();
      renderer.render(scene, portalCam);
      renderer.setRenderTarget(null);
      o.portal.mat.uniforms.live.value = o.portal.rt.texture;
      o.portal.mat.uniforms.useLive.value = 1;
    }
    hidden.forEach((m) => { m.visible = true; });
    renderer.shadowMap.autoUpdate = sm;
  }

  function tryPrint() {
    if (!canAct()) return;
    const ph = L.photos[L.sel];
    if (!ph) { toast(L.photos.length ? 'That frame is empty.' : 'No photos yet. Click an orange object first.'); sfx('err'); return; }
    const pose = computePose(ph, isSnap());
    if (!pose.valid) { toast(WHY[pose.why] || WHY.blocked); sfx('err'); return; }
    const o = spawnObj({ kind: ph.kind, boxes: ph.boxes, scale: pose.scale, pos: [pose.pos.x, pose.pos.y, pose.pos.z], yaw: pose.yaw, printed: true, fixed: ph.fixed, spawn: ph.spawn, extra: ph.extra });
    if (ph.speed > 0.5 && o.dynamic) {
      // Action film: it remembers how fast it was going, and goes that fast the way you're looking
      const v = launchVel(ph.speed);
      o.body.velocity.set(v.x, v.y, v.z);
      o.body.wakeUp();
    }
    burst(o, false);
    printFX(o);
    if (ph.speed > 0.5 && o.dynamic) sfx('launch');
    L.photos.splice(L.sel, 1);
    if (ph.cardTex) { ph.cardTex.dispose(); ph.cardMat.dispose(); }
    L.sel = clamp(L.sel, 0, Math.max(0, L.photos.length - 1));
    ghost.key = '';
    renderStrip();
    sfx(o.fixed ? 'printBlue' : 'print');
    HAND.push(ph);
  }

  const isSnap = () => snapOn;
  const MAX_LAUNCH = 18;
  const launchVel = (speed) => V3(0, 0, -1).applyQuaternion(camQuat()).multiplyScalar(speed);

  function selectFrame(i) {
    if (!L) return;
    const n = Math.max(1, L.photos.length);
    L.sel = ((i % n) + n) % n;
    ghost.key = '';
    renderStrip();
  }

  function makeThumb() {
    if (NORENDER) { const c = document.createElement('canvas'); c.width = 4; c.height = 4; return c; }
    renderClean();
    const c = document.createElement('canvas');
    c.width = 264; c.height = 176;
    const src = renderer.domElement;
    const sh = src.height * 0.72, sw = Math.min(src.width, sh * 1.5);
    try { c.getContext('2d').drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, c.width, c.height); } catch (e) { /* ignore */ }
    return c;
  }

  function filmLabel(d) {
    const n = [d.motion && 'Action', d.postcard && 'Postcard', d.exposure && 'Slow', d.copy && 'Double-X', d.zoom && 'Zoom'].filter(Boolean);
    if (n.length > 1) return n.join(' + ');
    return d.motion ? 'Action 800' : d.postcard ? 'Postcard 100' : d.exposure ? 'Slow 25' : d.copy ? 'Double-X 400' : d.zoom ? 'Zoom 400' : 'Shutter 400';
  }
  let stripSeen = 0;
  function renderStrip() {
    if (!L) return;
    stripEl.textContent = '';
    let newest = stripSeen;
    for (let i = 0; i < L.film; i++) {
      const ph = L.photos[i];
      const fr = document.createElement('div');
      fr.className = 'frame' + (ph && i === L.sel ? ' sel' : '') + (ph && ph.fixed ? ' blue' : '') + (ph && ph.frame > stripSeen ? ' new' : '');
      if (ph) newest = Math.max(newest, ph.frame);
      if (ph) {
        fr.appendChild(ph.thumb);
        const dot = document.createElement('i');
        dot.className = 'dot';
        fr.appendChild(dot);
      } else { const e = document.createElement('div'); e.className = 'empty'; e.textContent = 'Unexposed'; fr.appendChild(e); }
      const no = document.createElement('span');
      no.className = 'fno';
      no.textContent = ph ? `${ph.frame}A` : '—';
      fr.appendChild(no);
      stripEl.appendChild(fr);
    }
    stripSeen = newest;
    filmCount.textContent = `${L.photos.length}/${L.film}`;
    filmName.textContent = filmEdge.textContent = filmLabel(L.def);
    const films = levelFilms(L.def), key = films.join('+');
    if (filmChip.dataset.films !== key) {
      filmChip.dataset.films = key;
      filmIco.innerHTML = films.map((k) => FILM_ICON[k]).join('');
      filmChip.style.setProperty('--film', FILMS[films[0]].color);
      filmChip.style.setProperty('--film2', FILMS[films[1] || films[0]].color);
      filmEl.style.setProperty('--film', FILMS[films[0]].color);
      filmChip.classList.toggle('special', films[0] !== 'shutter');
      filmEl.classList.toggle('special', films[0] !== 'shutter');
    }
  }

  // chamber title card: name, number, and a big badge for each special film (with its rule, every time)
  const seenFilms = new Set();
  try { (JSON.parse(localStorage.getItem('shutter.films') || '[]') || []).forEach((k) => seenFilms.add(k)); } catch (e) { /* ignore */ }
  let titleTimer = 0;
  function showTitle() {
    if (!L) return;
    const d = L.def, films = levelFilms(d);
    const roll = ROLLS[d.roll] ? ROLLS[d.roll][0] + ' · ' : '';
    tcEyebrow.textContent = `${roll}Chamber ${pad2(L.idx + 1)} of ${LEVELS.length}`;
    tcName.textContent = d.name;
    let html = '', fresh = false;
    for (const k of films) {
      if (k === 'shutter') continue;
      const f = FILMS[k], isNew = !seenFilms.has(k);
      if (isNew) { fresh = true; seenFilms.add(k); }
      html += `<div class="tc-film" style="--film:${f.color}"><span class="ico">${FILM_ICON[k]}</span><div><p class="tc-fname">${f.name}${isNew ? '<em>New film</em>' : ''}</p><p class="tc-rule">${f.rule}</p></div></div>`;
    }
    if (fresh) { try { localStorage.setItem('shutter.films', JSON.stringify(Array.from(seenFilms))); } catch (e) { /* ignore */ } }
    sfx(fresh ? 'newFilm' : 'title');
    tcFilms.innerHTML = html;
    titleCard.classList.toggle('special', !!html);
    titleCard.hidden = false;
    titleCard.classList.remove('out');
    replay(titleCard);
    hintEl.classList.add('faded');
    clearTimeout(titleTimer); clearTimeout(hintTimer);
    const ms = html ? (fresh ? 7000 : 4200) : 2200;
    titleTimer = setTimeout(() => {
      titleCard.classList.add('out');
      hintEl.classList.remove('faded');
      hintTimer = setTimeout(() => hintEl.classList.add('faded'), 18000);
    }, ms);
  }


  // ------------------------------------------------------------------ particles, rings, outlines, camera flash
  // Two point clouds carry every spark, mote and puff (glowing ones add light, dust is drawn normally), so a few
  // hundred particles cost two draw calls. Rings are flat bursts of light: a pad firing, a plate going down, a
  // door opening. Outlines are the wireframe of a print snapping into place, or of something being photographed.
  const FX = (function () {
    const dflt = (v, d) => (v === undefined ? d : v);
    const dotC = cnv(64), dg = dotC.getContext('2d'), grd = dg.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.28, 'rgba(255,255,255,0.62)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    dg.fillStyle = grd; dg.fillRect(0, 0, 64, 64);
    const dotTex = new T.CanvasTexture(dotC);
    let kpx = 500;
    function cloud(N, additive) {
      const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), siz = new Float32Array(N), alp = new Float32Array(N);
      const geo = new T.BufferGeometry();
      const at = (a, k) => { const b = new T.BufferAttribute(a, k); b.setUsage(T.DynamicDrawUsage); return b; };
      geo.setAttribute('position', at(pos, 3));
      geo.setAttribute('pcolor', at(col, 3));
      geo.setAttribute('psize', at(siz, 1));
      geo.setAttribute('palpha', at(alp, 1));
      geo.setDrawRange(0, 0);
      const mat = new T.ShaderMaterial({
        uniforms: { map: { value: dotTex }, k: { value: 500 } },
        vertexShader: [
          'attribute vec3 pcolor; attribute float psize; attribute float palpha;',
          'uniform float k; varying vec3 vC; varying float vA;',
          'void main() {',
          '  vC = pcolor; vA = palpha;',
          '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
          '  gl_PointSize = clamp(psize * k / max(0.05, -mv.z), 1.0, 220.0);',
          '  gl_Position = projectionMatrix * mv;',
          '}'].join('\n'),
        fragmentShader: [
          'uniform sampler2D map; varying vec3 vC; varying float vA;',
          'void main() {',
          '  float a = texture2D(map, gl_PointCoord).a * vA;',
          '  if (a < 0.003) discard;',
          '  gl_FragColor = vec4(vC, a);',
          '}'].join('\n'),
        transparent: true, depthWrite: false, blending: additive ? T.AdditiveBlending : T.NormalBlending,
      });
      const pts = new T.Points(geo, mat);
      pts.frustumCulled = false;
      pts.renderOrder = additive ? 7 : 6;
      pts.visible = !LOWFI;
      scene.add(pts);
      return { N, pos, col, siz, alp, geo, mat, pts, live: [], was: 0 };
    }
    const glow = cloud(LOWFI ? 1 : 1600, false), dust = cloud(LOWFI ? 1 : 500, false);
    const tc = new T.Color();
    function emit(c, x, y, z, o) {
      if (LOWFI) return;
      const n = dflt(o.n, 10), box = o.box, dir = o.dir, spread = dflt(o.spread, 1), speed = dflt(o.speed, 2), s0 = dflt(o.size, 0.08);
      tc.set(dflt(o.color, 0xffffff));
      for (let i = 0; i < n && c.live.length < c.N; i++) {
        let dx = Math.random() * 2 - 1, dy = Math.random() * 2 - 1, dz = Math.random() * 2 - 1;
        const l = Math.hypot(dx, dy, dz) || 1;
        dx /= l; dy /= l; dz /= l;
        if (dir) { dx = dir[0] + dx * spread; dy = dir[1] + dy * spread; dz = dir[2] + dz * spread; }
        if (o.flat) dy = Math.abs(dy) * 0.15;
        const sp = speed * (0.35 + Math.random() * 0.65);
        c.live.push({
          x: x + (box ? (Math.random() * 2 - 1) * box[0] : 0),
          y: y + (box ? (Math.random() * 2 - 1) * box[1] : 0),
          z: z + (box ? (Math.random() * 2 - 1) * box[2] : 0),
          vx: dx * sp, vy: dy * sp + dflt(o.up, 0), vz: dz * sp,
          t: 0, life: dflt(o.life, 0.8) * (0.6 + Math.random() * 0.6),
          s0, s1: dflt(o.size1, s0 * 0.35), r: tc.r, g: tc.g, b: tc.b, a: dflt(o.alpha, 1),
          grav: dflt(o.grav, 0), drag: dflt(o.drag, 1.5), floor: dflt(o.floor, null),
        });
      }
    }
    function stepCloud(c, dt) {
      const ps = c.live;
      let n = 0;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.t += dt;
        if (p.t >= p.life) continue;
        const dr = Math.exp(-p.drag * dt);
        p.vx *= dr; p.vz *= dr; p.vy = p.vy * dr - p.grav * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        if (p.floor !== null && p.y < p.floor) { p.y = p.floor; p.vy = Math.abs(p.vy) * 0.25; p.vx *= 0.5; p.vz *= 0.5; }
        const k = p.t / p.life, j = n * 3;
        c.pos[j] = p.x; c.pos[j + 1] = p.y; c.pos[j + 2] = p.z;
        c.col[j] = p.r; c.col[j + 1] = p.g; c.col[j + 2] = p.b;
        c.siz[n] = p.s0 + (p.s1 - p.s0) * k;
        c.alp[n] = p.a * Math.min(1, k * 10) * (1 - k);
        ps[n++] = p;
      }
      ps.length = n;
      c.geo.setDrawRange(0, n);
      if (n || c.was) {
        const a = c.geo.attributes;
        a.position.needsUpdate = true; a.pcolor.needsUpdate = true; a.psize.needsUpdate = true; a.palpha.needsUpdate = true;
      }
      c.was = n;
      c.mat.uniforms.k.value = kpx;
    }

    // rings of light
    const ringGeo = new T.RingGeometry(0.86, 1, 72), Z = new T.Vector3(0, 0, 1), rings = [];
    function ring(x, y, z, o) {
      if (LOWFI) return;
      let r = null;
      for (const q of rings) if (!q.on) { r = q; break; }
      if (!r) {
        if (rings.length >= 28) return;
        const m = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
        m.renderOrder = 7; m.visible = false; m.frustumCulled = false;
        scene.add(m);
        r = { m, on: false };
        rings.push(r);
      }
      r.on = true; r.t = 0; r.life = dflt(o.life, 0.6); r.r0 = dflt(o.r0, 0.25); r.r1 = dflt(o.r1, 1.4); r.a = dflt(o.alpha, 0.85);
      r.m.material.color.set(dflt(o.color, 0xffffff));
      r.m.position.set(x, y, z);
      if (o.normal) r.m.quaternion.setFromUnitVectors(Z, V3(o.normal[0], o.normal[1], o.normal[2]).normalize());
      else r.m.quaternion.setFromAxisAngle(V3(1, 0, 0), -Math.PI / 2);
      r.m.scale.setScalar(r.r0);
      r.m.material.opacity = 0;
      r.m.visible = shown;
    }
    function stepRings(dt) {
      for (const r of rings) {
        if (!r.on) continue;
        r.t += dt;
        const k = Math.min(1, r.t / r.life), e = 1 - Math.pow(1 - k, 3);
        r.m.scale.setScalar(r.r0 + (r.r1 - r.r0) * e);
        r.m.material.opacity = r.a * (1 - k) * (1 - k * 0.5);
        if (k >= 1) { r.on = false; r.m.visible = false; }
      }
    }

    // wireframe outlines that close onto a print, or open off something photographed
    const edgeGeo = new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), shells = [], _sv = new T.Vector3();
    function placeShell(s, f) {
      s.m.matrix.makeBasis(s.u[0], s.u[1], s.u[2]);
      s.m.matrix.scale(_sv.set(s.e[0] * 2 * f, s.e[1] * 2 * f, s.e[2] * 2 * f));
      s.m.matrix.setPosition(s.c);
      s.m.matrixWorldNeedsUpdate = true;
    }
    function outline(obbs, color, from, to, life) {
      if (LOWFI) return;
      for (const b of obbs) {
        let s = null;
        for (const q of shells) if (!q.on) { s = q; break; }
        if (!s) {
          if (shells.length >= 36) return;
          const m = new T.LineSegments(edgeGeo, new T.LineBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false }));
          m.matrixAutoUpdate = false; m.renderOrder = 7; m.visible = false; m.frustumCulled = false;
          scene.add(m);
          s = { m, on: false };
          shells.push(s);
        }
        s.on = true; s.t = 0; s.life = life; s.from = from; s.to = to;
        s.c = b.c.clone(); s.u = b.u.map((v) => v.clone()); s.e = b.e.slice();
        s.m.material.color.set(color);
        s.m.material.opacity = 1;
        s.m.visible = shown;
        placeShell(s, from);
      }
    }
    function stepShells(dt) {
      for (const s of shells) {
        if (!s.on) continue;
        s.t += dt;
        const k = Math.min(1, s.t / s.life), e = 1 - Math.pow(1 - k, 3);
        placeShell(s, s.from + (s.to - s.from) * e);
        s.m.material.opacity = 1 - k;
        if (k >= 1) { s.on = false; s.m.visible = false; }
      }
    }

    // the camera's flash really lights the room for a moment
    let flashK = 0, shown = true;
    const light = LOWFI ? null : new T.PointLight(0xfff4e6, 0, 18, 2);
    if (light) scene.add(light);

    function update(dt) {
      if (LOWFI) return;
      kpx = renderer.domElement.height / (2 * Math.tan((camera.fov * DEG) / 2));
      stepCloud(glow, dt); stepCloud(dust, dt); stepRings(dt); stepShells(dt);
      if (light) {
        light.position.copy(camera.position);
        light.intensity = flashK * flashK * 3.4;
        flashK = Math.max(0, flashK - dt * 5.5);
      }
    }
    function clear() {
      glow.live.length = 0; dust.live.length = 0;
      glow.geo.setDrawRange(0, 0); dust.geo.setDrawRange(0, 0);
      for (const r of rings) { r.on = false; r.m.visible = false; }
      for (const s of shells) { s.on = false; s.m.visible = false; }
      flashK = 0;
      if (light) light.intensity = 0;
    }
    // keep effects out of chamber previews and overview maps
    function setShown(v) {
      shown = v;
      glow.pts.visible = dust.pts.visible = v && !LOWFI;
      for (const r of rings) r.m.visible = v && r.on;
      for (const s of shells) s.m.visible = v && s.on;
      if (light) light.visible = v;
    }
    return {
      glow: (x, y, z, o) => emit(glow, x, y, z, o || {}),
      dust: (x, y, z, o) => emit(dust, x, y, z, o || {}),
      ring: (x, y, z, o) => ring(x, y, z, o || {}),
      outline, update, clear, setShown,
      flash(k) { if (!LOWFI) flashK = Math.max(flashK, k == null ? 1 : k); },
    };
  })();

  // a little shake for big moments (a hard landing, a pad, glass breaking nearby); none if you prefer less motion
  const CALM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let shakeK = 0, menuDrift = 0;
  function shake(k) { if (!CALM && !LOWFI) shakeK = Math.min(1, Math.max(shakeK, k)); }
  const INK_HEX = { orange: 0xf2a33a, blue: 0x52a8ff, card: 0xff62b0 };
  const inkOf = (o) => (o.kind === 'postcard' ? INK_HEX.card : o.fixed ? INK_HEX.blue : INK_HEX.orange);
  function boundsOf(o) {
    const bb = unionBounds(objObbs(o));
    return { c: bb.min.clone().add(bb.max).multiplyScalar(0.5), s: bb.max.clone().sub(bb.min), min: bb.min, max: bb.max };
  }
  // a print snaps into the world: its outline closes onto it, ink sparks fly off, a ring spreads from its base
  function printFX(o) {
    if (LOWFI || !L) return;
    const col = inkOf(o), b = boundsOf(o);
    FX.outline(objObbs(o), col, 1.4, 1.0, 0.36);
    FX.glow(b.c.x, b.c.y, b.c.z, { n: 26, color: col, speed: 2.4, drag: 3.2, life: 0.75, size: 0.075, box: [b.s.x / 2, b.s.y / 2, b.s.z / 2] });
    if (o.kind === 'postcard') {
      const nrm = V3(0, 0, 1).applyQuaternion(o.group.quaternion);
      FX.ring(b.c.x, b.c.y, b.c.z, { color: col, r0: 0.4, r1: 1.8, life: 0.55, normal: [nrm.x, nrm.y, nrm.z] });
    } else {
      const w = Math.max(b.s.x, b.s.z);
      FX.ring(b.c.x, b.min.y + 0.03, b.c.z, { color: col, r0: w * 0.45, r1: w * 0.9 + 0.9, life: 0.5, alpha: 0.7 });
    }
  }
  // the photographed thing flares white as it's taken
  function captureFX(o) {
    if (LOWFI || !L) return;
    const b = boundsOf(o), col = inkOf(o);
    FX.outline(objObbs(o), col, 1.0, 1.3, 0.3);
    FX.glow(b.c.x, b.c.y, b.c.z, { n: 18, color: col, speed: 1.6, drag: 3, life: 0.55, size: 0.065, box: [b.s.x / 2, b.s.y / 2, b.s.z / 2] });
  }
  function padFX(o, big) {
    if (LOWFI) return;
    const bp = o.body.position, top = bp.y + o.boxes[0].s[1] / 2 + 0.02, w = Math.max(o.boxes[0].s[0], o.boxes[0].s[2]);
    const col = o.fixed ? INK_HEX.blue : INK_HEX.orange;
    FX.ring(bp.x, top, bp.z, { color: col, r0: w * 0.4, r1: w * (big ? 1.6 : 1.1) + 0.4, life: 0.5 });
    FX.glow(bp.x, top, bp.z, { n: big ? 22 : 10, color: col, dir: [0, 1, 0], spread: 0.32, speed: big ? 6 : 3.5, grav: 7, drag: 0.6, life: 0.55, size: 0.065, box: [w * 0.4, 0, w * 0.4] });
  }
  function dustAt(x, y, z, k) {
    if (LOWFI) return;
    FX.dust(x, y, z, { n: Math.round(6 + 12 * k), color: 0x9da5aa, flat: true, speed: 1 + 1.6 * k, up: 0.25, drag: 3.2, life: 0.75, size: 0.16, size1: 0.5, alpha: 0.28 });
  }
  // the world's own sparkle: beams spitting where they land, motes rising through exits and photo spots,
  // grit carried up out of the void on its draught, warm dust drifting in light leaks
  function ambientFX(dt) {
    if (LOWFI || !L || !player) return;
    const pp = player.position, near = (x, z) => Math.abs(x - pp.x) < 26 && Math.abs(z - pp.z) < 26;
    for (const e of L.beamEnds) {
      if (!near(e.p.x, e.p.z)) continue;
      if (Math.random() < dt * 34) FX.glow(e.p.x, e.p.y, e.p.z, { n: 1, color: e.rec ? 0xfff0a0 : 0xff6a3a, dir: e.back, spread: 0.9, speed: 2.8, grav: 9, drag: 0.4, life: 0.42, size: 0.05, size1: 0.02 });
      if (Math.random() < dt * 10) FX.glow(e.p.x, e.p.y, e.p.z, { n: 1, color: e.rec ? 0xfff0a0 : 0xff4a2a, speed: 0.02, drag: 0, life: 0.18, size: 0.28, size1: 0.12, alpha: 0.55 });
    }
    for (const ex of L.exits) {
      if (!near(ex.x, ex.z) || Math.random() > dt * 7) continue;
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.42;
      FX.glow(ex.x + 0.5 + Math.cos(a) * r, ex.y + 0.1, ex.z + 0.5 + Math.sin(a) * r, { n: 1, color: 0xffc98a, speed: 0.04, up: 0.7, drag: 0, life: 2.8, size: 0.05, size1: 0.02, alpha: 0.9 });
    }
    if (L.def.postcard) {
      for (const sp of L.spots) {
        if (!near(sp.x, sp.z) || Math.random() > dt * 3.5) continue;
        FX.glow(sp.x + (Math.random() - 0.5) * 0.8, sp.y + 0.1, sp.z + (Math.random() - 0.5) * 0.8, { n: 1, color: INK_HEX.card, speed: 0.04, up: 0.55, drag: 0, life: 2.2, size: 0.05, size1: 0.015, alpha: 0.85 });
      }
    }
    for (const v of L.voids) {
      const w = v.max.x - v.min.x, d = v.max.z - v.min.z;
      if (Math.random() > dt * Math.min(5, w * d * 0.12)) continue;
      const x = v.min.x + Math.random() * w, z = v.min.z + Math.random() * d;
      if (!near(x, z)) continue;
      FX.dust(x, -1.5 + Math.random() * 1.5, z, { n: 1, color: 0x8d989e, speed: 0.05, up: 0.55, drag: 0.2, life: 3.2, size: 0.03, size1: 0.02, alpha: 0.32 });
    }
    for (const lk of L.leaks) {
      const w = lk.max.x - lk.min.x, h = lk.max.y - lk.min.y, d = lk.max.z - lk.min.z;
      if (Math.random() > dt * Math.min(14, w * h * d * 0.5)) continue;
      const x = lk.min.x + Math.random() * w, z = lk.min.z + Math.random() * d;
      if (!near(x, z)) continue;
      FX.glow(x, lk.min.y + Math.random() * h, z, { n: 1, color: 0xff8a3a, speed: 0.15, up: 0.12, drag: 0.5, life: 2, size: 0.05, size1: 0.02, alpha: 0.75 });
    }
  }

  // sparks that fly into the lens on capture, and out of it on print
  function burst(o, intoCamera) {
    if (LOWFI) return;
    const root = L.root, parts = [];
    const obbs = objObbs(o);
    for (let i = 0; i < 28; i++) {
      const b = obbs[i % obbs.length];
      const p = b.c.clone();
      for (let k = 0; k < 3; k++) p.addScaledVector(b.u[k], (Math.random() * 2 - 1) * b.e[k]);
      const m = new T.Mesh(GEO.spark, M.spark);
      m.position.copy(p);
      root.add(m);
      parts.push({ m, p, delay: Math.random() * 0.12 });
    }
    effects.push({
      t: 0, dur: 0.6,
      step() {
        const lens = eyePos().add(V3(0, -0.25, -0.4).applyQuaternion(camQuat()));
        for (const q of parts) {
          const k = clamp((this.t - q.delay) / 0.45, 0, 1), e = k * k * (3 - 2 * k);
          if (intoCamera) q.m.position.lerpVectors(q.p, lens, e);
          else q.m.position.lerpVectors(lens, q.p, e);
          q.m.scale.setScalar(intoCamera ? 1 - e * 0.85 : 0.2 + e * 0.8);
          q.m.visible = intoCamera ? k < 1 : k > 0 && k < 1;
        }
      },
      end() { parts.forEach((q) => root.remove(q.m)); },
    });
  }

  // ------------------------------------------------------------------ ghost preview
  const ghost = { group: new T.Group(), key: '', meshes: [] };
  scene.add(ghost.group);
  function makeLine(color, n) {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(new Float32Array(n * 3), 3));
    const l = new T.LineSegments(g, new T.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    l.frustumCulled = false;
    l.visible = false;
    scene.add(l);
    return l;
  }
  // draw a list of segments [[a, b], ...] (paths can jump, through postcards)
  function setSegs(l, segs) {
    const a = l.geometry.attributes.position, n = Math.min(segs.length, Math.floor(a.count / 2));
    for (let i = 0; i < n; i++) { const [p, q] = segs[i]; a.setXYZ(2 * i, p.x, p.y, p.z); a.setXYZ(2 * i + 1, q.x, q.y, q.z); }
    a.needsUpdate = true;
    l.geometry.setDrawRange(0, n * 2);
    l.visible = n > 0;
  }
  const toSegs = (paths) => { const out = []; for (const pts of paths) for (let i = 1; i < pts.length; i++) out.push([pts[i - 1], pts[i]]); return out; };
  ghost.beam = makeLine(0xff3b5c, 40);
  ghost.drop = makeLine(0xffffff, 2);
  ghost.drop.material.opacity = 0.5;
  ghost.arc = makeLine(0xffb347, 240);
  // a dotted trail along the flight path, easier to see against white walls than a hairline
  ghost.dots = [];
  {
    const dg = new T.SphereGeometry(0.045, 10, 8), dm = new T.MeshBasicMaterial({ color: 0xff9a2e, toneMapped: false });
    for (let i = 0; i < 96; i++) { const m = new T.Mesh(dg, dm); m.visible = false; scene.add(m); ghost.dots.push(m); }
  }
  function placeDots(paths, gap) {
    let k = 0;
    for (const pts of paths) {
      let carry = gap * 0.5;
      for (let i = 1; i < pts.length && k < ghost.dots.length; i++) {
        const a = pts[i - 1], b = pts[i], len = a.distanceTo(b);
        while (carry <= len && k < ghost.dots.length) {
          const m = ghost.dots[k++];
          m.position.lerpVectors(a, b, carry / len);
          m.visible = true;
          carry += gap;
        }
        carry -= len;
      }
    }
    for (; k < ghost.dots.length; k++) ghost.dots[k].visible = false;
  }
  // laser previews: thick glowing segments with bright dots streaming the way the light goes
  ghost.lz = { cores: [], dots: [], end: null,
    core: new T.MeshBasicMaterial({ color: 0xff5c7a, transparent: true, opacity: 0.55, depthWrite: false, blending: T.AdditiveBlending, toneMapped: false }),
    dot: new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }) };
  {
    const dg = new T.SphereGeometry(0.07, 10, 8);
    for (let i = 0; i < 160; i++) { const m = new T.Mesh(dg, ghost.lz.dot); m.visible = false; scene.add(m); ghost.lz.dots.push(m); }
    for (let i = 0; i < 20; i++) { const m = new T.Mesh(GEO.unit, ghost.lz.core); m.visible = false; m.renderOrder = 8; scene.add(m); ghost.lz.cores.push(m); }
    ghost.lz.end = new T.Mesh(new T.RingGeometry(0.16, 0.3, 32), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
    ghost.lz.end.visible = false;
    ghost.lz.end.renderOrder = 9;
    scene.add(ghost.lz.end);
  }
  function hideLaser() { ghost.lz.cores.forEach((m) => { m.visible = false; }); ghost.lz.dots.forEach((m) => { m.visible = false; }); ghost.lz.end.visible = false; }
  function drawLaser(segs, lit) {
    const lz = ghost.lz, col = lit ? 0x61e294 : 0xff5c7a;
    lz.core.color.set(col);
    lz.dot.color.set(lit ? 0xd8ffe8 : 0xffe1e8);
    let k = 0, j = 0, carry = (time * 2.4) % 0.32;
    for (const [a, b] of segs) {
      const len = a.distanceTo(b);
      if (len < 0.01) continue;
      if (k < lz.cores.length) {
        const m = lz.cores[k++];
        m.position.lerpVectors(a, b, 0.5);
        m.lookAt(b);
        m.scale.set(0.09, 0.09, len);
        m.visible = true;
      }
      // dots flow from the source onward, so the direction of travel is obvious
      for (let t = carry; t < len && j < lz.dots.length; t += 0.32) {
        const d = lz.dots[j++];
        d.position.lerpVectors(a, b, t / len);
        d.visible = true;
      }
      carry = (carry + 0.32 - (len % 0.32)) % 0.32;
    }
    for (; k < lz.cores.length; k++) lz.cores[k].visible = false;
    for (; j < lz.dots.length; j++) lz.dots[j].visible = false;
    const last = segs[segs.length - 1];
    if (last) {
      const e = lz.end, dir = last[1].clone().sub(last[0]).normalize();
      e.position.copy(last[1]).addScaledVector(dir, -0.03);
      e.lookAt(last[1].clone().add(dir));
      e.material.color.set(lit ? 0x61e294 : 0xffffff);
      e.scale.setScalar(1 + 0.15 * Math.sin(time * 8));
      e.visible = true;
    }
  }
  ghost.hit = new T.Mesh(new T.RingGeometry(0.14, 0.26, 32), M.arcHit);
  ghost.hit.renderOrder = 9;
  ghost.hit.visible = false;
  scene.add(ghost.hit);
  ghost.valid = false;

  function updateGhost(dt = 1 / 60) {
    const ph = L && L.photos[L.sel];
    if (ph) {
      // (anything that set the distance directly wins; otherwise ease toward where you scrolled it)
      if (ph.distGoal === undefined || ph.dist !== ph.distSet) ph.distGoal = ph.dist;
      ph.dist += (ph.distGoal - ph.dist) * (1 - Math.exp(-16 * dt));
      if (Math.abs(ph.distGoal - ph.dist) < 1e-4) ph.dist = ph.distGoal;
      ph.distSet = ph.dist;
    }
    if (!ph || !running || transition) {
      ghost.group.visible = ghost.beam.visible = ghost.drop.visible = ghost.arc.visible = ghost.hit.visible = false;
      for (const m of ghost.dots) m.visible = false;
      hideLaser();
      ghost.valid = false;
      ghost.pose = null;
      return;
    }
    const pose = computePose(ph, isSnap());
    ghost.valid = pose.valid;
    ghost.pose = pose;
    const key = ph.id + ':' + pose.valid;
    if (key !== ghost.key) {
      ghost.key = key;
      ghost.group.clear();
      ghost.meshes = [];
      for (const b of ph.boxes) {
        const m = new T.Mesh(objBoxGeo(b.s), pose.valid ? (ph.fixed ? M.ghostFixed : M.ghostOk) : M.ghostBad);
        m.position.set(b.c[0], b.c[1], b.c[2]);
        if (b.reflect) m.userData.ghostMirror = true;
        const e = new T.LineSegments(objEdgeGeo(b.s), M.ghostEdge);
        e.position.copy(m.position);
        ghost.group.add(m, e);
        ghost.meshes.push(m);
      }
      if (ph.kind === 'postcard' && ph.extra && ph.extra.card) {
        // preview the picture side, so you can see which way the doorway faces
        if (!ph.cardTex) {
          ph.cardTex = new T.CanvasTexture(ph.extra.card);
          ph.cardTex.encoding = T.sRGBEncoding;
          ph.cardMat = new T.MeshBasicMaterial({ map: ph.cardTex, transparent: true, opacity: 0.72, depthWrite: false, toneMapped: false });
        }
        const pic = new T.Mesh(GEO.cardFace, ph.cardMat);
        pic.position.set(0, 0, 0.052);
        ghost.group.add(pic);
      }
      if (ph.kind === 'emitter') {
        const lens = new T.Mesh(GEO.lens, M.ghostBad);
        lens.position.set(0, 0, -0.55);
        lens.rotation.x = Math.PI / 2;
        ghost.group.add(lens);
      }
    }
    ghost.group.visible = true;
    ghost.group.position.copy(pose.pos);
    ghost.group.quaternion.copy(pose.quat);
    ghost.group.scale.setScalar(pose.scale);
    ghost.group.updateMatrixWorld(true);
    const pulse = 0.26 + 0.1 * Math.sin(time * 6);
    M.ghostOk.opacity = M.ghostFixed.opacity = pulse; M.ghostBad.opacity = pulse + 0.05;
    M.ghostEdge.color.set(pose.valid ? (ph.fixed ? 0x2f6fc4 : 0xd9780f) : 0xff3b5c);

    ghost.beam.visible = false;
    let lasered = false;
    if (pose.valid && ph.kind === 'emitter') {
      const dir = V3(0, 0, -1).applyQuaternion(pose.quat);
      const tr = traceBeam(pose.pos.clone().addScaledVector(dir, 0.5 * pose.scale + 0.02), dir, beamTargets());
      drawLaser(tr.segs, !!tr.rec);
      lasered = true;
    } else if (pose.valid && ph.kind === 'mirror') {
      const targets = beamTargets();
      for (const o of L.objs) {
        if (o.kind !== 'emitter') continue;
        const r = emitterRay(o);
        const tr = traceBeam(r.origin, r.dir, targets, ghost.meshes);
        if (tr.touched) { drawLaser(tr.segs, !!tr.rec); lasered = true; break; }
      }
    }
    if (!lasered) hideLaser();
    ghost.drop.visible = ghost.arc.visible = ghost.hit.visible = false;
    ghost.firstHit = null;
    let dotted = false;
    if (pose.valid && !ph.fixed && ph.speed > 0.5) {
      // Where it will fly, worked out the way the real throw goes: the whole box moves along a ballistic path (with
      // the same air drag), and it stops the moment the box would touch anything, using the same overlap test as
      // printing. A postcard takes it in by the same rule the real one uses (its centre inside the picture, moving
      // into it), and it comes out exactly where and how the real one comes out. Glass it hits hard enough smashes,
      // and it flies on at the speed the real one keeps, so the arc shows where it ends up beyond the window.
      const boxes = scaleBoxes(ph.boxes, pose.scale), quat = pose.quat.clone();
      const half = boxes.reduce((m, bx) => Math.max(m, Math.abs(bx.c[1]) + bx.s[1] / 2), 0);
      const minExt = boxes.reduce((m, bx) => Math.min(m, bx.s[0], bx.s[1], bx.s[2]), Infinity);
      const ds = clamp(minExt * 0.6, 0.06, 0.22);
      const cards = L.objs.filter((o) => o.kind === 'postcard' && o.dest);
      let p = pose.pos.clone(), pts = [p.clone()], through = 0, cool = 0, ended = false, sliding = false;
      ghost.firstHit = null;
      const v = launchVel(ph.speed), paths = [pts], smashed = [];
      const free = (q) => !blocked(obbsFrom(boxes, q, quat), null, false, false, smashed);
      // the unbroken glass the box would be touching at q, and whether it is going fast enough into each to smash it
      const glassAt = (q) => {
        if (!L.panes.length) return [];
        const cand = shrink(obbsFrom(boxes, q, quat)), cb = unionBounds(cand);
        return L.panes.filter((pn) => !pn.broken && !smashed.includes(pn) && aabbOverlap(cb, pn) && cand.some((c) => obbObb(c, aabbObb(pn.min, pn.max))));
      };
      // it smashes if it hits the glass hard enough: going fast enough along the way the two push apart, which is
      // the way they overlap least (as the physics sees it). A crate that only clips the edge of a pane is going
      // sideways to it, not into it, so that pane holds.
      const smashes = (pn, at) => {
        const bb = unionBounds(shrink(obbsFrom(boxes, at, quat)));
        const ov = [Math.min(bb.max.x, pn.max.x) - Math.max(bb.min.x, pn.min.x), Math.min(bb.max.y, pn.max.y) - Math.max(bb.min.y, pn.min.y),
          Math.min(bb.max.z, pn.max.z) - Math.max(bb.min.z, pn.min.z)];
        const k = ov[0] <= ov[1] && ov[0] <= ov[2] ? 0 : ov[1] <= ov[2] ? 1 : 2;
        return Math.abs(k === 0 ? v.x : k === 1 ? v.y : v.z) >= BREAK_V;
      };
      for (let t = 0, n = 0; t < 4.5 && n < 1200; n++) {
        const sp = Math.max(1e-3, v.length()), dt = Math.min(1 / 60, ds / sp);
        let np;
        if (sliding) {
          // skidding along a floor: friction slows it until it stops, or it slides off an edge and falls again
          const hs = Math.hypot(v.x, v.z), dec = 0.45 * GRAV * dt;
          if (hs <= dec + 0.04) {
            pts.push(p.clone());
            ghost.hit.visible = true;
            ghost.hit.position.set(p.x, p.y - half + 0.02, p.z);
            ghost.hit.lookAt(p.x, p.y + 1, p.z);
            ended = true;
            break;
          }
          v.x *= (hs - dec) / hs; v.z *= (hs - dec) / hs; v.y = 0;
          np = p.clone().addScaledVector(v, dt);
          if (free(V3(np.x, np.y - 0.06, np.z))) sliding = false;
        } else {
          np = p.clone().addScaledVector(v, dt);
          np.y -= 0.5 * GRAV * dt * dt;
          v.y -= GRAV * dt;
        }
        v.multiplyScalar(Math.pow(1 - 0.05, dt));
        t += dt;
        if (!free(np)) {
          // glass in the way, hit hard enough to smash: it breaks, and the throw carries on a little slower
          const gl = glassAt(np).filter((pn) => smashes(pn, np));
          if (gl.length) {
            smashed.push(...gl);
            if (!ghost.firstHit) ghost.firstHit = np.clone();
            v.multiplyScalar(0.8);
          }
        }
        if (!free(np) && !sliding && v.y < 0 && free(V3(np.x, p.y, np.z))) {
          // it comes down on something: it lands, loses some speed to the bump, and skids on
          const hs = Math.hypot(v.x, v.z), k = hs > 1e-6 ? Math.max(0, hs - 0.45 * Math.abs(v.y)) / hs : 0;
          v.x *= k; v.z *= k; v.y = 0;
          np = V3(np.x, p.y, np.z);
          sliding = true;
          if (!ghost.firstHit) ghost.firstHit = V3(np.x, np.y - half, np.z);
        }
        if (!free(np)) {
          if (!ghost.firstHit) ghost.firstHit = np.clone();
          // it lands against something: mark the surface where the box meets it
          const dir = np.clone().sub(p).normalize();
          rc.set(p, dir); rc.near = 0; rc.far = 3;
          const h = rc.intersectObjects(solidTargets(), false).find((q) => !(q.object.userData.obj && q.object.userData.obj.kind === 'postcard'));
          pts.push(np);
          ghost.hit.visible = true;
          if (h && h.distance < 2) {
            ghost.hit.position.copy(h.point);
            const nrm = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : V3(0, 1, 0);
            ghost.hit.lookAt(h.point.clone().add(nrm));
            ghost.hit.position.addScaledVector(nrm, 0.02);
          } else { ghost.hit.position.copy(np); ghost.hit.lookAt(np.clone().sub(dir)); }
          ended = true;
          break;
        }
        pts.push(np);
        p = np;
        if (cool > 0) { cool -= dt; continue; }
        for (const c of cards) {
          const k = c.scale, lc = cardLocal(c, p), vin = v.clone().applyQuaternion(objQuat(c).invert());
          if (Math.abs(lc.x) < 0.55 * k - 0.08 && lc.z < 0.2 && lc.z > -0.4 && Math.abs(lc.y) < k && vin.z < 0.5 && through < 3) {
            through++;
            const pm = portalMap(c), d = c.dest;
            p = p.clone().applyMatrix4(pm.m);
            p.addScaledVector(V3(-Math.sin(d.yaw), 0, -Math.cos(d.yaw)), 0.45);
            p.y = Math.max(p.y, d.y + half + 0.02);
            v.applyQuaternion(pm.q);
            quat.premultiply(pm.q);
            pts = [p.clone()];
            paths.push(pts);
            cool = 0.4;
            break;
          }
        }
      }
      if (!ended) ghost.hit.visible = false;
      setSegs(ghost.arc, toSegs(paths));
      placeDots(paths, 0.32);
      ghost.lastPaths = paths;
      dotted = true;
    } else if (pose.valid && !ph.fixed) {
      // orange prints fall, so show where this one will drop to
      const bottom = unionBounds(obbsFrom(scaleBoxes(ph.boxes, pose.scale), pose.pos, pose.quat)).min.y;
      const from = V3(pose.pos.x, bottom, pose.pos.z);
      rc.set(from, V3(0, -1, 0)); rc.near = 0; rc.far = 40;
      const hit = rc.intersectObjects(beamTargets(), false)[0];
      if (hit && hit.distance > 0.08) setSegs(ghost.drop, [[from, hit.point]]);
    }
    if (!dotted) for (const m of ghost.dots) m.visible = false;
  }

  // ------------------------------------------------------------------ beams
  const rc = new T.Raycaster();
  function beamTargets() {
    const t = L.rayStatic.slice();
    for (const d of L.doors) if (!d.open) for (const m of d.blades) t.push(m);
    for (const p of L.panes) if (!p.broken && p.frosted) t.push(p.mesh);
    for (const o of L.objs) for (const m of o.meshes) t.push(m);
    return t;
  }
  // everything a flying print can hit
  function solidTargets() {
    const t = sightTargets();
    for (const o of L.objs) for (const m of o.meshes) t.push(m);
    return t;
  }
  // what stops a print from being seen: walls, closed doors and every kind of glass
  function sightTargets() {
    const t = L.rayStatic.slice();
    for (const d of L.doors) if (!d.open) for (const m of d.blades) t.push(m);
    for (const g of L.glass) t.push(g);
    for (const p of L.panes) if (!p.broken) t.push(p.mesh);
    return t;
  }
  function smothered(em, p) {
    for (const o of L.objs) {
      if (o === em || o.ghostly) continue;
      for (const b of objObbs(o)) {
        const d = p.clone().sub(b.c);
        if (Math.abs(d.dot(b.u[0])) < b.e[0] && Math.abs(d.dot(b.u[1])) < b.e[1] && Math.abs(d.dot(b.u[2])) < b.e[2]) return true;
      }
    }
    return false;
  }
  function emitterRay(o) {
    const dir = V3(0, 0, -1).applyQuaternion(objQuat(o)).normalize();
    // start just outside the emitter's face, so anything pressed right up against it blocks the beam
    return { origin: objPos(o).addScaledVector(dir, 0.5 * o.scale + 0.02), dir };
  }
  // a beam's path as separate segments: it bends at mirrors and jumps through postcards
  function traceBeam(origin, dir, targets, extra) {
    const segs = [];
    let o = origin.clone();
    const d = dir.clone();
    let rec = null, touched = false, through = 0;
    const list = extra ? targets.concat(extra) : targets;
    for (let i = 0; i < 16; i++) {
      rc.set(o, d); rc.near = 0; rc.far = 90;
      const hit = rc.intersectObjects(list, false)[0];
      if (!hit) { segs.push([o.clone(), o.clone().addScaledVector(d, 90)]); break; }
      segs.push([o.clone(), hit.point.clone()]);
      const ud = hit.object.userData;
      if (ud.receptor) { rec = ud.receptor; break; }
      const mirror = ud.reflective || ud.ghostMirror;
      if (mirror && hit.face && Math.abs(hit.face.normal.z) > 0.9) {
        if (ud.ghostMirror) touched = true;
        const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
        d.addScaledVector(n, -2 * d.dot(n)).normalize();
        o = hit.point.clone().addScaledVector(d, 0.02);
        continue;
      }
      const card = cardFront(hit);
      if (card && through < 4) {
        // into the picture side of a postcard: out of the photo spot, same offset, same angle
        through++;
        const pm = portalMap(card);
        o = hit.point.clone().applyMatrix4(pm.m);
        d.applyQuaternion(pm.q).normalize();
        o.addScaledVector(d, 0.06);
        continue;
      }
      break;
    }
    return { segs, rec, touched };
  }
  // the picture side of a printed postcard, if that's what a ray hit
  function cardFront(hit) {
    const o = hit.object.userData.obj;
    return o && o.kind === 'postcard' && o.dest && hit.face && hit.face.materialIndex === 4 ? o : null;
  }
  // where a point and a direction come out when they go into a postcard: the card's bottom-centre maps onto the spot
  const _pq = new T.Quaternion();
  function portalMap(card) {
    const d = card.dest, m = new T.Matrix4().compose(V3(d.x, d.y, d.z), yawQuat(d.yaw), _one);
    m.multiply(cardFrame(card, new T.Matrix4()).invert());
    return { m, q: yawQuat(d.yaw - objYaw(card)) };
  }
  function placeSeg(i, a, b, flick) {
    let s = L.beamPool[i];
    if (!s) {
      s = { core: new T.Mesh(GEO.unit, M.beam), glow: new T.Mesh(GEO.unit, M.beamGlow) };
      L.root.add(s.core, s.glow);
      L.beamPool[i] = s;
    }
    const len = a.distanceTo(b);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    for (const [m, th] of [[s.core, 0.035], [s.glow, 0.14 * flick]]) {
      m.visible = len > 0.01;
      m.position.copy(mid);
      m.lookAt(b);
      m.scale.set(th, th, Math.max(0.01, len));
    }
  }
  function updateBeams() {
    for (const r of L.receptors) r.lit = false;
    L.beamSegs.length = 0;
    L.beamEnds.length = 0;
    let k = 0;
    const targets = beamTargets();
    for (const o of L.objs) {
      if (o.kind !== 'emitter') continue;
      const r = emitterRay(o);
      // something printed right against the lens smothers the beam
      if (smothered(o, r.origin)) continue;
      const tr = traceBeam(r.origin, r.dir, targets);
      if (tr.rec) tr.rec.lit = true;
      const last = tr.segs[tr.segs.length - 1];
      if (last) { const bk = last[0].clone().sub(last[1]).normalize(); L.beamEnds.push({ p: last[1].clone(), rec: !!tr.rec, back: [bk.x, bk.y, bk.z] }); }
      tr.segs.forEach(([a, b], i) => {
        placeSeg(k++, a, b, 1 + Math.sin(time * 40 + i) * 0.1);
        L.beamSegs.push([a, b]);
      });
    }
    for (; k < L.beamPool.length; k++) { L.beamPool[k].core.visible = false; L.beamPool[k].glow.visible = false; }
  }
  function segSegDist(p1, q1, p2, q2) {
    const d1 = q1.clone().sub(p1), d2 = q2.clone().sub(p2), r = p1.clone().sub(p2);
    const a = d1.dot(d1), e = d2.dot(d2), f = d2.dot(r);
    let s = 0, t = 0;
    if (a <= 1e-9 && e <= 1e-9) return p1.distanceTo(p2);
    if (a <= 1e-9) { t = clamp(f / e, 0, 1); }
    else {
      const c = d1.dot(r);
      if (e <= 1e-9) { s = clamp(-c / a, 0, 1); }
      else {
        const b = d1.dot(d2), den = a * e - b * b;
        s = den !== 0 ? clamp((b * f - c * e) / den, 0, 1) : 0;
        t = (b * s + f) / e;
        if (t < 0) { t = 0; s = clamp(-c / a, 0, 1); }
        else if (t > 1) { t = 1; s = clamp((b - c) / a, 0, 1); }
      }
    }
    return p1.clone().addScaledVector(d1, s).distanceTo(p2.clone().addScaledVector(d2, t));
  }
  function beamHitsPlayer() {
    const p = player.position;
    const A = V3(p.x, p.y + PR, p.z), Bp = V3(p.x, p.y + PH - PR, p.z);
    for (const [a, b] of L.beamSegs) if (segSegDist(a, b, A, Bp) < PR + 0.04) return true;
    return false;
  }

  // ------------------------------------------------------------------ physics step
  function physicsStep(h) {
    P.prev.set(player.position.x, player.position.y, player.position.z);
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const ar = SET.arrows === 'move';
    const fw = (keys.KeyW || (ar && keys.ArrowUp) ? 1 : 0) - (keys.KeyS || (ar && keys.ArrowDown) ? 1 : 0);
    const st = (keys.KeyD || (ar && keys.ArrowRight) ? 1 : 0) - (keys.KeyA || (ar && keys.ArrowLeft) ? 1 : 0);
    let ix = fx * fw + rx * st, iz = fz * fw + rz * st;
    const len = Math.hypot(ix, iz);
    if (len > 0) { ix /= len; iz /= len; }
    P.wish.set(ix, 0, iz);
    const v = player.velocity;
    const k = 1 - Math.exp(-(P.onGround ? 16 : 4.5) * h);
    const cv = P.carry && P.onGround ? P.carry.velocity : null;
    v.x += (ix * SPEED + (cv ? cv.x : 0) - v.x) * k;
    v.z += (iz * SPEED + (cv ? cv.z : 0) - v.z) * k;
    if (v.y < -FALL_VT) v.y = -FALL_VT;
    P.coyote = P.onGround ? 0.1 : P.coyote - h;
    P.jumpBuf -= h; P.jumpLock -= h; P.padCool -= h; P.stepCool -= h;
    if (P.jumpBuf > 0 && P.coyote > 0) {
      v.y = JUMP; P.jumpBuf = 0; P.coyote = 0; P.jumpLock = 0.12; P.onGround = false; P.wasGround = false; P.jumpKick = 1;
      sfx('jump');
    }

    world.step(h);
    for (const pane of L.panes) if (pane.hitBy && !pane.broken) shatter(pane);
    if (L.chutes.length) updateChutes(h);
    for (const o of L.objs) if (o.track) moveShuttle(o, h);
    if (P.cardCool > 0) P.cardCool -= h;
    for (const o of L.objs) if (o.kind === 'postcard') { if (throughCard(o)) break; }

    let ground = false, groundObj = null;
    P.carry = null;
    for (const c of world.contacts) {
      let other, ny;
      if (c.bi === player) { other = c.bj; ny = -c.ni.y; }
      else if (c.bj === player) { other = c.bi; ny = c.ni.y; }
      else { crateOnPad(c); continue; }
      if (other.obj && other.obj.dynamic) other.obj.shovedAt = time;
      if (ny > 0.5) {
        ground = true;
        if (other.obj) { if (!groundObj) groundObj = other.obj; if (other.obj.track) P.carry = other; }
      }
    }
    P.onGround = ground && P.jumpLock <= 0;
    if (P.onGround) { P.support = groundObj; P.airCeil = player.position.y; }
    if (!P.onGround) P.airVy = Math.min(P.airVy || 0, player.velocity.y);
    else {
      // (the rig in your hands feels every landing)
      if (!P.wasGround && P.airVy < -2) P.landKick = -P.airVy;
      if (!P.wasGround && P.airVy < -4.5) {
        sfx('land', Math.min(1, (-P.airVy - 4) / 12));
        if (P.airVy < -7) { const q = player.position; dustAt(q.x, q.y + 0.04, q.z, Math.min(1, (-P.airVy - 6) / 10)); shake(Math.min(0.6, (-P.airVy - 6) / 14)); }
      }
      P.airVy = 0;
    }
    P.wasGround = P.onGround;

    // jump pads: anything standing or landing on the top face gets launched
    if (P.padCool <= 0) {
      const p = player.position;
      for (const o of L.objs) {
        if (o.kind !== 'pad') continue;
        const bp = o.body.position, hs = o.boxes[0].s, top = bp.y + hs[1] / 2;
        const loc = V3(p.x - bp.x, 0, p.z - bp.z).applyQuaternion(objQuat(o).invert());
        // (a generous window above the top, so stepping up onto a pad launches you there and then)
        if (Math.abs(loc.x) < hs[0] / 2 + 0.12 && Math.abs(loc.z) < hs[2] / 2 + 0.12 && p.y > top - 0.12 && p.y < top + 0.6 && player.velocity.y < 2.5) {
          // a pad's bounce scales with its size: model pads hop, giant ones fling you
          const pv = padSpeed(o, PAD_V);
          player.velocity.y = pv;
          P.padCool = 0.35; P.jumpLock = 0.25; P.onGround = false;
          P.airCeil = Math.max(P.airCeil, p.y + (pv * pv) / (2 * GRAV));
          o.flash = 1;
          sfx('pad');
          padFX(o, true);
          shake(0.3);
          break;
        }
      }
    }
  }

  // bounce height grows with a pad's size (height ∝ scale), within limits
  const padSpeed = (o, v) => v * Math.sqrt(clamp(o.scale || 1, 0.25, 2));
  function crateOnPad(c) {
    let pad = null, crate = null, ny = 0;
    if (c.bi.obj && c.bi.obj.kind === 'pad' && c.bj.obj && c.bj.obj.dynamic) { pad = c.bi; crate = c.bj; ny = c.ni.y; }
    else if (c.bj.obj && c.bj.obj.kind === 'pad' && c.bi.obj && c.bi.obj.dynamic) { pad = c.bj; crate = c.bi; ny = -c.ni.y; }
    if (pad && ny > 0.5 && crate.velocity.y < padSpeed(pad.obj, CRATE_PAD_V) * 0.5) {
      crate.velocity.y = padSpeed(pad.obj, CRATE_PAD_V);
      pad.obj.flash = 1;
      sfx('pad');
      padFX(pad.obj, false);
    }
  }

  // small ledges (plank edges, pads, trenches) get a little hop instead of a hard stop
  const stepRay = new T.Raycaster();
  function stepAssist() {
    if (!P.onGround || P.stepCool > 0 || P.wish.lengthSq() < 0.01) return;
    const p = player.position, targets = beamTargets();
    stepRay.set(V3(p.x, p.y + 0.1, p.z), P.wish);
    stepRay.near = 0; stepRay.far = PR + 0.22;
    if (!stepRay.intersectObjects(targets, false).length) return;
    stepRay.set(V3(p.x, p.y + 0.62, p.z).addScaledVector(P.wish, PR + 0.12), V3(0, -1, 0));
    stepRay.far = 0.62;
    const top = stepRay.intersectObjects(targets, false)[0];
    if (!top) return;
    const dh = top.point.y - p.y;
    if (dh > 0.03 && dh <= 0.52) {
      player.velocity.y = Math.sqrt(2 * GRAV * (dh + 0.1));
      P.stepCool = 0.2;
      P.jumpLock = 0.08;
    }
  }

  let lastThud = 0;
  function onCrateHit(e) {
    const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
    if (v > 2.5 && time - lastThud > 0.08) {
      lastThud = time; sfx('thud', Math.min(1, v / 10));
      if (v > 3.5 && !LOWFI && e.contact && e.contact.bi) { const c = e.contact, q = c.bi.position, r = c.ri; dustAt(q.x + r.x, q.y + r.y, q.z + r.z, Math.min(1, v / 12)); }
    }
  }

  // ------------------------------------------------------------------ world logic
  function updateSignals(dt) {
    const sig = L.sig;
    for (const k in sig) delete sig[k];
    const pp = player.position;
    for (const p of L.plates) {
      let on = Math.abs(pp.x - (p.x + 0.5)) < 0.55 && Math.abs(pp.z - (p.z + 0.5)) < 0.55 && pp.y - p.y < 0.4 && pp.y - p.y > -0.2;
      if (!on) {
        const slab = aabbObb(V3(p.x + 0.15, p.y, p.z + 0.15), V3(p.x + 0.85, p.y + 0.3, p.z + 0.85));
        on = L.objs.some((o) => objObbs(o).some((b) => obbObb(b, slab)));
      }
      if (on !== p.on) {
        p.on = on; sfx(on ? 'click' : 'unclick');
        if (on) { FX.ring(p.x + 0.5, p.y + 0.06, p.z + 0.5, { color: 0x61e294, r0: 0.35, r1: 1.25, life: 0.5 }); FX.glow(p.x + 0.5, p.y + 0.08, p.z + 0.5, { n: 10, color: 0x61e294, dir: [0, 1, 0], spread: 0.6, speed: 1.6, drag: 1.2, life: 0.7, size: 0.05, box: [0.35, 0, 0.35] }); }
      }
      sig[p.id] = sig[p.id] || on;
      p.mat.emissive.lerp(on ? C_SIG_ON : C_SIG_OFF, 1 - Math.exp(-12 * dt));
      p.mesh.position.y = p.y + (on ? 0.015 : 0.03);
    }
    for (const r of L.receptors) {
      if (r.lit !== r.was) {
        if (r.was !== undefined) {
          sfx(r.lit ? 'lit' : 'unlit');
          if (r.lit) { const q = r.mesh.position; FX.ring(q.x, q.y, q.z, { color: 0x61e294, r0: 0.7, r1: 1.9, life: 0.55 }); FX.glow(q.x, q.y, q.z, { n: 18, color: 0x9dffc2, speed: 3, drag: 2.5, life: 0.6, size: 0.06, box: [0.5, 0.5, 0.5] }); }
        }
        r.was = r.lit;
      }
      sig[r.id] = sig[r.id] || r.lit;
      r.mat.emissive.lerp(r.lit ? C_SIG_ON : C_SIG_OFF, 1 - Math.exp(-12 * dt));
    }
  }

  function doorBlocked(d) {
    if (aabbOverlap({ min: d.min, max: d.max }, playerBox())) return true;
    const db = aabbObb(d.min, d.max);
    return L.objs.some((o) => objObbs(o).some((b) => obbObb(b, db)));
  }

  function updateDoors(dt) {
    for (const d of L.doors) {
      if (d.oneway && !d.locked) {
        d.lampMat.emissiveIntensity = 2.4 + Math.sin(time * 4) * 0.9;
        // through and clear of it: lock behind you
        const pp = player.position, pt = d.t === 0 ? pp.x : d.t === 1 ? pp.y : pp.z, side = Math.sign(pt - d.ct);
        if (side === -d.side0 && Math.abs(pt - d.ct) > d.D / 2 + 0.7) {
          d.locked = true;
          sfx('lock');
          d.lampMat.emissiveIntensity = 2.4;
          if (!LOWFI) { const c = d.min.clone().add(d.max).multiplyScalar(0.5); FX.ring(c.x, c.y, c.z, { color: 0xff3b4a, r0: 2.2, r1: 0.6, life: 0.5, alpha: 0.8, normal: [d.t === 0 ? 1 : 0, d.t === 1 ? 1 : 0, d.t === 2 ? 1 : 0] }); shake(0.2); }
          // nothing wedges a one-way door: whatever is in the doorway gets crushed, and comes back where it started
          const db = aabbObb(d.min, d.max);
          for (const o of L.objs.slice()) {
            if (o.ghostly || !objObbs(o).some((b) => obbObb(b, db))) continue;
            fizzle(o);
            if (o.spawn) { const sp = o.spawn; const n = spawnObj({ kind: o.kind, boxes: o.baseBoxes, scale: sp.scale, pos: sp.pos, yaw: sp.yaw, printed: true, fixed: o.fixed, pinned: o.pinned, spawn: sp, extra: o.chute ? { chute: o.chute } : undefined }); burst(n, false); }
          }
        }
      }
      const want = d.oneway ? !d.locked : d.needs.every((id) => L.sig[id]);
      let open = want;
      if (!want && d.open && doorBlocked(d)) open = true;
      if (open !== d.open) {
        d.open = open;
        if (open) world.remove(d.body); else world.addBody(d.body);
        if (open && !LOWFI) {
          const c = d.min.clone().add(d.max).multiplyScalar(0.5), nrm = [d.t === 0 ? 1 : 0, d.t === 1 ? 1 : 0, d.t === 2 ? 1 : 0];
          FX.ring(c.x, c.y, c.z, { color: d.oneway ? 0xf2a33a : 0x61e294, r0: 0.5, r1: 2.3, life: 0.7, alpha: 0.7, normal: nrm });
          if (player && player.position.distanceTo(c) < 6) shake(0.12);
        }
        disturb({ min: d.min, max: d.max });
        sfx('door');
      }
      d.p += ((d.open ? 1 : 0) - d.p) * (1 - Math.exp(-6 * dt));
      setIris(d, d.p);
      d.lampMat.emissive.lerp(d.oneway ? (want ? C_SIG_WAIT : C_SIG_OFF) : want ? C_SIG_ON : C_SIG_OFF, 1 - Math.exp(-10 * dt));
    }
  }

  function moveShuttle(o, h) {
    const t = o.track;
    t.s += t.dir * t.speed * h;
    if (t.s >= t.len) { t.s = t.len; t.dir = -1; }
    if (t.s <= 0) { t.s = 0; t.dir = 1; }
    const k = t.len > 0 ? t.s / t.len : 0;
    const p = t.A.clone().lerp(t.B, k);
    o.body.position.set(p.x, p.y, p.z);
    const v = t.B.clone().sub(t.A).normalize().multiplyScalar(t.speed * t.dir);
    o.body.velocity.set(v.x, v.y, v.z);
  }

  // postcards: walk into one (or drop something into it) and you arrive at the spot it shows
  function cardLocal(card, p) {
    const q = objQuat(card).invert();
    return V3(p.x - card.body.position.x, p.y - card.body.position.y, p.z - card.body.position.z).applyQuaternion(q);
  }
  function throughCard(card) {
    const d = card.dest, k = card.scale, hx = 0.55 * k - 0.08, hy = 1.0 * k;
    if (P.cardCool <= 0) {
      const pp = player.position, c = cardLocal(card, V3(pp.x, pp.y + PH / 2, pp.z));
      const q = objQuat(card), vin = V3(player.velocity.x, player.velocity.y, player.velocity.z).applyQuaternion(q.clone().invert());
      // through the picture side only, like a doorway; the back is just paper
      if (Math.abs(c.x) < hx && c.z < 0.14 && c.z > -0.03 && Math.abs(c.y) < hy + PH / 2 - 0.4 && vin.z < 0.3) {
        // you come out where the doorway would put you: same offset, same turn, same speed
        const turn = d.yaw - objYaw(card);
        const feet = pp.y - (card.body.position.y - hy);
        const off = V3(clamp(c.x, -0.45, 0.45), 0, -0.32).applyQuaternion(yawQuat(d.yaw));
        player.position.set(d.x + off.x, d.y + Math.max(0.02, feet), d.z + off.z);
        const v = V3(player.velocity.x, player.velocity.y, player.velocity.z).applyQuaternion(yawQuat(turn));
        player.velocity.set(v.x, v.y, v.z);
        P.prev.set(player.position.x, player.position.y, player.position.z);
        acc = 0;
        yaw += turn;
        P.cardCool = 0.5;
        P.support = null; P.airCeil = Math.max(player.position.y, d.y + 0.02);
        flash('postcard');
        sfx('postcard');
        return true;
      }
    }
    for (const o of L.objs) {
      if (!o.dynamic || o.cardCool > time) continue;
      const c = cardLocal(card, o.body.position);
      const q = objQuat(card).invert(), v = o.body.velocity;
      const vin = V3(v.x, v.y, v.z).applyQuaternion(q);
      // through the picture side, like a doorway: same offset, same angle, same speed on the other side
      if (Math.abs(c.x) < hx && c.z < 0.2 && c.z > -0.4 && Math.abs(c.y) < hy && vin.z < 0.5) {
        if (o.frozen) thaw(o);
        const pm = portalMap(card);
        const half = o.boxes.reduce((m, b) => Math.max(m, Math.abs(b.c[1]) + b.s[1] / 2), 0);
        const at = V3(o.body.position.x, o.body.position.y, o.body.position.z).applyMatrix4(pm.m);
        const fwd = V3(-Math.sin(d.yaw), 0, -Math.cos(d.yaw));
        at.addScaledVector(fwd, 0.45);
        at.y = Math.max(at.y, d.y + half + 0.02);
        const nv = V3(v.x, v.y, v.z).applyQuaternion(pm.q);
        const nq = pm.q.clone().multiply(objQuat(o));
        o.body.position.set(at.x, at.y, at.z);
        o.body.velocity.set(nv.x, nv.y, nv.z);
        o.body.quaternion.set(nq.x, nq.y, nq.z, nq.w);
        o.body.angularVelocity.set(0, 0, 0);
        o.body.wakeUp();
        o.cardCool = time + 0.4;
        syncObj(o);
        o.flash = 1;
        sfx('postcard');
      }
    }
    return false;
  }

  // chutes keep their contents falling straight and looping; bounce tubes just keep them centred
  // Each chute owns one crate. If that crate ends up lying still anywhere else, it fizzles and a fresh one
  // drops back into the chute, so a missed shot never leaves you stuck and crates can't be hoarded.
  function updateChutes(h) {
    for (const ch of L.chutes) {
      ch.crate = null;
      let own = null, ownInside = false;
      for (const o of L.objs) {
        if (!o.dynamic) continue;
        const b = o.body, p = b.position;
        const inside = Math.abs(p.x - ch.cx) < 0.5 && Math.abs(p.z - ch.cz) < 0.5 && p.y > ch.y0 - 0.5 && p.y < ch.y1 + 0.6;
        if (o.chute === ch) { own = o; ownInside = inside; }
        if (!inside) continue;
        ch.crate = o;
        if (o.frozen) thaw(o);
        p.x = ch.cx; p.z = ch.cz;
        b.velocity.x = 0; b.velocity.z = 0;
        b.angularVelocity.set(0, 0, 0);
        b.quaternion.set(0, 0, 0, 1);
        if (ch.loop) {
          if (b.velocity.y < -ch.vmax) b.velocity.y = -ch.vmax;
          const half = o.boxes.reduce((m, q) => Math.max(m, Math.abs(q.c[1]) + q.s[1] / 2), 0);
          if (p.y - half < ch.y0 + 0.82) { p.y = ch.y1 - 0.8 - half - 0.02; b.velocity.y = Math.min(b.velocity.y, -1); }
        }
      }
      if (own && !ownInside && ch.recycle) {
        // spent: lying still for a moment, or loose (say, bouncing on a pad somewhere) for a long while
        // a crate doing a job (holding a plate down) isn't spent
        const onPlate = L.plates.some((pl) => Math.abs(own.body.position.x - (pl.x + 0.5)) < 0.75 && Math.abs(own.body.position.z - (pl.z + 0.5)) < 0.75 && Math.abs(own.body.position.y - pl.y) < 1.2);
        own.restT = !onPlate && own.body.velocity.lengthSquared() < 0.09 ? (own.restT || 0) + h : 0;
        if (onPlate) own.outT = 0;
        own.outT = (own.outT || 0) + h;
        if (own.restT > 2.5 || own.outT > 10) { fizzle(own); own = null; }
      } else if (own) own.outT = 0;
      if (own || !ch.spawn || L.photos.some((ph) => ph.extra && ph.extra.chute === ch)) { ch.empty = 0; continue; }
      ch.empty += h;
      if (ch.empty > 1.2) {
        ch.empty = 0;
        const sp = ch.spawn;
        const n = spawnObj({ kind: 'crate', pos: sp.pos, yaw: 0, boxes: [{ c: [0, 0, 0], s: [0.9, 0.9, 0.9] }], printed: true, spawn: sp, extra: { chute: ch } });
        burst(n, false);
      }
    }
  }
  // a spent crate dissolves into sparks
  function fizzle(o) {
    sfx('fizzle');
    if (!LOWFI) {
      const root = L.root, parts = [];
      for (const b of objObbs(o)) for (let i = 0; i < 26; i++) {
        const m = new T.Mesh(GEO.spark, M.spark);
        const p = b.c.clone();
        for (let k = 0; k < 3; k++) p.addScaledVector(b.u[k], (Math.random() * 2 - 1) * b.e[k]);
        m.position.copy(p);
        root.add(m);
        parts.push({ m, v: V3((Math.random() - 0.5) * 0.6, 0.6 + Math.random() * 1.4, (Math.random() - 0.5) * 0.6) });
      }
      effects.push({
        t: 0, dur: 0.9,
        step(dt) { for (const q of parts) { q.m.position.addScaledVector(q.v, dt); q.m.scale.setScalar(Math.max(0.05, 1 - this.t / 0.9)); } },
        end() { parts.forEach((q) => root.remove(q.m)); },
      });
    }
    removeObj(o, false);
  }

  // fragile glass: smash it, keep the thing that hit it moving, and scatter shards
  function shatter(pane) {
    pane.broken = true;
    world.remove(pane.body);
    if (pane.group) {
      const grp = L.panes.filter((q) => q.group === pane.group);
      if (grp.every((q) => q.broken)) grp.forEach((q) => { q.sealed = true; q.healAt = 0; });
      else if (pane.heal) pane.healAt = time + pane.heal;
    } else if (pane.heal) pane.healAt = time + pane.heal;
    pane.mesh.visible = false;
    if (pane.mesh.userData.edges) pane.mesh.userData.edges.visible = false;
    const by = pane.hitBy;
    if (by && pane.hitVel) by.velocity.set(pane.hitVel.x * 0.8, pane.hitVel.y * 0.8, pane.hitVel.z * 0.8);
    // and keep it flying the way it was: the knock from the glass it went through doesn't set it spinning
    if (by && pane.hitSpin) by.angularVelocity.copy(pane.hitSpin);
    sfx('shatter');
    disturb({ min: pane.min, max: pane.max });
    if (LOWFI) return;
    {
      const c = pane.min.clone().add(pane.max).multiplyScalar(0.5), sz = pane.max.clone().sub(pane.min);
      const ax = sz.x <= sz.y && sz.x <= sz.z ? 0 : sz.y <= sz.z ? 1 : 2;
      FX.ring(c.x, c.y, c.z, { color: pane.frosted ? 0xdfeaf0 : 0xbfe8ff, r0: 0.3, r1: Math.max(sz.x, sz.y, sz.z) * 0.9 + 0.6, life: 0.45, alpha: 0.8, normal: [ax === 0 ? 1 : 0, ax === 1 ? 1 : 0, ax === 2 ? 1 : 0] });
      FX.glow(c.x, c.y, c.z, { n: 20, color: 0xe8f6ff, speed: 3.5, grav: 6, drag: 1, life: 0.6, size: 0.05, box: [sz.x / 2, sz.y / 2, sz.z / 2] });
      if (player && player.position.distanceTo(c) < 7) shake(0.35);
    }
    const root = L.root, parts = [];
    const push = by ? V3(pane.hitVel.x, pane.hitVel.y, pane.hitVel.z).multiplyScalar(0.35) : V3();
    const n = 60;
    for (let i = 0; i < n; i++) {
      const m = new T.Mesh(GEO.shard, M.shard);
      const p = V3(pane.min.x + Math.random() * (pane.max.x - pane.min.x), pane.min.y + Math.random() * (pane.max.y - pane.min.y), pane.min.z + Math.random() * (pane.max.z - pane.min.z));
      m.position.copy(p);
      m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      m.scale.setScalar(0.6 + Math.random() * 1.4);
      root.add(m);
      const v = push.clone().add(V3((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 4));
      parts.push({ m, v, spin: V3(Math.random() * 12, Math.random() * 12, Math.random() * 12), floor: pane.min.y - 4 });
    }
    effects.push({
      t: 0, dur: 1.8,
      step(dt) {
        for (const q of parts) {
          q.v.y -= GRAV * 0.6 * dt;
          q.m.position.addScaledVector(q.v, dt);
          q.m.rotation.x += q.spin.x * dt; q.m.rotation.y += q.spin.y * dt;
          if (this.t > 1.3) q.m.scale.multiplyScalar(0.9);
        }
      },
      end() { parts.forEach((q) => root.remove(q.m)); },
    });
  }

  // aperture blades: closed, their inner edges cross past the centre; open, they've swirled back behind the frame
  function setIris(d, p) {
    const e = p * p * (3 - 2 * p), R = d.R;
    const dist = -0.3 * R + e * (1.3 * R + 0.1), twist = e * 0.9;
    const n = d.blades.length;
    for (let k = 0; k < n; k++) {
      const phi = (k * Math.PI * 2) / n + twist;
      shapeBlade(d.blades[k], d.bladeBox, Math.cos(phi) * dist, Math.sin(phi) * dist, phi);
    }
  }
  // One blade: a w x h plate pivoting at the middle of one short edge, at (px, py) turned to phi, trimmed to the
  // doorway (Sutherland-Hodgman against its four sides) and laid out as a fan of triangles, with its picture
  // pinned to the plate as it moves.
  const _poly = [], _next = [];
  function shapeBlade(m, bb, px, py, phi) {
    const c = Math.cos(phi), s = Math.sin(phi), hh = bb.h / 2;
    _poly.length = 0;
    for (const [bx, by] of [[0, -hh], [bb.w, -hh], [bb.w, hh], [0, hh]]) _poly.push([px + c * bx - s * by, py + s * bx + c * by]);
    let poly = _poly;
    for (const [ax, sign, lim] of [[0, 1, bb.x0], [0, -1, bb.x1], [1, 1, bb.y0], [1, -1, bb.y1]]) {
      const out = poly === _poly ? (_next.length = 0, _next) : [];
      const inside = (q) => sign * (q[ax] - lim) >= 0;
      for (let i = 0; i < poly.length; i++) {
        const A = poly[i], Bq = poly[(i + 1) % poly.length], ia = inside(A), ib = inside(Bq);
        if (ia) out.push(A);
        if (ia !== ib) { const t = (lim - A[ax]) / (Bq[ax] - A[ax]); out.push([A[0] + (Bq[0] - A[0]) * t, A[1] + (Bq[1] - A[1]) * t]); }
      }
      poly = out;
      if (!poly.length) break;
    }
    const g = m.geometry, P = g.attributes.position.array, U = g.attributes.uv.array;
    let v = 0;
    for (let i = 1; i + 1 < poly.length && v < 18; i++) {
      for (const q of [poly[0], poly[i], poly[i + 1]]) {
        P[v * 3] = q[0]; P[v * 3 + 1] = q[1]; P[v * 3 + 2] = 0;
        const dx = q[0] - px, dy = q[1] - py;
        U[v * 2] = (c * dx + s * dy) / bb.w; U[v * 2 + 1] = (-s * dx + c * dy + hh) / bb.h;
        v++;
      }
    }
    g.setDrawRange(0, v);
    g.attributes.position.needsUpdate = true;
    g.attributes.uv.needsUpdate = true;
    g.computeBoundingSphere();
    m.visible = v > 0;
  }

  // self-healing panes knit back together once nothing is in the way
  function updatePanes(dt) {
    for (const pane of L.panes) {
      if (pane.broken && pane.healAt && !pane.sealed && time >= pane.healAt) {
        const box = { min: pane.min, max: pane.max };
        const inWay = aabbOverlap(box, playerBox()) || L.objs.some((o) => !o.ghostly && aabbOverlap(box, unionBounds(objObbs(o))));
        if (!inWay) {
          pane.broken = false; pane.healAt = 0; pane.hitBy = null; pane.hitVel = null; pane.hitSpin = null; pane.fade = 0;
          world.addBody(pane.body);
          pane.mesh.visible = true;
          if (pane.mesh.userData.edges) pane.mesh.userData.edges.visible = true;
          sfx('reglaze');
        }
      }
      if (pane.fade < 1) {
        pane.fade = Math.min(1, pane.fade + dt * 3.5);
        pane.mesh.material.opacity = pane.fade;
      }
    }
  }

  function checkLeaks() {
    if (!L.photos.length && !expo) return;
    const pb = playerBox();
    if (!L.leaks.some((lk) => aabbOverlap(pb, lk))) return;
    if (expo) { expo = null; aud((A) => A.exposure(false)); }
    if (L.photos.length) fogFilm();
    else { flash('leak'); sfx('fog'); toast('Light leak. It fogged the exposure you were holding.', 3000); }
  }

  function fogFilm() {
    for (const ph of L.photos) {
      if (ph.copy || !ph.home) continue;
      const o = spawnObj({ kind: ph.kind, boxes: ph.boxes, scale: ph.home.scale, pos: ph.home.pos, yaw: ph.home.yaw, printed: true, fixed: ph.fixed, spawn: ph.spawn, extra: ph.extra });
      burst(o, false);
    }
    L.photos.length = 0;
    L.sel = 0;
    ghost.key = '';
    renderStrip();
    flash('leak');
    sfx('fog');
    toast('Light leak. Your film fogged and everything went back where it was.', 3400);
  }

  // whatever drops far enough into the void is gone, and comes back where it started (a copy is gone for good)
  function respawnLost() {
    for (const o of L.objs.slice()) {
      if (!o.dynamic) continue;
      if (o.body.position.y > L.lostY) continue;
      removeObj(o, false);
      if (o.spawn) {
        const sp = o.spawn;
        const n = spawnObj({ kind: o.kind, boxes: o.baseBoxes, scale: sp.scale, pos: sp.pos, yaw: sp.yaw, printed: true, fixed: o.fixed, pinned: o.pinned, spawn: sp, extra: o.chute ? { chute: o.chute } : undefined });
        burst(n, false);
        toast('Something fell out of frame. It was reprinted where it started.');
      }
    }
  }

  // ------------------------------------------------------------------ main update
  const canAct = () => !!(L && running && !paused && !transition);

  function update(dt) {
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 10) { physicsStep(STEP); acc -= STEP; n++; }
    if (n >= 10) acc = 0;
    settleObjects();
    trackExposure(dt);
    for (const o of L.objs) if (o.dynamic) syncObj(o);
    L.root.updateMatrixWorld(true);
    stepAssist();
    respawnLost();
    updateBeams();
    updateSignals(dt);
    updateDoors(dt);
    if (L.panes.length) updatePanes(dt);
    checkLeaks();

    // falling out of the map: the moment there's nothing left under you, you hear about it, for just as long as
    // you're falling. It stops dead the moment you respawn, and fades if something catches you after all.
    if (!P.voidCry && !P.onGround && player.velocity.y < -5 && player.position.y < L.start[1] - 1.5 && overVoid()) {
      P.voidCry = true;
      const left = fallTimeLeft();
      aud((A) => { if (A.ready() && A.fallVoice) A.fallVoice(null, left); });
    } else if (P.voidCry && P.onGround) {
      P.voidCry = false;
      aud((A) => { if (A.stopVoice) A.stopVoice(0.25); });
    }
    if (player.position.y < L.deathY) { die('Fell out of frame.'); return; }
    if (beamHitsPlayer()) { die('Exposed to the beam.'); return; }

    const pp = player.position;
    for (const ex of L.exits) {
      if (Math.abs(pp.x - (ex.x + 0.5)) < 0.5 && Math.abs(pp.z - (ex.z + 0.5)) < 0.5 && pp.y > ex.y - 0.3 && pp.y < ex.y + 1.2) { complete(); return; }
    }
  }

  // how far you are from each thing that hums, for the ambience mix
  function nearby() {
    const e = EYEPOS, d = { beam: Infinity, portal: Infinity, shuttle: Infinity, void: Infinity, leak: Infinity, safe: Infinity, inside: true };
    for (const [a, b] of L.beamSegs) {
      const ab = b.clone().sub(a), t = clamp(e.clone().sub(a).dot(ab) / Math.max(1e-6, ab.lengthSq()), 0, 1);
      d.beam = Math.min(d.beam, a.clone().addScaledVector(ab, t).distanceTo(e));
    }
    for (const o of L.objs) {
      if (o.kind === 'postcard') d.portal = Math.min(d.portal, objPos(o).distanceTo(e));
      else if (o.kind === 'shuttle') d.shuttle = Math.min(d.shuttle, objPos(o).distanceTo(e));
    }
    const boxDist = (mn, mx) => Math.hypot(Math.max(mn.x - e.x, 0, e.x - mx.x), Math.max(mn.y - e.y, 0, e.y - mx.y), Math.max(mn.z - e.z, 0, e.z - mx.z));
    for (const v of L.voids) d.void = Math.min(d.void, boxDist(v.min, v.max));
    for (const k of L.leaks) d.leak = Math.min(d.leak, boxDist(k.min, k.max));
    for (const z of L.safes) d.safe = Math.min(d.safe, boxDist(z.min, z.max));
    return d;
  }
  let lastSpot = null;
  const _assist = new T.Vector2();
  function takeable(h) {
    if (!h) return false;
    const ud = h.object.userData;
    if (ud.obj) return !ud.obj.locked;
    return !!(ud.chute || (ud.spot && L.def.postcard));
  }
  function updateVisuals(dt) {
    updateInput(dt);
    updateDust(dt);
    updateSpots();
    // camera follows the player, interpolated between physics steps
    const a = clamp(acc / STEP, 0, 1);
    const p = player.position;
    EYEPOS.set(P.prev.x + (p.x - P.prev.x) * a, P.prev.y + (p.y - P.prev.y) * a + EYE, P.prev.z + (p.z - P.prev.z) * a);
    // head bob only while you're actually walking around; it settles out on the
    // chamber-complete card, the pause menu and anywhere else the world is frozen
    const live = running && !paused && !transition;
    const speed = live ? Math.hypot(player.velocity.x, player.velocity.z) : 0;
    const stepPhase = Math.floor(P.bob * 2 / Math.PI);
    if (P.onGround && live) P.bob += dt * speed * 1.9;
    if (live && P.onGround && speed > 1.2 && Math.floor(P.bob * 2 / Math.PI) !== stepPhase) sfx('step', Math.min(1, speed / SPEED));
    if (live) aud((A) => { if (A.ready()) A.ambience(nearby()); });
    P.bobAmp += (0.03 * clamp(speed / SPEED, 0, 1) - P.bobAmp) * (1 - Math.exp(-12 * dt));
    const bob = SET.bob ? Math.sin(P.bob * 2) * P.bobAmp : 0;
    camera.position.set(EYEPOS.x, EYEPOS.y + bob, EYEPOS.z);
    camera.rotation.set(pitch, yaw, 0);
    // behind the menu the view drifts slowly, so the chamber feels alive; it settles the moment you play
    menuDrift += ((paused && !CALM ? 1 : 0) - menuDrift) * (1 - Math.exp(-(paused ? 0.8 : 9) * dt));
    if (menuDrift > 0.001) { camera.rotation.y += Math.sin(time * 0.16) * 0.07 * menuDrift; camera.rotation.x += Math.sin(time * 0.11 + 1) * 0.025 * menuDrift; }
    if (shakeK > 0.001) {
      const a = shakeK * shakeK;
      camera.rotation.x += (Math.random() - 0.5) * 0.022 * a;
      camera.rotation.y += (Math.random() - 0.5) * 0.022 * a;
      camera.position.y += (Math.random() - 0.5) * 0.05 * a;
      shakeK = Math.max(0, shakeK - dt * 3.2);
    }
    camera.updateMatrixWorld();

    aim = null; aimSpot = null;
    if (running && !transition) {
      rc.setFromCamera(CENTER, camera);
      rc.near = 0; rc.far = REACH;
      const pp = player.position;
      const spotsAim = L.spotMeshes.filter((m) => { const sp = m.userData.spot; return Math.hypot(sp.x - pp.x, sp.z - pp.z) > 1.3; });
      const list = beamTargets().concat(L.aimProxies, spotsAim);
      let hit = rc.intersectObjects(list, false)[0];
      // a little aim assist: if the centre of the view finds nothing you could photograph, look a few degrees around
      // it, nearest first, so small things and photo spots don't need pixel-perfect aim
      if (!takeable(hit)) {
        const ty = Math.tan((camera.fov * DEG) / 2), ax = 1 / Math.max(0.2, camera.aspect);
        for (const [deg, n, ph0] of [[2.2, 4, 0], [4.2, 6, 0.5]]) {
          const r = Math.tan(deg * DEG) / ty;
          let found = null;
          for (let k = 0; k < n && !found; k++) {
            const a = ((k + ph0) / n) * Math.PI * 2;
            _assist.set(Math.cos(a) * r * ax, Math.sin(a) * r);
            rc.setFromCamera(_assist, camera);
            const h = rc.intersectObjects(list, false)[0];
            if (takeable(h)) found = h;
          }
          if (found) { hit = found; break; }
        }
        rc.setFromCamera(CENTER, camera);
      }
      if (hit) {
        const ud = hit.object.userData;
        if (ud.obj) aim = ud.obj;
        else if (ud.chute) aim = ud.chute.crate;
        else if (ud.spot) aimSpot = ud.spot;
      }
    }
    if (aimSpot !== lastSpot) { if (aimSpot && L.def.postcard) sfx('spot'); lastSpot = aimSpot; }

    let padGlow = 0;
    for (const o of L.objs) {
      o.flash = Math.max(0, o.flash - dt * 2.2);
      const col = o.edgeMat.color.copy(edgeColor(o));
      if (o === aim && !o.locked) col.lerp(WHITE, 0.75 + 0.25 * Math.sin(time * 10));
      col.lerp(WHITE, o.flash);
      if (!o.dynamic) syncObj(o);
      if (o.kind === 'pad') padGlow = Math.max(padGlow, o.flash * 2);
    }
    M.padTop.emissiveIntensity = 0.45 + 0.3 * Math.sin(time * 4) + padGlow;
    leakTex.offset.y = (time * 0.35) % 1;
    leakTex.offset.x = Math.sin(time * 0.7) * 0.1;
    M.exitShaft.opacity = 0.8 + 0.2 * Math.sin(time * 2.6);

    updateGhost(dt);
    updateHud();

    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.t += dt;
      e.step(dt);
      if (e.t >= e.dur) { e.end(); effects.splice(i, 1); }
    }
    if (!LOWFI) { if (live) ambientFX(dt); FX.update(dt); }
  }

  const KIND = { block: 'Block', plank: 'Plank', stairs: 'Stairs', crate: 'Crate', emitter: 'Emitter', mirror: 'Mirror', pad: 'Jump pad', postcard: 'Postcard', streak: 'Streak', shuttle: 'Shuttle' };
  const kb = (t) => `<kbd>${t}</kbd>`;
  const KEYS = {
    click: 'Click',
    rclick: IS_MAC ? '⌃ Click' : 'Right-click',
    swipe: IS_MAC ? 'Swipe ↔' : 'Shift + scroll',
    scroll: IS_MAC ? 'Swipe ↕' : 'Scroll',
    del: IS_MAC ? 'Delete' : 'Backspace',
  };
  let lastKeys = '', lastAim = null, lastReadout = '';
  function updateHud() {
    if (!L) return;
    const live = running && !paused && !transition;
    const ph = live ? L.photos[L.sel] : null;
    // focus brackets take the ink of whatever you're aiming at
    let rcls = '', label = '';
    if (live) {
      if (aim) {
        if (aim.locked) { rcls = 'locked'; label = `${KIND[aim.kind] || 'Object'} · anchored`; }
        else if (underfoot(aim)) { rcls = 'locked'; label = `${KIND[aim.kind] || 'Object'} · ${P.onGround ? 'underfoot' : 'land first'}`; }
        else if (safeObj(aim)) { rcls = 'bad'; label = `${KIND[aim.kind] || 'Object'} · in safelight`; }
        else {
          rcls = aim.fixed ? 'ink-b' : 'ink-o';
          const sp = L.def.motion && aim.dynamic ? aim.body.velocity.length() : 0;
          label = `${KIND[aim.kind] || 'Object'} · ${sp > 0.5 ? `moving ${Math.min(MAX_LAUNCH, sp).toFixed(0)} m/s` : aim.fixed ? 'blue, floats' : 'orange, has weight'}`;
        }
      } else if (aimSpot && L.def.postcard) { rcls = safeSpot(aimSpot) ? 'bad' : 'ink-b'; label = safeSpot(aimSpot) ? 'Photo spot · in safelight' : 'Photo spot · take a postcard'; }
      else if (ph) rcls = ghost.valid ? (ph.fixed ? 'hold-b' : 'hold-o') : 'bad';
    }
    if (reticle.className !== rcls) reticle.className = rcls;
    if (label !== lastAim) { aimLabel.textContent = label; aimLabel.className = rcls; lastAim = label; }

    // only the keys that do something right now
    const rows = [];
    if (live) {
      const full = L.photos.length >= L.film;
      if (aim && !aim.locked && !underfoot(aim) && !safeObj(aim)) {
        const what = L.def.copy ? 'Copy' : L.def.exposure ? 'Hold to expose' : L.def.motion && aim.dynamic ? 'Photograph, speed and all' : 'Photograph';
        rows.push(full
          ? `<div class="row off">${kb(KEYS.click)}<span>Out of film, print one first</span></div>`
          : `<div class="row">${kb(KEYS.click)}${kb('F')}<span>${what}</span></div>`);
      } else if (aimSpot && L.def.postcard && !safeSpot(aimSpot)) {
        rows.push(full
          ? `<div class="row off">${kb(KEYS.click)}<span>Out of film, print one first</span></div>`
          : `<div class="row">${kb(KEYS.click)}${kb('F')}<span>Take a postcard</span></div>`);
      }
      if (ph) {
        const ok = ghost.valid;
        const what = ph.kind === 'postcard' ? 'Print, then step in' : ph.speed > 0.5 ? `Launch at ${ph.speed.toFixed(0)} m/s` : 'Print';
        const why = ghost.valid ? what : WHY_SHORT[ghost.pose && ghost.pose.why] || 'Print blocked';
        rows.push(`<div class="row${ok ? '' : ' off'}">${kb(KEYS.rclick)}${kb('E')}<span>${why}</span></div>`);
        rows.push(`<div class="row">${kb('R')}<i>+ mouse</i><span>Rotate and push freehand</span></div>`);
        rows.push(`<div class="row">${kb(KEYS.swipe)}${kb('Z')}${kb('X')}<span>Rotate</span></div>`);
        rows.push(`<div class="row">${kb(KEYS.scroll)}<span>${L.def.zoom ? 'Toward you: nearer, smaller' : 'Toward you pulls it in'}</span></div>`);
        rows.push(`<div class="row">${kb('G')}<span>Snap ${snapOn ? 'on' : 'off'}</span></div>`);
        if (L.photos.length > 1) rows.push(`<div class="row">${kb('Q')}<span>Next photo</span></div>`);
      }
      const grp = (k, t) => `<span class="grp">${k}<span>${t}</span></span>`;
      rows.push(`<div class="row basic">${grp(kb('W') + kb('A') + kb('S') + kb('D'), 'Move')}${grp(kb('Space'), 'Jump')}${grp(kb(KEYS.del), 'Hold to restart')}${grp(kb('Esc'), 'Pause')}</div>`);
    }
    const html = rows.join('');
    if (html !== lastKeys) { keysEl.innerHTML = html; lastKeys = html; }

    // exposure-style readout for the print you're holding
    let ro = '';
    if (ph && ghost.pose) {
      const pose = ghost.pose, d = pose.pos.distanceTo(EYEPOS);
      const turn = ((Math.round(pose.yaw / DEG) % 360) + 360) % 360;
      const card = ph.kind === 'postcard';
      ro = `<div class="ro-ink ${card ? 'p' : ph.fixed ? 'b' : 'o'}">${card ? 'Postcard · a doorway' : ph.fixed ? 'Blue · floats' : 'Orange · has weight'}</div>`
        + `<dl><div><dt>Distance</dt><dd>${d.toFixed(1)} m</dd></div>`
        + `<div><dt>Rotation</dt><dd>${turn}°</dd></div>`
        + (L.def.zoom ? `<div><dt>Scale</dt><dd>×${pose.scale.toFixed(2)}</dd></div>` : '')
        + (ph.speed > 0.5 ? `<div><dt>Launch</dt><dd class="on">${ph.speed.toFixed(1)} m/s</dd></div>` : '')
        + `<div><dt>Snap</dt><dd class="${snapOn ? 'on' : ''}">${snapOn ? 'On' : 'Off'}</dd></div></dl>`;
    }
    if (ro !== lastReadout) { readout.innerHTML = ro; readout.hidden = !ro; lastReadout = ro; }

    const ringOn = restartHold > 0 || !!expo;
    holdRing.hidden = !ringOn;
    holdRing.classList.toggle('expo', !!expo);
    if (expo) {
      holdRing.style.setProperty('--p', (expo.t / EXPO_MAX).toFixed(3));
      holdLabel.textContent = `Exposing · ${expoLength(expo).toFixed(1)} m`;
    } else if (restartHold > 0) {
      holdRing.style.setProperty('--p', (restartHold / RESTART_HOLD).toFixed(3));
      holdLabel.textContent = 'Restarting';
    }
  }

  // ------------------------------------------------------------------ flow
  function die(msg) {
    sfx('die');
    loadLevel(L.idx, msg + ' Chamber reset.');
    flash('red');
  }

  // Render a view straight into a small canvas: draw it into the corner of the screen at that size and copy it
  // out, instead of drawing the whole screen and shrinking it (much cheaper, which matters with 200 previews).
  const _sz = new T.Vector2();
  function drawSmall(cam, target) {
    const pr = renderer.getPixelRatio(), W = target.width, H = target.height;
    renderer.getSize(_sz);
    const w = Math.min(W / pr, _sz.x), h = Math.min(H / pr, _sz.y);
    renderer.setScissorTest(true);
    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    try {
      renderer.render(scene, cam);
      const src = renderer.domElement, dw = Math.max(1, Math.round(w * pr)), dh = Math.max(1, Math.round(h * pr));
      target.getContext('2d').drawImage(src, 0, src.height - dh, dw, dh, 0, 0, W, H);
    } finally {
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, _sz.x, _sz.y);
      renderer.setScissor(0, 0, _sz.x, _sz.y);
    }
  }
  function grabFrame(target) {
    const ctx = target.getContext('2d'), src = renderer.domElement, ar = target.width / target.height;
    const sh = Math.min(src.height, src.width / ar), sw = sh * ar;
    try { ctx.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, target.width, target.height); } catch (e) { /* ignore */ }
  }
  function replay(el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }

  function complete() {
    transition = true;
    sfx('win');
    if (!LOWFI && player) {
      const q = player.position;
      FX.ring(q.x, q.y + 0.05, q.z, { color: 0xffc98a, r0: 0.4, r1: 3.2, life: 0.9 });
      FX.glow(q.x, q.y + 1, q.z, { n: 46, color: 0xffd9a0, speed: 3.2, up: 1.2, drag: 1.6, grav: 1.5, life: 1.2, size: 0.07, box: [0.4, 0.8, 0.4] });
      FX.flash(0.7);
    }
    const idx = L.idx;
    doneSet.add(idx);
    saveDone();
    renderClean();
    grabFrame(doneImg);
    doneSub.textContent = `Chamber ${pad2(idx + 1)} · ${LEVELS[idx].name}`;
    doneTitle.textContent = idx === LEVELS.length - 1 ? 'The final print' : 'Developed';
    doneProg.textContent = `${doneSet.size} of ${LEVELS.length} chambers developed`;
    doneEl.hidden = false;
    replay(doneEl.querySelector('.print'));
    replay(doneImg);
    completeTimer = setTimeout(() => {
      doneEl.hidden = true;
      transition = false;
      if (idx + 1 < LEVELS.length) loadLevel(idx + 1);
      else finishGame();
    }, 2100);
  }

  function finishGame() {
    running = false;
    paused = true;
    if (document.pointerLockElement) document.exitPointerLock();
    showMenu('chambers');
    menuNote.textContent = doneSet.size >= LEVELS.length
      ? `All ${LEVELS.length} chambers developed. That was the last frame on the roll: thanks for playing.`
      : `That was the final chamber. ${doneSet.size} of ${LEVELS.length} developed so far: pick any chamber to play it.`;
  }

  function begin(levelIdx) {
    ac();
    if (levelIdx != null) loadLevel(levelIdx);
    running = true;
    paused = false;
    if (L) aud((A) => A.setMusic(musicKey(L.idx), L.idx));
    hideMenu();
    if (levelIdx != null) showTitle();
    requestLock();
  }

  function requestLock() {
    if (fallback) return;
    if (!canvas.requestPointerLock) { enterFallback(); return; }
    try {
      const r = canvas.requestPointerLock();
      if (r && r.catch) r.catch(lockFailed);
    } catch (e) { lockFailed(); }
  }
  // Browsers refuse to re-capture the mouse for a moment after Esc. If capture has worked before,
  // that's all this is: the next click on the view tries again. Otherwise fall back to drag-to-look.
  let hadLock = false;
  function lockFailed() {
    if (hadLock) { if (running && !paused) toast('Click the view to capture the mouse again.', 2400); return; }
    enterFallback();
  }
  function enterFallback() {
    if (fallback) return;
    fallback = true;
    toast('Mouse capture is off here. Drag to look, F to photograph, E to print.', 4200);
  }

  // ------------------------------------------------------------------ menus
  const panels = { home: $('panel-home'), chambers: $('panel-chambers'), hints: $('panel-hints'), settings: $('panel-settings'), controls: $('panel-controls') };
  const navBtns = Array.from(document.querySelectorAll('[data-panel]'));
  let panel = 'home';
  function showPanel(name) {
    if (name !== panel) sfx('uiOpen');
    panel = name;
    for (const k in panels) panels[k].hidden = k !== name;
    navBtns.forEach((b) => b.classList.toggle('active', b.dataset.panel === name));
    if (name === 'home') renderHome();
    if (name === 'chambers') renderSheet();
    if (name === 'hints') renderHints();
    if (name === 'settings') syncSettingsUI();
    // with this many chambers, open the sheet where you are rather than at the top
    const curCard = name === 'chambers' && L && L.idx > 7 && cardEls[L.idx] ? cardEls[L.idx].el : null;
    // in a narrow window the panels sit below the buttons, so bring the one you picked into view
    if (window.matchMedia && window.matchMedia('(max-width: 860px)').matches && !menu.hidden) {
      try {
        if (name === 'home') menu.scrollTo({ top: 0, behavior: 'smooth' });
        else if (curCard) curCard.scrollIntoView({ block: 'center' });
        else panels[name].scrollIntoView({ block: 'start', behavior: 'smooth' });
      } catch (e) { /* older browsers: fine as it is */ }
    } else if (curCard) {
      try { curCard.scrollIntoView({ block: 'center' }); } catch (e) { /* fine at the top */ }
    }
  }
  navBtns.forEach((b) => b.addEventListener('click', () => showPanel(panel === b.dataset.panel ? 'home' : b.dataset.panel)));
  // little sounds for the menus
  let hoverEl = null;
  menu.addEventListener('pointerover', (e) => { const el = e.target.closest('button, .card, label'); if (el && el !== hoverEl) { hoverEl = el; sfx('uiHover'); } });
  menu.addEventListener('click', (e) => { if (e.target.closest('button')) { ac(); sfx('uiClick'); } });
  logoBtn.addEventListener('click', () => showPanel('home'));

  function showMenu(which) {
    paused = true;
    expo = null;
    aud((A) => { A.exposure(false); A.silence(); A.setMusic('menu', 0); });
    menu.hidden = false;
    hud.hidden = true;
    restartBtn.hidden = !running;
    playBtn.textContent = running ? 'Resume' : doneSet.size ? `Continue · ${pad2(L.idx + 1)}` : 'Play';
    menuEyebrow.textContent = running ? `Paused · chamber ${pad2(L.idx + 1)}` : `A first-person puzzle in ${LEVELS.length} chambers`;
    showPanel(which || 'home');
  }
  function hideMenu() { menu.hidden = true; hud.hidden = false; menuNote.textContent = ''; }
  function pauseGame() {
    if (!running || paused) return;
    if (document.pointerLockElement) document.exitPointerLock();
    else showMenu();
  }

  const COMBO_BLURB = {
    'motion+postcard': 'things keep their speed, even through a postcard.',
    'zoom+motion': 'distance sets the size, and a moving thing keeps its speed.',
    'copy+motion': 'copies keep the speed of whatever you copied.',
    'copy+zoom': 'copies come out bigger the farther away you print them.',
    'postcard+exposure': 'a streak goes through a postcard like anything else.',
    'zoom+exposure': 'a streak grows the farther away you print it.',
    'copy+postcard': 'copies go through postcards like anything else.',
  };
  function filmBlurb(lv) {
    const fs = levelFilms(lv).filter((k) => k !== 'shutter');
    if (fs.length > 1) {
      const key = fs.slice().sort().join('+'), names = fs.map((k) => FILMS[k].short);
      const known = Object.keys(COMBO_BLURB).find((k) => k.split('+').sort().join('+') === key);
      return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} film together: ${known ? COMBO_BLURB[known] : 'every rule applies at once.'}`;
    }
    if (lv.motion) return 'Action 800 film: a photo of something moving keeps its speed. Print it and it flies the way you look.';
    if (lv.postcard) return 'Postcard 100 film: photograph a marked photo spot, print the postcard, and step into it to go there.';
    if (lv.exposure) return 'Slow 25 film: hold the shutter on something moving and it prints as one long streak.';
    if (lv.zoom) return 'Zoom 400 film: a print keeps its size in your viewfinder, so pushing it farther makes it bigger.';
    if (lv.copy) return 'Double-X film: a photo copies the object instead of taking it.';
    return `Shutter 400 film, ${lv.film === 1 ? 'one frame' : lv.film + ' frames'}.`;
  }
  // the chamber sheet only develops the previews you can see (there are a lot of chambers)
  let previewIO = null;
  try {
    if ('IntersectionObserver' in window) previewIO = new IntersectionObserver((ents) => {
      for (const e of ents) {
        if (!e.isIntersecting) continue;
        previewIO.unobserve(e.target);
        const i = +e.target.dataset.pi;
        if (previews[i] === undefined) queuePreview(i, true);
      }
    }, { rootMargin: '240px 0px' });
  } catch (e) { previewIO = null; }
  function setPreviewImg(el, i, front, lazy) {
    el.textContent = '';
    if (previews[i]) {
      const img = new Image();
      img.alt = '';
      img.src = previews[i];
      el.appendChild(img);
    } else {
      const w = document.createElement('div');
      w.className = 'wait';
      w.textContent = 'Developing';
      el.appendChild(w);
      if (lazy && previewIO) { el.dataset.pi = String(i); previewIO.observe(el); }
      else queuePreview(i, front);
    }
  }
  function renderHome() {
    if (!L) return;
    const i = L.idx, lv = LEVELS[i];
    nowEyebrow.textContent = running ? `Paused in chamber ${pad2(i + 1)}` : `${doneSet.size ? 'Up next' : 'First up'} · chamber ${pad2(i + 1)}`;
    nowName.textContent = lv.name;
    const fl = levelFilms(lv).filter((k) => k !== 'shutter');
    nowFilm.innerHTML = (fl.length ? `<span class="fbs">${fl.map(filmBadge).join('')}</span>` : '') + `<span>${filmBlurb(lv)}</span>`;
    if (running) {
      // paused: show the moment you stopped at, not the chamber's opening view
      const c = document.createElement('canvas');
      c.width = 640; c.height = 400;
      renderClean();
      grabFrame(c);
      nowImg.textContent = '';
      nowImg.appendChild(c);
    } else setPreviewImg(nowImg, i, true);
  }
  const cardEls = [];
  const filmBadge = (k) => `<span class="fb" style="--film:${FILMS[k].color}">${FILM_ICON[k]}<b>${FILMS[k].short}</b></span>`;
  function cardTags(i) {
    const lv = LEVELS[i], t = [];
    for (const k of levelFilms(lv)) if (k !== 'shutter') t.push(filmBadge(k));
    if (levelMeta[i] && levelMeta[i].blue) t.push('<span class="tag b">Blue</span>');
    if (lv.film > 1) t.push(`<span class="tag">${lv.film} frames</span>`);
    return t.join('');
  }
  const ROLLS = {
    1: ['Roll 1', 'First exposures'],
    2: ['Roll 2', 'New stock'],
    3: ['Roll 3', 'Fast film'],
    4: ['Roll 4', 'Hard light'],
    5: ['Roll 5', 'Long exposures'],
    6: ['Roll 6', 'Mixed stock'],
    7: ['Roll 7', 'Cross processing'],
    8: ['Roll 8', 'High contrast'],
    9: ['Roll 9', 'Master prints'],
    10: ['Roll 10', 'Exhibition'],
  };
  function renderSheet() {
    if (previewIO) previewIO.disconnect();
    sheetEl.textContent = '';
    let roll = 0;
    LEVELS.forEach((lv, i) => {
      const r = lv.roll || 1;
      if (r !== roll) {
        roll = r;
        const h = document.createElement('h3');
        h.className = 'roll';
        h.dataset.roll = String(r);
        const done = LEVELS.filter((l, k) => (l.roll || 1) === r && doneSet.has(k)).length, all = LEVELS.filter((l) => (l.roll || 1) === r).length;
        const rr = ROLLS[r] || ['Roll ' + r, ''];
        h.innerHTML = `<b>${rr[0]}</b><span>${rr[1]}</span><em>${done}/${all}</em>`;
        sheetEl.appendChild(h);
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'card' + (L && L.idx === i ? ' current' : '');
      b.style.setProperty('--i', String(Math.min(i % 20, 14)));
      const lf = levelFilms(lv);
      if (lf[0] !== 'shutter') { b.classList.add('special'); b.style.setProperty('--film', FILMS[lf[0]].color); }
      b.setAttribute('aria-label', `Chamber ${i + 1}, ${lv.name}${doneSet.has(i) ? ', developed' : ''}`);
      const img = document.createElement('div');
      img.className = 'img';
      setPreviewImg(img, i, false, true);
      const meta = document.createElement('div');
      meta.className = 'meta';
      // a little difficulty meter: chambers are ordered easiest first, so it fills as you go
      const lvlD = Math.max(1, Math.ceil(((i + 1) / LEVELS.length) * 10));
      meta.innerHTML = `<span class="n">${pad2(i + 1)}</span><span class="name">${lv.name}</span><span class="diff" title="Difficulty ${lvlD} of 10" aria-label="Difficulty ${lvlD} of 10">${'<i></i>'.repeat(10)}</span>`;
      meta.querySelectorAll('.diff i').forEach((el, k) => { if (k < lvlD) el.className = 'on'; });
      const tags = document.createElement('div');
      tags.className = 'tags';
      tags.innerHTML = cardTags(i);
      b.append(img, meta, tags);
      if (doneSet.has(i)) { const st = document.createElement('span'); st.className = 'stamp'; st.textContent = 'Developed'; b.appendChild(st); }
      b.addEventListener('click', () => begin(i));
      sheetEl.appendChild(b);
      cardEls[i] = { img, tags, el: b };
    });
    progressText.textContent = `${doneSet.size} of ${LEVELS.length} developed`;
    renderRollNav();
  }
  // a row of roll numbers over the sheet: each fills as you develop its chambers, and takes you there
  function renderRollNav() {
    if (!rollNav) return;
    rollNav.textContent = '';
    const nR = LEVELS.length ? LEVELS[LEVELS.length - 1].roll || 1 : 0;
    if (nR < 2) { rollNav.hidden = true; return; }
    rollNav.hidden = false;
    const cur = L ? LEVELS[L.idx].roll || 1 : 1;
    for (let r = 1; r <= nR; r++) {
      let all = 0, done = 0;
      LEVELS.forEach((l, k) => { if ((l.roll || 1) === r) { all++; if (doneSet.has(k)) done++; } });
      const rr = ROLLS[r] || ['Roll ' + r, ''];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rn' + (r === cur ? ' cur' : '') + (all && done === all ? ' full' : '');
      b.style.setProperty('--p', String(all ? done / all : 0));
      b.title = `${rr[0]}${rr[1] ? ' · ' + rr[1] : ''} · ${done} of ${all} developed`;
      b.setAttribute('aria-label', b.title);
      b.innerHTML = `<b>${r}</b><i></i>`;
      b.addEventListener('click', () => {
        const h = sheetEl.querySelector(`.roll[data-roll="${r}"]`);
        if (!h) return;
        // put the roll's heading just under this row of buttons, whichever box is doing the scrolling
        let sc = h.parentElement;
        while (sc && !(sc.scrollHeight > sc.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
        if (!sc) { h.scrollIntoView(); return; }
        // twice: the row only sticks to the top once the sheet has scrolled, which moves it
        for (let k = 0; k < 2; k++) sc.scrollTop += h.getBoundingClientRect().top - rollNav.getBoundingClientRect().bottom - 6;
      });
      rollNav.appendChild(b);
    }
  }

  // ------------------------------------------------------------------ chamber previews (rendered once, from the start position)
  const previews = [], levelMeta = [], previewQueue = [];
  const pCam = new T.PerspectiveCamera(66, 1.6, 0.05, 200);
  pCam.rotation.order = 'YXZ';
  function queuePreview(i, front) {
    if (previews[i] !== undefined || previewQueue.includes(i)) return;
    if (front) previewQueue.unshift(i); else previewQueue.push(i);
  }
  function renderPreview(i) {
    FX.setShown(false);
    try { return renderPreviewInner(i); } finally { FX.setShown(true); }
  }
  function renderPreviewInner(i) {
    const keep = { L, world, player };
    const sunPos = sun.position.clone(), sunTgt = sun.target.position.clone();
    const gv = [ghost.group.visible, ghost.beam.visible, ghost.drop.visible];
    ghost.group.visible = ghost.beam.visible = ghost.drop.visible = false;
    if (keep.L) scene.remove(keep.L.root);
    const def = LEVELS[i];
    world = makeWorld();
    L = newLevelState(i, def);
    scene.add(L.root);
    let out = null;
    try {
      applyFilmLook(def);
      { const B = makeBuilder(); def.build(B); B.finish(); }
      voidLook(L);
      levelMeta[i] = { blue: L.objs.some((o) => o.fixed) };
      const c = L.bounds.getCenter(V3());
      sun.position.set(c.x + 9, c.y + 26, c.z + 7);
      sun.target.position.copy(c);
      sun.target.updateMatrixWorld();
      L.root.updateMatrixWorld(true);
      updateBeams();
      const o = document.createElement('canvas');
      o.width = 320; o.height = 200;
      pCam.aspect = o.width / o.height;
      pCam.updateProjectionMatrix();
      pCam.position.set(L.start[0], L.start[1] + EYE + 0.45, L.start[2] + 1.1);
      pCam.rotation.set(-0.2, L.startYaw, 0);
      pCam.updateMatrixWorld();
      drawSmall(pCam, o);
      out = o.toDataURL('image/jpeg', 0.82);
    } finally {
      scene.remove(L.root);
      freeLevelState(L);
      L = keep.L; world = keep.world; player = keep.player;
      if (L) { scene.add(L.root); applyFilmLook(L.def); }
      voidLook(L);
      sun.position.copy(sunPos);
      sun.target.position.copy(sunTgt);
      sun.target.updateMatrixWorld();
      ghost.group.visible = gv[0]; ghost.beam.visible = gv[1]; ghost.drop.visible = gv[2];
    }
    previews[i] = out;
  }
  function onPreviewReady(i) {
    if (menu.hidden) return;
    if (panel === 'chambers' && cardEls[i]) { setPreviewImg(cardEls[i].img, i); cardEls[i].tags.innerHTML = cardTags(i); }
    if (panel === 'home' && L && L.idx === i && !running) setPreviewImg(nowImg, i);
  }

  // ------------------------------------------------------------------ hints: an overhead cutaway of the chamber
  // Build a chamber on its own (whatever is loaded is set aside), run fn, and put everything back.
  function isolate(i, fn) {
    FX.setShown(false);
    try { return isolateInner(i, fn); } finally { FX.setShown(true); }
  }
  function isolateInner(i, fn) {
    const keep = { L, world, player };
    const sunPos = sun.position.clone(), sunTgt = sun.target.position.clone();
    const ghosts = [ghost.group, ghost.beam, ghost.drop, ghost.arc, ghost.hit, ghost.lz.end, ...ghost.dots, ...ghost.lz.dots, ...ghost.lz.cores];
    const gv = ghosts.map((m) => m.visible);
    ghosts.forEach((m) => { m.visible = false; });
    if (keep.L) scene.remove(keep.L.root);
    const def = LEVELS[i];
    world = makeWorld();
    L = newLevelState(i, def);
    scene.add(L.root);
    try {
      applyFilmLook(def);
      { const B = makeBuilder(); def.build(B); B.finish(); }
      voidLook(L);
      const c = L.bounds.getCenter(V3());
      sun.position.set(c.x + 9, c.y + 26, c.z + 7);
      sun.target.position.copy(c);
      sun.target.updateMatrixWorld();
      L.root.updateMatrixWorld(true);
      updateBeams();
      return fn();
    } finally {
      scene.remove(L.root);
      freeLevelState(L);
      L = keep.L; world = keep.world; player = keep.player;
      if (L) { scene.add(L.root); applyFilmLook(L.def); }
      voidLook(L);
      sun.position.copy(sunPos);
      sun.target.position.copy(sunTgt);
      sun.target.updateMatrixWorld();
      ghosts.forEach((m, k) => { m.visible = gv[k]; });
    }
  }
  const oCam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 600);
  oCam.rotation.order = 'YXZ';
  const OV_W = 1000, OV_H = 625;
  const overviews = [];
  // where each walkthrough step happens, in the chamber as it starts
  function stepPoint(st, prev) {
    const floorAt = (x, z) => {
      rc.set(V3(x, 40, z), V3(0, -1, 0)); rc.near = 0; rc.far = 80;
      const hit = rc.intersectObjects(L.rayStatic.filter((m) => !m.userData.overhead), false)[0];
      return hit ? hit.point.y : 1;
    };
    const ofKind = (k) => { const o = L.objs.find((q) => q.kind === k); return o ? objPos(o) : null; };
    if (st.snap) return { type: 'snap', p: typeof st.snap === 'string' ? ofKind(st.snap) : V3(...st.snap) };
    if (st.expose) return { type: 'expose', p: typeof st.expose === 'string' ? ofKind(st.expose) : V3(...st.expose) };
    const at = (q) => V3(q[0], st.rest != null ? st.rest + 0.3 : q[1], q[2]);
    if (st.print) return { type: 'print', p: at(st.print) };
    if (st.zprint) return { type: 'print', p: at(st.zprint) };
    if (st.tap) return { type: 'snap', p: ofKind(typeof st.tap === 'string' ? st.tap : 'shuttle') };
    if (st.launch) return { type: 'launch', p: V3(...st.launch) };
    if (st.go) return { type: 'go', p: V3(st.go[0], floorAt(st.go[0], st.go[1]) + 0.05, st.go[1]) };
    if (st.leap) return { type: 'go', p: V3(st.leap[2], floorAt(st.leap[2], st.leap[3]) + 0.05, st.leap[3]) };
    if (st.walkin) return prev ? { type: 'walkin', p: prev.clone() } : null;
    if (st.exit) { const e = L.exits[0]; return e ? { type: 'exit', p: V3(e.x + 0.5, e.y + 0.05, e.z + 0.5) } : null; }
    return null;
  }
  function renderOverview(i) {
    return isolate(i, () => {
      const r = L.room;
      const hidden = [];
      L.root.traverse((m) => { if (m.isMesh && m.userData.overhead && m.visible) { m.visible = false; hidden.push(m); } });
      // look down on it from the +x side, so the chamber reads left to right the way you go through it
      oCam.rotation.set(-1.12, Math.PI / 2, 0);
      const lo = r ? V3(r.xa, 0.5, r.za) : L.bounds.min.clone(), hi = r ? V3(r.xb + 1, r.h + 1, r.zb + 1) : L.bounds.max.clone();
      const ctr = lo.clone().add(hi).multiplyScalar(0.5);
      oCam.position.copy(ctr).add(V3(0, 0, 1).applyQuaternion(new T.Quaternion().setFromEuler(oCam.rotation)).multiplyScalar(200));
      oCam.updateMatrixWorld();
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const cx of [lo.x, hi.x]) for (const cy of [lo.y, hi.y]) for (const cz of [lo.z, hi.z]) {
        const v = V3(cx, cy, cz).applyMatrix4(oCam.matrixWorldInverse);
        x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
      }
      const pad = 1.6, ar = OV_W / OV_H;
      x0 -= pad; x1 += pad; y0 -= pad; y1 += pad;
      let w = x1 - x0, h = y1 - y0;
      if (w / h < ar) { const d = (h * ar - w) / 2; x0 -= d; x1 += d; w = h * ar; } else { const d = (w / ar - h) / 2; y0 -= d; y1 += d; h = w / ar; }
      // the render fills the whole canvas, so widen the view to its shape; the 16:10 middle is what we keep
      const ca = renderer.domElement.width / Math.max(1, renderer.domElement.height);
      if (ca > ar) { const d = (h * ca - w) / 2; x0 -= d; x1 += d; } else { const d = (w / ca - h) / 2; y0 -= d; y1 += d; }
      Object.assign(oCam, { left: x0, right: x1, top: y1, bottom: y0 });
      oCam.updateProjectionMatrix();
      renderer.clippingPlanes = [new T.Plane(V3(-1, 0, 0), (r ? r.xb + 1 : hi.x) + 0.02)];
      const fog = scene.fog;
      scene.fog = null;
      renderer.render(scene, oCam);
      scene.fog = fog;
      renderer.clippingPlanes = [];
      hidden.forEach((m) => { m.visible = true; });
      const out = document.createElement('canvas');
      out.width = OV_W; out.height = OV_H;
      const src = renderer.domElement, sw = Math.min(src.width, src.height * ar), sh = sw / ar;
      try { out.getContext('2d').drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, OV_W, OV_H); } catch (e) { /* ignore */ }
      // the camera fit the whole canvas aspect, so map through the crop we just took
      const scaleX = src.width / sw, scaleY = src.height / sh;
      const proj = (p) => { const v = p.clone().project(oCam); return [((v.x * scaleX + 1) / 2) * OV_W, ((1 - v.y * scaleY) / 2) * OV_H]; };
      const marks = [];
      let prev = null;
      for (const st of LEVELS[i].sol || []) {
        const sp = stepPoint(st, prev);
        if (sp && sp.p && st.print) prev = sp.p;
        if (!st.say) continue;
        marks.push({ say: st.say, type: sp ? sp.type : 'note', xy: sp && sp.p ? proj(sp.p) : null });
      }
      return { url: out.toDataURL('image/jpeg', 0.86), marks };
    });
  }
  const hxImg = $('hxImg'), hxSvg = $('hxSvg'), hxWait = $('hxWait'), hxText = $('hxText'), hxSteps = $('hxSteps');
  const hxBtns = Array.from(document.querySelectorAll('[data-hx]'));
  let hxIdx = -1, hxLevel = 0, hxOn = 0, hxTimer = 0;
  const MK_COL = { snap: '#ff62b0', print: '#f2a33a', launch: '#ffd23f', expose: '#8f8dff', go: '#eef1f0', walkin: '#ff62b0', exit: '#61e294', note: '#eef1f0' };
  function renderHints() {
    const i = L ? L.idx : 0, lv = LEVELS[i];
    if (i !== hxIdx) { hxIdx = i; hxLevel = 0; hxOn = 0; }
    $('hxEyebrow').textContent = `Chamber ${pad2(i + 1)}`;
    $('hxName').textContent = lv.name;
    hxImg.hidden = true; hxWait.hidden = false;
    hxSvg.innerHTML = '';
    // the render needs the canvas for a frame, so do it just after
    requestAnimationFrame(() => {
      if (!overviews[i]) { try { overviews[i] = renderOverview(i); } catch (e) { overviews[i] = { url: '', marks: [] }; } }
      if (hxIdx !== i) return;
      hxImg.src = overviews[i].url; hxImg.hidden = !overviews[i].url; hxWait.hidden = !!overviews[i].url;
      drawHints();
    });
    drawHints();
    renderGuide();
  }
  function drawHints() {
    const ov = overviews[hxIdx], lv = LEVELS[hxIdx];
    hxBtns.forEach((b) => b.classList.toggle('on', +b.dataset.hx <= hxLevel && hxLevel > 0));
    hxText.textContent = hxLevel === 0 ? 'Stuck? Start with a nudge, and only go further if you need to.' : lv.hint;
    hxSteps.textContent = '';
    hxSvg.innerHTML = '';
    clearInterval(hxTimer);
    if (!ov) return;
    const marks = ov.marks;
    if (hxLevel === 2) {
      // just the things you'll need to photograph
      let svg = '';
      marks.forEach((m) => { if (m.type === 'snap' || m.type === 'expose') if (m.xy) svg += `<g class="mk key"><circle class="ring" cx="${m.xy[0]}" cy="${m.xy[1]}" r="34"/><circle class="dot" cx="${m.xy[0]}" cy="${m.xy[1]}" r="9" fill="${MK_COL[m.type]}"/></g>`; });
      hxSvg.innerHTML = svg;
      hxText.textContent = lv.hint + ' The rings mark what you will want to photograph.';
    }
    if (hxLevel === 3) {
      const pts = marks.filter((m) => m.xy);
      let svg = pts.length > 1 ? `<polyline class="hx-path" points="${pts.map((m) => m.xy.join(',')).join(' ')}"/>` : '';
      marks.forEach((m, k) => {
        if (!m.xy) return;
        svg += `<g class="mk" data-k="${k}"><circle class="halo" cx="${m.xy[0]}" cy="${m.xy[1]}" r="26" fill="${MK_COL[m.type]}" opacity=".35"/><circle class="dot" cx="${m.xy[0]}" cy="${m.xy[1]}" r="17" fill="${MK_COL[m.type]}"/><text x="${m.xy[0]}" y="${m.xy[1]}">${k + 1}</text></g>`;
      });
      hxSvg.innerHTML = svg;
      marks.forEach((m, k) => {
        const li = document.createElement('li');
        li.textContent = m.say;
        li.addEventListener('click', () => { hxOn = k; clearInterval(hxTimer); showStep(); });
        hxSteps.appendChild(li);
      });
      hxOn = 0;
      showStep();
      // play the steps through, one at a time
      hxTimer = setInterval(() => { if (menu.hidden || panel !== 'hints') { clearInterval(hxTimer); return; } hxOn = (hxOn + 1) % (marks.length + 1); showStep(); }, 1700);
    }
  }
  function showStep() {
    const lis = hxSteps.children;
    for (let k = 0; k < lis.length; k++) { lis[k].classList.toggle('on', k === hxOn); lis[k].classList.toggle('done', k < hxOn); }
    hxSvg.querySelectorAll('.mk').forEach((g) => { const k = +g.dataset.k; g.classList.toggle('hidden', k > hxOn); g.classList.toggle('past', k < hxOn); g.classList.toggle('now', k === hxOn); });
  }
  hxBtns.forEach((b) => b.addEventListener('click', () => { const n = +b.dataset.hx; hxLevel = hxLevel === n ? n - 1 : n; drawHints(); }));

  // the field guide: every mechanic as a little looping animation
  const svgWrap = (body) => `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="100" width="200" height="20" fill="#2a3237"/>${body}</svg>`;
  const anim = (attr, values, dur = 3, extra = '') => `<animate attributeName="${attr}" values="${values}" dur="${dur}s" repeatCount="indefinite" ${extra}/>`;
  const GUIDE = [
    { t: 'Photograph, print', p: 'Click to photograph a thing: it leaves the world, and you hold it on your crosshair. Right-click or E prints it back wherever you aim.',
      s: svgWrap(`<rect x="30" y="72" width="28" height="28" fill="#f2a33a">${anim('opacity', '1;1;0;0;0;1', 4)}</rect><rect x="140" y="72" width="28" height="28" fill="#f2a33a" opacity="0">${anim('opacity', '0;0;0;0;1;1', 4)}</rect><rect x="20" y="62" width="48" height="48" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 4">${anim('opacity', '0;1;0;0;0;0', 4)}</rect>`) },
    { t: 'Orange and blue', p: 'Orange prints have weight: they fall and can be shoved. Blue prints hang exactly where you put them.',
      s: svgWrap(`<rect x="45" y="20" width="26" height="26" fill="#f2a33a">${anim('y', '20;74;74;20', 3, 'keyTimes="0;0.4;0.9;1"')}</rect><rect x="130" y="40" width="26" height="26" fill="#4b9bf0"/>`) },
    { t: 'Turn and push', p: 'Hold R and move the mouse (or swipe sideways, or Z and X) to turn a print. Scroll or swipe toward you to pull it closer, away to push it farther.',
      s: svgWrap(`<g transform="translate(100 60)"><rect x="-30" y="-8" width="60" height="16" fill="#f2a33a">${'<animateTransform attributeName="transform" type="rotate" values="0;90;90;0" dur="3s" repeatCount="indefinite"/>'}</rect></g>`) },
    { t: 'Jump pads', p: 'Anything that lands on a pad gets thrown high. Pads can be photographed and printed like anything else.',
      s: svgWrap(`<rect x="80" y="94" width="40" height="6" fill="#f2a33a"/><circle cx="100" cy="86" r="8" fill="#eef1f0">${anim('cy', '86;20;86', 1.2)}</circle>`) },
    { t: 'Beams and mirrors', p: 'Red beams are lethal. A beam that reaches a target powers it, and mirrors bend beams. The preview shows where light will go.',
      s: svgWrap(`<rect x="10" y="40" width="16" height="16" fill="#5d656b"/><line x1="26" y1="48" x2="140" y2="48" stroke="#ff5c7a" stroke-width="3"/><line x1="140" y1="48" x2="140" y2="96" stroke="#ff5c7a" stroke-width="3" stroke-dasharray="4 4"/><line x1="128" y1="36" x2="152" y2="60" stroke="#e9eff2" stroke-width="4"/><rect x="130" y="96" width="20" height="4" fill="#61e294">${anim('opacity', '0.3;1;0.3', 1.5)}</rect>`) },
    { t: 'Plates and doors', p: 'A round iris door opens while its plates are held down and its targets are lit. Crates, blocks and you all count.',
      s: svgWrap(`<rect x="40" y="96" width="30" height="4" fill="#61e294"/><rect x="42" y="60" width="26" height="26" fill="#f2a33a">${anim('y', '20;70;70;20', 3, 'keyTimes="0;0.3;0.9;1"')}</rect><circle cx="150" cy="70" r="26" fill="none" stroke="#61e294" stroke-width="4"/><circle cx="150" cy="70" r="22" fill="#262d32">${anim('r', '22;22;2;2;22', 3, 'keyTimes="0;0.3;0.45;0.9;1"')}</circle>`) },
    { t: 'Light leaks', p: 'Walking through a light leak fogs your film: every photo you carry goes back where it came from.',
      s: svgWrap(`<rect x="90" y="10" width="20" height="90" fill="#ff6a2a" opacity=".45"/><circle cx="40" cy="86" r="8" fill="#eef1f0">${anim('cx', '30;170', 3)}</circle>`) },
    { t: 'Mid-air prints', p: 'You can print in mid-air, but a blue print or pad can’t go higher than where you jumped from. A jump pad’s height counts.',
      s: svgWrap(`<line x1="20" y1="70" x2="180" y2="70" stroke="#ff3b5c" stroke-dasharray="5 5"/><circle cx="100" cy="86" r="8" fill="#eef1f0">${anim('cy', '86;40;70;70', 2.4, 'keyTimes="0;0.4;0.7;1"')}</circle><rect x="86" y="78" width="28" height="6" fill="#4b9bf0" opacity="0">${anim('opacity', '0;0;1;1', 2.4, 'keyTimes="0;0.55;0.6;1"')}</rect>`) },
    { t: 'Underfoot', p: 'You can’t photograph what you’re standing on, or what you just jumped off, until your feet touch something else.',
      s: svgWrap(`<rect x="70" y="80" width="60" height="12" fill="#4b9bf0"/><circle cx="100" cy="72" r="8" fill="#eef1f0"/><path d="M60 40 l80 30 M140 40 l-80 30" stroke="#ff3b5c" stroke-width="3"/>`) },
    { f: 'zoom', t: 'Zoom 400', p: FILMS.zoom.rule,
      s: svgWrap(`<rect x="40" y="88" width="20" height="6" fill="#f2a33a"/><rect x="100" y="88" width="80" height="12" fill="#f2a33a" opacity=".2">${anim('opacity', '0;0;1;1', 3, 'keyTimes="0;0.4;0.5;1"')}</rect>`) },
    { f: 'copy', t: 'Double-X 400', p: FILMS.copy.rule,
      s: svgWrap(`<rect x="40" y="72" width="28" height="28" fill="#f2a33a"/><rect x="130" y="72" width="28" height="28" fill="#f2a33a" opacity="0">${anim('opacity', '0;0;1;1', 3, 'keyTimes="0;0.4;0.5;1"')}</rect>`) },
    { f: 'motion', t: 'Action 800', p: FILMS.motion.rule,
      s: svgWrap(`<rect x="170" y="40" width="6" height="60" fill="#d8eef6" opacity=".7">${anim('opacity', '0.7;0.7;0;0', 2, 'keyTimes="0;0.55;0.6;1"')}</rect><rect x="20" y="50" width="20" height="20" fill="#f2a33a">${anim('x', '20;175', 2)}</rect>`) },
    { f: 'postcard', t: 'Postcard 100', p: FILMS.postcard.rule,
      s: svgWrap(`<rect x="60" y="40" width="30" height="58" fill="#1d4a6a" stroke="#ff62b0" stroke-width="3"/><circle cx="160" cy="98" r="14" fill="none" stroke="#ff62b0" stroke-width="3"/><circle cx="30" cy="86" r="8" fill="#eef1f0">${anim('cx', '30;75;160;160', 3, 'keyTimes="0;0.4;0.41;1"')}</circle>`) },
    { f: 'postcard', t: 'Carry your speed', p: 'You keep your speed through a postcard, upwards too. Bounce off a pad into one and you shoot out of the spot, still flying.',
      s: svgWrap(`<rect x="18" y="96" width="40" height="6" fill="#f2a33a"/><rect x="50" y="34" width="20" height="62" fill="#1d4a6a" stroke="#ff62b0" stroke-width="3"/><ellipse cx="150" cy="101" rx="18" ry="5" fill="none" stroke="#ff62b0" stroke-width="3"/><rect x="128" y="22" width="44" height="8" fill="#9aa3a8"/><circle cx="26" cy="89" r="7" fill="#eef1f0">${anim('cx', '20;38;58;58', 2.4, 'keyTimes="0;0.25;0.45;1"')}${anim('cy', '89;84;56;56', 2.4, 'keyTimes="0;0.25;0.45;1"')}${anim('opacity', '1;1;1;0;0', 2.4, 'keyTimes="0;0.25;0.44;0.46;1"')}</circle><circle cx="150" cy="92" r="7" fill="#eef1f0" opacity="0">${anim('cy', '92;92;92;14;14', 2.4, 'keyTimes="0;0.45;0.46;0.8;1"')}${anim('opacity', '0;0;1;1;1', 2.4, 'keyTimes="0;0.45;0.46;0.8;1"')}</circle>`) },
    { f: 'exposure', t: 'Slow 25', p: FILMS.exposure.rule,
      s: svgWrap(`<rect x="30" y="60" width="140" height="10" fill="#4b9bf0" opacity="0">${anim('opacity', '0;0;1;1', 3, 'keyTimes="0;0.6;0.65;1"')}</rect><rect x="30" y="60" width="24" height="10" fill="#4b9bf0">${anim('x', '30;146;30', 2)}</rect>`) },
    { t: 'Fragile glass', p: 'Frosted glass stops beams and your view. Anything fast smashes it. Teal-striped glass grows back unless the whole window breaks at once.',
      s: svgWrap(`<rect x="120" y="30" width="8" height="70" fill="#cfe9f3">${anim('opacity', '1;1;0;0;1', 3, 'keyTimes="0;0.45;0.5;0.85;1"')}</rect><rect x="20" y="60" width="18" height="18" fill="#f2a33a">${anim('x', '20;180', 3)}</rect>`) },
    { t: 'One-way doors', p: 'An amber-ringed door stands open until you go through it, then locks behind you. Take everything you need first.',
      s: svgWrap(`<circle cx="100" cy="70" r="28" fill="none" stroke="#f2a33a" stroke-width="4">${anim('stroke', '#f2a33a;#f2a33a;#ff3b5c;#ff3b5c', 3, 'keyTimes="0;0.6;0.65;1"')}</circle><circle cx="100" cy="70" r="2" fill="#262d32">${anim('r', '2;2;24;24', 3, 'keyTimes="0;0.6;0.7;1"')}</circle><circle cx="40" cy="86" r="8" fill="#eef1f0">${anim('cx', '40;160', 3)}</circle>`) },
    { t: 'The void', p: 'Pits drop out of frame for good. Fall in and the chamber starts again. Anything else that falls in comes back where it started, except copies.',
      s: svgWrap(`<rect x="0" y="96" width="70" height="24" fill="#5d656b"/><rect x="130" y="96" width="70" height="24" fill="#5d656b"/><rect x="70" y="96" width="60" height="24" fill="#0b0e10"/><rect x="40" y="76" width="20" height="20" fill="#f2a33a">${anim('x', '40;90;90;40;40', 3, 'keyTimes="0;0.25;0.6;0.61;1"')}${anim('y', '76;76;130;76;76', 3, 'keyTimes="0;0.25;0.6;0.61;1"')}${anim('opacity', '1;1;0;0;1', 3, 'keyTimes="0;0.25;0.6;0.75;0.85"')}</rect>`) },
    { t: 'Safelights', p: 'Things standing in red safelight don’t show up on film. Move them out of the light, or work around it.',
      s: svgWrap(`<rect x="70" y="10" width="60" height="90" fill="#ff2a1a" opacity=".25"/><rect x="88" y="72" width="24" height="28" fill="#f2a33a"/><path d="M80 40 l40 30 M120 40 l-40 30" stroke="#ff3b5c" stroke-width="3"/>`) },
  ];
  let guideDone = false;
  function renderGuide() {
    if (guideDone) return;
    guideDone = true;
    $('guide').innerHTML = GUIDE.map((g) => `<div class="gcard">${g.s}<h3>${g.t}${g.f ? filmBadge(g.f) : ''}</h3><p>${g.p}</p></div>`).join('');
  }

  // ------------------------------------------------------------------ settings panel
  const ui = {
    sens: $('setSens'), sensOut: $('setSensOut'), rot: $('setRot'), rotOut: $('setRotOut'),
    fov: $('setFov'), fovOut: $('setFovOut'), invert: $('setInvert'), swipeFlip: $('setSwipeFlip'), hints: $('setHints'), hand: $('setHand'), bob: $('setBob'),
    vol: $('setVol'), volOut: $('setVolOut'), music: $('setMusic'), musicOut: $('setMusicOut'), reset: $('resetProgress'),
  };
  const arrowRadios = Array.from(document.querySelectorAll('input[name="setArrows"]'));
  function applySettings() {
    camera.fov = SET.fov;
    camera.updateProjectionMatrix();
    aud((A) => { if (A.ready()) A.setVolumes(SET.music, SET.volume); });
    hud.classList.toggle('no-hints', !SET.hints);
  }
  function syncSettingsUI() {
    ui.sens.value = SET.sens; ui.sensOut.textContent = '×' + Number(SET.sens).toFixed(2);
    ui.rot.value = SET.rot; ui.rotOut.textContent = '×' + Number(SET.rot).toFixed(2);
    ui.fov.value = SET.fov; ui.fovOut.textContent = SET.fov + '°';
    ui.vol.value = SET.volume; ui.volOut.textContent = Math.round(SET.volume * 100) + '%';
    ui.music.value = SET.music; ui.musicOut.textContent = Math.round(SET.music * 100) + '%';
    ui.invert.checked = !!SET.invertY;
    ui.swipeFlip.checked = !!SET.swipeFlip;
    ui.hints.checked = !!SET.hints;
    ui.hand.checked = SET.rig !== false;
    ui.bob.checked = SET.bob !== false;
    arrowRadios.forEach((r) => { r.checked = r.value === SET.arrows; });
  }
  function setOpt(k, v) { SET[k] = v; saveSettings(); applySettings(); syncSettingsUI(); }
  ui.sens.addEventListener('input', () => setOpt('sens', parseFloat(ui.sens.value)));
  ui.rot.addEventListener('input', () => setOpt('rot', parseFloat(ui.rot.value)));
  ui.fov.addEventListener('input', () => setOpt('fov', parseInt(ui.fov.value, 10)));
  ui.vol.addEventListener('input', () => { setOpt('volume', parseFloat(ui.vol.value)); ac(); sfx('click'); });
  ui.music.addEventListener('input', () => { setOpt('music', parseFloat(ui.music.value)); ac(); });
  ui.invert.addEventListener('change', () => setOpt('invertY', ui.invert.checked));
  ui.swipeFlip.addEventListener('change', () => setOpt('swipeFlip', ui.swipeFlip.checked));
  ui.hints.addEventListener('change', () => setOpt('hints', ui.hints.checked));
  ui.hand.addEventListener('change', () => setOpt('rig', ui.hand.checked));
  ui.bob.addEventListener('change', () => setOpt('bob', ui.bob.checked));
  arrowRadios.forEach((r) => r.addEventListener('change', () => { if (r.checked) setOpt('arrows', r.value); }));
  $('settingsForm').addEventListener('submit', (e) => e.preventDefault());
  let resetArmed = 0;
  ui.reset.addEventListener('click', () => {
    if (Date.now() - resetArmed < 3000) {
      clearDone();
      resetArmed = 0;
      ui.reset.textContent = 'Progress reset';
      setTimeout(() => { ui.reset.textContent = 'Reset progress'; }, 1800);
    } else {
      resetArmed = Date.now();
      ui.reset.textContent = 'Click again to confirm';
      setTimeout(() => { if (resetArmed && Date.now() - resetArmed >= 2900) { resetArmed = 0; ui.reset.textContent = 'Reset progress'; } }, 3000);
    }
  });

  // ------------------------------------------------------------------ feedback
  let toastTimer = 0;
  function toast(msg, ms = 2600) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
  }
  function flash(kind) {
    flashEl.className = '';
    void flashEl.offsetWidth;
    flashEl.className = kind;
  }

  // sound lives in audio.js (music, ambience and effects, all synthesised)
  // Sound is a nice-to-have: if the browser's audio misbehaves, carry on in silence rather than break a click.
  let AUD = window.ShutterAudio || null;
  function audioFailed(e) { console.warn('Shutter: sound turned off after an error', e); AUD = null; }
  function aud(f) { if (!AUD) return; try { f(AUD); } catch (e) { audioFailed(e); } }
  function ac() { aud((A) => { A.init(); A.setVolumes(SET.music, SET.volume); }); }
  function sfx(name, v = 1) { aud((A) => { if (A.ready()) A.sfx(name, v); }); }

  // ------------------------------------------------------------------ input
  const LOOK = 0.0022, RESTART_HOLD = 0.7;
  let dragging = false, snapOn = false, rotHold = 0, restartHold = 0, wheelAxis = '', wheelT = 0, wheelAx = 0, wheelAy = 0, limitT = 0;
  const held = () => (L && running && !paused ? L.photos[L.sel] : null);
  // Scrolling (or R + mouse) sets where the print should be; the ghost glides there, straight along its line,
  // instead of jumping a notch at a time.
  function adjustDist(ph, factor) {
    const base = ph.relPos.length();
    let lo = 1.1 / base, hi = 22 / base;
    if (L.def.zoom) { lo = Math.max(lo, MIN_SCALE / ph.scale0); hi = Math.min(hi, MAX_SCALE / ph.scale0); }
    lo = Math.min(lo, hi);
    const cur = ph.distGoal === undefined ? ph.dist : ph.distGoal;
    // the limits only ever stop it: a print that starts nearer than you could pull it (say, a crate you shot from
    // right up close) stays put when you pull, instead of jumping away from you
    let goal = clamp(cur * factor, lo, hi);
    if ((factor < 1 && goal > cur) || (factor > 1 && goal < cur)) goal = cur;
    ph.distGoal = goal;
    // and say so when it won't go any further, so a swipe that does nothing doesn't feel like a missed swipe
    const stuck = (factor < 1 && cur <= lo * 1.001) || (factor > 1 && cur >= hi * 0.999);
    if (stuck && Math.abs(Math.log(factor)) > 0.004 && time - limitT > 1.6) {
      limitT = time;
      toast(factor < 1 ? (L.def.zoom ? 'That’s as small as it prints.' : 'That’s as near as it goes.') : (L.def.zoom ? 'That’s as big as it prints.' : 'That’s as far as it goes.'), 1300);
    }
  }
  // which way a swipe or scroll is moving, as far as your hand goes: positive when it's toward you. On a Mac,
  // scrolling is "natural" unless you've changed it, so fingers moving toward you scroll the other way to a
  // Windows wheel turned toward you. Safari can tell us for sure; elsewhere we go by the system's default.
  function towardYou(dy, e) {
    const natural = typeof e.webkitDirectionInvertedFromDevice === 'boolean' ? e.webkitDirectionInvertedFromDevice : IS_MAC;
    return (natural ? -dy : dy) * (SET.swipeFlip ? -1 : 1);
  }
  function toggleSnap() {
    snapOn = !snapOn;
    sfx('click');
    toast(snapOn ? 'Snap on: prints lock to the grid and 45° steps.' : 'Snap off: free placement and rotation.', 1600);
  }
  // keys that act while held: smooth rotation, arrow-key looking, hold to restart
  function updateInput(dt) {
    if (!running || paused || transition) { restartHold = 0; rotHold = 0; return; }
    const ph = held();
    const dir = (keys.KeyZ ? 1 : 0) - (keys.KeyX ? 1 : 0);
    if (ph && dir) {
      rotHold += dt;
      ph.spin += dir * (55 + Math.min(1, rotHold) * 125) * SET.rot * DEG * dt;
    } else rotHold = 0;
    if (SET.arrows === 'look') {
      const k = 0.9 + SET.sens * 0.6;
      yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 1.9 * k * dt;
      pitch = clamp(pitch + ((keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)) * 1.4 * k * dt * (SET.invertY ? -1 : 1), -1.52, 1.52);
    }
    if (keys.Backspace || keys.Delete) {
      restartHold += dt;
      if (restartHold >= RESTART_HOLD) {
        restartHold = 0;
        keys.Backspace = keys.Delete = false;
        loadLevel(L.idx, 'Chamber reset.');
      }
    } else restartHold = 0;
  }

  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas;
    if (locked) hadLock = true;
    if (!locked && running && !paused && !fallback && !transition) showMenu();
  });
  document.addEventListener('pointerlockerror', lockFailed);

  let dragAxis = '', dragT = 0, dragAx = 0, dragAy = 0;
  document.addEventListener('mousemove', (e) => {
    if (!running || paused) return;
    if (!(locked || (fallback && dragging))) return;
    // some browsers (Chrome on Windows especially) now and then report one huge jump while the mouse is captured
    if (locked && (Math.abs(e.movementX) > 450 || Math.abs(e.movementY) > 450)) return;
    const ph = held();
    if (ph && keys.KeyR) {
      // freehand: sideways turns the print, up and down pushes it away or pulls it in. Like a swipe, each movement
      // picks one of the two and sticks with it, so pushing straight away doesn't also twist it.
      const now = performance.now();
      if (now - dragT > 220) { dragAxis = ''; dragAx = dragAy = 0; }
      dragT = now;
      if (!dragAxis) {
        dragAx += Math.abs(e.movementX); dragAy += Math.abs(e.movementY);
        if (dragAx + dragAy > 6) dragAxis = dragAx > dragAy ? 'x' : 'y';
      }
      if (dragAxis === 'x') ph.spin -= e.movementX * 0.0045 * SET.rot;
      else if (dragAxis === 'y') adjustDist(ph, Math.exp(-e.movementY * 0.0035));
      return;
    }
    const k = LOOK * SET.sens;
    yaw -= e.movementX * k;
    pitch = clamp(pitch - e.movementY * k * (SET.invertY ? -1 : 1), -1.52, 1.52);
  });
  canvas.addEventListener('mousedown', (e) => {
    if (!running || paused) return;
    if (fallback) { dragging = true; return; }
    if (!locked) { requestLock(); return; }
    const alt = IS_MAC && (e.ctrlKey || e.metaKey);  // Control-click is a right-click on a Mac
    if (e.button === 0 && !alt) { if (L.def.exposure) startExposure(); else tryCapture(); }
    else if (e.button === 2 || (e.button === 0 && alt)) tryPrint();
    else if (e.button === 1) { e.preventDefault(); toggleSnap(); }
  });
  window.addEventListener('mouseup', (e) => { dragging = false; if (e.button === 0 && expo) endExposure(); });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('wheel', (e) => {
    if (!canAct()) return;
    e.preventDefault();
    const ph = L.photos[L.sel];
    if (!ph) return;
    const unit = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? 400 : 1;
    let dx = e.deltaX * unit, dy = e.deltaY * unit;
    if (e.shiftKey && Math.abs(dx) < 0.01) { dx = dy; dy = 0; }
    // sideways swipe (or Shift + scroll) turns the print freely; toward you pulls it in, away pushes it out.
    // A swipe keeps the axis it settles on, so a slightly diagonal one doesn't do both. It settles on the first few
    // pixels, not the first twitch, and a swipe that's clearly the other way takes over at once: a Mac keeps
    // sending a flick's scroll for a second after your fingers lift, and that mustn't swallow the next swipe.
    const now = performance.now();
    if (now - wheelT > 120) { wheelAxis = ''; wheelAx = wheelAy = 0; }
    wheelT = now;
    wheelAx = wheelAx * 0.6 + Math.abs(dx); wheelAy = wheelAy * 0.6 + Math.abs(dy);
    if (!wheelAxis) { if (wheelAx + wheelAy < 2) return; wheelAxis = wheelAx > wheelAy ? 'x' : 'y'; }
    else if (wheelAxis === 'x' && wheelAy > 2.5 * wheelAx) wheelAxis = 'y';
    else if (wheelAxis === 'y' && wheelAx > 2.5 * wheelAy) wheelAxis = 'x';
    if (wheelAxis === 'x') ph.spin -= dx * 0.004 * SET.rot;
    else adjustDist(ph, Math.exp(-towardYou(dy, e) * 0.0015));
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (!menu.hidden) {
      if (e.code === 'Escape' && panel !== 'home') showPanel('home');
      return;
    }
    if (!running || paused) return;
    switch (e.code) {
      case 'Space': P.jumpBuf = 0.14; e.preventDefault(); break;
      case 'KeyF': if (L.def.exposure) { if (!e.repeat) startExposure(); } else tryCapture(); break;
      case 'KeyE': tryPrint(); break;
      case 'KeyQ': selectFrame(L.sel + 1); break;
      case 'Digit1': selectFrame(0); break;
      case 'Digit2': selectFrame(1); break;
      case 'Digit3': selectFrame(2); break;
      case 'KeyG': toggleSnap(); break;
      case 'KeyH': hintEl.classList.toggle('faded'); break;
      case 'KeyP': pauseGame(); break;
      case 'Escape': if (fallback) showMenu(); break;
      case 'Backspace': case 'Delete': case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight': e.preventDefault(); break;
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; if (e.code === 'KeyF' && expo) endExposure(); });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

  playBtn.addEventListener('click', () => { if (running) begin(null); else begin(L ? L.idx : nextChamber()); });
  restartBtn.addEventListener('click', () => begin(L.idx));

  // ------------------------------------------------------------------ the camera rig in your hands
  // A camera gun built in a garage: an old rangefinder bolted to the front of a length of drilled aluminium box
  // section, a print unit gaffer-taped on behind it, a wooden pistol grip with a red trigger, a power bank zip-tied
  // underneath and a sight tube on a bracket at the back. It's drawn in its own pass, on top, and it's alive: it lags
  // and swings as you turn and strafe, rides your steps, dips when you land, snaps up to your eye for every photo,
  // shoves forward and spits the print out of its slot when you print, lifts its nose when you walk up to a wall,
  // and its lanyard, trigger cable and luggage tag hang under real gravity.
  function makeHand() {
    const sc = new T.Scene();
    sc.environment = scene.environment;
    const cam = new T.PerspectiveCamera(50, 1, 0.01, 6);
    sc.add(new T.HemisphereLight(0xf1f4f6, 0x23282b, 0.62));
    const key = new T.DirectionalLight(0xfff2e2, 1.3);
    key.position.set(-0.6, 1.4, 1.0);
    const rim = new T.DirectionalLight(0x9ec4ff, 0.6);
    rim.position.set(1.3, 0.5, -0.9);
    const fill = new T.DirectionalLight(0xffe0c0, 0.22);
    fill.position.set(0.3, -0.9, 0.7);
    sc.add(key, rim, fill);

    // ---- surfaces, painted on little canvases
    const R = rng(4242);
    const paint = (w, h, draw, srgb = true, rep = null) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = tex(c, srgb);
      if (rep) t.repeat.set(rep[0], rep[1]);
      return t;
    };
    const aluT = paint(256, 256, (g, W, H) => {
      g.fillStyle = '#b4bcc1'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 1600; i++) {
        g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '55,64,70'},${(R() * 0.11).toFixed(3)})`;
        g.fillRect(R() * W, R() * H, 1, 18 + R() * 110);
      }
      speck(g, W, R, 140, '30,34,36', 0.35);
    }, true, [24, 3]);
    const woodT = paint(128, 256, (g, W, H) => {
      g.fillStyle = '#6a4224'; g.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x++) {
        const w = 0.5 + 0.5 * Math.sin(x * 0.21 + Math.sin(x * 0.047) * 2.4);
        g.fillStyle = `rgba(${(30 + w * 50) | 0},${(16 + w * 26) | 0},${(6 + w * 10) | 0},${(0.22 + w * 0.3).toFixed(2)})`;
        g.fillRect(x, 0, 1, H);
      }
      speck(g, W, R, 500, '25,12,4', 0.3);
      speck(g, W, R, 160, '210,160,110', 0.14);
    }, true, [30, 30]);
    const tapeT = paint(128, 128, (g, W, H) => {
      g.fillStyle = '#8e959a'; g.fillRect(0, 0, W, H);
      g.globalAlpha = 0.16; g.strokeStyle = '#596065';
      for (let i = 0; i < W; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, H); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(W, i); g.stroke(); }
      g.globalAlpha = 1;
      g.lineWidth = 1.5;
      for (let k = 0; k < 6; k++) {
        const y = R() * H;
        g.strokeStyle = `rgba(255,255,255,${(0.08 + R() * 0.14).toFixed(2)})`;
        g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + (R() - 0.5) * 30, W * 0.6, y + (R() - 0.5) * 30, W, y + (R() - 0.5) * 20); g.stroke();
      }
      speck(g, W, R, 300, '0,0,0', 0.18);
    }, true, [40, 40]);
    const leatherT = paint(128, 128, (g, W, H) => {
      g.fillStyle = '#16191b'; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 1100; i++) {
        g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '0,0,0'},${(R() * 0.09).toFixed(3)})`;
        g.beginPath(); g.arc(R() * W, R() * H, 0.8 + R() * 1.8, 0, 6.3); g.fill();
      }
    }, true, [30, 30]);
    const knurlT = paint(128, 16, (g, W, H) => {
      g.fillStyle = '#121416'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#3a4045';
      for (let x = 0; x < W; x += 4) g.fillRect(x, 0, 2, H);
    }, true);
    // the sticker on top of the print unit, written on in marker
    const labelC = document.createElement('canvas');
    labelC.width = 256; labelC.height = 128;
    const labelT = tex(labelC, true);
    // a luggage tag on a string
    const tagC = document.createElement('canvas');
    tagC.width = 96; tagC.height = 160;
    const tagT = tex(tagC, true);
    function drawLabels() {
      let g = labelC.getContext('2d');
      g.fillStyle = '#efe6cf'; g.fillRect(0, 0, 256, 128);
      g.fillStyle = 'rgba(120,90,40,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(R() * 256, R() * 128, 2 + R() * 30, 1);
      g.save(); g.translate(128, 52); g.rotate(-0.05);
      g.fillStyle = '#1b1f22'; g.font = '900 54px "Big Shoulders Display", Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('SHUTTER', 0, 0);
      g.restore();
      g.save(); g.translate(128, 100); g.rotate(0.03);
      g.fillStyle = '#b3261e'; g.font = '700 22px "IBM Plex Mono", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('MK II · DO NOT DROP', 0, 0);
      g.restore();
      labelT.needsUpdate = true;
      g = tagC.getContext('2d');
      g.fillStyle = '#d9c39a'; g.beginPath(); g.moveTo(18, 0); g.lineTo(78, 0); g.lineTo(96, 18); g.lineTo(96, 160); g.lineTo(0, 160); g.lineTo(0, 18); g.closePath(); g.fill();
      g.fillStyle = 'rgba(90,60,20,0.18)'; for (let i = 0; i < 30; i++) g.fillRect(R() * 96, R() * 160, 1 + R() * 20, 1);
      g.fillStyle = '#fff'; g.beginPath(); g.arc(48, 18, 9, 0, 6.3); g.fill();
      g.strokeStyle = '#8c6d3f'; g.lineWidth = 3; g.beginPath(); g.arc(48, 18, 11, 0, 6.3); g.stroke();
      g.fillStyle = '#23272a'; g.font = '700 15px "IBM Plex Mono", monospace'; g.textAlign = 'center';
      g.fillText('IF FOUND', 48, 58); g.fillText('RETURN', 48, 80); g.fillText('TO THE', 48, 100); g.fillText('DARKROOM', 48, 122);
      tagT.needsUpdate = true;
    }
    drawLabels();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLabels).catch(() => {});
    // the film counter on the back of the print unit
    const lcdC = document.createElement('canvas');
    lcdC.width = 128; lcdC.height = 56;
    const lcdT = tex(lcdC, true);
    let lcdKey = '';
    function drawLcd(n, of, film, col) {
      const k = n + '/' + of + film + col;
      if (k === lcdKey) return;
      lcdKey = k;
      const g = lcdC.getContext('2d');
      g.fillStyle = '#0c0f0a'; g.fillRect(0, 0, 128, 56);
      g.fillStyle = col; g.font = '700 30px "IBM Plex Mono", monospace'; g.textBaseline = 'middle';
      g.fillText(n + '/' + of, 8, 22);
      g.font = '600 13px "IBM Plex Mono", monospace';
      g.fillText(film.toUpperCase(), 8, 46);
      g.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < 56; y += 3) g.fillRect(0, y, 128, 1);
      lcdT.needsUpdate = true;
    }

    // ---- materials
    const std = (o) => new T.MeshStandardMaterial(o);
    const alu = std({ color: 0xc4cbd0, map: aluT, metalness: 0.8, roughness: 0.38, envMapIntensity: 0.9 });
    const black = std({ color: 0x15181a, roughness: 0.5, metalness: 0.15 });
    const rubber = std({ color: 0x08090a, roughness: 0.9, envMapIntensity: 0.25, side: T.DoubleSide });
    const wood = std({ color: 0xffffff, map: woodT, roughness: 0.62, metalness: 0 });
    const tape = std({ color: 0xffffff, map: tapeT, roughness: 0.78, metalness: 0.05 });
    const tapeBlack = std({ color: 0x1b1e20, roughness: 0.7 });
    const leather = std({ color: 0xffffff, map: leatherT, roughness: 0.86, metalness: 0.05, envMapIntensity: 0.3 });
    const chrome = std({ color: 0xd2d8dc, metalness: 1, roughness: 0.18, envMapIntensity: 1.1 });
    const brass = std({ color: 0xbb9550, metalness: 0.9, roughness: 0.3 });
    const glass = std({ color: 0x0b1219, metalness: 0.6, roughness: 0.04, envMapIntensity: 2.2 });
    const beige = std({ color: 0xd8d1bf, roughness: 0.55, metalness: 0.02 });
    const beigeDark = std({ color: 0x9c9585, roughness: 0.6 });
    const slotMat = std({ color: 0x050607, roughness: 0.9 });
    const blueBank = std({ color: 0x2b4a63, roughness: 0.45, metalness: 0.2 });
    const red = std({ color: 0xc0281e, roughness: 0.45, metalness: 0.05 });
    const cordMat = std({ color: 0xb2401f, roughness: 0.8 });
    const cableMat = std({ color: 0x101214, roughness: 0.55, metalness: 0.1 });
    const knurl = std({ color: 0xffffff, map: knurlT, roughness: 0.6, metalness: 0.4 });
    const labelMat = std({ color: 0xffffff, map: labelT, roughness: 0.7 });
    const tagMat = std({ color: 0xffffff, map: tagT, roughness: 0.8, side: T.DoubleSide, transparent: true, alphaTest: 0.5 });
    const lampMat = std({ color: 0x111111, emissive: 0xf2a33a, emissiveIntensity: 1.6, roughness: 0.3 });
    const memoMat = std({ color: 0x0e1012, emissive: 0xcfd8dc, emissiveIntensity: 0.55, roughness: 0.5 });
    const recMat = std({ color: 0x220606, emissive: 0xff2a3a, emissiveIntensity: 0.15, roughness: 0.3 });
    const flashMat = std({ color: 0xdfe6ea, emissive: 0xfff6e6, emissiveIntensity: 0.12, roughness: 0.2, metalness: 0.2 });
    const lcdMat = std({ color: 0x000000, emissive: 0xffffff, emissiveMap: lcdT, emissiveIntensity: 1.1, roughness: 0.4 });
    const bankLed = std({ color: 0x041004, emissive: 0x52ff7a, emissiveIntensity: 1.2 });

    // ---- shapes
    function rboxGeo(w, h, d, r) {
      r = Math.max(0.0006, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
      const iw = w - 2 * r, ih = h - 2 * r, c = Math.max(1e-5, Math.min(r * 0.6, iw / 2 - 1e-5, ih / 2 - 1e-5));
      const s = new T.Shape(), x0 = -iw / 2, y0 = -ih / 2;
      s.moveTo(x0 + c, y0);
      s.lineTo(x0 + iw - c, y0); s.quadraticCurveTo(x0 + iw, y0, x0 + iw, y0 + c);
      s.lineTo(x0 + iw, y0 + ih - c); s.quadraticCurveTo(x0 + iw, y0 + ih, x0 + iw - c, y0 + ih);
      s.lineTo(x0 + c, y0 + ih); s.quadraticCurveTo(x0, y0 + ih, x0, y0 + ih - c);
      s.lineTo(x0, y0 + c); s.quadraticCurveTo(x0, y0, x0 + c, y0);
      const geo = new T.ExtrudeGeometry(s, { depth: Math.max(1e-4, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 3 });
      geo.translate(0, 0, -Math.max(1e-4, d - 2 * r) / 2);
      return geo;
    }
    const rig = new T.Group();
    const put = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = rig) => {
      const m = new T.Mesh(geo, mat);
      m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
      parent.add(m);
      return m;
    };
    const rbox = (w, h, d, r, mat, x, y, z, rx, ry, rz, parent) => put(rboxGeo(w, h, d, r), mat, x, y, z, rx, ry, rz, parent);
    const cylZ = (r0, r1, h, mat, x, y, z, seg = 28, open = false, parent) => {
      // along z: r0 at the back (+z, toward you), r1 at the front
      const geo = new T.CylinderGeometry(r0, r1, h, seg, 1, open);
      geo.rotateX(Math.PI / 2);
      return put(geo, mat, x, y, z, 0, 0, 0, parent);
    };
    const cylX = (r, h, mat, x, y, z, seg = 24, parent) => { const geo = new T.CylinderGeometry(r, r, h, seg); geo.rotateZ(Math.PI / 2); return put(geo, mat, x, y, z, 0, 0, 0, parent); };
    const cylY = (r0, r1, h, mat, x, y, z, seg = 24, parent) => put(new T.CylinderGeometry(r0, r1, h, seg), mat, x, y, z, 0, 0, 0, parent);
    const ball = (r, mat, x, y, z, parent) => put(new T.SphereGeometry(r, 14, 10), mat, x, y, z, 0, 0, 0, parent);

    // ---- the build. Rig space: x right, y up, -z forward along the rail; the grip is at the origin.
    // the rail: drilled aluminium box section, rubber-capped
    rbox(0.034, 0.034, 0.58, 0.004, alu, 0, 0, -0.13);
    rbox(0.037, 0.037, 0.012, 0.005, rubber, 0, 0, 0.162);
    rbox(0.037, 0.037, 0.012, 0.005, rubber, 0, 0, -0.424);
    for (const z of [0.115, -0.165, -0.205, -0.385]) for (const sx of [1, -1]) cylX(0.0046, 0.003, slotMat, sx * 0.0168, 0, z, 14);
    // the grip, raked back, with a couple of turns of black tape and a bolted plate on top
    const grip = rbox(0.032, 0.12, 0.05, 0.009, wood, 0, -0.077, 0.074, -0.3, 0, 0);
    rbox(0.035, 0.012, 0.053, 0.004, tapeBlack, 0, 0.012, 0, 0, 0, 0, grip);
    rbox(0.035, 0.012, 0.053, 0.004, tapeBlack, 0, -0.022, 0, 0, 0, 0, grip);
    rbox(0.03, 0.005, 0.06, 0.002, alu, 0, -0.0195, 0.072);
    for (const z of [0.052, 0.092]) cylY(0.0035, 0.0035, 0.003, brass, 0, -0.023, z, 12);
    // trigger housing, a red trigger on a pivot, and a guard bent out of a strip
    rbox(0.026, 0.026, 0.044, 0.004, black, 0, -0.03, 0.02);
    const trig = new T.Group();
    trig.position.set(0, -0.043, 0.006);
    rig.add(trig);
    rbox(0.008, 0.026, 0.009, 0.0026, red, 0, -0.012, 0, 0.18, 0, 0, trig);
    { const geo = new T.TorusGeometry(0.019, 0.0022, 6, 18, Math.PI); put(geo, alu, 0, -0.033, 0.006, 0, Math.PI / 2, Math.PI); }
    // the print unit, taped on, with the slot the prints come out of on the right
    const unit = new T.Group();
    unit.position.set(0, 0.05, -0.07);
    rig.add(unit);
    rbox(0.09, 0.064, 0.13, 0.01, beige, 0, 0, 0, 0, 0, 0, unit);
    // the slot on top, where the prints come up
    put(new T.BoxGeometry(0.068, 0.003, 0.0055), slotMat, 0, 0.0322, -0.03, 0, 0, 0, unit);
    put(new T.BoxGeometry(0.074, 0.002, 0.003), beigeDark, 0, 0.0332, -0.0262, 0, 0, 0, unit);
    for (let k = 0; k < 4; k++) put(new T.BoxGeometry(0.0025, 0.004, 0.05), slotMat, -0.0452, 0.014 - k * 0.009, 0.012, 0, 0, 0, unit);
    put(new T.PlaneGeometry(0.07, 0.035), labelMat, 0, 0.0328, 0.026, -Math.PI / 2, 0, 0.04, unit);
    put(new T.BoxGeometry(0.06, 0.031, 0.003), black, -0.012, 0.007, 0.0655, 0, 0, 0, unit);
    put(new T.PlaneGeometry(0.052, 0.023), lcdMat, -0.012, 0.007, 0.0672, 0, 0, 0, unit);
    const lamp = ball(0.0046, lampMat, 0.03, 0.016, 0.066, unit);
    cylZ(0.0075, 0.0075, 0.007, knurl, 0.03, -0.006, 0.068, 20, false, unit);
    for (const z of [-0.028, -0.108]) rbox(0.097, 0.108, 0.024, 0.008, tape, 0, 0.033, z, 0, 0, (R() - 0.5) * 0.06);
    // the camera itself, a rangefinder bolted to a clamp on the front of the rail
    const camG = new T.Group();
    camG.position.set(0.03, 0.093, -0.33);
    camG.rotation.y = -0.16;
    rig.add(camG);
    rbox(0.17, 0.088, 0.052, 0.008, leather, 0, 0, 0, 0, 0, 0, camG);
    rbox(0.172, 0.016, 0.054, 0.004, chrome, 0, 0.049, 0, 0, 0, 0, camG);
    rbox(0.172, 0.009, 0.054, 0.003, chrome, 0, -0.0445, 0, 0, 0, 0, camG);
    rbox(0.104, 0.022, 0.048, 0.004, chrome, -0.03, 0.067, 0, 0, 0, 0, camG);
    put(new T.BoxGeometry(0.024, 0.012, 0.002), glass, -0.066, 0.067, -0.0245, 0, 0, 0, camG);
    put(new T.BoxGeometry(0.018, 0.012, 0.002), glass, 0.004, 0.067, -0.0245, 0, 0, 0, camG);
    cylY(0.011, 0.011, 0.012, chrome, -0.064, 0.084, 0.004, 24, camG);
    cylY(0.0065, 0.0065, 0.008, black, -0.064, 0.094, 0.004, 16, camG);
    // its back: the viewfinder eyepiece, and the end of a film box tucked in the memo holder. The eyepiece glass is
    // clear: an invisible pane drawn before the rest of the rig holds everything behind it back, so you see right
    // through the camera to the room (most of all with it up at your eye), under a faint blue sheen
    rbox(0.03, 0.02, 0.008, 0.003, black, -0.062, 0.03, 0.028, 0, 0, 0, camG);
    put(new T.PlaneGeometry(0.02, 0.011), new T.MeshBasicMaterial({ colorWrite: false }), -0.062, 0.03, 0.0336, 0, 0, 0, camG).renderOrder = -1;
    const clearGlass = std({ color: 0xa9d2ee, metalness: 0.2, roughness: 0.03, envMapIntensity: 1.8, transparent: true, opacity: 0.2, depthWrite: false });
    put(new T.PlaneGeometry(0.02, 0.011), clearGlass, -0.062, 0.03, 0.0338, 0, 0, 0, camG).renderOrder = 2;
    rbox(0.07, 0.042, 0.004, 0.002, chrome, 0.03, -0.006, 0.0275, 0, 0, 0, camG);
    put(new T.PlaneGeometry(0.062, 0.034), memoMat, 0.03, -0.006, 0.0298, 0, 0, 0, camG);
    const btn = new T.Group();
    btn.position.set(0.058, 0.057, 0.006);
    camG.add(btn);
    cylY(0.0085, 0.0095, 0.01, chrome, 0, 0.005, 0, 24, btn);
    cylY(0.0062, 0.0062, 0.004, red, 0, 0.012, 0, 20, btn);
    const lever = new T.Group();
    lever.position.set(0.034, 0.059, 0.016);
    camG.add(lever);
    put(new T.BoxGeometry(0.05, 0.004, 0.011), chrome, 0.022, 0, 0.004, 0, 0, 0, lever);
    cylY(0.004, 0.004, 0.012, black, 0.046, 0.006, 0.006, 12, lever);
    // the lens, a long hood on the front, and the focus ring you turn when you push or pull
    cylZ(0.037, 0.037, 0.008, chrome, 0.012, -0.003, -0.03, 32, false, camG);
    cylZ(0.031, 0.033, 0.06, black, 0.012, -0.003, -0.063, 32, false, camG);
    const focus = cylZ(0.0345, 0.0345, 0.018, knurl, 0.012, -0.003, -0.05, 40, false, camG);
    cylZ(0.035, 0.045, 0.04, black, 0.012, -0.003, -0.111, 32, true, camG).material = rubber;
    cylZ(0.029, 0.029, 0.003, glass, 0.012, -0.003, -0.094, 32, false, camG);
    for (const sx of [-1, 1]) put(new T.BoxGeometry(0.008, 0.012, 0.012), chrome, sx * 0.089, 0.026, 0, 0, 0, 0, camG);
    const rec = ball(0.0035, recMat, -0.072, 0.03, -0.0262, camG);
    // flash gun on the hot shoe
    put(new T.BoxGeometry(0.018, 0.008, 0.02), chrome, 0.055, 0.0605, 0, 0, 0, 0, camG);
    rbox(0.05, 0.034, 0.036, 0.004, black, 0.055, 0.082, 0, 0, 0, 0, camG);
    put(new T.PlaneGeometry(0.042, 0.022), flashMat, 0.055, 0.083, -0.0185, 0, Math.PI, 0, camG);
    const flashLight = new T.PointLight(0xfff1dc, 0, 0.9, 2);
    flashLight.position.set(0.055, 0.083, -0.06);
    camG.add(flashLight);
    // the clamp it sits on, with a brass thumbscrew, and two zip ties for luck
    rbox(0.046, 0.028, 0.062, 0.004, black, 0, 0.031, -0.33);
    cylX(0.011, 0.012, brass, -0.031, 0.031, -0.33, 24);
    for (const z of [-0.307, -0.353]) rbox(0.05, 0.05, 0.005, 0.002, tapeBlack, 0, 0.018, z);
    // a power bank zip-tied underneath, its charge lights on the side, wired up to the camera
    rbox(0.052, 0.026, 0.09, 0.006, blueBank, 0, -0.032, -0.25);
    for (const z of [-0.222, -0.278]) rbox(0.056, 0.064, 0.005, 0.002, tapeBlack, 0, -0.016, z);
    for (let k = 0; k < 4; k++) ball(0.0018, bankLed, 0.0262, -0.03, -0.235 - k * 0.008);
    for (const [col, ox] of [[red, 0.006], [cableMat, -0.004]]) {
      const curve = new T.CatmullRomCurve3([V3(ox, -0.025, -0.296), V3(0.03 + ox, -0.04, -0.33), V3(0.075 + ox, 0.0, -0.345), V3(0.09 + ox, 0.05, -0.335)]);
      put(new T.TubeGeometry(curve, 20, 0.0018, 6, false), col, 0, 0, 0);
    }
    // a D-ring under the back of the rail for the lanyard
    put(new T.TorusGeometry(0.007, 0.0016, 6, 14), chrome, 0, -0.0225, 0.142, 0, Math.PI / 2, 0);

    // for a photo you put the camera's viewfinder to your eye
    const EYECUP = V3(-0.062, 0.03, 0.034).applyEuler(camG.rotation).add(camG.position);
    const holder = new T.Group();
    holder.add(rig);
    sc.add(holder);

    // ---- things that hang: simulated in the world (so they feel your turns, steps and landings), drawn here
    const UP = V3(0, 1, 0);
    const segGeo = new T.CylinderGeometry(1, 1, 1, 7, 1, true);
    const ropes = [];
    function rope(n, length, radius, mat, a, b) {
      const pts = [];
      for (let i = 0; i <= n; i++) pts.push({ p: V3(), o: V3() });
      const meshes = [];
      for (let i = 0; i < n; i++) { const m = new T.Mesh(segGeo, mat); m.frustumCulled = false; sc.add(m); meshes.push(m); }
      const r = { n, seg: length / n, radius, pts, meshes, a, b, aw: V3(), bw: V3(), paw: V3(), pbw: V3(), live: false };
      ropes.push(r);
      return r;
    }
    const lanyard = rope(9, 0.24, 0.0034, cordMat, V3(0.108, 0.115, -0.316), null);
    const cable = rope(12, 0.46, 0.0024, cableMat, V3(0.004, -0.044, -0.002), V3(0.12, 0.07, -0.318));
    const tagRope = rope(3, 0.05, 0.0011, cordMat, V3(-0.05, 0.12, -0.345), null);
    // a carabiner on the end of the lanyard, the tag on the end of its string
    const clip = new T.Mesh(new T.TorusGeometry(0.008, 0.0017, 6, 16), chrome);
    clip.scale.set(1, 1.5, 1);
    sc.add(clip);
    const tagM = new T.Mesh(new T.PlaneGeometry(0.03, 0.05), tagMat);
    sc.add(tagM);
    // the print coming out of the slot, then falling away
    const cardTex = { t: null };
    const cardFaceMat = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    const card = new T.Group();
    card.add(new T.Mesh(new T.BoxGeometry(0.058, 0.07, 0.0012), std({ color: 0xf3f0e8, roughness: 0.7 })));
    const cardFace = new T.Mesh(new T.PlaneGeometry(0.05, 0.036), cardFaceMat);
    cardFace.position.set(0, 0.009, 0.0007);
    card.add(cardFace);
    card.visible = false;
    sc.add(card);

    // ---- where it sits: at your hip, and up at your eye for a photo
    const HIP = { p: V3(0.25, -0.2, -0.37), r: V3(-0.1, 0.24, -0.08) };
    const EYE_AT = V3(0, 0, -0.042);  // (the eyepiece right on your crosshair)
    const EYE = { p: EYE_AT.clone().sub(EYECUP.clone().applyEuler(new T.Euler(0, 0.16, 0))), r: V3(0, 0.16, 0) };
    // springs: angle (x pitch, y yaw, z roll) and position offsets, with their velocities
    const sp = { ax: 0, ay: 0, az: 0, px: 0, py: 0, pz: 0, vax: 0, vay: 0, vaz: 0, vpx: 0, vpy: 0, vpz: 0 };
    const st = { show: 0, ly: 0, lp: 0, snap: -1, push: -1, card: -1, flash: 0, wall: 0, acc: 0, live: false, ink: new T.Color(0xf2a33a), cv: V3(), cw: V3() };
    const C_INK = { orange: new T.Color(0xf2a33a), blue: new T.Color(0x52a8ff), card: new T.Color(FILMS.postcard.glow || 0xff62b0) };
    const ease = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
    const smooth = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
    // how far up at your eye it is, 0 to 1: up in 70 ms, held there a moment for the shot (long enough to see
    // through the eyepiece), back down in 170 ms
    const RAISE = 0.07, HOLD = 0.2, LOWER = 0.17;
    const eyeAmt = (t) => (t < 0 ? 0 : t < RAISE ? ease(t / RAISE) : t < RAISE + HOLD ? 1 : t < RAISE + HOLD + LOWER ? 1 - smooth((t - RAISE - HOLD) / LOWER) : 0);
    const camInv = new T.Matrix4(), toWorld = new T.Matrix4(), _v = V3(), _w = V3(), _q = new T.Quaternion();
    const wallRay = new T.Raycaster();
    const fwd = V3();

    function springStep(h, t) {
      const K = 150, C = 15, KP = 120, CP = 13.5;
      sp.vax += (-K * (sp.ax - t.ax) - C * sp.vax) * h; sp.ax += sp.vax * h;
      sp.vay += (-K * (sp.ay - t.ay) - C * sp.vay) * h; sp.ay += sp.vay * h;
      sp.vaz += (-K * (sp.az - t.az) - C * sp.vaz) * h; sp.az += sp.vaz * h;
      sp.vpx += (-KP * (sp.px - t.px) - CP * sp.vpx) * h; sp.px += sp.vpx * h;
      sp.vpy += (-KP * (sp.py - t.py) - CP * sp.vpy) * h; sp.py += sp.vpy * h;
      sp.vpz += (-KP * (sp.pz - t.pz) - CP * sp.vpz) * h; sp.pz += sp.vpz * h;
    }
    // verlet, in the world: the ends ride the rig, everything else swings and sags
    function ropeStep(r, h, f) {
      const pts = r.pts, n = r.n, g = -9.8 * h * h;
      _v.copy(r.paw).lerp(r.aw, f);
      if (r.b) _w.copy(r.pbw).lerp(r.bw, f);
      for (let i = 1; i <= n; i++) {
        if (r.b && i === n) continue;
        const q = pts[i];
        const vx = (q.p.x - q.o.x) * 0.986, vy = (q.p.y - q.o.y) * 0.986, vz = (q.p.z - q.o.z) * 0.986;
        q.o.copy(q.p);
        q.p.x += vx; q.p.y += vy + g; q.p.z += vz;
      }
      pts[0].p.copy(_v); pts[0].o.copy(_v);
      if (r.b) { pts[n].p.copy(_w); pts[n].o.copy(_w); }
      for (let it = 0; it < 10; it++) {
        for (let i = 0; i < n; i++) {
          const a = pts[i].p, b = pts[i + 1].p;
          let dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6, k = (d - r.seg) / d;
          const pa = i === 0, pb = r.b && i + 1 === n;
          const wa = pa ? 0 : pb ? 1 : 0.5, wb = pb ? 0 : pa ? 1 : 0.5;
          dx *= k; dy *= k; dz *= k;
          a.x += dx * wa; a.y += dy * wa; a.z += dz * wa;
          b.x -= dx * wb; b.y -= dy * wb; b.z -= dz * wb;
        }
      }
    }
    function ropeReset(r) {
      for (let i = 0; i <= r.n; i++) {
        const t = i / r.n, q = r.pts[i];
        if (r.b) q.p.copy(r.aw).lerp(r.bw, t).add(V3(0, -Math.sin(t * Math.PI) * r.seg * r.n * 0.3, 0));
        else q.p.copy(r.aw).add(V3(0, -r.seg * i, 0));
        q.o.copy(q.p);
      }
      r.paw.copy(r.aw); r.pbw.copy(r.bw);
      r.live = true;
    }
    function drawRope(r) {
      for (let i = 0; i < r.n; i++) {
        _v.copy(r.pts[i].p).applyMatrix4(camInv);
        _w.copy(r.pts[i + 1].p).applyMatrix4(camInv);
        const m = r.meshes[i];
        m.position.copy(_v).add(_w).multiplyScalar(0.5);
        _w.sub(_v);
        const len = _w.length() || 1e-5;
        m.quaternion.setFromUnitVectors(UP, _w.divideScalar(len));
        m.scale.set(r.radius, len + r.radius * 2, r.radius);
        m.visible = true;
      }
    }

    return {
      scene: sc, cam,
      kick() { st.snap = 0; },
      push(ph) {
        st.push = 0;
        if (ph && ph.thumb) {
          if (cardTex.t) cardTex.t.dispose();
          cardTex.t = new T.CanvasTexture(ph.thumb);
          cardTex.t.encoding = T.sRGBEncoding;
          cardFaceMat.map = cardTex.t; cardFaceMat.needsUpdate = true;
          st.card = 0;
          card.visible = true;
        }
      },
      update(dt) {
        if (st.slow) dt *= st.slow;
        const want = SET.rig !== false && running && !paused ? (transition ? 0.4 : 1) : 0;
        st.show += (want - st.show) * (1 - Math.exp(-8 * dt));
        if (!L || st.show < 0.02) {
          st.live = false;
          for (const r of ropes) { r.live = false; r.meshes.forEach((m) => { m.visible = false; }); }
          clip.visible = tagM.visible = false;
          return;
        }
        // how you're moving and turning
        let dyaw = yaw - st.ly;
        if (dyaw > Math.PI) dyaw -= Math.PI * 2;
        if (dyaw < -Math.PI) dyaw += Math.PI * 2;
        const dpitch = st.live ? pitch - st.lp : 0;
        st.ly = yaw; st.lp = pitch;
        if (!st.live) dyaw = 0;
        const wy = clamp(dyaw / Math.max(dt, 1 / 240), -12, 12), wp = clamp(dpitch / Math.max(dt, 1 / 240), -12, 12);
        const v = player.velocity, sy = Math.sin(yaw), cy = Math.cos(yaw);
        const vr = v.x * cy - v.z * sy, vf = -v.x * sy - v.z * cy;
        // walking up to a wall, it lifts its nose out of the way
        fwd.set(-sy * Math.cos(pitch), Math.sin(pitch), -cy * Math.cos(pitch));
        wallRay.set(EYEPOS, fwd); wallRay.near = 0; wallRay.far = 1.2;
        const wh = wallRay.intersectObjects(sightTargets(), false)[0];
        const wallWant = wh ? clamp((1.05 - wh.distance) / 0.6, 0, 1) : 0;
        st.wall += (wallWant - st.wall) * (1 - Math.exp(-10 * dt));
        // jumping and landing
        let landK = 0;
        if (P.landKick) { landK = Math.min(1.6, P.landKick * 0.07); P.landKick = 0; }
        if (P.jumpKick) { sp.vpy -= 0.35; sp.vax -= 0.8; P.jumpKick = 0; }
        if (landK) { sp.vpy -= landK; sp.vax -= landK * 2.2; }
        // what it's springing toward
        const tgt = {
          ay: clamp(-wy * 0.03, -0.17, 0.17), ax: clamp(-wp * 0.03, -0.14, 0.14) + st.wall * 0.55,
          az: clamp(wy * 0.02, -0.12, 0.12) - clamp(vr * 0.012, -0.06, 0.06),
          px: clamp(-vr * 0.0045, -0.03, 0.03), py: grounded() ? 0 : clamp(-v.y * 0.0035, -0.035, 0.03) + st.wall * 0.025,
          pz: clamp(vf * 0.004, -0.025, 0.03) + st.wall * 0.1,
        };
        // a photo: up to your eye, and a kick back off the shot; a print: shove forward
        if (st.snap >= 0) {
          const before = st.snap;
          st.snap += dt;
          if (before < RAISE && st.snap >= RAISE) { st.flash = 1; sp.vax += 2.6; sp.vpz += 0.5; sp.vaz += 1.2; }
          if (st.snap > RAISE + HOLD + LOWER) st.snap = -1;
        }
        if (st.push >= 0) {
          const before = st.push;
          st.push += dt;
          if (before === 0) { sp.vpz -= 0.75; sp.vaz -= 1.4; sp.vax += 0.6; }
          if (st.push > 0.4) st.push = -1;
        }
        // step the springs in small bites, so a slow frame can't blow them up
        st.acc = Math.min(st.acc + dt, 0.1);
        const H = 1 / 240;
        while (st.acc >= H) { springStep(H, tgt); st.acc -= H; }
        // walking bob: a lazy figure of eight
        const bobOn = SET.bob ? 1 : 0.25;
        const bx = Math.sin(P.bob) * P.bobAmp * 0.55 * bobOn, by = -Math.abs(Math.cos(P.bob)) * P.bobAmp * 0.6 * bobOn;
        // breathing
        const br = Math.sin(time * 1.6) * 0.0018, br2 = Math.sin(time * 0.9 + 1) * 0.0022;
        const a = eyeAmt(st.freeze != null ? st.freeze : st.snap), k = 1 - a * 0.8, drop = (1 - st.show) * 0.34;
        holder.position.set(
          HIP.p.x + (EYE.p.x - HIP.p.x) * a + (sp.px + bx + br2) * k,
          HIP.p.y + (EYE.p.y - HIP.p.y) * a + (sp.py + by + br) * k - drop,
          HIP.p.z + (EYE.p.z - HIP.p.z) * a + sp.pz * k);
        holder.rotation.set(
          HIP.r.x + (EYE.r.x - HIP.r.x) * a + sp.ax * k,
          HIP.r.y + (EYE.r.y - HIP.r.y) * a + sp.ay * k,
          HIP.r.z + (EYE.r.z - HIP.r.z) * a + sp.az * k + bx * 1.2);
        holder.updateMatrixWorld(true);
        // the trigger and the shutter button go down for a shot, and stay down through a long exposure
        const pressed = expo || pendingCapture ? 1 : st.snap >= 0 && st.snap < RAISE + HOLD + 0.03 ? 1 : 0;
        trig.rotation.x += ((pressed ? -0.38 : 0) - trig.rotation.x) * (1 - Math.exp(-40 * dt));
        btn.position.y = 0.057 - pressed * 0.004;
        lever.rotation.y = st.snap >= 0 ? -Math.sin(clamp(st.snap / (RAISE + HOLD + LOWER), 0, 1) * Math.PI) * 1.05 : 0;
        // the flash, and the light it throws on the rig
        st.flash = Math.max(0, st.flash - dt * 7);
        flashMat.emissiveIntensity = 0.12 + st.flash * 9;
        flashLight.intensity = st.flash * 3.5;
        // the ink lamp: the photo you're holding; the red light blinks through a long exposure
        const ph = L.photos[L.sel];
        const inkTo = !ph ? null : ph.kind === 'postcard' ? C_INK.card : ph.fixed ? C_INK.blue : C_INK.orange;
        if (inkTo) st.ink.lerp(inkTo, 1 - Math.exp(-12 * dt));
        lampMat.emissive.copy(st.ink);
        lampMat.emissiveIntensity = ph ? 1.9 : 0.12;
        recMat.emissiveIntensity = expo ? (Math.sin(time * 16) > 0 ? 3 : 0.2) : 0.15;
        // the counter on the back: photos held out of the film's frames
        const f = FILMS[levelFilms(L.def)[0]];
        drawLcd(L.photos.length, L.film, f.short || f.name, '#' + new T.Color(f.glow || 0xffb547).getHexString());
        memoMat.emissive.set(f.glow || f.color);
        // the focus ring follows how far you've pushed the print
        if (ph) focus.rotation.z = Math.log(Math.max(0.05, ph.dist)) * 1.8;
        // the print sliding out of its slot, then dropping away
        if (st.card >= 0) {
          st.card += dt;
          const OUT = 0.2;
          if (st.card < OUT) {
            // rising out of the top slot, photo toward you, with a little shiver from the rollers
            if (card.parent !== unit) { unit.add(card); }
            const u = ease(st.card / OUT);
            card.position.set(Math.sin(st.card * 90) * 0.0006, -0.004 + u * 0.064, -0.03);
            card.rotation.set(-0.08 * u, 0, Math.sin(st.card * 60) * 0.01);
          } else {
            if (card.parent !== sc) {
              // let go: from here it's a falling bit of paper, in your view
              card.updateMatrixWorld(true);
              card.matrixWorld.decompose(card.position, card.quaternion, card.scale);
              sc.add(card);
              st.cv.set(0.35 + R() * 0.25, 0.45 + R() * 0.25, 0.1 - R() * 0.2);
              st.cw.set(-3 - R() * 5, (R() - 0.5) * 6, -3 - R() * 5);
            }
            st.cv.y -= 5.5 * dt;
            card.position.addScaledVector(st.cv, dt);
            card.rotation.x += st.cw.x * dt; card.rotation.y += st.cw.y * dt; card.rotation.z += st.cw.z * dt;
            if (st.card > 1.1) { card.visible = false; st.card = -1; }
          }
        }
        // the hanging things: rig points to the world, a few fixed steps of verlet, back into view space to draw
        toWorld.multiplyMatrices(camera.matrixWorld, holder.matrixWorld);
        camInv.copy(camera.matrixWorld).invert();
        for (const r of ropes) {
          r.paw.copy(r.aw); r.pbw.copy(r.bw);
          r.aw.copy(r.a).applyMatrix4(toWorld);
          if (r.b) r.bw.copy(r.b).applyMatrix4(toWorld);
          if (!r.live || r.aw.distanceTo(r.paw) > 0.6) { ropeReset(r); continue; }
        }
        const steps = Math.min(8, Math.max(1, Math.round(dt * 120)));
        for (let s = 1; s <= steps; s++) for (const r of ropes) ropeStep(r, dt / steps, s / steps);
        for (const r of ropes) drawRope(r);
        // the clip and the tag ride the last link of their ropes
        const endOf = (r, out, dir) => {
          out.copy(r.pts[r.n].p).applyMatrix4(camInv);
          dir.copy(r.pts[r.n - 1].p).applyMatrix4(camInv).sub(out).normalize();
        };
        const e1 = V3(), d1 = V3();
        endOf(lanyard, e1, d1);
        clip.position.copy(e1).addScaledVector(d1, -0.008);
        clip.quaternion.setFromUnitVectors(UP, d1);
        clip.visible = true;
        endOf(tagRope, e1, d1);
        tagM.position.copy(e1).addScaledVector(d1, -0.024);
        tagM.quaternion.setFromUnitVectors(UP, d1);
        tagM.rotateY(0.6 + Math.sin(time * 0.7) * 0.4);
        tagM.visible = true;
        st.live = true;
      },
      get visible() { return st.show > 0.02; },
      get st() { return st; }, HIP, EYE, ropes,
      render() {
        if (st.show <= 0.02) return;
        cam.aspect = camera.aspect;
        cam.updateProjectionMatrix();
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(sc, cam);
        renderer.autoClear = true;
      },
    };
  }

  // the hand camera is decoration: if it can't be built or drawn on this machine, play on without it
  const HAND_OFF = { kick() {}, push() {}, update() {}, render() {}, get visible() { return false; } };
  let HAND = HAND_OFF;
  try { HAND = makeHand(); } catch (e) { console.warn('Shutter: hand camera off', e); }
  function handBroke(e) { console.warn('Shutter: hand camera off', e); HAND = HAND_OFF; renderer.autoClear = true; }
  // a frame without the camera in your hands, for photos and prints of the moment
  function renderClean() { if (!NORENDER) renderer.render(scene, camera); }

  // ------------------------------------------------------------------ loop
  let last = performance.now();
  function runCapture() {
    if (!pendingCapture) return;
    const o = pendingCapture;
    pendingCapture = null;
    if (o.spot) finishPostcard(o.spot); else finishCapture(o);
  }
  function frame(now) {
    if (NORENDER) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt;
    // develop one chamber preview per frame while the menu is up
    if (previewQueue.length && paused && !window.__SHUTTER_MANUAL) {
      const i = previewQueue.shift();
      try { renderPreview(i); } catch (e) { previews[i] = null; }
      try { onPreviewReady(i); } catch (e) { console.warn('Shutter: preview', i, e); }
    }
    if (!window.__SHUTTER_MANUAL) {
      if (L && running && !paused && !transition) update(dt);
      if (L) updateVisuals(dt);
    }
    try { HAND.update(dt); } catch (e) { handBroke(e); }
    try { renderPortals(); } catch (e) { console.warn('Shutter: postcard view', e); }
    renderer.render(scene, camera);
    try { HAND.render(); } catch (e) { handBroke(e); }
    runCapture();
    try { snapPreCards(); } catch (e) { console.warn('Shutter: postcard picture', e); }
  }
  // cards built into a chamber get their picture once the chamber is all there
  function snapPreCards() {
    if (!L || !L.preCards.length) return;
    for (const o of L.preCards.splice(0)) {
      if (!L.objs.includes(o)) continue;
      const snap = snapDest(o.dest);
      o.card.getContext('2d').drawImage(snap.card, 0, 0, o.card.width, o.card.height);
      o.own.texs[0].needsUpdate = true;
    }
  }

  // ------------------------------------------------------------------ hot reload + boot
  function saveHot() {
    try { window.claude && window.claude.hot && window.claude.hot.snapshot && window.claude.hot.snapshot(() => ({ level: L ? L.idx : 0, id: L ? L.def.id : '', n: LEVELS.length })); } catch (e) { /* ignore */ }
  }

  function boot(data) {
    // pick up where you were: by the chamber's name, since the order can change between versions
    let lv = nextChamber();
    if (data && data.id) { const k = LEVELS.findIndex((l) => l.id === data.id); if (k >= 0) lv = k; }
    else if (data && Number.isInteger(data.level) && (data.n === LEVELS.length || (data.n === undefined && LEVELS.length === 100))) lv = data.level;
    applySettings();
    loadLevel(clamp(lv, 0, LEVELS.length - 1));
    updateVisuals(0);
    for (const el of document.querySelectorAll('.m-rclick')) el.textContent = IS_MAC ? '⌃ Click' : 'Right-click';
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(any-pointer: fine)').matches) {
      menuNote.textContent = 'Shutter needs a keyboard and a mouse or trackpad. Open it on a computer to play.';
    }
    showMenu('home');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (L && L.sign) drawSign(L); }).catch(() => {});
    requestAnimationFrame(frame);
  }

  // test / debug hook
  window.__shutter = {
    get L() { return L; }, get player() { return player; }, get world() { return world; }, renderOverview, hand: HAND,
    get rinfo() { return { geo: renderer.info.memory.geometries, tex: renderer.info.memory.textures, prog: renderer.info.programs ? renderer.info.programs.length : -1 }; },
    VOIDU, get progs() { return (renderer.info.programs || []).map((q) => q.name); },
    P, LEVELS, loadLevel, tryCapture, tryPrint, selectFrame, computePose, keys,
    setView(y, p) { yaw = y; pitch = p; }, get view() { return { yaw, pitch }; }, get aim() { return aim; }, begin,
    get state() { return { running, paused, transition }; },
    get eye() { return [EYEPOS.x, EYEPOS.y, EYEPOS.z]; },
    get ghostValid() { return ghost.valid; },
    get ghostWhy() { return ghost.pose ? ghost.pose.why : ''; },
    get ghostPos() { return ghost.pose && ghost.pose.valid ? [ghost.pose.pos.x, ghost.pose.pos.y, ghost.pose.pos.z] : null; },
    get snap() { return snapOn; }, toggleSnap, SET, showMenu, showPanel, renderPreview, get previews() { return previews; },
    get aimSpot() { return aimSpot; }, startExposure, endExposure, get expo() { return expo; }, get grounded() { return grounded(); },
    get arcFirst() { return ghost.firstHit && ghost.arc.visible ? [ghost.firstHit.x, ghost.firstHit.y, ghost.firstHit.z] : null; },
    get arcPaths() { return ghost.lastPaths ? ghost.lastPaths.map((pa) => pa.map((q) => [q.x, q.y, q.z])) : null; },
    get arcHit() { return ghost.hit.visible ? [ghost.hit.position.x, ghost.hit.position.y, ghost.hit.position.z] : null; },
    step(n = 1, dt = 1 / 60) {
      for (let i = 0; i < n; i++) {
        time += dt;
        if (L && running && !paused && !transition) update(dt);
        if (L) updateVisuals(dt);
        runCapture();
      }
    },
    teleport(x, y, z) { player.position.set(x, y, z); player.velocity.set(0, 0, 0); P.prev.set(x, y, z); acc = 0; P.support = null; P.airCeil = y; },
    // for the test bot's route planner: is this box clear, how big is that object, would a beam touch you here
    blockedBox(a, b, onlyWorld) { return blocked([aabbObb(V3(a[0], a[1], a[2]), V3(b[0], b[1], b[2]))], null, !!onlyWorld); },
    objBounds(o) { const b = unionBounds(objObbs(o)); return [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z]; },
    beamAt(x, y, z) { const A = V3(x, y + PR, z), Bp = V3(x, y + PH - PR, z); return L.beamSegs.some(([a, b]) => segSegDist(a, b, A, Bp) < PR + 0.08); },
    printAt(x, y, z, yawDeg, scale) {
      const ph = L.photos[L.sel];
      if (!ph) return 'no photo';
      const q = yawQuat(yawDeg * DEG), k = scale || ph.scale0;
      const obbs = obbsFrom(scaleBoxes(ph.boxes, k), V3(x, y, z), q);
      if (blocked(obbs, null, ph.kind === 'postcard')) return 'blocked';
      // could a player really have put it there? (tests flag anything that isn't)
      const warn = [], eye = eyePos(), d = eye.distanceTo(V3(x, y, z));
      if (d > 22.05 || d < 1.05) warn.push('dist ' + d.toFixed(1));
      if (!inSight(eye, V3(x, y, z), obbs)) warn.push('sight');
      if (hitsPlayer(obbs)) warn.push('player');
      if (!grounded() && ph.kind !== 'postcard' && (ph.fixed || ph.kind === 'pad') && !(ph.speed > 0.5 && !ph.fixed) && unionBounds(obbs).max.y > P.airCeil + 0.05) warn.push('air');
      if (L.def.zoom && ph.kind !== 'postcard') {
        const implied = clamp(ph.scale0 * d / ph.relPos.length(), MIN_SCALE, MAX_SCALE);
        if (Math.abs(implied - k) / k > 0.12) warn.push('zoom ' + implied.toFixed(2));
      }
      spawnObj({ kind: ph.kind, boxes: ph.boxes, scale: k, pos: [x, y, z], yaw: yawDeg * DEG, printed: true, fixed: ph.fixed, spawn: ph.spawn, extra: ph.extra });
      L.photos.splice(L.sel, 1);
      L.sel = 0;
      renderStrip();
      return warn.length ? 'ok WARN[' + warn.join(',') + ']' : 'ok';
    },
  };

  // boot once: when the host hands back saved state, or after a moment if it never does
  let booted = false;
  function bootOnce(data) { if (booted) return; booted = true; boot(data || {}); }
  const hot = window.claude && window.claude.hot;
  if (hot && hot.ready) { hot.ready(bootOnce); setTimeout(() => bootOnce((hot && hot.data) || {}), 2500); }
  else bootOnce((hot && hot.data) || {});
})();
