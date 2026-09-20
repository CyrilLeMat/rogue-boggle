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

export type EventId = 'sage' | 'inspecteur' | 'kevin' | 'reserve' | 'billes' | 'recitation' | 'racket';

export function isEventManche(manche: number): boolean {
  return EVENT_AFTER.includes(manche);
}

// Le programme de l'année, tiré à la rentrée : quatre créneaux, et une année qui monte.
// Les deux premiers couloirs sont ordinaires (le Sage et un autre, dans un ordre variable).
// Les deux derniers appartiennent à Kévin : il te défie, puis il ne te défie plus, il prend.
export function planEvents(rng: Rng): EventId[] {
  const pool: EventId[] = ['inspecteur', 'reserve', 'billes', 'recitation'];
  const ordinary = rng.shuffle<EventId>(['sage', rng.pick(pool)]);
  return [...ordinary, 'kevin', 'racket'];
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
  id: 'sage' | 'inspecteur' | 'kevin';
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

// Le racket des toilettes : le seul événement qu'on ne peut pas gagner.
// `demanded` est décidé avant que tu ouvres le cartable — quoi que tu tendes, c'est ça qu'il prend.
export interface RacketEvent extends Base {
  kind: 'racket';
  id: 'racket';
  offers: string[];        // ton cartable au moment où la porte se referme
  demanded: string | null; // null : rien à prendre, il se paie en billes
  offered: string | null;  // ce que tu as tendu, toi
  refused: boolean;        // tu as serré le cartable contre toi
  toll: number;            // billes emportées (cartable vide, ou taxe de résistance)
}

export type GameEvent = HuntEvent | HarvestEvent | ChoiceEvent | RacketEvent;

// --- Contraintes du concours de récitation -------------------------------------------------
export interface RecitationRule {
  id: string;
  label: (p: string) => string;
  test: (word: string, param: string, cats: (w: string) => Set<WordCategory>) => boolean;
  params: (search: WordSearch, dict: Dictionary) => string[];
}

// Une consigne n'est retenue que si le joueur a de quoi la remplir : on ne compte pas
// les mots trouvables, on compte les mots *connus et courts* — les seuls qu'on écrit en 45 s.
export const RECITATION_EASY_LENGTH = 5;
export const RECITATION_MARGIN = 6; // deux fois la cible : il faut le choix, pas juste le compte

function easyWords(search: WordSearch, dict: Dictionary, maxLength = RECITATION_EASY_LENGTH): string[] {
  return [...search.words].filter((w) => w.length <= maxLength && dict.common.has(w));
}

const RULES: RecitationRule[] = [
  {
    id: 'starts',
    label: (p) => `Que des mots qui commencent par ${p}`,
    test: (w, p) => w.startsWith(p),
    params: (search, dict) => {
      const count = new Map<string, number>();
      for (const w of easyWords(search, dict)) count.set(w[0], (count.get(w[0]) ?? 0) + 1);
      return [...count.entries()].filter(([, n]) => n >= RECITATION_MARGIN).map(([l]) => l);
    },
  },
  {
    id: 'contains',
    label: (p) => `Que des mots contenant un ${p}`,
    test: (w, p) => w.includes(p),
    params: (search, dict) => {
      const count = new Map<string, number>();
      for (const w of easyWords(search, dict)) for (const l of new Set(w)) count.set(l, (count.get(l) ?? 0) + 1);
      return [...count.entries()].filter(([, n]) => n >= RECITATION_MARGIN).map(([l]) => l);
    },
  },
  {
    id: 'long',
    label: (p) => `Que des mots de ${p} lettres ou plus`,
    test: (w, p) => w.length >= Number(p),
    // ici « facile » ne peut pas vouloir dire court : on demande des mots connus de la bonne taille
    params: (search, dict) => (['5', '6'] as string[])
      .filter((n) => [...search.words].filter((w) => w.length >= Number(n) && dict.common.has(w)).length >= RECITATION_MARGIN),
  },
  {
    id: 'cat',
    label: (p) => (p === 'VER' ? 'Que des verbes' : p === 'NOM' ? 'Que des noms' : 'Que des adjectifs'),
    test: (w, p, cats) => cats(w).has(p as WordCategory),
    params: (search, dict) => (['NOM', 'VER', 'ADJ'] as const)
      .filter((c) => easyWords(search, dict).filter((w) => dict.categoriesOf(w).has(c)).length >= RECITATION_MARGIN),
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

// « On pouvait écrire… » : quelques mots courts et connus que la consigne acceptait.
export function ruleExamples(ruleId: string | null, search: WordSearch, dict: Dictionary, exclude: readonly string[], max = 5): string[] {
  // « que des mots de 6 lettres » n'a évidemment aucun exemple court : on remonte la limite
  const [kind, param] = (ruleId ?? '').split(':');
  const maxLength = kind === 'long' ? Number(param) + 2 : RECITATION_EASY_LENGTH;
  return easyWords(search, dict, maxLength)
    .filter((w) => !exclude.includes(w) && ruleAccepts(ruleId, w, dict))
    // on montre des mots qui font envie : ni « EUS », ni un mot à rallonge
    .sort((a, b) => Math.abs(a.length - 5) - Math.abs(b.length - 5) || a.localeCompare(b))
    .slice(0, max);
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
export const KEVIN_SECONDS = 45;   // [tuning]
export const KEVIN_REWARD = 35;    // [tuning] il paie en billes, il n'a que ça
export const KEVIN_PENALTY = 25;   // [tuning] il repart avec les tiennes
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

export function createHunt(id: 'sage' | 'inspecteur' | 'kevin', pool: readonly string[], rng: Rng): HuntEvent {
  const word = rng.pick(pool);
  const { grid, solution } = plantWord(word, rng);
  const seconds = id === 'sage' ? sageSeconds(word.length) : id === 'kevin' ? KEVIN_SECONDS : INSPECTOR_SECONDS;
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

export const RACKET_TOLL = 0.5; // [tuning] cartable vide : il se sert dans les poches

export function createRacket(offers: string[], demanded: string | null, toll: number): RacketEvent {
  return {
    kind: 'racket', id: 'racket', offers, demanded, offered: null, refused: false, toll,
    started: false, seconds: 0, timeLeft: 0, outcome: 'playing', reward: 0, extraLife: false,
  };
}

export function createChoice(offers: string[]): ChoiceEvent {
  return { kind: 'choice', id: 'reserve', offers, started: false, seconds: 0, timeLeft: 0, outcome: 'playing', reward: 0, extraLife: false };
}

export function inspectorWordPool(entries: Parameters<typeof commonWordPool>[0]): string[] {
  return commonWordPool(entries, INSPECTOR_MIN_LEN, INSPECTOR_MAX_LEN);
}
