// Combien de fois, en moyenne, chaque mot de la fiche ressort-il dans une partie ?
// Simule le programme d'une année : prologue, dictées, planches, couloirs, boutique, bulletin.
import { createRng } from '../src/engine/rng';
import { INTERLUDES, hasInterlude, pickInterlude } from '../src/data/interludes';
import { SCENES, planScenes } from '../src/data/scenes';
import { planEvents } from '../src/engine/events';
import {
  APPRECIATIONS, DUPLICATES, EV, L, MONOLOGUE, PRAISES_BIG, PRAISES_HUGE, PRAISES_SMALL,
  SCOLDS, SHOP_INTRO, SUSPICIONS, TOO_SHORT, mention,
} from '../src/theme/lexicon';

const TOKENS = ['nom', 'salut', 'phrase', 'cour', 'heros', 'plat', 'horreur', 'metier', 'chanson', 'admire', 'surnom', 'rigolo', 'adjectif', 'nombre', 'action', 'cri'];

// Le prologue, tel qu'il est écrit dans le composant.
const PROLOGUE = [
  'Le soleil chauffait les billes, le goudron sentait l\'été, on aurait pu faire {cour} pendant mille ans.',
];

const RUNS = 4000;
const DICTEES = 10;
// Estimations de partie : mots trouvés, tracés refusés, compliments déclenchés. [tuning]
const INVALID_PER_DICTEE = 3;
const PRAISES_PER_DICTEE = 2;
const SUSPICION_PER_DICTEE = 0.6;
const DUPLICATE_PER_DICTEE = 0.8;

const counts: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));
const atLeastOnce: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));

function tally(texts: (string | undefined)[], seen: Record<string, number>) {
  for (const text of texts) {
    if (!text) continue;
    for (const m of text.matchAll(/\{([A-Za-z]+)\}/g)) {
      const key = m[1].toLowerCase();
      if (key in seen) seen[key] += 1;
    }
  }
}

const pick = <T,>(list: readonly T[], rng: { int(n: number): number }) => list[rng.int(list.length)];

for (let run = 0; run < RUNS; run++) {
  const rng = createRng(`coverage-${run}`);
  const seen: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));

  tally(PROLOGUE, seen);
  tally(SHOP_INTRO.lines as unknown as string[], seen);

  // les planches de classe : cinq sur l'année, les deux réactions sont lues
  const scenePlan = planScenes(rng, 5);
  for (const id of scenePlan) {
    const scene = SCENES.find((s) => s.id === id)!;
    tally([...scene.lines, ...scene.choices.map((c) => c.detail)], seen);
  }

  // les couloirs : le Sage et Kévin sont garantis, plus deux autres
  for (const id of planEvents(rng)) {
    const text = EV[id] as { intro?: readonly string[]; ask?: (n: number) => string; wrong?: string };
    tally([...(text.intro ?? []), text.ask?.(6), text.wrong], seen);
  }

  const saidThoughts: string[] = [];
  const seenInterludes: string[] = [];
  for (let manche = 1; manche <= DICTEES; manche++) {
    // la pensée d'avant-dictée
    const allowed = MONOLOGUE.filter((t) => seenInterludes.includes('kevin1') || !t.includes('Kévin'));
    const fresh = allowed.filter((t) => !saidThoughts.includes(t));
    const thought = pick(fresh.length ? fresh : allowed, rng);
    saidThoughts.push(thought);
    tally([thought], seen);

    // les réactions pendant la dictée
    for (let i = 0; i < INVALID_PER_DICTEE; i++) tally([pick(SCOLDS, rng)], seen);
    for (let i = 0; i < PRAISES_PER_DICTEE; i++) {
      const pool = rng.next() < 0.25 ? PRAISES_BIG : rng.next() < 0.1 ? PRAISES_HUGE : PRAISES_SMALL;
      tally([pick(pool, rng)], seen);
    }
    if (rng.next() < SUSPICION_PER_DICTEE) tally([pick(SUSPICIONS, rng)], seen);
    if (rng.next() < DUPLICATE_PER_DICTEE) tally([pick(DUPLICATES, rng)], seen);
    if (rng.next() < 0.3) tally([pick(TOO_SHORT, rng)], seen);

    // l'appréciation du bulletin
    const band = rng.next() < 0.72
      ? (['justesse', 'correct', 'bien', 'suspect', 'prodige'] as const)[Math.min(4, Math.floor(-Math.log(rng.next()) * 1.4))]
      : (['rate', 'presque', 'fatal'] as const)[rng.int(3)];
    tally([pick(APPRECIATIONS[band], rng)], seen);

    // la planche de transition, après les dictées impaires
    if (hasInterlude(manche)) {
      const id = pickInterlude(manche, rng.next() < 0.72, seenInterludes, rng);
      if (id) {
        seenInterludes.push(id);
        const it = INTERLUDES.find((i) => i.id === id)!;
        tally([...it.lines, it.cry, it.fall], seen);
      }
    }
  }

  // la fin d'année
  const victory = rng.next() < 0.4;
  tally([victory ? L.victoireSub : L.gameoverSub(7), mention(victory ? 14 : 8, victory).note], seen);
  // le bulletin affiche toujours ces quatre-là
  for (const key of ['nom', 'surnom', 'cour', 'metier', 'adjectif']) seen[key] += 1;

  for (const t of TOKENS) {
    counts[t] += seen[t];
    if (seen[t] > 0) atLeastOnce[t] += 1;
  }
}

const rows = TOKENS.map((t) => ({
  jeton: t,
  moyenne: +(counts[t] / RUNS).toFixed(2),
  'au moins 1 fois': `${Math.round((atLeastOnce[t] / RUNS) * 100)} %`,
})).sort((a, b) => a.moyenne - b.moyenne);
console.table(rows);
