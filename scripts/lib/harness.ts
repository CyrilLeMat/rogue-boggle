// Banc d'essai : on rejoue de vraies dictées sans interface, avec le moteur du jeu.
// Modèle de joueur : un rythme de mots par minute, un goût pour les mots courts,
// et une connaissance limitée des mots rares.
import { readFileSync } from 'node:fs';
import { buildDictionary } from '../../src/engine/dictionary';
import { adjustThreshold, difficultyOf } from '../../src/engine/difficulty';
import { FRENCH_STANDARD_WEIGHTS, generateGrid } from '../../src/engine/gridGenerator';
import type { Relic, MancheView, RunView } from '../../src/engine/hooks';
import { collectModifiers, makeContext, mancheSeconds, runGridGenerate, runMancheStart, runWordAccepted, thresholdMultiplier } from '../../src/engine/hookRunner';
import { createRng, type Rng } from '../../src/engine/rng';
import { MANCHE_SECONDS, STREAK_MAX_LINKS, STREAK_STEP, STREAK_WINDOW, eurosFor, gridSizeFor, mancheSecondsFor, threshold } from '../../src/engine/rules';
import { applyModifiers, baseScore } from '../../src/engine/scoring';
import { findPathForWord } from '../../src/engine/wordFinder';
import type { DictEntry } from '../../src/engine/types';
import { level as resolveLevel } from '../../src/data/levels';

export const dict = buildDictionary(JSON.parse(readFileSync('src/data/dictionnaire_fr.json', 'utf8')) as DictEntry[]);

export interface Profile { name: string; wpm: number; longBias: number; rareKnowledge: number }
export const PROFILES: Profile[] = [
  { name: 'débutant', wpm: 6, longBias: 0.9, rareKnowledge: 0.05 },
  { name: 'moyen', wpm: 9, longBias: 0.7, rareKnowledge: 0.1 },
  { name: 'bon', wpm: 13, longBias: 0.5, rareKnowledge: 0.2 },
  { name: 'expert', wpm: 18, longBias: 0.35, rareKnowledge: 0.35 },
];

function emptyManche(grid: ReturnType<typeof generateGrid>['grid'], search: ReturnType<typeof generateGrid>['search'], seuil: number, secondes: number, factor: number, mood: MancheView['difficulty']['mood']): MancheView {
  return {
    grid, search, threshold: seuil, difficulty: { factor, mood, potential: 0 },
    found: [], timeLeft: secondes, timeLeftBeforeWord: secondes, elapsed: 0,
    cursedWord: null, cursedStart: null, cursedVisible: false, holes: [],
    streak: { links: 0, lastAt: -99 }, luckyLetter: null, amorce: null, inspiration: null,
    enemies: [], killsThisManche: 0, gridDirty: false, mutatorId: null, quest: null,
    radarCell: null, relicState: {}, bonuses: [],
  };
}

// L'ordre dans lequel un joueur trouve les mots : les courts et courants d'abord.
function playerOrder(words: string[], profile: Profile, rng: Rng): string[] {
  return words
    .filter((w) => dict.common.has(w) || rng.next() < profile.rareKnowledge)
    .map((w) => ({ w, k: w.length * profile.longBias + rng.next() * 2 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.w);
}

export interface MancheResult { score: number; threshold: number; success: boolean; euros: number; words: number }

// Rejoue une dictée entière avec un jeu de fournitures donné.
export function playManche(manche: number, profile: Profile, relics: Relic[], seed: string, levelId = 'adulte'): MancheResult {
  const rng = createRng(seed);
  const lvl = resolveLevel(levelId);
  const size = gridSizeFor(manche);
  const run: RunView = { score: 0, euros: 0, lives: 3, currentManche: manche, relicIds: relics.map((r) => r.id), killCount: 0 };
  const base = generateGrid(size, FRENCH_STANDARD_WEIGHTS, rng, dict);
  const seuil = adjustThreshold(
    threshold(manche) * lvl.threshold * thresholdMultiplier(relics),
    difficultyOf(base.rawPotential, size).factor,
  );
  const secondes = Math.round(mancheSeconds(mancheSecondsFor(size), relics) * lvl.seconds);
  const draft = emptyManche(base.grid, base.search, seuil, secondes, difficultyOf(base.rawPotential, size).factor, difficultyOf(base.rawPotential, size).mood);
  const ctx = makeContext(rng, run, draft, dict);
  // les fournitures qui redessinent la feuille agissent avant le premier mot
  draft.grid = runGridGenerate(draft.grid, relics, ctx);
  runMancheStart(relics, ctx);

  const order = playerOrder([...draft.search.words], profile, rng);
  const rules = { window: STREAK_WINDOW, maxLinks: STREAK_MAX_LINKS, step: STREAK_STEP };
  let score = 0;
  let t = 0;
  let words = 0;
  for (const word of order) {
    const path = findPathForWord(draft.grid, word);
    if (!path) continue;
    const cost = (60 / profile.wpm) * (0.6 + word.length / 10);
    t += cost;
    if (t > draft.timeLeft) break;
    draft.elapsed = t;
    draft.timeLeftBeforeWord = draft.timeLeft - t;
    // élan : des mots rapprochés valent plus cher
    const link = t - draft.streak.lastAt <= rules.window ? Math.min(rules.maxLinks, draft.streak.links + 1) : 0;
    draft.streak = { links: link, lastAt: t };
    const mods = collectModifiers(word, relics, ctx, link > 0 ? [{ percent: link * rules.step }] : []);
    const gained = applyModifiers(baseScore(word, draft.grid, path), mods);
    const found = { word, score: gained, at: t, path };
    draft.found.push(found);
    runWordAccepted(found, relics, ctx);
    score += gained + draft.bonuses.reduce((s, b) => s + b.points, 0);
    draft.bonuses.length = 0;
    words++;
  }
  const success = score >= seuil;
  return { score, threshold: seuil, success, euros: eurosFor(score, seuil, success).total, words };
}

export { MANCHE_SECONDS };
