// Le programme d'une année, écran par écran : ce que le joueur enchaîne entre deux dictées.
// Sert à juger le rythme — combien d'écrans de lecture d'affilée, et où ils s'accumulent.
// Usage : npx vite-node scripts/year-rhythm.ts [graine]
import { hasInterlude, memoryAfter, pickInterlude, INTERLUDE_BY_ID } from '../src/data/interludes';
import { hasLessonChoice } from '../src/data/mutators';
import { isEventManche, planEvents } from '../src/engine/events';
import { createRng } from '../src/engine/rng';
import { TOTAL_MANCHES } from '../src/engine/rules';

const rng = createRng(process.argv[2] ?? 'rythme');
const plan = planEvents(rng);
const seen: string[] = [];
let events = [...plan];
const rows: { dictee: string; avant: string; apres: string; ecrans: number }[] = [];

for (let m = 1; m <= TOTAL_MANCHES; m++) {
  const avant: string[] = [];
  if (hasLessonChoice(m)) avant.push('planche de classe');
  avant.push('écran prêt + pensée');

  const apres: string[] = [];
  // après la dernière dictée, l'année s'arrête net : ni planche, ni couloir, ni boutique
  if (m === TOTAL_MANCHES) { rows.push({ dictee: `dictée ${m}`, avant: avant.join(' + '), apres: 'bulletin', ecrans: 1 }); continue; }
  const memory = memoryAfter(m, seen);
  if (memory) { seen.push(memory); apres.push(`souvenir « ${INTERLUDE_BY_ID.get(memory)!.era} »`); }
  else if (hasInterlude(m)) {
    const id = pickInterlude(m, true, seen, rng);
    if (id) { seen.push(id); apres.push(`transition « ${id} »`); }
  }
  if (isEventManche(m) && events.length) { apres.push(`couloir « ${events[0]} »`); events = events.slice(1); }
  apres.push('coopérative');
  if (m === TOTAL_MANCHES - 1) apres.push('AFFRONTEMENT');

  rows.push({ dictee: `dictée ${m}`, avant: avant.join(' + '), apres: apres.join(' → ') || '—', ecrans: apres.length });
}

console.table(rows);
const heavy = rows.filter((r) => r.ecrans >= 3).map((r) => r.dictee);
console.log(`écrans de lecture après une dictée : ${rows.map((r) => r.ecrans).join(' ')}`);
console.log(heavy.length ? `enchaînements de 3 écrans ou plus : ${heavy.join(', ')}` : 'jamais plus de deux écrans d\'affilée');
