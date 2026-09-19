import { buildDictionary } from '../engine/dictionary';
import { inspectorWordPool } from '../engine/events';
import { sageWordPool } from '../engine/sage';
import type { DictEntry } from '../engine/types';
import raw from './dictionnaire_fr.json';

export const dictionary = buildDictionary(raw as DictEntry[]);

// Noms et adjectifs courants : 8 à 12 lettres pour le sage, 6 à 9 pour l'inspecteur.
let cachedSageWords: string[] | null = null;
export function sageWords(): string[] {
  if (!cachedSageWords) cachedSageWords = sageWordPool(raw as DictEntry[]);
  return cachedSageWords;
}

let cachedInspectorWords: string[] | null = null;
export function inspectorWords(): string[] {
  if (!cachedInspectorWords) cachedInspectorWords = inspectorWordPool(raw as DictEntry[]);
  return cachedInspectorWords;
}
