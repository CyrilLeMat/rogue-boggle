import { describe, expect, it } from 'vitest';
import { INTERLUDES, hasInterlude, pickInterlude } from '../../data/interludes';
import { ARCHETYPES } from '../../data/archetypes';
import { SCENES } from '../../data/scenes';
import { APPRECIATIONS, DEFAULT_PROFILE, EV, L, SHOP_INTRO, mention, DUPLICATES, MONOLOGUE, PRAISES_BIG, PRAISES_HUGE, PRAISES_SMALL, SCOLDS, SUSPICIONS, TOO_SHORT, pickAppreciation, say } from '../../theme/lexicon';
import { createRng } from '../rng';

describe('planches de transition', () => {
  it('ne se jouent qu\'après les dictées impaires', () => {
    expect([1, 2, 3, 4].map(hasInterlude)).toEqual([true, false, true, false]);
  });

  it('déroulent l\'arc de Kévin dans l\'ordre', () => {
    const rng = createRng('kevin');
    expect(pickInterlude(1, true, [], rng)).toBe('kevin1');
    expect(pickInterlude(5, true, ['kevin1'], rng)).toBe('kevin2');
    expect(pickInterlude(9, false, ['kevin1', 'kevin2'], rng)).toBe('kevin3');
  });

  it('ne repassent jamais deux fois au même endroit', () => {
    const rng = createRng('suite');
    const seen: string[] = [];
    for (const manche of [3, 7]) {
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
    const profile = { ...DEFAULT_PROFILE, rigolo: 'patate', adjectif: 'mou', nombre: 'sept', action: 'courir', cri: 'AAAH', salut: 'Wesh', phrase: 'Tranquille', cour: 'le foot', heros: 'Pikachu', plat: 'les frites', horreur: 'les endives' };
    expect(say(line, { name: 'Léo', gender: 'm', profile })).toBe('Je suis prêt, Léo.');
    expect(say(line, { name: 'Léa', gender: 'f', profile })).toBe('Je suis prête, Léa.');
    expect(say('Au menu : {horreur}. Puis {plat}, et {cour} avec {heros}.', { name: 'Léa', gender: 'f', profile }))
      .toBe('Au menu : les endives. Puis les frites, et le foot avec Pikachu.');
    expect(say('{Admire} arrive.', { name: 'Léa', gender: 'f', profile: { ...profile, admire: 'ma tante' } }))
      .toBe('Ma tante arrive.');
    expect(say('Rien à remplacer {ici}.', { name: 'Léa', gender: 'f', profile })).toBe('Rien à remplacer {ici}.');
  });

  it('ne laisse aucun marqueur dans les textes du jeu', () => {
    const texts = [
      ...MONOLOGUE, ...SUSPICIONS, ...PRAISES_HUGE, ...TOO_SHORT, ...DUPLICATES,
      ...INTERLUDES.flatMap((i) => [...i.lines, i.cry ?? '', i.fall]),
      ...SCENES.flatMap((s) => [...s.lines, ...s.choices.map((c) => c.detail)]),
      ...SCOLDS, ...PRAISES_BIG, ...PRAISES_SMALL, ...SHOP_INTRO.lines,
      mention(19, true).note, mention(5, false).note,
      ...EV.sage.intro, ...EV.kevin.intro, ...EV.billes.intro, EV.kevin.ask(6), EV.inspecteur.wrong,
      L.victoireSub, L.gameoverSub(4),
    ];
    for (const gender of ['m', 'f'] as const) {
      for (const t of texts) {
        const out = say(t, { name: 'Alix', gender, profile: { ...DEFAULT_PROFILE, rigolo: 'patate', adjectif: 'mou', nombre: 'sept', action: 'courir', cri: 'AAAH', salut: 'Wesh', phrase: 'Tranquille', cour: 'le foot', heros: 'Pikachu', plat: 'les frites', horreur: 'les endives' } });
        expect(out).not.toMatch(/[[\]{}|]/);
      }
    }
  });
});

describe('la maîtresse se répète le moins possible', () => {
  it('sert une appréciation neuve tant que le vivier n\'est pas épuisé', () => {
    const used: string[] = [];
    for (let i = 0; i < 5; i++) {
      const line = pickAppreciation(1.15, true, 3, used, 90 + i);
      expect(used).not.toContain(line);
      used.push(line);
    }
  });

  it('retombe sur le vivier complet une fois tout servi', () => {
    const used: string[] = [];
    for (let i = 0; i < 40; i++) used.push(pickAppreciation(1.15, true, 3, used, i));
    expect(used.length).toBe(40);
  });
});

describe('les profils s\'accordent', () => {
  it('donne un nom masculin ou féminin à chaque archétype', () => {
    const profile = DEFAULT_PROFILE;
    for (const a of ARCHETYPES) {
      const m = say(a.name, { name: 'Léo', gender: 'm', profile });
      const f = say(a.name, { name: 'Léa', gender: 'f', profile });
      expect(m).not.toMatch(/[[\]|]/);
      expect(f).not.toMatch(/[[\]|]/);
    }
    expect(say(ARCHETYPES.find((a) => a.id === 'reveur')!.name, { name: 'Léa', gender: 'f', profile: DEFAULT_PROFILE }))
      .toBe('La rêveuse');
  });
});

describe('les mots de la fiche s\'insèrent sans faute d\'article', () => {
  it('ne produit jamais « à les » ni « de les »', () => {
    const profile = { ...DEFAULT_PROFILE, plat: 'les frites', horreur: 'les endives', cour: 'le mur des billes', chanson: 'la valse', heros: 'les Pokémon' };
    const textes = [
      ...MONOLOGUE, ...SCOLDS, ...PRAISES_BIG, ...PRAISES_SMALL, ...PRAISES_HUGE, ...SUSPICIONS, ...DUPLICATES,
      ...Object.values(APPRECIATIONS).flat(),
      ...INTERLUDES.flatMap((i) => [...i.lines, i.cry ?? '', i.fall]),
      ...SCENES.flatMap((s) => [...s.lines, ...s.choices.map((c) => c.detail)]),
    ];
    const valeurs = [profile.plat, profile.horreur, profile.cour, profile.chanson, profile.heros];
    for (const t of textes) {
      const out = say(t, { name: 'Alix', gender: 'f', profile });
      for (const v of valeurs) expect(out).not.toMatch(new RegExp(`(à|de|du) ${v}`, 'i'));
    }
  });
});
