import type { Dictionary } from './dictionary';
import { applyModifiers, baseScore, type ScoreModifier } from './scoring';
import type { Grid, Pos } from './types';
import { candidatesForPath } from './wordFinder';

export interface FoundWord { word: string; score: number; at: number; path: Pos[] }

export type SubmitResult =
  | { kind: 'ok'; found: FoundWord }
  | { kind: 'duplicate'; word: string }
  | { kind: 'invalid' }
  | { kind: 'tooShort' };

// Résout un chemin tracé : parmi les candidats (jokers), garde le meilleur score
// qui n'a pas déjà été trouvé.
export function resolvePath(
  grid: Grid,
  path: Pos[],
  dict: Dictionary,
  alreadyFound: ReadonlySet<string>,
  modifiersFor: (word: string) => ScoreModifier[],
  now: number,
): SubmitResult {
  const letters = path.reduce((n, [r, c]) => n + (grid.cells[r][c].isJoker ? 1 : grid.cells[r][c].letter.length), 0);
  if (letters < 3) return { kind: 'tooShort' };
  const candidates = candidatesForPath(grid, path, dict.trie);
  if (candidates.length === 0) return { kind: 'invalid' };
  let best: FoundWord | null = null;
  let dup: string | null = null;
  for (const word of candidates) {
    if (alreadyFound.has(word)) { dup = word; continue; }
    const score = applyModifiers(baseScore(word, grid, path), modifiersFor(word));
    if (!best || score > best.score) best = { word, score, at: now, path };
  }
  if (best) return { kind: 'ok', found: best };
  return { kind: 'duplicate', word: dup! };
}
