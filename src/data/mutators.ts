import { posKey } from '../engine/adjacency';
import { FRENCH_STANDARD_WEIGHTS, sampleLetter } from '../engine/gridGenerator';
import type { Mutator, RunContext } from '../engine/hooks';
import { findPathForWord } from '../engine/wordFinder';

export const DICTATED_BONUS = 30; // [tuning]
export const WIND_SECONDS = 8;    // [tuning] le courant d'air souffle toutes les 8 s

// Dictée à trous : la maîtresse choisit un mot courant encore à trouver et le dit à voix haute.
function dictateWord(ctx: RunContext) {
  const already = new Set(ctx.manche.found.map((f) => f.word));
  const pool = [...ctx.manche.search.words].filter((w) => w.length >= 4 && ctx.isCommon(w) && !already.has(w));
  const word = pool.length ? ctx.rng.pick(pool) : null;
  ctx.manche.cursedWord = word;
  ctx.manche.cursedVisible = true; // elle le dit à voix haute, c'est une dictée
  const path = word ? findPathForWord(ctx.manche.grid, word) : null;
  ctx.manche.cursedStart = path ? posKey(path[0][0], path[0][1]) : null;
}

export const FRACTURE_USES = 2; // [tuning] utilisations avant que la case se brise et change de lettre

// Un THÈME par manche à partir de la manche 2, jamais deux fois le même d'affilée :
// une seule couche spéciale à la fois (retour playtest : tout s'empilait).
// La manche 1 est du Boggle pur.
export const MUTATORS: Mutator[] = [
  {
    id: 'escargots', name: 'Leçon de choses', rarity: 'common', snails: true,
    scene: 'Le bocal de la leçon de choses s\'est renversé. Les escargots sont partout. Personne ne les rattrapera.',
    description: 'Des escargots se promènent sur la feuille : un mot qui passe par leur case compte double',
  },
  {
    id: 'objectif', name: 'Consigne du jour', rarity: 'common', quest: true,
    scene: 'Elle a écrit une consigne au tableau pendant la récré. Elle a l\'air très fière d\'elle.',
    description: 'Une consigne à remplir pendant la dictée, payée en billes',
  },
  {
    id: 'chasse', name: 'Le cancre copie', rarity: 'rare', enemy: true,
    scene: 'Kévin s\'est assis à côté de toi. Il n\'a pas de stylo. Il n\'a jamais de stylo.',
    description: 'Un cancre copie sur ta feuille (il change de place toutes les 8 s). Trace 3 ou 4 mots à travers sa case pour le faire taire. Calmé : +30 billes. Toujours là : −15 billes',
  },
  {
    id: 'fracture', name: 'Tableau effacé', rarity: 'rare',
    scene: 'L\'éponge est trop mouillée. À chaque passage, une lettre s\'en va avec l\'eau.',
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
    scene: 'Le stylo plume de Sophie a explosé. Deux cases sont fichues, et Sophie pleure.',
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
    id: 'trous', name: 'Dictée à trous', rarity: 'rare',
    scene: 'Elle ouvre son livre page 42, celui qu\'elle garde pour les grandes occasions.',
    description: 'La maîtresse dicte un mot à la fois. Le tracer rapporte +30 pts et elle en dicte aussitôt un autre',
    onMancheStart: (ctx) => dictateWord(ctx),
    onWordAccepted: (found, ctx) => {
      if (found.word !== ctx.manche.cursedWord) return;
      ctx.addBonus('Mot dicté', DICTATED_BONUS);
      dictateWord(ctx);
    },
  },
  {
    id: 'chaine', name: 'Le mot en chaîne', rarity: 'rare',
    scene: 'Elle a lu un article sur la pédagogie moderne ce week-end. Nous allons tous le regretter.',
    description: 'Un mot qui commence par la dernière lettre du précédent compte double',
    onWordFound: (w, ctx) => {
      const last = ctx.manche.found[ctx.manche.found.length - 1];
      return last && w[0] === last.word[last.word.length - 1] ? { final: 2 } : undefined;
    },
  },
  {
    id: 'vent', name: 'Courant d\'air', rarity: 'rare',
    scene: 'La fenêtre est restée ouverte et personne n\'ose la fermer. Les lettres n\'arrêtent pas de bouger.',
    description: 'Toutes les 8 s, deux lettres de la feuille s\'envolent et sont remplacées',
    onTick: (ctx, elapsed) => {
      const next = ctx.manche.relicState.vent ?? WIND_SECONDS;
      if (elapsed < next) return;
      ctx.manche.relicState.vent = next + WIND_SECONDS;
      const cells = ctx.manche.grid.cells.map((row) => row.map((c) => ({ ...c })));
      for (let i = 0; i < 2; i++) {
        const r = ctx.rng.int(ctx.manche.grid.size);
        const c = ctx.rng.int(ctx.manche.grid.size);
        if (cells[r][c].isJoker || cells[r][c].hole) continue;
        cells[r][c] = { ...cells[r][c], letter: sampleLetter(FRENCH_STANDARD_WEIGHTS, ctx.rng), gen: (cells[r][c].gen ?? 0) + 1 };
      }
      ctx.manche.grid = { ...ctx.manche.grid, cells };
      ctx.manche.gridDirty = true;
    },
  },
  {
    id: 'troue', name: 'Le cahier troué', rarity: 'rare',
    scene: 'Ton cahier a pris l\'eau dans le cartable. Le papier se perce dès qu\'on écrit dessus.',
    description: 'Chaque case utilisée dans un mot juste se perce et devient inutilisable',
    onWordAccepted: (found, ctx) => {
      const cells = ctx.manche.grid.cells.map((row) => row.map((c) => ({ ...c })));
      for (const [r, c] of found.path) cells[r][c] = { ...cells[r][c], hole: true };
      ctx.manche.grid = { ...ctx.manche.grid, cells };
      ctx.manche.holes = [...ctx.manche.holes, ...found.path.map(([r, c]) => posKey(r, c))];
      ctx.manche.gridDirty = true;
    },
  },
  {
    id: 'sprint', name: 'Calcul mental', rarity: 'common',
    scene: 'Elle a rendez-vous chez le dentiste à 16 h. Ça va aller très vite.',
    description: '−30 s de chrono, note à atteindre −30 %',
    secondsDelta: -30, thresholdMult: 0.7,
  },
  {
    id: 'marathon', name: 'Rédaction', rarity: 'common', minManche: 4,
    scene: 'Il pleut. La récré est annulée. On a tout notre temps. Tout.',
    description: '+45 s de chrono, note à atteindre +40 %',
    secondsDelta: 45, thresholdMult: 1.4,
  },
  {
    id: 'duel', name: 'Le duel', rarity: 'rare', enemy: true, boss: true,
    scene: 'Kévin s\'est assis en face de toi, pas à côté. Il a posé sa feuille. Il ne copiera pas aujourd\'hui.',
    description: 'Kévin en personne, deux fois plus coriace qu\'un cancre ordinaire. Il bouge vite. Le faire taire rapporte gros',
  },
  {
    id: 'geante', name: 'Grande carte', rarity: 'rare', minManche: 4,
    scene: 'Elle déroule la grande carte de France par-dessus le tableau. On va voir grand.',
    description: 'Une feuille d\'une taille de plus (jusqu\'à 7×7), avec le chrono qui va avec',
    sizeDelta: 1,
  },
];

export const MUTATOR_BY_ID = new Map(MUTATORS.map((m) => [m.id, m]));
export const MAX_GRID_SIZE = 7;

export function mutatorGridSize(base: number, m: Mutator | null): number {
  return Math.min(MAX_GRID_SIZE, base + (m?.sizeDelta ?? 0));
}

// Une dictée sur deux : la maîtresse hésite entre deux leçons, et c'est toi qui tranches.
// Les dictées impaires restent des dictées nues, pour respirer.
export function hasLessonChoice(manche: number): boolean {
  return manche >= 2 && manche % 2 === 0;
}


