import { create } from 'zustand';
import { DEFAULT_LEVEL, level as resolveLevel } from '../data/levels';
import { DEFAULT_IDENTITY, DEFAULT_PROFILE, MONOLOGUE, mention, noteSur20, pickAppreciation, say, type Identity } from '../theme/lexicon';
import { CONSUMABLES, FREEZE_SECONDS, INSPIRATION_SECONDS } from '../data/consumables';
import { randomCharm } from '../data/charms';
import { hasLessonChoice, mutatorGridSize } from '../data/mutators';
import { hasInterlude, memoryAfter, pickInterlude } from '../data/interludes';
import { planScenes, randomLessonId, sceneChoice, sceneNamesRival, sceneRelic } from '../data/scenes';
import { BOSS_BOUNTY, DUEL_HP, DUEL_SECONDS, KEVIN_MARBLES, ENEMY_BOUNTY, ENEMY_MOVE_SECONDS, enemyHp, ENEMY_NAMES, ENEMY_SURVIVOR_PENALTY, GRENADE_DAMAGE, HARPOON_RATIO, enemyTouched, moveEnemy, spawnEnemies } from '../engine/enemies';
import { dictionary, inspectorWords, sageWords } from '../data/dictionary';
import { activeHooks, consumable, mutator as resolveMutator, relics as resolveRelics } from '../data/registry';
import { ARCHETYPES, STARTING_PURSE } from '../data/archetypes';
import type { Mood } from '../engine/difficulty';
import { CRITTER_MOVE_SECONDS, CRITTER_MULTIPLIER, moveCritter, spawnCritters, touchedCritters, type Critter } from '../engine/critter';
import { pickQuest, updateQuest } from '../engine/quests';
import { SAGE_HINT_RATIO, isCorrect, wordFromPath } from '../engine/sage';
import {
  INSPECTOR_PENALTY, INSPECTOR_REWARD, KEVIN_PENALTY, KEVIN_REWARD, RACKET_TOLL, RECITATION_PER_WORD, SAGE_CONSOLATION,
  createChoice, createHarvest, createHunt, createRacket, isEventManche, planEvents, ruleAccepts, sageReward,
  type EventId, type GameEvent, type RacketEvent,
} from '../engine/events';
import { adjustThreshold, difficultyOf } from '../engine/difficulty';
import { FRENCH_STANDARD_WEIGHTS, generateGrid, sampleLetter } from '../engine/gridGenerator';
import { jokerMinLength, collectModifiers, eurosMultiplier, extraLives, makeContext, mancheSeconds, runGridGenerate, runInvalidWord, runMancheEnd, runMancheStart, runRunEnd, runWordAccepted, streakRules, thresholdMultiplier, uiFlags } from '../engine/hookRunner';
import { MAX_CONSUMABLES, type MancheView, type RunView } from '../engine/hooks';
import { resolvePath, type FoundWord, type SubmitResult } from '../engine/manche';
import { applyModifiers, baseScore } from '../engine/scoring';
import { candidatesForPath } from '../engine/wordFinder';
import { createRng, randomSeed, type Rng } from '../engine/rng';
import { GRACE_SECONDS_AFTER_LOSS, JOKER_MIN_LENGTH, MANCHE_SECONDS, MAX_SAME_CHARM, MIN_WORD_LENGTH, MIN_REMAINING_WORDS, STARTING_LIVES, STREAK_MAX_LINKS, STREAK_STEP, STREAK_WINDOW, TOTAL_MANCHES, eurosFor, gridSizeFor, mancheSecondsFor, threshold, timeEuros } from '../engine/rules';
import { drawFreeRelics, generateShopOffer, shopRerollPrice, type ShopInput, type ShopItem } from '../engine/shop';
import type { Grid, Pos } from '../engine/types';
import { findAllWords, findPathForWord } from '../engine/wordFinder';
import { posKey } from '../engine/adjacency';

export type Phase = 'menu' | 'appel' | 'intro' | 'startPick' | 'scenePick' | 'ready' | 'playing' | 'recap' | 'duelIntro' | 'duelEnd' | 'interlude' | 'event' | 'shop' | 'victory' | 'gameover';

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
  livesAfter: number;
  bestWord: FoundWord | null;
  words: FoundWord[];
  missed: string[];
  grid: Grid;                 // grille finale de la manche, pour le récap
  cursedWord: string | null;  // révélé après coup
  appreciation: string;       // choisie à la remise de copie, jamais deux fois la même dans l'année
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
  impact: { cell: number; label: string; id: number } | null; // le coup qui vient d'être porté
  totalSeconds: number;
  curseIds: string[];
  targeting: 'reroll' | null;
  rerollChoice: { pos: Pos; letters: string[] } | null;
  critters: Critter[];
  graceSeconds: number;
  gridRerollsLeft: number; // Sourcier
};

export interface RunState extends RunView {
  identity: Identity;
  levelId: string;
  seed: string;
  rng: Rng;
  snailRng: Rng; // flux séparé : les déplacements dépendent du timing, ils ne doivent pas désynchroniser la run
  lostLifeLastManche: boolean;
  nextMutatorId: string | null;
  lastConditionId: string | null;
  seenEnemies: boolean; // la coopérative ne parle de cancres qu'après la première leçon « Le cancre copie »
  seenShop: boolean;    // la scène d'arrivée ne se joue qu'une fois par année
  sageWins: number;
  eventPlan: EventId[];   // le programme de l'année, tiré à la rentrée
  scenePlan: string[];    // les planches de l'année, une par dictée paire
  seenInterludes: string[]; // les transitions déjà jouées : on ne repasse pas deux fois au même endroit
  saidThoughts: string[];        // pensées déjà déclamées : jamais deux fois la même dans l'année
  saidAppreciations: string[];   // idem pour le stylo rouge de la maîtresse
  pendingScene: { sceneId: string; choice: number; lessonId: string | null } | null;
  history: MancheResult[];
  endBonus: number;
  consumables: OwnedConsumable[];
  pendingCurseIds: string[];
  tookEnemyMutator: boolean;
  stolenRelicId: string | null; // ce que Kévin a pris aux toilettes, et qu'il garde jusqu'au duel
  duelDone: boolean;            // l'affrontement a eu lieu : il n'a pas lieu deux fois
  duelChoice: 'claque' | 'main' | null; // ce que tu as fait de lui une fois à terre
}

interface Store {
  phase: Phase;
  run: RunState | null;
  manche: MancheState | null;
  lastResult: MancheResult | null;
  startChoices: string[];
  currentScene: string | null;
  currentInterlude: string | null;
  shop: ShopItem[];
  shopRerolls: { paid: number; freeLeft: number };
  event: GameEvent | null;
  duelWon: boolean;           // résultat du dernier affrontement, lu par la planche de fin
  duelBack: string | null;    // ce qu'il rend (ou garde) : l'objet volé aux toilettes
  feedback: { kind: SubmitResult['kind']; word?: string; score?: number; bonus?: string; path?: Pos[]; id: number } | null;

  startRun(seed?: string): void;
  resumeRun(): boolean;
  setIdentity(identity: Identity, levelId: string): void;
  drawThought(): string;
  acceptChallenge(): void; // prologue → fourniture de rentrée
  pickStartRelic(id: string): void;
  pickSceneChoice(choice: number): void;
  startManche(): void;
  rerollGrid(): void; // Sourcier, depuis l'écran « prêt »
  beginPlay(): void; // écran « prêt » → chrono lancé
  submitPath(path: Pos[]): void;
  previewPath(path: Pos[]): WordPreview | null; // score qu'aurait le tracé en cours, sans effet de bord
  tick(dt: number): void;
  endManche(early?: boolean): void;
  finishEarly(): void;
  continueAfterRecap(): void;
  continueAfterInterlude(): void;
  eventStart(): void;
  eventTick(dt: number): void;
  eventSubmit(path: Pos[]): void;
  eventStake(amount: number): void;
  eventChoose(relicId: string): void;
  racketOffer(relicId: string): void; // tu tends quelque chose ; il prend autre chose
  racketRefuse(): void;
  eventGiveUp(): void;
  startDuel(): void; // la planche d'annonce lance l'affrontement
  duelChoose(choice: 'claque' | 'main'): void; // il est à terre : ce que tu en fais
  leaveDuel(): void; // la planche « Kévin à terre » renvoie à la dernière dictée
  leaveEvent(): void;
  enterShop(): void;
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
    cursedWord: null, cursedStart: null, cursedVisible: false, holes: [], radarCell: null, relicState: {}, bonuses: [], score: 0, impact: null,
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
  currentScene: null,
  currentInterlude: null,
  shop: [],
  shopRerolls: { paid: 0, freeLeft: 0 },
  event: null,
  duelWon: false,
  duelBack: null,
  feedback: null,

  startRun(seed = randomSeed()) {
    clearSavedRun(); // une nouvelle année efface l'ancienne sauvegarde
    const rng = createRng(seed);
    const startChoices = ARCHETYPES.map((a) => a.id);
    set({
      phase: 'appel',
      run: {
        identity: loadIdentity(), levelId: loadLevel(), seed, rng, snailRng: createRng(seed + '-snail'), score: 0, euros: 0, lives: STARTING_LIVES, currentManche: 1,
        relicIds: [], killCount: 0, history: [], endBonus: 0,
        consumables: [], pendingCurseIds: [], tookEnemyMutator: false, lostLifeLastManche: false, nextMutatorId: null, lastConditionId: null, seenEnemies: false, seenShop: false, sageWins: 0, eventPlan: planEvents(rng),
        scenePlan: planScenes(rng, 5), pendingScene: null, seenInterludes: [], saidThoughts: [], saidAppreciations: [], stolenRelicId: null, duelDone: false, duelChoice: null,
      },
      lastResult: null,
      startChoices,
      shop: [],
    });
  },

  // L'appel : le prénom sur la feuille de présence, et la case cochée.
  // Reprendre l'année sauvegardée : on rejoue la dictée en cours depuis son début.
  resumeRun() {
    let saved: SavedRun | null = null;
    try {
      const raw = localStorage.getItem(RUN_KEY);
      saved = raw ? (JSON.parse(raw) as SavedRun) : null;
    } catch { saved = null; }
    if (!saved || saved.v !== 1) return false;
    const run: RunState = {
      ...saved.run,
      rng: createRng(saved.run.rng),
      snailRng: createRng(saved.run.snailRng),
    };
    set({ run, phase: saved.phase, manche: null, lastResult: null, shop: [], event: null, feedback: null });
    if (saved.phase === 'ready') get().startManche();
    if (saved.phase === 'shop') openShop();
    return true;
  },

  setIdentity(identity, levelId) {
    const { run } = get();
    if (!run) return;
    saveIdentity(identity);
    saveLevel(levelId);
    set({ run: { ...run, identity, levelId }, phase: 'intro' });
  },

  // Une pensée jamais entendue cette année, et jamais de Kévin avant qu'il se soit présenté.
  drawThought() {
    const { run } = get();
    if (!run) return '';
    const knowsKevin = run.seenInterludes.includes('kevin1');
    const allowed = MONOLOGUE.filter((t) => knowsKevin || !t.includes('{rival}'));
    const fresh = allowed.filter((t) => !run.saidThoughts.includes(t));
    const text = run.rng.pick(fresh.length ? fresh : allowed);
    set({ run: { ...run, saidThoughts: [...run.saidThoughts, text] } });
    return say(text, run.identity);
  },

  acceptChallenge() {
    if (get().phase === 'intro') set({ phase: 'startPick' });
  },

  pickStartRelic(id) {
    const { run, startChoices } = get();
    if (!run || !startChoices.includes(id)) return;
    const hooks = resolveRelics([id]);
    set({
      run: {
        ...run,
        relicIds: [id],
        lives: run.lives + extraLives(hooks),
        euros: run.euros + (STARTING_PURSE[id] ?? 0),
      },
      startChoices: [],
    });
    get().startManche();
  },

  startManche() {
    const { run } = get();
    if (!run) return;
    const mut = run.nextMutatorId ? resolveMutator(run.nextMutatorId) : null;
    // Une punition achetée juste avant l'affrontement attend la dernière dictée : il est seul,
    // et ce qu'on a payé ne se perd pas dans un couloir.
    const curseIds = mut?.boss ? [] : run.pendingCurseIds;
    const sceneFx = run.pendingScene ? sceneChoice(run.pendingScene.sceneId, run.pendingScene.choice)?.effects ?? {} : {};
    const consequences = sceneRelic(sceneFx);
    const hooks = [...activeHooks(run.relicIds, curseIds, run.nextMutatorId), ...(consequences ? [consequences] : [])];
    const draft = freshManche(run);
    draft.curseIds = curseIds;
    const size = Math.max(4, mutatorGridSize(gridSizeFor(run.currentManche), mut) + (sceneFx.sizeDelta ?? 0));
    // pas de répit face à Kévin : son chrono est le sien, il ne s'allonge pas
    draft.graceSeconds = run.lostLifeLastManche && !mut?.boss ? GRACE_SECONDS_AFTER_LOSS : 0;
    const lvl = resolveLevel(run.levelId);
    const seconds = mut?.boss
      ? Math.round(DUEL_SECONDS * lvl.seconds)
      : Math.round(mancheSeconds(mancheSecondsFor(size) + (mut?.secondsDelta ?? 0), hooks) * lvl.seconds) + draft.graceSeconds;
    draft.timeLeft = draft.timeLeftBeforeWord = draft.totalSeconds = seconds;
    draft.gridRerollsLeft = resolveRelics(run.relicIds).reduce((n, r) => n + (r.gridRerolls ?? 0), 0);
    buildGrid(draft, run, hooks, mut, size);
    const consumables = run.consumables.map((c) => ({ id: c.id, charges: consumable(c.id).usesPerManche }));
    const nextRun = { ...run, pendingCurseIds: mut?.boss ? run.pendingCurseIds : [], consumables, seenEnemies: run.seenEnemies || draft.enemies.length > 0 };
    saveRun('ready', nextRun);
    set({ phase: 'ready', manche: draft, feedback: null, run: nextRun });
  },

  rerollGrid() {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'ready' || manche.gridRerollsLeft <= 0) return;
    const mut = manche.mutatorId ? resolveMutator(manche.mutatorId) : null;
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const draft: MancheState = { ...manche, relicState: {}, bonuses: [], cursedWord: null, cursedStart: null, cursedVisible: false, holes: [], radarCell: null, luckyLetter: null, amorce: null, gridRerollsLeft: manche.gridRerollsLeft - 1 };
    buildGrid(draft, run, hooks, mut, manche.grid.size);
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
    const rules = streakRules(hooks, { window: STREAK_WINDOW, maxLinks: STREAK_MAX_LINKS, step: STREAK_STEP });
    const links = manche.elapsed - manche.streak.lastAt <= rules.window ? manche.streak.links + 1 : 1;
    const streakMult = 1 + rules.step * Math.min(links - 1, rules.maxLinks);
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
    const rules = streakRules(hooks, { window: STREAK_WINDOW, maxLinks: STREAK_MAX_LINKS, step: STREAK_STEP });
    const links = manche.elapsed - manche.streak.lastAt <= rules.window ? manche.streak.links + 1 : 1;
    const streakMult = 1 + rules.step * Math.min(links - 1, rules.maxLinks);
    if (streakMult > 1) extra.push({ final: streakMult });
    markTraced();
    const result = resolvePath(manche.grid, path, dictionary, already, (w) => collectModifiers(w, hooks, ctx, extra), manche.elapsed, jokerMinLength(resolveRelics(run.relicIds), JOKER_MIN_LENGTH, MIN_WORD_LENGTH));
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
        let kevinDown = false;
        draft.enemies = draft.enemies.map((e) => {
          if (e.hp <= 0) return e;
          const hit = enemyTouched(path, e);
          let dmg = hit ? result.found.score : ctx.hasRelic('harpon') ? Math.round(result.found.score * HARPOON_RATIO) : 0;
          if (dmg <= 0) return e;
          for (const h of hooks) if (h.onDamage) dmg = h.onDamage(result.found.word, e, dmg, ctx);
          const hp = Math.max(0, e.hp - dmg);
          // le mot est le poing : on le fait voir sur sa case
          if (hit) draft.impact = { cell: posKey(e.cells[0][0], e.cells[0][1]), label: impactCry(dmg), id: fb.id };
          notes.push(hp > 0 ? `${ENEMY_NAMES[e.typeId]} −${dmg}` : `${ENEMY_NAMES[e.typeId]} calmé`);
          if (hp === 0) {
            if (e.typeId === 'kevin') kevinDown = true;
            let b = e.typeId === 'kevin' ? BOSS_BOUNTY : ENEMY_BOUNTY;
            for (const h of hooks) if (h.onEnemyKilled) b = h.onEnemyKilled(e, b, ctx);
            bounty += b;
            killedNow++;
          }
          return { ...e, hp };
        });
        if (killedNow > 0) {
          draft.killsThisManche += killedNow;
          notes.push(`prime +${bounty} billes`);
          if (kevinDown) notes.push('Kévin est à terre.');
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
        // Tableau effacé, cahier troué : la feuille a changé, les mots trouvables aussi
        draft.search = findAllWords(draft.grid, dictionary.trie, new Set(draft.holes));
        draft.gridDirty = false;
      }
      // Feuille épuisée : la maîtresse en distribue une neuve, sans toucher au chrono.
      const foundSet = new Set(draft.found.map((f) => f.word));
      const remaining = [...draft.search.words].filter((w) => !foundSet.has(w)).length;
      if (remaining < MIN_REMAINING_WORDS) {
        renewSheet(draft, run, hooks);
        notes.push('feuille neuve');
      }
    } else {
      if (result.kind === 'duplicate') fb.word = result.word;
      if (result.kind === 'invalid') runInvalidWord(hooks, ctx);
    }
    set({ manche: draft, feedback: fb });
    // L'affrontement n'a pas de chrono à finir : il s'arrête quand Kévin tombe.
    if (isDuel(draft) && draft.enemies.length > 0 && draft.enemies.every((e) => e.hp <= 0)) get().endManche(true);
    if (draft.timeLeft <= 0) get().endManche();
  },

  tick(dt) {
    const { manche, phase } = get();
    if (!manche || phase !== 'playing') return;
    const timeLeft = Math.max(0, manche.timeLeft - dt);
    const elapsed = manche.elapsed + dt;
    const run = get().run!;
    // les leçons qui vivent pendant la dictée (courant d'air)
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const live = cloneManche(manche);
    const ctx = makeContext(run.rng, run, live, dictionary);
    for (const h of hooks) h.onTick?.(ctx, elapsed);
    if (live.gridDirty) {
      live.search = findAllWords(live.grid, dictionary.trie, new Set(live.holes));
      live.gridDirty = false;
      set({ manche: { ...live, timeLeft, elapsed } });
    }
    const base = get().manche!;
    const critters = base.critters.map((c) => {
      if (elapsed < c.nextMoveAt) return c;
      const others = base.critters.filter((o) => o !== c).map((o) => o.pos);
      return { ...moveCritter(c, base.grid, run.snailRng, others), nextMoveAt: c.nextMoveAt + CRITTER_MOVE_SECONDS };
    });
    const enemies = base.enemies.map((e) => {
      if (e.hp <= 0 || elapsed < e.nextMoveAt) return e;
      return { ...moveEnemy(e, base.grid, base.search, run.snailRng, base.enemies.filter((o) => o !== e && o.hp > 0)), nextMoveAt: e.nextMoveAt + ENEMY_MOVE_SECONDS };
    });
    set({ manche: { ...base, timeLeft, elapsed, critters, enemies } });
    if (timeLeft === 0) get().endManche();
  },

  finishEarly() {
    const { manche, phase } = get();
    if (!manche || phase !== 'playing' || isDuel(manche) || manche.score < manche.threshold) return;
    get().endManche(true);
  },

  endManche(early = false) {
    const { run, manche, phase } = get();
    if (!run || !manche || phase !== 'playing') return;
    // L'affrontement ne se corrige pas : soit Kévin est à terre, soit la sonnerie l'a sauvé.
    if (isDuel(manche)) {
      const won = manche.enemies.length > 0 && manche.enemies.every((e) => e.hp <= 0);
      const back = won ? run.stolenRelicId : null;
      set({
        phase: 'duelEnd',
        duelWon: won,
        duelBack: run.stolenRelicId,
        manche: { ...manche, targeting: null, rerollChoice: null },
        run: {
          ...run,
          score: run.score + manche.score,
          duelDone: true,
          nextMutatorId: null,
          relicIds: back ? [...run.relicIds, back] : run.relicIds,
          stolenRelicId: back ? null : run.stolenRelicId,
        },
      });
      return;
    }
    const hooks = activeHooks(run.relicIds, manche.curseIds, manche.mutatorId);
    const ctx = makeContext(run.rng, run, cloneManche(manche), dictionary);
    const t = manche.threshold;
    const success = manche.score >= t;
    // mode histoire : elle note en rouge, elle soupire, mais le tableau reste plein
    const lost = !success && !resolveLevel(run.levelId).noFail;
    const breakdown = eurosFor(manche.score, t, success);
    const eurosTime = early && success ? timeEuros(manche.timeLeft) : 0;
    const eurosQuest = manche.quest?.done ? manche.quest.reward : 0;
    const survivors = manche.enemies.filter((e) => e.hp > 0).length;
    const eurosEnemy = -Math.min(survivors * ENEMY_SURVIVOR_PENALTY, breakdown.total + eurosTime + eurosQuest);
    const raw = breakdown.total + eurosTime + eurosQuest + eurosEnemy;
    const euros = Math.round(runMancheEnd(hooks, ctx, success, raw) * eurosMultiplier(hooks));
    const foundSet = new Set(manche.found.map((f) => f.word));
    const missed = [...manche.search.words]
      .filter((w) => !foundSet.has(w))
      .sort((a, b) => b.length - a.length || a.localeCompare(b))
      .slice(0, 5);
    const result: MancheResult = {
      manche: run.currentManche, score: manche.score, threshold: t, mood: manche.difficulty.mood, success,
      euros, eurosBase: breakdown.base, eurosBonus: breakdown.bonus, eurosTime, eurosQuest, eurosEnemy,
      questLabel: manche.quest?.label ?? null, gridSize: manche.grid.size,
      livesAfter: lost ? run.lives - 1 : run.lives,
      bestWord: manche.found.reduce<FoundWord | null>((b, f) => (!b || f.score > b.score ? f : b), null),
      words: manche.found, missed,
      grid: manche.grid, cursedWord: manche.cursedWord,
      appreciation: pickAppreciation(
        manche.score / Math.max(1, t),
        success,
        lost ? run.lives - 1 : run.lives,
        run.saidAppreciations,
        manche.score,
        run.seenInterludes.includes('kevin1'),
      ),
    };
    set({
      phase: 'recap',
      lastResult: result,
      manche: { ...manche, targeting: null, rerollChoice: null },
      run: {
        ...run,
        score: run.score + manche.score,
        euros: run.euros + euros,
        lives: lost ? run.lives - 1 : run.lives,
        lostLifeLastManche: !success,
        saidAppreciations: [...run.saidAppreciations, result.appreciation],
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
      saveLastYear(run, run.lives > 0);
      clearSavedRun();
      set({ phase: run.lives <= 0 ? 'gameover' : 'victory', run: { ...run, endBonus, score: run.score + endBonus } });
      return;
    }
    // Après une dictée impaire, la caméra te suit hors de la classe.
    // Les jours où un souvenir remonte, il prend le créneau : on ne sert pas deux planches.
    if (hasInterlude(run.currentManche) && !memoryAfter(run.currentManche, run.seenInterludes)) {
      const id = pickInterlude(run.currentManche, !run.lostLifeLastManche, run.seenInterludes, run.rng);
      if (id) {
        set({ phase: 'interlude', currentInterlude: id, run: { ...run, seenInterludes: [...run.seenInterludes, id] } });
        return;
      }
    }
    afterRecap(run);
  },

  continueAfterInterlude() {
    const { run } = get();
    if (!run) return;
    set({ currentInterlude: null });
    afterRecap(run);
  },

  eventStart() {
    const { event } = get();
    if (!event || event.started) return;
    set({ event: { ...event, started: true } });
  },

  eventTick(dt) {
    const { event, phase } = get();
    if (!event || phase !== 'event' || event.outcome !== 'playing' || event.seconds === 0 || !event.started) return;
    // la partie de billes ne démarre qu'une fois la mise posée
    if (event.kind === 'harvest' && event.id === 'billes' && event.stake === null) return;
    const timeLeft = Math.max(0, event.timeLeft - dt);
    let next: GameEvent = { ...event, timeLeft };
    if (next.kind === 'hunt' && !next.hintGiven && timeLeft <= event.seconds * SAGE_HINT_RATIO) next = { ...next, hintGiven: true };
    if (timeLeft === 0) next = finishEvent(next);
    set({ event: next });
    if (next.outcome !== 'playing') payoutEvent(next);
  },

  eventSubmit(path) {
    const { event } = get();
    if (!event || event.outcome !== 'playing' || path.length < 2) return;

    if (event.kind === 'hunt') {
      if (!isCorrect(wordFromPath(event.grid, path), event.word, dictionary)) {
        set({ event: { ...event, attempts: event.attempts + 1 } });
        return;
      }
      const won: GameEvent = event.id === 'sage'
        ? { ...event, outcome: 'won', reward: sageReward(event.word.length, event.timeLeft) }
        : event.id === 'kevin'
          ? { ...event, outcome: 'won' as const, reward: KEVIN_REWARD }
          : { ...event, outcome: 'won' as const, reward: INSPECTOR_REWARD, extraLife: true };
      set({ event: won });
      payoutEvent(won);
      return;
    }

    if (event.kind === 'harvest') {
      if (event.stake === null && event.id === 'billes') return;
      const word = wordFromPath(event.grid, path);
      if (!event.search.words.has(word) || event.found.includes(word)) return;
      if (!ruleAccepts(event.ruleId, word, dictionary)) return;
      const found = [...event.found, word];
      const next: GameEvent = { ...event, found };
      if (found.length >= event.target && event.id === 'billes') {
        const won = { ...next, outcome: 'won' as const, reward: (event.stake ?? 0) * 2 };
        set({ event: won });
        payoutEvent(won);
        return;
      }
      set({ event: next });
    }
  },

  eventStake(amount) {
    const { event, run } = get();
    if (!run || event?.kind !== 'harvest' || event.stake !== null || !event.stakeOptions.includes(amount)) return;
    set({ event: { ...event, stake: amount }, run: { ...run, euros: run.euros - amount } });
  },

  eventChoose(relicId) {
    const { event, run } = get();
    if (!run || event?.kind !== 'choice' || !event.offers.includes(relicId) || event.outcome !== 'playing') return;
    set({
      event: { ...event, outcome: 'won' },
      run: { ...run, relicIds: [...run.relicIds, relicId], lives: run.lives + extraLives(resolveRelics([relicId])) },
    });
  },

  // Le racket : quoi que tu tendes, il repart avec ce qu'il avait décidé en entrant.
  racketOffer(relicId) {
    const { event } = get();
    if (event?.kind !== 'racket' || event.outcome !== 'playing') return;
    if (event.demanded && !event.offers.includes(relicId)) return;
    resolveRacket({ ...event, offered: relicId }, false);
  },

  racketRefuse() {
    const { event } = get();
    if (event?.kind !== 'racket' || event.outcome !== 'playing') return;
    resolveRacket({ ...event, refused: true }, true);
  },

  eventGiveUp() {
    const { event } = get();
    if (!event || event.outcome !== 'playing') return;
    const done = finishEvent({ ...event, timeLeft: 0 });
    set({ event: done });
    payoutEvent(done);
  },

  startDuel() {
    if (get().phase !== 'duelIntro') return;
    get().startManche();
  },

  // Il est à terre. La maîtresse arrive toujours au mauvais moment, et elle ne voit que la fin.
  duelChoose(choice) {
    const { run, phase } = get();
    if (!run || phase !== 'duelEnd' || run.duelChoice) return;
    if (choice === 'claque') {
      set({
        run: {
          ...run, duelChoice: choice,
          // jamais le dernier bon point : on ne perd pas l'année sur une claque
          lives: run.lives > 1 ? run.lives - 1 : run.lives,
          relicIds: [...run.relicIds, 'reputation'],
        },
      });
      return;
    }
    set({ run: { ...run, duelChoice: choice, lives: run.lives + 1, euros: run.euros + KEVIN_MARBLES } });
  },

  leaveDuel() {
    if (get().phase !== 'duelEnd') return;
    set({ manche: null });
    get().nextManche();
  },

  leaveEvent() {
    if (get().phase !== 'event') return;
    set({ event: null });
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

  enterShop() {
    const { run } = get();
    if (!run || run.seenShop) return;
    set({ run: { ...run, seenShop: true } });
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
    // Avant la dernière dictée, Kévin t'attend. Ce n'est pas une dictée : il n'y a pas de note,
    // il n'y a que lui. On ne change donc pas encore de dictée.
    if (manche === TOTAL_MANCHES && !run.duelDone) {
      set({ run: { ...run, nextMutatorId: 'duel', pendingScene: null }, shop: [], phase: 'duelIntro' });
      return;
    }
    // Une dictée sur deux, il se passe quelque chose en classe et tu dois réagir.
    // Les planches qui nomment le redoublant attendent leur tour : il doit d'abord se présenter.
    const knowsRival = run.seenInterludes.includes('kevin1');
    const at = run.scenePlan.findIndex((id) => knowsRival || !sceneNamesRival(id));
    const sceneId = at >= 0 ? run.scenePlan[at] : run.scenePlan[0];
    const restScenes = run.scenePlan.filter((_, i) => i !== (at >= 0 ? at : 0));
    if (hasLessonChoice(manche) && sceneId) {
      set({
        run: { ...run, currentManche: manche, nextMutatorId: null, pendingScene: null, scenePlan: restScenes },
        shop: [],
        phase: 'scenePick',
        currentScene: sceneId,
      });
      return;
    }
    set({ run: { ...run, currentManche: manche, nextMutatorId: null, pendingScene: null }, shop: [] });
    get().startManche();
  },

  // La décision : les conséquences immédiates tombent tout de suite, le reste vivra pendant la dictée.
  pickSceneChoice(choice) {
    const { run, currentScene } = get();
    if (!run || !currentScene) return;
    const picked = sceneChoice(currentScene, choice);
    if (!picked) return;
    const e = picked.effects;
    const lessonId = e.randomLesson ? randomLessonId(run.rng, run.currentManche) : e.lessonId ?? null;
    let relicIds = run.relicIds;
    if (e.gommette) relicIds = [...relicIds, randomCharm(run.rng).id];
    set({
      run: {
        ...run,
        relicIds,
        euros: Math.max(0, run.euros + (e.euros ?? 0)),
        nextMutatorId: lessonId,
        lastConditionId: lessonId ?? run.lastConditionId,
        pendingScene: { sceneId: currentScene, choice, lessonId },
      },
      currentScene: null,
    });
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
    set({ phase: 'menu', run: null, manche: null, lastResult: null, feedback: null, startChoices: [], currentScene: null, currentInterlude: null, shop: [], event: null });
  },

  addRelic(id) {
    const { run } = get();
    if (!run || run.relicIds.includes(id)) return;
    set({ run: { ...run, relicIds: [...run.relicIds, id] } });
  },
}));

// Plus le mot est long, plus ça claque. [tuning] les paliers suivent les scores d'un mot moyen.
function impactCry(damage: number): string {
  if (damage >= 80) return 'BADABOUM !';
  if (damage >= 50) return 'BAM !';
  if (damage >= 25) return 'VLAN !';
  return 'PAF !';
}

// L'affrontement se reconnaît à son mutateur : c'est le seul qui porte un adversaire nommé.
function isDuel(manche: MancheState): boolean {
  return !!manche.mutatorId && !!resolveMutator(manche.mutatorId).boss;
}

// Génère la grille d'une manche (ou la regénère pour Sourcier) : mutateur, relics, difficulté, escargots, objectif.
function buildGrid(draft: MancheState, run: RunState, hooks: ReturnType<typeof activeHooks>, mut: ReturnType<typeof resolveMutator> | null, forcedSize?: number) {
  const size = forcedSize ?? (draft.grid.cells.length ? draft.grid.size : mutatorGridSize(gridSizeFor(run.currentManche), mut));
  const ctx = makeContext(run.rng, run, draft, dictionary);
  const weights = mut?.weights ? mut.weights(FRENCH_STANDARD_WEIGHTS) : FRENCH_STANDARD_WEIGHTS;
  const post = (g: typeof draft.grid) => runGridGenerate(mut?.applyToGrid ? mut.applyToGrid(g, run.rng) : g, hooks, ctx);
  const { grid, search, rawPotential } = generateGrid(size, weights, run.rng, dictionary, post);
  draft.grid = grid;
  draft.search = search;
  draft.difficulty = difficultyOf(rawPotential, size);
  const lvl = resolveLevel(run.levelId);
  // L'affrontement ne se note pas : on ne compare rien, on fait tomber quelqu'un.
  draft.threshold = mut?.boss ? 0 : adjustThreshold(threshold(run.currentManche) * lvl.threshold * (mut?.thresholdMult ?? 1) * thresholdMultiplier(resolveRelics(run.relicIds)), draft.difficulty.factor);
  draft.critters = mut?.snails ? spawnCritters(grid, run.snailRng) : [];
  draft.quest = mut?.quest ? pickQuest(grid, search, run.rng) : null;
  // Le cancre copie : 1 cancre ; punition Classe de cancres : +2 (même hors leçon) ; Cancres têtus : endurance ×1.5
  // L'affrontement, c'est lui et personne d'autre : une punition « classe de cancres » achetée
  // à la dernière boutique le clonait en trois exemplaires, chacun avec ses points de vie.
  const count = mut?.boss ? 1 : (mut?.enemy ? 1 : 0) + (draft.curseIds.includes('infestation') ? 2 : 0);
  const stubborn = draft.curseIds.includes('peau-dure') ? 1.5 : 1;
  // L'affrontement n'ayant pas de note, l'endurance de Kévin ne s'en déduit plus : elle est posée.
  const hp = mut?.boss
    ? Math.round(DUEL_HP * lvl.threshold * stubborn)
    : enemyHp(draft.threshold, count, stubborn);
  draft.enemies = count
    ? spawnEnemies(grid, search, run.rng, hp, count, mut?.boss ? ENEMY_MOVE_SECONDS * 0.6 : ENEMY_MOVE_SECONDS, mut?.boss ? 'kevin' : 'limace')
    : [];
  runMancheStart(hooks, ctx);
}

// Fin de chrono ou abandon : chaque événement a sa consolation (ou sa note dans le carnet).
function finishEvent(e: GameEvent): GameEvent {
  if (e.kind === 'hunt') {
    return e.id === 'sage'
      ? { ...e, outcome: 'lost', reward: SAGE_CONSOLATION }
      : e.id === 'kevin'
        ? { ...e, outcome: 'lost' as const, reward: -KEVIN_PENALTY }
        : { ...e, outcome: 'lost' as const, reward: -INSPECTOR_PENALTY };
  }
  if (e.kind === 'harvest') {
    if (e.id === 'recitation') return { ...e, outcome: 'won', reward: e.found.length * RECITATION_PER_WORD };
    return { ...e, outcome: 'lost', reward: 0 }; // la mise est déjà partie
  }
  return { ...e, outcome: 'lost' };
}

// Une feuille neuve : même taille, même thème, chrono et mots trouvés conservés.
function renewSheet(draft: MancheState, run: RunState, hooks: ReturnType<typeof activeHooks>) {
  const mut = draft.mutatorId ? resolveMutator(draft.mutatorId) : null;
  const ctx = makeContext(run.rng, run, draft, dictionary);
  const weights = mut?.weights ? mut.weights(FRENCH_STANDARD_WEIGHTS) : FRENCH_STANDARD_WEIGHTS;
  const post = (g: typeof draft.grid) => runGridGenerate(mut?.applyToGrid ? mut.applyToGrid(g, run.rng) : g, hooks, ctx);
  const { grid, search } = generateGrid(draft.grid.size, weights, run.rng, dictionary, post);
  draft.grid = grid;
  draft.search = search;
  draft.critters = draft.critters.length ? spawnCritters(grid, run.snailRng) : [];
  draft.cursedWord = null;
  draft.cursedStart = null;
  draft.cursedVisible = false;
  draft.holes = [];
  draft.amorce = null;
  draft.inspiration = null;
  runMancheStart(hooks, ctx); // le mot mystère et l'antisèche repartent sur la nouvelle feuille
}

function payoutEvent(e: GameEvent) {
  const { run } = useRunStore.getState();
  if (!run) return;
  useRunStore.setState({
    run: {
      ...run,
      euros: Math.max(0, run.euros + e.reward),
      lives: run.lives + (e.extraLife ? 1 : 0),
      sageWins: run.sageWins + (e.outcome === 'won' && e.kind !== 'choice' ? 1 : 0),
    },
  });
}

// Le seul événement où le joueur n'a pas de levier : on lui laisse la forme du choix, pas le résultat.
// Tenir tête coûte un bon point (jamais le dernier) et allume La rancune.
function resolveRacket(ev: RacketEvent, refused: boolean) {
  const { run } = useRunStore.getState();
  if (!run) return;
  let relicIds = run.relicIds;
  if (ev.demanded) {
    const at = relicIds.indexOf(ev.demanded);
    if (at >= 0) relicIds = [...relicIds.slice(0, at), ...relicIds.slice(at + 1)];
  }
  let lives = run.lives;
  let toll = ev.demanded ? 0 : ev.toll;
  if (refused) {
    if (lives > 1) lives -= 1;
    else toll += Math.round(run.euros * RACKET_TOLL); // au dernier bon point, il se paie autrement
    relicIds = [...relicIds, 'rancune'];
  }
  useRunStore.setState({
    event: { ...ev, refused, outcome: 'lost', toll },
    run: {
      ...run, relicIds, lives,
      euros: Math.max(0, run.euros - toll),
      stolenRelicId: ev.demanded ?? run.stolenRelicId,
    },
  });
}

function buildEvent(id: EventId, run: RunState): GameEvent {
  if (id === 'sage') return createHunt('sage', sageWords(), run.rng);
  if (id === 'inspecteur') return createHunt('inspecteur', inspectorWords(), run.rng);
  if (id === 'kevin') return createHunt('kevin', inspectorWords(), run.rng);
  if (id === 'reserve') return createChoice(drawFreeRelics(shopInput(run), run.rng, 3));
  if (id === 'racket') {
    // il ne prend pas au hasard : il prend ce que tu as de mieux, et jamais ta personnalité
    const loot = [...new Set(run.relicIds)].filter((r) => !resolveRelics([r])[0].archetype);
    const best = loot.reduce<{ id: string; price: number } | null>((top, r) => {
      const price = resolveRelics([r])[0].price ?? 0;
      return !top || price > top.price ? { id: r, price } : top;
    }, null);
    return createRacket(loot, best?.id ?? null, best ? 0 : Math.round(run.euros * RACKET_TOLL));
  }
  return createHarvest(id, dictionary, run.rng, run.euros);
}

// Après le recap et la planche de transition : un couloir une fois sur deux, puis la coopérative.
function afterRecap(run: RunState) {
  // Le passé remonte avant le couloir : on sort de la salle, et ça remonte tout seul.
  const memory = memoryAfter(run.currentManche, run.seenInterludes);
  if (memory) {
    useRunStore.setState({
      phase: 'interlude',
      currentInterlude: memory,
      run: { ...run, seenInterludes: [...run.seenInterludes, memory] },
    });
    return;
  }
  if (isEventManche(run.currentManche) && run.eventPlan.length) {
    const [id, ...rest] = run.eventPlan;
    useRunStore.setState({ phase: 'event', event: buildEvent(id, run), run: { ...run, eventPlan: rest } });
    return;
  }
  openShop();
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

// Le bulletin de l'an dernier, punaisé sur la page d'accueil.
export interface LastYear { name: string; moyenne: number; mention: string; seed: string; victory: boolean }
const LAST_KEY = 'rb-last-year';

function saveLastYear(run: RunState, victory: boolean) {
  const notes = run.history.map((h) => noteSur20(h.score, h.threshold));
  const moyenne = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
  const value: LastYear = {
    name: run.identity.name, moyenne: +moyenne.toFixed(1),
    mention: mention(moyenne, victory).label, seed: run.seed, victory,
  };
  try { localStorage.setItem(LAST_KEY, JSON.stringify(value)); } catch { /* stockage indisponible */ }
}

// La partie en cours est sauvegardée aux respirations : début de dictée, couloir, coopérative.
// On ne sauvegarde pas pendant le chrono : reprendre relance la dictée au début.
const RUN_KEY = 'rb-run';
const SAVED_PHASES: Phase[] = ['ready', 'scenePick', 'recap', 'interlude', 'event', 'shop', 'startPick'];

interface SavedRun { v: 1; phase: Phase; run: Omit<RunState, 'rng' | 'snailRng'> & { rng: number; snailRng: number } }

function saveRun(phase: Phase, run: RunState) {
  if (!SAVED_PHASES.includes(phase)) return;
  const at = phase === 'playing' ? 'ready' : phase;
  const payload: SavedRun = { v: 1, phase: at, run: { ...run, rng: run.rng.state(), snailRng: run.snailRng.state() } };
  try { localStorage.setItem(RUN_KEY, JSON.stringify(payload)); } catch { /* stockage indisponible */ }
}

export function loadSavedRun(): { phase: Phase; manche: number } | null {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedRun;
    if (saved.v !== 1 || !saved.run) return null;
    return { phase: saved.phase, manche: saved.run.currentManche };
  } catch { return null; }
}

export function clearSavedRun() {
  try { localStorage.removeItem(RUN_KEY); } catch { /* stockage indisponible */ }
}

const TRACED_KEY = 'rb-traced';

export function hasEverTraced(): boolean {
  try { return localStorage.getItem(TRACED_KEY) === '1'; } catch { return true; }
}

function markTraced() {
  try { localStorage.setItem(TRACED_KEY, '1'); } catch { /* stockage indisponible */ }
}

export function loadLastYear(): LastYear | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as LastYear) : null;
  } catch { return null; }
}

// Le prénom et le genre sont réutilisés d'une année sur l'autre.
const IDENTITY_KEY = 'rb-identity';
const LEVEL_KEY = 'rb-level';

function loadIdentity(): Identity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return DEFAULT_IDENTITY;
    const parsed = JSON.parse(raw) as Partial<Identity>;
    if (!parsed.name || (parsed.gender !== 'm' && parsed.gender !== 'f')) return DEFAULT_IDENTITY;
    return { name: parsed.name, gender: parsed.gender, profile: { ...DEFAULT_PROFILE, ...parsed.profile } };
  } catch { return DEFAULT_IDENTITY; }
}

function loadLevel(): string {
  try { return localStorage.getItem(LEVEL_KEY) ?? DEFAULT_LEVEL; } catch { return DEFAULT_LEVEL; }
}

function saveLevel(id: string) {
  try { localStorage.setItem(LEVEL_KEY, id); } catch { /* stockage indisponible */ }
}

function saveIdentity(identity: Identity) {
  try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity)); } catch { /* stockage indisponible */ }
}
