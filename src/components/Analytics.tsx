import { useEffect } from 'react';
import { track } from '../analytics';
import { useRunStore } from '../state/runStore';
import { DEFAULT_PROFILE } from '../theme/lexicon';

// Écoute le store et compte les étapes franchies : le store reste pur, comme pour le son.
// L'entonnoir : ouvrir la feuille, remplir la fiche, finir le prologue, rendre la première
// dictée, tenir jusqu'à la rencontre, jusqu'au milieu, jusqu'à l'affrontement, et finir l'année.
export function Analytics() {
  const phase = useRunStore((s) => s.phase);
  const manche = useRunStore((s) => s.run?.currentManche ?? 0);
  const levelId = useRunStore((s) => s.run?.levelId ?? '');
  const profile = useRunStore((s) => s.run?.identity.profile ?? null);

  useEffect(() => {
    if (phase === 'appel') track('appel');
    if (phase === 'intro' && profile) {
      // rempli ou passé : on compte le nombre de réponses changées, jamais les réponses
      const changed = (Object.keys(DEFAULT_PROFILE) as (keyof typeof DEFAULT_PROFILE)[])
        .filter((k) => profile[k] !== DEFAULT_PROFILE[k]).length;
      track('fiche', changed >= 3 ? 'remplie' : 'passee');
    }
    if (phase === 'startPick') track('prologue-fini');
    if (phase === 'duelIntro') track('affrontement');
    if (phase === 'victory') track('fin-reussie', levelId);
    if (phase === 'gameover') track('fin-redoublement', levelId);
  }, [phase, levelId, profile]);

  useEffect(() => {
    if (phase !== 'recap') return;
    if (manche === 1) track('dictee-1', levelId);
    if (manche === 3) track('dictee-3');
    if (manche === 6) track('dictee-6');
  }, [phase, manche, levelId]);

  return null;
}
