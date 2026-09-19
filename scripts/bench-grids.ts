import { readFileSync } from 'node:fs';
import { buildDictionary } from '../src/engine/dictionary';
import { FRENCH_STANDARD_WEIGHTS, generateGrid } from '../src/engine/gridGenerator';
import { createRng } from '../src/engine/rng';
import type { DictEntry } from '../src/engine/types';

const entries = JSON.parse(readFileSync('src/data/dictionnaire_fr.json', 'utf8')) as DictEntry[];
let t = performance.now();
const dict = buildDictionary(entries);
console.log(`trie: ${dict.trie.size} mots, ${(performance.now() - t).toFixed(0)} ms`);

const rng = createRng('bench');
for (const size of [4, 5, 6]) {
  const counts: number[] = [];
  const attempts: number[] = [];
  t = performance.now();
  for (let i = 0; i < 20; i++) {
    const g = generateGrid(size, FRENCH_STANDARD_WEIGHTS, rng, dict);
    counts.push(g.search.words.size);
    attempts.push(g.attempts);
  }
  const ms = (performance.now() - t) / 20;
  counts.sort((a, b) => a - b);
  console.log(`${size}x${size}: mots min/med/max = ${counts[0]}/${counts[10]}/${counts[19]}, essais moy = ${(attempts.reduce((a, b) => a + b) / 20).toFixed(1)}, ${ms.toFixed(1)} ms/grille`);
}
const g = generateGrid(4, FRENCH_STANDARD_WEIGHTS, rng, dict);
console.log(g.grid.cells.map((r) => r.map((c) => c.letter.padEnd(2)).join(' ')).join('\n'));
const longest = [...g.search.words].sort((a, b) => b.length - a.length).slice(0, 8);
console.log('plus longs:', longest.join(', '));
console.log('courants:', [...g.search.words].filter((w) => dict.common.has(w)).length, '/', g.search.words.size);
