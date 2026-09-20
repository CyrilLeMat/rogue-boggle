import type { Band } from '../theme/lexicon';

const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// Son buste, toujours le même : c'est ce qu'elle en fait qui change.
// Six humeurs, calquées sur les bandes d'appréciation : de la copie brandie au cahier refermé.
type Mood = 'prodige' | 'suspect' | 'bien' | 'moyen' | 'rate' | 'fatal';

const MOOD: Record<Band, Mood> = {
  prodige: 'prodige', suspect: 'suspect', bien: 'bien',
  correct: 'moyen', justesse: 'moyen',
  presque: 'rate', rate: 'rate', fatal: 'fatal',
};

const CRY: Record<Mood, string> = {
  prodige: '!!!',
  suspect: 'hmm ?',
  bien: 'bien.',
  moyen: 'mouais',
  rate: 'non, non, non',
  fatal: '',
};

function Eyes({ mood }: { mood: Mood }) {
  const squint = mood === 'suspect' || mood === 'rate';
  return (
    <>
      {/* les lunettes ne la quittent jamais : seul le regard derrière change */}
      <g fill="none" stroke="#3f3a55" strokeWidth="2.5">
        <circle cx="85" cy="68" r="9" /><circle cx="115" cy="68" r="9" /><path d="M94 68 h12" />
      </g>
      {mood === 'prodige' ? (
        <g {...ink} strokeWidth="2.5" strokeLinecap="round"><path d="M80 70 q5 -7 10 0 M110 70 q5 -7 10 0" /></g>
      ) : mood === 'fatal' ? (
        <g {...ink} strokeWidth="2.5" strokeLinecap="round"><path d="M79 68 h12 M109 68 h12" /></g>
      ) : (
        <>
          <circle cx={squint ? 88 : 85} cy="68" r="3.2" fill="#3f3a55" />
          <circle cx={squint ? 112 : 115} cy="68" r="3.2" fill="#3f3a55" />
        </>
      )}
      {/* un sourcil qui monte : c'est tout ce qu'elle t'accorde */}
      {mood === 'moyen' && <path d="M104 54 q10 -5 18 0" {...ink} strokeWidth="2.5" strokeLinecap="round" />}
      {mood === 'rate' && <g {...ink} strokeWidth="2.5" strokeLinecap="round"><path d="M76 54 l16 5 M124 54 l-16 5" /></g>}
    </>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === 'prodige') return <ellipse cx="100" cy="90" rx="11" ry="9" fill="#3f3a55" />;
  if (mood === 'bien') return <path d="M88 86 q12 12 24 0" {...ink} strokeWidth="3" strokeLinecap="round" />;
  if (mood === 'rate') return <ellipse cx="100" cy="89" rx="9" ry="7" fill="#3f3a55" />;
  if (mood === 'fatal') return <path d="M88 90 h24" {...ink} strokeWidth="3" strokeLinecap="round" />;
  if (mood === 'suspect') return <path d="M88 90 q12 -6 24 0" {...ink} strokeWidth="3" strokeLinecap="round" />;
  return <path d="M88 89 q12 4 24 -2" {...ink} strokeWidth="3" strokeLinecap="round" />;
}

// Ce qu'elle tient : une copie brandie, une loupe, un tampon, ou rien du tout.
function Props({ mood }: { mood: Mood }) {
  if (mood === 'prodige') {
    return (
      <g>
        <path d="M60 120 l-18 -26 M140 120 l18 -26" {...ink} strokeWidth="4" strokeLinecap="round" />
        <g transform="rotate(-12 34 84)">
          <rect x="16" y="66" width="36" height="26" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
          <path d="M22 74 h22 M22 82 h14" stroke="#d9534f" strokeWidth="2" strokeLinecap="round" />
        </g>
        <path d="M166 62 l3 8 9 1 -7 6 2 9 -7 -5 -8 5 2 -9 -7 -6 9 -1z" fill="#e6a94c" stroke="#3f3a55" strokeWidth="1.5" />
      </g>
    );
  }
  if (mood === 'suspect') {
    return (
      <g>
        <path d="M140 120 l14 -22" {...ink} strokeWidth="4" strokeLinecap="round" />
        <circle cx="126" cy="70" r="20" fill="#bfe0ef" fillOpacity="0.45" stroke="#3f3a55" strokeWidth="3" />
        <path d="M140 84 l14 14" stroke="#8a5a2b" strokeWidth="5" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'bien') {
    return (
      <g>
        <path d="M144 120 l16 -18" {...ink} strokeWidth="4" strokeLinecap="round" />
        <g transform="rotate(14 164 96)">
          <rect x="150" y="86" width="28" height="20" rx="3" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2.5" />
          <path d="M164 90 l2 5 6 1 -4 4 1 6 -5 -3 -5 3 1 -6 -4 -4 6 -1z" fill="#fffdf9" />
        </g>
      </g>
    );
  }
  if (mood === 'rate') {
    return (
      <g>
        <path d="M144 120 l18 -14" {...ink} strokeWidth="4" strokeLinecap="round" />
        <g className="tension">
          <path d="M160 108 l22 -14" stroke="#d9534f" strokeWidth="5" strokeLinecap="round" />
          <path d="M150 118 q14 -4 26 -14 M146 126 q16 -4 30 -16" stroke="#d9534f" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    );
  }
  if (mood === 'fatal') {
    return (
      <g>
        <path d="M60 120 l-14 -16 M140 120 l14 -16" {...ink} strokeWidth="4" strokeLinecap="round" />
        <rect x="38" y="116" width="124" height="12" rx="2" fill="#8a5a2b" stroke="#3f3a55" strokeWidth="2.5" />
      </g>
    );
  }
  return (
    <g>
      <path d="M144 120 l16 -20" {...ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M158 104 l14 -10" stroke="#d9534f" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export function MaitresseArt({ band }: { band: Band }) {
  const mood = MOOD[band];
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <rect width="200" height="150" fill="#f3ece0" />
      {/* un bout de tableau derrière elle, et la frise */}
      <rect x="0" y="8" width="60" height="70" rx="3" fill="#2f5d4b" stroke="#3f3a55" strokeWidth="3" />
      <path d="M8 24 h40 M8 36 h28" stroke="#f6f1e4" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      {/* sa robe rouge, les épaules */}
      <path d="M40 150 v-16 q0 -20 24 -26 h72 q24 6 24 26 v16z" fill="#d9534f" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 108 v42" stroke="#b5423e" strokeWidth="2.5" />
      {/* le cou, la tête, la coupe au carré */}
      <path d="M92 108 v-12 h16 v12z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="100" cy="68" r="32" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="3" />
      <path d="M66 72 q0 -44 34 -44 q34 0 34 44 q-10 -20 -34 -20 q-24 0 -34 20z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
      <path d="M66 72 v16 M134 72 v16" stroke="#6f4a33" strokeWidth="9" strokeLinecap="round" />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      <Props mood={mood} />
      {CRY[mood] && (
        <text x="184" y="30" textAnchor="end" fontFamily="'Patrick Hand', cursive" fontSize="19" fill="#9a93a8" className="sage-murmur">
          « {CRY[mood]} »
        </text>
      )}
    </svg>
  );
}
