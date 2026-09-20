import { useEffect, useMemo, useState } from 'react';
import { sfx } from '../audio/sfx';
import type { Pos } from '../engine/types';
import { findPathForWord } from '../engine/wordFinder';
import { useRunStore } from '../state/runStore';
import { L, SIGNATURE, appreciation, money } from '../theme/lexicon';
import { useSay } from '../theme/useSay';
import { MiniGrid } from './MiniGrid';

// Le bulletin se lit en trois temps : la note, puis l'appréciation, puis le détail.
const ACT_COMMENT_MS = 1300;  // [tuning]
const ACT_DETAIL_MS = 3000;   // [tuning]

function useActs(key: unknown) {
  const [act, setAct] = useState(1);
  useEffect(() => {
    setAct(1);
    const a = window.setTimeout(() => setAct(2), ACT_COMMENT_MS);
    const b = window.setTimeout(() => setAct(3), ACT_DETAIL_MS);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
  }, [key]);
  return [act, () => setAct(3)] as const;
}

// Compteur animé : le plancher s'affiche tout de suite, le bonus monte d'un euro à la fois.
function useCountUp(target: number, durationMs: number, enabled: boolean, silent = false) {
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
      if (!silent && v > lastTick && v % 5 === 0) { sfx.tick(); lastTick = v; }
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled, silent]);
  return value;
}

export function MancheRecap() {
  const result = useRunStore((s) => s.lastResult);
  const run = useRunStore((s) => s.run);
  const next = useRunStore((s) => s.continueAfterRecap);
  const say = useSay();
  const [act, revealAll] = useActs(result);
  const scoreShown = useCountUp(result?.score ?? 0, 900, !!result, true);
  const bonusShown = useCountUp(result?.eurosBonus ?? 0, 1400, !!result && act >= 3);
  const [shown, setShown] = useState<string | null>(null);
  const shownPath = useMemo<Pos[] | null>(() => {
    if (!result || !shown) return null;
    const found = result.words.find((f) => f.word === shown);
    return found?.path ?? findPathForWord(result.grid, shown);
  }, [result, shown]);
  useEffect(() => { setShown(null); }, [result]);
  useEffect(() => { if (act === 2) sfx.redPen(); }, [act]);
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
    <div className="panel recap" onClick={revealAll}>
      <h2 className={result.success ? 'ok' : 'ko'}>{result.success ? L.reussie : L.ratee}</h2>
      <p className="big">{scoreShown} <span className="muted">/ {result.threshold}</span></p>
      <p className="muted">Feuille {result.mood}</p>
      {act < 3 && <p className="recap-wait">…</p>}
      {act >= 2 && (
      <div className="appreciation act">
        <span className="appreciation-label">Appréciation</span>
        <p>{say(appreciation(result.score / Math.max(1, result.threshold), result.success, run.lives, result.score))}</p>
        <span className="signature">{SIGNATURE}</span>
      </div>
      )}
      {act >= 2 && !result.success && <p className="ko act">{L.vieEnMoins} Il t'en reste {run.lives}.</p>}

      {act >= 3 && (
      <div className="euros-breakdown act">
        <div className="euro-line"><span>{L.plancher}</span><span className="euros">+{money(result.eurosBase)}</span></div>
        {result.success && (
          <div className={`euro-line bonus ${done ? 'done' : ''}`}>
            <span>{L.depassement(overshoot)}</span>
            <span className="euros">+{money(bonusShown)}</span>
          </div>
        )}
        {result.eurosQuest > 0 && (
          <div className="euro-line"><span>{L.consigneLine} : {result.questLabel}</span><span className="euros">+{money(result.eurosQuest)}</span></div>
        )}
        {result.eurosEnemy !== 0 && (
          <div className="euro-line"><span>{result.eurosEnemy < 0 ? L.cancreSurvivant : L.cancreChasse}</span><span className="euros">{result.eurosEnemy > 0 ? '+' : ''}{money(result.eurosEnemy)}</span></div>
        )}
        {result.eurosTime > 0 && (
          <div className="euro-line"><span>{L.enAvance}</span><span className="euros">+{money(result.eurosTime)}</span></div>
        )}
        {modifiers !== 0 && (
          <div className="euro-line"><span>{L.fournituresLine}</span><span className="euros">{modifiers > 0 ? '+' : ''}{money(modifiers)}</span></div>
        )}
        <div className="euro-line total"><span>{L.gagne}</span><span className="euros">{money(result.eurosBase + bonusShown + result.eurosTime + result.eurosQuest + result.eurosEnemy + (done ? modifiers : 0))}</span></div>
      </div>

      )}
      {act >= 3 && (
      <>
      <p className="muted act">{result.words.length} mots · {L.motsTouche}</p>
      <div className={`recap-grid-row ${shownPath ? 'showing' : ''}`}>
        <MiniGrid grid={result.grid} path={shownPath} />
        <div className="cols recap-words">
          <div>
            <h3>{L.meilleurs}</h3>
            <ul>{best.map((w) => wordButton(w.word, <span className="pts">{w.score}</span>))}</ul>
          </div>
          <div>
            <h3>{L.manqueList}</h3>
            <ul>{result.missed.map((w) => wordButton(w))}</ul>
          </div>
        </div>
      </div>
      {result.cursedWord && (
        <p className={`cursed-reveal ${cursedFound ? 'ok' : ''}`}>
          Mot mystère : <button className={`word-link ${shown === result.cursedWord ? 'active' : ''}`} onClick={() => setShown(shown === result.cursedWord ? null : result.cursedWord)}>{result.cursedWord}</button>
          {cursedFound ? ' · trouvé. La maîtresse hausse un sourcil. Elle ne dira rien.' : shownPath === null && shown === result.cursedWord ? ' · raté (la feuille a changé depuis)' : ' · raté. Elle le savait depuis le début.'}
        </p>
      )}
      </>
      )}
      {act >= 3 && <button className="act" onClick={next}>{L.continuer}</button>}
    </div>
  );
}
