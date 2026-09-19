import type { Dictionary } from './dictionary';
import { baseScoreFromLetters } from './scoring';
import type { WordSearch } from './wordFinder';

// Potentiel d'une grille : score cumulé de ses 25 meilleurs mots courants,
// soit ce qu'un bon joueur peut réellement tracer en 90 s.
export const POTENTIAL_TOP_N = 25;

// Médianes mesurées par scripts/bench-difficulty.ts (400 grilles, poids standards, mots courants ≥ 3/million).
export const REFERENCE_POTENTIAL: Record<number, number> = { 4: 190, 5: 349, 6: 452, 7: 562 };

export const FACTOR_MIN = 0.7;
export const FACTOR_MAX = 1.3;

export type Mood = 'généreuse' | 'normale' | 'aride';

export interface Difficulty {
  potential: number;
  factor: number; // multiplicateur appliqué au seuil
  mood: Mood;
}

export function gridPotential(search: WordSearch, dict: Dictionary): number {
  const scores: number[] = [];
  for (const w of search.words) if (dict.common.has(w)) scores.push(baseScoreFromLetters(w));
  scores.sort((a, b) => b - a);
  let sum = 0;
  for (let i = 0; i < Math.min(POTENTIAL_TOP_N, scores.length); i++) sum += scores[i];
  return sum;
}

export function difficultyOf(potential: number, size: number): Difficulty {
  const ref = REFERENCE_POTENTIAL[size] ?? REFERENCE_POTENTIAL[4] * (size * size) / 16;
  const factor = Math.min(FACTOR_MAX, Math.max(FACTOR_MIN, potential / ref));
  const mood: Mood = factor >= 1.12 ? 'généreuse' : factor <= 0.88 ? 'aride' : 'normale';
  return { potential, factor, mood };
}

export function adjustThreshold(base: number, factor: number): number {
  return Math.max(10, Math.round((base * factor) / 10) * 10);
}
