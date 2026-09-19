// Musique de cour de récré : un petit groove synthétisé, sans fichier ni licence.
// Tapes de mains, coups de craie, basse qui marche et comptine par-dessus.
// Démarre au premier geste, s'accélère dans les vingt dernières secondes d'une dictée.

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let noise: AudioBuffer | null = null;
let timer: number | null = null;
let enabled = false;
let nextStep = 0;
let step = 0;
let intensity = 0; // 0 = récré tranquille, 1 = la sonnerie approche

try { enabled = localStorage.getItem('rb-music') !== '0'; } catch { /* stockage indisponible */ }

const BPM_CALM = 104;
const BPM_URGENT = 138;
const STEPS = 16; // double-croches sur une mesure à quatre temps
const stepDuration = () => 60 / (BPM_CALM + (BPM_URGENT - BPM_CALM) * intensity) / 4;

// Do majeur pentatonique : la gamme des comptines
const N = { C2: 65.41, F2: 87.31, G2: 98.0, A2: 110.0, C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.0, A3: 220.0, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0, A4: 440.0, C5: 523.25 };

const KICK = [0, 6, 8, 14];
const CLAP = [4, 12];
const BASS: [number, number][] = [[0, N.C2], [3, N.C2], [6, N.G2], [8, N.A2], [11, N.A2], [14, N.F2]];
// deux phrases qui alternent, pour que la boucle ne lasse pas
const TUNES: [number, number][][] = [
  [[0, N.C4], [2, N.E4], [4, N.G4], [7, N.E4], [8, N.A4], [10, N.G4], [12, N.E4], [14, N.D4]],
  [[0, N.G4], [2, N.A4], [5, N.C5], [8, N.G4], [10, N.E4], [12, N.D4], [13, N.E4], [14, N.C4]],
];

function ensure(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  if (!ctx) {
    ctx = new AudioContext();
    bus = ctx.createGain();
    bus.gain.value = 0.15;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 6000;
    // écho court : ça claque comme un préau
    const delay = ctx.createDelay(1);
    delay.delayTime.value = stepDuration() * 3;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.22;
    const wet = ctx.createGain();
    wet.gain.value = 0.18;
    bus.connect(lp).connect(ctx.destination);
    bus.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(lp);

    const frames = ctx.sampleRate * 0.4;
    noise = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

function tone(freq: number, at: number, dur: number, gain: number, type: OscillatorType, slideTo?: number) {
  if (!ctx || !bus) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, at + dur);
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  osc.connect(g).connect(bus);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function hit(at: number, dur: number, gain: number, highpass: number) {
  if (!ctx || !bus || !noise) return;
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  const hp = ctx.createBiquadFilter();
  src.buffer = noise;
  hp.type = 'highpass';
  hp.frequency.value = highpass;
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0008, at + dur);
  src.connect(hp).connect(g).connect(bus);
  src.start(at);
  src.stop(at + dur + 0.02);
}

const kick = (at: number) => tone(120, at, 0.18, 0.5, 'sine', 42);
const clap = (at: number) => hit(at, 0.12, 0.28, 1200);       // tapes de mains
const chalk = (at: number, gain: number) => hit(at, 0.03, gain, 7000); // craie sur le tableau

// Planifie les pas avec un peu d'avance, comme un séquenceur.
function schedule() {
  if (!ctx || !enabled) return;
  while (nextStep < ctx.currentTime + 0.25) {
    const d = stepDuration();
    const i = step % STEPS;
    const bar = Math.floor(step / STEPS);

    if (KICK.includes(i)) kick(nextStep);
    if (CLAP.includes(i)) clap(nextStep);
    if (i % 2 === 0 || intensity > 0.5) chalk(nextStep, i % 4 === 0 ? 0.1 : 0.06);

    const bass = BASS.find(([s]) => s === i);
    if (bass) tone(bass[1], nextStep, d * 2.6, 0.22, 'triangle');

    // la comptine entre une mesure sur deux au calme, tout le temps quand ça presse
    if (bar % 2 === 1 || intensity > 0.4) {
      const tune = TUNES[Math.floor(bar / 2) % TUNES.length].find(([s]) => s === i);
      if (tune) tone(tune[1], nextStep, d * (2 - intensity * 0.8), 0.1 + 0.05 * intensity, 'square');
    }

    nextStep += d;
    step++;
  }
}

export function startMusic() {
  const c = ensure();
  if (!c || !enabled) return;
  if (c.state === 'suspended') void c.resume();
  if (timer !== null) return;
  nextStep = c.currentTime + 0.1;
  timer = window.setInterval(schedule, 60);
  schedule();
}

export function stopMusic() {
  if (timer !== null) { window.clearInterval(timer); timer = null; }
}

// 0 = récré, 1 = dernières secondes : le tempo monte, la comptine se resserre.
export function setMusicIntensity(level: number) {
  intensity = Math.max(0, Math.min(1, level));
}

export function isMusicEnabled() { return enabled; }
export function setMusicEnabled(on: boolean) {
  enabled = on;
  try { localStorage.setItem('rb-music', on ? '1' : '0'); } catch { /* ignore */ }
  if (on) startMusic(); else stopMusic();
}
