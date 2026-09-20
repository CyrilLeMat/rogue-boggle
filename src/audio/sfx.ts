// Petits sons synthétisés (Web Audio), aucun fichier à charger.
// L'AudioContext est créé au premier geste utilisateur (politique autoplay, iOS inclus).

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

try { muted = localStorage.getItem('rb-muted') === '1'; } catch { /* stockage indisponible */ }

function ensure(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function unlockAudio() { ensure(); }

export function isMuted() { return muted; }
export function setMuted(m: boolean) {
  muted = m;
  try { localStorage.setItem('rb-muted', m ? '1' : '0'); } catch { /* ignore */ }
}

interface Tone { freq: number; at?: number; dur?: number; wave?: Wave; gain?: number; slide?: number }

function tone({ freq, at = 0, dur = 0.12, wave = 'sine', gain = 0.25, slide }: Tone) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const semi = (base: number, n: number) => base * Math.pow(2, n / 12);

export const sfx = {
  // une case ajoutée au tracé : petit tic qui monte avec la longueur du mot
  select(index: number) { tone({ freq: semi(523, Math.min(index, 14)), dur: 0.07, wave: 'triangle', gain: 0.12 }); },
  unselect() { tone({ freq: 392, dur: 0.06, wave: 'triangle', gain: 0.08 }); },
  // mot valide : carillon à deux ou trois notes, plus haut quand le mot rapporte plus
  valid(score: number) {
    const lift = Math.min(7, Math.floor(score / 6));
    tone({ freq: semi(523, lift), dur: 0.16, gain: 0.22 });
    tone({ freq: semi(784, lift), at: 0.09, dur: 0.22, gain: 0.2 });
    if (score >= 25) tone({ freq: semi(1047, lift), at: 0.18, dur: 0.3, gain: 0.16 });
  },
  // Le choc d'un gros mot : plus le palier est haut, plus ça cogne bas et longtemps
  impact(tier: number) {
    if (tier < 3) return;
    const depth = tier - 2;
    tone({ freq: 160 - depth * 30, dur: 0.18 + depth * 0.08, wave: 'triangle', gain: 0.22, slide: 0.55 });
    tone({ freq: 90 - depth * 12, at: 0.02, dur: 0.3 + depth * 0.1, wave: 'sine', gain: 0.26, slide: 0.7 });
    if (tier >= 4) [0, 7, 12, 19].forEach((n, i) => tone({ freq: semi(523, n), at: 0.06 + i * 0.05, dur: 0.24, gain: 0.16 }));
    if (tier >= 5) tone({ freq: 1568, at: 0.26, dur: 0.5, wave: 'triangle', gain: 0.14 });
  },
  bonus() {
    [0, 4, 7, 12].forEach((n, i) => tone({ freq: semi(659, n), at: i * 0.06, dur: 0.2, wave: 'triangle', gain: 0.18 }));
  },
  duplicate() { tone({ freq: 330, dur: 0.09, gain: 0.12 }); tone({ freq: 330, at: 0.11, dur: 0.09, gain: 0.1 }); },
  invalid() { tone({ freq: 200, dur: 0.18, wave: 'triangle', gain: 0.18, slide: 0.7 }); },
  success() { [0, 4, 7, 12].forEach((n, i) => tone({ freq: semi(523, n), at: i * 0.11, dur: 0.35, gain: 0.2 })); },
  fail() { tone({ freq: 392, dur: 0.35, gain: 0.18 }); tone({ freq: 311, at: 0.25, dur: 0.5, gain: 0.16 }); },
  buy() { tone({ freq: 880, dur: 0.08, wave: 'square', gain: 0.08 }); tone({ freq: 1320, at: 0.07, dur: 0.14, wave: 'square', gain: 0.07 }); },
  tick() { tone({ freq: 1000, dur: 0.04, wave: 'square', gain: 0.05 }); },
  snail() { [0, 12].forEach((n, i) => tone({ freq: semi(988, n), at: i * 0.05, dur: 0.18, wave: 'triangle', gain: 0.14 })); },
};
