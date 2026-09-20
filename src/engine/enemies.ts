import { getAdjacentCells, posKey } from './adjacency';
import type { Enemy } from './hooks';
import type { Rng } from './rng';
import type { Grid, Pos } from './types';
import type { WordSearch } from './wordFinder';

// Thème « Chasse » : des ennemis sur la grille. Un mot dont le chemin passe par leur case leur
// inflige le score du mot. Ils se DÉPLACENT lentement vers des cases bien desservies : un ennemi
// immobile mal placé était intuable (retour playtest).
// [tuning] Endurance d'un cancre seul = note × 0.25 (≈ 3-4 mots qui le traversent). À plusieurs, le
// budget total ne grandit qu'en racine du nombre : 3 cancres ≈ 1.7× l'endurance d'un seul, pas 3×.
// (Avant : 0.6 × note chacun, soit 15 mots par cancre — injouable, retour playtest.)
export const ENEMY_HP_RATIO = 0.25;
export const ENEMY_MIN_HP = 12;
export function enemyHp(threshold: number, count: number, mult = 1): number {
  return Math.max(ENEMY_MIN_HP, Math.round((threshold * ENEMY_HP_RATIO * mult) / Math.sqrt(Math.max(1, count))));
}
export const ENEMY_BOUNTY = 30;           // €
export const ENEMY_SURVIVOR_PENALTY = 15; // € retirés des gains de la manche
export const ENEMY_MOVE_SECONDS = 8;      // [tuning]
export const HARPOON_RATIO = 0.25;
export const GRENADE_DAMAGE = 30;

function reachability(search: WordSearch, [r, c]: Pos): number {
  return search.cellWordCount[r]?.[c] ?? 0;
}

// Cases candidates : libres, non joker/toxique, dans la moitié la mieux desservie de la grille.
function goodCells(grid: Grid, search: WordSearch, occupied: Set<number>): Pos[] {
  const all: Pos[] = [];
  for (let r = 0; r < grid.size; r++)
    for (let c = 0; c < grid.size; c++)
      if (!grid.cells[r][c].isJoker && !grid.cells[r][c].isToxic && !occupied.has(posKey(r, c))) all.push([r, c]);
  const sorted = [...all].sort((a, b) => reachability(search, b) - reachability(search, a));
  const keep = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
  return keep.filter((p) => reachability(search, p) > 0);
}

export function spawnEnemies(grid: Grid, search: WordSearch, rng: Rng, hp: number, count: number, nextMoveAt = ENEMY_MOVE_SECONDS, typeId = 'limace'): Enemy[] {
  const out: Enemy[] = [];
  const occupied = new Set<number>();
  for (let i = 0; i < count; i++) {
    const cands = goodCells(grid, search, occupied);
    if (!cands.length) break;
    const pos = rng.pick(cands);
    occupied.add(posKey(pos[0], pos[1]));
    out.push({ id: `enemy-${i + 1}`, typeId, cells: [pos], hp, maxHp: hp, nextMoveAt: nextMoveAt * (1 + i / Math.max(1, count)) });
  }
  return out;
}

// Déplacement : case adjacente libre, tirée avec un poids favorisant les cases bien desservies.
export function moveEnemy(enemy: Enemy, grid: Grid, search: WordSearch, rng: Rng, others: Enemy[]): Enemy {
  const occupied = new Set(others.flatMap((o) => o.cells.map(([r, c]) => posKey(r, c))));
  const [r, c] = enemy.cells[0];
  const options = getAdjacentCells(r, c, grid).filter(([nr, nc]) => !grid.cells[nr][nc].isJoker && !occupied.has(posKey(nr, nc)));
  if (!options.length) return enemy;
  const pos = rng.weighted(options, (p) => 1 + reachability(search, p));
  return { ...enemy, cells: [pos] };
}

export function enemyTouched(path: Pos[], enemy: Enemy): boolean {
  const keys = new Set(path.map(([r, c]) => posKey(r, c)));
  return enemy.cells.some(([r, c]) => keys.has(posKey(r, c)));
}

export const ENEMY_NAMES: Record<string, string> = { limace: 'Cancre', tank: 'Gros cancre', kevin: '{rival}' };
export const BOSS_BOUNTY = 120;      // [tuning] Kévin paie mieux qu'un cancre
// L'affrontement n'est pas une dictée : il n'a pas de note à atteindre, donc l'endurance de Kévin
// ne se déduit plus d'un seuil, elle est posée. [tuning] 150 au niveau adulte, soit trois à quatre
// mots qui lui passent dessus (l'ancien calcul montait à ~300 : un mur, retour playtest).
export const DUEL_HP = 150;
export const KEVIN_MARBLES = 40; // [tuning] tout ce qu'il a dans les poches, s'il s'en sort autrement
export const DUEL_SECONDS = 75;
