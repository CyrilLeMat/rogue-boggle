import { useState } from 'react';
import { sfx } from '../audio/sfx';
import { mutator } from '../data/registry';
import { TOTAL_MANCHES } from '../engine/rules';
import { hasEverTraced, useRunStore } from '../state/runStore';
import { L, money, say } from '../theme/lexicon';
import { TraceDemo } from './TraceDemo';

// Le briefing d'avant-dictée porte tout ce qu'on ne veut plus lire pendant :
// où on en est, ce qu'il faut atteindre, ce qui va nous tomber dessus.
export function ReadyOverlay() {
  const manche = useRunStore((s) => s.manche);
  const run = useRunStore((s) => s.run);
  const begin = useRunStore((s) => s.beginPlay);
  const reroll = useRunStore((s) => s.rerollGrid);
  const draw = useRunStore((s) => s.drawThought);
  const [thought, setThought] = useState<string | null>(null);
  const [novice] = useState(() => !hasEverTraced());

  // Le temps de souffler avant la dictée : une pensée qu'on lit à son rythme, puis le chrono.
  const brace = () => {
    setThought(draw());
    sfx.heartbeat();
  };
  if (!manche || !run) return null;
  const mut = manche.mutatorId ? mutator(manche.mutatorId) : null;
  if (thought) return (
    <div className="psyche" onClick={begin}>
      <blockquote>
        <p><span className="q">«</span> {thought} <span className="q">»</span></p>
        <cite>{run.identity.name}, élève de CE2</cite>
      </blockquote>
      <button className="ready-cta psyche-go" onClick={begin}>{L.lancer}</button>
    </div>
  );
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
        ? <p className="ready-lesson"><strong>{L.theme} — {say(mut.name, run.identity)}.</strong> {say(mut.description, run.identity)}</p>
        : <p className="ready-lesson plain">{say(L.pretClassique, run.identity)}</p>}
      {novice && <TraceDemo />}
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
