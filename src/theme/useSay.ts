import { useRunStore } from '../state/runStore';
import { say, spellNumber } from './lexicon';
import { TOTAL_MANCHES } from '../engine/rules';

// Rend un texte avec le prénom, le genre et l'avancement de l'élève en cours.
export function useSay(): (text: string) => string {
  const identity = useRunStore((s) => s.run?.identity ?? null);
  const manche = useRunStore((s) => s.run?.currentManche ?? 1);
  // {restantes} : plus jamais un nombre de dictées écrit en dur dans une planche
  const extra = { restantes: spellNumber(Math.max(0, TOTAL_MANCHES - manche)) };
  return (text: string) => say(text, identity, extra);
}
