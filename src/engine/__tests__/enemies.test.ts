import { describe, expect, it } from 'vitest';
import { buildDictionary } from '../dictionary';
import { enemyTouched, spawnEnemy } from '../enemies';
import { makeCell } from '../gridGenerator';
import { createRng } from '../rng';
import type { Grid } from '../types';
import { findAllWords } from '../wordFinder';

const dict = buildDictionary(['CAT', 'ART', 'RAT', 'TAR', 'TRA', 'CART', 'ARC', 'CAR', 'ACT', 'TAC'].map((w) => ({ w, c: ['NOM' as const], f: true })));

describe('enemies', () => {
  it('spawns on a reachable cell and detects touches', () => {
    const grid: Grid = { size: 2, cells: [['C', 'A'], ['R', 'T']].map((r) => r.map(makeCell)) };
    const search = findAllWords(grid, dict.trie);
    const e = spawnEnemy(grid, search, createRng('e'), 40);
    expect(e).not.toBeNull();
    expect(e!.cells.length).toBe(1);
    expect(e!.hp).toBe(40);
    expect(enemyTouched([e!.cells[0]], e!)).toBe(true);
    expect(enemyTouched([[9, 9]], e!)).toBe(false);
  });
  it('returns null when no cell is reachable enough', () => {
    const grid: Grid = { size: 2, cells: [['Z', 'Z'], ['Z', 'Z']].map((r) => r.map(makeCell)) };
    expect(spawnEnemy(grid, findAllWords(grid, dict.trie), createRng('e'), 40)).toBeNull();
  });
});
