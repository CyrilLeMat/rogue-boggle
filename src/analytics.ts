// Combien de personnes ouvrent le lien, et jusqu'où elles vont. Rien d'autre.
// On n'envoie jamais ce que le joueur écrit : ni son prénom, ni ses vingt-deux mots,
// ni ses scores — seulement le nom de l'étape atteinte, et le niveau choisi.
// Le compteur (GoatCounter) ne pose pas de cookie et ignore les visites locales.

interface Counter { count(o: { path: string; title: string; event: boolean }): void }

// Une étape ne compte qu'une fois par visite : c'est un entonnoir, pas un journal.
const done = new Set<string>();

export function track(step: string, detail?: string) {
  if (done.has(step)) return;
  done.add(step);
  const gc = (window as unknown as { goatcounter?: Counter }).goatcounter;
  try { gc?.count({ path: detail ? `${step}/${detail}` : step, title: step, event: true }); } catch { /* compteur absent */ }
}
