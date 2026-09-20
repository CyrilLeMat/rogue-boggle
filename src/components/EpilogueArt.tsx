import type { Gender } from '../theme/lexicon';

const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// Acte I — le dernier jour : elle remplit les bulletins, il fait vingt-huit degrés.
function LastDay() {
  return (
    <>
      <rect width="200" height="150" fill="#f3ece0" />
      <rect y="112" width="200" height="38" fill="#e2d6c2" />
      <path d="M0 112 h200" stroke="#c9b9a0" strokeWidth="2" />
      {/* la fenêtre, grande ouverte sur l'été */}
      <rect x="128" y="20" width="60" height="58" fill="#bfe0ef" stroke="#3f3a55" strokeWidth="3" />
      <path d="M158 20 v58 M128 49 h60" stroke="#3f3a55" strokeWidth="2.5" />
      <circle cx="174" cy="34" r="9" fill="#f7c55c" />
      {/* le bureau, la pile de bulletins, le stylo rouge */}
      <rect x="22" y="94" width="120" height="8" rx="2" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M32 102 v14 M132 102 v14" {...ink} strokeWidth="3" />
      <g transform="rotate(-4 64 88)">
        <rect x="40" y="80" width="48" height="14" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2" />
        <path d="M46 86 h24" stroke="#b9b1c9" strokeWidth="2" strokeLinecap="round" />
      </g>
      <rect x="96" y="84" width="34" height="10" rx="2" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2" />
      {/* elle, penchée, le stylo rouge qui ne s'arrête pas */}
      <g>
        <circle cx="70" cy="46" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M54 48 q0 -22 16 -22 q16 0 16 22 q-5 -10 -16 -10 q-11 0 -16 10z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <g fill="none" stroke="#3f3a55" strokeWidth="2">
          <circle cx="64" cy="46" r="4.5" /><circle cx="77" cy="46" r="4.5" /><path d="M68.5 46 h4" />
        </g>
        <path d="M65 57 h10" {...ink} strokeWidth="2" />
        <path d="M70 62 v22" {...ink} strokeWidth="3" />
        <path d="M70 68 l-14 14" {...ink} strokeWidth="2.5" />
        <path d="M56 82 l-8 6" stroke="#d9534f" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <text x="152" y="104" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#9a93a8" className="sage-murmur">28°</text>
    </>
  );
}

// Acte II — ce que tout le monde devient : le bulletin plié en quatre, dans une poche.
function Pocket() {
  return (
    <>
      <rect width="200" height="150" fill="#eef0f4" />
      {/* le tissu de la veste, cadré serré */}
      <path d="M0 150 V30 q40 -18 62 -30 h76 q22 12 62 30 V150z" fill="#7d8aa8" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 0 q18 40 38 44 q20 -4 38 -44" fill="#8f9bb6" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
      {/* la poche, et le papier plié en quatre qui dépasse */}
      <rect x="24" y="72" width="46" height="34" rx="3" fill="#8f9bb6" stroke="#3f3a55" strokeWidth="3" />
      <g transform="rotate(-7 47 68)">
        <rect x="30" y="52" width="34" height="26" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M47 52 v26 M30 65 h34" stroke="#c9b9a0" strokeWidth="1.8" />
        <path d="M34 58 h10 M34 71 h8" stroke="#b9b1c9" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M52 58 l8 0" stroke="#d9534f" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* le bouton, et rien d'autre : c'est déjà toute la scène */}
      <circle cx="152" cy="98" r="6" fill="#e6dccb" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M150 96 h4 M150 100 h4" stroke="#3f3a55" strokeWidth="1.5" />
    </>
  );
}

// Acte III — trente ans plus tard : très vieux, en chaise roulante, la feuille sur les genoux.
function Later({ gender }: { gender: Gender }) {
  return (
    <>
      <rect width="200" height="150" fill="#f6ead6" />
      <rect y="118" width="200" height="32" fill="#ddc9a8" />
      <path d="M0 118 h200" stroke="#c9b9a0" strokeWidth="2" />
      {/* la grande roue, et la petite devant */}
      <g {...ink}>
        <circle cx="86" cy="98" r="24" strokeWidth="3" />
        <circle cx="86" cy="98" r="4" fill="#3f3a55" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M86 98 L${86 + 22 * Math.cos((i * Math.PI) / 3)} ${98 + 22 * Math.sin((i * Math.PI) / 3)}`} strokeWidth="2" />
        ))}
        <circle cx="132" cy="110" r="9" strokeWidth="3" />
      </g>
      {/* le dossier, l'assise, la poignée */}
      <path d="M70 92 V44 q0 -6 8 -6 M62 44 h16" {...ink} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M74 90 h48 M122 90 v16" {...ink} strokeWidth="3.5" strokeLinecap="round" />
      {/* la personne : très vieille, mais bien droite */}
      <g>
        <path d="M94 88 V62" {...ink} strokeWidth="4" />
        <circle cx="96" cy="46" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        {gender === 'f'
          ? <>
              <path d="M82 44 q2 -18 14 -14 q13 -4 14 14 q-6 -6 -14 -5 q-9 1 -14 5z" fill="#e3e0e6" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
              <circle cx="110" cy="34" r="7" fill="#e3e0e6" stroke="#3f3a55" strokeWidth="2.5" />
            </>
          : <>
              <path d="M82 42 q4 -14 14 -12 q12 -2 14 12 q-8 -4 -14 -3 q-7 1 -14 3z" fill="#e3e0e6" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M88 56 q8 5 16 0" stroke="#e3e0e6" strokeWidth="4" strokeLinecap="round" />
            </>}
        {/* les lunettes, et le sourire de quelqu'un qui n'a rien oublié */}
        <g fill="none" stroke="#3f3a55" strokeWidth="2">
          <circle cx="90" cy="46" r="4.5" /><circle cx="103" cy="46" r="4.5" /><path d="M94.5 46 h4" />
        </g>
        <path d="M90 56 q6 5 12 0" {...ink} strokeWidth="2" />
        {/* le bras, et le stylo, toujours */}
        <path d="M94 70 l16 10" {...ink} strokeWidth="3" />
        <path d="M110 80 l10 -6" stroke="#5d4aa8" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* la feuille sur les genoux, avec un mot dessus */}
      <g transform="rotate(-6 106 86)">
        <rect x="86" y="76" width="42" height="20" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M92 84 h28 M92 90 h18" stroke="#b9b1c9" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </>
  );
}

export function EpilogueArt({ act, gender }: { act: number; gender: Gender }) {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      {act === 0 ? <LastDay /> : act === 1 ? <Pocket /> : <Later gender={gender} />}
    </svg>
  );
}
