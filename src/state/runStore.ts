import { create } from 'zustand';
import { CONSUMABLES, FREEZE_SECONDS, INSPIRATION_SECONDS } from '../data/consumables';
import { MUTATORS, mutatorGridSize } from '../data/mutators';
import { dictionary } from '../data/dictionary';
import { activeHooks, consumable, mutator as resolveMutator, relics as resolveRelics } from '../data/registry';
import { RELICS } from '../data/relics';
import type { Mood } from '../engine/difficulty';
import { CRITTER_MOVE_SECONDS, CRITTER_MULTIPLIER, moveCritter, spawnCritters, touchedCritters, type Critter } from '../engine/critter';
import { pickQuest, updateQuest } from '../engine/quests';
import { adjustThreshold, difficultyOf } from '../engine/difficulty';
import { FRENCH_STANDARD_WEIGHTS, generateGrid, sampleLetter } from '../engine/gridGenerator';
import { collectModifiers, makeContext, mancheSeconds, runGridGenerate, runInvalidWord, runMancheEnd, runMancheStart, runRunEnd, runWordAccepted, streakRules, uiFlags } from '../engine/hookRunner';
import { MAX_CONSUMABLES, type MancheView, type RunView } from '../engine/hooks';
import { resolvePath, type FoundWord, type SubmitResult } from '../engine/manche';
import { createRng, randomSeed, type Rng } from '../engine/rng';
import { GRACE_SECONDS_AFTER_LOSS, MANCHE_SECONDS, STARTING_LIVES, STREAK_MAX_LINKS, STREAK_STEP, STREAK_WINDOW, TOTAL_MANCHES, eurosFor, gridSizeFor, mancheSecondsFor, threshold, timeEuros } from '../engine/rules';
import { generateShopOffer, shopRerollPrice, type ShopInput, type ShopItem } from '../engine/shop';
import type { Pos } from '../engine/types';
import { findAllWords, findPathForWord } from '../engine/wordFinder';
import { posKey } from '../engine/adjacency';

export type Phase = 'menu' | 'startPick' | 'mutatorPick' | 'ready' | 'playing' | 'recap' | 'shop' | 'victory' | 'gameover';

export interface MancheResult {
  manche: number;
  score: number;
  threshold: number;
  mood: Mood;
  success: boolean;
  euros: number;      // total après relics/malédictions
  eurosBase: number;
  eurosBonus: number;
  eurosTime: number;  // manche terminée en avance
  eurosQuest: number; // objectif de manche rempli
  questLabel: string | null;
  gridSize: number;
  bestWord: FoundWord | null;
  words: FoundWord[];
  missed: string[];
}

export interface OwnedConsumable { id: string; charges: number }

export type MancheState = MancheView & {
  score: number;
  totalSeconds: number;
  curseIds: string[];
  targeting: 'reroll' | null;
  rerollChoice: { pos: Pos; letters: string[] } | null;
  critters: Critter[];
  graceSeconds: number;
  gridRerollsLeft: number; // Sourcier
};

export interface RunState extends RunView {
  seed: string;
  rng: Rng;
  snailRng: Rng; // flux séparé : les déplacements dépendent du timing, ils ne doivent pas désynchroniser la run
  lostLifeLastManche: boolean;
  nextMutatorId: string | null;
  history: MancheResult[];
  endBonus: number;
  consumables: OwnedConsumable[];
  pendingCurseIds: string[];
  tookEnemyMutator: boolean;
}

interface Store {
  phase: Phase;
  run: RunState | null;
  manche: MancheState | null;
  lastResult: MancheResult | null;
  startChoices: string[];
  shop: ShopItem[];
  shopRerolls: { paid: number; freeLeft: number };
  mutatorChoices: string[];
  feedback: { kind: SubmitResult['kind']; word?: string; score?: number; bonus?: string; id: number } | null;

  startRun(seed?: string): void;
  pickStartRelic(id: string): void;
  startManche(): void;
  pickMutator(id: string | null): void;
  rerollGrid(): void; // Sourcier, depuis l'écran « prêt »
  beginPlay(): void; // écran « prêt » → chrono lancé
  submitPath(path: Pos[]): void;
  tick(dt: number): void;
  endManche(early?: boolean): void;
  finishEarly(): void;
  continueAfterRecap(): void;
  buy(index: number): void;
  rerollShop(): void;
  nextManche(): void;
  useConsumable(id: string): void;
  pickCell(pos: Pos): void;
  rerollCell(pos: Pos): void; // double-tap sur une case
  chooseRerollLetter(letter: string): void;
  cancelTargeting(): void;
  backToMenu(): void;
  addRelic(id: string): void;
}

let feedbackId = 0;

const cloneManche = (m: MancheState): MancheState => ({ ...m, relicState: { ...m.relicState }, bonuses: [...m.bonuses] });

function freshManche(run: RunState): MancheState {
  return {
    grid: { size: gridSizeFor(run.currentManche), cells: [] },
    search: { words: new Set(), cellWordCount: [], longWordCells: new Set(), longestLength: 0, longestStart: null },
    threshold: threshold(run.currentManche),
    difficulty: { potential: 0, factor: 1, mood: 'normale' },
    found: [], timeLeft: MANCHE_SECONDS, timeLeftBeforeWord: MANCHE_SECONDS, totalSeconds: MANCHE_SECONDS, elapsed: 0,
    cursedWord: null, cursedStart: null, radarCell: null, relicState: {}, bonuses: [], score: 0,
    streak: { links: 0, lastAt: -Infinity }, quest: null, luckyLetter: null,
    inspiration: null, gridDirty: false, mutatorId: run.nextMutatorId,
    curseIds: [], targeting: null, rerollChoice: null, critters: [], graceSeconds: 0, gridRerollsLeft: 0,
  };
}

export const useRunStore = create<Store>((set, get) => ({
  phase: 'menu',
  run: null,
  manche: null,
  lastResult: null,
  startChoices: [],
  shop: [],
  shopRerolls: { paid: 0, freeLeft: 0 },
  mutatorChoices: [],
  feedback: null,

  startRun(seed = randomSeed()) {
    const rng = createRng(seed);
    // Bouclier de case est inutile sans mutateur toxique : pas en choix de départ.
    const pool = RELICS.filter((r) => r.rarity === 'common' && !r.enemyRelic && !r.requires && r.id !== 'bouclier');
    const startChoices = rng.shuffle(pool).slice(0, 3).map((r) => r.id);
    set({
      phase: 'startPick',
      run: {
        seed, rng, snailRng: createRng(seed + '-snail'), score: 0, euros: 0, lives: STARTING_LIVES, currentManche: 1,
        relicIds: [], killCount: 0, history: [], endBonus: 0,
        consumables: [], pendingCurseIds: [], tookEnemyMutator: false, lostLifeLastManche: false, nextMutatorId: null,
      },
      lastResult: null,
      startChoices,
      shop: [],
    });
  },

  pickStartRelic(id) {
    const { run, startChoices } = get();
    if (!run || !startChoices.includes(id)) return;
    set({ run: { ...run, relicIds: [id] }, startChoices: [] });
    get().startManche();
  },

  startManche() {
    const { run } = get();
    if (!run) return;
    const curseIds = run.pendingCurseIds;
    const mut = run.nextMutatorId ? resolveMutator(run.nextMutatorId) : null;
    const hooks = activeHooks(run.relicIds, curseIds, run.nextMutatorId);
    const draft = freshManche(run);
    draft.curseIds = curseIds;
    const size = mutatorGridSize(gridSizeFor(run.currentManche), mut);
    draft.graceSeconds = run.lostLifeLastManche ? GRACE_SECONDS_AFTER_LOSS : 0;
    const seconds = mancheSeconds(mancheSecondsFor(size) + (mut?.secondsDelta ?? 0), hooks) + draft.graceSeconds;
    draft.timeLeft = draft.timeLeftBeforeWord = draft.totalSeconds = seconds;
    draft.gridRerollsLeft = resolveRelics(run.relicIds).reduce((n, r) => n + (r.gridRerolls ?? 0), 0);
    buildGrid(draft, run, hooks, mut);
    const consumables = run.consumables.map((c) => ({ id: c.id, charges: consumable(c.id).usesPerManche }));
    set({
      phase: 'ready',
      manche: draft,
      feedback: null,
      run: { ...run, pendingCurseIds: [], consumables },
    });
  },

  pickMutator(id) {
    const { run, mutatorChoices } = get();
    if (!run || (id !== null && !mutatorChoices.includes(id))) return;
    set({ run: { ...run, nextMutatorId: id }, mutatorChoices: [] });
    get().startManche();
  },

  rerollGrid() {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'ready' || manche.gridRerollsLeft <= 0) return;
    const mut = manche.mutatorId ? resolveMutator(manche.mutatorId) : null;
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const draft: MancheState = { ...manche, relicState: {}, bonuses: [], cursedWord: null, cursedStart: null, radarCell: null, luckyLetter: null, gridRerollsLeft: manche.gridRerollsLeft - 1 };
    buildGrid(draft, run, hooks, mut);
    set({ manche: draft });
  },

  beginPlay() {
    if (get().phase === 'ready') set({ phase: 'playing' });
  },

  submitPath(path) {
    const { manche, phase, run } = get();
    if (!manche || !run || phase !== 'playing' || manche.targeting) return;
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const draft = cloneManche(manche);
    const ctx = makeContext(run.rng, run, draft, dictionary);
    const already = new Set(manche.found.map((f) => f.word));
    const touched = touchedCritters(path, manche.critters);
    const extra: { final: number }[] = touched.map(() => ({ final: CRITTER_MULTIPLIER }));
    // série : un maillon de plus si le mot précédent est assez récent
    const rules = streakRules(hooks, { window: STREAK_WINDOW, maxLinks: STREAK_MAX_LINKS });
    const links = manche.elapsed - manche.streak.lastAt <= rules.window ? manche.streak.links + 1 : 1;
    const streakMult = 1 + STREAK_STEP * Math.min(links - 1, rules.maxLinks);
    if (streakMult > 1) extra.push({ final: streakMult });
    const result = resolvePath(manche.grid, path, dictionary, already, (w) => collectModifiers(w, hooks, ctx, extra), manche.elapsed);
    const fb = { kind: result.kind, id: ++feedbackId } as NonNullable<Store['feedback']>;
    if (result.kind === 'ok') {
      fb.word = result.found.word;
      fb.score = result.found.score;
      draft.found = [...draft.found, result.found];
      draft.score += result.found.score;
      draft.streak = { links, lastAt: manche.elapsed };
      const notes: string[] = [];
      if (touched.length) {
        notes.push(`escargot ×${CRITTER_MULTIPLIER}${touched.length > 1 ? ` ×${touched.length}` : ''}`);
        draft.critters = draft.critters.map((c, i) => (touched.includes(i) ? moveCritter(c, draft.grid, run.snailRng, path) : c));
      }
      if (streakMult > 1) notes.push(`série ×${streakMult.toFixed(1)}`);
      if (draft.quest && !draft.quest.done) {
        draft.quest = updateQuest(draft.quest, draft.found);
        if (draft.quest.done) notes.push(`objectif +${draft.quest.reward} €`);
      }
      if (notes.length) fb.bonus = notes.join(' · ');
      const before = draft.bonuses.length;
      runWordAccepted(result.found, hooks, ctx);
      const gained = draft.bonuses.slice(before);
      if (gained.length) {
        draft.score += gained.reduce((s, b) => s + b.points, 0);
        fb.bonus = [fb.bonus, ...gained.map((b) => `${b.label} +${b.points}`)].filter(Boolean).join(' · ');
      }
      if (draft.gridDirty) {
        // Terre fracturée : des lettres ont changé, les mots trouvables aussi
        draft.search = findAllWords(draft.grid, dictionary.trie);
        draft.gridDirty = false;
      }
    } else {
      if (result.kind === 'duplicate') fb.word = result.word;
      if (result.kind === 'invalid') runInvalidWord(hooks, ctx);
    }
    set({ manche: draft, feedback: fb });
    if (draft.timeLeft <= 0) get().endManche();
  },

  tick(dt) {
    const { manche, phase } = get();
    if (!manche || phase !== 'playing') return;
    const timeLeft = Math.max(0, manche.timeLeft - dt);
    const elapsed = manche.elapsed + dt;
    const run = get().run!;
    const critters = manche.critters.map((c) => {
      if (elapsed < c.nextMoveAt) return c;
      const others = manche.critters.filter((o) => o !== c).map((o) => o.pos);
      return { ...moveCritter(c, manche.grid, run.snailRng, others), nextMoveAt: c.nextMoveAt + CRITTER_MOVE_SECONDS };
    });
    set({ manche: { ...manche, timeLeft, elapsed, critters } });
    if (timeLeft === 0) get().endManche();
  },

  finishEarly() {
    const { manche, phase } = get();
    if (!manche || phase !== 'playing' || manche.score < manche.threshold) return;
    get().endManche(true);
  },

  endManche(early = false) {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'playing') return;
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const ctx = makeContext(run.rng, run, cloneManche(manche), dictionary);
    const t = manche.threshold;
    const success = manche.score >= t;
    const breakdown = eurosFor(manche.score, t, success);
    const eurosTime = early && success ? timeEuros(manche.timeLeft) : 0;
    const eurosQuest = manche.quest?.done ? manche.quest.reward : 0;
    const euros = runMancheEnd(hooks, ctx, success, breakdown.total + eurosTime + eurosQuest);
    const foundSet = new Set(manche.found.map((f) => f.word));
    const missed = [...manche.search.words]
      .filter((w) => !foundSet.has(w))
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
      .slice(0, 5);
    const result: MancheResult = {
      manche: run.currentManche, score: manche.score, threshold: t, mood: manche.difficulty.mood, success,
      euros, eurosBase: breakdown.base, eurosBonus: breakdown.bonus, eurosTime, eurosQuest,
      questLabel: manche.quest?.label ?? null, gridSize: manche.grid.size,
      bestWord: manche.found.reduce<FoundWord | null>((b, f) => (!b || f.score > b.score ? f : b), null),
      words: manche.found, missed,
    };
    set({
      phase: 'recap',
      lastResult: result,
      manche: { ...manche, targeting: null, rerollChoice: null },
      run: {
        ...run,
        score: run.score + manche.score,
        euros: run.euros + euros,
        lives: success ? run.lives : run.lives - 1,
        lostLifeLastManche: !success,
        history: [...run.history, result],
      },
    });
  },

  continueAfterRecap() {
    const { run, manche } = get();
    if (!run) return;
    const finished = run.lives <= 0 || run.currentManche >= TOTAL_MANCHES;
    if (finished) {
      const hooks = resolveRelics(run.relicIds);
      const ctx = makeContext(run.rng, run, cloneManche(manche!), dictionary);
      const endBonus = runRunEnd(hooks, ctx);
      set({ phase: run.lives <= 0 ? 'gameover' : 'victory', run: { ...run, endBonus, score: run.score + endBonus } });
      return;
    }
    const shop = generateShopOffer(shopInput(run), run.rng);
    const freeLeft = resolveRelics(run.relicIds).reduce((n, r) => n + (r.shopRerolls ?? 0), 0);
    set({ phase: 'shop', shop, shopRerolls: { paid: 0, freeLeft } });
  },

  rerollShop() {
    const { run, shop, shopRerolls } = get();
    if (!run) return;
    const price = shopRerollPrice(shopRerolls.paid, shopRerolls.freeLeft);
    if (run.euros < price) return;
    const keep = shop.map((s) => (s.sold ? s : null));
    const next = generateShopOffer(shopInput(run), run.rng, keep);
    set({
      shop: next,
      run: { ...run, euros: run.euros - price },
      shopRerolls: price === 0
        ? { ...shopRerolls, freeLeft: shopRerolls.freeLeft - 1 }
        : { ...shopRerolls, paid: shopRerolls.paid + 1 },
    });
  },

  buy(index) {
    const { run, shop } = get();
    const item = shop[index];
    if (!run || !item || item.sold || run.euros < item.price) return;
    const next: RunState = { ...run, euros: run.euros - item.price };
    if (item.kind === 'relic') next.relicIds = [...run.relicIds, item.id];
    if (item.kind === 'curse') next.pendingCurseIds = [...run.pendingCurseIds, item.id];
    if (item.kind === 'consumable') {
      if (run.consumables.length >= MAX_CONSUMABLES) return;
      next.consumables = [...run.consumables, { id: item.id, charges: 0 }];
    }
    set({ run: next, shop: shop.map((s, i) => (i === index ? { ...s, sold: true } : s)) });
  },

  nextManche() {
    const { run } = get();
    if (!run) return;
    const next = { ...run, currentManche: run.currentManche + 1, nextMutatorId: null };
    const mutatorChoices = run.rng.shuffle(MUTATORS).slice(0, 3).map((m) => m.id);
    set({ run: next, shop: [], phase: 'mutatorPick', mutatorChoices });
  },

  useConsumable(id) {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'playing') return;
    const owned = run.consumables.find((c) => c.id === id);
    const def = CONSUMABLES.find((c) => c.id === id);
    if (!owned || !def || owned.charges <= 0) return;
    if (def.needsTarget) {
      set({ manche: { ...manche, targeting: 'reroll', rerollChoice: null } });
      return;
    }
    const spend = () => run.consumables.map((c) => (c.id === id ? { ...c, charges: c.charges - 1 } : c));
    if (def.kind === 'freeze') {
      set({ manche: { ...manche, timeLeft: manche.timeLeft + FREEZE_SECONDS }, run: { ...run, consumables: spend() } });
    } else if (def.kind === 'inspiration') {
      const longest = [...manche.search.words].sort((a, b) => b.length - a.length)[0];
      const path = longest ? findPathForWord(manche.grid, longest) : null;
      if (!path) return;
      const inspiration = { cells: path.map(([r, c]) => posKey(r, c)), until: manche.elapsed + INSPIRATION_SECONDS, length: longest.length, first: longest[0] };
      set({ manche: { ...manche, inspiration }, run: { ...run, consumables: spend() } });
    } else if (def.kind === 'shuffle') {
      const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
      const draft = cloneManche(manche);
      const ctx = makeContext(run.rng, run, draft, dictionary);
      const mut = manche.mutatorId ? resolveMutator(manche.mutatorId) : null;
      const weights = mut?.weights ? mut.weights(FRENCH_STANDARD_WEIGHTS) : FRENCH_STANDARD_WEIGHTS;
      const { grid, search } = generateGrid(manche.grid.size, weights, run.rng, dictionary, (g) => runGridGenerate(mut?.applyToGrid ? mut.applyToGrid(g, run.rng) : g, hooks, ctx));
      draft.grid = grid;
      draft.search = search;
      set({ manche: draft, run: { ...run, consumables: spend() } });
    }
  },

  pickCell(pos) {
    const { manche } = get();
    if (manche?.targeting !== 'reroll') return;
    startReroll(pos);
  },

  rerollCell(pos) {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'playing') return;
    const owned = run.consumables.find((c) => c.id === 'reroll');
    if (!owned || owned.charges <= 0) return;
    startReroll(pos);
  },

  chooseRerollLetter(letter) {
    const { manche } = get();
    if (!manche?.rerollChoice) return;
    applyReroll(manche.rerollChoice.pos, letter);
  },

  cancelTargeting() {
    const { manche } = get();
    if (!manche) return;
    set({ manche: { ...manche, targeting: null, rerollChoice: null } });
  },

  backToMenu() {
    set({ phase: 'menu', run: null, manche: null, lastResult: null, feedback: null, startChoices: [], shop: [] });
  },

  addRelic(id) {
    const { run } = get();
    if (!run || run.relicIds.includes(id)) return;
    set({ run: { ...run, relicIds: [...run.relicIds, id] } });
  },
}));

// Génère la grille d'une manche (ou la regénère pour Sourcier) : mutateur, relics, difficulté, escargots, objectif.
function buildGrid(draft: MancheState, run: RunState, hooks: ReturnType<typeof activeHooks>, mut: ReturnType<typeof resolveMutator> | null) {
  const size = draft.grid.size && draft.grid.cells.length ? draft.grid.size : mutatorGridSize(gridSizeFor(run.currentManche), mut);
  const ctx = makeContext(run.rng, run, draft, dictionary);
  const weights = mut?.weights ? mut.weights(FRENCH_STANDARD_WEIGHTS) : FRENCH_STANDARD_WEIGHTS;
  const post = (g: typeof draft.grid) => runGridGenerate(mut?.applyToGrid ? mut.applyToGrid(g, run.rng) : g, hooks, ctx);
  const { grid, search, rawPotential } = generateGrid(size, weights, run.rng, dictionary, post);
  draft.grid = grid;
  draft.search = search;
  draft.difficulty = difficultyOf(rawPotential, size);
  draft.threshold = adjustThreshold(threshold(run.currentManche) * (mut?.thresholdMult ?? 1), draft.difficulty.factor);
  draft.critters = spawnCritters(grid, run.snailRng);
  draft.quest = pickQuest(grid, search, run.rng);
  runMancheStart(hooks, ctx);
}

function shopInput(run: RunState): ShopInput {
  return {
    manche: run.currentManche,
    relicIds: run.relicIds,
    consumableIds: run.consumables.map((c) => c.id),
    pendingCurseIds: run.pendingCurseIds,
    enemiesEnabled: false,
    tookEnemyMutator: run.tookEnemyMutator,
  };
}

function startReroll(pos: Pos) {
  const { run, manche } = useRunStore.getState();
  if (!run || !manche) return;
  {
    const set = useRunStore.setState;
    const flags = uiFlags(resolveRelics(run.relicIds));
    const [r, c] = pos;
    const current = manche.grid.cells[r][c].letter;
    const drawLetter = () => {
      let l = sampleLetter(FRENCH_STANDARD_WEIGHTS, run.rng);
      for (let i = 0; i < 10 && l === current; i++) l = sampleLetter(FRENCH_STANDARD_WEIGHTS, run.rng);
      return l;
    };
    if (flags.targetedReroll) {
      const letters = new Set<string>();
      while (letters.size < 3) letters.add(drawLetter());
      set({ manche: { ...manche, targeting: 'reroll', rerollChoice: { pos, letters: [...letters] } } });
      return;
    }
    applyReroll(pos, drawLetter());
  }
}

function applyReroll([r, c]: Pos, letter: string) {
  const { run, manche } = useRunStore.getState();
  if (!run || !manche) return;
  const cells = manche.grid.cells.map((row) => row.map((cell) => ({ ...cell })));
  cells[r][c] = { ...cells[r][c], letter, isJoker: false };
  const grid = { ...manche.grid, cells };
  const search = findAllWords(grid, dictionary.trie);
  const consumables = run.consumables.map((x) => (x.id === 'reroll' ? { ...x, charges: x.charges - 1 } : x));
  useRunStore.setState({
    manche: { ...manche, grid, search, targeting: null, rerollChoice: null },
    run: { ...run, consumables },
  });
}
