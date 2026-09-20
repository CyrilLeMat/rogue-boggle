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

// Le K.O. : le mot le traverse, il décolle, les lettres volent.
function Knockout() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#f6ead6" />
      {/* les traits de vitesse, du poing vers lui */}
      <g stroke="#e8c98f" strokeWidth="4" strokeLinecap="round">
        {[26, 46, 66, 86, 106].map((y) => <path key={y} d={`M4 ${y} h${40 + (y % 30)}`} />)}
      </g>
      {/* ton poing, énorme, au premier plan */}
      <g>
        <path d="M0 96 q22 -12 40 -18" {...ink} strokeWidth="6" strokeLinecap="round" />
        <path d="M40 58 q-24 6 -22 24 q2 19 24 15 q22 -4 20 -20z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
        <path d="M34 64 q10 7 8 18 M46 64 q10 7 8 18" stroke="#e8b79f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      {/* lui, qui décolle, jambes en l'air */}
      <g transform="rotate(16 140 74)">
        <circle cx="146" cy="52" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M131 48 q6 -15 15 -10 q12 -7 15 7" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M138 50 l7 4 M155 50 l-7 4" {...ink} strokeWidth="2" />
        <ellipse cx="146" cy="63" rx="6" ry="4.5" fill="#3f3a55" />
        <path d="M146 68 v24 M146 74 l-18 6 M146 74 l18 10 M146 92 l-14 16 M146 92 l16 12" {...ink} />
      </g>
      {/* les lettres qui partent en l'air */}
      <g fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#5d4aa8">
        <text x="110" y="24" transform="rotate(-18 110 24)">P</text>
        <text x="172" y="36" transform="rotate(22 172 36)">A</text>
        <text x="186" y="96" transform="rotate(-10 186 96)">F</text>
      </g>
      <text x="100" y="140" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="26" fill="#d9534f" className="sage-murmur">PAF !!!</text>
    </svg>
  );
}

// La claque : le couloir, sa joue, et la porte du fond qui s'ouvre au pire moment.
function Slap() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#f3ece0" />
      <rect y="112" width="200" height="38" fill="#e2d6c2" />
      <path d="M0 112 h200" stroke="#c9b9a0" strokeWidth="2" />
      {/* la porte du fond, entrouverte, avec elle derrière */}
      <rect x="154" y="16" width="44" height="96" rx="2" fill="#dcd2c0" stroke="#3f3a55" strokeWidth="3" />
      <g>
        <circle cx="176" cy="44" r="12" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M164 44 q0 -17 12 -17 q12 0 12 17 q-4 -8 -12 -8 q-8 0 -12 8z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <g fill="none" stroke="#3f3a55" strokeWidth="1.8"><circle cx="172" cy="44" r="3.5" /><circle cx="181" cy="44" r="3.5" /></g>
        <ellipse cx="176" cy="53" rx="4" ry="3" fill="#3f3a55" />
      </g>
      {/* lui, assis, la joue qui part */}
      <g>
        <circle cx="104" cy="70" r="16" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M88 66 q6 -16 16 -11 q13 -7 16 8" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M96 68 l7 4 M114 68 l-7 4" {...ink} strokeWidth="2" />
        <ellipse cx="104" cy="80" rx="5" ry="4" fill="#3f3a55" />
        <path d="M104 86 v20 M104 94 l-14 10 M104 106 l-16 6 M104 106 l16 6" {...ink} />
        {/* la marque, toute rouge */}
        <g stroke="#d9534f" strokeWidth="2.5" strokeLinecap="round"><path d="M114 62 l10 -6 M116 70 l12 -2 M115 78 l10 5" /></g>
      </g>
      {/* ta main, qui vient de partir toute seule */}
      <g>
        <path d="M6 58 q26 4 44 12" {...ink} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 60 q16 4 15 15 q-1 12 -16 10 q-15 -2 -14 -14z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <text x="76" y="34" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="24" fill="#d9534f" className="sage-murmur">SLAM !</text>
    </svg>
  );
}

// La main tendue : deux mains qui se serrent, et lui qui se relève.
function Handshake() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#eef4ef" />
      <rect y="112" width="200" height="38" fill="#dbe3da" />
      <path d="M0 112 h200" stroke="#3f3a55" strokeWidth="2" />
      {/* toi, debout, le bras tendu vers le bas */}
      <g>
        <circle cx="46" cy="46" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M32 44 q12 -15 28 0" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M40 44 h3 M52 44 h3" {...ink} strokeWidth="2" />
        <path d="M40 54 q6 4 12 0" {...ink} strokeWidth="2" />
        <path d="M46 60 v34 M46 94 l-10 18 M46 94 l10 18 M46 68 l24 12" {...ink} strokeWidth="3" />
      </g>
      {/* lui, à genoux, qui se relève en s'appuyant */}
      <g>
        <circle cx="142" cy="60" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M127 56 q6 -15 15 -10 q12 -7 15 7" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M134 60 h5 M147 60 h5" {...ink} strokeWidth="2" />
        <path d="M136 70 q6 3 12 0" {...ink} strokeWidth="2" />
        <path d="M142 75 v24 M142 99 l-14 13 M142 99 l14 13 M142 80 l-30 2" {...ink} strokeWidth="3" />
      </g>
      {/* les deux mains, au milieu */}
      <g>
        <path d="M78 80 q14 -6 22 2 q8 8 -2 14 q-12 6 -20 -2z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M112 78 q-14 -4 -20 6 q-6 10 6 14 q13 4 18 -6z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      {/* ses billes, qui changent de poche */}
      <g>
        <circle cx="96" cy="120" r="5" fill="#7d6bc4" stroke="#3f3a55" strokeWidth="2" />
        <circle cx="110" cy="124" r="5" fill="#5fae83" stroke="#3f3a55" strokeWidth="2" />
        <circle cx="82" cy="125" r="5" fill="#f28b7d" stroke="#3f3a55" strokeWidth="2" />
      </g>
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

// Après l'affrontement : il tombe, tu décides ce que tu en fais, puis il rend ce qu'il a pris.
export function DuelEnd() {
  const won = useRunStore((s) => s.duelWon);
  const back = useRunStore((s) => s.duelBack);
  const choice = useRunStore((s) => s.run?.duelChoice ?? null);
  const decide = useRunStore((s) => s.duelChoose);
  const next = useRunStore((s) => s.leaveDuel);
  const say = useSay();
  const [step, setStep] = useState(0);

  const item = back ? say(relic(back).name) : null;
  const deal = won
    ? (item ? DUEL.wonBack(item) : DUEL.wonEmpty)
    : (item ? DUEL.lostKeep(item) : DUEL.lostFall);

  // Perdu : il reste debout, et ça tient en deux planches.
  if (!won) {
    const cry = 0.1 + DUEL.lost.length * 0.65;
    if (step === 0) {
      return (
        <div className="panel pick interlude duel-end">
          <div className="frame scene-frame"><StillUp /></div>
          <div className="intro-text">
            {DUEL.lost.map((l, i) => <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>)}
          </div>
          <p className="interlude-cry" style={{ animationDelay: `${cry.toFixed(2)}s` }}>« {say(DUEL.lostCry)} »</p>
          <button className="ready-cta" style={{ animationDelay: `${(cry + 1).toFixed(2)}s` }} onClick={() => setStep(1)}>{DUEL.nextLost}</button>
        </div>
      );
    }
    return (
      <div className="panel pick interlude duel-end">
        <div className="frame scene-frame"><StillUp /></div>
        <p className="duel-deal ko" style={{ animationDelay: '0.2s' }}>{say(deal)}</p>
        <p className="interlude-fall" style={{ animationDelay: '1s' }}>{say(DUEL.lostFall)}</p>
        <button className="ready-cta" style={{ animationDelay: '1.6s' }} onClick={next}>{DUEL.leave}</button>
      </div>
    );
  }

  // 1. Il décolle. Et il ne se relève pas.
  if (step === 0) {
    const cry = 0.1 + DUEL.ko.length * 0.65;
    return (
      <div className="panel pick interlude duel-end">
        <div className="frame scene-frame"><Knockout /></div>
        <div className="intro-text">
          {DUEL.ko.map((l, i) => <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>)}
        </div>
        <p className="interlude-cry" style={{ animationDelay: `${cry.toFixed(2)}s` }}>« {say(DUEL.koCry)} »</p>
        <p className="sage-ask" style={{ animationDelay: `${(cry + 0.7).toFixed(2)}s` }}>{say(DUEL.ask)}</p>
        {/* trois secondes, deux possibilités, aucune bonne réponse */}
        <div className="row duel-choice" style={{ animationDelay: `${(cry + 1.2).toFixed(2)}s` }}>
          <button onClick={() => { decide('claque'); setStep(1); }}>{DUEL.slap}</button>
          <button className="secondary" onClick={() => { decide('main'); setStep(1); }}>{DUEL.hand}</button>
        </div>
      </div>
    );
  }

  // 2. Ce que ça t'a coûté, ou rapporté. Et elle qui ouvre la porte au pire moment.
  if (step === 1) {
    const slapped = choice === 'claque';
    const lines = slapped ? DUEL.slapLines : DUEL.handLines;
    const cry = 0.1 + lines.length * 0.65;
    return (
      <div className="panel pick interlude duel-end">
        <div className="frame scene-frame">{slapped ? <Slap /> : <Handshake />}</div>
        <div className="intro-text">
          {lines.map((l, i) => <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>)}
        </div>
        <p className={`duel-deal ${slapped ? 'ko' : 'ok'}`} style={{ animationDelay: `${cry.toFixed(2)}s` }}>
          {say(slapped ? DUEL.slapFall : DUEL.handFall)}
        </p>
        <p className="duel-deal ok" style={{ animationDelay: `${(cry + 0.7).toFixed(2)}s` }}>{say(slapped ? DUEL.slapWin : DUEL.handWin)}</p>
        <button className="ready-cta" style={{ animationDelay: `${(cry + 1.3).toFixed(2)}s` }} onClick={() => setStep(2)}>{DUEL.next}</button>
      </div>
    );
  }

  // 3. Il souffle, il s'excuse, et il retire son insulte de l'année.
  if (step === 2) {
    const cry = 0.1 + DUEL.won.length * 0.65;
    return (
      <div className="panel pick interlude duel-end">
        <div className="frame scene-frame"><Down /></div>
        <div className="intro-text">
          {DUEL.won.map((l, i) => <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>)}
        </div>
        <p className="interlude-cry" style={{ animationDelay: `${cry.toFixed(2)}s` }}>« {say(DUEL.wonCry)} »</p>
        <p className="interlude-cry takeback" style={{ animationDelay: `${(cry + 0.5).toFixed(2)}s` }}>« {say(DUEL.wonTakeback)} »</p>
        <button className="ready-cta" style={{ animationDelay: `${(cry + 1.2).toFixed(2)}s` }} onClick={() => setStep(3)}>{DUEL.next}</button>
      </div>
    );
  }

  // 4. Il rend ce qu'il avait pris, à deux mains.
  return (
    <div className="panel pick interlude duel-end">
      <div className="frame scene-frame"><Handover /></div>
      <p className="duel-deal ok" style={{ animationDelay: '0.2s' }}>{say(deal)}</p>
      <p className="interlude-fall" style={{ animationDelay: '1s' }}>{say(DUEL.wonFall)}</p>
      <button className="ready-cta" style={{ animationDelay: '1.6s' }} onClick={next}>{DUEL.leave}</button>
    </div>
  );
}
