import type { Curse } from '../engine/hooks';

export const CURSES: Curse[] = [
  {
    id: 'vision-trouble', name: 'Au coin', rarity: 'common', price: 15,
    description: 'Prochaine dictée : tu ne vois net que 2 cases autour de ton doigt. +100 % de score',
    ui: { blurOutsideCursor: true },
    onWordFound: () => ({ percent: 1 }),
  },
  {
    id: 'dette-de-temps', name: 'Retenue', rarity: 'common', price: 15,
    description: 'Prochaine dictée : 20 s de moins au chrono. Billes de la dictée ×2',
    mancheSeconds: (base) => base - 20,
    onMancheEnd: (_ctx, _success, euros) => euros * 2,
  },
  {
    id: 'un-seul-essai', name: 'Cent lignes', rarity: 'rare', price: 20,
    description: 'Prochaine dictée : chaque faute coûte 10 s. +10 pts par mot juste',
    onInvalidWord: (ctx) => ctx.timer.add(-10),
    onWordFound: () => ({ flat: 10 }),
  },
  {
    id: 'infestation', name: 'Classe de cancres', rarity: 'common', price: 15, enemyRelic: true,
    description: 'Prochaine dictée : 2 cancres de plus. Primes ×2',
    onEnemyKilled: (_e, bounty) => bounty * 2,
  },
  {
    id: 'peau-dure', name: 'Cancres têtus', rarity: 'rare', price: 20, enemyRelic: true,
    description: 'Prochaine dictée : les cancres ont 50 % d\'endurance en plus. Primes ×3, chaque cancre calmé rend 5 s',
    onEnemyKilled: (_e, bounty, ctx) => { ctx.timer.add(5); return bounty * 3; },
  },
];

export const CURSE_BY_ID = new Map(CURSES.map((c) => [c.id, c]));
