import { Trie } from './trie';
import type { DictEntry, WordCategory } from './types';

export interface Dictionary {
  trie: Trie;
  categories: Map<string, Set<WordCategory>>;
  common: Set<string>;
  categoriesOf(word: string): Set<WordCategory>;
}

const EMPTY: Set<WordCategory> = new Set();

export function buildDictionary(entries: DictEntry[]): Dictionary {
  const trie = new Trie();
  const categories = new Map<string, Set<WordCategory>>();
  const common = new Set<string>();
  for (const e of entries) {
    trie.insert(e.w);
    categories.set(e.w, new Set(e.c));
    if (e.f) common.add(e.w);
  }
  return {
    trie,
    categories,
    common,
    categoriesOf: (w) => categories.get(w) ?? EMPTY,
  };
}
