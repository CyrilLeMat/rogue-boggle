// Univers « La Dictée » : une école communale, encre violette et bons points…
// … racontée comme si le sort du monde en dépendait. Le décalage est le ton du jeu.
// Tout le vocabulaire visible passe par ici ; les ids et le moteur gardent leurs noms techniques.

export const GAME_TITLE = 'Rogue Boggle';
export const GAME_SUBTITLE = 'Ultimate Dictée de CE2 Edition';
export const TAGLINE = 'Dix dictées te séparent du CM1. La maîtresse en a préparé onze, au cas où.';

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
  manqueList: 'Elle attendait aussi',
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
  'J\'ai vérifié dans trois dictionnaires. Trois.',
  'C\'est du français, ça ?',
  'Je vais faire comme si je n\'avais rien vu.',
  'Ton voisin fait moins de fautes. Et il dort.',
  'Molière s\'est retourné. J\'ai entendu le bruit.',
  'Non. Non non non.',
  'Tu inventes des mots maintenant ?',
  'Mon stylo rouge n\'a plus d\'encre. À cause de toi.',
  'J\'ai fait sept ans d\'études pour lire ça.',
  'Même le radiateur a honte.',
  'Tu écris comme on jette des cailloux.',
  'Le dictionnaire vient de claquer tout seul.',
  'Sors. Non, reste. Non, sors.',
  'J\'ai rêvé de cette faute cette nuit. Je le jure.',
  'Ce mot me donne des palpitations.',
];

// Les très gros mots la font sortir de ses gonds. Dans le bon sens.
export const PRAISES_HUGE = [
  'C\'est tellement bien que j\'en suis tombée de ma chaise.',
  'J\'ai dû m\'asseoir. Sur le sol, il n\'y avait plus de chaise.',
  'On encadre ta copie dans le couloir. Ce soir.',
  'J\'ai les larmes aux yeux. Et ce n\'est pas la craie.',
  'Je photocopie ça pour la salle des profs.',
  'Vingt-six ans de carrière. Vingt-six.',
  'J\'ai failli en avaler ma craie.',
  'Ta copie part au rectorat dès ce soir.',
  'J\'appelle ta mère. En bien, pour une fois.',
  'Le radiateur lui-même s\'est arrêté de claquer.',
  'Toute la classe s\'est levée. Même ceux du fond.',
  'Je raconterai ça à ma retraite. Tous les ans.',
  'Je vais devoir m\'asseoir sur le bureau. Voilà. C\'est fait.',
];

export const PRAISES_BIG = [
  'Voilà. VOILÀ.',
  'Ça, c\'est un mot.',
  'J\'en lâche ma craie.',
  'Toute la classe s\'est retournée. Moi aussi.',
  'On note celui-là au tableau d\'honneur.',
  'Même l\'inspecteur aurait applaudi.',
  'Je n\'ai rien à redire. C\'est rare. Savoure.',
];

export const PRAISES_SMALL = [
  'Bravo.',
  'Tu vois, quand tu fais des efforts.',
  'C\'est déjà mieux.',
  'Note-le, je vais le relire ce soir.',
  'Ce n\'est pas si compliqué, hein ?',
  'Enfin un mot juste.',
  'Note-le, ça n\'arrivera pas deux fois.',
  'Tes parents seront contents.',
  'Je reprends espoir. Un peu.',
  'Tiens donc.',
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
  'Je note ce mot. Et je note ton nom à côté.',
];

export const DUPLICATES = [
  'Encore lui ? Vous vous êtes attachés ?',
  'Deux fois le même mot. Deux fois.',
  'Ce mot et toi, c\'est une longue histoire.',
  'Tu tournes en rond, mon pauvre.',
];

export const TOO_SHORT = [
  'Trois lettres minimum, tu le sais très bien.',
  'C\'est un peu court, jeune homme.',
  'Deux lettres. Deux. Tu te moques de moi ?',
];

// Stable pour un même feedback : la réplique ne change pas sous les yeux du joueur.
export function scold(list: readonly string[], seed: number): string {
  return list[(seed * 7919) % list.length];
}

// L'appréciation du bulletin, au stylo rouge. `ratio` = note obtenue / note attendue.
export function appreciation(ratio: number, success: boolean, lives: number): string {
  if (!success && lives <= 1) return 'Alarmant. Je convoque les parents dès lundi.';
  if (!success && ratio >= 0.8) return 'Si près. C\'est rageant, pour toi comme pour moi.';
  if (!success) return 'Insuffisant. J\'ai relu trois fois en espérant m\'être trompée.';
  if (ratio >= 2.5) return 'Exceptionnel. Je n\'avais pas vu ça depuis 1987.';
  if (ratio >= 1.8) return 'Très bon travail. Voilà ce que j\'attends de toi.';
  if (ratio >= 1.3) return 'Bon travail. J\'ai souri. Ne le répète à personne.';
  if (ratio >= 1.1) return 'Correct. Mais tu peux mieux faire, nous le savons tous les deux.';
  return 'Juste, tout juste. J\'avais déjà décapuchonné le stylo rouge.';
}

export const SIGNATURE = 'La maîtresse';

// Bulletin de fin d'année : chaque dictée vaut une note sur 20 (atteindre la note = 10/20).
export function noteSur20(score: number, threshold: number): number {
  return Math.max(0, Math.min(20, Math.round((score / Math.max(1, threshold)) * 10)));
}

export function mention(moyenne: number, victory: boolean): { label: string; note: string } {
  if (!victory) return { label: 'Redoublement', note: 'L\'année est à refaire. Ce n\'est pas une punition, c\'est une seconde chance.' };
  if (moyenne >= 18) return { label: 'Félicitations du conseil', note: 'Une année d\'anthologie. Le tableau d\'honneur ne suffira pas.' };
  if (moyenne >= 15) return { label: 'Mention très bien', note: 'Travail remarquable et constant. Passage en CM1 sans discussion.' };
  if (moyenne >= 12) return { label: 'Mention bien', note: 'Bonne année scolaire. Quelques étourderies sans gravité.' };
  if (moyenne >= 10) return { label: 'Mention assez bien', note: 'Des hauts, des bas, mais le compte y est.' };
  return { label: 'Passage de justesse', note: 'Le conseil a hésité. Longtemps. Ne le décevons pas l\'an prochain.' };
}

// Monnaie : les billes. `short` pour les pastilles étroites.
export function money(n: number, short = false): string {
  if (short) return `${n} b.`;
  return `${n} ${Math.abs(n) === 1 ? 'bille' : 'billes'}`;
}

export const RARITY_LABEL = { common: 'Courant', rare: 'Rare', legendary: 'Trésor' } as const;

// Avant une dictée sur deux : la maîtresse hésite au tableau, et c'est toi qui tranches.
export const LESSON_SCENES = [
  {
    title: 'La maîtresse hésite',
    lines: [
      'Craie levée, immobile depuis une minute entière. Deux idées, aucune bonne pour toi.',
      'Elle se retourne lentement et te regarde. Toi. Pourquoi toi ?',
    ],
  },
  {
    title: 'Le vote de la classe',
    lines: [
      '« Puisque personne ne se décide », soupire-t-elle, « on va voter. »',
      'Vingt-cinq mains restent baissées. Vingt-cinq regards se tournent vers toi.',
    ],
  },
  {
    title: 'Le programme officiel',
    lines: [
      'Elle feuillette un document corné, tamponné trois fois, signé par un ministre mort.',
      '« Le programme prévoit l\'une ou l\'autre. Il ne dit pas laquelle. » Elle referme. Elle attend.',
    ],
  },
  {
    title: 'Il est 14 h 03',
    lines: [
      'L\'heure la plus lourde de la journée. Le radiateur claque. Quelqu\'un renifle au fond.',
      'Elle pose deux craies sur le bureau, une dans chaque main, et hausse les sourcils.',
    ],
  },
  {
    title: 'Elle a mal dormi',
    lines: [
      'Ça se voit. Elle a fait trois fautes au tableau ce matin et n\'en a corrigé aucune.',
      '« Choisis, toi. Moi, aujourd\'hui, je ne peux plus. » Elle s\'assoit sans attendre.',
    ],
  },
  {
    title: 'Le directeur passe dans le couloir',
    lines: [
      'On entend ses chaussures. Elle se redresse d\'un coup et improvise.',
      '« Alors aujourd\'hui, les enfants, nous allons faire… » Elle te fixe, suppliante.',
    ],
  },
] as const;

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
