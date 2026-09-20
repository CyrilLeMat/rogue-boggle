import type { Rng } from '../engine/rng';

// Entre deux dictées, la caméra suit l'élève hors de la classe.
// Il est grave, il est intense, il a huit ans. La dernière ligne remet tout le monde à sa place.
export interface Interlude {
  id: string;
  mood: 'win' | 'loss' | 'any';
  lines: string[];  // le narrateur, qui en sait trop et en fait trop
  cry?: string;     // ce que l'élève déclare, à voix haute ou pas
  fall: string;     // la retombée : la réalité, plate, immédiate
  era?: string;     // souvenirs seulement : à quelle distance on creuse
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
      'Les lavabos. L’eau froide sur {corps}. Ton reflet te fixe comme un adversaire, et il a l’air {adjectif3}.',
      'Tu t’agrippes à la faïence des deux mains et tu murmures, les dents serrées :',
    ],
    cry: 'Ce n’était qu’une dictée. {heros} ne se serait pas arrêté là, et moi non plus.',
    fall: 'Il en reste {restantes}. Ensuite, ce sont les vacances de la Toussaint.',
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
      'Le carrelage est froid et {adjectif3}, et ce froid remonte jusqu’à {corps}. Tu ne clignes pas des yeux. Tout au fond, quelque chose voudrait sortir :',
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
    fall: '{Admire} dort à l’étage. Tu n’as rien dit à personne. Le mot est {FAUTE}.',
  },
  // Les trois souvenirs ne se tirent pas au sort : ils remontent, dans cet ordre,
  // à des moments fixes de l'année, et chacun creuse plus loin que le précédent.
  {
    id: 'ete',
    mood: 'any',
    era: 'L’été dernier',
    lines: [
      'Tout le monde était dehors, tout le monde criait, et l’eau de la piscine gonflable était déjà verte.',
      'Toi, tu as tout arrêté, {cour} compris, pendant deux mois entiers, pour réviser les mots en -euil, assis[|e] à une table de cuisine au silence {adjectif}.',
    ],
    cry: 'Le plaisir attendra. Le CM1, lui, n\'attend pas.',
    fall: 'Personne ne t\'avait rien demandé. {Admire} croyait que tu dessinais.',
  },
  {
    id: 'mamie',
    mood: 'any',
    era: 'Deux ans plus tôt',
    lines: [
      'La cuisine de ta grand-mère. Les carottes. Le couteau qui ne s’arrête jamais.',
      'Elle ne lève pas les yeux. Le couteau fait un bruit {adjectif3}. Elle dit un mot, tu l’épelles, elle dit le suivant. Depuis deux heures.',
    ],
    cry: 'On ne triche pas avec les mots, petit. Les mots, eux, ne trichent pas avec toi.',
    fall: 'Elle a eu son certificat d’études en 1954. Elle en parle encore. Tu sais très bien d’où te vient cette manie.',
  },
  {
    id: 'pluie',
    mood: 'any',
    era: 'Trois ans plus tôt',
    lines: [
      'Le jardin. La pluie, la vraie, celle qui traverse le pull en deux minutes.',
      'Tu récites les mots en -euil, debout, tremp[é|ée], pendant que {admire} te regarde derrière la vitre, sans bouger et sans rien dire.',
    ],
    cry: 'Encore. Depuis le début.',
    fall: 'Tu avais cinq ans. Tu ne savais pas encore écrire. Tu récitais quand même.',
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
      'Vendredi, la maîtresse rend les copies. Elle garde la tienne pour la fin. Elle garde aussi celle de Kévin.',
      'Les deux sont identiques. Mot pour mot, faute pour faute, y compris « {faute} », que tu es [le seul|la seule] au monde à écrire comme ça.',
      'Elle regarde Kévin. Kévin baisse les yeux avec un air {adjectif3}, exactement comme quelqu\'un qu\'on aurait copié.',
    ],
    cry: 'C\'est lui ! C\'est lui qui a copié sur moi !!!',
    fall: 'Tu as été [puni|punie]. Kévin a eu un bon point pour son courage.',
  },
  {
    id: 'kevin3',
    mood: 'any',
    lines: [
      'Le soir. La classe est éteinte. Tu passes devant la fenêtre et tu t’arrêtes net.',
      'Kévin est là, seul devant le tableau, à recopier les mots dans un silence {adjectif}. À ses pieds, il y a {objet}. Tu sais très bien à qui c’était, {nom}.',
    ],
    cry: 'Ce que tu m’as pris, je viendrai le reprendre.',
    fall: 'Le lendemain, il s’assoit en face de toi. Pas à côté. En face.',
  },
];

export const INTERLUDE_BY_ID = new Map(INTERLUDES.map((i) => [i.id, i]));

// L'arc de Kévin se déroule toujours dans l'ordre, aux mêmes dictées : c'est une histoire, pas un tirage.
// Il ouvre le bal dès la première dictée : on présente l'adversaire avant de le combattre.
const KEVIN_ARC: Record<number, string> = { 1: 'kevin1', 5: 'kevin2', 9: 'kevin3' };

// Le passé remonte aux dictées paires, là où il n'y avait rien, et il creuse : l'été dernier,
// puis deux ans, puis trois — le dernier juste avant la dernière boutique et l'affrontement.
const MEMORY_ARC: Record<number, string> = { 4: 'ete', 8: 'mamie', 10: 'pluie' };

export function memoryAfter(manche: number, seen: readonly string[]): string | null {
  const id = MEMORY_ARC[manche];
  return id && !seen.includes(id) ? id : null;
}

// Une planche après les dictées impaires, quand il n'y a ni couloir ni scène de classe.
export function hasInterlude(manche: number): boolean {
  return manche % 2 === 1;
}

export function pickInterlude(manche: number, success: boolean, seen: string[], rng: Rng): string | null {
  const kevin = KEVIN_ARC[manche];
  if (kevin && !seen.includes(kevin)) return kevin;
  const mood = success ? 'win' : 'loss';
  // ni Kévin ni les souvenirs : les deux arcs ont leurs rendez-vous à eux
  const pool = INTERLUDES.filter((i) => !seen.includes(i.id) && !i.id.startsWith('kevin') && !i.era && (i.mood === mood || i.mood === 'any'));
  if (!pool.length) return null;
  return rng.pick(pool).id;
}
