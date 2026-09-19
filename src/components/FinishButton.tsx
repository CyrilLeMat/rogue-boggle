import { timeEuros } from '../engine/rules';
import { useRunStore } from '../state/runStore';

export function FinishButton() {
  const manche = useRunStore((s) => s.manche);
  const finish = useRunStore((s) => s.finishEarly);
  if (!manche) return null;
  const reached = manche.score >= manche.threshold;
  const gain = timeEuros(manche.timeLeft);
  return (
    <button
      className={`finish ${reached ? '' : 'secondary'}`}
      disabled={!reached}
      onClick={finish}
      title={reached ? 'Termine la manche maintenant et empoche les secondes restantes' : 'Atteins le seuil pour pouvoir terminer en avance'}
    >
      {reached ? `Terminer la manche · +${gain} €` : 'Terminer (seuil non atteint)'}
    </button>
  );
}
