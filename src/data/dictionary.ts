import { buildDictionary } from '../engine/dictionary';
import type { DictEntry } from '../engine/types';
import raw from './dictionnaire_fr.json';

export const dictionary = buildDictionary(raw as DictEntry[]);
