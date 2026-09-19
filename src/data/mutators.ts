import { posKey } from '../engine/adjacency';
import { FRENCH_STANDARD_WEIGHTS, sampleLetter } from '../engine/gridGenerator';
import type { Mutator } from '../engine/hooks';
import type { Rng } from '../engine/rng';

export const FRACTURE_USES = 2; // [tuning] utilisations avant que la case se brise et change de lettre

// Conditions imposées toutes les CONDITION_EVERY manches (3, 6, 9) : pas de choix, une règle
// qui change la façon de jouer. Les variantes de pondération (voyelles/consonnes) ont été
// retirées : elles ne changeaient rien de perceptible.
export const CONDITION_EVERY = 3;

export const MUTATORS: Mutator[] = [
  {
    id: 'fracture', name: 'Terre fracturée', rarity: 'rare',
    description: 'Chaque case utilisée dans un mot se fissure ; à la 2e utilisation elle se brise et révèle une nouvelle lettre. Réfléchis avant de tracer',
    onWordAccepted: (found, ctx) => {
      const grid = ctx.manche.grid;
      const cells = grid.cells.map((row) => row.map((c) => ({ ...c })));
      let changed = false;
      for (const [r, c] of found.path) {
        const cell = cells[r][c];
        if (cell.isJoker) continue;
        cell.cracks = (cell.cracks ?? 0) + 1;
        if (cell.cracks >= FRACTURE_USES) {
          let letter = sampleLetter(FRENCH_STANDARD_WEIGHTS, ctx.rng);
          for (let i = 0; i < 10 && letter === cell.letter; i++) letter = sampleLetter(FRENCH_STANDARD_WEIGHTS, ctx.rng);
          cell.letter = letter;
          cell.cracks = 0;
          cell.gen = (cell.gen ?? 0) + 1;
          changed = true;
        }
      }
      ctx.manche.grid = { ...grid, cells };
      if (changed) ctx.manche.gridDirty = true;
    },
  },
  {
    id: 'toxique', name: 'Grille toxique', rarity: 'rare',
    description: '2 cases toxiques ☠ (fond vert, −8 s à chaque utilisation), mais +50 % sur tous les mots',
    applyToGrid: (grid, rng) => {
      const cells = grid.cells.map((row) => row.map((c) => ({ ...c })));
      const picked = new Set<number>();
      while (picked.size < 2) picked.add(posKey(rng.int(grid.size), rng.int(grid.size)));
      for (const k of picked) cells[Math.floor(k / 64)][k % 64].isToxic = true;
      return { ...grid, cells };
    },
    onWordFound: () => ({ percent: 0.5 }),
  },
  {
    id: 'sprint', name: 'Sprint', rarity: 'common',
    description: '−30 s de chrono, seuil −30 %',
    secondsDelta: -30, thresholdMult: 0.7,
  },
  {
    id: 'marathon', name: 'Marathon', rarity: 'common',
    description: '+45 s de chrono, seuil +50 %',
    secondsDelta: 45, thresholdMult: 1.5,
  },
  {
    id: 'geante', name: 'Grille géante', rarity: 'rare',
    description: 'Une taille de plus que d\'habitude (jusqu\'à 7×7), avec le chrono qui va avec',
    sizeDelta: 1,
  },
];

export const MUTATOR_BY_ID = new Map(MUTATORS.map((m) => [m.id, m]));
export const MAX_GRID_SIZE = 7;

export function mutatorGridSize(base: number, m: Mutator | null): number {
  return Math.min(MAX_GRID_SIZE, base + (m?.sizeDelta ?? 0));
}

export function isConditionManche(manche: number): boolean {
  return manche > 1 && manche % CONDITION_EVERY === 0;
}

// Évite de répéter la condition précédente quand c'est possible.
export function pickCondition(rng: Rng, previous: string | null): string {
  const pool = MUTATORS.filter((m) => m.id !== previous);
  return rng.pick(pool.length ? pool : MUTATORS).id;
}
