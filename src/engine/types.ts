export type WordCategory = 'NOM' | 'VER' | 'ADJ' | 'ADV' | 'AUTRE';

export interface DictEntry { w: string; c: WordCategory[]; f: boolean }

export interface Cell {
  letter: string; // "A".."Z" ou "QU"
  isJoker: boolean;
  isToxic: boolean;
  enemyId?: string;
  cracks?: number; // Tableau effacé : utilisations depuis le dernier renouvellement
  hole?: boolean;  // Cahier troué : case percée, plus traçable
  gen?: number;    // incrémenté à chaque renouvellement de lettre (animation)
}

export interface Grid {
  size: number;
  cells: Cell[][];
}

export type Pos = [number, number];
export type LetterWeights = Record<string, number>;
