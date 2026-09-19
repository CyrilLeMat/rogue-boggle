import { create } from 'zustand';
import { CONSUMABLES, FREEZE_SECONDS, INSPIRATION_SECONDS } from '../data/consumables';
import { isConditionManche, mutatorGridSize, pickCondition } from '../data/mutators';
import { ENEMY_BOUNTY, ENEMY_MOVE_SECONDS, enemyHp, ENEMY_NAMES, ENEMY_SURVIVOR_PENALTY, GRENADE_DAMAGE, HARPOON_RATIO, enemyTouched, moveEnemy, spawnEnemies } from '../engine/enemies';
import { dictionary, sageWords } from '../data/dictionary';
import { activeHooks, consumable, mutator as resolveMutator, relics as resolveRelics } from '../data/registry';
import { RELICS } from '../data/relics';
import type { Mood } from '../engine/difficulty';
import { CRITTER_MOVE_SECONDS, CRITTER_MULTIPLIER, moveCritter, spawnCritters, touchedCritters, type Critter } from '../engine/critter';
import { pickQuest, updateQuest } from '../engine/quests';
import { SAGE_CONSOLATION, SAGE_HINT_RATIO, createSageChallenge, isCorrect, isSageManche, sageReward, wordFromPath, type SageChallenge } from '../engine/sage';
import { adjustThreshold, difficultyOf } from '../engine/difficulty';
import { FRENCH_STANDARD_WEIGHTS, generateGrid, sampleLetter } from '../engine/gridGenerator';
import { collectModifiers, makeContext, mancheSeconds, runGridGenerate, runInvalidWord, runMancheEnd, runMancheStart, runRunEnd, runWordAccepted, streakRules, uiFlags } from '../engine/hookRunner';
import { MAX_CONSUMABLES, type MancheView, type RunView } from '../engine/hooks';
import { resolvePath, type FoundWord, type SubmitResult } from '../engine/manche';
import { applyModifiers, baseScore } from '../engine/scoring';
import { candidatesForPath } from '../engine/wordFinder';
import { createRng, randomSeed, type Rng } from '../engine/rng';
import { GRACE_SECONDS_AFTER_LOSS, MANCHE_SECONDS, MAX_SAME_CHARM, STARTING_LIVES, STREAK_MAX_LINKS, STREAK_STEP, STREAK_WINDOW, TOTAL_MANCHES, eurosFor, gridSizeFor, mancheSecondsFor, threshold, timeEuros } from '../engine/rules';
import { generateShopOffer, shopRerollPrice, type ShopInput, type ShopItem } from '../engine/shop';
import type { Grid, Pos } from '../engine/types';
import { findAllWords, findPathForWord } from '../engine/wordFinder';
import { posKey } from '../engine/adjacency';

export type Phase = 'menu' | 'intro' | 'startPick' | 'ready' | 'playing' | 'recap' | 'sage' | 'shop' | 'victory' | 'gameover';

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
  eurosEnemy: number; // primes (+) ou pénalité de survivant (−)
  questLabel: string | null;
  gridSize: number;
  bestWord: FoundWord | null;
  words: FoundWord[];
  missed: string[];
  grid: Grid;                 // grille finale de la manche, pour le récap
  cursedWord: string | null;  // révélé après coup
}

export interface OwnedConsumable { id: string; charges: number }

export interface WordPreview {
  word: string | null;      // null : aucun mot valide sur ce chemin
  score: number;
  base: number;
  parts: { label: string; value: string }[]; // détail du calcul, dans l'ordre
  duplicate: boolean;
}

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
  lastConditionId: string | null;
  seenEnemies: boolean; // la coopérative ne parle de cancres qu'après la première leçon « Le cancre copie »
  sageWins: number;
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
  sage: SageChallenge | null;
  feedback: { kind: SubmitResult['kind']; word?: string; score?: number; bonus?: string; path?: Pos[]; id: number } | null;

  startRun(seed?: string): void;
  acceptChallenge(): void; // prologue → fourniture de rentrée
  pickStartRelic(id: string): void;
  startManche(): void;
  rerollGrid(): void; // Sourcier, depuis l'écran « prêt »
  beginPlay(): void; // écran « prêt » → chrono lancé
  submitPath(path: Pos[]): void;
  previewPath(path: Pos[]): WordPreview | null; // score qu'aurait le tracé en cours, sans effet de bord
  tick(dt: number): void;
  endManche(early?: boolean): void;
  finishEarly(): void;
  continueAfterRecap(): void;
  sageTick(dt: number): void;
  sageSubmit(path: Pos[]): void;
  sageGiveUp(): void;
  leaveSage(): void;
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
    streak: { links: 0, lastAt: -Infinity }, quest: null, luckyLetter: null, amorce: null,
    inspiration: null, gridDirty: false, mutatorId: run.nextMutatorId, enemies: [], killsThisManche: 0,
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
  sage: null,
  feedback: null,

  startRun(seed = randomSeed()) {
    const rng = createRng(seed);
    // Bouclier de case est inutile sans mutateur toxique : pas en choix de départ.
    const pool = RELICS.filter((r) => r.rarity === 'common' && !r.enemyRelic && !r.requires && r.id !== 'bouclier');
    const startChoices = rng.shuffle(pool).slice(0, 3).map((r) => r.id);
    set({
      phase: 'intro',
      run: {
        seed, rng, snailRng: createRng(seed + '-snail'), score: 0, euros: 0, lives: STARTING_LIVES, currentManche: 1,
        relicIds: [], killCount: 0, history: [], endBonus: 0,
        consumables: [], pendingCurseIds: [], tookEnemyMutator: false, lostLifeLastManche: false, nextMutatorId: null, lastConditionId: null, seenEnemies: false, sageWins: 0,
      },
      lastResult: null,
      startChoices,
      shop: [],
    });
  },

  acceptChallenge() {
    if (get().phase === 'intro') set({ phase: 'startPick' });
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
      run: { ...run, pendingCurseIds: [], consumables, seenEnemies: run.seenEnemies || draft.enemies.length > 0 },
    });
  },

  rerollGrid() {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'ready' || manche.gridRerollsLeft <= 0) return;
    const mut = manche.mutatorId ? resolveMutator(manche.mutatorId) : null;
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const draft: MancheState = { ...manche, relicState: {}, bonuses: [], cursedWord: null, cursedStart: null, radarCell: null, luckyLetter: null, amorce: null, gridRerollsLeft: manche.gridRerollsLeft - 1 };
    buildGrid(draft, run, hooks, mut);
    set({ manche: draft });
  },

  beginPlay() {
    if (get().phase === 'ready') set({ phase: 'playing' });
  },

  previewPath(path) {
    const { manche, phase, run } = get();
    if (!manche || !run || phase !== 'playing' || path.length < 2) return null;
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const ctx = makeContext(run.rng, run, cloneManche(manche), dictionary);
    const already = new Set(manche.found.map((f) => f.word));
    const touched = touchedCritters(path, manche.critters);
    const rules = streakRules(hooks, { window: STREAK_WINDOW, maxLinks: STREAK_MAX_LINKS });
    const links = manche.elapsed - manche.streak.lastAt <= rules.window ? manche.streak.links + 1 : 1;
    const streakMult = 1 + STREAK_STEP * Math.min(links - 1, rules.maxLinks);
    const candidates = candidatesForPath(manche.grid, path, dictionary.trie);
    if (!candidates.length) return { word: null, score: 0, base: 0, parts: [], duplicate: false };
    const fresh = candidates.filter((w) => !already.has(w));
    if (!fresh.length) return { word: candidates[0], score: 0, base: 0, parts: [], duplicate: true };
    let best: WordPreview | null = null;
    for (const word of fresh) {
      const base = baseScore(word, manche.grid, path);
      const mods = collectModifiers(word, hooks, ctx);
      const flat = mods.reduce((s, m) => s + (m.flat ?? 0), 0);
      const mult = mods.reduce((p, m) => p * (1 + (m.percent ?? 0)), 1);
      const finals = mods.reduce((p, m) => p * (m.final ?? 1), 1);
      const parts: WordPreview['parts'] = [{ label: 'base', value: String(base) }];
      if (flat) parts.push({ label: 'bonus', value: `+${flat}` });
      if (mult !== 1) parts.push({ label: 'fournitures', value: `×${mult.toFixed(2).replace(/\.?0+$/, '')}` });
      if (finals !== 1) parts.push({ label: 'spécial', value: `×${finals}` });
      if (touched.length) parts.push({ label: 'escargot', value: `×${CRITTER_MULTIPLIER}${touched.length > 1 ? `×${touched.length}` : ''}` });
      if (streakMult > 1) parts.push({ label: 'élan', value: `×${streakMult.toFixed(1)}` });
      const extra = [...touched.map(() => ({ final: CRITTER_MULTIPLIER })), ...(streakMult > 1 ? [{ final: streakMult }] : [])];
      const score = applyModifiers(base, [...mods, ...extra]);
      if (!best || score > best.score) best = { word, score, base, parts, duplicate: false };
    }
    return best;
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
    const fb = { kind: result.kind, id: ++feedbackId, path } as NonNullable<Store['feedback']>;
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
      if (streakMult > 1) notes.push(`élan ×${streakMult.toFixed(1)}`);
      // Chasse : dégâts à l'ennemi traversé (ou 25 % via Harpon), primes à la mort
      if (draft.enemies.some((e) => e.hp > 0)) {
        let bounty = 0;
        let killedNow = 0;
        draft.enemies = draft.enemies.map((e) => {
          if (e.hp <= 0) return e;
          const hit = enemyTouched(path, e);
          let dmg = hit ? result.found.score : ctx.hasRelic('harpon') ? Math.round(result.found.score * HARPOON_RATIO) : 0;
          if (dmg <= 0) return e;
          for (const h of hooks) if (h.onDamage) dmg = h.onDamage(result.found.word, e, dmg, ctx);
          const hp = Math.max(0, e.hp - dmg);
          notes.push(hp > 0 ? `${ENEMY_NAMES[e.typeId]} −${dmg}` : `${ENEMY_NAMES[e.typeId]} calmé`);
          if (hp === 0) {
            let b = ENEMY_BOUNTY;
            for (const h of hooks) if (h.onEnemyKilled) b = h.onEnemyKilled(e, b, ctx);
            bounty += b;
            killedNow++;
          }
          return { ...e, hp };
        });
        if (killedNow > 0) {
          draft.killsThisManche += killedNow;
          notes.push(`prime +${bounty} billes`);
          set({ run: { ...run, euros: run.euros + bounty, killCount: run.killCount + killedNow } });
        }
      }
      if (draft.quest && !draft.quest.done) {
        draft.quest = updateQuest(draft.quest, draft.found);
        if (draft.quest.done) notes.push(`consigne +${draft.quest.reward} billes`);
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
    const enemies = manche.enemies.map((e) => {
      if (e.hp <= 0 || elapsed < e.nextMoveAt) return e;
      return { ...moveEnemy(e, manche.grid, manche.search, run.snailRng, manche.enemies.filter((o) => o !== e && o.hp > 0)), nextMoveAt: e.nextMoveAt + ENEMY_MOVE_SECONDS };
    });
    set({ manche: { ...manche, timeLeft, elapsed, critters, enemies } });
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
    const survivors = manche.enemies.filter((e) => e.hp > 0).length;
    const eurosEnemy = -Math.min(survivors * ENEMY_SURVIVOR_PENALTY, breakdown.total + eurosTime + eurosQuest);
    const euros = runMancheEnd(hooks, ctx, success, breakdown.total + eurosTime + eurosQuest + eurosEnemy);
    const foundSet = new Set(manche.found.map((f) => f.word));
    const missed = [...manche.search.words]
      .filter((w) => !foundSet.has(w))
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
      .slice(0, 5);
    const result: MancheResult = {
      manche: run.currentManche, score: manche.score, threshold: t, mood: manche.difficulty.mood, success,
      euros, eurosBase: breakdown.base, eurosBonus: breakdown.bonus, eurosTime, eurosQuest, eurosEnemy,
      questLabel: manche.quest?.label ?? null, gridSize: manche.grid.size,
      bestWord: manche.found.reduce<FoundWord | null>((b, f) => (!b || f.score > b.score ? f : b), null),
      words: manche.found, missed,
      grid: manche.grid, cursedWord: manche.cursedWord,
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
    // Le Sage du CM1 s'invite après certaines dictées : une respiration avant la coopérative.
    if (isSageManche(run.currentManche)) {
      set({ phase: 'sage', sage: createSageChallenge(sageWords(), run.rng) });
      return;
    }
    openShop();
  },

  sageTick(dt) {
    const { sage, phase } = get();
    if (!sage || phase !== 'sage' || sage.outcome !== 'playing') return;
    const timeLeft = Math.max(0, sage.timeLeft - dt);
    let next: SageChallenge = { ...sage, timeLeft };
    if (!next.hintGiven && timeLeft <= sage.seconds * SAGE_HINT_RATIO) next = { ...next, hintGiven: true };
    if (timeLeft === 0) next = { ...next, outcome: 'lost', reward: SAGE_CONSOLATION };
    set({ sage: next });
    if (next.outcome === 'lost') payoutSage(next);
  },

  sageSubmit(path) {
    const { sage } = get();
    if (!sage || sage.outcome !== 'playing' || path.length < 2) return;
    if (isCorrect(wordFromPath(sage.grid, path), sage.word, dictionary)) {
      const won: SageChallenge = { ...sage, outcome: 'won', reward: sageReward(sage.word.length, sage.timeLeft) };
      set({ sage: won });
      payoutSage(won);
      return;
    }
    set({ sage: { ...sage, attempts: sage.attempts + 1 } });
  },

  sageGiveUp() {
    const { sage } = get();
    if (!sage || sage.outcome !== 'playing') return;
    const lost: SageChallenge = { ...sage, outcome: 'lost', reward: SAGE_CONSOLATION, timeLeft: 0 };
    set({ sage: lost });
    payoutSage(lost);
  },

  leaveSage() {
    if (get().phase !== 'sage') return;
    set({ sage: null });
    openShop();
  },

  rerollShop() {
    const { run, shop, shopRerolls } = get();
    if (!run) return;
    const price = shopRerollPrice(shopRerolls.paid, shopRerolls.freeLeft);
    if (run.euros < price) return;
    void shop;
    // tous les emplacements sont retirés, achetés ou non : une boutique vidée se remplit à nouveau
    const next = generateShopOffer(shopInput(run), run.rng);
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
    if (item.kind === 'relic') {
      const def = resolveRelics([item.id])[0];
      const count = run.relicIds.filter((r) => r === item.id).length;
      if (count > 0 && !def.stackable) return;
      if (def.charm && count >= MAX_SAME_CHARM) return;
      next.relicIds = [...run.relicIds, item.id];
    }
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
    const manche = run.currentManche + 1;
    const condition = isConditionManche(manche) ? pickCondition(run.rng, run.lastConditionId, manche) : null;
    set({ run: { ...run, currentManche: manche, nextMutatorId: condition, lastConditionId: condition ?? run.lastConditionId }, shop: [] });
    get().startManche();
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
    } else if (def.kind === 'grenade') {
      if (!manche.enemies.some((e) => e.hp > 0)) return;
      const enemies = manche.enemies.map((e) => ({ ...e, hp: Math.max(0, e.hp - GRENADE_DAMAGE) }));
      const killed = enemies.filter((e, i) => e.hp === 0 && manche.enemies[i].hp > 0).length;
      set({
        manche: { ...manche, enemies, killsThisManche: manche.killsThisManche + killed },
        run: { ...run, consumables: spend(), euros: run.euros + killed * ENEMY_BOUNTY, killCount: run.killCount + killed },
        feedback: { kind: 'ok', word: 'Boulette géante', score: GRENADE_DAMAGE, bonus: killed ? 'cancre calmé · prime +30 billes' : undefined, id: ++feedbackId },
      });
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
    set({ phase: 'menu', run: null, manche: null, lastResult: null, feedback: null, startChoices: [], shop: [], sage: null });
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
  draft.critters = mut?.snails ? spawnCritters(grid, run.snailRng) : [];
  draft.quest = mut?.quest ? pickQuest(grid, search, run.rng) : null;
  // Le cancre copie : 1 cancre ; punition Classe de cancres : +2 (même hors leçon) ; Cancres têtus : endurance ×1.5
  const count = (mut?.enemy ? 1 : 0) + (draft.curseIds.includes('infestation') ? 2 : 0);
  const hpMult = draft.curseIds.includes('peau-dure') ? 1.5 : 1;
  draft.enemies = count ? spawnEnemies(grid, search, run.rng, enemyHp(draft.threshold, count, hpMult), count) : [];
  runMancheStart(hooks, ctx);
}

function payoutSage(c: SageChallenge) {
  const { run } = useRunStore.getState();
  if (!run) return;
  useRunStore.setState({
    run: { ...run, euros: run.euros + c.reward, sageWins: run.sageWins + (c.outcome === 'won' ? 1 : 0) },
  });
}

function openShop() {
  const { run } = useRunStore.getState();
  if (!run) return;
  const shop = generateShopOffer(shopInput(run), run.rng);
  const freeLeft = resolveRelics(run.relicIds).reduce((n, r) => n + (r.shopRerolls ?? 0), 0);
  useRunStore.setState({ phase: 'shop', shop, shopRerolls: { paid: 0, freeLeft } });
}

function shopInput(run: RunState): ShopInput {
  return {
    manche: run.currentManche,
    relicIds: run.relicIds,
    consumableIds: run.consumables.map((c) => c.id),
    pendingCurseIds: run.pendingCurseIds,
    enemiesEnabled: run.seenEnemies,
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
