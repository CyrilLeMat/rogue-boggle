import type { Dictionary } from './dictionary';
import { gridPotential, REFERENCE_POTENTIAL } from './difficulty';
import type { Rng } from './rng';
import type { Cell, Grid, LetterWeights } from './types';
import { findAllWords, type WordSearch } from './wordFinder';

export const FRENCH_STANDARD_WEIGHTS: LetterWeights = {
  E: 14.7, A: 7.6, I: 7.5, S: 7.9, N: 7.1, R: 6.5, T: 7.2, O: 5.3,
  U: 6.3, L: 5.5, D: 3.7, C: 3.3, M: 2.9, P: 3.0, G: 1.1, B: 0.9,
  V: 1.6, H: 0.7, F: 1.1, QU: 1.4, Y: 0.3, X: 0.4, J: 0.5, K: 0.05, W: 0.05, Z: 0.3,
};

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U', 'Y']);

export const LETTER_VALUES: Record<string, number> = {
  A: 1, E: 1, I: 1, L: 1, N: 1, O: 1, R: 1, S: 1, T: 1, U: 1,
  D: 2, G: 2, M: 2, B: 3, C: 3, P: 3, F: 4, H: 4, V: 4,
  J: 8, Q: 8, QU: 8, K: 10, W: 10, X: 10, Y: 10, Z: 10,
};

export interface QualityGate {
  minVowels: number;
  maxExpensive: number; // lettres de valeur ≥ 8
  minWords: number;
  minPotential: number; // rejette les grilles les plus arides (voir difficulty.ts)
}

export function defaultQualityGate(size: number): QualityGate {
  const minWords = size <= 4 ? 25 : size === 5 ? 60 : size === 6 ? 100 : 150;
  const ref = REFERENCE_POTENTIAL[size] ?? 0;
  return { minVowels: size, maxExpensive: 2, minWords, minPotential: Math.round(ref * 0.6) };
}

export function makeCell(letter: string): Cell {
  return { letter, isJoker: false, isToxic: false };
}

export function sampleLetter(weights: LetterWeights, rng: Rng): string {
  const letters = Object.keys(weights);
  return rng.weighted(letters, (l) => weights[l]);
}

export function rawGrid(size: number, weights: LetterWeights, rng: Rng): Grid {
  const cells = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => makeCell(sampleLetter(weights, rng))),
  );
  return { size, cells };
}

export function passesQualityGate(grid: Grid, search: WordSearch, gate: QualityGate, potential = Infinity): boolean {
  let vowels = 0;
  let expensive = 0;
  for (const row of grid.cells) {
    for (const cell of row) {
      if (cell.isJoker) { vowels++; continue; }
      if (VOWELS.has(cell.letter)) vowels++;
      if ((LETTER_VALUES[cell.letter] ?? 0) >= 8) expensive++;
    }
  }
  return vowels >= gate.minVowels && expensive <= gate.maxExpensive && search.words.size >= gate.minWords && potential >= gate.minPotential;
}

export interface GeneratedGrid {
  grid: Grid;
  search: WordSearch;
  rawPotential: number; // mesuré sur la grille brute, avant relics/jokers
  attempts: number;
}

// La garde qualité et le potentiel sont évalués sur la grille brute ; le post-traitement
// (jokers des relics) s'applique ensuite, sinon améliorer sa grille durcirait le seuil.
export function generateGrid(
  size: number,
  weights: LetterWeights,
  rng: Rng,
  dict: Dictionary,
  postProcess: (g: Grid) => Grid = (g) => g,
  gate: QualityGate = defaultQualityGate(size),
  maxAttempts = 20,
): GeneratedGrid {
  let best: { grid: Grid; search: WordSearch; potential: number } | null = null;
  let attempts = 0;
  for (attempts = 1; attempts <= maxAttempts; attempts++) {
    const grid = rawGrid(size, weights, rng);
    const search = findAllWords(grid, dict.trie);
    const potential = gridPotential(search, dict);
    if (!best || potential > best.potential) best = { grid, search, potential };
    if (passesQualityGate(grid, search, gate, potential)) { best = { grid, search, potential }; break; }
  }
  const processed = postProcess(best!.grid);
  const search = processed === best!.grid ? best!.search : findAllWords(processed, dict.trie);
  return { grid: processed, search, rawPotential: best!.potential, attempts: Math.min(attempts, maxAttempts) };
}
