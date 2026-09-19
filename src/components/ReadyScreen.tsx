import { mutator } from '../data/registry';
import { useRunStore } from '../state/runStore';

// Entre la boutique et la manche : la grille est visible mais floutée, le chrono attend un toucher.
export function ReadyOverlay() {
  const manche = useRunStore((s) => s.manche);
  const run = useRunStore((s) => s.run);
  const begin = useRunStore((s) => s.beginPlay);
  const reroll = useRunStore((s) => s.rerollGrid);
  if (!manche || !run) return null;
  const mut = manche.mutatorId ? mutator(manche.mutatorId) : null;
  return (
    <div className="ready-overlay">
      <span className="ready-title">Manche {run.currentManche} · {manche.grid.size}×{manche.grid.size}</span>
      {mut ? <span className="ready-line mutator">Thème — {mut.name} : {mut.description}</span> : <span className="ready-line">Manche classique, sans surprise</span>}
      <span className="ready-line">Seuil {manche.threshold} · grille {manche.difficulty.mood} · {Math.round(manche.totalSeconds)} s</span>
      {manche.graceSeconds > 0 && <span className="ready-line ok">+{manche.graceSeconds} s de répit après la vie perdue</span>}
      {manche.quest && <span className="ready-line">Objectif : {manche.quest.label} (+{manche.quest.reward} €)</span>}
      <button className="ready-cta" onClick={begin}>Lancer le chrono</button>
      {manche.gridRerollsLeft > 0 && (
        <button className="secondary small" onClick={reroll}>Sourcier : autre grille ({manche.gridRerollsLeft})</button>
      )}
    </div>
  );
}
