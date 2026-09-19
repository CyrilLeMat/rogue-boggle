import type { ConsumableDef } from '../engine/hooks';

export const CONSUMABLES: ConsumableDef[] = [
  {
    id: 'reroll', name: 'Reroll de lettre', rarity: 'common', kind: 'reroll', usesPerManche: 5, needsTarget: true,
    description: 'Double-tape une case pour changer sa lettre (à l\'aveugle). 5 charges par manche',
  },
  {
    id: 'gel', name: 'Gel du temps', rarity: 'common', kind: 'freeze', usesPerManche: 1,
    description: '+15 s au chrono. 1 charge par manche',
  },
  {
    id: 'shuffle', name: 'Shuffle total', rarity: 'rare', kind: 'shuffle', usesPerManche: 1,
    description: 'Régénère toute la grille, garde le chrono et les mots trouvés. 1 charge par manche',
  },
  {
    id: 'inspiration', name: 'Inspiration', rarity: 'rare', kind: 'inspiration', usesPerManche: 1,
    description: 'Illumine 6 s les cases du mot le plus long de la grille (sans l\'ordre), avec sa longueur et sa première lettre',
  },
  {
    id: 'grenade', name: 'Grenade', rarity: 'rare', kind: 'grenade', usesPerManche: 1, enemyOnly: true,
    description: '30 dégâts à tous les ennemis de la grille. 1 charge par manche',
  },
];

export const CONSUMABLE_BY_ID = new Map(CONSUMABLES.map((c) => [c.id, c]));
export const FREEZE_SECONDS = 15;
export const INSPIRATION_SECONDS = 6;
