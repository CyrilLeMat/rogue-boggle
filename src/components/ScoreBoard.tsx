import { useEffect, useRef, useState } from 'react';
import { relics } from '../data/registry';
import { uiFlags } from '../engine/hookRunner';
import { eurosFor } from '../engine/rules';
import { useRunStore } from '../state/runStore';
import { DUEL, L } from '../theme/lexicon';

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
  // L'affrontement n'a pas de note : à sa place, ce qu'il reste de Kévin.
  const boss = manche.enemies.find((e) => e.typeId === 'kevin');
  if (boss) {
    const left = Math.max(0, boss.hp);
    return (
      <div className={`note-hero duel ${left === 0 ? 'ok' : ''}`}>
        <div className="note-numbers">
          <span className="note-now">{left}</span>
          <span className="note-target">/ {boss.maxHp}</span>
          <span className="note-label">{left === 0 ? 'il est à terre' : DUEL.hp}</span>
        </div>
        <div className="note-bar"><span style={{ width: `${(left / boss.maxHp) * 100}%` }} /></div>
      </div>
    );
  }
  const t = manche.threshold;
  const reached = manche.score >= t;
  const bumping = shownScore !== manche.score;
  const live = eurosFor(manche.score, t, reached);
  const flags = uiFlags(relics(run.relicIds));
  const pct = Math.min(100, (shownScore / t) * 100);
  // Pendant la dictée on ne lit rien d'autre que la note et le chrono :
  // le rang, les bons points et les billes sont dans le briefing et dans le bulletin.
  return (
    <>
    <div className="scoreboard">
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
          <span className="label">{manche.cursedVisible ? 'Mot dicté' : 'Mot mystère'}</span>
          <span className="value">
            {manche.cursedVisible || manche.found.some((f) => f.word === manche.cursedWord)
              ? manche.cursedWord
              : `${manche.cursedWord.length} lettres · ${'_ '.repeat(manche.cursedWord.length).trim()}`}
          </span>
        </div>
      )}
    </div>
    {/* le score est l'information n°1 : en gros, avec sa progression vers la note */}
    <div className={`note-hero ${reached ? 'ok' : ''} ${bumping ? 'bump' : ''}`}>
      <div className="note-numbers">
        <span className="note-now">{shownScore}</span>
        <span className="note-target">/ {t}</span>
        <span className="note-label">
          {reached ? <>note atteinte<span className="live-euros"> +{live.total} {L.euros.toLowerCase()}</span></> : L.seuil.toLowerCase()}
        </span>
      </div>
      <div className="note-bar"><span style={{ width: `${pct}%` }} /></div>
    </div>
    </>
  );
}
