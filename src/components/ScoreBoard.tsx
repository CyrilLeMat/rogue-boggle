import { relics } from '../data/registry';
import { uiFlags } from '../engine/hookRunner';
import { TOTAL_MANCHES, eurosFor } from '../engine/rules';
import { useRunStore } from '../state/runStore';

export function ScoreBoard() {
  const run = useRunStore((s) => s.run);
  const manche = useRunStore((s) => s.manche);
  if (!run || !manche) return null;
  const t = manche.threshold;
  const reached = manche.score >= t;
  const live = eurosFor(manche.score, t, reached);
  const flags = uiFlags(relics(run.relicIds));
  return (
    <div className="scoreboard">
      <div className="stat"><span className="label">Manche</span><span className="value">{run.currentManche}/{TOTAL_MANCHES} <span className="muted small-hint">{manche.grid.size}×{manche.grid.size}</span></span></div>
      <div className={`stat ${reached ? 'ok' : ''}`}>
        <span className="label">Seuil</span>
        <span className="value">{manche.score} / {t}</span>
      </div>
      <div className={`stat mood-${manche.difficulty.mood}`}><span className="label">Grille</span><span className="value">{manche.difficulty.mood}</span></div>
      <div className="stat"><span className="label">Vies</span><span className="value">{'♥'.repeat(run.lives)}{'♡'.repeat(Math.max(0, 3 - run.lives))}</span></div>
      <div className="stat"><span className="label">Run</span><span className="value">{run.score + manche.score}</span></div>
      <div className="stat">
        <span className="label">Euros</span>
        <span className="value">{run.euros} €{reached && <span className="live-euros"> +{live.total}</span>}</span>
      </div>
      {flags.showLongestLength && (
        <div className="stat"><span className="label">Oracle</span><span className="value">{manche.search.longestLength} lettres</span></div>
      )}
      {manche.luckyLetter && (
        <div className="stat lucky"><span className="label">Porte-bonheur</span><span className="value">{manche.luckyLetter}</span></div>
      )}
      {manche.cursedWord && (
        <div className="stat cursed">
          <span className="label">Mot maudit</span>
          <span className="value">{manche.found.some((f) => f.word === manche.cursedWord) ? manche.cursedWord : `${manche.cursedWord.length} lettres · ${'_ '.repeat(manche.cursedWord.length).trim()}`}</span>
        </div>
      )}
    </div>
  );
}
