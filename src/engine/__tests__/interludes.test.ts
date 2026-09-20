import { describe, expect, it } from 'vitest';
import { INTERLUDES, hasInterlude, pickInterlude } from '../../data/interludes';
import { createRng } from '../rng';

describe('planches de transition', () => {
  it('ne se jouent qu\'après les dictées impaires', () => {
    expect([1, 2, 3, 4].map(hasInterlude)).toEqual([true, false, true, false]);
  });

  it('déroulent l\'arc de Kévin dans l\'ordre', () => {
    const rng = createRng('kevin');
    expect(pickInterlude(3, true, [], rng)).toBe('kevin1');
    expect(pickInterlude(7, true, ['kevin1'], rng)).toBe('kevin2');
    expect(pickInterlude(9, false, ['kevin1', 'kevin2'], rng)).toBe('kevin3');
  });

  it('ne repassent jamais deux fois au même endroit', () => {
    const rng = createRng('suite');
    const seen: string[] = [];
    for (const manche of [1, 5]) {
      const id = pickInterlude(manche, true, seen, rng);
      expect(id).not.toBeNull();
      expect(seen).not.toContain(id!);
      seen.push(id!);
    }
  });

  it('choisissent une planche accordée au résultat de la dictée', () => {
    const rng = createRng('humeur');
    const wins = new Set(INTERLUDES.filter((i) => i.mood === 'win').map((i) => i.id));
    const losses = new Set(INTERLUDES.filter((i) => i.mood === 'loss').map((i) => i.id));
    for (let i = 0; i < 20; i++) {
      expect(losses.has(pickInterlude(1, true, [], rng)!)).toBe(false);
      expect(wins.has(pickInterlude(1, false, [], rng)!)).toBe(false);
    }
  });
});
