// Tiny WebAudio synth for Sunfall Heat: shots, sirens, cash and jingles. Never crashes without a gesture.
export function createAudio() {
  let ctx = null, muted = false, sirenOsc = null, sirenGain = null;
  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    return ctx;
  }
  function blip(freq, dur, type, vol, slide) {
    if (muted) return;
    const c = ensure(); if (!c) return;
    try {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square'; o.frequency.value = freq;
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), c.currentTime + dur);
      g.gain.value = vol || 0.12; g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
    } catch (e) { /* audio unavailable */ }
  }
  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; if (muted) this.stopSiren(); return muted; },
    isMuted() { return muted; },
    shoot() { blip(720, 0.09, 'square', 0.14, -500); },
    punch() { blip(140, 0.08, 'sine', 0.18, -60); },
    cash() { blip(880, 0.1, 'sine', 0.14); setTimeout(() => blip(1320, 0.14, 'sine', 0.14), 70); },
    missionDone() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.18, 'triangle', 0.15), i * 110)); },
    engine() { blip(90, 0.12, 'sawtooth', 0.05, 40); },
    startSiren() {
      if (muted || sirenOsc) return;
      const c = ensure(); if (!c) return;
      try {
        sirenOsc = c.createOscillator(); sirenGain = c.createGain();
        sirenOsc.type = 'triangle'; sirenOsc.frequency.value = 700; sirenGain.gain.value = 0.03;
        const lfo = c.createOscillator(), lg = c.createGain();
        lfo.frequency.value = 0.7; lg.gain.value = 180; lfo.connect(lg); lg.connect(sirenOsc.frequency);
        sirenOsc.connect(sirenGain); sirenGain.connect(c.destination); sirenOsc.start(); lfo.start();
        sirenOsc._lfo = lfo;
      } catch (e) { sirenOsc = null; }
    },
    stopSiren() { try { if (sirenOsc) { sirenOsc.stop(); if (sirenOsc._lfo) sirenOsc._lfo.stop(); } } catch (e) {} sirenOsc = null; },
  };
}
