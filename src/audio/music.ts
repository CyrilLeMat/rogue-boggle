// Musique d'ambiance générative : pentatonique, tempo lent, nappes et notes douces avec écho.
// Aucun fichier, aucune licence : tout est synthétisé. Démarre au premier geste utilisateur.

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let timer: number | null = null;
let enabled = false;
let nextBeat = 0;
let beat = 0;

try { enabled = localStorage.getItem('rb-music') !== '0'; } catch { /* stockage indisponible */ }

const BPM_CALM = 66;
const BPM_URGENT = 112;
let intensity = 0; // 0 = calme, 1 = dernières secondes de la manche
const beatLength = () => 60 / (BPM_CALM + (BPM_URGENT - BPM_CALM) * intensity);
const BEAT = 60 / BPM_CALM; // pour l'écho, fixe
let lowpass: BiquadFilterNode | null = null;
// Do majeur pentatonique sur deux octaves, avec quelques notes basses pour la nappe
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
const PAD_CHORDS = [[130.81, 196.0, 261.63], [110.0, 164.81, 261.63], [146.83, 220.0, 293.66], [98.0, 146.83, 246.94]];

function ensure(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  if (!ctx) {
    ctx = new AudioContext();
    bus = ctx.createGain();
    bus.gain.value = 0.16;
    // écho long et discret pour l'espace
    const delay = ctx.createDelay(2);
    delay.delayTime.value = BEAT * 1.5;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1800;
    lowpass = lp;
    bus.connect(lp).connect(ctx.destination);
    bus.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(lp);
  }
  return ctx;
}

function note(freq: number, at: number, dur: number, gain: number, type: OscillatorType = 'sine') {
  if (!ctx || !bus) return;
  const osc = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc2.type = 'triangle';
  osc.frequency.value = freq;
  osc2.frequency.value = freq * 1.003; // léger désaccord : chaleur
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.08);
  g.gain.exponentialRampToValueAtTime(0.0005, at + dur);
  osc.connect(g);
  osc2.connect(g);
  g.connect(bus);
  osc.start(at); osc2.start(at);
  osc.stop(at + dur + 0.05); osc2.stop(at + dur + 0.05);
}

function pad(freqs: number[], at: number, dur: number) {
  if (!ctx || !bus) return;
  for (const f of freqs) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.05, at + dur * 0.35);
    g.gain.linearRampToValueAtTime(0, at + dur);
    osc.connect(g).connect(bus);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }
}

// Planifie les prochains temps avec un peu d'avance (look-ahead), à la manière d'un séquenceur.
function schedule() {
  if (!ctx || !enabled) return;
  while (nextBeat < ctx.currentTime + 0.6) {
    const b = beatLength();
    if (beat % 8 === 0) pad(PAD_CHORDS[(beat / 8) % PAD_CHORDS.length], nextBeat, b * 8.5);
    // plus l'urgence monte, plus les notes sont fréquentes, courtes et aiguës
    const density = 0.55 + 0.35 * intensity;
    if (Math.random() < density) {
      const idx = Math.min(SCALE.length - 1, Math.floor(Math.pow(Math.random(), 1.4 - 0.6 * intensity) * SCALE.length));
      note(SCALE[idx], nextBeat + (Math.random() < 0.3 ? b / 2 : 0), b * (1.5 + Math.random() * 2) * (1 - 0.4 * intensity), 0.09);
    }
    if (intensity > 0.5 && Math.random() < 0.5) note(SCALE[Math.floor(Math.random() * 5)], nextBeat + b / 2, b, 0.06, 'triangle');
    if (beat % 4 === 2 && Math.random() < 0.4) note(SCALE[Math.floor(Math.random() * 4)] / 2, nextBeat, b * 3, 0.05, 'triangle');
    nextBeat += b;
    beat++;
  }
}

export function startMusic() {
  const c = ensure();
  if (!c || !enabled) return;
  if (c.state === 'suspended') void c.resume();
  if (timer !== null) return;
  nextBeat = c.currentTime + 0.1;
  timer = window.setInterval(schedule, 200);
  schedule();
}

export function stopMusic() {
  if (timer !== null) { window.clearInterval(timer); timer = null; }
}

// 0 = ambiance calme, 1 = fin de manche imminente (tempo, densité et brillance montent)
export function setMusicIntensity(level: number) {
  intensity = Math.max(0, Math.min(1, level));
  if (lowpass && ctx) lowpass.frequency.setTargetAtTime(1800 + 2200 * intensity, ctx.currentTime, 0.3);
}

export function isMusicEnabled() { return enabled; }
export function setMusicEnabled(on: boolean) {
  enabled = on;
  try { localStorage.setItem('rb-music', on ? '1' : '0'); } catch { /* ignore */ }
  if (on) startMusic(); else stopMusic();
}
