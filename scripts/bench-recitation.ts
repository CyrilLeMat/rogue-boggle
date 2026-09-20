// Le concours de récitation est-il gagnable ? On regarde, pour chaque consigne tirée,
// combien de mots *courts et courants* la respectent — les seuls qu'un CE2 trouve en 45 s.
// Usage : npx vite-node scripts/bench-recitation.ts [tirages]
import { EVENT_GRID_SIZE, RECITATION_TARGET, pickRule, ruleAccepts, ruleLabel } from '../src/engine/events';
import { FRENCH_STANDARD_WEIGHTS, generateGrid } from '../src/engine/gridGenerator';
import { createRng } from '../src/engine/rng';
import { dict } from './lib/harness';

const DRAWS = Number(process.argv[2] ?? 400);
const EASY = 4; // un mot de 3 ou 4 lettres, connu : le fond de commerce du joueur

const perRule = new Map<string, { n: number; easy: number[]; common: number[]; dead: number }>();
let noRule = 0;

for (let i = 0; i < DRAWS; i++) {
  const rng = createRng('recit' + i);
  const { search } = generateGrid(EVENT_GRID_SIZE, FRENCH_STANDARD_WEIGHTS, rng, dict);
  const ruleId = pickRule(search, dict, rng);
  if (!ruleId) { noRule++; continue; }
  const words = [...search.words].filter((w) => ruleAccepts(ruleId, w, dict));
  // « facile » dépend de la consigne : « que des mots de 6 lettres » n'aura jamais de mot court
  const [kind, param] = ruleId.split(':');
  const maxLen = kind === 'long' ? Number(param) + 2 : EASY;
  const easy = words.filter((w) => w.length <= maxLen && dict.common.has(w)).length;
  const common = words.filter((w) => dict.common.has(w)).length;
  const key = kind === 'long' ? ruleId : kind;
  const row = perRule.get(key) ?? { n: 0, easy: [], common: [], dead: 0 };
  row.n++;
  row.easy.push(easy);
  row.common.push(common);
  if (easy < RECITATION_TARGET) row.dead++;
  perRule.set(key, row);
  if (i < 6) console.log(`  ex. ${ruleLabel(ruleId)} → ${words.length} mots, ${common} courants, ${easy} courts et courants`);
}

const avg = (a: number[]) => (a.reduce((s, n) => s + n, 0) / a.length).toFixed(1);
const table = [...perRule.entries()].map(([id, r]) => ({
  consigne: id,
  tirages: r.n,
  'mots courants': avg(r.common),
  'courts et courants': avg(r.easy),
  [`moins de ${RECITATION_TARGET} faciles`]: `${Math.round((r.dead / r.n) * 100)} %`,
}));
console.table(table);
const dead = [...perRule.values()].reduce((s, r) => s + r.dead, 0);
console.log(`consignes sans règle possible : ${noRule} / ${DRAWS}`);
console.log(`concours perdus d'avance (moins de ${RECITATION_TARGET} mots faciles) : ${Math.round((dead / (DRAWS - noRule)) * 100)} %`);
