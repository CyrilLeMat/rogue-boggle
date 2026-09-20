// Cinq paliers d'intensité : un mot à 8 points ne se fête pas comme un mot à 120. [tuning]
export const SCORE_TIERS = [12, 25, 45, 80];

export function scoreTier(score: number): number {
  return SCORE_TIERS.filter((t) => score >= t).length + 1;
}
