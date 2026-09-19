import { getAdjacentCells } from './adjacency';
import type { Rng } from './rng';
import type { Grid, Pos } from './types';

// Les escargots : présents dès la manche 1, ils se déplacent lentement sur la grille.
// Un mot dont le chemin passe par une de leurs cases est doublé, puis l'escargot touché saute
// sur une case voisine. Leur nombre suit la taille de grille pour rester une cible réelle.
export const CRITTER_MOVE_SECONDS = 6; // [tuning]
export const CRITTER_MULTIPLIER = 2;

export interface Critter { pos: Pos; nextMoveAt: number }

export function critterCountFor(size: number): number {
  return size <= 4 ? 1 : size <= 6 ? 2 : 3;
}

const same = (a: Pos, b: Pos) => a[0] === b[0] && a[1] === b[1];

export function spawnCritters(grid: Grid, rng: Rng): Critter[] {
  const out: Critter[] = [];
  const n = critterCountFor(grid.size);
  let guard = 0;
  while (out.length < n && guard++ < 50) {
    const pos: Pos = [rng.int(grid.size), rng.int(grid.size)];
    if (grid.cells[pos[0]][pos[1]].isJoker || out.some((c) => same(c.pos, pos))) continue;
    // décalés dans le temps pour ne pas bouger tous ensemble
    out.push({ pos, nextMoveAt: CRITTER_MOVE_SECONDS * (1 + out.length / n) });
  }
  return out;
}

export function moveCritter(critter: Critter, grid: Grid, rng: Rng, avoid: Pos[] = []): Critter {
  const options = getAdjacentCells(critter.pos[0], critter.pos[1], grid)
    .filter(([r, c]) => !grid.cells[r][c].isJoker && !avoid.some((p) => p[0] === r && p[1] === c));
  const pos = options.length ? rng.pick(options) : critter.pos;
  return { pos, nextMoveAt: critter.nextMoveAt };
}

export function touchedCritters(path: Pos[], critters: Critter[]): number[] {
  return critters.map((c, i) => (path.some((p) => same(p, c.pos)) ? i : -1)).filter((i) => i >= 0);
}
