import { relic } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { DUEL } from '../theme/lexicon';
import { useSay } from '../theme/useSay';
import { EventArt } from './EventArt';

const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// Kévin à genoux, de profil, plié en avant, une main tendue vers toi. Même trait que les cases.
function Down() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#e7ecef" />
      <g stroke="#d4dade" strokeWidth="2"><path d="M0 30 h200 M0 62 h200 M0 94 h200 M44 0 v112 M100 0 v112 M156 0 v112" /></g>
      <rect y="112" width="200" height="38" fill="#c8c3b4" />
      <path d="M0 112 h200" stroke="#3f3a55" strokeWidth="2" />
      {/* le cartable, tombé derrière lui */}
      <g transform="rotate(12 160 100)">
        <rect x="142" y="86" width="34" height="24" rx="4" fill="#c67f5a" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M142 94 h34" stroke="#3f3a55" strokeWidth="2" />
      </g>
      {/* tibias au sol, cuisse relevée : il est à genoux */}
      <path d="M132 110 h-34 l10 -20" {...ink} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M132 110 q8 0 8 -5" {...ink} strokeWidth="4" strokeLinecap="round" />
      {/* dos courbé, du bassin à l'épaule */}
      <path d="M108 90 q-8 -12 -20 -16" {...ink} strokeWidth="4" strokeLinecap="round" />
      {/* bras qui pend, côté opposé */}
      <path d="M90 76 q6 14 14 18" {...ink} strokeWidth="3" strokeLinecap="round" />
      {/* tête basse */}
      <circle cx="76" cy="66" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M62 60 q4 -16 14 -11 q12 -7 15 7 q-6 -5 -15 -3 q-9 2 -14 7z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M66 68 q4 4 8 0 M80 68 q4 4 8 0" {...ink} strokeWidth="2" />
      <ellipse cx="78" cy="79" rx="4.5" ry="3.5" fill="#3f3a55" />
      {/* le bras qui tend l'objet, paume ouverte */}
      <path d="M88 78 l-24 8" {...ink} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M64 80 q-11 1 -11 9 q0 8 10 7 q10 -1 10 -8z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      {/* la sueur part en l'air, comme dans les cases */}
      <g fill="#bfe0ef" stroke="#3f3a55" strokeWidth="1.5">
        <path d="M56 38 q4 6 0 8 q-5 -2 0 -8z" /><path d="M96 32 q4 6 0 8 q-5 -2 0 -8z" />
      </g>
      <text x="146" y="46" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#9a93a8" className="sage-murmur">« pardon… »</text>
    </svg>
  );
}

// Après l'affrontement : il est à terre et il rend ce qu'il avait pris, ou la sonnerie l'a sauvé.
export function DuelEnd() {
  const won = useRunStore((s) => s.duelWon);
  const back = useRunStore((s) => s.duelBack);
  const next = useRunStore((s) => s.leaveDuel);
  const say = useSay();

  const lines = won ? DUEL.won : DUEL.lost;
  const cry = 0.1 + lines.length * 0.65;
  const item = back ? say(relic(back).name) : null;
  const deal = won
    ? (item ? DUEL.wonBack(item) : DUEL.wonEmpty)
    : (item ? DUEL.lostKeep(item) : DUEL.lostFall);

  return (
    <div className="panel pick interlude duel-end">
      <div className="frame scene-frame">{won ? <Down /> : <EventArt id="kevin" />}</div>
      <div className="intro-text">
        {lines.map((l, i) => (
          <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>
        ))}
      </div>
      <p className="interlude-cry" style={{ animationDelay: `${cry.toFixed(2)}s` }}>« {say(won ? DUEL.wonCry : DUEL.lostCry)} »</p>
      {/* il retire son insulte de l'année : c'est la seule chose qu'il rend spontanément */}
      {won && <p className="interlude-cry takeback" style={{ animationDelay: `${(cry + 0.5).toFixed(2)}s` }}>« {say(DUEL.wonTakeback)} »</p>}
      <p className={`duel-deal ${won ? 'ok' : 'ko'}`} style={{ animationDelay: `${(cry + 0.9).toFixed(2)}s` }}>{say(deal)}</p>
      <p className="interlude-fall" style={{ animationDelay: `${(cry + 1.6).toFixed(2)}s` }}>{say(won ? DUEL.wonFall : DUEL.lostFall)}</p>
      <button className="ready-cta" style={{ animationDelay: `${(cry + 2.2).toFixed(2)}s` }} onClick={next}>{DUEL.leave}</button>
    </div>
  );
}
