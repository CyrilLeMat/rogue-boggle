import { useState } from 'react';
import { sfx } from '../audio/sfx';
import { mutator } from '../data/registry';
import { TOTAL_MANCHES } from '../engine/rules';
import { useRunStore } from '../state/runStore';
import { L, MONOLOGUE, money, say } from '../theme/lexicon';

const PSYCHE_MS = 2800; // [tuning]

// Le briefing d'avant-dictée porte tout ce qu'on ne veut plus lire pendant :
// où on en est, ce qu'il faut atteindre, ce qui va nous tomber dessus.
export function ReadyOverlay() {
  const manche = useRunStore((s) => s.manche);
  const run = useRunStore((s) => s.run);
  const begin = useRunStore((s) => s.beginPlay);
  const reroll = useRunStore((s) => s.rerollGrid);
  const [thought, setThought] = useState<string | null>(null);

  // Le temps de souffler avant la dictée : une pensée, deux battements de cœur, puis le chrono.
  const brace = () => {
    setThought(say(MONOLOGUE[Math.floor(Math.random() * MONOLOGUE.length)], run?.identity));
    sfx.heartbeat();
    window.setTimeout(begin, PSYCHE_MS);
  };
  if (!manche || !run) return null;
  const mut = manche.mutatorId ? mutator(manche.mutatorId) : null;
  if (thought) return <div className="psyche" onClick={begin}><p>« {thought} »</p></div>;
  return (
    <div className="ready-overlay">
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
      <button className="ready-cta" onClick={brace}>{L.lancer}</button>
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
