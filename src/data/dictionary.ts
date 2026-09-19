import { buildDictionary } from '../engine/dictionary';
import { sageWordPool } from '../engine/sage';
import type { DictEntry } from '../engine/types';
import raw from './dictionnaire_fr.json';

export const dictionary = buildDictionary(raw as DictEntry[]);

// Noms et adjectifs courants de 8 à 12 lettres, pour les énigmes du Sage du CM1.
let cachedSageWords: string[] | null = null;
export function sageWords(): string[] {
  if (!cachedSageWords) cachedSageWords = sageWordPool(raw as DictEntry[]);
  return cachedSageWords;
}
