// Lyd uden lydfiler: alt genereres med WebAudio, så appen virker offline.

let ctx = null;
let enabled = true;

export function setEnabled(v) { enabled = !!v; }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/** Skal kaldes fra en rigtig brugerhandling, ellers vil iOS ikke spille. */
export function unlock() { ac(); }

function tone(freq, start, dur, { type = 'sine', gain = 0.16, slideTo = null } = {}) {
  const a = ac();
  if (!a || !enabled) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  correct() { tone(660, 0, .1, { type: 'triangle' }); tone(990, .07, .16, { type: 'triangle' }); },
  combo(n) {
    const base = 660 * Math.pow(1.0595, Math.min(12, n));
    tone(base, 0, .09, { type: 'triangle' }); tone(base * 1.5, .06, .18, { type: 'triangle' });
  },
  wrong() { tone(240, 0, .18, { type: 'sine', gain: .13, slideTo: 150 }); },
  tap() { tone(520, 0, .04, { type: 'square', gain: .05 }); },
  levelUp() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, .3, { type: 'triangle', gain: .15 }));
  },
  finish() {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, .25, { type: 'triangle' }));
    tone(1046, .3, .5, { type: 'triangle', gain: .18 });
  },
  bark() { tone(420, 0, .07, { type: 'sawtooth', gain: .1, slideTo: 300 }); tone(360, .09, .1, { type: 'sawtooth', gain: .09, slideTo: 250 }); },
};
