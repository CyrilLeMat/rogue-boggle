import type { Relic } from '../engine/hooks';
import { INSPIRATION_SECONDS } from './consumables';
import { posKey } from '../engine/adjacency';
import { findPathForWord } from '../engine/wordFinder';

// Qui es-tu dans cette classe ? Une personnalité, pas un objet : elle donne le style de la run.
// Chaque archétype a un effet franc et une contrepartie, sauf le Cancre repenti (neutre, pour débuter).
export const ARCHETYPES: Relic[] = [
  {
    id: 'nouveau', name: 'Le nouveau', rarity: 'rare', archetype: true,
    flavor: 'Tu viens d\'arriver dans l\'école. Personne ne sait ce que tu vaux. Toi non plus, d\'ailleurs.',
    description: 'Rien de particulier. Juste toi, la feuille, et 20 billes de bienvenue',
    // profil neutre : le bon endroit pour découvrir le jeu
  },
  {
    id: 'chouchou', name: 'Le chouchou de la maîtresse', rarity: 'rare', archetype: true,
    flavor: 'Tu effaces le tableau sans qu\'on te le demande. C\'est répugnant. Ça paie.',
    description: '+25 % sur tous les mots, mais les autres te rackettent : −25 % de billes',
    onWordFound: () => ({ percent: 0.25 }),
    eurosMult: 0.75,
  },
  {
    id: 'fond-de-classe', name: 'Le fond de la classe', rarity: 'rare', archetype: true,
    flavor: 'Trois rangs derrière tout le monde. Angle mort. Vue imprenable sur la copie du voisin.',
    description: 'Au début de chaque dictée, tu copies : le mot le plus long est souligné 6 s',
    onMancheStart: (ctx) => {
      const longest = [...ctx.manche.search.words].sort((a, b) => b.length - a.length)[0];
      const path = longest ? findPathForWord(ctx.manche.grid, longest) : null;
      if (!path) return;
      ctx.manche.inspiration = {
        cells: path.map(([r, c]) => posKey(r, c)),
        until: INSPIRATION_SECONDS,
        length: longest.length,
        first: longest[0],
      };
    },
  },
  {
    id: 'footballeur', name: 'Le footballeur', rarity: 'rare', archetype: true,
    flavor: 'Quarante minutes de match sans souffler. Ton cœur bat à 180. Le temps n\'a plus le même sens.',
    description: '+25 s de chrono à chaque dictée, mais la tête est restée au but : −15 % sur les mots',
    mancheSeconds: (s) => s + 25,
    onWordFound: () => ({ percent: -0.15 }),
  },
  {
    id: 'redoublant', name: 'Le redoublant', rarity: 'rare', archetype: true,
    flavor: 'Tu as déjà fait ce CE2. Tu connais les questions. Tu connais surtout les pièges.',
    description: 'Un bon point de plus à la rentrée, mais on t\'en demande davantage : note à atteindre +12 %',
    extraLives: 1,
    thresholdMult: 1.12,
  },
  {
    id: 'petit-dernier', name: 'Le petit dernier', rarity: 'rare', archetype: true,
    flavor: 'Le plus petit de la classe. Le plus rapide aussi. On ne te voit jamais arriver.',
    description: 'L\'élan monte deux fois plus vite et tient 7 s, mais tu t\'essouffles : −10 s de chrono',
    streakStep: 0.2,
    streakWindow: 7,
    mancheSeconds: (s) => s - 10,
  },
  {
    id: 'rat-de-billes', name: 'Le rat de billes', rarity: 'rare', archetype: true,
    flavor: 'Ta poche fait un bruit de caisse enregistreuse quand tu marches. Tout le monde le sait.',
    description: '+50 % de billes à chaque dictée, mais tu comptes au lieu d\'écrire : −10 % sur les mots',
    eurosMult: 1.5,
    onWordFound: () => ({ percent: -0.1 }),
  },
  {
    id: 'reveur', name: 'La rêveuse', rarity: 'rare', archetype: true,
    flavor: 'Tu regardes par la fenêtre. Les grands mots viennent tout seuls ; les petits t\'ennuient.',
    description: '+60 % sur les mots de 6 lettres et plus, rien de plus sur les mots de 3 lettres',
    onWordFound: (w) => (w.length >= 6 ? { percent: 0.6 } : w.length <= 3 ? { percent: -0.4 } : undefined),
  },
];

export const ARCHETYPE_BY_ID = new Map(ARCHETYPES.map((a) => [a.id, a]));
export const STARTING_PURSE: Record<string, number> = { nouveau: 20 };
