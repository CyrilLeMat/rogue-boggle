import { describe, expect, it } from 'vitest';
import { areAdjacent } from '../adjacency';
import { buildDictionary } from '../dictionary';
import { createRng } from '../rng';
import {
  carvePath, createSageChallenge, isCorrect, isSageManche,
  sageReward, sageSeconds, sageWordPool, wordFromPath,
} from '../sage';
import type { DictEntry } from '../types';

const entries: DictEntry[] = [
  { w: 'CHAUFFEUR', c: ['NOM'], f: true },
  { w: 'INCROYABLE', c: ['ADJ'], f: true },
  { w: 'ABANDONNEZ', c: ['VER'], f: true },      // verbe conjugué : devinette ingrate
  { w: 'CONFIDENTIEL', c: ['ADJ'], f: false },   // trop rare
  { w: 'CHIEN', c: ['NOM'], f: true },           // trop court
  { w: 'NOTAIRES', c: ['NOM'], f: true },
  { w: 'SENORITA', c: ['NOM'], f: true },        // anagramme de NOTAIRES
];
const dict = buildDictionary(entries);

describe('sage', () => {
  it('meets the sage after manches 3 and 7', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(isSageManche)).toEqual([3, 7]);
  });

  it('keeps only common nouns and adjectives of 8-12 letters', () => {
    expect(sageWordPool(entries).sort()).toEqual(['CHAUFFEUR', 'INCROYABLE', 'NOTAIRES', 'SENORITA']);
  });

  it('carves a self-avoiding path of adjacent cells', () => {
    for (let i = 0; i < 20; i++) {
      const path = carvePath(5, 12, createRng('p' + i))!;
      expect(path).not.toBeNull();
      expect(path.length).toBe(12);
      expect(new Set(path.map(([r, c]) => `${r},${c}`)).size).toBe(12);
      for (let k = 1; k < path.length; k++) expect(areAdjacent(path[k - 1], path[k])).toBe(true);
    }
  });

  it('scales time and reward with length', () => {
    expect([8, 10, 12].map(sageSeconds)).toEqual([39, 45, 51]);
    expect(sageReward(8, 0)).toBe(50);
    expect(sageReward(12, 21)).toBe(77);
  });

  it('plants the word along the path and leaves the rest mute', () => {
    for (let i = 0; i < 20; i++) {
      const c = createSageChallenge(['CHAUFFEUR'], createRng('c' + i));
      expect(c.word).toBe('CHAUFFEUR');
      expect(c.grid.size).toBe(5);
      expect(c.solution.length).toBe(9);
      expect(c.active.length).toBe(9);
      // le chemin solution écrit bien le mot, et les autres cases existent
      expect(wordFromPath(c.grid, c.solution)).toBe('CHAUFFEUR');
      expect(c.grid.cells.flat().length).toBe(25);
      expect(c.timeLeft).toBe(sageSeconds(9));
    }
  });

  it('accepts the target word or any valid anagram of it', () => {
    expect(isCorrect('NOTAIRES', 'NOTAIRES', dict)).toBe(true);
    expect(isCorrect('SENORITA', 'NOTAIRES', dict)).toBe(true); // le joueur a trouvé un autre mot juste
    expect(isCorrect('SENORITE', 'NOTAIRES', dict)).toBe(false);
    expect(isCorrect('NOTAIRE', 'NOTAIRES', dict)).toBe(false);
  });
});
