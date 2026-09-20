import { mutator } from '../data/registry';
import { TOTAL_MANCHES } from '../engine/rules';
import { useRunStore } from '../state/runStore';
import { L, NARRATOR, money } from '../theme/lexicon';

// Le briefing d'avant-dictée porte tout ce qu'on ne veut plus lire pendant :
// où on en est, ce qu'il faut atteindre, ce qui va nous tomber dessus.
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
      <h2 className="ready-title">{L.manche} {run.currentManche} <small>sur {TOTAL_MANCHES}</small></h2>
      <div className="ready-chips">
        <span className="chip strong">{L.seuil} {manche.threshold}</span>
        <span className="chip">{Math.round(manche.totalSeconds)} s</span>
        <span className={`chip mood-${manche.difficulty.mood}`}>feuille {manche.grid.size}×{manche.grid.size}, {manche.difficulty.mood}</span>
        {manche.graceSeconds > 0 && <span className="chip ok">+{manche.graceSeconds} s {L.repit}</span>}
        {manche.quest && <span className="chip">{manche.quest.label} · +{money(manche.quest.reward)}</span>}
      </div>
      {mut
        ? <p className="ready-lesson"><strong>{L.theme} — {mut.name}.</strong> {mut.description}</p>
        : <p className="ready-lesson plain">{L.pretClassique}</p>}
      <button className="ready-cta" onClick={begin}>{L.lancer}</button>
      <div className="ready-foot">
        <span className="bons-points">{'★'.repeat(run.lives)}{'☆'.repeat(Math.max(0, 3 - run.lives))}</span>
        <span>{money(run.euros)}</span>
        {manche.gridRerollsLeft > 0 && (
          <button className="secondary small" onClick={reroll}>Autre feuille ({manche.gridRerollsLeft})</button>
        )}
      </div>
    </div>
  );
}
