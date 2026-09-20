import type { Relic } from '../engine/hooks';
import { posKey } from '../engine/adjacency';
import { findPathForWord } from '../engine/wordFinder';
import { MUTATORS, MUTATOR_BY_ID } from './mutators';
import type { Rng } from '../engine/rng';
import { STREAK_STEP } from '../engine/rules';

// Les planches : une situation, deux réactions possibles, des conséquences qui en découlent.
// Le narrateur est l'élève, et l'élève dramatise tout.
export interface SceneEffects {
  lessonId?: string;       // la conséquence prend la forme d'une leçon
  randomLesson?: boolean;  // personne ne sait ce qui va suivre
  seconds?: number;        // ± chrono de la dictée à venir
  euros?: number;          // ± billes, tout de suite
  eurosMult?: number;      // × billes gagnées à la fin de la dictée
  thresholdMult?: number;  // × note à atteindre
  scoreMult?: number;      // + % sur chaque mot
  sizeDelta?: number;      // ± taille de feuille
  streakStep?: number;     // élan plus vif
  gommette?: boolean;      // une gommette offerte
  amorce?: boolean;        // quelqu'un te souffle le début d'un mot long
}

export interface SceneChoice {
  label: string;
  detail: string;
  effects: SceneEffects;
}

export interface Scene {
  id: string;
  title: string;
  lines: string[];
  choices: [SceneChoice, SceneChoice];
}

export const SCENES: Scene[] = [
  {
    id: 'sophie',
    title: 'Le stylo de Sophie',
    lines: [
      'Catastrophe : le stylo de Sophie, ta voisine, tombe par terre.',
      'Il explose au contact du sol. Tu hurles « {cri} » avant même de comprendre pourquoi. La coulée violette avance vers toi et pourrait t\'engloutir.',
      'Mais tu vois aussi la détresse de Sophie, qui tombe à genoux, en larmes, et hurle au ciel : « Noooon, c\'était mon seul crayon !! »',
    ],
    choices: [
      {
        label: 'Voler à son secours',
        detail: 'Personne ne te l\'a demandé. Tu y vas quand même. Sophie te devra une fière chandelle, et Sophie paie toujours ses dettes.',
        effects: { seconds: -20, euros: 40 },
      },
      {
        label: 'Reculer ta chaise de huit centimètres',
        detail: 'Survivre est d\'abord une question de distance. L\'encre atteindra ta feuille, mais pas tes chaussures neuves.',
        effects: { lessonId: 'toxique' },
      },
    ],
  },
  {
    id: 'bocal',
    title: 'Le bocal de la leçon de choses',
    lines: [
      'Le bocal gît sur le carrelage. {Nombre} escargots ont recouvré leur liberté.',
      'Ils progressent vers l\'ouest à trois centimètres par minute. Personne ne les arrêtera. Personne n\'essaiera.',
      'La maîtresse fixe le plafond en silence. Elle a fait sept ans d\'études.',
    ],
    choices: [
      {
        label: 'Les remettre dans le bocal',
        detail: 'Un par un. À mains nues. Tu y laisseras du temps et un peu de ta dignité, mais elle n\'oubliera pas.',
        effects: { seconds: -15, euros: 30 },
      },
      {
        label: 'Les laisser conquérir la salle',
        detail: 'Ce sont eux qui ont raison. Ils traverseront ta feuille, et elle te regardera de travers jusqu\'à la fin.',
        effects: { lessonId: 'escargots', eurosMult: 0.8 },
      },
    ],
  },
  {
    id: 'place',
    title: 'Le changement de place',
    lines: [
      'Sans prévenir, la maîtresse annonce un changement de place. La classe retient son souffle : c\'est là que se jouent les destins.',
      'Deux tables restent libres. L\'une à côté de Kévin, qui n\'a plus de stylo depuis le CP et qui te fixe déjà en souriant.',
      'L\'autre contre la fenêtre du fond, celle qui ne ferme plus depuis 1996 et par laquelle entre un vent polaire.',
    ],
    choices: [
      {
        label: 'T\'asseoir près de Kévin',
        detail: 'Il pose la main sur ton épaule. « On va bien s\'entendre, toi et moi. » Il regarde déjà ta feuille.',
        effects: { lessonId: 'chasse' },
      },
      {
        label: 'T\'asseoir près de la fenêtre',
        detail: 'Le vent te glace les doigts et emporte les lettres les unes après les autres.',
        effects: { lessonId: 'vent' },
      },
    ],
  },
  {
    id: 'remplacant',
    title: 'Le remplaçant',
    lines: [
      'Catastrophe, ou miracle, personne n\'arrive à trancher : la maîtresse est absente.',
      'À sa place, un jeune homme pâle serre un classeur contre sa poitrine comme un bouclier. Il ne connaît ni vos prénoms, ni les règles, ni le règlement.',
      'Il tremble. Il sourit. Il est perdu. Sur sa trousse, un porte-clés {heros} qui ne trompe personne : il a douze ans d\'écart avec vous et aucune autorité.',
    ],
    choices: [
      {
        label: 'Lui expliquer le règlement',
        detail: '« Monsieur, ici, on a le droit au dictionnaire. » Il te croit. Il le note dans son classeur. La vérité éclatera, et elle coûtera cher.',
        effects: { thresholdMult: 0.75, euros: -40 },
      },
      {
        label: 'Ne rien dire du tout',
        detail: 'Il improvise. Personne ne sait ce qui va se passer maintenant. Lui non plus.',
        effects: { randomLesson: true },
      },
    ],
  },
  {
    id: 'grosmot',
    title: 'Le gros mot au tableau',
    lines: [
      'Quelqu\'un a écrit « {rigolo} » au tableau pendant la récré. En lettres capitales.',
      'La maîtresse a blêmi, puis exigé un coupable. Sans aveu, la classe entière sera punie. Le silence dure une éternité.',
      'Puis vingt-six têtes se tournent lentement vers toi, parce que tu es le plus près du tableau et que la justice a ses raisons.',
    ],
    choices: [
      {
        label: 'Te dénoncer alors que tu n\'as rien fait',
        detail: 'Un héroïsme que personne ne comprendra jamais, et dont tout le monde parlera jusqu\'à la fin de l\'année.',
        effects: { seconds: -20, euros: 60 },
      },
      {
        label: 'Laisser tomber la classe entière',
        detail: 'Ils auraient fait pareil. Ils l\'ont déjà fait. La punition collective tombe sur tout le monde, toi compris.',
        effects: { thresholdMult: 1.2 },
      },
    ],
  },
  {
    id: 'photo',
    title: 'La photo de classe',
    lines: [
      'Le photographe s\'appelle Gérard. Gérard exerce depuis trente et un ans.',
      'Gérard a photographié ta mère dans cette salle, au même endroit, avec le même appareil.',
      'Gérard ne sourit plus depuis 1998. Il demande un ouistiti. Tu réponds : « {phrase} ». Gérard ne relève pas.',
    ],
    choices: [
      {
        label: 'Premier rang, raie sur le côté',
        detail: 'Ta mère encadrera ce cliché. La maîtresse t\'aura sous les yeux toute la dictée.',
        effects: { scoreMult: 0.25, eurosMult: 0.75 },
      },
      {
        label: 'Dernier rang, doigts derrière la tête du voisin',
        detail: 'Une œuvre qui traversera les générations. Et un compagnon de fortune qui te suivra jusqu\'en classe.',
        effects: { euros: 50, lessonId: 'chasse' },
      },
    ],
  },
  {
    id: 'directeur',
    title: 'Des chaussures dans le couloir',
    lines: [
      'Elles ralentissent. Elles s\'arrêtent. La maîtresse blanchit d\'un coup.',
      'Le directeur n\'entre jamais sans raison, et le directeur n\'a jamais de raison.',
      'La poignée tourne au ralenti, comme dans les films où tout le monde meurt à la fin. Dans ta tête, une seule phrase tourne en boucle : « {cri} ».',
    ],
    choices: [
      {
        label: 'Te redresser, mains à plat',
        detail: 'Le manuel de survie scolaire, page un. Elle te sera reconnaissante, mais tu écriras tend[u|ue] comme un arc.',
        effects: { thresholdMult: 0.85, seconds: -10 },
      },
      {
        label: 'Glisser lentement sous la table',
        detail: 'Il ne peut pas te convoquer s\'il ne t\'a pas vu. Tu rates le début de la dictée, mais tu trouves une pièce par terre.',
        effects: { euros: 40, seconds: -20 },
      },
    ],
  },
  {
    id: 'cahier',
    title: 'Le cahier resté à la maison',
    lines: [
      'Il est sur la table de la cuisine, à côté du beurre. Tu le vois d\'ici. Tu le verras toute la journée.',
      'Elle ouvre son tiroir et en sort une feuille volante. Froissée. Jaunie.',
      'Cette feuille a connu des choses dont on ne parle pas.',
    ],
    choices: [
      {
        label: 'Écrire tout petit',
        detail: 'Faire tenir une année entière sur un quart de page. Chaque mot compte double dans ta tête, et sur la copie aussi.',
        effects: { sizeDelta: -1, scoreMult: 0.3 },
      },
      {
        label: 'En réclamer une deuxième',
        detail: 'L\'audace des désespérés. Elle soupire, elle fouille, elle te la tend en te faisant payer le dérangement.',
        effects: { euros: -25 },
      },
    ],
  },
  {
    id: 'cantine',
    title: 'La cantine',
    lines: [
      'Il est midi. Kévin a fait la queue deux fois et revient à table avec deux plateaux.',
      'Il pose le second devant toi, sans un mot. Au menu : {horreur}.',
      'Toute la table s\'est tue. Kévin te regarde. Kévin attend.',
    ],
    choices: [
      {
        label: 'Tout manger sans respirer',
        detail: 'Le corps encaisse, l\'esprit encaisse. Tu ressors de table plus fort[|e] que jamais, et un peu ver[t|te].',
        effects: { seconds: -10, scoreMult: 0.2 },
      },
      {
        label: 'Repousser le plateau',
        detail: 'Un affront public. Kévin ne dira rien aujourd\'hui, et c\'est bien ça le problème.',
        effects: { euros: 25, lessonId: 'chasse' },
      },
    ],
  },
  {
    id: 'anniversaire',
    title: 'L\'anniversaire de Léa',
    lines: [
      'Gâteau au chocolat industriel sur le bureau. Léa a huit ans.',
      'Léa aura huit ans toute l\'année, comme tout le monde, mais aujourd\'hui c\'est officiel.',
      'Quelqu\'un a mis {chanson} sur le poste de la classe. Personne n\'ose danser.',
      'La dictée est maintenue. Bien sûr que la dictée est maintenue.',
    ],
    choices: [
      {
        label: 'Prendre une part',
        detail: 'Deux, si personne ne compte. Tu écriras avec les doigts collants, mais tu écriras heur[eux|euse].',
        effects: { euros: 30, seconds: -15 },
      },
      {
        label: 'Refuser poliment',
        detail: 'Léa s\'en souviendra. Léa se souvient de tout. Mais tu restes n[et|ette], concentr[é|ée], redoutable.',
        effects: { streakStep: 0.2 },
      },
    ],
  },
];

export const SCENE_BY_ID = new Map(SCENES.map((s) => [s.id, s]));

export interface SceneTag { text: string; tone: 'good' | 'bad' | 'neutral'; hint?: string }

const pct = (m: number) => `${m >= 1 ? '+' : '\u2212'}${Math.round(Math.abs(m - 1) * 100)} %`;
const signed = (n: number, unit: string) => `${n > 0 ? '+' : '\u2212'}${Math.abs(n)} ${unit}`;

// Ce que la réaction coûte et rapporte, en clair : le texte dramatise, les pastilles ne mentent pas.
export function sceneTags(e: SceneEffects): SceneTag[] {
  const tags: SceneTag[] = [];
  if (e.lessonId) {
    const m = MUTATOR_BY_ID.get(e.lessonId);
    tags.push({ text: `Leçon : ${m?.name ?? e.lessonId}`, tone: 'neutral', hint: m?.description });
  }
  if (e.randomLesson) tags.push({ text: 'Leçon tirée au sort', tone: 'neutral', hint: 'Une leçon au hasard parmi toutes celles que la maîtresse peut sortir à ce moment de l\'année. Tu la découvriras sur la feuille.' });
  if (e.seconds) tags.push({ text: signed(e.seconds, 's'), tone: e.seconds > 0 ? 'good' : 'bad' });
  if (e.euros) tags.push({ text: signed(e.euros, 'billes'), tone: e.euros > 0 ? 'good' : 'bad' });
  if (e.eurosMult) tags.push({ text: `${pct(e.eurosMult)} de billes`, tone: e.eurosMult >= 1 ? 'good' : 'bad' });
  if (e.thresholdMult) tags.push({ text: `note à atteindre ${pct(e.thresholdMult)}`, tone: e.thresholdMult <= 1 ? 'good' : 'bad' });
  if (e.scoreMult) tags.push({ text: `${pct(1 + e.scoreMult)} par mot`, tone: e.scoreMult >= 0 ? 'good' : 'bad' });
  if (e.sizeDelta) tags.push({ text: e.sizeDelta > 0 ? 'feuille plus grande' : 'feuille plus petite', tone: 'neutral' });
  if (e.streakStep) tags.push({ text: `élan ×${Math.round(e.streakStep / STREAK_STEP)}`, tone: 'good' });
  if (e.gommette) tags.push({ text: 'une gommette offerte', tone: 'good' });
  if (e.amorce) tags.push({ text: 'un début de mot soufflé', tone: 'good' });
  return tags;
}

// Cinq créneaux dans l'année (dictées paires), neuf planches : jamais deux fois la même.
export function planScenes(rng: Rng, slots: number): string[] {
  return rng.shuffle(SCENES).slice(0, slots).map((s) => s.id);
}

export function sceneChoice(sceneId: string, choice: number): SceneChoice | null {
  return SCENE_BY_ID.get(sceneId)?.choices[choice] ?? null;
}

export function randomLessonId(rng: Rng, manche: number): string {
  const pool = MUTATORS.filter((m) => (m.minManche ?? 0) <= manche);
  return rng.pick(pool).id;
}

// Les conséquences qui vivent pendant la dictée deviennent une fourniture invisible d'une manche.
export function sceneRelic(e: SceneEffects): Relic | null {
  if (!e.scoreMult && !e.eurosMult && !e.thresholdMult && !e.seconds && !e.streakStep && !e.amorce) return null;
  return {
    id: 'scene-effects',
    name: 'Conséquences',
    rarity: 'common',
    description: 'Les suites de ta décision',
    onWordFound: e.scoreMult ? () => ({ percent: e.scoreMult! }) : undefined,
    eurosMult: e.eurosMult,
    thresholdMult: e.thresholdMult,
    streakStep: e.streakStep,
    mancheSeconds: e.seconds ? (s) => Math.max(20, s + e.seconds!) : undefined,
    onMancheStart: e.amorce
      ? (ctx) => {
          const longs = [...ctx.manche.search.words].filter((w) => w.length >= 7);
          if (!longs.length) return;
          const word = ctx.rng.pick(longs);
          const path = findPathForWord(ctx.manche.grid, word);
          ctx.manche.amorce = { prefix: word.slice(0, 3), length: word.length, start: path ? posKey(path[0][0], path[0][1]) : null };
        }
      : undefined,
  };
}
