import { LETTER_VALUES, VOWELS } from './gridGenerator';
import type { Grid, Pos } from './types';

export interface ScoreModifier {
  flat?: number;
  percent?: number; // 0.5 = +50 %
  final?: number;   // multiplicateur final
}

export function lengthMultiplier(len: number): number {
  if (len <= 4) return 1;
  if (len <= 6) return 2;
  if (len === 7) return 3;
  return 4;
}

// Somme des lettres du chemin (joker = 1), × bonus de longueur du mot résolu.
export function baseScore(word: string, grid: Grid, path: Pos[]): number {
  let sum = 0;
  for (const [r, c] of path) {
    const cell = grid.cells[r][c];
    sum += cell.isJoker ? 1 : (LETTER_VALUES[cell.letter] ?? 1);
  }
  return sum * lengthMultiplier(word.length);
}

export function baseScoreFromLetters(word: string): number {
  let sum = 0;
  for (let i = 0; i < word.length; i++) {
    if (word[i] === 'Q' && word[i + 1] === 'U') { sum += LETTER_VALUES.QU; i++; continue; }
    sum += LETTER_VALUES[word[i]] ?? 1;
  }
  return sum * lengthMultiplier(word.length);
}

// Les pourcentages se multiplient entre eux (×1.5 × ×1.4), pas d'addition : c'est ce qui
// permet à une build de relics de suivre la courbe de seuil.
export function applyModifiers(base: number, mods: ScoreModifier[]): number {
  let flat = 0;
  let mult = 1;
  let final = 1;
  for (const m of mods) {
    flat += m.flat ?? 0;
    mult *= 1 + (m.percent ?? 0);
    final *= m.final ?? 1;
  }
  return Math.round((base + flat) * mult * final);
}

export function countVowels(word: string): number {
  let n = 0;
  for (const ch of word) if (VOWELS.has(ch)) n++;
  return n;
}
