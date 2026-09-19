import type { Dictionary } from './dictionary';
import type { DictEntry } from './types';
import type { Rng } from './rng';

// Le Sage du CM1 : une respiration entre deux dictées. Pas de grille, pas d'adjacence —
// juste des lettres en vrac à remettre dans l'ordre, contre la montre.
export const SAGE_MIN_LEN = 8;
export const SAGE_MAX_LEN = 12;
export const SAGE_AFTER = [3, 7]; // rencontres après ces dictées [tuning]
export const SAGE_HINT_RATIO = 0.5; // le sage souffle la 1re lettre à mi-temps

export function isSageManche(manche: number): boolean {
  return SAGE_AFTER.includes(manche);
}

// Chrono : plus le mot est long, plus on laisse de temps. [tuning]
export function sageSeconds(length: number): number {
  return 15 + 3 * length;
}

// Récompense : l'équivalent d'une belle fourniture, plus le temps restant. [tuning]
export function sageReward(length: number, secondsLeft: number): number {
  return 10 + 5 * length + Math.floor(Math.max(0, secondsLeft) / 3);
}
export const SAGE_CONSOLATION = 10;

// Noms et adjectifs courants : « abandonnez » serait une devinette ingrate.
export function sageWordPool(entries: readonly DictEntry[]): string[] {
  return entries
    .filter((e) => e.f && e.w.length >= SAGE_MIN_LEN && e.w.length <= SAGE_MAX_LEN)
    .filter((e) => e.c.includes('NOM') || e.c.includes('ADJ'))
    .map((e) => e.w);
}

// Mélange garanti différent du mot (sinon le défi n'en est pas un).
export function shuffleLetters(word: string, rng: Rng): string[] {
  const letters = word.split('');
  for (let attempt = 0; attempt < 20; attempt++) {
    const out = rng.shuffle(letters);
    if (out.join('') !== word) return out;
  }
  return [...letters].reverse();
}

export interface SageChallenge {
  word: string;
  letters: string[];      // lettres mélangées, l'index sert d'identité (lettres répétées)
  placed: number[];       // indices choisis, dans l'ordre
  seconds: number;
  timeLeft: number;
  hintGiven: boolean;
  outcome: 'playing' | 'won' | 'lost';
  reward: number;
}

export function createSageChallenge(pool: readonly string[], rng: Rng): SageChallenge {
  const word = rng.pick(pool);
  const seconds = sageSeconds(word.length);
  return { word, letters: shuffleLetters(word, rng), placed: [], seconds, timeLeft: seconds, hintGiven: false, outcome: 'playing', reward: 0 };
}

export const formedWord = (c: SageChallenge): string => c.placed.map((i) => c.letters[i]).join('');

// Toutes les lettres sont utilisées : une anagramme valide du dictionnaire est acceptée aussi.
export function isCorrect(formed: string, target: string, dict: Dictionary): boolean {
  if (formed.length !== target.length) return false;
  return formed === target || dict.trie.has(formed);
}

// Place la première lettre du mot et la verrouille : l'indice de mi-parcours.
export function applyHint(c: SageChallenge): SageChallenge {
  const first = c.word[0];
  const idx = c.letters.findIndex((l, i) => l === first && !c.placed.includes(i));
  if (idx < 0) return { ...c, hintGiven: true };
  return { ...c, hintGiven: true, placed: [idx, ...c.placed.filter((i) => i !== idx)] };
}
