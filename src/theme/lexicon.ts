// Univers « La Dictée » : une école communale, encre violette et bons points…
// … racontée comme si le sort du monde en dépendait. Le décalage est le ton du jeu.
// Tout le vocabulaire visible passe par ici ; les ids et le moteur gardent leurs noms techniques.

export const GAME_TITLE = 'Rogue Boggle';
export const GAME_SUBTITLE = 'Ultimate Dictée de CE2 Edition';
export const TAGLINE = 'Dix dictées. Trois bons points. Ta place en CM1 se joue ici.';

export const L = {
  manche: 'Dictée',
  seuil: 'Note à atteindre',
  vies: 'Bons points',
  grille: 'Feuille',
  euros: 'Billes',
  boutique: 'La coopérative',
  boutiqueSub: 'La maîtresse a le dos tourné. Le marché noir de la coopérative est ouvert.',
  relic: 'Fourniture',
  charme: 'Gommette',
  consommable: 'Trousse',
  malediction: 'Punition',
  theme: 'Leçon',
  serie: 'Élan',
  reussie: 'Copie acceptée.',
  ratee: 'Copie refusée.',
  vieEnMoins: 'Un bon point arraché du tableau.',
  victoire: 'Passage en CM1.',
  victoireSub: 'Le système n\'a rien vu venir. Les félicitations du conseil de classe, tu les as arrachées.',
  gameover: 'Redoublement.',
  gameoverSub: (n: number) => `La dictée ${n} a eu raison de toi. Le système a gagné, cette fois. Tes parents sont convoqués.`,
  continuer: 'Copie suivante',
  lancer: 'Silence. On commence.',
  terminer: 'Rendre la copie',
  terminerBloque: 'Rendre la copie (note insuffisante)',
  changerArticles: 'Nouvel arrivage',
  acheter: 'Acheter',
  achete: 'Dans le cartable',
  pasAssez: 'pas assez de billes',
  inventairePlein: 'Trousse pleine',
  maxExemplaires: 'Cartable plein',
  nouvelleRun: 'Nouvelle année scolaire',
  rejouer: 'Refaire cette année',
  menu: 'Menu',
  relicDepart: 'Ta fourniture de rentrée',
  relicDepartSub: 'Choisis bien. Une année entière repose sur cet objet.',
  pretClassique: 'Dictée classique. Rien que toi, la feuille, et une maîtresse qui croit encore aux règles.',
  repit: 'de répit, la maîtresse a eu pitié',
  manqueList: 'Le maître attendait aussi',
  meilleurs: 'Tes plus beaux mots',
  motsTouche: 'touche un mot pour revoir son tracé',
  plancher: 'Le minimum syndical',
  depassement: (n: number) => `${n} pts au-dessus de la note`,
  enAvance: 'Copie rendue en avance',
  consigneLine: 'Consigne du jour remplie',
  cancreSurvivant: 'Un cancre court toujours',
  cancreChasse: 'Chasse aux cancres',
  fournituresLine: 'Fournitures & punitions',
  gagne: 'Billes gagnées',
  motsMarquants: 'Mots pour la postérité',
  seed: 'Année',
  nonDepenses: 'billes au fond du cartable',
} as const;

// Monnaie : les billes. `short` pour les pastilles étroites.
export function money(n: number, short = false): string {
  if (short) return `${n} b.`;
  return `${n} ${Math.abs(n) === 1 ? 'bille' : 'billes'}`;
}

export const RARITY_LABEL = { common: 'Courant', rare: 'Rare', legendary: 'Trésor' } as const;
