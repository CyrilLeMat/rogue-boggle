import { useEffect, useRef, useState } from 'react';
import { relics } from '../data/registry';
import { uiFlags } from '../engine/hookRunner';
import { TOTAL_MANCHES, eurosFor } from '../engine/rules';
import { useRunStore } from '../state/runStore';
import { L } from '../theme/lexicon';

// Le score affiché rattrape le vrai score en ~400 ms : on voit les points arriver.
function useTicker(target: number) {
  const [shown, setShown] = useState(target);
  const raf = useRef(0);
  useEffect(() => {
    const from = shown;
    if (from === target) return;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 400);
      setShown(Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return shown;
}

export function ScoreBoard() {
  const run = useRunStore((s) => s.run);
  const manche = useRunStore((s) => s.manche);
  const shownScore = useTicker(manche?.score ?? 0);
  if (!run || !manche) return null;
  const t = manche.threshold;
  const reached = manche.score >= t;
  const bumping = shownScore !== manche.score;
  const live = eurosFor(manche.score, t, reached);
  const flags = uiFlags(relics(run.relicIds));
  const pct = Math.min(100, (shownScore / t) * 100);
  return (
    <>
    <div className="scoreboard">
      <div className="stat"><span className="label">{L.manche}</span><span className="value">{run.currentManche}/{TOTAL_MANCHES}</span></div>
      <div className={`stat stat-mood mood-${manche.difficulty.mood}`}><span className="label">{L.grille}</span><span className="value">{manche.difficulty.mood}</span></div>
      <div className="stat"><span className="label">{L.vies}</span><span className="value bons-points">{'★'.repeat(run.lives)}{'☆'.repeat(Math.max(0, 3 - run.lives))}</span></div>
      <div className="stat">
        <span className="label">{L.euros}</span>
        <span className="value">{run.euros}{reached && <span className="live-euros"> +{live.total}</span>}</span>
      </div>
      {flags.showLongestLength && (
        <div className="stat stat-info"><span className="label">Petit Larousse</span><span className="value">{manche.search.longestLength} lettres</span></div>
      )}
      {manche.amorce && (
        <div className="stat stat-info amorce"><span className="label">Antisèche · {manche.amorce.length} lettres</span><span className="value">{manche.amorce.prefix}…</span></div>
      )}
      {manche.luckyLetter && (
        <div className="stat stat-info lucky"><span className="label">Lettre soulignée</span><span className="value">{manche.luckyLetter}</span></div>
      )}
      {manche.cursedWord && (
        <div className="stat stat-info cursed">
          <span className="label">Mot mystère</span>
          <span className="value">{manche.found.some((f) => f.word === manche.cursedWord) ? manche.cursedWord : `${manche.cursedWord.length} lettres · ${'_ '.repeat(manche.cursedWord.length).trim()}`}</span>
        </div>
      )}
    </div>
    {/* le score est l'information n°1 : en gros, avec sa progression vers la note */}
    <div className={`note-hero ${reached ? 'ok' : ''} ${bumping ? 'bump' : ''}`}>
      <div className="note-numbers">
        <span className="note-now">{shownScore}</span>
        <span className="note-target">/ {t}</span>
        <span className="note-label">{reached ? 'note atteinte' : L.seuil.toLowerCase()}</span>
      </div>
      <div className="note-bar"><span style={{ width: `${pct}%` }} /></div>
    </div>
    </>
  );
}
