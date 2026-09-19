import type { Dictionary } from './dictionary';
import { FRENCH_STANDARD_WEIGHTS, generateGrid } from './gridGenerator';
import type { Rng } from './rng';
import { carvePath, commonWordPool, sageSeconds } from './sage';
import type { Grid, Pos, WordCategory } from './types';
import { makeCell, sampleLetter } from './gridGenerator';
import { posKey } from './adjacency';
import type { WordSearch } from './wordFinder';

// Les événements de couloir : une respiration entre deux dictées, après les dictées 2, 4, 6 et 8.
// Trois familles — on joue (hunt, harvest), on choisit (choice), on parie (harvest avec mise).
export const EVENT_AFTER = [2, 4, 6, 8];
export const EVENT_GRID_SIZE = 5;

export type EventId = 'sage' | 'inspecteur' | 'reserve' | 'billes' | 'recitation';

export function isEventManche(manche: number): boolean {
  return EVENT_AFTER.includes(manche);
}

// Le programme de l'année, tiré à la rentrée : quatre événements pour quatre créneaux,
// jamais deux fois le même, et le Sage du CM1 est toujours du voyage (à une place variable).
export function planEvents(rng: Rng): EventId[] {
  const pool: EventId[] = ['inspecteur', 'reserve', 'billes', 'recitation'];
  const others = rng.shuffle(pool).slice(0, EVENT_AFTER.length - 1);
  return rng.shuffle<EventId>(['sage', ...others]);
}

interface Base {
  id: EventId;
  started: boolean;  // on lit la scène d'abord, le chrono ne part qu'après
  seconds: number;
  timeLeft: number;
  outcome: 'playing' | 'won' | 'lost';
  reward: number;
  extraLife: boolean;
}

// On trace un mot désigné : le sage grise les autres cases, l'inspecteur ne t'aide pas.
export interface HuntEvent extends Base {
  kind: 'hunt';
  id: 'sage' | 'inspecteur';
  word: string;
  grid: Grid;
  solution: Pos[];
  active: number[];
  dimmed: boolean;
  hintGiven: boolean;
  attempts: number;
}

// On ramasse des mots sous contrainte, éventuellement en ayant misé.
export interface HarvestEvent extends Base {
  kind: 'harvest';
  id: 'billes' | 'recitation';
  grid: Grid;
  search: WordSearch;
  found: string[];
  target: number;
  ruleId: string | null;
  stake: number | null;
  stakeOptions: number[];
}

// On choisit, sans rien jouer.
export interface ChoiceEvent extends Base {
  kind: 'choice';
  id: 'reserve';
  offers: string[]; // ids de fournitures
}

export type GameEvent = HuntEvent | HarvestEvent | ChoiceEvent;

// --- Contraintes du concours de récitation -------------------------------------------------
export interface RecitationRule {
  id: string;
  label: (p: string) => string;
  test: (word: string, param: string, cats: (w: string) => Set<WordCategory>) => boolean;
  params: (search: WordSearch, dict: Dictionary) => string[];
}

const RULES: RecitationRule[] = [
  {
    id: 'starts',
    label: (p) => `Que des mots qui commencent par ${p}`,
    test: (w, p) => w.startsWith(p),
    params: (search) => {
      const count = new Map<string, number>();
      for (const w of search.words) count.set(w[0], (count.get(w[0]) ?? 0) + 1);
      return [...count.entries()].filter(([, n]) => n >= 6).map(([l]) => l);
    },
  },
  {
    id: 'contains',
    label: (p) => `Que des mots contenant un ${p}`,
    test: (w, p) => w.includes(p),
    params: (search) => {
      const count = new Map<string, number>();
      for (const w of search.words) for (const l of new Set(w)) count.set(l, (count.get(l) ?? 0) + 1);
      return [...count.entries()].filter(([, n]) => n >= 8).map(([l]) => l);
    },
  },
  {
    id: 'long',
    label: (p) => `Que des mots de ${p} lettres ou plus`,
    test: (w, p) => w.length >= Number(p),
    params: (search) => (['5', '6'] as string[]).filter((n) => [...search.words].filter((w) => w.length >= Number(n)).length >= 6),
  },
  {
    id: 'cat',
    label: (p) => (p === 'VER' ? 'Que des verbes' : p === 'NOM' ? 'Que des noms' : 'Que des adjectifs'),
    test: (w, p, cats) => cats(w).has(p as WordCategory),
    params: (search, dict) => (['NOM', 'VER', 'ADJ'] as const)
      .filter((c) => [...search.words].filter((w) => dict.categoriesOf(w).has(c)).length >= 6),
  },
];

export const RULE_BY_ID = new Map(RULES.map((r) => [r.id, r]));

// `ruleId` encode la règle et son paramètre : « starts:R », « long:5 ».
export function pickRule(search: WordSearch, dict: Dictionary, rng: Rng): string | null {
  const usable = RULES.flatMap((r) => r.params(search, dict).map((p) => `${r.id}:${p}`));
  return usable.length ? rng.pick(usable) : null;
}

export function ruleLabel(ruleId: string): string {
  const [id, param] = ruleId.split(':');
  return RULE_BY_ID.get(id)?.label(param) ?? '';
}

export function ruleAccepts(ruleId: string | null, word: string, dict: Dictionary): boolean {
  if (!ruleId) return true;
  const [id, param] = ruleId.split(':');
  const rule = RULE_BY_ID.get(id);
  return rule ? rule.test(word, param, (w) => dict.categoriesOf(w)) : true;
}

// --- Réglages ------------------------------------------------------------------------------
export const SAGE_CONSOLATION = 10;
export const INSPECTOR_SECONDS = 40;
export const INSPECTOR_REWARD = 25;
export const INSPECTOR_PENALTY = 30;
export const INSPECTOR_MIN_LEN = 6;
export const INSPECTOR_MAX_LEN = 9;
export const BILLES_SECONDS = 30;
export const BILLES_TARGET = 4;
export const RECITATION_SECONDS = 45;
export const RECITATION_PER_WORD = 10;
export const RECITATION_TARGET = 3;

export function sageReward(length: number, secondsLeft: number): number {
  return 10 + 5 * length + Math.floor(Math.max(0, secondsLeft) / 3);
}

export function stakeOptions(purse: number): number[] {
  return [10, 25, 50].filter((n) => n <= purse);
}

// --- Création ------------------------------------------------------------------------------
function plantWord(word: string, rng: Rng, size = EVENT_GRID_SIZE) {
  const solution = carvePath(size, word.length, rng) ?? [];
  const cells = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => makeCell(sampleLetter(FRENCH_STANDARD_WEIGHTS, rng))),
  );
  solution.forEach(([r, c], i) => { cells[r][c] = makeCell(word[i]); });
  return { grid: { size, cells } as Grid, solution };
}

export function createHunt(id: 'sage' | 'inspecteur', pool: readonly string[], rng: Rng): HuntEvent {
  const word = rng.pick(pool);
  const { grid, solution } = plantWord(word, rng);
  const seconds = id === 'sage' ? sageSeconds(word.length) : INSPECTOR_SECONDS;
  return {
    kind: 'hunt', id, word, grid, solution,
    active: solution.map(([r, c]) => posKey(r, c)),
    dimmed: id === 'sage',
    hintGiven: false, attempts: 0,
    started: false, seconds, timeLeft: seconds, outcome: 'playing', reward: 0, extraLife: false,
  };
}

export function createHarvest(id: 'billes' | 'recitation', dict: Dictionary, rng: Rng, purse: number): HarvestEvent {
  const { grid, search } = generateGrid(EVENT_GRID_SIZE, FRENCH_STANDARD_WEIGHTS, rng, dict);
  const ruleId = id === 'recitation' ? pickRule(search, dict, rng) : null;
  const seconds = id === 'billes' ? BILLES_SECONDS : RECITATION_SECONDS;
  return {
    kind: 'harvest', id, grid, search, found: [],
    target: id === 'billes' ? BILLES_TARGET : RECITATION_TARGET,
    ruleId, stake: null, stakeOptions: id === 'billes' ? stakeOptions(purse) : [],
    started: false, seconds, timeLeft: seconds, outcome: 'playing', reward: 0, extraLife: false,
  };
}

export function createChoice(offers: string[]): ChoiceEvent {
  return { kind: 'choice', id: 'reserve', offers, started: false, seconds: 0, timeLeft: 0, outcome: 'playing', reward: 0, extraLife: false };
}

export function inspectorWordPool(entries: Parameters<typeof commonWordPool>[0]): string[] {
  return commonWordPool(entries, INSPECTOR_MIN_LEN, INSPECTOR_MAX_LEN);
}
