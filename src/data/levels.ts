// Le niveau déclaré à l'appel. Un CE2 a besoin de temps, un habitué a besoin d'obstacles. [tuning]
export interface Level {
  id: string;
  label: string;
  hint: string;
  seconds: number;    // × chrono
  threshold: number;  // × note à atteindre
  noFail?: boolean;   // mode histoire : on rate des dictées, on ne perd jamais de bon point
}

export const LEVELS: Level[] = [
  {
    id: 'histoire', label: 'Je veux juste l’histoire',
    hint: 'Deux fois plus de temps, note à atteindre ridicule, aucun bon point à perdre. Tu écriras mal, tu passeras quand même, et tu te sentiras en position de succès',
    seconds: 2, threshold: 0.25, noFail: true,
  },
  { id: 'huit', label: 'J’ai vraiment 8 ans', hint: 'Moitié plus de temps, note à atteindre presque divisée par deux', seconds: 1.5, threshold: 0.5 },
  { id: 'douze', label: 'J’ai plutôt genre 12 ans', hint: 'Recommandé si tu n’as jamais fait de Boggle. Un peu plus de temps, note à atteindre allégée', seconds: 1.25, threshold: 0.7 },
  { id: 'adulte', label: 'Je suis un adulte, mais chut', hint: 'La dictée telle que la maîtresse l’a écrite', seconds: 1, threshold: 1 },
  { id: 'pro', label: 'Je suis boggleur professionnel', hint: 'Moins de temps, note à atteindre relevée. Elle t’attend au tournant', seconds: 0.9, threshold: 1.45 },
];

export const DEFAULT_LEVEL = 'douze';

export function level(id: string): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[2];
}
