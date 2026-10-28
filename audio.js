/* Shutter audio: synthesised live with WebAudio, apart from the recorded lines that play when you fall out of
   the map (sounds/fall*.mp3), which get a different random treatment every time.
   - Music: a generative ambient score. Each film stock has its own key, tempo and instruments, and later chambers
     add layers. It crossfades between styles and goes quiet and dreamy in the menus.
   - Ambience: a room tone, plus hums and textures that swell as you get near beams, portals, shuttles, the void,
     light leaks and safelights.
   - Effects: one-shot sounds for everything you do, with a little shared reverb so the chambers sound like rooms. */
(function () {
  'use strict';
  const AU = {};
  let ctx = null, master = null, comp = null, musicBus = null, sfxBus = null, verb = null, verbSend = null, ambBus = null;
  let musicVol = 0.55, sfxVol = 0.8;
  const rnd = Math.random;

  // ------------------------------------------------------------------ set-up
  function impulse(seconds, decay) {
    const n = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < n; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return buf;
  }
  let noiseBuf = null, brownBuf = null;
  function makeNoise() {
    const n = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    brownBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    const w = noiseBuf.getChannelData(0), b = brownBuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < n; i++) {
      w[i] = rnd() * 2 - 1;
      last = (last + 0.02 * w[i]) / 1.02;
      b[i] = last * 3.5;
    }
  }
  AU.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; return null; }
    master = ctx.createGain(); master.gain.value = 2.6;
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 18; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol * 0.9; musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(master);
    ambBus = ctx.createGain(); ambBus.gain.value = 1; ambBus.connect(sfxBus);
    verb = ctx.createConvolver(); verb.buffer = impulse(2.6, 3.2);
    verbSend = ctx.createGain(); verbSend.gain.value = 0.32;
    verbSend.connect(verb).connect(master);
    makeNoise();
    startAmbience();
    startMusic();
    loadVoices();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  AU.ready = () => !!ctx;
  AU.setVolumes = function (music, effects) {
    musicVol = music; sfxVol = effects;
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(musicVol * 0.9, ctx.currentTime, 0.1);
    sfxBus.gain.setTargetAtTime(sfxVol, ctx.currentTime, 0.05);
  };

  // ------------------------------------------------------------------ building blocks
  const now = () => ctx.currentTime;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function env(g, t, a, peak, d, sustain, r, end) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    if (sustain != null) g.gain.exponentialRampToValueAtTime(Math.max(0.0002, sustain), t + a + d);
    if (end != null) { g.gain.setValueAtTime(Math.max(0.0002, sustain != null ? sustain : peak), end); g.gain.exponentialRampToValueAtTime(0.0001, end + r); }
    else g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + r);
  }
  function out(node, bus, pan, wet) {
    let n = node;
    if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; n.connect(p); n = p; }
    n.connect(bus);
    if (wet) { const s = ctx.createGain(); s.gain.value = wet; n.connect(s).connect(verbSend); }
  }
  // a pitched blip: type, start and end frequency, length, volume
  function tone(type, f0, f1, dur, vol, delay = 0, opt = {}) {
    if (!ctx) return;
    const t = now() + delay, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    env(g, t, opt.a || 0.004, vol, dur, null, 0.01);
    o.connect(g);
    out(g, opt.bus || sfxBus, opt.pan || 0, opt.wet != null ? opt.wet : 0.25);
    o.start(t); o.stop(t + dur + 0.08);
  }
  // a burst of filtered noise
  function noise(dur, freq, vol, delay = 0, q = 0.9, opt = {}) {
    if (!ctx) return;
    const t = now() + delay, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = opt.brown ? brownBuf : noiseBuf;
    src.loop = true;
    src.playbackRate.value = 0.8 + rnd() * 0.4;
    f.type = opt.type || 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (opt.sweep) f.frequency.exponentialRampToValueAtTime(opt.sweep, t + dur);
    env(g, t, opt.a || 0.003, vol, dur, null, 0.02);
    src.connect(f).connect(g);
    out(g, opt.bus || sfxBus, opt.pan || 0, opt.wet != null ? opt.wet : 0.25);
    src.start(t, rnd() * 1.5); src.stop(t + dur + 0.1);
  }

  // ------------------------------------------------------------------ sound effects
  let lastStep = 0;
  AU.sfx = function (name, v = 1, opt = {}) {
    if (!ctx) return;
    const pan = opt.pan || 0;
    switch (name) {
      // the camera
      case 'shutter':
        noise(0.025, 5200, 0.55, 0, 1.2, { wet: 0.15 }); tone('square', 1800, 900, 0.012, 0.05);
        noise(0.05, 2600, 0.4, 0.075, 1.4, { wet: 0.15 }); tone('square', 1400, 700, 0.012, 0.04, 0.075);
        // film advance
        for (let i = 0; i < 6; i++) noise(0.012, 3400 + i * 120, 0.12, 0.16 + i * 0.028, 6, { wet: 0.05 });
        break;
      case 'print':
        noise(0.35, 900, 0.18, 0, 0.7, { sweep: 3800, a: 0.05 });
        tone('sine', 330, 660, 0.22, 0.12, 0.05); tone('sine', 495, 990, 0.25, 0.08, 0.12);
        tone('triangle', 990, 990, 0.25, 0.04, 0.24);
        break;
      case 'printBlue':
        noise(0.35, 1400, 0.16, 0, 0.7, { sweep: 5200, a: 0.05 });
        tone('sine', 440, 880, 0.22, 0.11, 0.05); tone('sine', 660, 1320, 0.28, 0.08, 0.12);
        tone('sine', 1320, 1320, 0.35, 0.04, 0.24);
        break;
      case 'copy':
        // Double-X: a scanner light sweeping under glass
        noise(0.45, 600, 0.12, 0, 2, { sweep: 4800, a: 0.04 }); tone('sawtooth', 110, 110, 0.4, 0.03, 0, { wet: 0.1 });
        tone('sine', 880, 880, 0.12, 0.05, 0.42);
        break;
      case 'launch':
        noise(0.3, 400, 0.35, 0, 0.6, { sweep: 2600, a: 0.01 }); tone('sawtooth', 90, 300, 0.2, 0.06);
        break;
      case 'open':
        noise(0.06, 3200, 0.35); tone('sine', 140, 120, 0.4, 0.05);
        break;
      case 'err': tone('square', 170, 120, 0.1, 0.05, 0, { wet: 0.05 }); tone('square', 130, 95, 0.12, 0.04, 0.09, { wet: 0.05 }); break;
      case 'select': tone('triangle', 1200, 1500, 0.05, 0.04, 0, { wet: 0.05 }); break;
      case 'snap': tone('triangle', 900, 1100, 0.04, 0.05, 0, { wet: 0.05 }); break;
      // moving about
      case 'jump': noise(0.16, 700, 0.07, 0, 0.6, { sweep: 1600 }); tone('sine', 180, 260, 0.08, 0.04); break;
      case 'land': {
        const k = Math.min(1, v);
        noise(0.09, 160, 0.25 + 0.4 * k, 0, 0.8, { brown: true, wet: 0.12 }); tone('sine', 110, 55, 0.12, 0.06 + 0.12 * k, 0, { wet: 0.1 });
        break;
      }
      case 'step': {
        if (now() - lastStep < 0.12) break;
        lastStep = now();
        const f = 420 + rnd() * 160;
        noise(0.05, f, 0.08 * v, 0, 1.4, { wet: 0.12, pan: (rnd() - 0.5) * 0.3 }); tone('sine', 95 + rnd() * 20, 60, 0.05, 0.03 * v, 0, { wet: 0.05 });
        break;
      }
      case 'pad': tone('sine', 160, 720, 0.24, 0.22); tone('triangle', 320, 1100, 0.2, 0.08, 0.02); noise(0.25, 1500, 0.1, 0, 0.8, { sweep: 4000 }); break;
      case 'thud': noise(0.09, 180, 0.35 * v, 0, 0.7, { brown: true, wet: 0.2, pan }); tone('sine', 90, 50, 0.1, 0.12 * v, 0, { pan }); break;
      case 'glassTick': tone('sine', 2800 + rnd() * 900, 2400, 0.06, 0.05 * v, 0, { pan, wet: 0.35 }); break;
      // the chamber
      case 'door':
        // iris blades: a mechanical whirr with ratchet ticks
        noise(0.55, 500, 0.16, 0, 1.2, { sweep: 1400, a: 0.06 });
        for (let i = 0; i < 9; i++) tone('square', 900 + i * 40, 700, 0.01, 0.025, 0.03 + i * 0.05, { wet: 0.2 });
        tone('triangle', 70, 55, 0.35, 0.12, 0.45, { wet: 0.3 });
        break;
      case 'lock': tone('square', 220, 110, 0.18, 0.07); noise(0.25, 300, 0.25); tone('sine', 90, 60, 0.3, 0.15, 0.1); tone('sine', 1200, 1200, 0.12, 0.03, 0.25); break;
      case 'click': tone('square', 600, 900, 0.05, 0.05, 0, { wet: 0.1 }); tone('sine', 1200, 1200, 0.08, 0.03, 0.04); break;
      case 'unclick': tone('square', 700, 400, 0.05, 0.04, 0, { wet: 0.1 }); break;
      case 'lit': tone('sine', 660, 660, 0.18, 0.07, 0, { wet: 0.4 }); tone('sine', 990, 990, 0.3, 0.06, 0.09, { wet: 0.4 }); break;
      case 'unlit': tone('sine', 660, 440, 0.2, 0.04, 0, { wet: 0.3 }); break;
      case 'fog': noise(0.7, 900, 0.3, 0, 0.4, { sweep: 300 }); tone('sawtooth', 300, 60, 0.6, 0.05); break;
      case 'fizzle': noise(0.4, 6000, 0.18, 0, 2); tone('sine', 900, 300, 0.4, 0.05); break;
      case 'postcard':
        tone('sine', 420, 1260, 0.35, 0.14, 0, { wet: 0.5 }); tone('triangle', 840, 2100, 0.3, 0.06, 0.05, { wet: 0.5 });
        noise(0.35, 2400, 0.12, 0, 0.8, { sweep: 600, wet: 0.5 });
        break;
      case 'shatter':
        noise(0.5, 5200, 0.55, 0, 0.6); noise(0.25, 2600, 0.35, 0.02, 1.5);
        for (let i = 0; i < 8; i++) tone('sine', 2400 + rnd() * 3000, 1800 + rnd() * 2000, 0.12, 0.045, 0.04 + i * 0.045, { wet: 0.5, pan: (rnd() - 0.5) });
        break;
      case 'reglaze': noise(0.35, 7000, 0.12, 0, 3); tone('sine', 1200, 2600, 0.3, 0.05); tone('sine', 1800, 3400, 0.25, 0.03, 0.08); break;
      case 'die': tone('sawtooth', 180, 40, 0.45, 0.12); noise(0.4, 800, 0.2, 0, 0.5, { sweep: 120 }); break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.5, 0.08, i * 0.09, { wet: 0.5 }));
        tone('sine', 1568, 1568, 0.9, 0.05, 0.36, { wet: 0.6 });
        break;
      case 'title': tone('sine', 220, 220, 1.2, 0.06, 0, { wet: 0.6, a: 0.2 }); tone('sine', 330, 330, 1.1, 0.04, 0.05, { wet: 0.6, a: 0.25 }); break;
      case 'newFilm': [392, 523, 659, 784, 1047].forEach((f, i) => tone('sine', f, f, 0.6, 0.06, i * 0.07, { wet: 0.6 })); break;
      case 'spot': tone('sine', 1320, 1320, 0.25, 0.03, 0, { wet: 0.6 }); tone('sine', 1760, 1760, 0.3, 0.025, 0.07, { wet: 0.6 }); break;
      // menus
      case 'uiHover': tone('sine', 1800, 1800, 0.025, 0.012, 0, { wet: 0 }); break;
      case 'uiClick': tone('triangle', 900, 1300, 0.04, 0.05, 0, { wet: 0.05 }); noise(0.02, 4000, 0.06, 0, 2, { wet: 0 }); break;
      case 'uiOpen': noise(0.2, 800, 0.08, 0, 0.7, { sweep: 2400, wet: 0.2 }); break;
    }
  };

  // ------------------------------------------------------------------ the long exposure: a sustained open shutter
  let expo = null;
  AU.exposure = function (on) {
    if (!ctx) return;
    if (on && !expo) {
      const t = now(), src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), o = ctx.createOscillator(), og = ctx.createGain();
      src.buffer = noiseBuf; src.loop = true;
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.3);
      o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(220, t + 3);
      og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.05, t + 0.3);
      src.connect(f).connect(g); o.connect(og);
      out(g, sfxBus, 0, 0.3); out(og, sfxBus, 0, 0.3);
      src.start(t); o.start(t);
      expo = { src, o, g, og };
    } else if (!on && expo) {
      const t = now(), e = expo;
      expo = null;
      e.g.gain.setTargetAtTime(0.0001, t, 0.05); e.og.gain.setTargetAtTime(0.0001, t, 0.05);
      e.src.stop(t + 0.3); e.o.stop(t + 0.3);
    }
  };

  // ------------------------------------------------------------------ voices: falling out of the map
  // Recorded clips (the only sound files), fetched once the sound starts. Each fall picks one, never the same one
  // twice running, and a random treatment, so the same line comes out differently every time. It lasts the whole
  // fall: a long clip plays a stretch as long as the drop, a short one echoes on down the shaft after it, and the
  // air rushes past louder as you pick up speed. It's all cut the moment you land or respawn.
  const VOICES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({ url: 'sounds/fall' + n + '.mp3', snatch: n === 8 || n === 9 }));
  const FALL_FX = ['dive', 'dive', 'abyss', 'abyss', 'plain', 'chipmunk', 'slowmo', 'radio', 'reverse', 'stutter', 'chorus', 'tumble'];
  let voicesAsked = false, lastVoice = -1, lastFx = '', voice = null;
  function loadVoices() {
    if (voicesAsked || !ctx || !window.fetch) return;
    voicesAsked = true;
    VOICES.forEach((v) => {
      fetch(v.url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status))))
        .then((data) => new Promise((res, rej) => ctx.decodeAudioData(data, res, rej)))
        .then((buf) => { v.buf = buf; v.rev = reversed(buf); })
        .catch(() => { /* a clip that won't load just never plays */ });
    });
  }
  function reversed(b) {
    const r = ctx.createBuffer(b.numberOfChannels, b.length, b.sampleRate);
    for (let c = 0; c < b.numberOfChannels; c++) {
      const s = b.getChannelData(c), d = r.getChannelData(c), n = s.length;
      for (let i = 0; i < n; i++) d[i] = s[n - 1 - i];
    }
    return r;
  }
  // a soft clipper, for the walkie-talkie
  let crunch = null;
  function crunchCurve() {
    if (crunch) return crunch;
    crunch = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = (i / 1023) * 2 - 1; crunch[i] = Math.tanh(x * 5) / Math.tanh(5); }
    return crunch;
  }
  AU.fallVoice = function (want, fallT) {
    if (!ctx) return null;
    const ready = VOICES.map((v, i) => (v.buf ? i : -1)).filter((i) => i >= 0);
    if (!ready.length) return null;
    const pool = ready.length > 1 ? ready.filter((i) => i !== lastVoice) : ready;
    const i = pool[Math.floor(rnd() * pool.length)];
    let fx = want;
    if (!fx) do { fx = FALL_FX[Math.floor(rnd() * FALL_FX.length)]; } while (fx === lastFx);
    lastVoice = i; lastFx = fx;
    try { playVoice(VOICES[i], fx, fallT || 0); } catch (e) { return null; }
    return fx + ' ' + (i + 1);
  };
  function playVoice(v, fx, fallT) {
    const t0 = now() + 0.03, buf = v.buf;
    // which bit: all of a short line, a stretch of a long one as long as the fall (a couple of seconds at least)
    let off = 0, len = buf.duration;
    if (v.snatch) { len = Math.min(buf.duration, Math.max(1.8 + rnd() * 1.4, fallT)); off = rnd() * (buf.duration - len); }
    // sources -> [crunch] -> filter -> gain -> pan -> its own bus, with its own reverb and maybe an echo, so that
    // the whole thing, tails and all, can be cut the instant you respawn
    if (voice) AU.stopVoice();
    const nodes = [], srcs = [];
    const mk = (n) => { nodes.push(n); return n; };
    const vbus = mk(ctx.createGain());
    vbus.connect(sfxBus);
    const filt = mk(ctx.createBiquadFilter()), g = mk(ctx.createGain());
    filt.type = 'allpass';
    let head = filt;
    filt.connect(g);
    let tail = g;
    const pan = ctx.createStereoPanner ? mk(ctx.createStereoPanner()) : null;
    if (pan) { g.connect(pan); tail = pan; }
    tail.connect(vbus);
    let wet = 0.22, echo = null, dur = 0;
    const rate = 0.94 + rnd() * 0.14;
    const play = (b, r, at, o, l) => {
      const s = ctx.createBufferSource();
      s.buffer = b; s.playbackRate.setValueAtTime(r, at); s.connect(head); s.start(at, o, l);
      srcs.push(s);
      return s;
    };
    const addEcho = (delayT, fb, toneHz, level) => {
      const d = mk(ctx.createDelay(1.5)), lp = mk(ctx.createBiquadFilter()), back = mk(ctx.createGain()), lvl = mk(ctx.createGain());
      d.delayTime.value = delayT; lp.type = 'lowpass'; lp.frequency.value = toneHz; back.gain.value = fb; lvl.gain.value = level;
      tail.connect(d); d.connect(lp); lp.connect(back); back.connect(d); lp.connect(lvl); lvl.connect(vbus);
      return delayT / Math.max(0.05, 1 - fb) * 3;
    };
    switch (fx) {
      case 'dive': {
        // you drop away from your own voice: it sinks in pitch and dulls as it goes
        const r0 = 1 + rnd() * 0.12, r1 = 0.4 + rnd() * 0.14;
        dur = len / ((r0 + r1) / 2);
        const s = play(buf, r0, t0, off, len);
        s.playbackRate.exponentialRampToValueAtTime(r1, t0 + dur);
        filt.type = 'lowpass'; filt.Q.value = 0.7;
        filt.frequency.setValueAtTime(14000, t0); filt.frequency.exponentialRampToValueAtTime(650, t0 + dur);
        wet = 0.45;
        if (rnd() < 0.5) echo = addEcho(0.18 + rnd() * 0.1, 0.4, 1800, 0.4);
        break;
      }
      case 'abyss': {
        // shouted down a very deep hole
        dur = len / rate;
        play(buf, rate, t0, off, len);
        echo = addEcho(0.24 + rnd() * 0.12, 0.5 + rnd() * 0.1, 2200, 0.6);
        wet = 0.6;
        break;
      }
      case 'chipmunk': { const r = 1.45 + rnd() * 0.3; dur = len / r; play(buf, r, t0, off, len); wet = 0.15; break; }
      case 'slowmo': {
        const r = 0.58 + rnd() * 0.14; dur = len / r; play(buf, r, t0, off, len);
        filt.type = 'lowpass'; filt.frequency.value = 4200; wet = 0.35;
        break;
      }
      case 'radio': {
        // over a cheap walkie-talkie, with a squelch at the end
        const sh = mk(ctx.createWaveShaper());
        sh.curve = crunchCurve(); sh.connect(filt); head = sh;
        filt.type = 'bandpass'; filt.frequency.value = 1700; filt.Q.value = 0.8;
        dur = len / rate; play(buf, rate, t0, off, len);
        noise(dur, 3200, 0.025, t0 - now(), 1.5, { wet: 0, bus: vbus });
        tone('square', 1400, 1400, 0.07, 0.025, t0 - now() + dur + 0.02, { wet: 0, bus: vbus });
        wet = 0.05;
        break;
      }
      case 'reverse': {
        // backwards, into a big room
        dur = len / rate;
        play(v.rev, rate, t0, buf.duration - off - len, len);
        wet = 0.6;
        break;
      }
      case 'stutter': {
        // the first syllable, three times over
        const c = 0.09 + rnd() * 0.06, gap = c * 1.06;
        for (let k = 0; k < 3; k++) play(buf, rate, t0 + k * gap, off, c);
        play(buf, rate, t0 + 3 * gap, off, len);
        dur = 3 * gap + len / rate;
        break;
      }
      case 'chorus': {
        // two of you, slightly out of tune
        play(buf, 0.92, t0, off, len); play(buf, 1.09, t0 + 0.03, off, len);
        dur = len / 0.92 + 0.03; wet = 0.35;
        break;
      }
      default: { // 'tumble', and 'plain'
        dur = len / rate;
        const s = play(buf, rate, t0, off, len);
        if (fx === 'tumble' && pan) {
          // spinning end over end: from ear to ear, with a wobble
          const n = 64, pc = new Float32Array(n), rc = new Float32Array(n), hz = 2 + rnd() * 1.5, ph = rnd() * 6.28;
          for (let k = 0; k < n; k++) { const tt = (k / (n - 1)) * dur; pc[k] = 0.9 * Math.sin(ph + tt * hz * 6.283); rc[k] = rate * (1 + 0.05 * Math.sin(tt * 18)); }
          pan.pan.setValueCurveAtTime(pc, t0, dur);
          s.playbackRate.cancelScheduledValues(t0);
          s.playbackRate.setValueCurveAtTime(rc, t0, dur);
          wet = 0.3;
        }
      }
    }
    // the rest of the fall: a short line goes on echoing down the shaft after you, duller each time
    const T = Math.max(dur, fallT);
    if (T > dur + 0.35 && !echo) {
      const d = 0.3 + rnd() * 0.12, fill = T - dur + 0.4;
      echo = addEcho(d, Math.min(0.72, Math.max(0.38, 1 - (3 * d) / fill)), 1500, 0.55);
    }
    // and the air rushing past, building as you pick up speed, for as long as you're falling
    if (fallT > 0.6) {
      const ws = ctx.createBufferSource(), wf = mk(ctx.createBiquadFilter()), wg = mk(ctx.createGain()), tv = Math.min(fallT, 1.7);
      ws.buffer = brownBuf; ws.loop = true; ws.playbackRate.value = 1.6;
      wf.type = 'bandpass'; wf.Q.value = 0.7;
      wf.frequency.setValueAtTime(220, t0); wf.frequency.exponentialRampToValueAtTime(900, t0 + tv);
      wg.gain.setValueAtTime(0.0001, t0); wg.gain.exponentialRampToValueAtTime(0.3, t0 + tv); wg.gain.setValueAtTime(0.3, t0 + fallT);
      wg.gain.exponentialRampToValueAtTime(0.0001, t0 + fallT + 0.4);
      ws.connect(wf); wf.connect(wg); wg.connect(vbus);
      ws.start(t0, rnd() * 1.5); ws.stop(t0 + fallT + 0.5);
      srcs.push(ws);
    }
    // level: a quick fade in and out, so a snatch of a long clip doesn't click
    const vol = 0.95;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.setValueAtTime(vol, t0 + Math.max(0.02, dur - 0.08));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.02);
    if (wet) {
      const s = mk(ctx.createGain()), cv = mk(ctx.createConvolver());
      s.gain.value = wet * 0.32; cv.buffer = verb.buffer;
      tail.connect(s); s.connect(cv); cv.connect(vbus);
    }
    // the music ducks under it, the whole way down
    musicBus.gain.setTargetAtTime(musicVol * 0.9 * 0.3, t0, 0.05);
    musicBus.gain.setTargetAtTime(musicVol * 0.9, t0 + T + 0.2, 0.5);
    const me = { vbus, nodes, srcs };
    voice = me;
    // let the nodes go once the echoes have died away
    setTimeout(() => { if (voice === me) voice = null; nodes.forEach((n) => { try { n.disconnect(); } catch (e) { /* gone */ } }); }, (T + (echo || 0) + 3) * 1000);
  }
  // cut the falling clip, echoes, wind and all: dead (30 ms, so it doesn't click) when you respawn, or with a
  // short fade when something catches you
  AU.stopVoice = function (fade = 0.03) {
    if (!ctx || !voice) return;
    const t = now(), v = voice;
    voice = null;
    v.vbus.gain.cancelScheduledValues(t);
    v.vbus.gain.setValueAtTime(v.vbus.gain.value, t);
    v.vbus.gain.linearRampToValueAtTime(0, t + fade);
    v.srcs.forEach((s) => { try { s.stop(t + fade + 0.01); } catch (e) { /* already stopped */ } });
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setTargetAtTime(musicVol * 0.9, t, 0.25);
    setTimeout(() => v.nodes.forEach((n) => { try { n.disconnect(); } catch (e) { /* gone */ } }), (fade + 0.2) * 1000);
  };

  // ------------------------------------------------------------------ ambience that follows where you are
  const amb = {};
  function loopNoise(freq, q, type, brown) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = brown ? brownBuf : noiseBuf; src.loop = true;
    f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.value = 0;
    src.connect(f).connect(g).connect(ambBus);
    src.start();
    return { g, f, src };
  }
  function loopTone(type, freq, filterHz) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.value = filterHz || 1200;
    g.gain.value = 0;
    o.connect(f).connect(g).connect(ambBus);
    o.start();
    return { g, f, o };
  }
  function startAmbience() {
    amb.room = loopNoise(220, 0.4, 'lowpass', true);
    amb.room.g.gain.value = 0.05;
    amb.beam = loopTone('sawtooth', 110, 900);
    amb.beam2 = loopTone('sawtooth', 220.6, 1600);
    amb.portal = loopTone('sine', 330, 2000);
    amb.portal2 = loopTone('sine', 496, 2000);
    amb.shuttle = loopTone('sawtooth', 55, 260);
    amb.safe = loopTone('square', 100, 500);
    amb.leak = loopNoise(3000, 0.6, 'bandpass');
    // the void: a cold, low draught breathing up out of the dark
    amb.void = loopNoise(170, 0.8, 'bandpass', true);
    amb.void2 = loopNoise(620, 2.2, 'bandpass');
  }
  // distances (metres) to the nearest of each thing; Infinity when there's none
  const near = (d, range, max) => (d < range ? max * Math.pow(1 - d / range, 1.6) : 0);
  let crackleT = 0;
  AU.ambience = function (d) {
    if (!ctx) return;
    const t = now(), k = 0.15;
    const set = (a, v) => a.g.gain.setTargetAtTime(v, t, k);
    set(amb.room, d.inside ? 0.05 : 0.02);
    const b = near(d.beam, 7, 0.035);
    set(amb.beam, b * (0.85 + 0.15 * Math.sin(t * 31))); set(amb.beam2, b * 0.5);
    const p = near(d.portal, 6, 0.04);
    set(amb.portal, p); set(amb.portal2, p * 0.6);
    amb.portal.o.frequency.setTargetAtTime(330 + Math.sin(t * 1.3) * 4, t, 0.2);
    set(amb.shuttle, near(d.shuttle, 7, 0.05));
    set(amb.safe, near(d.safe, 6, 0.02));
    set(amb.leak, near(d.leak, 6, 0.05) * (0.6 + 0.4 * rnd()));
    // the draught out of the void swells and sighs in slow gusts, with a thin whistle riding on it
    const vv = near(d.void, 9, 1), gust = 0.55 + 0.3 * Math.sin(t * 0.37) + 0.15 * Math.sin(t * 1.13 + 1.7);
    set(amb.void, vv * 0.11 * gust);
    set(amb.void2, vv * 0.012 * gust * gust);
    amb.void.f.frequency.setTargetAtTime(150 + 60 * gust, t, 0.4);
    amb.void2.f.frequency.setTargetAtTime(560 + 160 * gust, t, 0.6);
    // the odd crackle of light
    const lk = near(d.leak, 6, 1);
    if (lk > 0.05 && t > crackleT) { crackleT = t + 0.05 + rnd() * 0.25; noise(0.02, 4000 + rnd() * 3000, 0.08 * lk, 0, 3, { bus: ambBus, wet: 0.2 }); }
  };
  AU.silence = function () {
    if (!ctx) return;
    const t = now();
    for (const k in amb) amb[k].g.gain.setTargetAtTime(k === 'room' ? 0.02 : 0, t, 0.2);
    AU.exposure(false);
  };

  // ------------------------------------------------------------------ music
  // Each style: a key (MIDI root), a scale, a chord progression in scale degrees, a tempo, and the instruments to use.
  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11], lydian: [0, 2, 4, 6, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10],
    minor: [0, 2, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
  };
  const STYLES = {
    menu: { root: 50, scale: 'lydian', prog: [0, 4, 5, 3], bpm: 64, pad: 'triangle', arp: 0.18, bass: 0, perc: 0, bars: 4, bright: 900 },
    shutter: { root: 48, scale: 'major', prog: [0, 5, 3, 4], bpm: 84, pad: 'triangle', arp: 0.42, bass: 0.5, perc: 0.4, bars: 2, bright: 1300 },
    zoom: { root: 50, scale: 'dorian', prog: [0, 3, 6, 4], bpm: 88, pad: 'sawtooth', arp: 0.5, bass: 0.55, perc: 0.45, bars: 2, bright: 1100 },
    copy: { root: 52, scale: 'minor', prog: [0, 5, 2, 6], bpm: 90, pad: 'triangle', arp: 0.55, bass: 0.6, perc: 0.5, bars: 2, bright: 1200, echo: true },
    motion: { root: 45, scale: 'minor', prog: [0, 6, 5, 4], bpm: 108, pad: 'sawtooth', arp: 0.7, bass: 0.75, perc: 0.75, bars: 1, bright: 1700 },
    postcard: { root: 53, scale: 'lydian', prog: [0, 1, 4, 5], bpm: 76, pad: 'triangle', arp: 0.45, bass: 0.4, perc: 0.3, bars: 2, bright: 1500, echo: true },
    exposure: { root: 46, scale: 'mixo', prog: [0, 6, 3, 4], bpm: 66, pad: 'sawtooth', arp: 0.3, bass: 0.45, perc: 0.25, bars: 4, bright: 800 },
    finale: { root: 49, scale: 'phrygian', prog: [0, 1, 6, 5], bpm: 100, pad: 'sawtooth', arp: 0.75, bass: 0.8, perc: 0.8, bars: 1, bright: 1600, echo: true },
  };
  let style = STYLES.menu, nextStyle = null, intensity = 0;
  let step16 = 0, nextT = 0, barCount = 0, chordIdx = 0, timer = 0, musicOn = true;
  const padVoices = [];
  function startMusic() {
    nextT = now() + 0.2;
    clearInterval(timer);
    timer = setInterval(schedule, 60);
  }
  function chordNotes(st, degree) {
    const sc = SCALES[st.scale], n = [];
    for (const k of [0, 2, 4, 6]) { const i = degree + k; n.push(st.root + sc[i % 7] + 12 * Math.floor(i / 7)); }
    return n;
  }
  function releasePads(t) {
    while (padVoices.length) {
      const v = padVoices.pop();
      v.g.gain.cancelScheduledValues(t);
      v.g.gain.setTargetAtTime(0.0001, t, 0.9);
      v.oscs.forEach((o) => o.stop(t + 4));
    }
  }
  function playPad(st, notes, t, dur) {
    releasePads(t);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = st.bright; f.Q.value = 0.7;
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.07 + rnd() * 0.05; lg.gain.value = st.bright * 0.35;
    lfo.connect(lg).connect(f.frequency);
    lfo.start(t); lfo.stop(t + dur + 5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 1.6);
    f.connect(g);
    out(g, musicBus, 0, 0.55);
    const oscs = [lfo];
    notes.slice(0, intensity > 1 ? 4 : 3).forEach((m, i) => {
      for (const det of [-6, 6]) {
        const o = ctx.createOscillator();
        o.type = st.pad;
        o.frequency.value = mtof(m);
        o.detune.value = det + (rnd() - 0.5) * 4;
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (p) { p.pan.value = (i - 1.5) * 0.25 + det / 40; o.connect(p).connect(f); } else o.connect(f);
        o.start(t); o.stop(t + dur + 5);
        oscs.push(o);
      }
    });
    padVoices.push({ g, oscs });
  }
  function pluck(m, t, vol, st, pan) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = mtof(m);
    f.type = 'lowpass'; f.frequency.value = st.bright * 2.2;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(f).connect(g);
    out(g, musicBus, pan, 0.5);
    if (st.echo) {
      const d = ctx.createDelay(1), fb = ctx.createGain();
      d.delayTime.value = 60 / st.bpm * 0.75; fb.gain.value = 0.32;
      g.connect(d); d.connect(fb).connect(d); const eg = ctx.createGain(); eg.gain.value = 0.5; d.connect(eg).connect(musicBus);
    }
    o.start(t); o.stop(t + 1);
  }
  function bassNote(m, t, len, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = mtof(m);
    f.type = 'lowpass'; f.frequency.value = 420;
    env(g, t, 0.02, vol, 0.25, vol * 0.5, 0.3, t + len);
    o.connect(f).connect(g);
    out(g, musicBus, 0, 0.1);
    o.start(t); o.stop(t + len + 0.5);
  }
  function hat(t, vol, open) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf;
    f.type = 'highpass'; f.frequency.value = 7000;
    env(g, t, 0.002, vol, open ? 0.12 : 0.035, null, 0.01);
    src.connect(f).connect(g);
    out(g, musicBus, (rnd() - 0.5) * 0.4, 0.15);
    src.start(t, rnd()); src.stop(t + 0.2);
  }
  function kick(t, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    env(g, t, 0.003, vol, 0.25, null, 0.02);
    o.connect(g);
    out(g, musicBus, 0, 0.05);
    o.start(t); o.stop(t + 0.35);
  }
  // a camera shutter as a snare: two clicks
  function shutterHit(t, vol) {
    for (const [dt, fq] of [[0, 4200], [0.045, 2600]]) {
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = 1.4;
      env(g, t + dt, 0.002, vol, 0.04, null, 0.01);
      src.connect(f).connect(g); out(g, musicBus, 0, 0.3);
      src.start(t + dt, rnd()); src.stop(t + dt + 0.1);
    }
  }
  let arpSeq = [];
  function schedule() {
    if (!ctx || !musicOn) return;
    const ahead = now() + 0.25;
    while (nextT < ahead) {
      const st = style, spb = 60 / st.bpm, s16 = spb / 4, t = nextT;
      const inBar = step16 % 16;
      if (inBar === 0) {
        if (barCount % st.bars === 0) {
          // a style change waits for a chord change, so it lands on the beat
          if (nextStyle) { style = nextStyle; nextStyle = null; chordIdx = 0; }
          const s2 = style, deg = s2.prog[chordIdx % s2.prog.length];
          const notes = chordNotes(s2, deg);
          playPad(s2, notes.map((m) => m + 12), t, (60 / s2.bpm) * 4 * s2.bars);
          arpSeq = [];
          const sc = SCALES[s2.scale];
          for (let i = 0; i < 8; i++) { const k = deg + [0, 2, 4, 7, 9, 4, 2, 7][i] + (rnd() < 0.2 ? 1 : 0); arpSeq.push(s2.root + 24 + sc[k % 7] + 12 * Math.floor(k / 7)); }
          chordIdx++;
        }
        barCount++;
      }
      const st2 = style, deg2 = st2.prog[(chordIdx - 1 + st2.prog.length) % st2.prog.length];
      // bass on the one and the and-of-three
      if (st2.bass && intensity >= 1 && (inBar === 0 || (inBar === 10 && rnd() < 0.6))) bassNote(st2.root - 12 + SCALES[st2.scale][deg2 % 7], t, spb * 1.5, 0.11 * st2.bass);
      // arpeggio: sparse, a little random, denser later on
      const dens = st2.arp * (0.55 + 0.15 * intensity);
      if (arpSeq.length && inBar % 2 === 0 && rnd() < dens) pluck(arpSeq[(inBar / 2) % arpSeq.length], t, 0.045, st2, (rnd() - 0.5) * 0.7);
      // percussion arrives in later chambers
      if (st2.perc && intensity >= 2) {
        if (inBar % 4 === 2) hat(t, 0.025 * st2.perc, false);
        if (inBar === 14 && rnd() < 0.5) hat(t, 0.02 * st2.perc, true);
      }
      if (st2.perc && intensity >= 3) {
        if (inBar === 0 || (inBar === 8 && rnd() < 0.4)) kick(t, 0.16 * st2.perc);
        if (inBar === 12) shutterHit(t, 0.06 * st2.perc);
      }
      nextT += s16;
      step16++;
    }
  }
  // pick the style for a chamber: its film, and how far in you are (later chambers get more layers)
  AU.setMusic = function (key, level) {
    const st = STYLES[key] || STYLES.shutter;
    intensity = key === 'menu' ? 0 : Math.min(3, 1 + Math.floor((level || 0) / 25));
    if (st !== style) nextStyle = st;
  };
  AU.music = function (on) { musicOn = on; if (!on && ctx) releasePads(now()); };
  // for testing: an analyser on the final mix
  AU._tap = function () { if (!ctx) return null; const an = ctx.createAnalyser(); an.fftSize = 2048; comp.connect(an); return an; };
  window.ShutterAudio = AU;
})();
