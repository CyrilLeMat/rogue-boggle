import { readFileSync } from 'node:fs';
import { buildDictionary } from '../src/engine/dictionary';
import { FRENCH_STANDARD_WEIGHTS, defaultQualityGate, generateGrid } from '../src/engine/gridGenerator';
import { createRng } from '../src/engine/rng';
import { baseScoreFromLetters } from '../src/engine/scoring';
import type { DictEntry } from '../src/engine/types';

// Mesure le potentiel (score des 25 meilleurs mots courants) par taille de grille.
// Sert à caler REFERENCE_POTENTIAL dans src/engine/difficulty.ts.
const dict = buildDictionary(JSON.parse(readFileSync('src/data/dictionnaire_fr.json', 'utf8')) as DictEntry[]);
const rng = createRng('difficulty');
const N = Number(process.argv[2] ?? 500);

for (const size of (process.argv[3] ? process.argv[3].split(",").map(Number) : [4, 5, 6])) {
  const xs: number[] = [];
  const gate = { ...defaultQualityGate(size), minPotential: 0 };
  for (let i = 0; i < N; i++) {
    const { search } = generateGrid(size, FRENCH_STANDARD_WEIGHTS, rng, dict, (g) => g, gate);
    const cw = [...search.words].filter((w) => dict.common.has(w)).map(baseScoreFromLetters).sort((a, b) => b - a);
    xs.push(cw.slice(0, 25).reduce((a, b) => a + b, 0));
  }
  xs.sort((a, b) => a - b);
  const q = (p: number) => xs[Math.floor(p * (xs.length - 1))];
  console.log(`${size}x${size}: p10=${q(0.1)} p25=${q(0.25)} p50=${q(0.5)} p75=${q(0.75)} p90=${q(0.9)}`);
}
