import type { ConsumableDef } from '../engine/hooks';

export const CONSUMABLES: ConsumableDef[] = [
  {
    id: 'reroll', name: 'Gomme', rarity: 'common', kind: 'reroll', usesPerManche: 5, needsTarget: true,
    description: 'Double-tape une case pour gommer sa lettre et en écrire une autre (au hasard). 5 fois par dictée',
  },
  {
    id: 'gel', name: 'Sonnerie retardée', rarity: 'common', kind: 'freeze', usesPerManche: 1,
    description: '+15 s au chrono. 1 fois par dictée',
  },
  {
    id: 'shuffle', name: 'Nouvelle feuille', rarity: 'rare', kind: 'shuffle', usesPerManche: 1,
    description: 'Change toute la feuille, garde le chrono et les mots trouvés. 1 fois par dictée',
  },
  {
    id: 'inspiration', name: 'Souffleur', rarity: 'rare', kind: 'inspiration', usesPerManche: 1,
    description: 'Souligne 6 s les cases du mot le plus long de la feuille (sans l\'ordre), avec sa longueur et sa première lettre',
  },
  {
    id: 'grenade', name: 'Boulette géante', rarity: 'rare', kind: 'grenade', usesPerManche: 1, enemyOnly: true,
    description: '30 coups à tous les cancres de la feuille. 1 fois par dictée',
  },
];

export const CONSUMABLE_BY_ID = new Map(CONSUMABLES.map((c) => [c.id, c]));
export const FREEZE_SECONDS = 15;
export const INSPIRATION_SECONDS = 6;
