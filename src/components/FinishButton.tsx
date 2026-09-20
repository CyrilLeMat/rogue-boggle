import { timeEuros } from '../engine/rules';
import { useRunStore } from '../state/runStore';
import { L, money } from '../theme/lexicon';

export function FinishButton() {
  const manche = useRunStore((s) => s.manche);
  const finish = useRunStore((s) => s.finishEarly);
  if (!manche) return null;
  if (manche.enemies.some((e) => e.typeId === 'kevin')) return null; // l'affrontement s'arrête quand il tombe
  const reached = manche.score >= manche.threshold;
  const gain = timeEuros(manche.timeLeft);
  return (
    <button
      className={`finish ${reached ? '' : 'secondary'}`}
      disabled={!reached}
      onClick={finish}
      title={reached ? 'Rends ta copie maintenant et empoche les secondes restantes' : 'Atteins la note pour pouvoir rendre en avance'}
    >
      {reached ? `${L.terminer} · +${money(gain)}` : L.terminerBloque}
    </button>
  );
}
