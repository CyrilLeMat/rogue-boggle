import { describe, expect, it } from 'vitest';
import { buildDictionary } from '../dictionary';
import { createRng } from '../rng';
import {
  applyHint, createSageChallenge, formedWord, isCorrect, isSageManche,
  sageReward, sageSeconds, sageWordPool, shuffleLetters, type SageChallenge,
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

  it('shuffles into the same letters but a different order', () => {
    for (let i = 0; i < 20; i++) {
      const out = shuffleLetters('CHAUFFEUR', createRng('s' + i));
      expect(out.join('')).not.toBe('CHAUFFEUR');
      expect([...out].sort().join('')).toBe([...'CHAUFFEUR'].sort().join(''));
    }
  });

  it('scales time and reward with length', () => {
    expect([8, 10, 12].map(sageSeconds)).toEqual([39, 45, 51]);
    expect(sageReward(8, 0)).toBe(50);
    expect(sageReward(12, 21)).toBe(77);
  });

  it('accepts the target word or any valid anagram of it', () => {
    expect(isCorrect('NOTAIRES', 'NOTAIRES', dict)).toBe(true);
    expect(isCorrect('SENORITA', 'NOTAIRES', dict)).toBe(true); // le joueur a trouvé un autre mot juste
    expect(isCorrect('SENORITE', 'NOTAIRES', dict)).toBe(false);
    expect(isCorrect('NOTAIRE', 'NOTAIRES', dict)).toBe(false);
  });

  it('hint places the first letter and solving fills the word', () => {
    const c = createSageChallenge(['CHAUFFEUR'], createRng('h'));
    expect(c.word).toBe('CHAUFFEUR');
    expect(c.timeLeft).toBe(sageSeconds(9));
    const hinted = applyHint(c);
    expect(hinted.hintGiven).toBe(true);
    expect(formedWord(hinted)).toBe('C');

    // on complète le mot lettre par lettre en partant de l'indice
    let cur: SageChallenge = hinted;
    for (const letter of c.word.slice(1)) {
      const idx = cur.letters.findIndex((l, i) => l === letter && !cur.placed.includes(i));
      cur = { ...cur, placed: [...cur.placed, idx] };
    }
    expect(formedWord(cur)).toBe('CHAUFFEUR');
    expect(isCorrect(formedWord(cur), cur.word, dict)).toBe(true);
  });
});
