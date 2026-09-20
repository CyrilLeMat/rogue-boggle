// L'épilogue : ce que devient tout le monde, une fois la dernière dictée rendue.
// Même règle que les planches de transition — on monte très haut, et la dernière ligne
// remet tout le monde à sa place. Les jetons de la fiche passent par say() comme ailleurs.

import { VOW } from './lexicon';

export interface EpilogueInput {
  victory: boolean;
  moyenne: number;         // sur 20
  lives: number;
  duelDone: boolean;       // l'affrontement a eu lieu
  duelWon: boolean;
  stolen: string | null;   // le nom de ce que {rival} garde, s'il le garde
  words: number;
  bestWord: string | null;
  manche: number;          // la dictée où l'année s'est arrêtée
}

// Trois actes, trois clics : le dernier jour, ce que les autres deviennent, ce que tu deviens.
// Tout d'un bloc, personne ne lisait la fin.
export interface EpilogueBeat { text: string; kind?: 'quote' | 'fall'; act: 1 | 2 | 3 }

export const EPILOGUE_ACTS = [
  { title: 'Le dernier jour', cta: 'Et les autres ?' },
  { title: 'Ce que tout le monde devient', cta: 'Et toi ?' },
  { title: 'Trente ans plus tard', cta: '' },
] as const;

// Le dernier jour, le même pour tout le monde, sauf qu'il ne veut pas dire la même chose.
function lastDay(i: EpilogueInput): EpilogueBeat[] {
  return i.victory
    ? [{ act: 1, text: 'Le dernier jour de CE2 tombe un mardi. Il fait vingt-huit degrés dans la classe et plus personne ne fait semblant de travailler.' }]
    : [
      { act: 1, text: `Tu as crié « {cri} » en voyant la note de {maitresse}. La dictée ${i.manche} a eu raison de toi, et tes parents sont convoqués.` },
      { act: 1, text: 'Le dernier jour de CE2 tombe un mardi. Tu le passeras deux fois.' },
    ];
}

// Ce qu'elle écrit au dos du bulletin, quand elle croit que personne ne la lit.
function teacher(i: EpilogueInput): EpilogueBeat[] {
  if (!i.victory) {
    return [
      { act: 1, text: '{Maitresse} remplit la case « appréciation générale » sans lever le stylo. Elle a fini avant toi.' },
      { act: 1, text: 'Une année, ce n\'est rien. Je t\'attends en septembre, à la même place, et cette fois nous irons jusqu\'au bout. J\'ai tout mon temps, {nom}.', kind: 'quote' },
    ];
  }
  if (i.moyenne >= 16) {
    return [
      { act: 1, text: '{Maitresse} écrit trois lignes serrées dans la case « appréciation générale », puis une flèche, puis elle continue au dos.' },
      { act: 1, text: 'Je n\'ai rien à ajouter. J\'ajoute quand même : ne change pas, et n\'oublie pas qui t\'a appris à écrire.', kind: 'quote' },
    ];
  }
  if (i.moyenne >= 12) {
    return [
      { act: 1, text: '{Maitresse} relit ta copie une dernière fois, à la lumière de la fenêtre, comme on vérifie un billet de banque.' },
      { act: 1, text: 'Année honorable. Peut mieux faire, mais tout le monde peut mieux faire, moi la première.', kind: 'quote' },
    ];
  }
  return [
    { act: 1, text: '{Maitresse} hésite longtemps devant la case « appréciation générale », puis écrit une phrase, la rature, et en écrit une autre.' },
    { act: 1, text: 'Passe. Passe, et va vivre ta vie loin de cette salle. Ce n\'est pas un reproche. Enfin, pas seulement.', kind: 'quote' },
  ];
}

// Kévin : ce qu'il devient dépend uniquement de ce qui s'est passé entre vous.
function kevin(i: EpilogueInput): EpilogueBeat {
  if (!i.duelDone) {
    return { act: 2, text: '{rival}, lui, passe en CM1. Il n\'a pas eu à se forcer : il a copié sur quelqu\'un d\'autre, et ce quelqu\'un d\'autre n\'a rien dit.' };
  }
  if (i.duelWon) {
    return { act: 2, text: '{rival} n\'a plus jamais copié sur personne. On raconte dans la cour qu\'il s\'est mis à réviser le soir. On raconte n\'importe quoi dans cette cour, mais cette fois-là c\'était vrai.' };
  }
  return i.stolen
    ? { act: 2, text: `{rival} passe en CM1 avec « ${i.stolen} » au fond de son cartable. Il s'en sert encore, mal, devant des élèves qui ne savent pas d'où ça vient.` }
    : { act: 2, text: '{rival} passe en CM1 sans t\'adresser un regard. Il a gagné quelque chose cette année, et vous êtes deux à savoir quoi.' };
}

// La personne qu'on admire : c'est pour elle qu'on a fait tout ça, et elle n'en saura jamais rien.
function hero(i: EpilogueInput): EpilogueBeat {
  return {
    act: 2,
    text: i.victory
      ? `Tu avais juré ${VOW.short}. {Admire} le lit deux fois, du début à la fin, sans rien dire. Puis le plie en quatre, le met dans sa poche, et l'y laisse jusqu'à Noël.`
      : `Tu avais juré ${VOW.short}. {Admire} dit que ce n'est pas grave. {Admire} dit toujours que ce n'est pas grave. Tu vois bien que si.`,
  };
}

// Les chiffres de l'année, racontés comme un souvenir plutôt que comme un tableau.
function numbers(i: EpilogueInput): EpilogueBeat {
  if (!i.bestWord) return { act: 3, text: `Tu as rendu ${i.manche} copies cette année. Tu ne te souviens d'aucune.` };
  return {
    act: 3,
    text: `Tu as écrit ${i.words} mots cette année. Le plus cher t'a rapporté une fortune et c'était « ${i.bestWord} ». Tu ne t'en souviens déjà plus.`,
  };
}

// Trente ans plus tard : la seule case où le jeu accepte de dire que ça comptait.
function later(i: EpilogueInput): EpilogueBeat {
  return {
    act: 3,
    text: i.victory
      ? 'Trente ans plus tard, tu es {metier}. Tu dis encore « {phrase} » sans y penser, tu cries encore « {cri} » quand quelque chose te grimpe sur {corps}, et tu écris toujours {FAUTE} avec la même faute.'
      : 'Trente ans plus tard, tu es {metier} quand même. Personne, pas une seule fois, ne t\'a demandé ta moyenne de CE2.',
  };
}

function fall(i: EpilogueInput): EpilogueBeat {
  return {
    act: 3,
    kind: 'fall',
    text: i.victory
      ? (i.lives === 3
        ? 'Sur le mur du couloir, ton prénom est resté écrit au crayon, tout petit, à côté de celui de {rival}. Personne ne l\'a effacé.'
        : 'Dans le couloir, la sonnerie de midi. Tu sors en courant, comme les autres, et tu oublies ton cartable.')
      : 'La cloche sonne. Tu sors dans la cour. Il y a {cour}, et il reste deux mois avant septembre.',
  };
}

export function epilogue(i: EpilogueInput): EpilogueBeat[] {
  return [...lastDay(i), ...teacher(i), kevin(i), hero(i), numbers(i), later(i), fall(i)];
}
