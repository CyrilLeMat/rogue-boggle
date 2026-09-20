import { useState } from 'react';
import { relic } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { DUEL } from '../theme/lexicon';
import { useSay } from '../theme/useSay';

const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// Premier temps, victoire : Kévin à genoux, de profil, plié en avant.
function Down() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#e7ecef" />
      <g stroke="#d4dade" strokeWidth="2"><path d="M0 30 h200 M0 62 h200 M0 94 h200 M44 0 v112 M100 0 v112 M156 0 v112" /></g>
      <rect y="112" width="200" height="38" fill="#c8c3b4" />
      <path d="M0 112 h200" stroke="#3f3a55" strokeWidth="2" />
      <g transform="rotate(12 160 100)">
        <rect x="142" y="86" width="34" height="24" rx="4" fill="#c67f5a" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M142 94 h34" stroke="#3f3a55" strokeWidth="2" />
      </g>
      <path d="M132 110 h-34 l10 -20" {...ink} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M132 110 q8 0 8 -5" {...ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M108 90 q-8 -12 -20 -16" {...ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M90 76 q6 14 14 18" {...ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="76" cy="66" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M62 60 q4 -16 14 -11 q12 -7 15 7 q-6 -5 -15 -3 q-9 2 -14 7z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 68 q4 4 8 0 M80 68 q4 4 8 0" {...ink} strokeWidth="2" />
      <ellipse cx="78" cy="79" rx="4.5" ry="3.5" fill="#3f3a55" />
      <path d="M88 78 l-24 8" {...ink} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M64 80 q-11 1 -11 9 q0 8 10 7 q10 -1 10 -8z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      <g fill="#bfe0ef" stroke="#3f3a55" strokeWidth="1.5">
        <path d="M56 38 q4 6 0 8 q-5 -2 0 -8z" /><path d="M96 32 q4 6 0 8 q-5 -2 0 -8z" />
      </g>
      <text x="146" y="46" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#9a93a8" className="sage-murmur">« pardon… »</text>
    </svg>
  );
}

// Second temps, victoire : gros plan sur les deux mains, l'objet qui repasse d'un cartable à l'autre.
function Handover() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#f6ead6" />
      {/* les traits de lumière, comme dans les cases qui comptent */}
      <g stroke="#f0d9a8" strokeWidth="4" opacity="0.8">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M100 74 L${100 + 120 * Math.cos((i * Math.PI) / 4)} ${74 + 120 * Math.sin((i * Math.PI) / 4)}`} />)}
      </g>
      {/* sa main, qui tend, en tremblant : paume ouverte et trois doigts */}
      <g className="tension">
        <path d="M4 112 q26 -12 42 -20" {...ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M48 80 q-18 5 -17 18 q1 14 17 11 q16 -3 15 -15z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M44 84 q8 5 6 14 M52 84 q8 5 6 14" stroke="#e8b79f" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* ta main, qui reprend */}
      <path d="M196 108 q-26 -10 -42 -18" {...ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M152 78 q18 5 17 18 q-1 14 -17 11 q-16 -3 -15 -15z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M156 82 q-8 5 -6 14 M148 82 q-8 5 -6 14" stroke="#e8b79f" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* l'objet, au milieu, qui redevient le tien */}
      <g transform="rotate(-8 100 74)">
        <rect x="76" y="56" width="48" height="34" rx="4" fill="#fffdf9" stroke="#3f3a55" strokeWidth="3" />
        <path d="M82 66 h30 M82 74 h22" stroke="#b9b1c9" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M112 84 l10 -10" stroke="#e6a94c" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M100 26 l3 8 9 1 -7 6 2 9 -7 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#e6a94c" stroke="#3f3a55" strokeWidth="1.5" />
    </svg>
  );
}

// Premier temps, défaite : il recule vers la porte, encore debout.
function StillUp() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#e7ecef" />
      <g stroke="#d4dade" strokeWidth="2"><path d="M0 34 h200 M0 70 h200 M52 0 v104 M148 0 v104" /></g>
      <rect y="104" width="200" height="46" fill="#c8c3b4" />
      <path d="M0 104 h200" stroke="#3f3a55" strokeWidth="2" />
      {/* la porte, ouverte derrière lui */}
      <rect x="150" y="18" width="44" height="86" rx="2" fill="#c3cfd4" stroke="#3f3a55" strokeWidth="3" />
      <circle cx="158" cy="64" r="3.5" fill="#8a5a2b" stroke="#3f3a55" strokeWidth="2" />
      {/* Kévin, essoufflé, un pas en arrière */}
      <g>
        <circle cx="120" cy="46" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M105 42 q6 -15 15 -10 q12 -7 15 7" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M112 44 l6 3 M128 44 l-6 3" {...ink} strokeWidth="2" />
        <ellipse cx="120" cy="57" rx="5" ry="3.5" fill="#3f3a55" />
        <path d="M120 62 v28 M120 70 l-18 10 M120 70 l16 12 M120 90 l-10 14 M120 90 l12 14" {...ink} />
      </g>
      {/* ton objet, dans SON cartable */}
      <g transform="rotate(-8 92 88)">
        <rect x="76" y="76" width="32" height="24" rx="4" fill="#c67f5a" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M76 84 h32" stroke="#3f3a55" strokeWidth="2" />
        <rect x="86" y="66" width="14" height="12" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2" />
      </g>
      <g fill="#bfe0ef" stroke="#3f3a55" strokeWidth="1.5">
        <path d="M100 22 q4 6 0 8 q-5 -2 0 -8z" /><path d="M140 28 q4 6 0 8 q-5 -2 0 -8z" />
      </g>
      <text x="44" y="40" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#9a93a8" className="sage-murmur">« la prochaine… »</text>
    </svg>
  );
}

// Après l'affrontement, en deux temps : ce qu'il devient, puis ce qu'il fait de ton objet.
export function DuelEnd() {
  const won = useRunStore((s) => s.duelWon);
  const back = useRunStore((s) => s.duelBack);
  const next = useRunStore((s) => s.leaveDuel);
  const say = useSay();
  const [step, setStep] = useState(0);

  const lines = won ? DUEL.won : DUEL.lost;
  const cry = 0.1 + lines.length * 0.65;
  const item = back ? say(relic(back).name) : null;
  const deal = won
    ? (item ? DUEL.wonBack(item) : DUEL.wonEmpty)
    : (item ? DUEL.lostKeep(item) : DUEL.lostFall);

  if (step === 0) {
    return (
      <div className="panel pick interlude duel-end">
        <div className="frame scene-frame">{won ? <Down /> : <StillUp />}</div>
        <div className="intro-text">
          {lines.map((l, i) => (
            <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>
          ))}
        </div>
        <p className="interlude-cry" style={{ animationDelay: `${cry.toFixed(2)}s` }}>« {say(won ? DUEL.wonCry : DUEL.lostCry)} »</p>
        {/* il retire son insulte de l'année : c'est la seule chose qu'il rend spontanément */}
        {won && <p className="interlude-cry takeback" style={{ animationDelay: `${(cry + 0.5).toFixed(2)}s` }}>« {say(DUEL.wonTakeback)} »</p>}
        <button className="ready-cta" style={{ animationDelay: `${(cry + 1.2).toFixed(2)}s` }} onClick={() => setStep(1)}>
          {won ? DUEL.next : DUEL.nextLost}
        </button>
      </div>
    );
  }

  return (
    <div className="panel pick interlude duel-end">
      <div className="frame scene-frame">{won ? <Handover /> : <StillUp />}</div>
      <p className={`duel-deal ${won ? 'ok' : 'ko'}`} style={{ animationDelay: '0.2s' }}>{say(deal)}</p>
      <p className="interlude-fall" style={{ animationDelay: '1s' }}>{say(won ? DUEL.wonFall : DUEL.lostFall)}</p>
      <button className="ready-cta" style={{ animationDelay: '1.6s' }} onClick={next}>{DUEL.leave}</button>
    </div>
  );
}
