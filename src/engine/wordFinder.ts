import { getAdjacentCells, posKey } from './adjacency';
import type { Trie, TrieNode } from './trie';
import type { Grid, Pos } from './types';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export interface WordSearch {
  words: Set<string>;
  cellWordCount: number[][]; // mots distincts passant par chaque case
  longWordCells: Set<number>; // cases (posKey) appartenant à un mot de 7+ lettres
  longestLength: number;
  longestStart: number | null; // posKey de la première case du mot le plus long (Oracle)
}

function isBlocked(r: number, c: number, blocked?: Set<number>): boolean {
  return blocked ? blocked.has(posKey(r, c)) : false;
}

// Exhaustif, une fois par grille. `blocked` = cases intraçables (Mur).
export function findAllWords(grid: Grid, trie: Trie, blocked?: Set<number>): WordSearch {
  const words = new Set<string>();
  const wordCells = new Map<string, Set<number>>();
  const used = new Set<number>();
  const path: number[] = [];
  let longestStart: number | null = null;
  let longestSeen = 0;

  function record(word: string) {
    words.add(word);
    if (word.length > longestSeen) { longestSeen = word.length; longestStart = path[0]; }
    let cells = wordCells.get(word);
    if (!cells) {
      cells = new Set();
      wordCells.set(word, cells);
    }
    for (const k of path) cells.add(k);
  }

  function dfs(row: number, col: number, node: TrieNode, prefix: string) {
    const cell = grid.cells[row][col];
    const branches = cell.isJoker ? ALPHABET : [cell.letter];
    for (const branch of branches) {
      const child = trie.walk(node, branch);
      if (!child) continue;
      const word = prefix + branch;
      if (child.isWord && word.length >= 3) record(word);
      for (const [r, c] of getAdjacentCells(row, col, grid)) {
        const key = posKey(r, c);
        if (used.has(key) || isBlocked(r, c, blocked)) continue;
        used.add(key);
        path.push(key);
        dfs(r, c, child, word);
        path.pop();
        used.delete(key);
      }
    }
  }

  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      if (isBlocked(r, c, blocked)) continue;
      const key = posKey(r, c);
      used.add(key);
      path.push(key);
      dfs(r, c, trie.root, '');
      path.pop();
      used.delete(key);
    }
  }

  const cellWordCount = Array.from({ length: grid.size }, () => Array(grid.size).fill(0) as number[]);
  const longWordCells = new Set<number>();
  let longestLength = 0;
  for (const [word, cells] of wordCells) {
    longestLength = Math.max(longestLength, word.length);
    for (const k of cells) {
      cellWordCount[Math.floor(k / 64)][k % 64]++;
      if (word.length >= 7) longWordCells.add(k);
    }
  }
  return { words, cellWordCount, longWordCells, longestLength, longestStart };
}

// Un chemin qui forme `word` dans la grille (jokers et QU gérés), ou null.
export function findPathForWord(grid: Grid, word: string): Pos[] | null {
  const used = new Set<number>();
  function dfs(r: number, c: number, i: number, path: Pos[]): Pos[] | null {
    const cell = grid.cells[r][c];
    const step = cell.isJoker ? 1 : cell.letter.length;
    if (!cell.isJoker && !word.startsWith(cell.letter, i)) return null;
    const next = [...path, [r, c] as Pos];
    if (i + step === word.length) return next;
    if (i + step > word.length) return null;
    for (const [nr, nc] of getAdjacentCells(r, c, grid)) {
      const key = posKey(nr, nc);
      if (used.has(key)) continue;
      used.add(key);
      const found = dfs(nr, nc, i + step, next);
      used.delete(key);
      if (found) return found;
    }
    return null;
  }
  for (let r = 0; r < grid.size; r++) {
    for (let c = 0; c < grid.size; c++) {
      const key = posKey(r, c);
      used.add(key);
      const found = dfs(r, c, 0, []);
      used.delete(key);
      if (found) return found;
    }
  }
  return null;
}

// Toutes les chaînes que peut former un chemin tracé (jokers → 26 branches),
// filtrées par le Trie. Le choix du meilleur candidat se fait côté scoring.
export function candidatesForPath(grid: Grid, path: Pos[], trie: Trie): string[] {
  const out: string[] = [];
  function rec(i: number, node: TrieNode, prefix: string) {
    if (i === path.length) {
      if (node.isWord && prefix.length >= 3) out.push(prefix);
      return;
    }
    const [r, c] = path[i];
    const cell = grid.cells[r][c];
    const branches = cell.isJoker ? ALPHABET : [cell.letter];
    for (const b of branches) {
      const child = trie.walk(node, b);
      if (child) rec(i + 1, child, prefix + b);
    }
  }
  rec(0, trie.root, '');
  return out;
}
