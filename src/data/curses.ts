import type { Curse } from '../engine/hooks';

export const CURSES: Curse[] = [
  {
    id: 'vision-trouble', name: 'Vision trouble', rarity: 'common', price: 10,
    description: 'Prochaine manche : la grille est floue hors d\'un rayon de 2 cases autour du curseur. +100 % de score',
    ui: { blurOutsideCursor: true },
    onWordFound: () => ({ percent: 1 }),
  },
  {
    id: 'dette-de-temps', name: 'Dette de temps', rarity: 'common', price: 10,
    description: 'Prochaine manche : le chrono démarre à 70 s. Euros de la manche ×2',
    mancheSeconds: (base) => base - 20,
    onMancheEnd: (_ctx, _success, euros) => euros * 2,
  },
  {
    id: 'un-seul-essai', name: 'Un seul essai', rarity: 'rare', price: 15,
    description: 'Prochaine manche : chaque mot invalide coûte 10 s. +10 pts par mot valide',
    onInvalidWord: (ctx) => ctx.timer.add(-10),
    onWordFound: () => ({ flat: 10 }),
  },
  {
    id: 'infestation', name: 'Infestation', rarity: 'common', price: 10, enemyRelic: true,
    description: 'Prochaine manche : 3 ennemis supplémentaires. Primes ×2',
    onEnemyKilled: (_e, bounty) => bounty * 2,
  },
  {
    id: 'peau-dure', name: 'Peau dure', rarity: 'rare', price: 15, enemyRelic: true,
    description: 'Prochaine manche : les ennemis ont PV ×2. Primes ×3, chaque mort rend 5 s',
    onEnemyKilled: (_e, bounty, ctx) => { ctx.timer.add(5); return bounty * 3; },
  },
];

export const CURSE_BY_ID = new Map(CURSES.map((c) => [c.id, c]));
