import { useRunStore } from '../state/runStore';
import { DUEL } from '../theme/lexicon';
import { useSay } from '../theme/useSay';

const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// La classe avant la sonnerie : les chaises retournées sur les tables, sauf deux,
// descendues et mises face à face au milieu de l'allée.
function Arena() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#f3ece0" />
      <rect y="104" width="200" height="46" fill="#e2d6c2" />
      <path d="M0 104 h200" stroke="#c9b9a0" strokeWidth="2" />
      {/* le tableau, éteint */}
      <rect x="16" y="14" width="80" height="44" rx="3" fill="#8a5a2b" />
      <rect x="21" y="19" width="70" height="34" rx="2" fill="#2f5d4b" />
      {/* les autres tables, chaises retournées dessus */}
      {[130, 168].map((x) => (
        <g key={x} opacity="0.75">
          <rect x={x} y="60" width="30" height="5" rx="2" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2" />
          <path d={`M${x + 3} 65 v12 M${x + 27} 65 v12`} {...ink} strokeWidth="2" />
          <path d={`M${x + 5} 60 v-14 h20 v14 M${x + 5} 52 h20`} {...ink} strokeWidth="2" />
        </g>
      ))}
      {/* les deux tables descendues, face à face */}
      <g>
        <rect x="22" y="96" width="54" height="7" rx="2" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M28 103 v16 M70 103 v16" {...ink} strokeWidth="3" />
        <rect x="118" y="96" width="54" height="7" rx="2" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M124 103 v16 M166 103 v16" {...ink} strokeWidth="3" />
      </g>
      {/* ta chaise, vide, de dos */}
      <g opacity="0.9">
        <path d="M40 96 v-22 M58 96 v-22 M38 74 h22" {...ink} strokeWidth="3" />
      </g>
      {/* Kévin, assis bien droit, les deux mains à plat */}
      <g>
        <path d="M134 96 v-26 M154 96 v-26 M132 70 h24" {...ink} strokeWidth="3" />
        <circle cx="144" cy="52" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M130 48 q5 -14 14 -9 q11 -7 14 6" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M137 52 h5 M147 52 h5" {...ink} strokeWidth="2" />
        <path d="M138 62 h12" {...ink} strokeWidth="2" />
        <path d="M144 66 v22" {...ink} strokeWidth="3" />
        <path d="M144 74 l-16 18 M144 74 l16 18" {...ink} strokeWidth="2.5" />
      </g>
      {/* sa feuille, la première de l'année, et un stylo qui n'est pas le tien */}
      <g transform="rotate(-3 145 99)">
        <rect x="128" y="92" width="34" height="7" rx="1" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2" />
      </g>
      <path d="M116 96 l10 -3" stroke="#5d4aa8" strokeWidth="3" strokeLinecap="round" />
      <text x="62" y="36" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="14" fill="#9a93a8" className="sage-murmur">« assieds-toi. »</text>
    </svg>
  );
}

// Avant la dernière dictée : la scène, en grand. Le chrono ne part qu'au clic.
export function DuelIntro() {
  const start = useRunStore((s) => s.startDuel);
  const say = useSay();
  return (
    <div className="panel pick event-intro">
      <div className="frame event-hero"><Arena /></div>
      <h2>{DUEL.title}</h2>
      <div className="intro-text">
        {DUEL.intro.map((l, i) => <p key={l} style={{ animationDelay: `${(0.1 + i * 0.6).toFixed(2)}s` }}>{say(l)}</p>)}
      </div>
      <p className="sage-ask" style={{ animationDelay: `${(0.1 + DUEL.intro.length * 0.6).toFixed(2)}s` }}>{say(DUEL.taunt)}</p>
      <button className="ready-cta" onClick={start}>{DUEL.cta}</button>
    </div>
  );
}
