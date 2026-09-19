import { readFileSync } from 'node:fs';
import { buildDictionary } from '../src/engine/dictionary';
import { adjustThreshold, difficultyOf } from '../src/engine/difficulty';
import { FRENCH_STANDARD_WEIGHTS, generateGrid } from '../src/engine/gridGenerator';
import { createRng } from '../src/engine/rng';
import { MANCHE_SECONDS, THRESHOLD_BASE, TOTAL_MANCHES, eurosFor, gridSizeFor } from '../src/engine/rules';

// Variantes testables sans toucher au jeu : GROWTH=1.3 EXTRA=0 (secondes en plus par taille au-dessus de 4)
const GROWTH = Number(process.env.GROWTH ?? 1.3);
const EXTRA = Number(process.env.EXTRA ?? 0);
const threshold = (n: number) => Math.round((THRESHOLD_BASE * Math.pow(GROWTH, n - 1)) / 10) * 10;
import { applyModifiers, baseScoreFromLetters, countVowels, type ScoreModifier } from '../src/engine/scoring';
import type { DictEntry } from '../src/engine/types';

// Simulation de runs complètes avec des profils de joueurs. Aucune UI : moteur seul.
// Modèle joueur : un rythme de mots/minute, une préférence pour les mots courts et courants,
// un temps de tracé proportionnel à la longueur. L'escargot est touché avec une probabilité
// ≈ (cases du chemin) / (cases de la grille).

const dict = buildDictionary(JSON.parse(readFileSync('src/data/dictionnaire_fr.json', 'utf8')) as DictEntry[]);

interface Profile { name: string; wpm: number; longBias: number; rareKnowledge: number }
const PROFILES: Profile[] = [
  { name: 'débutant', wpm: 6, longBias: 0.9, rareKnowledge: 0.05 },
  { name: 'moyen', wpm: 9, longBias: 0.7, rareKnowledge: 0.1 },
  { name: 'bon', wpm: 13, longBias: 0.5, rareKnowledge: 0.2 },
  { name: 'expert', wpm: 18, longBias: 0.35, rareKnowledge: 0.35 },
];

type RelicSet = { name: string; mods: (word: string, found: string[]) => ScoreModifier[] };
const RELIC_SETS: RelicSet[] = [
  { name: 'aucun relic', mods: () => [] },
  { name: 'Voyelliste', mods: (w) => [{ flat: countVowels(w) }] },
  { name: 'Lexicographe', mods: (w) => (w.length >= 6 ? [{ percent: 0.5 }] : []) },
  { name: 'Nominaliste+Conjugueur', mods: (w) => { const c = dict.categoriesOf(w); const m: ScoreModifier[] = []; if (c.has('NOM')) m.push({ percent: 0.3 }); if (c.has('VER')) m.push({ percent: 0.4 }); return m; } },
];

function simulateManche(n: number, profile: Profile, relics: RelicSet, seed: string) {
  const rng = createRng(seed);
  const size = gridSizeFor(n);
  const { search, rawPotential } = generateGrid(size, FRENCH_STANDARD_WEIGHTS, rng, dict);
  const diff = difficultyOf(rawPotential, size);
  const t = adjustThreshold(threshold(n), diff.factor);
  const sizeBoost = 1 + 0.08 * (size - 4);
  const budget = MANCHE_SECONDS + EXTRA * (size - 4);
  let time = 0;
  let score = 0;
  const found: string[] = [];
  const pool = [...search.words].map((w) => ({
    w,
    weight: (dict.common.has(w) ? 1 : profile.rareKnowledge) * Math.exp(-profile.longBias * (w.length - 3)),
  }));
  const secPerWord = 60 / (profile.wpm * sizeBoost);
  while (pool.length && time < budget) {
    const pick = rng.weighted(pool, (p) => p.weight);
    pool.splice(pool.indexOf(pick), 1);
    time += secPerWord * (0.7 + 0.1 * pick.w.length);
    if (time > budget) break;
    const mods = relics.mods(pick.w, found);
    if (rng.next() < pick.w.length / (size * size)) mods.push({ final: 2 });
    score += applyModifiers(baseScoreFromLetters(pick.w), mods);
    found.push(pick.w);
  }
  const success = score >= t;
  return { size, t, score, success, words: found.length, euros: eurosFor(score, t, success).total, mood: diff.mood };
}

function simulateRun(profile: Profile, relics: RelicSet, seed: string) {
  let lives = 3;
  let euros = 0;
  let total = 0;
  const manches: ReturnType<typeof simulateManche>[] = [];
  for (let n = 1; n <= TOTAL_MANCHES && lives > 0; n++) {
    const m = simulateManche(n, profile, relics, `${seed}-${n}`);
    manches.push(m);
    euros += m.euros;
    total += m.score;
    if (!m.success) lives--;
  }
  return { manches, lives, euros, total, victory: lives > 0 };
}

const RUNS = Number(process.argv[2] ?? 150);
const pct = (x: number) => `${Math.round(x * 100)}%`.padStart(4);

console.log(`\n=== Taux de réussite par manche (sans relic), ${RUNS} runs par profil ===`);
console.log('manche   '.padEnd(10) + Array.from({ length: TOTAL_MANCHES }, (_, i) => String(i + 1).padStart(5)).join('') + '   victoire  euros/run  score/run');
for (const p of PROFILES) {
  const pass = Array(TOTAL_MANCHES).fill(0);
  const played = Array(TOTAL_MANCHES).fill(0);
  let victories = 0, euros = 0, total = 0;
  for (let i = 0; i < RUNS; i++) {
    const r = simulateRun(p, RELIC_SETS[0], `${p.name}${i}`);
    r.manches.forEach((m, idx) => { played[idx]++; if (m.success) pass[idx]++; });
    if (r.victory) victories++;
    euros += r.euros; total += r.total;
  }
  console.log(p.name.padEnd(10) + pass.map((x, i) => (played[i] ? pct(x / played[i]) : '   -').padStart(5)).join('') + `   ${pct(victories / RUNS)}     ${Math.round(euros / RUNS).toString().padStart(5)}      ${Math.round(total / RUNS)}`);
}

console.log(`\n=== Score moyen / seuil par manche, profil moyen, sans relic ===`);
{
  const p = PROFILES[1];
  const acc = Array.from({ length: TOTAL_MANCHES }, () => ({ score: 0, t: 0, words: 0, n: 0 }));
  for (let i = 0; i < RUNS; i++) for (let n = 1; n <= TOTAL_MANCHES; n++) {
    const m = simulateManche(n, p, RELIC_SETS[0], `m${i}-${n}`);
    const a = acc[n - 1]; a.score += m.score; a.t += m.t; a.words += m.words; a.n++;
  }
  acc.forEach((a, i) => console.log(`manche ${String(i + 1).padStart(2)} (${gridSizeFor(i + 1)}x${gridSizeFor(i + 1)}) : ${Math.round(a.words / a.n)} mots, score ${Math.round(a.score / a.n)} / seuil ${Math.round(a.t / a.n)}  → ratio ${(a.score / a.t).toFixed(2)}`));
}

console.log(`\n=== Impact d'un relic seul sur le score (profil moyen, manche 3 et manche 8) ===`);
for (const rs of RELIC_SETS) {
  const res = [3, 8].map((n) => {
    let s = 0;
    for (let i = 0; i < RUNS; i++) s += simulateManche(n, PROFILES[1], rs, `r${i}-${n}`).score;
    return Math.round(s / RUNS);
  });
  console.log(`${rs.name.padEnd(24)} manche 3: ${res[0]}   manche 8: ${res[1]}`);
}

