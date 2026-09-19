import { randomCharm } from '../data/charms';
import { CONSUMABLES } from '../data/consumables';
import { CURSES } from '../data/curses';
import { RELICS } from '../data/relics';
import { CONSUMABLE_PRICE, MAX_CONSUMABLES, RARITY_PRICE, RARITY_WEIGHT } from './hooks';
import type { Rng } from './rng';

export type ShopItemKind = 'relic' | 'consumable' | 'curse';

export interface ShopItem {
  kind: ShopItemKind;
  id: string;
  price: number;
  sold: boolean;
}

export const SHOP_REROLL_BASE_PRICE = 5; // [tuning] 5, 10, 15… dans la même visite

export function shopRerollPrice(paidRerolls: number, freeLeft: number): number {
  return freeLeft > 0 ? 0 : SHOP_REROLL_BASE_PRICE * (paidRerolls + 1);
}

export interface ShopInput {
  manche: number;            // manche qui vient de se terminer
  relicIds: readonly string[];
  consumableIds: readonly string[];
  pendingCurseIds?: readonly string[];
  enemiesEnabled: boolean;   // false tant que la couche ennemis n'est pas en jeu
  tookEnemyMutator: boolean;
}

interface Candidate { item: ShopItem; weight: number }

function relicCandidates(input: ShopInput): Candidate[] {
  return RELICS
    .filter((r) => !input.relicIds.includes(r.id))
    .filter((r) => !r.requires || input.relicIds.includes(r.requires))
    .filter((r) => !r.enemyRelic || (input.enemiesEnabled && input.manche >= 2))
    .map((r) => ({
      item: { kind: 'relic' as const, id: r.id, price: r.price ?? RARITY_PRICE[r.rarity], sold: false },
      weight: RARITY_WEIGHT[r.rarity] * (r.enemyRelic && input.tookEnemyMutator ? 2 : 1),
    }));
}

function consumableCandidates(input: ShopInput): Candidate[] {
  if (input.consumableIds.length >= MAX_CONSUMABLES) return [];
  return CONSUMABLES
    .filter((c) => !input.consumableIds.includes(c.id))
    .filter((c) => !c.enemyOnly || input.enemiesEnabled)
    .map((c) => ({ item: { kind: 'consumable' as const, id: c.id, price: CONSUMABLE_PRICE[c.rarity], sold: false }, weight: RARITY_WEIGHT[c.rarity] }));
}

function curseCandidates(input: ShopInput): Candidate[] {
  return CURSES
    .filter((c) => !(input.pendingCurseIds ?? []).includes(c.id))
    .filter((c) => !c.enemyRelic || input.enemiesEnabled)
    .map((c) => ({ item: { kind: 'curse' as const, id: c.id, price: c.price, sold: false }, weight: 30 }));
}

function draw(pool: Candidate[], taken: Set<string>, rng: Rng): ShopItem | null {
  const avail = pool.filter((c) => !taken.has(c.item.id));
  if (avail.length === 0) return null;
  const pick = rng.weighted(avail, (c) => c.weight);
  taken.add(pick.item.id);
  return pick.item;
}

export const SHOP_SLOTS = 4;

// 4 emplacements : 2 tirés parmi relics + consommables, 1 parmi malédictions + consommables,
// 1 charme (petit achat à 5-8 €, toujours présent). `keep` : articles achetés conservés à leur place.
export function generateShopOffer(input: ShopInput, rng: Rng, keep: (ShopItem | null)[] = []): ShopItem[] {
  const taken = new Set<string>(keep.filter((k): k is ShopItem => !!k).map((k) => k.id));
  const main = [...relicCandidates(input), ...consumableCandidates(input)];
  const side = [...curseCandidates(input), ...consumableCandidates(input)];
  const items: ShopItem[] = [];
  for (let i = 0; i < SHOP_SLOTS; i++) {
    const kept = keep[i];
    if (kept) { items.push(kept); continue; }
    if (i === SHOP_SLOTS - 1) {
      let charm = randomCharm(rng);
      for (let tries = 0; tries < 5 && taken.has(charm.id); tries++) charm = randomCharm(rng);
      items.push({ kind: 'relic', id: charm.id, price: charm.price!, sold: false });
      continue;
    }
    const it = draw(i < 2 ? main : side, taken, rng);
    if (it) items.push(it);
  }
  return items;
}
