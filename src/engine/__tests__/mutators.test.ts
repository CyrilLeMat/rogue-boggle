import { describe, expect, it } from 'vitest';
import { FRACTURE_USES, MUTATORS, MUTATOR_BY_ID, hasLessonChoice, mutatorGridSize, pickLessons } from '../../data/mutators';
import { buildDictionary } from '../dictionary';
import type { MancheView, RunView } from '../hooks';
import { makeContext, runWordAccepted } from '../hookRunner';
import { makeCell } from '../gridGenerator';
import { createRng } from '../rng';
import type { Grid } from '../types';
import { findAllWords } from '../wordFinder';

const dict = buildDictionary([{ w: 'ART', c: ['NOM'], f: true }]);
const grid = (): Grid => ({ size: 2, cells: [['A', 'R'], ['T', 'E']].map((r) => r.map(makeCell)) });

function manche(g: Grid): MancheView {
  return {
    grid: g, search: findAllWords(g, dict.trie), threshold: 10, difficulty: { potential: 0, factor: 1, mood: 'normale' },
    found: [], timeLeft: 60, timeLeftBeforeWord: 60, elapsed: 0, cursedWord: null, cursedStart: null, cursedVisible: false, holes: [], radarCell: null,
    relicState: {}, bonuses: [], streak: { links: 0, lastAt: -Infinity }, quest: null, luckyLetter: null, amorce: null,
    inspiration: null, gridDirty: false, mutatorId: 'fracture', enemies: [], killsThisManche: 0,
  };
}

describe('mutators', () => {
  it('has unique ids', () => {
    expect(new Set(MUTATORS.map((m) => m.id)).size).toBe(MUTATORS.length);
  });
  it('Terre fracturée cracks cells then replaces the letter', () => {
    const run: RunView = { score: 0, euros: 0, lives: 3, currentManche: 1, relicIds: [], killCount: 0 };
    const m = manche(grid());
    const ctx = makeContext(createRng('f'), run, m, dict);
    const fracture = MUTATOR_BY_ID.get('fracture')!;
    const word = { word: 'ART', score: 1, at: 0, path: [[0, 0], [0, 1], [1, 0]] as [number, number][] };
    runWordAccepted(word, [fracture], ctx);
    expect(m.grid.cells[0][0].cracks).toBe(1);
    expect(m.grid.cells[0][0].letter).toBe('A');
    expect(m.gridDirty).toBe(false);
    for (let i = 1; i < FRACTURE_USES; i++) runWordAccepted(word, [fracture], ctx);
    expect(m.grid.cells[0][0].cracks).toBe(0);
    expect(m.grid.cells[0][0].gen).toBe(1);
    expect(m.grid.cells[1][1].letter).toBe('E'); // hors chemin : intact
    expect(m.gridDirty).toBe(true);
  });
  it('grid size is capped at 7, lessons are chosen every other manche, late ones wait', () => {
    expect(mutatorGridSize(6, MUTATOR_BY_ID.get('geante')!)).toBe(7);
    expect(mutatorGridSize(7, MUTATOR_BY_ID.get('geante')!)).toBe(7);
    expect([1, 2, 3, 4, 9, 10].filter(hasLessonChoice)).toEqual([2, 4, 10]);
    for (let i = 0; i < 30; i++) {
      const pair = pickLessons(createRng('c' + i), 'fracture', 2);
      expect(pair.length).toBe(2);
      expect(new Set(pair).size).toBe(2);
      expect(pair).not.toContain('fracture');
      for (const id of pair) {
        expect(['geante', 'marathon']).not.toContain(id); // réservées à partir de la manche 4
        expect(MUTATOR_BY_ID.has(id)).toBe(true);
      }
    }
  });
  it('Grille toxique marks two cells', () => {
    const g = MUTATOR_BY_ID.get('toxique')!.applyToGrid!({ size: 4, cells: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => makeCell('A'))) }, createRng('t'));
    expect(g.cells.flat().filter((c) => c.isToxic).length).toBe(2);
  });
});
