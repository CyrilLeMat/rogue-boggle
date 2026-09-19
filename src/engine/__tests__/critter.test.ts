import { describe, expect, it } from 'vitest';
import { critterCountFor, moveCritter, spawnCritters, touchedCritters } from '../critter';
import { makeCell } from '../gridGenerator';
import { createRng } from '../rng';
import type { Grid } from '../types';

const grid: Grid = { size: 3, cells: [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I']].map((r) => r.map(makeCell)) };

describe('critters', () => {
  it('count follows grid size', () => {
    expect([4, 5, 6, 7].map(critterCountFor)).toEqual([1, 2, 2, 3]);
  });
  it('spawn on distinct non-joker cells and move to adjacent cells', () => {
    const rng = createRng('c');
    const cs = spawnCritters({ ...grid, size: 5, cells: Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => makeCell('A'))) }, rng);
    expect(cs.length).toBe(2);
    expect(cs[0].pos).not.toEqual(cs[1].pos);
    for (let i = 0; i < 20; i++) {
      const next = moveCritter(cs[0], grid, rng);
      expect(Math.max(Math.abs(next.pos[0] - cs[0].pos[0]), Math.abs(next.pos[1] - cs[0].pos[1]))).toBeLessThanOrEqual(1);
    }
  });
  it('avoids the traced path and jokers when hopping', () => {
    const g: Grid = { ...grid, cells: grid.cells.map((r) => r.map((c) => ({ ...c }))) };
    g.cells[0][1].isJoker = true;
    const c = { pos: [0, 0] as [number, number], nextMoveAt: 6 };
    for (let i = 0; i < 20; i++) expect(moveCritter(c, g, createRng('h' + i), [[1, 0]]).pos).toEqual([1, 1]);
  });
  it('detects which critters a path touches', () => {
    const cs = [{ pos: [1, 1] as [number, number], nextMoveAt: 6 }, { pos: [2, 2] as [number, number], nextMoveAt: 6 }];
    expect(touchedCritters([[0, 0], [1, 1]], cs)).toEqual([0]);
    expect(touchedCritters([[1, 1], [2, 2]], cs)).toEqual([0, 1]);
    expect(touchedCritters([[0, 0]], cs)).toEqual([]);
  });
});
