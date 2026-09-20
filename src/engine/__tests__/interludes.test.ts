import { describe, expect, it } from 'vitest';
import { INTERLUDES, hasInterlude, memoryAfter, pickInterlude } from '../../data/interludes';
import { ARCHETYPES } from '../../data/archetypes';
import { buildDictionary } from '../dictionary';
import { makeCell } from '../gridGenerator';
import { resolvePath } from '../manche';
import { SCENES } from '../../data/scenes';
import { APPRECIATIONS, DEFAULT_PROFILE, EV, L, SHOP_INTRO, mention, DUPLICATES, MONOLOGUE, PRAISES_BIG, PRAISES_HUGE, PRAISES_SMALL, SCOLDS, SUSPICIONS, TOO_SHORT, VOW, pickAppreciation, say, spellNumber } from '../../theme/lexicon';
import { createRng } from '../rng';
import { createRacket, planEvents } from '../events';
import { epilogue } from '../../theme/epilogue';

describe('couloirs de l\'année', () => {
  it('montent jusqu\'au racket : Kévin défie, puis Kévin prend', () => {
    for (let i = 0; i < 30; i++) {
      const plan = planEvents(createRng('an' + i));
      expect(plan.length).toBe(4);
      expect(plan[2]).toBe('kevin');
      expect(plan[3]).toBe('racket');
      expect(plan.slice(0, 2)).toContain('sage');
      expect(new Set(plan).size).toBe(4);
    }
  });

  it('laisse le racket sans issue : il prend ce qu\'il a décidé avant', () => {
    const ev = createRacket(['amorce', 'resonance'], 'resonance', 0);
    expect(ev.outcome).toBe('playing');
    expect(ev.demanded).toBe('resonance');
    expect(ev.seconds).toBe(0); // pas de chrono : ce n'est pas un défi
  });
});

describe('planches de transition', () => {
  it('ne se jouent qu\'après les dictées impaires, et jamais après la première', () => {
    expect([1, 2, 3, 4, 5].map(hasInterlude)).toEqual([false, false, true, false, true]);
  });

  it('déroulent l\'arc de Kévin dans l\'ordre', () => {
    const rng = createRng('kevin');
    expect(pickInterlude(3, true, [], rng)).toBe('kevin1');
    expect(pickInterlude(5, true, ['kevin1'], rng)).toBe('kevin2');
    expect(pickInterlude(9, false, ['kevin1', 'kevin2'], rng)).toBe('kevin3');
  });

  it('font remonter le passé dans l\'ordre, jamais au hasard', () => {
    expect(memoryAfter(4, [])).toBe('ete');
    expect(memoryAfter(7, ['ete'])).toBe('mamie');
    expect(memoryAfter(10, ['ete', 'mamie'])).toBe('pluie');
    expect(memoryAfter(4, ['ete'])).toBeNull();   // jamais deux fois
    expect(memoryAfter(3, [])).toBeNull();        // les souvenirs n'ont que leurs trois dates
    expect(memoryAfter(8, [])).toBeNull();  // jamais collé au racket
  });

  it('gardent les souvenirs hors du tirage des transitions', () => {
    const rng = createRng('souvenirs');
    const memories = INTERLUDES.filter((i) => i.era).map((i) => i.id);
    for (let i = 0; i < 40; i++) {
      for (const success of [true, false]) {
        const id = pickInterlude(3, success, [], rng);
        expect(memories).not.toContain(id);
      }
    }
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
      VOW.lead, VOW.text, VOW.afterLoss, VOW.lastOne,
      mention(19, true).note, mention(5, false).note,
      ...EV.sage.intro, ...EV.kevin.intro, ...EV.billes.intro, EV.kevin.ask(6), EV.inspecteur.wrong,
      L.victoireSub, L.gameoverSub(4),
    ];
    for (const gender of ['m', 'f'] as const) {
      for (const t of texts) {
        // mêmes jetons que l'interface : useSay ajoute toujours ce qui dépend de la partie
        const out = say(t, { name: 'Alix', gender, profile: { ...DEFAULT_PROFILE, rigolo: 'patate', adjectif: 'mou', nombre: 'sept', action: 'courir', cri: 'AAAH', salut: 'Wesh', phrase: 'Tranquille', cour: 'le foot', heros: 'Pikachu', plat: 'les frites', horreur: 'les endives' } }, { restantes: spellNumber(9) });
        expect(out).not.toMatch(/[[\]{}|]/);
      }
    }
  });
});

describe('épilogue', () => {
  it('raconte une fin différente selon ce qui s\'est passé avec Kévin', () => {
    const base = { moyenne: 14, lives: 3, words: 120, bestWord: 'CARTABLE', manche: 11 };
    const gagne = epilogue({ ...base, victory: true, duelDone: true, duelWon: true, stolen: null });
    const perdu = epilogue({ ...base, victory: true, duelDone: true, duelWon: false, stolen: 'Stylo en or' });
    const jamais = epilogue({ ...base, victory: false, duelDone: false, duelWon: false, stolen: null, manche: 6 });
    expect(gagne.map((b) => b.text)).not.toEqual(perdu.map((b) => b.text));
    expect(perdu.some((b) => b.text.includes('Stylo en or'))).toBe(true);
    expect(jamais.some((b) => b.text.includes('copié sur quelqu\'un d\'autre'))).toBe(true);
  });

  it('ne laisse aucun marqueur, quelle que soit la fin', () => {
    const id = { name: 'Alix', gender: 'm' as const, profile: DEFAULT_PROFILE };
    for (const victory of [true, false]) {
      for (const moyenne of [18, 14, 8]) {
        for (const duelWon of [true, false]) {
          const beats = epilogue({ victory, moyenne, lives: 2, duelDone: true, duelWon, stolen: 'Buvard', words: 90, bestWord: 'MARELLE', manche: 11 });
          for (const b of beats) expect(say(b.text, id, { restantes: 'deux' })).not.toMatch(/[[\]{}|]/);
        }
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

describe('la case blanche', () => {
  const grid = {
    size: 3,
    cells: [
      [{ ...makeCell('A'), isJoker: true }, makeCell('R'), makeCell('T')],
      [makeCell('B'), makeCell('E'), makeCell('S')],
      [makeCell('C'), makeCell('D'), makeCell('L')],
    ],
  };
  const dict = buildDictionary([{ w: 'ART', c: ['NOM'], f: true }, { w: 'ARTS', c: ['NOM'], f: true }]);
  const trace = (path: [number, number][], min: number) =>
    resolvePath(grid, path, dict, new Set(), () => [], 0, min).kind;

  it('refuse les mots de trois lettres quand elle est limitée', () => {
    expect(trace([[0, 0], [0, 1], [0, 2]], 4)).toBe('tooShort');
  });

  it('les accepte quand la légendaire lève la condition', () => {
    expect(trace([[0, 0], [0, 1], [0, 2]], 3)).toBe('ok');
  });

  it('marche toujours sur les mots plus longs', () => {
    expect(trace([[0, 0], [0, 1], [0, 2], [1, 2]], 4)).toBe('ok');
  });
});
