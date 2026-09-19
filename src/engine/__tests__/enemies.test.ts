import { describe, expect, it } from 'vitest';
import { buildDictionary } from '../dictionary';
import { enemyHp, enemyTouched, moveEnemy, spawnEnemies } from '../enemies';
import { makeCell } from '../gridGenerator';
import { createRng } from '../rng';
import type { Grid } from '../types';
import { findAllWords } from '../wordFinder';

const dict = buildDictionary(['CAT', 'ART', 'RAT', 'TAR', 'TRA', 'CART', 'ARC', 'CAR', 'ACT', 'TAC'].map((w) => ({ w, c: ['NOM' as const], f: true })));
const grid: Grid = { size: 2, cells: [['C', 'A'], ['R', 'T']].map((r) => r.map(makeCell)) };

describe('enemies', () => {
  it('endurance ≈ 3-4 words for one, shared budget for several', () => {
    expect(enemyHp(100, 1)).toBe(25);
    expect(enemyHp(100, 3)).toBe(14);
    expect(enemyHp(100, 3, 1.5)).toBe(22);
    expect(enemyHp(20, 1)).toBe(12);
  });
  it('spawns distinct enemies on well-served cells and detects touches', () => {
    const search = findAllWords(grid, dict.trie);
    const es = spawnEnemies(grid, search, createRng('e'), 40, 2);
    expect(es.length).toBe(2);
    expect(es[0].cells[0]).not.toEqual(es[1].cells[0]);
    expect(es[0].hp).toBe(40);
    expect(enemyTouched([es[0].cells[0]], es[0])).toBe(true);
    expect(enemyTouched([[9, 9]], es[0])).toBe(false);
  });
  it('moves to an adjacent free cell', () => {
    const search = findAllWords(grid, dict.trie);
    const [e, other] = spawnEnemies(grid, search, createRng('m'), 40, 2);
    for (let i = 0; i < 10; i++) {
      const moved = moveEnemy(e, grid, search, createRng('mv' + i), [other]);
      const [r, c] = moved.cells[0];
      expect(Math.max(Math.abs(r - e.cells[0][0]), Math.abs(c - e.cells[0][1]))).toBe(1);
      expect(moved.cells[0]).not.toEqual(other.cells[0]);
    }
  });
  it('spawns nothing when no cell is served by any word', () => {
    const dead: Grid = { size: 2, cells: [['Z', 'Z'], ['Z', 'Z']].map((r) => r.map(makeCell)) };
    expect(spawnEnemies(dead, findAllWords(dead, dict.trie), createRng('e'), 40, 1)).toEqual([]);
  });
});
