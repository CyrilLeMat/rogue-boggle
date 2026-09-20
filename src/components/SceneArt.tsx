import type { ReactElement } from 'react';
import { Desk, Kid, SKIN, ink } from './art/primitives';

// Une planche par situation. Même trait que le prologue : aplats pastel, contour encre,
// personnages en fil de fer, et toujours un détail qui dit la catastrophe.
const ARTS: Record<string, () => ReactElement> = {
  // L'encre déferle, Sophie s'effondre, tu recules
  sophie: () => (
    <>
      <rect width="320" height="180" fill="#ece6f7" />
      <rect y="150" width="320" height="30" fill="#c9bfa8" />
      <path d="M96 176 q22 -34 54 -30 q40 5 60 30z" fill="#7d6bc4" opacity="0.85" />
      <path d="M150 168 q-26 6 -40 12" stroke="#5d4aa8" strokeWidth="6" fill="none" strokeLinecap="round" />
      <g transform="rotate(38 150 140)"><rect x="140" y="136" width="30" height="7" rx="3" fill="#5d4aa8" stroke="#3f3a55" strokeWidth="2" /></g>
      <g className="splash">
        <path d="M152 132 l10 -22 M160 134 l20 -14 M146 130 l-6 -20 M168 140 l24 -4" stroke="#7d6bc4" strokeWidth="4" strokeLinecap="round" />
        <circle cx="186" cy="104" r="5" fill="#7d6bc4" /><circle cx="128" cy="100" r="4" fill="#7d6bc4" /><circle cx="204" cy="128" r="4" fill="#7d6bc4" />
      </g>
      {/* Sophie à genoux, bras au ciel */}
      <g>
        <circle cx="206" cy="86" r="13" fill="#f6d1c2" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M206 99 v26 M206 106 l-16 -18 M206 106 l16 -18 M206 125 l-12 16 M206 125 l12 16" {...ink} />
        <path d="M200 90 q6 8 12 0" {...ink} strokeWidth="2" />
        <path d="M197 80 q3 -5 6 0 M209 80 q3 -5 6 0" {...ink} strokeWidth="2" />
        <path d="M198 92 q-2 10 -1 16 M214 92 q2 10 1 16" stroke="#7fb0e0" strokeWidth="2.5" fill="none" />
      </g>
      <text x="252" y="56" fontFamily="'Patrick Hand', cursive" fontSize="19" fill="#d9534f" transform="rotate(-8 252 56)">Noooon !!</text>
      {/* toi, reculant */}
      <Kid x={70} y={92} arms="side" />
      <path d="M52 112 l-16 6 M88 112 l14 8" {...ink} strokeWidth="2" />
      <Desk x={40} y={130} />
    </>
  ),

  // Le bocal renversé, les escargots partout
  bocal: () => (
    <>
      <rect width="320" height="180" fill="#e9f1ea" />
      <rect y="146" width="320" height="34" fill="#d8d2c8" />
      <g transform="rotate(-72 96 140)">
        <rect x="70" y="118" width="52" height="40" rx="6" fill="#dff0f5" stroke="#3f3a55" strokeWidth="2.5" opacity="0.9" />
        <rect x="68" y="112" width="56" height="8" rx="3" fill="#b9ae9c" stroke="#3f3a55" strokeWidth="2" />
      </g>
      {[[140, 160], [178, 152], [208, 164], [246, 150], [120, 168], [270, 160]].map(([x, y], i) => (
        <g key={i} className="snail-crawl" style={{ animationDelay: `${i * 0.4}s` }}>
          <path d={`M${x - 9} ${y} q4 -9 12 -6`} {...ink} strokeWidth="2" />
          <circle cx={x} cy={y - 4} r="7" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2" />
          <circle cx={x} cy={y - 4} r="3" fill="none" stroke="#3f3a55" strokeWidth="1.5" />
          <path d={`M${x + 6} ${y - 9} l3 -5 M${x + 9} ${y - 7} l4 -4`} {...ink} strokeWidth="1.5" />
        </g>
      ))}
      {/* la maîtresse regarde le plafond */}
      <g>
        <circle cx="258" cy="70" r="14" fill={SKIN} stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M258 84 v30 M258 92 l-16 12 M258 92 l16 12" {...ink} />
        <path d="M244 62 q14 -12 28 0" {...ink} strokeWidth="3" />
        <path d="M250 68 l6 -3 M266 68 l-6 -3" {...ink} strokeWidth="2" />
        <path d="M252 78 h12" {...ink} strokeWidth="2" />
      </g>
      <text x="196" y="44" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#9a93a8">« … »</text>
      <Kid x={62} y={78} arms="down" />
    </>
  ),

  // Deux tables libres : Kévin ou la fenêtre
  place: () => (
    <>
      <rect width="320" height="180" fill="#f3ece0" />
      <rect y="150" width="320" height="30" fill="#c9bfa8" />
      {/* fenêtre ouverte, à gauche */}
      <rect x="10" y="20" width="76" height="74" rx="3" fill="#cfe4f5" stroke="#3f3a55" strokeWidth="3" />
      <path d="M48 20 v74 M10 57 h76" stroke="#3f3a55" strokeWidth="2" />
      <path d="M86 30 q30 12 -4 22 M86 52 q34 10 -2 20" stroke="#7fb0e0" strokeWidth="3" fill="none" strokeLinecap="round" className="wind" />
      <Desk x={22} y={120} />
      {/* Kévin, à droite, tout sourire */}
      <g>
        <circle cx="248" cy="82" r="13" fill="#f2ddc8" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M248 95 v24 M248 102 l-15 10 M248 102 l16 -6" {...ink} />
        <path d="M234 74 q14 -10 28 0" {...ink} strokeWidth="3" />
        <path d="M241 88 q7 7 14 0" {...ink} strokeWidth="2" />
        <g fill="#3f3a55"><circle cx="243" cy="80" r="1.8" /><circle cx="253" cy="80" r="1.8" /></g>
      </g>
      <Desk x={230} y={120} />
      <text x="160" y="46" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="18" fill="#d9534f">deux places libres</text>
      <path d="M120 60 l-26 34 M200 60 l26 34" stroke="#d9534f" strokeWidth="2" strokeDasharray="5 5" fill="none" />
    </>
  ),

  // Le remplaçant, pâle, avec son classeur
  remplacant: () => (
    <>
      <rect width="320" height="180" fill="#eef4fb" />
      <rect x="96" y="14" width="150" height="70" rx="4" fill="#8a5a2b" />
      <rect x="102" y="20" width="138" height="58" rx="3" fill="#2f5d4b" />
      <rect y="150" width="320" height="30" fill="#c9bfa8" />
      {/* lui */}
      <g>
        <circle cx="168" cy="106" r="15" fill="#fff0e6" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M168 121 v26" {...ink} />
        <path d="M154 108 q6 -6 10 0 M172 108 q6 -6 10 0" {...ink} strokeWidth="2" />
        <path d="M162 116 q6 -4 12 0" {...ink} strokeWidth="2" />
        <path d="M154 96 q14 -10 28 0" {...ink} strokeWidth="3" />
        <path d="M168 128 l-20 4 M168 128 l20 4" {...ink} />
        <rect x="146" y="128" width="44" height="30" rx="3" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M152 138 h32 M152 146 h24" stroke="#b9c6de" strokeWidth="2" />
      </g>
      <path d="M186 90 q8 -6 6 -14" stroke="#7fb0e0" strokeWidth="2.5" fill="none" className="drop" />
      {/* la classe qui le fixe */}
      <g fill="#b9ae9c" stroke="#3f3a55" strokeWidth="2">
        <circle cx="34" cy="150" r="12" /><circle cx="74" cy="156" r="12" /><circle cx="246" cy="156" r="12" /><circle cx="286" cy="150" r="12" />
      </g>
      <g fill="#3f3a55">
        <circle cx="30" cy="148" r="1.8" /><circle cx="38" cy="148" r="1.8" /><circle cx="70" cy="154" r="1.8" /><circle cx="78" cy="154" r="1.8" />
        <circle cx="242" cy="154" r="1.8" /><circle cx="250" cy="154" r="1.8" /><circle cx="282" cy="148" r="1.8" /><circle cx="290" cy="148" r="1.8" />
      </g>
    </>
  ),

  // Le gros mot au tableau et le silence
  grosmot: () => (
    <>
      <rect width="320" height="180" fill="#f3ece0" />
      <rect x="40" y="16" width="240" height="96" rx="4" fill="#8a5a2b" />
      <rect x="48" y="24" width="224" height="80" rx="3" fill="#2f5d4b" />
      <text x="160" y="74" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="40" fill="#f6f1e4" className="chalk">#@!*%</text>
      <rect y="150" width="320" height="30" fill="#c9bfa8" />
      {/* elle, bras croisés, immobile */}
      <g>
        <circle cx="262" cy="130" r="13" fill={SKIN} stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M262 143 v22" {...ink} />
        <path d="M248 152 h28" {...ink} strokeWidth="3" />
        <path d="M248 122 q14 -11 28 0" {...ink} strokeWidth="3" />
        <path d="M255 138 h14" {...ink} strokeWidth="2" />
        <g fill="#3f3a55"><circle cx="257" cy="128" r="1.8" /><circle cx="267" cy="128" r="1.8" /></g>
      </g>
      {/* et tout le monde qui te regarde */}
      <Kid x={60} y={128} arms="down" />
      <g stroke="#d9534f" strokeWidth="2" strokeDasharray="4 4" fill="none">
        <path d="M110 140 l-34 -6 M150 146 l-72 -12 M196 142 l-112 -10" />
      </g>
      <g fill="#b9ae9c" stroke="#3f3a55" strokeWidth="2">
        <circle cx="120" cy="146" r="11" /><circle cx="160" cy="152" r="11" /><circle cx="204" cy="148" r="11" />
      </g>
    </>
  ),

  // Gérard et son trépied
  photo: () => (
    <>
      <rect width="320" height="180" fill="#e9e3f4" />
      <rect y="150" width="320" height="30" fill="#c9bfa8" />
      {/* gradins d'enfants */}
      <g fill={SKIN} stroke="#3f3a55" strokeWidth="2.5">
        <circle cx="70" cy="92" r="12" /><circle cx="106" cy="86" r="12" /><circle cx="142" cy="92" r="12" /><circle cx="178" cy="86" r="12" />
      </g>
      <g {...ink}><path d="M70 104 v24 M106 98 v30 M142 104 v24 M178 98 v30" /></g>
      <g fill="#3f3a55">
        <circle cx="66" cy="90" r="1.8" /><circle cx="74" cy="90" r="1.8" /><circle cx="102" cy="84" r="1.8" /><circle cx="110" cy="84" r="1.8" />
        <circle cx="138" cy="90" r="1.8" /><circle cx="146" cy="90" r="1.8" /><circle cx="174" cy="84" r="1.8" /><circle cx="182" cy="84" r="1.8" />
      </g>
      <path d="M64 98 q6 5 12 0 M136 98 q6 5 12 0" {...ink} strokeWidth="2" />
      {/* doigts derrière la tête du voisin */}
      <path d="M118 74 v-10 M126 74 v-10" {...ink} strokeWidth="2.5" />
      {/* Gérard */}
      <g>
        <path d="M262 150 l-16 -44 M262 150 l16 -44 M262 150 v-44" {...ink} strokeWidth="3" />
        <rect x="240" y="76" width="46" height="30" rx="4" fill="#3f3a55" />
        <circle cx="236" cy="91" r="9" fill="#5d4aa8" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="272" cy="66" r="11" fill="#f2ddc8" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M262 60 q10 -8 20 0" {...ink} strokeWidth="2.5" />
        <path d="M266 72 h12" {...ink} strokeWidth="2" />
      </g>
      <text x="200" y="40" fontFamily="'Patrick Hand', cursive" fontSize="16" fill="#9a93a8">« on ne bouge plus »</text>
    </>
  ),

  // Les chaussures sous la porte
  directeur: () => (
    <>
      <rect width="320" height="180" fill="#e2d6c2" />
      <rect x="86" y="10" width="148" height="152" rx="3" fill="#a6702f" stroke="#3f3a55" strokeWidth="3" />
      <rect x="98" y="22" width="124" height="86" rx="2" fill="#c68a4e" />
      <circle cx="212" cy="96" r="6" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2.5" className="handle" />
      <rect x="86" y="162" width="148" height="6" fill="#8a5a2b" />
      {/* ombre et chaussures sous la porte */}
      <rect x="92" y="150" width="136" height="12" fill="#3f3a55" opacity="0.25" />
      <g fill="#1f1b2e">
        <ellipse cx="136" cy="156" rx="17" ry="6" /><ellipse cx="184" cy="156" rx="17" ry="6" />
      </g>
      <text x="160" y="72" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#fffaf2" opacity="0.85">DIRECTION</text>
      <g className="sweat">
        <path d="M54 96 q7 12 0 18 q-7 -6 0 -18z" fill="#7fb0e0" />
        <path d="M272 108 q6 10 0 16 q-6 -6 0 -16z" fill="#7fb0e0" />
      </g>
      <text x="40" y="50" fontFamily="'Patrick Hand', cursive" fontSize="22" fill="#d9534f">toc…</text>
      <text x="238" y="132" fontFamily="'Patrick Hand', cursive" fontSize="22" fill="#d9534f">toc…</text>
    </>
  ),

  // La feuille volante, relique jaunie
  cahier: () => (
    <>
      <rect width="320" height="180" fill="#f3ece0" />
      <rect y="150" width="320" height="30" fill="#c9bfa8" />
      <g transform="rotate(-6 160 88)">
        <path d="M108 40 h104 l6 96 h-116z" fill="#fdf6e0" stroke="#3f3a55" strokeWidth="3" />
        <g stroke="#c9b9a0" strokeWidth="1.5">
          <path d="M118 58 h84 M118 72 h84 M118 86 h84 M118 100 h84 M118 114 h70" />
        </g>
        <path d="M108 40 q20 10 0 20 q22 8 0 18" stroke="#3f3a55" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M196 44 l18 14 -18 4z" fill="#e2d6c2" stroke="#3f3a55" strokeWidth="2" />
        <circle cx="150" cy="96" r="9" fill="#e6c68a" opacity="0.5" />
      </g>
      {/* sa main qui tend la feuille */}
      <g {...ink}><path d="M290 120 l-40 -18" strokeWidth="3" /></g>
      <circle cx="296" cy="124" r="10" fill={SKIN} stroke="#3f3a55" strokeWidth="2.5" />
      <Kid x={48} y={104} arms="up" />
      <text x="40" y="60" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#d9534f">« je l'ai oublié… »</text>
    </>
  ),

  // La cantine : deux plateaux, un silence
  cantine: () => (
    <>
      <rect width="320" height="180" fill="#eef1e8" />
      <rect y="150" width="320" height="30" fill="#cfd3c4" />
      <g stroke="#dfe3d6" strokeWidth="2">
        <path d="M0 40 h320 M0 76 h320" />
      </g>
      <rect x="20" y="118" width="280" height="12" rx="3" fill="#c9cbd0" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M46 130 v34 M274 130 v34" stroke="#3f3a55" strokeWidth="3" />
      {[70, 186].map((x, i) => (
        <g key={x}>
          <rect x={x} y="102" width="64" height="16" rx="4" fill="#f3f1ea" stroke="#3f3a55" strokeWidth="2.5" />
          <ellipse cx={x + 22} cy="110" rx="13" ry="6" fill={i === 0 ? '#e8d9a8' : '#9db87c'} stroke="#3f3a55" strokeWidth="2" />
          <circle cx={x + 50} cy="110" r="5" fill="#d9cdb4" stroke="#3f3a55" strokeWidth="2" />
        </g>
      ))}
      <g className="sweat" stroke="#b9c9a8" strokeWidth="2" strokeLinecap="round">
        <path d="M208 96 v-8 M216 92 v-10 M224 96 v-8" />
      </g>
      {/* toi, tétanisé devant ton plateau */}
      <g>
        <circle cx="102" cy="72" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="96" cy="70" r="3" fill="#fff" stroke="#3f3a55" strokeWidth="1.5" />
        <circle cx="108" cy="70" r="3" fill="#fff" stroke="#3f3a55" strokeWidth="1.5" />
        <circle cx="96" cy="70" r="1.3" fill="#3f3a55" /><circle cx="108" cy="70" r="1.3" fill="#3f3a55" />
        <path d="M96 82 q6 -4 12 0" {...ink} strokeWidth="2" />
        <path d="M102 86 v18 M102 92 l-14 12 M102 92 l14 12" {...ink} />
      </g>
      {/* Kévin, immobile, satisfait */}
      <g>
        <circle cx="222" cy="72" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M215 68 h6 M225 68 h6" {...ink} strokeWidth="2" />
        <path d="M214 80 q8 6 16 0" {...ink} strokeWidth="2" />
        <path d="M222 86 v18 M222 92 l-16 12 M222 92 l16 12" {...ink} />
      </g>
      <text x="152" y="52" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#d9534f">« mange. »</text>
    </>
  ),

  // Le gâteau de Léa
  anniversaire: () => (
    <>
      <rect width="320" height="180" fill="#fdeae6" />
      <rect y="142" width="320" height="38" fill="#c68a4e" />
      <path d="M0 142 h320" stroke="#3f3a55" strokeWidth="2.5" />
      {/* guirlande */}
      <path d="M0 22 q80 26 160 10 q80 -16 160 10" stroke="#3f3a55" strokeWidth="2" fill="none" />
      {[[40, 34, '#7d6bc4'], [96, 30, '#5fae83'], [160, 26, '#e6a94c'], [224, 30, '#d9534f'], [280, 36, '#7fb0e0']].map(([x, y, c], i) => (
        <path key={i} d={`M${x} ${y} l9 14 -9 12 -9 -12z`} fill={c as string} stroke="#3f3a55" strokeWidth="1.5" />
      ))}
      {/* gâteau */}
      <g>
        <ellipse cx="160" cy="138" rx="52" ry="9" fill="#a6702f" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M108 138 v-26 q52 -12 104 0 v26" fill="#6b4423" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M108 118 q52 -14 104 0" stroke="#f6d1c2" strokeWidth="5" fill="none" />
        {[132, 160, 188].map((x) => (
          <g key={x}>
            <rect x={x - 3} y="88" width="6" height="20" fill="#fffaf2" stroke="#3f3a55" strokeWidth="1.5" />
            <path d={`M${x} 88 q6 -8 0 -14 q-6 6 0 14z`} fill="#e6a94c" className="flame" />
          </g>
        ))}
      </g>
      {/* Léa rayonnante, toi qui bavesse */}
      <Kid x={58} y={96} arms="up" />
      <text x="24" y="74" fontFamily="'Patrick Hand', cursive" fontSize="16" fill="#d9534f">huit ans !</text>
      <g>
        <circle cx="266" cy="100" r="13" fill="#f2ddc8" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M266 113 v24 M266 120 l-16 8 M266 120 l16 8" {...ink} />
        <path d="M259 104 q7 9 14 0" fill="#d9534f" stroke="#3f3a55" strokeWidth="2" />
        <g fill="#3f3a55"><circle cx="261" cy="96" r="1.8" /><circle cx="271" cy="96" r="1.8" /></g>
        <path d="M274 110 q3 8 -1 12" stroke="#7fb0e0" strokeWidth="2.5" fill="none" className="drop" />
      </g>
    </>
  ),
};

export function SceneArt({ id }: { id: string }) {
  const draw = ARTS[id];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 320 180" className="panel-art scene-art" aria-hidden="true">
      {draw()}
    </svg>
  );
}
