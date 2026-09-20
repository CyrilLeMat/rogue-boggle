import type { Rng } from '../engine/rng';

// Entre deux dictées, la caméra suit l'élève hors de la classe.
// Il est grave, il est intense, il a huit ans. La dernière ligne remet tout le monde à sa place.
export interface Interlude {
  id: string;
  mood: 'win' | 'loss' | 'any';
  lines: string[];  // le narrateur, qui en sait trop et en fait trop
  cry?: string;     // ce que l'élève déclare, à voix haute ou pas
  fall: string;     // la retombée : la réalité, plate, immédiate
}

export const INTERLUDES: Interlude[] = [
  {
    id: 'toilettes',
    mood: 'win',
    lines: [
      'Tu ne marches pas. Tu cours.',
      'La porte des toilettes claque derrière toi. Le carrelage est {adjectif}. Tu trembles de tout ton corps, le poing serré si fort que tes ongles entrent dans ta paume.',
    ],
    cry: '{Admire}. Je ne te ferai pas honte. L’honneur de la famille est entre mes mains.',
    fall: 'Ton père est comptable. Il ignore qu’il y avait dictée aujourd’hui.',
  },
  {
    id: 'miroir',
    mood: 'win',
    lines: [
      'Les lavabos. L’eau froide sur {corps}. Ton reflet te fixe comme un adversaire, et il a l’air {adjectif}.',
      'Tu t’agrippes à la faïence des deux mains et tu murmures, les dents serrées :',
    ],
    cry: 'Ce n’était qu’une dictée. {heros} ne se serait pas arrêté là, et moi non plus.',
    fall: 'Il en reste neuf. Ensuite, ce sont les vacances de la Toussaint.',
  },
  {
    id: 'preau',
    mood: 'win',
    lines: [
      'Dehors, sous le préau, la pluie tombe comme dans les dernières pages.',
      'Tu lèves les yeux vers un ciel gris et {adjectif}, bras le long du corps, et tu laisses l’eau couler sur ton visage sans ciller.',
    ],
    cry: 'Je les ai tous dépassés. « {phrase} », comme on dit. Et pourtant je ne ressens rien.',
    fall: 'La récréation dure douze minutes.',
  },
  {
    id: 'couloir',
    mood: 'loss',
    lines: [
      'Le couloir est vide. Tu t’adosses au mur sous les porte-manteaux et tu glisses lentement jusqu’au sol.',
      'Le carrelage est froid et {adjectif}, et ce froid remonte jusqu’à {corps}. Tu ne clignes pas des yeux. Tout au fond, quelque chose voudrait sortir :',
    ],
    cry: '{Cri}.',
    fall: 'Tu as eu onze. La moyenne de la classe est de douze. Au menu ce soir : {horreur}.',
  },
  {
    id: 'chambre',
    mood: 'loss',
    lines: [
      'Vingt-deux heures. La maison dort. Une seule lampe brûle encore.',
      'Tu recopies le mot. Encore. Encore. Ta main tremble, l’encre bave sur un cahier {adjectif}, tu ne t’arrêtes pas.',
    ],
    cry: 'Cent fois. Mille s’il le faut. J’écrirai jusqu’à ce que {corps} me lâche.',
    fall: '{Admire} dort à l’étage. Tu n’as rien dit à personne. Le mot est ÉCUREUIL.',
  },
  {
    id: 'pluie',
    mood: 'any',
    lines: [
      'Trois ans plus tôt. Le jardin. La pluie.',
      'Tu récites les mots en -euil, debout, tremp[é|ée], dans un jardin {adjectif}, pendant que ta mère te regarde derrière la vitre sans bouger.',
    ],
    cry: 'Encore. Depuis le début.',
    fall: 'Elle t’a appel[é|ée] quatre fois pour le goûter. Tu n’as rien entendu.',
  },
  {
    id: 'mamie',
    mood: 'any',
    lines: [
      'La cuisine de ta grand-mère. Les carottes. Le couteau qui ne s’arrête jamais.',
      'Elle ne lève pas les yeux. Le couteau fait un bruit {adjectif}. Elle dit un mot, tu l’épelles, elle dit le suivant. Depuis deux heures.',
    ],
    cry: 'On ne triche pas avec les mots, petit. Les mots, eux, ne trichent pas avec toi.',
    fall: 'Elle a eu son certificat d’études en 1954. Elle en parle encore.',
  },
  {
    id: 'ete',
    mood: 'any',
    lines: [
      'L\'été dernier. Tout le monde était dehors, tout le monde criait.',
      'Toi, tu as tout arrêté, {cour} compris, pendant deux mois entiers, pour réviser les mots en -euil, assis[|e] à une table de cuisine au silence {adjectif}.',
    ],
    cry: 'Le plaisir attendra. Le CM1, lui, n\'attend pas.',
    fall: 'Personne ne t\'avait rien demandé.',
  },
  {
    id: 'kevin1',
    mood: 'any',
    lines: [
      'Tu ne le connaissais pas ce matin. Il t’a lancé un « {salut} » en arrivant, et ce soir tu ne verras plus que lui.',
      'Kévin. Redoublant. Aucun stylo depuis le CP, aucune trousse, aucun remords, et un regard {adjectif2}. Il copie sur tout le monde et tout le monde le laisse faire.',
      'Dans la cour, il traverse le goudron sans se presser, s’arrête à {distance} de toi, sort les mains de ses poches et te désigne du menton.',
    ],
    cry: 'Cette année, c’est toi ma victime.',
    fall: 'Il s’assoit juste derrière toi et lit déjà par-dessus ton épaule.',
  },
  {
    id: 'kevin2',
    mood: 'any',
    lines: [
      'Il s’approche de ta table sans un mot et pose quelque chose dessus.',
      'Un stylo {adjectif}, mâchouillé au bout. Le sien. Le seul qu’il ait jamais eu.',
    ],
    cry: 'Tiens. Tu en auras besoin.',
    fall: 'Il n’écrira pas aujourd’hui. Il a déjà décidé.',
  },
  {
    id: 'kevin3',
    mood: 'any',
    lines: [
      'Le soir. La classe est éteinte. Tu passes devant la fenêtre et tu t’arrêtes net.',
      'Kévin est là, seul devant le tableau, à recopier les mots dans un silence {adjectif}, {objet} posé à ses pieds. Depuis combien de temps, personne ne le saura.',
    ],
    cry: 'Tu as changé. Moi aussi.',
    fall: 'Le lendemain, il s’assoit à côté de toi. Il ne te regarde pas.',
  },
];

export const INTERLUDE_BY_ID = new Map(INTERLUDES.map((i) => [i.id, i]));

// L'arc de Kévin se déroule toujours dans l'ordre, aux mêmes dictées : c'est une histoire, pas un tirage.
// Il ouvre le bal dès la première dictée : on présente l'adversaire avant de le combattre.
const KEVIN_ARC: Record<number, string> = { 1: 'kevin1', 5: 'kevin2', 9: 'kevin3' };

// Une planche après les dictées impaires, quand il n'y a ni couloir ni scène de classe.
export function hasInterlude(manche: number): boolean {
  return manche % 2 === 1;
}

export function pickInterlude(manche: number, success: boolean, seen: string[], rng: Rng): string | null {
  const kevin = KEVIN_ARC[manche];
  if (kevin && !seen.includes(kevin)) return kevin;
  const mood = success ? 'win' : 'loss';
  const pool = INTERLUDES.filter((i) => !seen.includes(i.id) && !i.id.startsWith('kevin') && (i.mood === mood || i.mood === 'any'));
  if (!pool.length) return null;
  return rng.pick(pool).id;
}
