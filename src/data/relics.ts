import type { Relic, RunContext } from '../engine/hooks';
import { posKey } from '../engine/adjacency';
import { countVowels } from '../engine/scoring';
import { findPathForWord } from '../engine/wordFinder';
import type { Grid } from '../engine/types';

const RARE_LETTERS = /[KWXYZJ]|QU/;
export const FULL_GRID_BONUS = 100; // [tuning]
export const CURSED_WORD_BONUS = 60; // [tuning] 100 avec le mot affiché en clair donnait 208 pts pour un seuil de 50
// Cases qu'on a le droit de laisser de côté : 2 en 4×4/5×5, 3 en 6×6/7×7 (retour playtest : 100 % trop dur)
export const fullGridTolerance = (size: number) => Math.floor(size / 2);
const sortLetters = (w: string) => w.split('').sort().join('');
const isPalindrome = (w: string) => w.length >= 4 && w === w.split('').reverse().join('');

// Amorce : le plus long mot courant de 8+ lettres (à défaut, le plus long mot ≥ 7), préfixe et éventuellement départ.
function pickAmorce(ctx: RunContext, letters: number, withStart: boolean) {
  const words = [...ctx.manche.search.words];
  const longs = words.filter((w) => w.length >= 8);
  const pool = (longs.some((w) => ctx.isCommon(w)) ? longs.filter((w) => ctx.isCommon(w)) : longs.length ? longs : words.filter((w) => w.length >= 7));
  if (!pool.length) { ctx.manche.amorce = null; return; }
  const word = ctx.rng.pick(pool);
  const path = withStart ? findPathForWord(ctx.manche.grid, word) : null;
  ctx.manche.amorce = { prefix: word.slice(0, letters), length: word.length, start: path ? posKey(path[0][0], path[0][1]) : null };
}

// Lettre présente dans la grille et qui commence au moins 3 mots trouvables (sinon le relic est mort).
function pickLuckyLetter(ctx: RunContext) {
  const letters = new Set(ctx.manche.grid.cells.flat().filter((c) => !c.isJoker).map((c) => c.letter[0]));
  const words = [...ctx.manche.search.words];
  const options = [...letters].filter((l) => words.filter((w) => w.startsWith(l)).length >= 3);
  ctx.manche.luckyLetter = options.length ? ctx.rng.pick(options) : null;
}

function placeJoker(grid: Grid, ctx: RunContext): Grid {
  const free: [number, number][] = [];
  for (let r = 0; r < grid.size; r++)
    for (let c = 0; c < grid.size; c++)
      if (!grid.cells[r][c].isJoker && !grid.cells[r][c].isToxic) free.push([r, c]);
  if (free.length === 0) return grid;
  const [r, c] = ctx.rng.pick(free);
  const cells = grid.cells.map((row) => row.map((cell) => ({ ...cell })));
  cells[r][c].isJoker = true;
  return { ...grid, cells };
}

export const RELICS: Relic[] = [
  {
    id: 'lexicographe', name: 'Grand Larousse', rarity: 'common', price: 20,
    description: '+50 % sur les mots de 6+ lettres',
    onWordFound: (w) => (w.length >= 6 ? { percent: 0.5 } : undefined),
  },
  {
    id: 'voyelliste', name: 'Plume Sergent-Major', rarity: 'common', price: 95,
    description: '+1 pt par voyelle du mot',
    onWordFound: (w) => ({ flat: countVowels(w) }),
  },
  {
    id: 'rarete', name: 'Encre violette', rarity: 'common', price: 20,
    description: '+5 pts si le mot contient K, W, X, Y, Z, J ou QU',
    onWordFound: (w) => (RARE_LETTERS.test(w) ? { flat: 5 } : undefined),
  },
  {
    id: 'combo', name: 'Récitation', rarity: 'rare', price: 60, streakWindow: 8, streakMaxLinks: 10,
    description: 'L\'élan tient 8 s au lieu de 5, et monte jusqu\'à ×2 au lieu de ×1,5',
  },
  {
    id: 'amplificateur', name: 'Stylo plume', rarity: 'rare', price: 80,
    description: '×1,3 sur tous les mots',
    onWordFound: () => ({ percent: 0.3 }),
  },
  {
    id: 'resonance', name: 'Stylo en or', rarity: 'legendary', price: 135,
    description: '×1,6 sur tous les mots',
    onWordFound: () => ({ percent: 0.6 }),
  },
  {
    id: 'metronome', name: 'Sablier de la maîtresse', rarity: 'common', price: 215,
    description: '+2 s de chrono par mot juste',
    onWordAccepted: (_f, ctx) => ctx.timer.add(2),
  },
  {
    id: 'sablier', name: 'Rab de récré', rarity: 'rare', price: 60,
    description: 'Un mot juste dans les 5 dernières secondes → le chrono remonte à 10 s',
    onWordAccepted: (_f, ctx) => { if (ctx.manche.timeLeftBeforeWord <= 5) ctx.timer.setMin(10); },
  },
  {
    id: 'bouclier', name: 'Buvard', rarity: 'common', price: 55,
    description: 'Absorbe la première tache d\'encre utilisée par dictée',
    onCellUsed: (cell, ctx) => {
      if (!cell.isToxic || (ctx.manche.relicState.bouclier ?? 0) > 0) return;
      ctx.manche.relicState.bouclier = 1;
      return 'neutralize';
    },
  },
  {
    id: 'memoire', name: 'Cahier du jour', rarity: 'common', price: 40,
    description: 'Les cases déjà utilisées restent colorées. Quand (presque) toute la feuille a servi : +100 pts',
    ui: { highlightUsedCells: true },
    onWordAccepted: (_f, ctx) => {
      if (ctx.manche.relicState.memoire) return;
      const used = new Set<number>();
      for (const f of ctx.manche.found) for (const [r, c] of f.path) used.add(posKey(r, c));
      const size = ctx.manche.grid.size;
      if (used.size >= size * size - fullGridTolerance(size)) {
        ctx.manche.relicState.memoire = 1;
        ctx.addBonus('Grille complète', FULL_GRID_BONUS);
      }
    },
  },
  {
    id: 'oracle', name: 'Petit Larousse', rarity: 'common', price: 45,
    description: 'Donne la longueur du mot le plus long de la feuille et marque sa première lettre',
    ui: { showLongestLength: true },
  },
  {
    id: 'amorce', name: 'Antisèche', rarity: 'rare', price: 20,
    description: 'En début de dictée, souffle les 3 premières lettres d\'un mot de 8 lettres ou plus présent dans la feuille',
    onMancheStart: (ctx) => pickAmorce(ctx, 3, false),
  },
  {
    id: 'amorce-sure', name: 'Antisèche complète', rarity: 'legendary', price: 20, requires: 'amorce',
    description: 'L\'antisèche souffle 4 lettres et marque la case de départ',
    onMancheStart: (ctx) => pickAmorce(ctx, 4, true),
  },
  {
    id: 'reroll-cible', name: 'Gomme de précision', rarity: 'legendary', price: 70,
    description: 'La Gomme propose 3 lettres au choix au lieu d\'une au hasard',
    ui: { targetedReroll: true },
  },
  {
    id: 'case-joker', name: 'Case blanche', rarity: 'rare', price: 45,
    description: 'Une case blanche par feuille : elle vaut n\'importe quelle lettre (1 pt), dans les mots de 4 lettres et plus',
    onGridGenerate: placeJoker,
  },
  {
    id: 'double-joker', name: 'Deux cases blanches', rarity: 'legendary', price: 90, requires: 'case-joker',
    description: 'Une seconde case blanche, et les deux valent aussi dans les mots de 3 lettres',
    onGridGenerate: placeJoker,
    jokerFree: true,
  },
  {
    id: 'mot-maudit', name: 'Mot mystère', rarity: 'common', price: 40,
    description: 'La maîtresse pense à un mot de la feuille : tu connais sa longueur et sa case de départ. +60 pts si tu le traces',
    onMancheStart: (ctx) => {
      const size = ctx.manche.grid.size;
      const candidates = [...ctx.manche.search.words].filter((w) => w.length >= 4 && w.length <= size + 2 && ctx.isCommon(w));
      const word = candidates.length ? ctx.rng.pick(candidates) : null;
      ctx.manche.cursedWord = word;
      const path = word ? findPathForWord(ctx.manche.grid, word) : null;
      ctx.manche.cursedStart = path ? posKey(path[0][0], path[0][1]) : null;
    },
    onWordFound: (w, ctx) => (w === ctx.manche.cursedWord ? { flat: CURSED_WORD_BONUS } : undefined),
  },
  {
    id: 'anagramme', name: 'Jeu d\'anagrammes', rarity: 'rare', price: 125,
    description: '+30 pts si le mot est l\'anagramme d\'un mot déjà trouvé',
    onWordFound: (w, ctx) => {
      const key = sortLetters(w);
      return ctx.manche.found.some((f) => f.word !== w && sortLetters(f.word) === key) ? { flat: 30 } : undefined;
    },
  },
  {
    id: 'palindrome', name: 'Palindrome', rarity: 'legendary', price: 40,
    description: '+150 pts sur un palindrome de 4+ lettres',
    onWordFound: (w) => (isPalindrome(w) ? { flat: 150 } : undefined),
  },
  {
    id: 'alchimiste', name: 'Marchand de billes', rarity: 'rare', price: 60,
    description: 'En fin d\'année, chaque bille restante vaut 2 pts',
    onRunEnd: (ctx) => ctx.run.euros * 2,
  },
  {
    id: 'conjugueur', name: 'Bescherelle', rarity: 'common', price: 40,
    description: '+40 % sur les verbes',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('VER') ? { percent: 0.4 } : undefined),
  },
  {
    id: 'qualificatif', name: 'Le Bled', rarity: 'common', price: 40,
    description: '+40 % sur les adjectifs',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('ADJ') ? { percent: 0.4 } : undefined),
  },
  {
    id: 'nominaliste', name: 'Petit Robert', rarity: 'common', price: 60,
    description: '+30 % sur les noms',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('NOM') ? { percent: 0.3 } : undefined),
  },
  {
    id: 'adverbes', name: 'Grevisse', rarity: 'rare', price: 30,
    description: '+100 % sur les adverbes',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('ADV') ? { percent: 1 } : undefined),
  },
  {
    id: 'porte-bonheur', name: 'Lettre soulignée', rarity: 'rare', price: 35,
    description: 'Une lettre de la feuille est soulignée à chaque dictée : les mots qui commencent par elle comptent double',
    onMancheStart: pickLuckyLetter,
    onWordFound: (w, ctx) => (ctx.manche.luckyLetter && w.startsWith(ctx.manche.luckyLetter) ? { final: 2 } : undefined),
  },
  {
    id: 'porte-bonheur-plus', name: 'Lettre encadrée', rarity: 'legendary', price: 55, requires: 'porte-bonheur',
    description: 'La lettre soulignée double aussi tous les mots qui la contiennent',
    onWordFound: (w, ctx) => (ctx.manche.luckyLetter && !w.startsWith(ctx.manche.luckyLetter) && w.includes(ctx.manche.luckyLetter) ? { final: 2 } : undefined),
  },
  {
    id: 'sourcier', name: 'Copie double', rarity: 'rare', price: 50, gridRerolls: 2,
    description: 'Avant chaque dictée, tu peux changer de feuille jusqu\'à 2 fois en voyant sa difficulté et sa note à atteindre',
  },
  {
    id: 'epargne', name: 'Tirelire', rarity: 'common', price: 45,
    description: 'À chaque fin de dictée, +5 % des billes que tu as en poche (arrondi au supérieur)',
    onMancheEnd: (ctx, _success, euros) => euros + Math.ceil(ctx.run.euros * 0.05),
  },
  {
    id: 'brocanteur', name: 'Ami du concierge', rarity: 'common', price: 45, shopRerolls: 2,
    description: '2 nouveaux arrivages gratuits à chaque passage à la coopérative',
  },
  // --- Relics d'attaque (inertes tant qu'il n'y a pas d'ennemi) ---
  {
    id: 'bretteur', name: 'Règle en fer', rarity: 'common', price: 40, enemyRelic: true,
    description: 'Coups ×2 sur les cancres avec les mots de 6+ lettres',
    onDamage: (w, _e, dmg) => (w.length >= 6 ? dmg * 2 : dmg),
  },
  {
    id: 'eclaboussure', name: 'Boulette de papier', rarity: 'rare', price: 45, enemyRelic: true,
    description: 'Un mot qui touche un cancre en éclabousse les voisins (50 % des coups)',
    // géré par le moteur d'ennemis via ctx.hasRelic('eclaboussure')
  },
  {
    id: 'vampire', name: 'Récré prolongée', rarity: 'common', price: 55, enemyRelic: true,
    description: 'Faire taire un cancre rend 5 s de chrono',
    onEnemyKilled: (_e, bounty, ctx) => { ctx.timer.add(5); return bounty; },
  },
  {
    id: 'primes', name: 'Chouchou de la maîtresse', rarity: 'common', price: 45, enemyRelic: true,
    description: 'Primes de la maîtresse +50 %',
    onEnemyKilled: (_e, bounty) => Math.round(bounty * 1.5),
  },
  {
    id: 'harpon', name: 'Lance-boulettes', rarity: 'rare', price: 50, enemyRelic: true,
    description: 'Chaque mot valide inflige 25 % de son score au cancre, même sans le toucher',
    // géré par le moteur d'ennemis via ctx.hasRelic('harpon')
  },
  {
    id: 'cranes', name: 'Tableau d\'honneur', rarity: 'legendary', price: 45, enemyRelic: true,
    description: '+3 % de score par cancre fait taire depuis la rentrée',
    onWordFound: (_w, ctx) => (ctx.run.killCount > 0 ? { percent: 0.03 * ctx.run.killCount } : undefined),
  },
];

export const RELIC_BY_ID: Map<string, Relic> = new Map(RELICS.map((r) => [r.id, r]));

