import { posKey } from './adjacency';
import type { Enemy } from './hooks';
import type { Rng } from './rng';
import type { Grid, Pos } from './types';
import type { WordSearch } from './wordFinder';

// Thème « Chasse » : un ennemi posé sur la grille. Un mot dont le chemin passe par une de ses
// cases lui inflige le score du mot. PV proportionnels au seuil ; prime à la mort, pénalité s'il survit.
export const ENEMY_HP_RATIO = 0.6;      // [tuning] PV = seuil × ratio
export const ENEMY_BOUNTY = 30;         // €
export const ENEMY_SURVIVOR_PENALTY = 15; // € retirés des gains de la manche
export const HARPOON_RATIO = 0.25;
export const GRENADE_DAMAGE = 30;
export const MIN_REACHABILITY = 5;      // mots passant par la case, sinon l'ennemi serait intuable

export function spawnEnemy(grid: Grid, search: WordSearch, rng: Rng, hp: number): Enemy | null {
  const candidates: Pos[] = [];
  for (let r = 0; r < grid.size; r++)
    for (let c = 0; c < grid.size; c++)
      if (!grid.cells[r][c].isJoker && !grid.cells[r][c].isToxic && search.cellWordCount[r][c] >= MIN_REACHABILITY) candidates.push([r, c]);
  if (!candidates.length) return null;
  const cells = [rng.pick(candidates)];
  // sur les grandes grilles l'ennemi occupe 2 cases contiguës
  if (grid.size >= 6) {
    const [r, c] = cells[0];
    const neighbours = candidates.filter(([nr, nc]) => Math.max(Math.abs(nr - r), Math.abs(nc - c)) === 1);
    if (neighbours.length) cells.push(rng.pick(neighbours));
  }
  return { id: 'enemy-1', typeId: cells.length > 1 ? 'tank' : 'limace', cells, hp, maxHp: hp };
}

export function enemyTouched(path: Pos[], enemy: Enemy): boolean {
  const keys = new Set(path.map(([r, c]) => posKey(r, c)));
  return enemy.cells.some(([r, c]) => keys.has(posKey(r, c)));
}

export const ENEMY_NAMES: Record<string, string> = { limace: 'Limace', tank: 'Tank' };
