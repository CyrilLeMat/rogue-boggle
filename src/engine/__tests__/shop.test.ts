import { describe, expect, it } from 'vitest';
import { CURSES } from '../../data/curses';
import { RELICS } from '../../data/relics';
import { createRng } from '../rng';
import { generateShopOffer, shopRerollPrice } from '../shop';

const base = { manche: 1, relicIds: [] as string[], consumableIds: [] as string[], enemiesEnabled: false, tookEnemyMutator: false };

describe('generateShopOffer', () => {
  it('offers 3 distinct items: 2 relic/consumable, 1 curse/consumable', () => {
    for (let i = 0; i < 50; i++) {
      const offer = generateShopOffer(base, createRng('s' + i));
      expect(offer.length).toBe(3);
      expect(new Set(offer.map((o) => o.id)).size).toBe(3);
      expect(offer[0].kind).not.toBe('curse');
      expect(offer[1].kind).not.toBe('curse');
      expect(offer[2].kind).not.toBe('relic');
      for (const o of offer) {
        expect(o.price).toBeGreaterThan(0);
        if (o.kind === 'relic') {
          const r = RELICS.find((x) => x.id === o.id)!;
          expect(r.enemyRelic).toBeFalsy();
          expect(r.requires).toBeUndefined();
        }
        if (o.kind === 'curse') expect(CURSES.find((x) => x.id === o.id)!.enemyRelic).toBeFalsy();
        if (o.kind === 'consumable') expect(o.id).not.toBe('grenade');
      }
    }
  });
  it('reroll keeps sold items in place and redraws the rest without duplicates', () => {
    const rng = createRng('rr');
    const offer = generateShopOffer(base, rng);
    const sold = { ...offer[1], sold: true };
    const next = generateShopOffer(base, rng, [null, sold, null]);
    expect(next[1]).toEqual(sold);
    expect(new Set(next.map((o) => o.id)).size).toBe(3);
    expect(next[2].kind).not.toBe('relic');
  });
  it('reroll price: free first, then 5, 10, 15', () => {
    expect(shopRerollPrice(0, 2)).toBe(0);
    expect(shopRerollPrice(0, 0)).toBe(5);
    expect(shopRerollPrice(2, 0)).toBe(15);
  });
  it('never offers owned relics or consumables and unlocks Double joker after Case joker', () => {
    const owned = RELICS.filter((r) => !r.enemyRelic && r.id !== 'double-joker').map((r) => r.id);
    const offer = generateShopOffer({ ...base, relicIds: owned, consumableIds: ['reroll', 'gel', 'shuffle'] }, createRng('x'));
    const relicIds = offer.filter((o) => o.kind === 'relic').map((o) => o.id);
    for (const id of relicIds) expect(id).toBe('double-joker');
    expect(offer.some((o) => o.kind === 'consumable')).toBe(false);
  });
});
