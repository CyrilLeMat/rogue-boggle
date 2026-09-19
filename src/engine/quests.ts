import type { Quest } from './hooks';
import type { FoundWord } from './manche';
import type { Rng } from './rng';
import type { Grid } from './types';
import type { WordSearch } from './wordFinder';

// Mini-objectif par manche : une direction de plus que le seuil, payée en euros.
interface QuestDef {
  id: string;
  make: (grid: Grid, search: WordSearch, rng: Rng) => Quest | null;
  progress: (quest: Quest, found: FoundWord[]) => number;
}

const RARE = /[KWXYZJ]|QU/;

const DEFS: QuestDef[] = [
  {
    id: 'long-word',
    make: (grid, search) => {
      const len = grid.size + 1;
      if (![...search.words].some((w) => w.length >= len)) return null;
      return { id: 'long-word', label: `Un mot de ${len} lettres ou plus`, target: 1, progress: 0, reward: 20, done: false };
    },
    progress: (q, found) => {
      const len = Number(q.label.match(/\d+/)![0]);
      return found.filter((f) => f.word.length >= len).length;
    },
  },
  {
    id: 'five-plus',
    make: (_grid, search) => ([...search.words].filter((w) => w.length >= 5).length >= 6
      ? { id: 'five-plus', label: 'Trois mots de 5 lettres ou plus', target: 3, progress: 0, reward: 15, done: false } : null),
    progress: (_q, found) => found.filter((f) => f.word.length >= 5).length,
  },
  {
    id: 'starts-with',
    make: (grid, search, rng) => {
      const letters = new Set(grid.cells.flat().filter((c) => !c.isJoker).map((c) => c.letter[0]));
      const options = [...letters].filter((l) => [...search.words].filter((w) => w.startsWith(l)).length >= 5);
      if (!options.length) return null;
      const l = rng.pick(options);
      return { id: 'starts-with', label: `Trois mots commençant par ${l}`, target: 3, progress: 0, reward: 15, done: false };
    },
    progress: (q, found) => {
      const l = q.label.slice(-1);
      return found.filter((f) => f.word.startsWith(l)).length;
    },
  },
  {
    id: 'rare-letter',
    make: (_grid, search) => ([...search.words].some((w) => RARE.test(w))
      ? { id: 'rare-letter', label: 'Un mot avec K, W, X, Y, Z, J ou QU', target: 1, progress: 0, reward: 15, done: false } : null),
    progress: (_q, found) => found.filter((f) => RARE.test(f.word)).length,
  },
  {
    id: 'count',
    make: (grid) => {
      const n = 8 + 2 * (grid.size - 4);
      return { id: 'count', label: `${n} mots dans la manche`, target: n, progress: 0, reward: 15, done: false };
    },
    progress: (_q, found) => found.length,
  },
];

export function pickQuest(grid: Grid, search: WordSearch, rng: Rng): Quest | null {
  const candidates = rng.shuffle(DEFS);
  for (const def of candidates) {
    const q = def.make(grid, search, rng);
    if (q) return q;
  }
  return null;
}

export function updateQuest(quest: Quest, found: FoundWord[]): Quest {
  const def = DEFS.find((d) => d.id === quest.id)!;
  const progress = Math.min(quest.target, def.progress(quest, found));
  return { ...quest, progress, done: progress >= quest.target };
}
