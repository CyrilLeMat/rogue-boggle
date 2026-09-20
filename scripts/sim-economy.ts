// Une année entière, du premier mot au bulletin : qui gagne, à quelle dictée on meurt,
// combien on achète et combien il reste en poche.
// Usage : npx vite-node scripts/sim-economy.ts [années]
import { existsSync, readFileSync } from 'node:fs';
import { RELICS } from '../src/data/relics';
import { STARTING_PURSE } from '../src/data/archetypes';
import { LEVELS } from '../src/data/levels';
import { RARITY_PRICE, type Relic } from '../src/engine/hooks';
import { createRng } from '../src/engine/rng';
import { STARTING_LIVES, TOTAL_MANCHES } from '../src/engine/rules';
import { PROFILES, playManche } from './lib/harness';

const YEARS = Number(process.argv[2] ?? 200);
const VALUES: Record<string, number> = existsSync('scripts/relic-values.json')
  ? JSON.parse(readFileSync('scripts/relic-values.json', 'utf8'))
  : {};

const BUYABLE = RELICS.filter((r) => !r.archetype);
const priceOf = (r: Relic) => r.price ?? RARITY_PRICE[r.rarity];

interface Year { gagnée: boolean; dictée: number; achats: number; reste: number; dépensé: number }

function playYear(levelId: string, profileIndex: number, seed: string): Year {
  const rng = createRng(seed);
  const profile = PROFILES[profileIndex];
  const relics: Relic[] = [];
  let euros = STARTING_PURSE.nouveau ?? 0;
  let lives = STARTING_LIVES;
  let achats = 0;
  let dépensé = 0;
  let manche = 1;
  for (; manche <= TOTAL_MANCHES; manche++) {
    const r = playManche(manche, profile, relics, `${seed}-m${manche}`, levelId);
    euros += r.euros;
    if (!r.success) lives--;
    if (lives <= 0) break;
    // la coopérative : trois articles tirés au sort, on prend le meilleur qu'on peut payer
    const offers = rng.shuffle(BUYABLE.filter((x) => !relics.some((o) => o.id === x.id))).slice(0, 3);
    for (const offer of offers.sort((a, b) => (VALUES[b.id] ?? 0) - (VALUES[a.id] ?? 0))) {
      const p = priceOf(offer);
      if (p > euros) continue;
      euros -= p;
      dépensé += p;
      relics.push(offer);
      achats++;
    }
  }
  return { gagnée: lives > 0 && manche > TOTAL_MANCHES, dictée: Math.min(manche, TOTAL_MANCHES), achats, reste: euros, dépensé };
}

const rows: Record<string, unknown>[] = [];
for (const level of LEVELS) {
  for (let p = 0; p < PROFILES.length; p++) {
    const years = Array.from({ length: YEARS }, (_, i) => playYear(level.id, p, `eco-${level.id}-${p}-${i}`));
    const moy = (f: (y: Year) => number) => years.reduce((s, y) => s + f(y), 0) / years.length;
    rows.push({
      niveau: level.id,
      profil: PROFILES[p].name,
      'victoires %': Math.round((years.filter((y) => y.gagnée).length / years.length) * 100),
      'dictée atteinte': +moy((y) => y.dictée).toFixed(1),
      achats: +moy((y) => y.achats).toFixed(1),
      'billes dépensées': Math.round(moy((y) => y.dépensé)),
      'billes non dépensées': Math.round(moy((y) => y.reste)),
    });
  }
}
console.log(`${YEARS} années par case · ${TOTAL_MANCHES} dictées · achat automatique du meilleur article abordable`);
console.table(rows);
