import { useRunStore } from '../state/runStore';
import { say } from './lexicon';

// Rend un texte avec le prénom et le genre de l'élève en cours.
export function useSay(): (text: string) => string {
  const identity = useRunStore((s) => s.run?.identity ?? null);
  return (text: string) => say(text, identity);
}
