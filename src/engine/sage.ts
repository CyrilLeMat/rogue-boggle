import { getAdjacentCells, posKey } from './adjacency';
import type { Dictionary } from './dictionary';
import { FRENCH_STANDARD_WEIGHTS, makeCell, sampleLetter } from './gridGenerator';
import type { Rng } from './rng';
import type { DictEntry, Grid, Pos } from './types';

// Le Sage du CM1 : une respiration entre deux dictées. Même geste que le jeu (on trace),
// mais on connaît déjà les lettres : seules celles du mot sont actives, les autres sont grisées.
// Tout l'effort est de retrouver le chemin.
export const SAGE_MIN_LEN = 8;
export const SAGE_MAX_LEN = 12;
export const SAGE_GRID_SIZE = 5;
export const SAGE_AFTER = [3, 7]; // rencontres après ces dictées [tuning]
export const SAGE_HINT_RATIO = 0.5; // à mi-temps, le sage montre par où commencer

export function isSageManche(manche: number): boolean {
  return SAGE_AFTER.includes(manche);
}

export function sageSeconds(length: number): number {
  return 15 + 3 * length; // [tuning]
}

export function sageReward(length: number, secondsLeft: number): number {
  return 10 + 5 * length + Math.floor(Math.max(0, secondsLeft) / 3); // [tuning]
}
export const SAGE_CONSOLATION = 10;

// Noms et adjectifs courants : « abandonnez » serait une devinette ingrate.
export function sageWordPool(entries: readonly DictEntry[]): string[] {
  return entries
    .filter((e) => e.f && e.w.length >= SAGE_MIN_LEN && e.w.length <= SAGE_MAX_LEN)
    .filter((e) => e.c.includes('NOM') || e.c.includes('ADJ'))
    .map((e) => e.w);
}

// Chemin auto-évitant de `length` cases, tiré au hasard avec retour arrière.
export function carvePath(size: number, length: number, rng: Rng): Pos[] | null {
  const grid: Grid = { size, cells: [] };
  const used = new Set<number>();
  const path: Pos[] = [];

  function walk(pos: Pos): boolean {
    path.push(pos);
    used.add(posKey(pos[0], pos[1]));
    if (path.length === length) return true;
    for (const next of rng.shuffle(getAdjacentCells(pos[0], pos[1], grid))) {
      if (used.has(posKey(next[0], next[1]))) continue;
      if (walk(next)) return true;
    }
    path.pop();
    used.delete(posKey(pos[0], pos[1]));
    return false;
  }

  for (const start of rng.shuffle(Array.from({ length: size * size }, (_, i) => [Math.floor(i / size), i % size] as Pos))) {
    if (walk(start)) return path;
  }
  return null;
}

export interface SageChallenge {
  word: string;
  grid: Grid;
  solution: Pos[];        // le chemin qui écrit le mot
  active: number[];       // posKey des cases du mot ; les autres sont grisées et inertes
  seconds: number;
  timeLeft: number;
  hintGiven: boolean;
  attempts: number;
  outcome: 'playing' | 'won' | 'lost';
  reward: number;
}

// Le mot est planté sur un chemin, puis la feuille est remplie de lettres muettes.
export function createSageChallenge(pool: readonly string[], rng: Rng, size = SAGE_GRID_SIZE): SageChallenge {
  const word = rng.pick(pool);
  const solution = carvePath(size, word.length, rng) ?? [];
  const cells = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => makeCell(sampleLetter(FRENCH_STANDARD_WEIGHTS, rng))),
  );
  solution.forEach(([r, c], i) => { cells[r][c] = makeCell(word[i]); });
  return {
    word,
    grid: { size, cells },
    solution,
    active: solution.map(([r, c]) => posKey(r, c)),
    seconds: sageSeconds(word.length),
    timeLeft: sageSeconds(word.length),
    hintGiven: false,
    attempts: 0,
    outcome: 'playing',
    reward: 0,
  };
}

export function wordFromPath(grid: Grid, path: readonly Pos[]): string {
  return path.map(([r, c]) => grid.cells[r][c].letter).join('');
}

// Toutes les lettres actives doivent servir : une anagramme valide du dictionnaire passe aussi.
export function isCorrect(formed: string, target: string, dict: Dictionary): boolean {
  if (formed.length !== target.length) return false;
  return formed === target || dict.trie.has(formed);
}
