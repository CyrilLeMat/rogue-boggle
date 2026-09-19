import { posKey } from '../engine/adjacency';
import { FRENCH_STANDARD_WEIGHTS, VOWELS, sampleLetter } from '../engine/gridGenerator';
import type { Mutator } from '../engine/hooks';
import type { Grid } from '../engine/types';

export const FRACTURE_USES = 2; // [tuning] utilisations avant que la case se brise et change de lettre

function scaleWeights(pred: (letter: string) => boolean, factor: number) {
  return (w: Record<string, number>) => Object.fromEntries(Object.entries(w).map(([l, v]) => [l, pred(l) ? v * factor : v]));
}

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
    id: 'dense-voyelles', name: 'Dense voyelles', rarity: 'common',
    description: 'Deux fois plus de voyelles dans la grille',
    weights: scaleWeights((l) => VOWELS.has(l), 2),
  },
  {
    id: 'dense-consonnes', name: 'Dense consonnes', rarity: 'common',
    description: 'Deux fois plus de consonnes dans la grille',
    weights: scaleWeights((l) => !VOWELS.has(l), 2),
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
    id: 'grande', name: 'Grande grille', rarity: 'common',
    description: 'Une taille de plus que prévu (et +15 s)',
    sizeDelta: 1,
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
];

export const MUTATOR_BY_ID = new Map(MUTATORS.map((m) => [m.id, m]));
export const MAX_GRID_SIZE = 8;

export function mutatorGridSize(base: number, m: Mutator | null): number {
  return Math.min(MAX_GRID_SIZE, base + (m?.sizeDelta ?? 0));
}

export function describeGrid(grid: Grid): string {
  return `${grid.size}×${grid.size}`;
}
