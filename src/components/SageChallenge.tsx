import { useCallback, useEffect, useState } from 'react';
import { sfx } from '../audio/sfx';
import { posKey } from '../engine/adjacency';
import { wordFromPath } from '../engine/sage';
import type { Pos } from '../engine/types';
import { useRunStore } from '../state/runStore';
import { L, money } from '../theme/lexicon';
import { Grid } from './Grid';

function SageArt() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" role="img" aria-label="Un élève de CM1 avec une fausse barbe blanche, assis sur une pile de livres">
      <rect width="200" height="150" fill="#efe7da" />
      <g stroke="#b9ae9c" strokeWidth="5"><path d="M16 58 v66 M32 58 v66 M48 58 v66" /></g>
      <rect x="8" y="50" width="48" height="8" rx="3" fill="#b9ae9c" />
      <path d="M74 34 q34 -10 76 2" stroke="#fff" strokeWidth="7" opacity="0.5" fill="none" strokeLinecap="round" />
      <g stroke="#3f3a55" strokeWidth="2">
        <rect x="104" y="116" width="76" height="11" rx="2" fill="#7d6bc4" />
        <rect x="110" y="107" width="64" height="9" rx="2" fill="#d9534f" />
        <rect x="106" y="98" width="70" height="9" rx="2" fill="#e6a94c" />
      </g>
      <g stroke="#3f3a55" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M142 94 v-20 M142 80 l-20 8 M142 80 l18 4" />
      </g>
      <circle cx="142" cy="58" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M127 50 q15 -13 30 0" stroke="#5fae83" strokeWidth="3" fill="none" />
      <path d="M129 48 l-4 -5 M135 44 l-2 -6 M142 42 l0 -6 M149 44 l2 -6 M155 48 l4 -5" stroke="#5fae83" strokeWidth="2.5" />
      <path d="M131 62 q11 24 22 0 q2 13 -11 17 q-13 -4 -11 -17z" fill="#f6f1e4" stroke="#cfc7b8" strokeWidth="1.5" />
      <g stroke="#3f3a55" strokeWidth="1.8" fill="none"><circle cx="136" cy="58" r="5" /><circle cx="148" cy="58" r="5" /><path d="M141 58 h2" /></g>
      <circle cx="136" cy="58" r="1.8" fill="#3f3a55" /><circle cx="148" cy="58" r="1.8" fill="#3f3a55" />
      <rect x="116" y="84" width="12" height="5" rx="2" fill="#f6f1e4" stroke="#3f3a55" strokeWidth="1.5" transform="rotate(-28 122 86)" />
      <text x="72" y="96" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#9a93a8" className="sage-murmur">« hmmm… »</text>
    </svg>
  );
}

export function SageChallenge() {
  const sage = useRunStore((s) => s.sage);
  const tick = useRunStore((s) => s.sageTick);
  const submit = useRunStore((s) => s.sageSubmit);
  const giveUp = useRunStore((s) => s.sageGiveUp);
  const leave = useRunStore((s) => s.leaveSage);
  const [traced, setTraced] = useState('');
  const playing = sage?.outcome === 'playing';

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      tick((now - last) / 1000);
      last = now;
    }, 100);
    return () => clearInterval(id);
  }, [playing, tick]);

  useEffect(() => {
    if (sage?.outcome === 'won') sfx.success();
    if (sage?.outcome === 'lost') sfx.fail();
  }, [sage?.outcome]);

  const onPathChange = useCallback((p: Pos[]) => {
    setTraced(sage ? wordFromPath(sage.grid, p) : '');
  }, [sage]);

  if (!sage) return null;
  const active = new Set(sage.active);
  const locked = new Set<number>();
  for (let r = 0; r < sage.grid.size; r++)
    for (let c = 0; c < sage.grid.size; c++)
      if (!active.has(posKey(r, c))) locked.add(posKey(r, c));
  const pct = (sage.timeLeft / sage.seconds) * 100;
  const startCell = sage.solution.length ? posKey(sage.solution[0][0], sage.solution[0][1]) : null;

  return (
    <div className="panel pick sage">
      <div className="sage-head">
        <div className="frame sage-frame"><SageArt /></div>
        <div className="sage-speech">
          <h2>{L.sageTitle}</h2>
          {L.sageIntro.map((l) => <p key={l} className="muted">{l}</p>)}
          <p className="sage-ask">{L.sageAsk(sage.word.length)}</p>
        </div>
      </div>

      {playing && (
        <div className={`timer sage-timer ${sage.timeLeft <= 10 ? 'urgent' : ''}`}>
          <div className="timer-bar" style={{ width: `${pct}%` }} />
          <span className="timer-text">{Math.ceil(sage.timeLeft)}s</span>
        </div>
      )}

      <div className="sage-board">
        <Grid
          grid={sage.grid}
          onSubmit={submit}
          onPathChange={onPathChange}
          preview={traced ? { word: traced, score: 0, base: 0, parts: [], duplicate: false } : null}
          lockedCells={locked}
          plain
          disabled={!playing}
          amorceCell={sage.hintGiven && playing ? startCell : null}
          highlightCells={!playing ? active : undefined}
        />
      </div>

      {playing && sage.hintGiven && <p className="muted small-hint">{L.sageHint}</p>}
      {playing && sage.attempts > 0 && <p className="ko small-hint">{L.sageWrong(sage.attempts)}</p>}

      {sage.outcome === 'won' && (
        <div className="sage-outcome ok">
          <p className="big">{sage.word}</p>
          <p>{L.sageWon}</p>
          <p className="sage-ask">{L.sageWonSub}</p>
          <p className="euros">+{money(sage.reward)}</p>
        </div>
      )}
      {sage.outcome === 'lost' && (
        <div className="sage-outcome ko">
          <p className="big">{sage.word}</p>
          <p>{L.sageLost}</p>
          <p className="sage-ask">{L.sageLostSub(sage.word)}</p>
          <p className="euros">+{money(sage.reward)} de consolation</p>
        </div>
      )}

      <div className="row">
        {playing
          ? <button className="secondary" onClick={giveUp}>{L.sageGiveUp}</button>
          : <button onClick={leave}>{L.sageLeave}</button>}
      </div>
    </div>
  );
}
