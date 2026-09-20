// Univers « La Dictée » : une école communale, encre violette et bons points…
// … racontée comme si le sort du monde en dépendait. Le décalage est le ton du jeu.
// Tout le vocabulaire visible passe par ici ; les ids et le moteur gardent leurs noms techniques.

// L'élève a un prénom et un genre : tous les textes s'accordent.
// Dans les chaînes, {nom} est remplacé par le prénom et [masculin|féminin] par la bonne forme.
export type Gender = 'm' | 'f';
export interface Profile {
  salut: string;    // comment tu dis bonjour
  phrase: string;   // ta phrase fétiche
  cour: string;     // ce que tu fais le plus dans la cour
  heros: string;    // ton personnage préféré
  plat: string;
  horreur: string;
  metier: string;   // ce que tu veux faire plus tard
  chanson: string;  // ta chanson préférée
  admire: string;   // la personne que tu admires le plus, telle qu'on la nomme (« ma grand-mère », « Papa »)
  surnom: string;   // le surnom qu'on te donne
  rigolo: string;   // un mot rigolo, qui devient le nom de famille de la maîtresse
  adjectif: string; // un adjectif
  nombre: string;   // un nombre, gardé tel quel
  action: string;   // une action, à l'infinitif
  cri: string;      // ce que tu cries si une araignée te grimpe sur la jambe
}
export interface Identity { name: string; gender: Gender; profile: Profile }

export const DEFAULT_PROFILE: Profile = {
  salut: 'Salut la compagnie',
  phrase: 'C\'est pas faux',
  cour: 'des parties de foot',
  heros: 'Pikachu',
  plat: 'les pâtes au beurre',
  horreur: 'les endives',
  metier: 'pompier',
  chanson: 'Alouette',
  admire: 'ma grand-mère',
  surnom: 'Toto',
  rigolo: 'schtroumpf',
  adjectif: 'gluant',
  nombre: 'douze',
  action: 'sauter partout',
  cri: 'AAAAAH',
};
export const DEFAULT_IDENTITY: Identity = { name: 'Camille', gender: 'f', profile: DEFAULT_PROFILE };

// Réponses de secours pour le bouton « Surprends-moi » de la fiche de renseignements.
export const PROFILE_IDEAS: Record<keyof Profile, string[]> = {
  salut: ['Salut la compagnie', 'Wesh', 'Bonjour à tous', 'Yo', 'Coucou les amis'],
  phrase: ['C\'est pas faux', 'Tranquille', 'Même pas mal', 'Ah ouais quand même', 'Ça passe crème'],
  cour: ['des parties de foot', 'des courses poursuites', 'rien du tout', 'des échanges de cartes', 'le mur des billes'],
  heros: ['Pikachu', 'Goku', 'Titeuf', 'Sangoku', 'Astérix', 'Bob l\'éponge'],
  plat: ['les pâtes au beurre', 'les frites', 'le gratin de mamie', 'les nuggets', 'la purée'],
  horreur: ['les endives', 'le poisson pané', 'la soupe froide', 'les épinards', 'le chou-fleur'],
  metier: ['pompier', 'vétérinaire', 'astronaute', 'youtubeur', 'boulanger', 'président'],
  chanson: ['Alouette', 'Frère Jacques', 'l\'hymne de l\'école', 'la chanson du générique', 'Petit Papa Noël'],
  admire: ['ma grand-mère', 'mon grand frère', 'Papa', 'ma grande sœur', 'mon oncle', 'Maman'],
  surnom: ['Toto', 'Bibou', 'le Chef', 'Crevette', 'Bouboule', 'Mimi'],
  rigolo: ['schtroumpf', 'bidule', 'patate', 'zigouigoui', 'plouf', 'gloubiboulga'],
  adjectif: ['gluant', 'majestueux', 'mou', 'terrible', 'collant', 'phénoménal'],
  nombre: ['douze', 'quarante-deux', 'trois', 'mille', 'sept', 'cent'],
  action: ['sauter partout', 'courir dans les couloirs', 'faire du vélo', 'crier très fort', 'grimper aux arbres'],
  cri: ['AAAAAH', 'AU SECOURS', 'MAMAN', 'NON NON NON', 'ENLEVEZ-LA'],
};

// {nom} pour le prénom, {salut} {phrase} {cour} {heros} {plat} {horreur} {metier} {chanson}
// {admire} {surnom} pour la fiche, [masculin|féminin] pour les accords.
// Un jeton écrit avec une majuscule ({Admire}) sort avec une majuscule : pratique en début de phrase.
const capitalize = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);

export function say(text: string, id: Identity | null | undefined): string {
  const who = id ?? DEFAULT_IDENTITY;
  const profile = { ...DEFAULT_PROFILE, ...who.profile };
    // Le mot rigolo sert de patronyme de famille : la maîtresse et le directeur le portent tous les deux.
  const family = capitalize(profile.rigolo);
  const values: Record<string, string> = {
    ...profile, nom: who.name,
    maitresse: `Madame ${family}`,
    directeur: `Monsieur ${family}`,
  };
  return text
    .replace(/\[([^\]|]*)\|([^\]]*)\]/g, (_m, masc, fem) => (who.gender === 'f' ? fem : masc))
    .replace(/\{([A-Za-z]+)\}/g, (whole, key: string) => {
      const lower = key.toLowerCase();
      const value = values[lower];
      if (value === undefined) return whole;
      return key[0] === key[0].toUpperCase() ? capitalize(value) : value;
    });
}

export const GAME_TITLE = 'Rogue Boggle Warrior';
export const GAME_SUBTITLE = 'Ultimate Dictée de CE2 Edition';
// Les critiques de la presse spécialisée, affichées sous le pitch.
export const BLURBS = [
  { text: 'Un jeu à couper le souffle.', source: 'Le Bulletin de l\'École Communale' },
  { text: 'Le Elden Ring du Boggle.', source: 'Lili, CE2' },
];

// Juste avant la dictée, l'élève se parle à lui-même. Il a huit ans et il pense à l'honneur des siens.
export const MONOLOGUE = [
  'Si je perds, ce sera une honte pour toute ma famille. Pendant au moins mille ans !',
  'Chaque seconde de ma vie m\'a men[é|ée] vers cet instant. En voici la conclusion.',
  'Je suis prêt[|e] à tout pour réussir le CE2. Même à pousser mon petit frère dans les orties.',
  'Les yeux de la maîtresse sont rouges de sang. Elle ne fera aucun cadeau.',
  'Ils ont tous ri quand j\'ai écrit NÉNUPHAR. Plus personne ne rira.',
  'Mon stylo pèse trois grammes. Aujourd\'hui il en pèse mille, et mes doigts tremblent sous le poids du destin.',
  'Je n\'ai pas dormi. Dormir, c\'est pour les faibles. J\'ai récité. Toute la nuit, j\'ai récité.',
  'Si je tombe ici, personne ne se souviendra de mon nom, {nom}. Même mes parents m\'oublieront.',
  'Le CM1 ne pardonne pas. Le CM1 n\'attend personne. Le CM1 est la lumière.',
  'Ma mère m\'a dit de faire de mon mieux. Je suis prêt[|e] à donner ma vie pour cette épreuve du destin.',
  'Kévin me regarde. Il veut me voir échouer. Qu\'il regarde. Il verra ce que je vaux.',
  'Comme dit {heros} : le destin frappe à ma porte, et je dois relever le défi.',
  'Si je tombe ici, je ne serai jamais {metier}. Je serai un souvenir.',
  '{Admire}. Regarde-moi bien. Je ne te ferai pas honte.',
  'Dans ma tête, {chanson} tourne en boucle depuis ce matin. Ça m\'aide. Je crois.',
  '{Cri} ! Non. Pas maintenant. Concentre-toi.',
  'J\'ai compté {nombre} respirations. À la prochaine, je commence.',
  'Après ça, j\'aurai le droit de {action}. Après ça seulement.',
  'Quand j\'aurai fini, je me lèverai et je dirai simplement : {phrase}.',
  'Si je rate, ce soir il y aura {horreur} sur la table. Et le silence. Surtout le silence.',
  'Un jour je serai {metier}. Ce jour-là, j\'aurai {cour} tous les jours de ma vie.',
  'Regarde-moi bien, {admire}. Ce que tu vas voir est {adjectif}.',
  'Je me lèverai, je crierai « {cri} », et la classe comprendra enfin.',
  'Reprends-toi ! Ce ne sont que des dictées ! Tu peux y arriver ! Rien ne pourra nous arrêter ! On est ven[u|ue]s là pour briller !',
];

export const TAGLINE = 'La maîtresse a préparé onze dictées. Sauras-tu accomplir ton destin et passer en CM1 ?';

export const L = {
  manche: 'Dictée',
  seuil: 'Note à atteindre',
  vies: 'Bons points',
  grille: 'Feuille',
  euros: 'Billes',
  boutique: 'La coopérative',
  boutiqueSub: '{maitresse} a le dos tourné. Le marché noir de la coopérative est ouvert : on y échange tout, sauf {horreur}.',
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
  victoireSub: 'Le CM1. Puis le CM2. Puis {metier}. Tu sors dans la cour, tu cries « {salut} » à personne en particulier, et ce soir il y a {plat}.',
  gameover: 'Redoublement.',
  gameoverSub: (n: number) => `Tu as crié « {cri} » en voyant la note de {maitresse}. La dictée ${n} a eu raison de toi. Tes parents sont convoqués, et ce soir, au dîner, il y a {horreur}.`,
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
  relicDepartSub: 'Toute la classe est là, et {maitresse} vous attend. On ne change pas de peau en cours d\'année : choisis bien.',
  pretClassique: 'Dictée classique. Rien que toi, la feuille, et {maitresse}, qui croit encore aux règles.',
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
  'Qu\'est-ce que tu m\'as encore écrit, {nom} ?',
  'Tu n\'as rien dans la tête ou quoi ?',
  'Mais qu\'est-ce qu\'on va faire de toi, {nom}…',
  'J\'ai vérifié dans trois dictionnaires. Trois.',
  'C\'est du français, ça ?',
  'Je vais faire comme si je n\'avais rien vu.',
  'Ton voisin fait moins de fautes. Et il dort.',
  'Molière s\'est retourné. J\'ai entendu le bruit.',
  'Non, {nom}. Non non non.',
  'Tu inventes des mots maintenant ?',
  'Mon stylo rouge n\'a plus d\'encre. À cause de toi.',
  'J\'ai fait sept ans d\'études pour lire ça.',
  'Même le radiateur a honte.',
  'Tu écris comme on jette des cailloux, {nom}.',
  'Arrête de chantonner {chanson}, on t\'entend jusqu\'au fond du couloir.',
  'Tu as gribouillé « {rigolo} » dans la marge. Je l\'ai vu. Nous en reparlerons.',
  'Tu as crié « {cri} » en découvrant ce mot. Toute la classe l\'a entendu.',
  'Tu préférerais {action}, je sais. Écris d\'abord.',
  'Ce mot est {adjectif}. Et ce n\'est pas un compliment.',
  '{nom}, tu es vraiment {adjectif} ce matin !',
  'Que dirait {admire} en voyant ça ?',
  'Cette copie a exactement le même goût que {horreur}.',
  'Tu as marmonné « {phrase} » en traçant ça. Ce n\'est pas une excuse.',
  'Ton cerveau est resté sur {cour}. Pas sur les consonnes doubles.',
  'Tu fredonnais {chanson} pendant la dictée. Je l\'ai entendu. Tout le monde l\'a entendu.',
  'Ici, personne ne t\'appelle {surnom}. Ici, tu as un nom et une copie.',
  'Et tu voulais être {metier}. Avec ça.',
  'On n\'entre pas dans ma classe en criant « {salut} ».',
  'Le dictionnaire vient de claquer tout seul.',
  'Sors. Non, reste. Non, sors.',
  'J\'ai rêvé de cette faute cette nuit. Je le jure.',
  'Ce mot me donne des palpitations.',
];

// Les très gros mots la font sortir de ses gonds. Dans le bon sens.
export const PRAISES_HUGE = [
  'C\'est tellement bien que j\'en suis tombée de ma chaise.',
  'J\'ai dû m\'asseoir. Sur le sol, il n\'y avait plus de chaise.',
  'On encadre ta copie dans le couloir. Ce soir. Merci, {nom}.',
  'J\'ai les larmes aux yeux. Et ce n\'est pas la craie.',
  'Je photocopie ça pour la salle des profs.',
  'Vingt-six ans de carrière, {nom}. Vingt-six.',
  'J\'ai failli en avaler ma craie.',
  'Même {heros} n\'aurait pas trouvé ça.',
  'Ta copie part au rectorat dès ce soir.',
  'J\'appelle ta mère. En bien, pour une fois.',
  'Le radiateur lui-même s\'est arrêté de claquer.',
  'Toute la classe s\'est levée. Même ceux du fond.',
  'Je raconterai ça à ma retraite. Tous les ans.',
  'Je vais devoir m\'asseoir sur le bureau. Voilà. C\'est fait.',
];

export const PRAISES_BIG = [
  'Voilà, {nom}. VOILÀ.',
  'Ça, {nom}, c\'est un mot.',
  'J\'en lâche ma craie.',
  'Toute la classe s\'est retournée. Moi aussi.',
  'On note celui-là au tableau d\'honneur.',
  'Même l\'inspecteur aurait applaudi.',
  'Je n\'ai rien à redire. C\'est rare. Savoure.',
  'Ce soir, tu mérites ça : {plat}.',
  'Voilà une copie de futur {metier}.',
  'Ça, c\'est {adjectif}. Au sens noble du terme.',
  'Va montrer ça à {admire} ce soir. Insiste.',
  'Tu as murmuré « {phrase} » en le traçant. Je l\'ai entendu.',
];

export const PRAISES_SMALL = [
  'Bravo, {nom}.',
  'Tu vois, {nom}, quand tu fais des efforts.',
  'C\'est déjà mieux.',
  'Note-le, je vais le relire ce soir.',
  'Ce n\'est pas si compliqué, hein ?',
  'Enfin un mot juste.',
  'Note-le, ça n\'arrivera pas deux fois.',
  'Tes parents seront contents, {nom}.',
  'Je reprends espoir. Un peu.',
  'Encore {nombre} comme celui-là et je te laisse {action}.',
  'Écris ça sur un papier, montre-le à {admire}.',
  'Un mot propre. Pas comme « {rigolo} », tiens.',
  'Continue et je te sers {plat} moi-même.',
  'Tiens donc.',
  'Pour ça, tu mérites {plat}. Une petite portion.',
];

// Quand tu sors un mot que personne dans la classe ne connaît, elle se méfie.
export const SUSPICIONS = [
  'Tu connais ce mot, toi ?',
  'Tu triches ou quoi ?',
  'Où as-tu appris ça, {nom} ?',
  'Ce mot n\'est pas de ton âge.',
  'Tu as lu le dictionnaire en cachette ?',
  'Je vais vérifier, tiens.',
  'Personne dans cette classe ne connaît ce mot. Personne.',
  'C\'est ton grand frère qui t\'a soufflé ?',
  'C\'est {heros} qui t\'a soufflé, peut-être ?',
  'Répète-le pour voir. Sans regarder.',
  'Ce mot me fait penser à « {rigolo} ». Et ça, ça ne me rassure pas.',
  'Tu as appris ça où ? Certainement pas devant une assiette pleine de courage et {horreur}.',
  'Je note ce mot. Et j\'écris {nom} juste à côté.',
];

export const DUPLICATES = [
  'Encore lui ? Vous vous êtes attachés ?',
  'Deux fois le même mot. Deux fois.',
  'Ce mot et toi, c\'est une longue histoire.',
  'Tu radotes comme {heros} dans son dessin animé.',
  'Tu tournes en rond, {nom}.',
];

export const TOO_SHORT = [
  'Trois lettres minimum, tu le sais très bien.',
  'C\'est un peu court, jeune [homme|fille].',
  'Deux lettres. Deux. Tu te moques de moi ?',
];

// Stable pour un même feedback : la réplique ne change pas sous les yeux du joueur.
export function scold(list: readonly string[], seed: number): string {
  return list[(seed * 7919) % list.length];
}

// L'appréciation du bulletin, au stylo rouge. `ratio` = note obtenue / note attendue.
// L'appréciation n'est jamais neutre : ou elle est vacharde, ou elle est inquiétante d'affection.
// Le score sert d'index : la même copie donne toujours la même phrase.
export const APPRECIATIONS: Record<string, string[]> = {
  fatal: [
    '{nom}, je convoque tes parents lundi. Nous parlerons de ton avenir, s\'il y en a un.',
    'À ce stade je ne corrige plus, je constate. Ce soir : {horreur}.',
    'J\'ai gardé ta copie. Pas pour l\'encadrer. {Admire} peut venir la voir quand elle veut.',
    'Tu repenseras à cette copie toute ta vie, et ta vie sera courte.',
    'J\'ai prévenu la maîtresse de CE2 de l\'an prochain. Elle a demandé une mutation.',
    'Ce soir, ni {plat} ni dessert. Ce soir, on révise.',
    '{metier}, disais-tu ? Nous en reparlerons à la fin de l\'année.',
  ],
  presque: [
    'Si près. J\'ai failli arrondir, puis j\'ai repensé à ce « {cri} » que tu as poussé mardi.',
    'Deux points. Deux. Ce soir c\'est {horreur}, et tu l\'auras mérité.',
    'Tu y étais presque, et c\'est encore pire que si tu avais été loin.',
    'À un cheveu. Même {heros} aurait grimacé.',
    'La prochaine fois, arrête de regarder la pendule. Elle ne t\'aime pas.',
  ],
  rate: [
    'J\'ai relu trois fois en espérant m\'être trompée. Je ne me trompe jamais.',
    'Ce n\'est rien. Ce soir tu mangeras {horreur} et demain tu recommenceras, comme tout le monde.',
    'Tu trouveras ta voie. Elle sera manuelle, mais tu la trouveras.',
    '{Horreur}. Voilà exactement ce que ta copie m\'évoque.',
    'J\'ai montré ta copie en salle des maîtres. Personne n\'a ri. Le silence était pire.',
    'Tu as passé l\'année sur {cour}. Voilà le résultat, {nom}.',
    'Je préviendrai {admire}. Quelqu\'un doit savoir.',
    'Kévin a fait mieux. Kévin n\'a pas de stylo.',
    'Je range cette copie dans le tiroir du bas. Celui qui ferme à clé.',
    '{Nombre} fautes. J\'ai arrêté de compter après, d\'ailleurs.',
  ],
  prodige: [
    'Je vais encadrer cette copie et l\'accrocher dans mon salon, au-dessus du buffet.',
    'C\'est le plus beau jour de ma vie. J\'ai appelé ma sœur pendant la récréation.',
    'J\'aimerais que tu sois [mon fils|ma fille], {nom}. Ne le répète pas à ta mère.',
    'Je n\'avais pas vu ça depuis 1987. Cet élève-là a mal fini, mais quel talent.',
    'Ce soir je cuisine {plat} pour toute ma famille, et je leur raconterai ta copie.',
    'Tu seras {metier}, et tu seras le meilleur. Je l\'écris ici, noir sur rouge.',
    'Préviens {admire}. Non, laisse, je préviendrai {admire} moi-même.',
    'J\'ai pleuré dans la réserve. Ne dis rien à personne, {nom}.',
    'C\'est {adjectif}. J\'ai cherché un autre mot pendant {nombre} minutes, il n\'y en a pas.',
    'Même {heros} peut aller se rhabiller.',
  ],
  suspect: [
    'Trop beau, {nom}. Je ne sais pas encore comment tu as fait, mais je le saurai.',
    'Excellent. Un peu trop, même. Un futur {metier} ne devrait pas écrire comme ça.',
    'Superbe. J\'ai photographié ta copie, pour mes archives personnelles.',
    'Personne n\'écrit ça à ton âge, {nom}. Personne. Nous en reparlerons toi et moi.',
    'Remarquable. Tu me diras un jour qui te souffle. {heros}, peut-être ?',
    'Je t\'ai regardé[|e] pendant toute la dictée. Je n\'ai rien vu. Ça m\'inquiète.',
  ],
  bien: [
    'Bon travail. J\'ai souri, et ça ne m\'était pas arrivé depuis des années.',
    'C\'est bien. Étrangement bien. Tu avais les yeux baissés tout le long.',
    'Très bonne copie, {adjectif} même. J\'ai vérifié deux fois, par acquit de conscience.',
    'Voilà du travail sérieux. Continue et je t\'invite à manger {plat}.',
    'Bien. Tu vois ce qui arrive quand tu oublies {cour} pendant cinq minutes ?',
    'Voilà ce qu\'on raconte à {admire} en rentrant.',
    'C\'est propre, c\'est juste, et tu fredonnais {chanson} en le faisant. Agaçant.',
  ],
  correct: [
    'Correct, {nom}. Nous savons tous les deux que tu peux mieux faire, et que tu ne le feras pas.',
    'Passable. Ta voisine a fait mieux, et elle veut être {metier} elle aussi.',
    'Acceptable. {Admire} aurait fait mieux, et tu le sais.',
    'Ça ira, {nom}. Ça ira, mais tu rêvais de {action}, et ça se voit.',
    'Un travail {adjectif}. Je te laisse décider si c\'est bien, futur {metier}.',
    'Moyen. Comme la purée de la cantine, et avec autant de saveur.',
    'Tu as fait le minimum. Ce soir, {plat}, mais sans dessert.',
  ],
  justesse: [
    'Juste, tout juste, {nom}. Un point de moins et je remplissais ton carnet de correspondance.',
    'Tu passes. Ce soir, {plat}. Demain, on recommence, et je serai moins généreuse.',
    'De justesse. J\'ai hésité longtemps, et j\'hésite encore.',
    'Tu as dû dire « {phrase} » en rendant ta copie. Tu avais tort.',
    'Un point de plus et je te félicitais. Un point de moins et j\'appelais chez toi.',
    'Tu as eu chaud, et moi aussi. Va {action}, tu l\'as mérité de justesse.',
    'Il s\'en est fallu de {nombre} points. Ou pas loin. Je n\'ai pas recompté.',
  ],
};

function band(ratio: number, success: boolean, lives: number): keyof typeof APPRECIATIONS {
  if (!success && lives <= 1) return 'fatal';
  if (!success && ratio >= 0.8) return 'presque';
  if (!success) return 'rate';
  if (ratio >= 2.5) return 'prodige';
  if (ratio >= 1.8) return 'suspect';
  if (ratio >= 1.3) return 'bien';
  if (ratio >= 1.1) return 'correct';
  return 'justesse';
}

// Une appréciation jamais servie cette année : même avec des notes identiques, elle se renouvelle.
export function pickAppreciation(ratio: number, success: boolean, lives: number, used: readonly string[], seed: number): string {
  const pool = APPRECIATIONS[band(ratio, success, lives)];
  const fresh = pool.filter((t) => !used.includes(t));
  const list = fresh.length ? fresh : pool;
  return list[Math.abs(Math.round(seed * 7 + ratio * 100)) % list.length];
}

export const SIGNATURE = '{maitresse}';

// Bulletin de fin d'année : chaque dictée vaut une note sur 20 (atteindre la note = 10/20).
export function noteSur20(score: number, threshold: number): number {
  return Math.max(0, Math.min(20, Math.round((score / Math.max(1, threshold)) * 10)));
}

export function mention(moyenne: number, victory: boolean): { label: string; note: string } {
  if (!victory) return { label: 'Redoublement', note: 'L\'année est à refaire. Le conseil a noté ton projet de devenir {metier}. Le conseil n\'a rien dit de plus.' };
  if (moyenne >= 18) return { label: 'Félicitations du conseil', note: 'Une année d\'anthologie. Le tableau d\'honneur ne suffira pas, et {metier} te va très bien.' };
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

// La première visite à la coopérative, une fois par année scolaire.
export const SHOP_INTRO = {
  title: 'La coopérative',
  lines: [
    'Au fond du couloir, une porte que tu n\'avais jamais remarquée. Elle est entrouverte.',
    'Derrière : un comptoir, des étagères jusqu\'au plafond, et Mathieu.',
    'Mathieu tient la caisse depuis le CP. Personne ne sait pourquoi. Personne ne demande.',
    'Sur l\'étagère du haut, des gommettes {heros}. Il jure qu\'elles portent chance. Il jure beaucoup.',
    'Sur le comptoir, un bocal d\'étiquettes où quelqu\'un a écrit « {rigolo} ». Mathieu ne commente pas.',
    '« Tu as des billes ? »',
  ],
  ask: 'Ici tout s\'achète : les fournitures, les gommettes, et même les punitions, si tu es de ce genre-là.',
  cta: 'Sortir ses billes',
} as const;

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
      'Deux redoublements, dit la légende. Il a connu trois maîtresses et vu {nombre} élèves craquer à cet endroit précis.',
      'Il te barre la route, te toise, et lâche : « De mon temps, on ne disait pas {salut}. De mon temps, on récitait {chanson} debout. »',
      'Puis il te tend une feuille griffonnée :',
    ],
    ask: (n: number) => `— Un mot de ${n} lettres dort dans cette feuille, petit. Les lettres sont là, en clair. Retrouve le chemin.`,
    hint: 'Le sage soupire et pointe la case de départ.',
    wrong: 'Le sage fronce les sourcils.',
    won: 'Le sage hoche lentement la tête et murmure : « {phrase} ».',
    wonSub: '— Tu iras loin, {surnom}. Plus loin que moi. Tu seras {metier}, je le sens.',
    lost: 'Le sage efface la feuille d\'un revers de manche.',
    lostSub: '— Reviens me voir quand tu sauras. D\'ici là, va {action}, c\'est de ton âge.',
    start: 'Je regarde la feuille',
    giveUp: 'Je donne ma langue au chat',
    leave: 'Reprendre le couloir',
  },
  kevin: {
    title: 'Kévin te barre le couloir',
    intro: [
      'Il t\'attendait. Il a même prévu une feuille, ce qui ne lui ressemble pas.',
      'Depuis la rentrée il copie sur toi, et depuis la rentrée ça ne lui suffit plus.',
      'Il plaque la feuille contre le mur et pose un mot dessus, bien fort, pour que le couloir entende.',
    ],
    ask: (n: number) => `— Alors, {surnom} ? Ce mot fait ${n} lettres. Tu le trouves, ou tout le couloir saura que tu n\'es rien sans ta maîtresse.`,
    hint: 'Il soupire et tapote la feuille du doigt, là où le mot commence.',
    wrong: 'Il ricane. Deux CM1 se sont arrêtés pour regarder.',
    won: 'Kévin recule d\'un pas. Il ne ricane plus du tout, {nom}.',
    wonSub: '— Coup de chance. Va manger {plat} et profites-en, on se revoit à la prochaine dictée.',
    lost: 'Kévin plie la feuille en quatre et la met dans sa poche.',
    lostSub: '— Je la garde. Et j\'écris « {surnom} » dessus, au cas où on oublierait.',
    start: 'Relever le défi',
    giveUp: 'Lui laisser le couloir',
    leave: 'Rentrer en classe',
  },
  inspecteur: {
    title: 'L\'inspecteur d\'académie',
    intro: [
      'La porte s\'ouvre sans frapper. Un costume gris. Un carnet.',
      'La maîtresse blêmit. Vingt-six élèves cessent de respirer. Il te désigne du menton.',
      'Il ouvre son carnet, décapuchonne son stylo, et prononce un mot :',
    ],
    ask: (_n: number) => 'Trouve-le dans la feuille. Toute la classe te regarde.',
    hint: 'Il tapote la table, agacé, à l\'endroit où commence le mot.',
    wrong: 'Il note un seul mot dans son carnet : {adjectif}.',
    won: 'Il referme son carnet. Un silence. Puis, presque un sourire.',
    wonSub: '— Voilà une classe bien tenue, {maitresse}. Cet élève ira loin.',
    lost: 'Il note. Il souligne. Il note encore.',
    lostSub: '— Nous en reparlerons à la commission, {maitresse}. Avec le mot « {adjectif} » dans le rapport.',
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
    ask: () => 'Prends une chose. Une seule. Et cours, comme si tu allais {action}.',
    take: 'Prendre et filer',
    won: 'Tu refermes la porte sans un bruit.',
    wonSub: 'Le concierge passe en sifflant {chanson}. Il ne saura jamais.',
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
      'Sur le sac de l\'un d\'eux, un autocollant {heros} à moitié décollé. Ça te donne du courage.',
    ],
    ask: () => 'Combien tu mises, {surnom} ?',
    goal: (n: number) => `Trouve ${n} mots avant la fin`,
    hint: '', wrong: '',
    won: 'Le cercle explose de cris.',
    wonSub: 'Tu ramasses la mise. Double. Tu cries « {salut} » à toute la cour.',
    lost: 'Silence. Puis les rires.',
    lostSub: 'Tes billes changent de poche. C\'était la règle. {Admire} n\'en saura rien.',
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
    wonSub: '{Maitresse} note quelque chose. Cette fois, c\'est bon signe. Ce soir, c\'est {plat} pour toi.',
    lost: 'La classe applaudit mollement.',
    lostSub: 'On a connu des récitations plus longues. Kévin a soufflé « {rigolo} » au deuxième vers.',
    start: 'Monter sur l\'estrade',
    giveUp: 'Descendre de l\'estrade',
    leave: 'Regagner sa place',
  },
} as const;
