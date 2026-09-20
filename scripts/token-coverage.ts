// Combien de fois, en moyenne, chaque mot de la fiche ressort-il dans une partie ?
// Simule le programme d'une année : prologue, dictées, planches, couloirs, boutique, bulletin.
import { createRng } from '../src/engine/rng';
import { INTERLUDES, hasInterlude, pickInterlude } from '../src/data/interludes';
import { SCENES, planScenes } from '../src/data/scenes';
import { planEvents } from '../src/engine/events';
import {
  APPRECIATIONS, DUPLICATES, EV, L, MONOLOGUE, PRAISES_BIG, PRAISES_HUGE, PRAISES_SMALL,
  SCOLDS, SHOP_INTRO, SIGNATURE, SUSPICIONS, TOO_SHORT, mention,
} from '../src/theme/lexicon';

const TOKENS = ['nom', 'salut', 'phrase', 'cour', 'heros', 'plat', 'horreur', 'metier', 'chanson', 'admire', 'surnom', 'rigolo', 'adjectif', 'adjectif2', 'objet', 'animal', 'corps', 'distance', 'nombre', 'action', 'cri', 'faute'];

// Le prologue, tel qu'il est écrit dans le composant.
const PROLOGUE = [
  'Tu avais lancé un « {salut} » à toute la cour, tu sifflais {chanson} entre tes dents, et le goudron sentait l\'été. On aurait pu faire {cour} pendant mille ans.',
  'Tu pensais encore à {plat}, à la cantine, tout à l\'heure.',
  '{Maitresse} se retourna d\'un bloc.',
  'Une seconde, tu penses à t\'enfuir, à sortir, à {action} jusqu\'à la nuit.',
  'Personne ne bouge. {Maitresse} décapuchonne son stylo rouge.',
];

const RUNS = 4000;
const DICTEES = 11;
// Estimations de partie : mots trouvés, tracés refusés, compliments déclenchés. [tuning]
const INVALID_PER_DICTEE = 3;
const PRAISES_PER_DICTEE = 2;
const SUSPICION_PER_DICTEE = 0.6;
const DUPLICATE_PER_DICTEE = 0.8;

// Deux comptes séparés : ce qui se lit au calme, et ce qui défile pendant la dictée
// (sous la pression du chrono, ces répliques-là ne sont pas lues : elles ne comptent pas).
const counts: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));
const rushed: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));
const endCount: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));
const atLeastOnce: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));

// {maitresse} et {directeur} sont bâtis sur le mot rigolo : ils comptent pour lui.
const ALIAS: Record<string, string> = { maitresse: 'rigolo', directeur: 'rigolo' };

function tally(texts: (string | undefined)[], seen: Record<string, number>) {
  for (const text of texts) {
    if (!text) continue;
    for (const m of text.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)) {
      const key = ALIAS[m[1].toLowerCase()] ?? m[1].toLowerCase();
      if (key in seen) seen[key] += 1;
    }
  }
}

const pick = <T,>(list: readonly T[], rng: { int(n: number): number }) => list[rng.int(list.length)];

for (let run = 0; run < RUNS; run++) {
  const rng = createRng(`coverage-${run}`);
  const seen: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));
  const fast: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));

  tally(PROLOGUE, seen);
  tally([...(SHOP_INTRO.lines as unknown as string[]), L.boutiqueSub, SHOP_INTRO.ask], seen);

  // les planches de classe : cinq sur l'année, les deux réactions sont lues
  const scenePlan = planScenes(rng, 5);
  for (const id of scenePlan) {
    const scene = SCENES.find((s) => s.id === id)!;
    tally([...scene.lines, ...scene.choices.map((c) => c.detail)], seen);
  }

  // les couloirs : le Sage et Kévin sont garantis, plus deux autres
  for (const id of planEvents(rng)) {
    const text = EV[id] as {
      intro?: readonly string[]; ask?: (n: number) => string; wrong?: string;
      wonSub?: string; lostSub?: string;
    };
    const win = rng.next() < 0.5;
    const tail = win
      ? [(text as { won?: string }).won, text.wonSub]
      : [(text as { lost?: string }).lost, text.lostSub];
    tally([...(text.intro ?? []), text.ask?.(6), ...tail], seen);
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

    // les réactions pendant la dictée : comptées à part, on ne les lit pas vraiment
    for (let i = 0; i < INVALID_PER_DICTEE; i++) tally([pick(SCOLDS, rng)], fast);
    for (let i = 0; i < PRAISES_PER_DICTEE; i++) {
      const pool = rng.next() < 0.25 ? PRAISES_BIG : rng.next() < 0.1 ? PRAISES_HUGE : PRAISES_SMALL;
      tally([pick(pool, rng)], fast);
    }
    if (rng.next() < SUSPICION_PER_DICTEE) tally([pick(SUSPICIONS, rng)], fast);
    if (rng.next() < DUPLICATE_PER_DICTEE) tally([pick(DUPLICATES, rng)], fast);
    if (rng.next() < 0.3) tally([pick(TOO_SHORT, rng)], fast);

    tally([SIGNATURE], seen); // la signature sous chaque appréciation
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

  // la fin d'année : comptée à part, car elle arrive trop tard pour faire l'effet
  const victory = rng.next() < 0.4;
  const ending: Record<string, number> = Object.fromEntries(TOKENS.map((t) => [t, 0]));
  tally([victory ? L.victoireSub : L.gameoverSub(7), mention(victory ? 14 : 8, victory).note], ending);
  for (const key of ['nom', 'surnom', 'cour', 'metier', 'adjectif', 'plat', 'horreur', 'action', 'chanson', 'admire']) ending[key] += 1;
  for (const t of TOKENS) endCount[t] += ending[t];

  for (const t of TOKENS) {
    counts[t] += seen[t];
    rushed[t] += fast[t];
    if (seen[t] > 0) atLeastOnce[t] += 1;
  }
}

const rows = TOKENS.map((t) => ({
  jeton: t,
  'pendant l\'année': +(counts[t] / RUNS).toFixed(2),
  'au moins 1 fois': `${Math.round((atLeastOnce[t] / RUNS) * 100)} %`,
  bulletin: +(endCount[t] / RUNS).toFixed(2),
  'en dictée': +(rushed[t] / RUNS).toFixed(2),
})).sort((a, b) => a['pendant l\'année'] - b['pendant l\'année']);
console.table(rows);
