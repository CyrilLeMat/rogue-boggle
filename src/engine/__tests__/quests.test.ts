import { describe, expect, it } from 'vitest';
import { buildDictionary } from '../dictionary';
import { makeCell } from '../gridGenerator';
import { pickQuest, updateQuest } from '../quests';
import { createRng } from '../rng';
import type { Grid } from '../types';
import { findAllWords } from '../wordFinder';

const dict = buildDictionary(['CAT', 'ART', 'RAT', 'TAR', 'TRA', 'CART', 'ARC', 'CAR'].map((w) => ({ w, c: ['NOM' as const], f: true })));
const grid: Grid = { size: 2, cells: [['C', 'A'], ['R', 'T']].map((r) => r.map(makeCell)) };

describe('quests', () => {
  it('always picks a feasible quest and tracks progress', () => {
    const search = findAllWords(grid, dict.trie);
    for (let i = 0; i < 10; i++) {
      const q = pickQuest(grid, search, createRng('q' + i));
      expect(q).not.toBeNull();
      expect(q!.progress).toBe(0);
      if (q!.id === 'long-word') {
        const done = updateQuest(q!, [{ word: 'CART', score: 1, at: 0, path: [] }]);
        expect(done.done).toBe(true);
      }
      if (q!.id === 'count') {
        expect(q!.target).toBe(4); // 8 + 2 × (2 − 4)
      }
    }
  });
});
