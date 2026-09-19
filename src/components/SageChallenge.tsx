import { useEffect } from 'react';
import { sfx } from '../audio/sfx';
import { formedWord } from '../engine/sage';
import { useRunStore } from '../state/runStore';
import { L, money } from '../theme/lexicon';

function SageArt() {
  return (
    <svg viewBox="0 0 320 170" className="panel-art sage-art" role="img" aria-label="Un élève de CM1 avec une fausse barbe blanche, assis sur une pile de livres">
      <rect width="320" height="170" fill="#efe7da" />
      {/* radiateur */}
      <g stroke="#b9ae9c" strokeWidth="5">
        <path d="M14 78 v70 M30 78 v70 M46 78 v70 M62 78 v70" />
      </g>
      <rect x="6" y="70" width="64" height="8" rx="3" fill="#b9ae9c" />
      {/* mur : traces de craie effacée */}
      <path d="M96 40 q40 -10 90 2" stroke="#fff" strokeWidth="7" opacity="0.5" fill="none" strokeLinecap="round" />
      <path d="M120 58 q50 -8 80 4" stroke="#fff" strokeWidth="5" opacity="0.35" fill="none" strokeLinecap="round" />
      {/* pile de livres */}
      <g stroke="#3f3a55" strokeWidth="2">
        <rect x="196" y="132" width="86" height="12" rx="2" fill="#7d6bc4" />
        <rect x="202" y="122" width="76" height="10" rx="2" fill="#d9534f" />
        <rect x="198" y="112" width="82" height="10" rx="2" fill="#e6a94c" />
      </g>
      {/* le sage */}
      <g stroke="#3f3a55" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M240 108 v-22 M240 92 l-22 10 M240 92 l20 4" />
      </g>
      <circle cx="240" cy="70" r="16" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      {/* couronne de lauriers en papier */}
      <path d="M224 62 q16 -14 32 0" stroke="#5fae83" strokeWidth="3" fill="none" />
      <path d="M226 60 l-4 -5 M232 56 l-2 -6 M240 54 l0 -6 M248 56 l2 -6 M254 60 l4 -5" stroke="#5fae83" strokeWidth="2.5" />
      {/* barbe de coton */}
      <path d="M228 74 q12 26 24 0 q2 14 -12 18 q-14 -4 -12 -18z" fill="#f6f1e4" stroke="#cfc7b8" strokeWidth="1.5" />
      <circle cx="234" cy="70" r="1.8" fill="#3f3a55" /><circle cx="246" cy="70" r="1.8" fill="#3f3a55" />
      {/* lunettes */}
      <g stroke="#3f3a55" strokeWidth="1.8" fill="none"><circle cx="234" cy="70" r="5" /><circle cx="246" cy="70" r="5" /><path d="M239 70 h2" /></g>
      {/* craie levée */}
      <rect x="212" y="96" width="12" height="5" rx="2" fill="#f6f1e4" stroke="#3f3a55" strokeWidth="1.5" transform="rotate(-28 218 98)" />
      <text x="150" y="112" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#9a93a8" className="sage-murmur">« hmmm… »</text>
    </svg>
  );
}

export function SageChallenge() {
  const sage = useRunStore((s) => s.sage);
  const tick = useRunStore((s) => s.sageTick);
  const place = useRunStore((s) => s.sagePlace);
  const undo = useRunStore((s) => s.sageUndo);
  const giveUp = useRunStore((s) => s.sageGiveUp);
  const leave = useRunStore((s) => s.leaveSage);
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

  // Clavier : taper une lettre la pose, Retour arrière l'enlève.
  useEffect(() => {
    if (!playing || !sage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') { e.preventDefault(); undo(); sfx.unselect(); return; }
      const key = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;
      const idx = sage.letters.findIndex((l, i) => l === key && !sage.placed.includes(i));
      if (idx >= 0) { place(idx); sfx.select(sage.placed.length); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, sage, place, undo]);

  useEffect(() => {
    if (sage?.outcome === 'won') sfx.success();
    if (sage?.outcome === 'lost') sfx.fail();
  }, [sage?.outcome]);

  if (!sage) return null;
  const formed = formedWord(sage);
  const wrong = playing && sage.placed.length === sage.word.length;
  const pct = (sage.timeLeft / sage.seconds) * 100;
  const long = sage.word.length >= 11;

  return (
    <div className="panel pick sage">
      <div className="sage-head">
        <div className="frame sage-frame"><SageArt /></div>
        <div className="sage-speech">
          <h2>{L.sageTitle}</h2>
          {L.sageIntro.map((l) => <p key={l} className="muted">{l}</p>)}
          <p className="sage-ask">{L.sageAsk}</p>
        </div>
      </div>

      {playing && (
        <div className={`timer sage-timer ${sage.timeLeft <= 10 ? 'urgent' : ''}`}>
          <div className="timer-bar" style={{ width: `${pct}%` }} />
          <span className="timer-text">{Math.ceil(sage.timeLeft)}s</span>
        </div>
      )}

      <div className={`sage-answer ${wrong ? 'wrong' : ''} ${long ? 'long' : ''}`}>
        {Array.from({ length: sage.word.length }, (_, pos) => {
          const letterIndex = sage.placed[pos];
          const locked = sage.hintGiven && pos === 0;
          return (
            <button
              key={pos}
              className={`tile slot ${letterIndex === undefined ? 'empty' : 'filled'} ${locked ? 'locked' : ''}`}
              disabled={letterIndex === undefined || locked || !playing}
              onClick={() => { undo(pos); sfx.unselect(); }}
            >
              {letterIndex === undefined ? '' : sage.letters[letterIndex]}
            </button>
          );
        })}
      </div>

      {playing && (
        <div className={`sage-pool ${long ? 'long' : ''}`}>
          {sage.letters.map((letter, i) => (
            <button
              key={i}
              className={`tile pool ${sage.placed.includes(i) ? 'used' : ''}`}
              disabled={sage.placed.includes(i)}
              onClick={() => { place(i); sfx.select(sage.placed.length); }}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {playing && sage.hintGiven && <p className="muted small-hint">{L.sageHint}</p>}
      {wrong && <p className="ko">« {formed} » ? Le sage fronce les sourcils.</p>}

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
