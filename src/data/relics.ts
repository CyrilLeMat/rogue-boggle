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
    id: 'lexicographe', name: 'Lexicographe', rarity: 'common',
    description: '+50 % sur les mots de 6+ lettres',
    onWordFound: (w) => (w.length >= 6 ? { percent: 0.5 } : undefined),
  },
  {
    id: 'voyelliste', name: 'Voyelliste', rarity: 'common',
    description: '+1 pt par voyelle du mot',
    onWordFound: (w) => ({ flat: countVowels(w) }),
  },
  {
    id: 'rarete', name: 'Rareté', rarity: 'common',
    description: '+5 pts si le mot contient K, W, X, Y, Z, J ou QU',
    onWordFound: (w) => (RARE_LETTERS.test(w) ? { flat: 5 } : undefined),
  },
  {
    id: 'combo', name: 'Combo', rarity: 'rare', streakWindow: 8, streakMaxLinks: 10,
    description: 'La série tient 8 s au lieu de 5, et monte jusqu\'à ×2 au lieu de ×1,5',
  },
  {
    id: 'amplificateur', name: 'Amplificateur', rarity: 'rare',
    description: '×1,3 sur tous les mots',
    onWordFound: () => ({ percent: 0.3 }),
  },
  {
    id: 'resonance', name: 'Résonance', rarity: 'legendary',
    description: '×1,6 sur tous les mots',
    onWordFound: () => ({ percent: 0.6 }),
  },
  {
    id: 'metronome', name: 'Métronome', rarity: 'common',
    description: '+2 s de chrono par mot validé',
    onWordAccepted: (_f, ctx) => ctx.timer.add(2),
  },
  {
    id: 'sablier', name: 'Sablier fissuré', rarity: 'rare',
    description: 'Mot validé alors qu\'il reste ≤ 5 s → le chrono remonte à 10 s',
    onWordAccepted: (_f, ctx) => { if (ctx.manche.timeLeftBeforeWord <= 5) ctx.timer.setMin(10); },
  },
  {
    id: 'bouclier', name: 'Bouclier de case', rarity: 'common',
    description: 'Neutralise la première case toxique utilisée par manche',
    onCellUsed: (cell, ctx) => {
      if (!cell.isToxic || (ctx.manche.relicState.bouclier ?? 0) > 0) return;
      ctx.manche.relicState.bouclier = 1;
      return 'neutralize';
    },
  },
  {
    id: 'memoire', name: 'Mémoire', rarity: 'common',
    description: 'Les cases déjà utilisées restent colorées. Quand (presque) toutes les cases ont servi : +100 pts',
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
    id: 'oracle', name: 'Oracle', rarity: 'common',
    description: 'Affiche la longueur du mot le plus long de la grille et marque la case de sa première lettre',
    ui: { showLongestLength: true },
  },
  {
    id: 'radar', name: 'Radar', rarity: 'rare',
    description: 'Un halo sur une case appartenant à un mot de 7+ lettres',
    ui: { radarLongWord: true },
    onMancheStart: (ctx) => {
      const cells = [...ctx.manche.search.longWordCells];
      ctx.manche.radarCell = cells.length ? ctx.rng.pick(cells) : null;
    },
  },
  {
    id: 'dictionnaire-vivant', name: 'Dictionnaire vivant', rarity: 'legendary',
    description: 'Appui long sur une case → 3 mots courants de 3 lettres qui commencent par elle',
    ui: { longPressHints: true },
  },
  {
    id: 'econome', name: 'Économe', rarity: 'common',
    description: '+30 % d\'euros par manche réussie',
    onMancheEnd: (_ctx, success, euros) => (success ? Math.round(euros * 1.3) : euros),
  },
  {
    id: 'reroll-cible', name: 'Reroll ciblé', rarity: 'legendary',
    description: 'Le consommable Reroll propose 3 lettres au choix',
    ui: { targetedReroll: true },
  },
  {
    id: 'case-joker', name: 'Case joker', rarity: 'rare',
    description: 'Une case joker par grille (vaut n\'importe quelle lettre, 1 pt)',
    onGridGenerate: placeJoker,
  },
  {
    id: 'double-joker', name: 'Double joker', rarity: 'legendary', requires: 'case-joker',
    description: 'Une seconde case joker',
    onGridGenerate: placeJoker,
  },
  {
    id: 'mot-maudit', name: 'Mot maudit', rarity: 'common',
    description: 'Un mot courant de la grille est désigné en secret : tu connais sa longueur et sa case de départ. +60 pts si tu le traces',
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
    id: 'anagramme', name: 'Anagramme bonus', rarity: 'rare',
    description: '+30 pts si le mot est l\'anagramme d\'un mot déjà trouvé',
    onWordFound: (w, ctx) => {
      const key = sortLetters(w);
      return ctx.manche.found.some((f) => f.word !== w && sortLetters(f.word) === key) ? { flat: 30 } : undefined;
    },
  },
  {
    id: 'palindrome', name: 'Chasseur de palindromes', rarity: 'legendary',
    description: '+150 pts sur un palindrome de 4+ lettres',
    onWordFound: (w) => (isPalindrome(w) ? { flat: 150 } : undefined),
  },
  {
    id: 'alchimiste', name: 'Alchimiste', rarity: 'rare',
    description: 'En fin de run, chaque euro restant vaut 2 pts',
    onRunEnd: (ctx) => ctx.run.euros * 2,
  },
  {
    id: 'conjugueur', name: 'Conjugueur', rarity: 'common',
    description: '+40 % sur les verbes',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('VER') ? { percent: 0.4 } : undefined),
  },
  {
    id: 'qualificatif', name: 'Qualificatif', rarity: 'common',
    description: '+40 % sur les adjectifs',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('ADJ') ? { percent: 0.4 } : undefined),
  },
  {
    id: 'nominaliste', name: 'Nominaliste', rarity: 'common',
    description: '+30 % sur les noms',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('NOM') ? { percent: 0.3 } : undefined),
  },
  {
    id: 'adverbes', name: 'Chasseur d\'adverbes', rarity: 'rare',
    description: '+100 % sur les adverbes',
    onWordFound: (w, ctx) => (ctx.categoriesOf(w).has('ADV') ? { percent: 1 } : undefined),
  },
  {
    id: 'porte-bonheur', name: 'Lettre porte-bonheur', rarity: 'rare',
    description: 'Une lettre de la grille est tirée à chaque manche : les mots qui commencent par elle comptent double',
    onMancheStart: pickLuckyLetter,
    onWordFound: (w, ctx) => (ctx.manche.luckyLetter && w.startsWith(ctx.manche.luckyLetter) ? { final: 2 } : undefined),
  },
  {
    id: 'porte-bonheur-plus', name: 'Lettre bénie', rarity: 'legendary', requires: 'porte-bonheur',
    description: 'La lettre porte-bonheur double aussi tous les mots qui la contiennent',
    onWordFound: (w, ctx) => (ctx.manche.luckyLetter && !w.startsWith(ctx.manche.luckyLetter) && w.includes(ctx.manche.luckyLetter) ? { final: 2 } : undefined),
  },
  {
    id: 'sourcier', name: 'Sourcier', rarity: 'rare', gridRerolls: 2,
    description: 'Avant chaque manche, tu peux retirer la grille jusqu\'à 2 fois en voyant son humeur et son seuil',
  },
  {
    id: 'epargne', name: 'Épargne', rarity: 'common',
    description: 'À chaque fin de manche, +5 % des euros que tu as en poche (arrondi au supérieur)',
    onMancheEnd: (ctx, _success, euros) => euros + Math.ceil(ctx.run.euros * 0.05),
  },
  {
    id: 'brocanteur', name: 'Brocanteur', rarity: 'common', shopRerolls: 2,
    description: '2 changements d\'articles gratuits à chaque visite de la boutique',
  },
  // --- Relics d'attaque (inertes tant qu'il n'y a pas d'ennemi) ---
  {
    id: 'bretteur', name: 'Bretteur', rarity: 'common', enemyRelic: true,
    description: 'Dégâts ×2 sur les mots de 6+ lettres',
    onDamage: (w, _e, dmg) => (w.length >= 6 ? dmg * 2 : dmg),
  },
  {
    id: 'eclaboussure', name: 'Éclaboussure', rarity: 'rare', enemyRelic: true,
    description: 'Un mot qui touche un ennemi inflige 50 % de ses dégâts aux ennemis adjacents au chemin',
    // géré par le moteur d'ennemis via ctx.hasRelic('eclaboussure')
  },
  {
    id: 'vampire', name: 'Vampire', rarity: 'common', enemyRelic: true,
    description: 'Tuer un ennemi rend 5 s de chrono',
    onEnemyKilled: (_e, bounty, ctx) => { ctx.timer.add(5); return bounty; },
  },
  {
    id: 'primes', name: 'Chasseur de primes', rarity: 'common', enemyRelic: true,
    description: 'Primes +50 %',
    onEnemyKilled: (_e, bounty) => Math.round(bounty * 1.5),
  },
  {
    id: 'harpon', name: 'Harpon', rarity: 'rare', enemyRelic: true,
    description: 'Chaque mot valide inflige 25 % de son score à l\'ennemi le plus proche, même sans le toucher',
    // géré par le moteur d'ennemis via ctx.hasRelic('harpon')
  },
  {
    id: 'cranes', name: 'Collectionneur de crânes', rarity: 'legendary', enemyRelic: true,
    description: '+3 % de score par ennemi tué depuis le début de la run',
    onWordFound: (_w, ctx) => (ctx.run.killCount > 0 ? { percent: 0.03 * ctx.run.killCount } : undefined),
  },
];

export const RELIC_BY_ID: Map<string, Relic> = new Map(RELICS.map((r) => [r.id, r]));

