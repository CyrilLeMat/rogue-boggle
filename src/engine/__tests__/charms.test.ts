import { describe, expect, it } from 'vitest';
import { charmFromId, isCharmId, randomCharm } from '../../data/charms';
import { relic } from '../../data/registry';
import { createRng } from '../rng';
import { applyModifiers } from '../scoring';
import { generateShopOffer } from '../shop';

describe('charms', () => {
  it('generates charms whose id round-trips through the registry', () => {
    const rng = createRng('charm');
    for (let i = 0; i < 40; i++) {
      const c = randomCharm(rng);
      expect(isCharmId(c.id)).toBe(true);
      expect(c.price).toBeGreaterThanOrEqual(8);
      expect(c.price).toBeLessThanOrEqual(30); // les gommettes vont de 8 à 26 billes selon leur valeur mesurée
      expect(relic(c.id).description).toBe(c.description);
      expect(charmFromId(c.id)?.id).toBe(c.id);
    }
    expect(charmFromId('charme-lettre-Z')).toBeNull();
  });
  it('letter charm gives +10 % and stacks', () => {
    const c = charmFromId('charme-lettre-E')!;
    const ctx = {} as never;
    const mods = [c.onWordFound!('ELLE', ctx)!, c.onWordFound!('ELLE', ctx)!];
    expect(applyModifiers(100, mods)).toBe(121);
    expect(c.onWordFound!('AMI', ctx)).toBeUndefined();
  });
  it('shop always offers a charm in the last slot', () => {
    for (let i = 0; i < 20; i++) {
      const offer = generateShopOffer({ manche: 1, relicIds: [], consumableIds: [], enemiesEnabled: false, tookEnemyMutator: false }, createRng('s' + i));
      expect(offer.length).toBe(4);
      expect(isCharmId(offer[3].id)).toBe(true);
      expect(offer[3].price).toBeLessThanOrEqual(30);
    }
  });
});
