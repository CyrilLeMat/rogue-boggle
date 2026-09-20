import { describe, expect, it } from 'vitest';
import { INTERLUDES, hasInterlude, pickInterlude } from '../../data/interludes';
import { SCENES } from '../../data/scenes';
import { MONOLOGUE, say } from '../../theme/lexicon';
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

describe('accords et prénom', () => {
  it('choisit la forme masculine ou féminine', () => {
    const line = 'Je suis prêt[|e], {nom}.';
    expect(say(line, { name: 'Léo', gender: 'm' })).toBe('Je suis prêt, Léo.');
    expect(say(line, { name: 'Léa', gender: 'f' })).toBe('Je suis prête, Léa.');
  });

  it('ne laisse aucun marqueur dans les textes du jeu', () => {
    const texts = [
      ...MONOLOGUE,
      ...INTERLUDES.flatMap((i) => [...i.lines, i.cry ?? '', i.fall]),
      ...SCENES.flatMap((s) => [...s.lines, ...s.choices.map((c) => c.detail)]),
    ];
    for (const gender of ['m', 'f'] as const) {
      for (const t of texts) {
        const out = say(t, { name: 'Alix', gender });
        expect(out).not.toMatch(/[[\]{}|]/);
      }
    }
  });
});
