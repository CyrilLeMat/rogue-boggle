// Le niveau déclaré à l'appel. Un CE2 a besoin de temps, un habitué a besoin d'obstacles. [tuning]
export interface Level {
  id: string;
  label: string;
  hint: string;
  seconds: number;    // × chrono
  threshold: number;  // × note à atteindre
}

export const LEVELS: Level[] = [
  { id: 'huit', label: 'J’ai vraiment 8 ans', hint: 'Moitié plus de temps, note à atteindre presque divisée par deux', seconds: 1.5, threshold: 0.55 },
  { id: 'douze', label: 'J’ai plutôt genre 12 ans', hint: 'Recommandé si tu n’as jamais fait de Boggle. Un peu plus de temps, note à atteindre allégée', seconds: 1.25, threshold: 0.75 },
  { id: 'adulte', label: 'Je suis un adulte, mais chut', hint: 'La dictée telle que la maîtresse l’a écrite', seconds: 1, threshold: 1 },
  { id: 'pro', label: 'Je suis boggleur professionnel', hint: 'Moins de temps, note à atteindre relevée. Elle t’attend au tournant', seconds: 0.85, threshold: 1.45 },
];

export const DEFAULT_LEVEL = 'douze';

export function level(id: string): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[2];
}
