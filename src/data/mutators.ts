import { posKey } from '../engine/adjacency';
import { FRENCH_STANDARD_WEIGHTS, sampleLetter } from '../engine/gridGenerator';
import type { Mutator } from '../engine/hooks';
import type { Rng } from '../engine/rng';

export const FRACTURE_USES = 2; // [tuning] utilisations avant que la case se brise et change de lettre

// Un THÈME par manche à partir de la manche 2, jamais deux fois le même d'affilée :
// une seule couche spéciale à la fois (retour playtest : tout s'empilait).
// La manche 1 est du Boggle pur.
export const MUTATORS: Mutator[] = [
  {
    id: 'escargots', name: 'Leçon de choses', rarity: 'common', snails: true,
    description: 'Des escargots se promènent sur la feuille : un mot qui passe par leur case compte double',
  },
  {
    id: 'objectif', name: 'Consigne du jour', rarity: 'common', quest: true,
    description: 'Une consigne à remplir pendant la dictée, payée en billes',
  },
  {
    id: 'chasse', name: 'Le cancre copie', rarity: 'rare', enemy: true,
    description: 'Un cancre copie sur ta feuille (il change de place toutes les 8 s). Trace 3 ou 4 mots à travers sa case pour le faire taire. Calmé : +30 billes. Toujours là : −15 billes',
  },
  {
    id: 'fracture', name: 'Tableau effacé', rarity: 'rare',
    description: 'Chaque case utilisée dans un mot se craquelle ; à la 2e utilisation elle est effacée et une nouvelle lettre est écrite. Réfléchis avant de tracer',
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
    id: 'toxique', name: 'Taches d\'encre', rarity: 'rare',
    description: '2 taches d\'encre (−8 s à chaque utilisation), mais +50 % sur tous les mots',
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
    id: 'sprint', name: 'Calcul mental', rarity: 'common',
    description: '−30 s de chrono, note à atteindre −30 %',
    secondsDelta: -30, thresholdMult: 0.7,
  },
  {
    id: 'marathon', name: 'Rédaction', rarity: 'common', minManche: 4,
    description: '+45 s de chrono, note à atteindre +40 %',
    secondsDelta: 45, thresholdMult: 1.4,
  },
  {
    id: 'geante', name: 'Grande carte', rarity: 'rare', minManche: 4,
    description: 'Une feuille d\'une taille de plus (jusqu\'à 7×7), avec le chrono qui va avec',
    sizeDelta: 1,
  },
];

export const MUTATOR_BY_ID = new Map(MUTATORS.map((m) => [m.id, m]));
export const MAX_GRID_SIZE = 7;

export function mutatorGridSize(base: number, m: Mutator | null): number {
  return Math.min(MAX_GRID_SIZE, base + (m?.sizeDelta ?? 0));
}

export function isConditionManche(manche: number): boolean {
  return manche > 1;
}

// Thème de la manche : jamais le précédent, et certains thèmes attendent la manche 4.
export function pickCondition(rng: Rng, previous: string | null, manche = 2): string {
  const pool = MUTATORS.filter((m) => m.id !== previous && (m.minManche ?? 0) <= manche);
  return rng.pick(pool.length ? pool : MUTATORS).id;
}
