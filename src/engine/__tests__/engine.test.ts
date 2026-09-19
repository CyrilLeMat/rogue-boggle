import { describe, expect, it } from 'vitest';
import { createRng } from '../rng';
import { Trie } from '../trie';
import { candidatesForPath, findAllWords } from '../wordFinder';
import { FRENCH_STANDARD_WEIGHTS, defaultQualityGate, generateGrid, makeCell, passesQualityGate } from '../gridGenerator';
import { applyModifiers, baseScore, baseScoreFromLetters, lengthMultiplier } from '../scoring';
import type { Grid } from '../types';
import { buildDictionary } from '../dictionary';
import { adjustThreshold, difficultyOf, gridPotential } from '../difficulty';
import { eurosFor, gridSizeFor, mancheSecondsFor, timeEuros } from '../rules';

function gridOf(rows: string[]): Grid {
  return { size: rows.length, cells: rows.map((r) => r.split(' ').map(makeCell)) };
}

const trie = new Trie();
for (const w of ['CAT', 'ART', 'RAT', 'TAR', 'TRA', 'CART', 'QUE', 'QUI', 'ROQUE', 'ARC', 'CAR', 'ACRE', 'RACE']) trie.insert(w);

describe('rng', () => {
  it('is deterministic by seed', () => {
    const a = createRng('abc');
    const b = createRng('abc');
    expect([a.next(), a.next(), a.int(10)]).toEqual([b.next(), b.next(), b.int(10)]);
  });
});

describe('trie', () => {
  it('walks multi-letter tiles', () => {
    const n = trie.walk(trie.root, 'QU');
    expect(n).not.toBeNull();
    expect(trie.has('QUE')).toBe(true);
    expect(trie.has('QU')).toBe(false);
  });
});

describe('findAllWords', () => {
  it('finds words along adjacent paths without reusing cells', () => {
    const g = gridOf(['C A', 'R T']);
    const { words, cellWordCount } = findAllWords(g, trie);
    expect(words).toEqual(new Set(['CAT', 'ART', 'RAT', 'TAR', 'TRA', 'CART', 'ARC', 'CAR']));
    expect(cellWordCount[0][0]).toBeGreaterThan(0);
  });
  it('records where the longest word starts', () => {
    const g = gridOf(['C A', 'R T']);
    const { longestStart, longestLength } = findAllWords(g, trie);
    expect(longestLength).toBe(4); // CART
    expect(longestStart).toBe(0 * 64 + 0);
  });
  it('handles QU tile as two letters', () => {
    const g = gridOf(['QU E', 'I R']);
    const { words } = findAllWords(g, trie);
    expect(words.has('QUE')).toBe(true);
    expect(words.has('QUI')).toBe(true);
  });
  it('expands jokers', () => {
    const g = gridOf(['C A', 'R T']);
    g.cells[0][0] = { letter: 'C', isJoker: true, isToxic: false };
    const { words } = findAllWords(g, trie);
    expect(words.has('CAR')).toBe(true); // joker joue C
    expect(words.has('TRA')).toBe(true); // joker joue T
  });
  it('respects blocked cells', () => {
    const g = gridOf(['C A', 'R T']);
    const { words } = findAllWords(g, trie, new Set([0 * 64 + 0]));
    expect(words.has('CAT')).toBe(false);
    expect(words.has('ART')).toBe(true);
  });
});

describe('candidatesForPath', () => {
  it('resolves joker to every matching word', () => {
    const g = gridOf(['C A', 'R T']);
    g.cells[1][0] = { letter: 'R', isJoker: true, isToxic: false };
    const c = candidatesForPath(g, [[0, 0], [0, 1], [1, 0]], trie);
    expect(c).toEqual(['CAR', 'CAT']);
  });
});

describe('scoring', () => {
  it('length multipliers', () => {
    expect([3, 4, 5, 6, 7, 8, 12].map(lengthMultiplier)).toEqual([1, 1, 2, 2, 3, 4, 4]);
  });
  it('joker counts 1, QU counts 8', () => {
    const g = gridOf(['QU E', 'I R']);
    expect(baseScore('QUE', g, [[0, 0], [0, 1]])).toBe(9);
    g.cells[0][1] = { letter: 'E', isJoker: true, isToxic: false };
    expect(baseScore('QUI', g, [[0, 0], [0, 1]])).toBe(9);
    expect(baseScoreFromLetters('QUE')).toBe(9);
  });
  it('pipeline: flat, multiplicative percents, final', () => {
    expect(applyModifiers(10, [{ flat: 5 }, { percent: 0.5 }, { percent: 0.5 }, { final: 2 }])).toBe(68);
  });
});

describe('generateGrid', () => {
  it('produces a grid passing the gate with a real-ish trie', () => {
    const words = ['TES', 'SET', 'EST', 'ETE', 'NET', 'TEN', 'SEN', 'ENS', 'RAS', 'SAR', 'ART', 'RAT', 'TAR', 'AIR', 'RAI', 'RIA', 'SIR', 'RIS', 'TIR', 'TRI', 'LIT', 'TIL', 'LIE', 'ILE', 'ELU', 'LUE', 'RUE', 'URE', 'NUE', 'UNE', 'ANE', 'NEA', 'ONT', 'TON', 'NOT', 'SON', 'NOS', 'OSE', 'SOL', 'LOS', 'ROI', 'OIR'];
    const dict = buildDictionary(words.map((w) => ({ w, c: ['NOM' as const], f: true })));
    const rng = createRng('seed');
    const gate = { minVowels: 4, maxExpensive: 2, minWords: 5, minPotential: 0 };
    const res = generateGrid(4, FRENCH_STANDARD_WEIGHTS, rng, dict, (g) => g, gate);
    expect(res.grid.size).toBe(4);
    expect(passesQualityGate(res.grid, res.search, gate)).toBe(true);
    expect(defaultQualityGate(6).minWords).toBe(100);
    expect(defaultQualityGate(4).minPotential).toBe(114);
  });
  it('measures potential on the raw grid, before post-processing', () => {
    const dict = buildDictionary([{ w: 'ART', c: ['NOM'], f: true }, { w: 'RAT', c: ['NOM'], f: true }, { w: 'TAR', c: ['NOM'], f: false }]);
    const rng = createRng('x');
    const gate = { minVowels: 0, maxExpensive: 99, minWords: 0, minPotential: 0 };
    const res = generateGrid(3, { A: 1, R: 1, T: 1 }, rng, dict, (g) => ({ ...g, cells: g.cells.map((row, r) => row.map((c, i) => (r === 0 && i === 0 ? { ...c, isJoker: true } : c))) }), gate);
    expect(res.grid.cells[0][0].isJoker).toBe(true);
    expect(res.rawPotential).toBeLessThanOrEqual(gridPotential(res.search, dict));
  });
});

describe('time per size', () => {
  it('adds 15 s per size step', () => {
    expect([4, 5, 6, 7].map(mancheSecondsFor)).toEqual([90, 105, 120, 135]);
  });
});

describe('grid size schedule', () => {
  it('grows with the manche', () => {
    expect([1, 2, 3, 5, 6, 8, 9, 10].map(gridSizeFor)).toEqual([4, 4, 5, 5, 6, 6, 6, 6]);
  });
});

describe('euros', () => {
  it('floor, 1 per point over threshold, capped, nothing extra on failure', () => {
    expect(eurosFor(60, 60, true)).toEqual({ base: 20, bonus: 0, total: 20 });
    expect(eurosFor(95, 60, true)).toEqual({ base: 20, bonus: 35, total: 55 });
    expect(eurosFor(1000, 60, true)).toEqual({ base: 20, bonus: 80, total: 100 });
    expect(eurosFor(30, 60, false)).toEqual({ base: 10, bonus: 0, total: 10 });
  });
  it('1 euro per 5 seconds left when finishing early', () => {
    expect([0, 4, 5, 47, 90].map(timeEuros)).toEqual([0, 0, 1, 9, 18]);
  });
});

describe('difficulty', () => {
  it('clamps the factor and labels the mood', () => {
    expect(difficultyOf(190, 4).factor).toBeCloseTo(1);
    expect(difficultyOf(190, 4).mood).toBe('normale');
    expect(difficultyOf(50, 4)).toMatchObject({ factor: 0.7, mood: 'aride' });
    expect(difficultyOf(900, 4)).toMatchObject({ factor: 1.3, mood: 'généreuse' });
  });
  it('rounds the adjusted threshold to tens', () => {
    expect(adjustThreshold(330, 0.7)).toBe(230);
    expect(adjustThreshold(100, 1.3)).toBe(130);
  });
});
