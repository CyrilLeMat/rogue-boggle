import { mutator } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { L, NARRATOR, money } from '../theme/lexicon';

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
      <p className="narrator">{NARRATOR[(run.currentManche - 1) % NARRATOR.length]}</p>
      <span className="ready-title">{L.manche} {run.currentManche} · {manche.grid.size}×{manche.grid.size}</span>
      {mut ? <span className="ready-line mutator">{L.theme} — {mut.name} : {mut.description}</span> : <span className="ready-line">{L.pretClassique}</span>}
      <span className="ready-line">{L.seuil} : {manche.threshold} · feuille {manche.difficulty.mood} · {Math.round(manche.totalSeconds)} s</span>
      {manche.graceSeconds > 0 && <span className="ready-line ok">+{manche.graceSeconds} s {L.repit}</span>}
      {manche.quest && <span className="ready-line">Consigne : {manche.quest.label} (+{money(manche.quest.reward)})</span>}
      <button className="ready-cta" onClick={begin}>{L.lancer}</button>
      {manche.gridRerollsLeft > 0 && (
        <button className="secondary small" onClick={reroll}>Copie double : autre feuille ({manche.gridRerollsLeft})</button>
      )}
    </div>
  );
}
