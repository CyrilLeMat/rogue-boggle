import { useEffect, useMemo, useState } from 'react';
import { sfx } from '../audio/sfx';
import type { Pos } from '../engine/types';
import { findPathForWord } from '../engine/wordFinder';
import { useRunStore } from '../state/runStore';
import { MiniGrid } from './MiniGrid';

// Compteur animé : le plancher s'affiche tout de suite, le bonus monte d'un euro à la fois.
function useCountUp(target: number, durationMs: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || target <= 0) { setValue(0); return; }
    let raf = 0;
    const start = performance.now();
    let lastTick = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(target * eased);
      setValue(v);
      if (v > lastTick && v % 5 === 0) { sfx.tick(); lastTick = v; }
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled]);
  return value;
}

export function MancheRecap() {
  const result = useRunStore((s) => s.lastResult);
  const run = useRunStore((s) => s.run);
  const next = useRunStore((s) => s.continueAfterRecap);
  const bonusShown = useCountUp(result?.eurosBonus ?? 0, 1400, !!result);
  const [shown, setShown] = useState<string | null>(null);
  const shownPath = useMemo<Pos[] | null>(() => {
    if (!result || !shown) return null;
    const found = result.words.find((f) => f.word === shown);
    return found?.path ?? findPathForWord(result.grid, shown);
  }, [result, shown]);
  useEffect(() => { setShown(null); }, [result]);
  if (!result || !run) return null;
  const best = [...result.words].sort((a, b) => b.score - a.score).slice(0, 3);
  const cursedFound = !!result.cursedWord && result.words.some((f) => f.word === result.cursedWord);
  const wordButton = (w: string, extra?: React.ReactNode) => (
    <li key={w}>
      <button className={`word-link ${shown === w ? 'active' : ''}`} onClick={() => setShown(shown === w ? null : w)}>{w}</button>
      {extra}
    </li>
  );
  const overshoot = Math.max(0, result.score - result.threshold);
  const modifiers = result.euros - (result.eurosBase + result.eurosBonus + result.eurosTime + result.eurosQuest + result.eurosEnemy);
  const done = bonusShown >= result.eurosBonus;
  return (
    <div className="panel recap">
      <h2 className={result.success ? 'ok' : 'ko'}>{result.success ? 'Manche réussie' : 'Manche ratée'}</h2>
      <p className="big">{result.score} <span className="muted">/ {result.threshold}</span></p>
      <p className="muted">Grille {result.mood}</p>
      {!result.success && <p className="ko">-1 vie · il en reste {run.lives}</p>}

      <div className="euros-breakdown">
        <div className="euro-line"><span>Plancher</span><span className="euros">+{result.eurosBase} €</span></div>
        {result.success && (
          <div className={`euro-line bonus ${done ? 'done' : ''}`}>
            <span>{overshoot} pts au-dessus du seuil</span>
            <span className="euros">+{bonusShown} €</span>
          </div>
        )}
        {result.eurosQuest > 0 && (
          <div className="euro-line"><span>Objectif : {result.questLabel}</span><span className="euros">+{result.eurosQuest} €</span></div>
        )}
        {result.eurosEnemy !== 0 && (
          <div className="euro-line"><span>{result.eurosEnemy < 0 ? 'Ennemi survivant' : 'Chasse'}</span><span className="euros">{result.eurosEnemy > 0 ? '+' : ''}{result.eurosEnemy} €</span></div>
        )}
        {result.eurosTime > 0 && (
          <div className="euro-line"><span>Manche terminée en avance</span><span className="euros">+{result.eurosTime} €</span></div>
        )}
        {modifiers !== 0 && (
          <div className="euro-line"><span>Relics & malédictions</span><span className="euros">{modifiers > 0 ? '+' : ''}{modifiers} €</span></div>
        )}
        <div className="euro-line total"><span>Gagné</span><span className="euros">{result.eurosBase + bonusShown + result.eurosTime + result.eurosQuest + result.eurosEnemy + (done ? modifiers : 0)} €</span></div>
      </div>

      <p className="muted">{result.words.length} mots · touche un mot pour voir son chemin</p>
      <div className="recap-grid-row">
        <MiniGrid grid={result.grid} path={shownPath} />
        <div className="cols recap-words">
          <div>
            <h3>Meilleurs mots</h3>
            <ul>{best.map((w) => wordButton(w.word, <span className="pts">{w.score}</span>))}</ul>
          </div>
          <div>
            <h3>Manqués</h3>
            <ul>{result.missed.map((w) => wordButton(w))}</ul>
          </div>
        </div>
      </div>
      {result.cursedWord && (
        <p className={`cursed-reveal ${cursedFound ? 'ok' : ''}`}>
          Mot maudit : <button className={`word-link ${shown === result.cursedWord ? 'active' : ''}`} onClick={() => setShown(shown === result.cursedWord ? null : result.cursedWord)}>{result.cursedWord}</button>
          {cursedFound ? ' · trouvé, bravo' : shownPath === null && shown === result.cursedWord ? ' · non trouvé (la grille a changé depuis)' : ' · non trouvé'}
        </p>
      )}
      <button onClick={next}>Continuer</button>
    </div>
  );
}
