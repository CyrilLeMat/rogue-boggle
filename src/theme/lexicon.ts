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
  relicDepart: 'Qui es-tu, cette année ?',
  relicDepartSub: 'Toute la classe est là. On ne change pas de peau en cours d\'année : choisis bien.',
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
  sageWins: 'défis de couloir relevés',
  seed: 'Année',
  nonDepenses: 'billes au fond du cartable',
} as const;

// Ce que la maîtresse dit quand tu écris n'importe quoi. Tirée au hasard, stable pour un mot donné.
export const SCOLDS = [
  'N\'importe quoi.',
  'Qu\'est-ce que tu m\'as encore écrit ?',
  'Tu n\'as rien dans la tête ou quoi ?',
  'Mais qu\'est-ce qu\'on va faire de toi…',
  'Ce mot n\'existe dans aucune langue connue.',
  'C\'est du français, ça ?',
  'Recommence. Et réfléchis, cette fois.',
  'Ton voisin fait moins de fautes. Et il dort.',
  'J\'ai mal pour la langue de Molière.',
  'Non. Non non non.',
  'Tu inventes des mots maintenant ?',
  'Ton cahier va finir au feu.',
];

// Ce qu'elle lâche quand tu écris un beau mot. Rare : sinon ça ne vaut plus rien.
export const PRAISES_BIG = [
  'Voilà du travail !',
  'Ça, c\'est un mot.',
  'La maîtresse en lâche sa craie.',
  'Toute la classe se retourne.',
  'On note celui-là au tableau d\'honneur.',
  'Même l\'inspecteur aurait applaudi.',
];

export const PRAISES_SMALL = [
  'Bravo.',
  'Tu vois, quand tu fais des efforts.',
  'C\'est déjà mieux.',
  'Bien. Continue.',
  'Ce n\'est pas si compliqué, hein ?',
  'Enfin un mot juste.',
  'Note-le, ça n\'arrivera pas deux fois.',
  'Tes parents seront contents.',
];

// Quand tu sors un mot que personne dans la classe ne connaît, elle se méfie.
export const SUSPICIONS = [
  'Tu connais ce mot, toi ?',
  'Tu triches ou quoi ?',
  'Où as-tu appris ça ?',
  'Ce mot n\'est pas de ton âge.',
  'Tu as lu le dictionnaire en cachette ?',
  'Je vais vérifier, tiens.',
  'Personne dans cette classe ne connaît ce mot. Personne.',
  'C\'est ton grand frère qui t\'a soufflé ?',
  'Répète-le pour voir. Sans regarder.',
];

export const DUPLICATES = [
  'Tu l\'as déjà écrit.',
  'Deux fois le même mot. Deux fois.',
  'On a déjà vu celui-là.',
  'Tu tournes en rond, mon pauvre.',
];

export const TOO_SHORT = [
  'Trois lettres minimum, tu le sais très bien.',
  'C\'est un peu court, jeune homme.',
];

// Stable pour un même feedback : la réplique ne change pas sous les yeux du joueur.
export function scold(list: readonly string[], seed: number): string {
  return list[(seed * 7919) % list.length];
}

// L'appréciation du bulletin, au stylo rouge. `ratio` = note obtenue / note attendue.
export function appreciation(ratio: number, success: boolean, lives: number): string {
  if (!success && lives <= 1) return 'Alarmant. Je convoque les parents dès lundi.';
  if (!success && ratio >= 0.8) return 'Si près. C\'est rageant, pour toi comme pour moi.';
  if (!success) return 'Insuffisant. Des efforts sérieux sont attendus.';
  if (ratio >= 2.5) return 'Exceptionnel. Je n\'avais pas vu ça depuis 1987.';
  if (ratio >= 1.8) return 'Très bon travail. Voilà ce que j\'attends de toi.';
  if (ratio >= 1.3) return 'Bon trimestre. Continue sur cette lancée.';
  if (ratio >= 1.1) return 'Correct. Mais tu peux mieux faire, nous le savons tous les deux.';
  return 'Juste, tout juste. Ne recommence pas à te reposer sur tes lauriers.';
}

export const SIGNATURE = 'La maîtresse';

// Monnaie : les billes. `short` pour les pastilles étroites.
export function money(n: number, short = false): string {
  if (short) return `${n} b.`;
  return `${n} ${Math.abs(n) === 1 ? 'bille' : 'billes'}`;
}

export const RARITY_LABEL = { common: 'Courant', rare: 'Rare', legendary: 'Trésor' } as const;

// Les événements de couloir : un décor, un ton, un enjeu.
export const EV = {
  sage: {
    title: 'Le Sage du CM1',
    intro: [
      'Dans le couloir, adossé au radiateur, un CM1.',
      'Deux redoublements, dit la légende. Il a connu trois maîtresses. Il a vu des choses.',
      'Il te barre la route et te tend une feuille griffonnée :',
    ],
    ask: (n: number) => `— Un mot de ${n} lettres dort dans cette feuille, petit. Les lettres sont là, en clair. Retrouve le chemin.`,
    hint: 'Le sage soupire et pointe la case de départ.',
    wrong: 'Le sage fronce les sourcils.',
    won: 'Le sage hoche lentement la tête.',
    wonSub: '— Tu iras loin. Plus loin que moi.',
    lost: 'Le sage efface la feuille d\'un revers de manche.',
    lostSub: '— Reviens me voir quand tu sauras.',
    start: 'Je regarde la feuille',
    giveUp: 'Je donne ma langue au chat',
    leave: 'Reprendre le couloir',
  },
  inspecteur: {
    title: 'L\'inspecteur d\'académie',
    intro: [
      'La porte s\'ouvre sans frapper. Un costume gris. Un carnet.',
      'La maîtresse blêmit. Vingt-six élèves cessent de respirer. Il te désigne du menton.',
      'Il ouvre son carnet, décapuchonne son stylo, et prononce un mot :',
    ],
    ask: () => 'Trouve-le dans la feuille. Toute la classe te regarde.',
    hint: 'Il tapote la table, agacé, à l\'endroit où commence le mot.',
    wrong: 'Il note quelque chose. On n\'entend que son stylo.',
    won: 'Il referme son carnet. Un silence. Puis, presque un sourire.',
    wonSub: '— Voilà une classe bien tenue, madame.',
    lost: 'Il note. Il souligne. Il note encore.',
    lostSub: '— Nous en reparlerons à la commission.',
    start: 'Se lever, dignement',
    giveUp: 'Baisser les yeux',
    leave: 'Le regarder partir',
  },
  reserve: {
    title: 'La réserve de fournitures',
    intro: [
      'La porte du fond est restée entrouverte. Celle qu\'on n\'ouvre jamais.',
      'Derrière : des étagères jusqu\'au plafond, l\'odeur du papier neuf, et personne.',
      'Tu as trente secondes avant que le concierge repasse.',
    ],
    ask: () => 'Prends une chose. Une seule. Et cours.',
    take: 'Prendre et filer',
    won: 'Tu refermes la porte sans un bruit.',
    wonSub: 'Le concierge passe. Il ne saura jamais.',
    lost: '', lostSub: '',
    hint: '', wrong: '',
    start: 'Pousser la porte', giveUp: '', leave: 'Retourner en classe',
  },
  billes: {
    title: 'La partie de billes',
    intro: [
      'Le cercle est tracé dans la poussière. Les grands regardent.',
      'C\'est le rituel : tu mises, tu joues, tu assumes.',
      'Sauf qu\'ici, on ne joue pas aux billes. On joue aux mots.',
    ],
    ask: () => 'Combien tu mises ?',
    goal: (n: number) => `Trouve ${n} mots avant la fin`,
    hint: '', wrong: '',
    won: 'Le cercle explose de cris.',
    wonSub: 'Tu ramasses la mise. Double.',
    lost: 'Silence. Puis les rires.',
    lostSub: 'Tes billes changent de poche. C\'était la règle.',
    start: 'Poser sa mise',
    giveUp: 'Abandonner la partie',
    leave: 'Quitter le cercle',
  },
  recitation: {
    title: 'Le concours de récitation',
    intro: [
      'Debout sur l\'estrade. Vingt-six paires d\'yeux. Le radiateur qui claque.',
      'La maîtresse annonce la contrainte du jour et croise les bras.',
      'Chaque mot juste te rapporte des billes. Chaque seconde compte.',
    ],
    ask: () => '',
    hint: '', wrong: '',
    won: 'La classe applaudit. Même ceux du fond.',
    wonSub: 'La maîtresse note quelque chose. Cette fois, c\'est bon signe.',
    lost: 'La classe applaudit mollement.',
    lostSub: 'On a connu des récitations plus longues.',
    start: 'Monter sur l\'estrade',
    giveUp: 'Descendre de l\'estrade',
    leave: 'Regagner sa place',
  },
} as const;
