// [tuning] La grille grandit avec la run : 4×4 pour se chauffer, puis 5, puis 6.
// Le 7×7 n'est pas le trajet normal : il n'arrive que par la condition « Grille géante ».
export const GRID_SIZE_BY_MANCHE: [fromManche: number, size: number][] = [[1, 4], [3, 5], [6, 6]];

export function gridSizeFor(manche: number): number {
  let size = GRID_SIZE_BY_MANCHE[0][1];
  for (const [from, s] of GRID_SIZE_BY_MANCHE) if (manche >= from) size = s;
  return size;
}
export const MANCHE_SECONDS = 90;
// [tuning] Les grandes grilles demandent plus de lecture : +15 s par palier de taille.
export const EXTRA_SECONDS_PER_SIZE = 15;
export function mancheSecondsFor(size: number): number {
  return MANCHE_SECONDS + EXTRA_SECONDS_PER_SIZE * Math.max(0, size - 4);
}
// [tuning] Filet anti-spirale : après une vie perdue, la manche suivante offre quelques secondes de plus.
export const GRACE_SECONDS_AFTER_LOSS = 10;

// Série : mots validés à moins de STREAK_WINDOW s d'intervalle. Chaque maillon ajoute STREAK_STEP au
// multiplicateur final, plafonné. Le relic Combo élargit la fenêtre et le plafond.
export const STREAK_WINDOW = 5;
export const STREAK_STEP = 0.1;
export const STREAK_MAX_LINKS = 5;
export const TOTAL_MANCHES = 10;
export const STARTING_LIVES = 3;
export const MIN_WORD_LENGTH = 3;

// [tuning] 100 × 1.35^n jugé infranchissable en playtest ; ×1.3 simulé impossible même pour un
// expert sans relic (score humain ~plat, seuil exponentiel). ×1.2 : un bon joueur finit sans relic,
// un joueur moyen a besoin de la boutique.
export const THRESHOLD_BASE = 60;
export const THRESHOLD_GROWTH = 1.25; // [tuning] 1.2 était trivial en fin de run avec des multiplicateurs empilés
export const MAX_SAME_CHARM = 3;      // [tuning] exemplaires max d'un même charme

export function threshold(manche: number): number {
  return Math.round((THRESHOLD_BASE * Math.pow(THRESHOLD_GROWTH, manche - 1)) / 10) * 10;
}

// [tuning] Plancher garanti (un petit achat toujours possible), puis 1 € par point
// au-dessus du seuil, plafonné pour ne pas vider la boutique en fin de run.
export const EURO_FLOOR = 15;
export const EURO_FLOOR_FAIL = 8;
export const EURO_PER_POINT = 1;
export const EURO_BONUS_CAP = 60;

// [tuning] Terminer la manche en avance : 1 € par tranche de 5 s restantes.
export const EURO_PER_SECONDS_LEFT = 5;
export function timeEuros(secondsLeft: number): number {
  return Math.floor(Math.max(0, secondsLeft) / EURO_PER_SECONDS_LEFT);
}

export interface EuroBreakdown { base: number; bonus: number; total: number }

export function eurosFor(score: number, thresholdValue: number, success: boolean): EuroBreakdown {
  const base = success ? EURO_FLOOR : EURO_FLOOR_FAIL;
  const bonus = success ? Math.min(EURO_BONUS_CAP, Math.floor(Math.max(0, score - thresholdValue) * EURO_PER_POINT)) : 0;
  return { base, bonus, total: base + bonus };
}
