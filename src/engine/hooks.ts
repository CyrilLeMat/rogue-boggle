import type { Difficulty } from './difficulty';
import type { FoundWord } from './manche';
import type { Rng } from './rng';
import type { ScoreModifier } from './scoring';
import type { Cell, Grid, WordCategory } from './types';
import type { WordSearch } from './wordFinder';

export type Rarity = 'common' | 'rare' | 'legendary';

export interface MancheView {
  grid: Grid;
  search: WordSearch;
  threshold: number;        // seuil ajusté à la difficulté de la grille
  difficulty: Difficulty;
  found: FoundWord[];
  timeLeft: number;
  timeLeftBeforeWord: number; // chrono au moment de la validation, avant les effets des relics
  elapsed: number;
  cursedWord: string | null;
  cursedStart: number | null; // posKey de la première lettre du mot désigné
  cursedVisible: boolean;     // dicté à voix haute (leçon) ou gardé secret (fourniture) ?
  holes: number[];            // posKey des cases percées (leçon « Le cahier troué »)
  streak: { links: number; lastAt: number }; // série de mots rapprochés
  luckyLetter: string | null; // Lettre porte-bonheur : tirée parmi les lettres de la grille
  amorce: { prefix: string; length: number; start: number | null } | null; // relic Amorce
  inspiration: { cells: number[]; until: number; length: number; first: string } | null; // consommable Inspiration
  enemies: Enemy[];
  killsThisManche: number;
  gridDirty: boolean; // un hook a modifié des lettres : le store recalcule les mots trouvables
  mutatorId: string | null;
  quest: Quest | null;
  radarCell: number | null;
  relicState: Record<string, number>; // compteurs par manche (Bouclier, etc.)
  bonuses: { label: string; points: number }[]; // bonus hors mot (Grille complète…), consommés par le store
}

export interface RunView {
  score: number;
  euros: number;
  lives: number;
  currentManche: number;
  relicIds: string[];
  killCount: number;
}

export interface RunContext {
  rng: Rng;
  run: RunView;
  manche: MancheView;
  timer: { add(seconds: number): void; setMin(seconds: number): void };
  addBonus(label: string, points: number): void;
  categoriesOf(word: string): Set<WordCategory>;
  isCommon(word: string): boolean;
  hasRelic(id: string): boolean;
}

export interface Quest {
  id: string;
  label: string;
  target: number;
  progress: number;
  reward: number; // euros
  done: boolean;
}

export interface Enemy { id: string; typeId: string; cells: [number, number][]; hp: number; maxHp: number; nextMoveAt: number }

export type UiFlags = Partial<{
  blurOutsideCursor: boolean;  // Vision trouble : grille floutée hors rayon 2 autour du curseur
  highlightUsedCells: boolean; // Mémoire
  showLongestLength: boolean;  // Oracle
  targetedReroll: boolean;     // Reroll ciblé
}>;

export interface Relic {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  requires?: string;
  price?: number;       // remplace le prix par rareté (charmes)
  charm?: boolean;      // petit achat généré à la volée
  stackable?: boolean;  // peut être possédé plusieurs fois
  enemyRelic?: boolean; // proposé seulement à partir de la manche 2, boosté si mutateur à ennemis pris
  shopRerolls?: number; // changements de boutique gratuits par visite (Brocanteur)
  gridRerolls?: number; // Sourcier : nouvelles grilles possibles sur l'écran « prêt »
  streakWindow?: number; // Combo : fenêtre de série élargie
  streakMaxLinks?: number;
  streakStep?: number;   // gain de multiplicateur par maillon d'élan
  // Personnalités d'élève (src/data/archetypes.ts)
  archetype?: boolean;   // jamais vendu à la coopérative
  flavor?: string;       // la phrase de caractère
  extraLives?: number;   // bons points supplémentaires à la rentrée
  thresholdMult?: number; // la maîtresse en attend plus (ou moins) de toi
  eurosMult?: number;    // billes gagnées en fin de dictée
  onWordFound?: (word: string, ctx: RunContext) => ScoreModifier | void;      // pur : appelé pour chaque candidat
  onWordAccepted?: (found: FoundWord, ctx: RunContext) => void;               // effets de bord (chrono…)
  onGridGenerate?: (grid: Grid, ctx: RunContext) => Grid;
  onMancheStart?: (ctx: RunContext) => void;
  onTick?: (ctx: RunContext, elapsed: number) => void; // ce qui vit pendant la dictée
  onMancheEnd?: (ctx: RunContext, success: boolean, euros: number) => number;
  onRunEnd?: (ctx: RunContext) => number;
  onInvalidWord?: (ctx: RunContext) => void;                                   // Un seul essai
  mancheSeconds?: (base: number) => number;                                    // Dette de temps
  onCellUsed?: (cell: Cell, ctx: RunContext) => 'neutralize' | void;
  onDamage?: (word: string, enemy: Enemy, damage: number, ctx: RunContext) => number;
  onEnemyKilled?: (enemy: Enemy, bounty: number, ctx: RunContext) => number;
  ui?: UiFlags;
}

// Une malédiction a les mêmes hooks qu'un relic, mais ne vit qu'une manche et a son propre prix.
export interface Curse extends Relic { price: number }

export interface ConsumableDef {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  usesPerManche: number;
  kind: 'reroll' | 'freeze' | 'shuffle' | 'grenade' | 'inspiration';
  needsTarget?: boolean;
  enemyOnly?: boolean;
}

export const MAX_CONSUMABLES = 3;

// Un mutateur modifie la manche à venir ; il partage les hooks de mot d'un relic.
export interface Mutator extends Relic {
  scene?: string;      // pourquoi cette absurdité arrive aujourd'hui
  snails?: boolean;   // thème Escargots
  quest?: boolean;    // thème Objectif
  enemy?: boolean;    // thème Chasse
  minManche?: number; // pas avant cette manche
  sizeDelta?: number;
  secondsDelta?: number;
  thresholdMult?: number;
  weights?: (w: Record<string, number>) => Record<string, number>;
  applyToGrid?: (grid: Grid, rng: Rng) => Grid;
}

// [tuning] ×1.5 après playtest : « j'achète trop, c'est trop facile »
export const RARITY_PRICE: Record<Rarity, number> = { common: 30, rare: 75, legendary: 150 };
export const CONSUMABLE_PRICE: Record<Rarity, number> = { common: 15, rare: 45, legendary: 90 };
export const RARITY_WEIGHT: Record<Rarity, number> = { common: 60, rare: 30, legendary: 10 };
