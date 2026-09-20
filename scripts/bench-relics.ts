// Ce que vaut chaque fourniture, en points par dictée, et le prix que ça suggère.
// Usage : npx vite-node scripts/bench-relics.ts [échantillons] [profil]
import { writeFileSync } from 'node:fs';
import { RELICS } from '../src/data/relics';
import { charmFromId } from '../src/data/charms';
import { RARITY_PRICE } from '../src/engine/hooks';
import type { Relic } from '../src/engine/hooks';
import { PROFILES, playManche } from './lib/harness';

const SAMPLES = Number(process.argv[2] ?? 60);
const profile = PROFILES.find((p) => p.name === process.argv[3]) ?? PROFILES[2];
const MANCHES = [2, 4, 6, 8, 10];
// [tuning] combien de billes vaut un point de score par dictée
const PRICE_PER_POINT = 2.2;

// quelques gommettes représentatives, reconstruites depuis leur identifiant
const CHARM_IDS = ['charme-lettre-E', 'charme-longueur-5', 'charme-categorie-NOM', 'charme-finale-S', 'charme-plat-1', 'charme-chrono-3'];
const charms = CHARM_IDS.map(charmFromId).filter((c): c is Relic => !!c);
const pool: Relic[] = [...RELICS.filter((r) => !r.archetype), ...charms];

function moyenne(relics: Relic[]): { score: number; réussites: number } {
  let total = 0;
  let ok = 0;
  for (let i = 0; i < SAMPLES; i++) {
    for (const m of MANCHES) {
      const r = playManche(m, profile, relics, `bench-${i}-${m}`);
      total += r.score;
      if (r.success) ok++;
    }
  }
  const n = SAMPLES * MANCHES.length;
  return { score: total / n, réussites: ok / n };
}

const base = moyenne([]);
const rows = pool.map((relic) => {
  const avec = moyenne([relic]);
  const delta = avec.score - base.score;
  return {
    fourniture: relic.name.replace(/\[([^|]*)\|[^\]]*\]/g, '$1'),
    rareté: relic.rarity,
    'points / dictée': +delta.toFixed(1),
    'gain %': +((delta / base.score) * 100).toFixed(1),
    'prix actuel': relic.price ?? RARITY_PRICE[relic.rarity],
    'prix suggéré': Math.max(10, Math.round((delta * PRICE_PER_POINT) / 5) * 5),
  };
}).sort((a, b) => b['points / dictée'] - a['points / dictée']);

console.log(`profil ${profile.name} · ${SAMPLES} échantillons × ${MANCHES.length} dictées · score de référence ${base.score.toFixed(1)}`);
console.table(rows);
writeFileSync('scripts/relic-values.json', JSON.stringify(Object.fromEntries(pool.map((r, i) => [r.id, rows.find((x) => x.fourniture === r.name.replace(/\[([^|]*)\|[^\]]*\]/g, '$1'))?.['points / dictée'] ?? 0])), null, 2));
console.log('valeurs écrites dans scripts/relic-values.json');
