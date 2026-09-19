import type { Grid, Pos } from './types';

const DELTAS: Pos[] = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

export function getAdjacentCells(row: number, col: number, grid: Grid): Pos[] {
  const out: Pos[] = [];
  for (const [dr, dc] of DELTAS) {
    const r = row + dr;
    const c = col + dc;
    if (r >= 0 && r < grid.size && c >= 0 && c < grid.size) out.push([r, c]);
  }
  return out;
}

export function areAdjacent(a: Pos, b: Pos): boolean {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return dr <= 1 && dc <= 1 && dr + dc > 0;
}

export const posKey = (r: number, c: number) => r * 64 + c;
