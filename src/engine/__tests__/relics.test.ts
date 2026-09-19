import { describe, expect, it } from 'vitest';
import { RELICS, RELIC_BY_ID } from '../../data/relics';
import { relics } from '../../data/registry';
import { buildDictionary } from '../dictionary';
import type { MancheView, RunView } from '../hooks';
import { collectModifiers, makeContext, runGridGenerate, runMancheEnd, runRunEnd, runWordAccepted } from '../hookRunner';
import { makeCell } from '../gridGenerator';
import { createRng } from '../rng';
import { applyModifiers } from '../scoring';
import type { Grid } from '../types';
import { findAllWords } from '../wordFinder';

const dict = buildDictionary([
  { w: 'PORTE', c: ['NOM', 'VER'], f: true },
  { w: 'PORTES', c: ['NOM', 'VER'], f: true },
  { w: 'TROPE', c: ['NOM'], f: false },
  { w: 'VITE', c: ['ADV'], f: true },
  { w: 'ELLE', c: ['AUTRE'], f: true },
  { w: 'TAXI', c: ['NOM'], f: true },
]);

function grid(rows: string[]): Grid {
  return { size: rows.length, cells: rows.map((r) => r.split(' ').map(makeCell)) };
}

function setup(relicIds: string[], g = grid(['P O R', 'X T E', 'V I S'])) {
  const run: RunView = { score: 0, euros: 40, lives: 3, currentManche: 3, relicIds, killCount: 0 };
  const manche: MancheView = {
    grid: g, search: findAllWords(g, dict.trie), threshold: 100, difficulty: { potential: 0, factor: 1, mood: 'normale' }, found: [], timeLeft: 60, timeLeftBeforeWord: 60, elapsed: 30,
    cursedWord: null, cursedStart: null, radarCell: null, relicState: {}, bonuses: [],
    streak: { links: 0, lastAt: -Infinity }, quest: null, luckyLetter: null,
    inspiration: null, gridDirty: false, mutatorId: null,
  };
  const ctx = makeContext(createRng('t'), run, manche, dict);
  return { run, manche, ctx, relics: relics(relicIds) };
}

describe('relics data', () => {
  it('has 35 unique ids and valid requires', () => {
    expect(RELICS.length).toBe(35);
    expect(new Set(RELICS.map((r) => r.id)).size).toBe(35);
    for (const r of RELICS) if (r.requires) expect(RELIC_BY_ID.has(r.requires)).toBe(true);
  });
});

describe('scoring relics', () => {
  it('Lexicographe, Voyelliste, Rareté', () => {
    const { ctx, relics } = setup(['lexicographe', 'voyelliste', 'rarete']);
    const mods = collectModifiers('PORTES', relics, ctx);
    // base fictive 10 : (10 + 2 voyelles) × 1.5 = 18 ; pas de lettre rare
    expect(applyModifiers(10, mods)).toBe(18);
    expect(applyModifiers(10, collectModifiers('TAXI', relics, ctx))).toBe(17); // 10 + 2 + 5
  });
  it('categories match any cgram of the word, percents multiply', () => {
    const { ctx, relics } = setup(['conjugueur', 'nominaliste']);
    expect(applyModifiers(100, collectModifiers('PORTE', relics, ctx))).toBe(182);
    expect(applyModifiers(100, collectModifiers('TROPE', relics, ctx))).toBe(130);
  });
  it('Lettre porte-bonheur doubles words starting with it, Lettre bénie the ones containing it', () => {
    const { ctx, relics, manche } = setup(['porte-bonheur', 'porte-bonheur-plus']);
    RELIC_BY_ID.get('porte-bonheur')!.onMancheStart!(ctx);
    expect(manche.luckyLetter).toBeNull(); // aucune lettre ne commence 3 mots dans ce mini-dico
    manche.luckyLetter = 'P';
    expect(applyModifiers(10, collectModifiers('PORTE', relics, ctx))).toBe(20);
    expect(applyModifiers(10, collectModifiers('TROPE', relics, ctx))).toBe(20);
    expect(applyModifiers(10, collectModifiers('VITE', relics, ctx))).toBe(10);
  });
  it('Amplificateur and Résonance stack multiplicatively', () => {
    const { ctx, relics } = setup(['amplificateur', 'resonance']);
    expect(applyModifiers(100, collectModifiers('VITE', relics, ctx))).toBe(208);
  });
  it('Anagramme and Palindrome', () => {
    const { ctx, relics, manche } = setup(['anagramme', 'palindrome']);
    manche.found.push({ word: 'PORTE', score: 1, at: 0, path: [] });
    expect(applyModifiers(0, collectModifiers('TROPE', relics, ctx))).toBe(30);
    expect(applyModifiers(0, collectModifiers('ELLE', relics, ctx))).toBe(150);
  });
  it('Mot maudit picks a common 5-7 letter word and pays 100', () => {
    const { ctx, relics, manche } = setup(['mot-maudit']);
    RELIC_BY_ID.get('mot-maudit')!.onMancheStart!(ctx);
    expect(manche.cursedWord).toMatch(/^PORTES?$/);
    expect(manche.cursedStart).toBe(0); // P en (0,0)
    expect(applyModifiers(0, collectModifiers(manche.cursedWord!, relics, ctx))).toBe(60);
  });
});

describe('side-effect relics', () => {
  it('Métronome adds time, Sablier floors it', () => {
    const { ctx, relics, manche } = setup(['metronome', 'sablier']);
    runWordAccepted({ word: 'VITE', score: 1, at: 0, path: [] }, relics, ctx);
    expect(manche.timeLeft).toBe(62);
    manche.timeLeft = 4;
    runWordAccepted({ word: 'VITE', score: 1, at: 0, path: [] }, relics, ctx);
    expect(manche.timeLeft).toBe(10);
  });
  it('toxic cells cost 8 s, Bouclier neutralizes the first one per manche', () => {
    const g = grid(['P O R', 'X T E', 'V I S']);
    g.cells[0][0].isToxic = true;
    g.cells[0][1].isToxic = true;
    const { ctx, relics, manche } = setup(['bouclier'], g);
    runWordAccepted({ word: 'PORTE', score: 1, at: 0, path: [[0, 0], [0, 1]] }, relics, ctx);
    expect(manche.timeLeft).toBe(52);
    runWordAccepted({ word: 'PORTE', score: 1, at: 0, path: [[0, 0]] }, relics, ctx);
    expect(manche.timeLeft).toBe(44);
  });
  it('Mémoire pays once when all but the tolerated cells have been used', () => {
    const g = grid(['A B C', 'D E F', 'G H I']); // tolérance 1 en 3×3
    const { ctx, relics, manche } = setup(['memoire'], g);
    manche.found.push({ word: 'X', score: 0, at: 0, path: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0]] });
    runWordAccepted(manche.found[0], relics, ctx);
    expect(manche.bonuses).toEqual([]);
    manche.found.push({ word: 'Y', score: 0, at: 0, path: [[2, 1]] });
    runWordAccepted(manche.found[1], relics, ctx);
    expect(manche.bonuses).toEqual([{ label: 'Grille complète', points: 100 }]);
    runWordAccepted(manche.found[1], relics, ctx);
    expect(manche.bonuses.length).toBe(1);
  });
  it('jokers are placed by onGridGenerate, double requires single', () => {
    const { ctx, relics } = setup(['case-joker', 'double-joker']);
    const g = runGridGenerate(grid(['A B', 'C D']), relics, ctx);
    expect(g.cells.flat().filter((c) => c.isJoker).length).toBe(2);
  });
  it('Économe and Alchimiste', () => {
    const { ctx, relics } = setup(['econome', 'alchimiste']);
    expect(runMancheEnd(relics, ctx, true, 20)).toBe(26);
    expect(runMancheEnd(relics, ctx, false, 20)).toBe(20);
    expect(runRunEnd(relics, ctx)).toBe(80);
  });
  it('Radar picks a cell of a 7+ word or null', () => {
    const { ctx, manche } = setup(['radar']);
    RELIC_BY_ID.get('radar')!.onMancheStart!(ctx);
    expect(manche.radarCell).toBeNull(); // aucun mot de 7+ dans ce mini-dico
  });
});
