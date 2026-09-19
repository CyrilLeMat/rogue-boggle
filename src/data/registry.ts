import type { ConsumableDef, Curse, Mutator, Relic } from '../engine/hooks';
import { CONSUMABLE_BY_ID } from './consumables';
import { MUTATOR_BY_ID } from './mutators';
import { CURSE_BY_ID } from './curses';
import { ARCHETYPE_BY_ID } from './archetypes';
import { charmFromId } from './charms';
import { RELIC_BY_ID } from './relics';

export function curse(id: string): Curse {
  const c = CURSE_BY_ID.get(id);
  if (!c) throw new Error(`malédiction inconnue: ${id}`);
  return c;
}

export function consumable(id: string): ConsumableDef {
  const c = CONSUMABLE_BY_ID.get(id);
  if (!c) throw new Error(`consommable inconnu: ${id}`);
  return c;
}

export function mutator(id: string): Mutator {
  const m = MUTATOR_BY_ID.get(id);
  if (!m) throw new Error(`mutateur inconnu: ${id}`);
  return m;
}

// Relics permanents + malédictions actives + mutateur de la manche : même pipeline de hooks.
export function activeHooks(relicIds: readonly string[], curseIds: readonly string[], mutatorId: string | null = null): Relic[] {
  return [...relics(relicIds), ...curseIds.map(curse), ...(mutatorId ? [mutator(mutatorId)] : [])];
}

export function relic(id: string): Relic {
  const r = RELIC_BY_ID.get(id) ?? ARCHETYPE_BY_ID.get(id) ?? charmFromId(id);
  if (!r) throw new Error(`relic inconnu: ${id}`);
  return r;
}

export function relics(ids: readonly string[]): Relic[] {
  return ids.map(relic);
}
