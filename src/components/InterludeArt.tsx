import type { ReactElement } from 'react';
import { Kid, Rain, Tension, ink } from './art/primitives';

// Hors de la classe, l'élève vit tout cela au premier degré. Le dessin, lui, ne rit jamais.
const ARTS: Record<string, () => ReactElement> = {
  // Les toilettes : le poing serré, le monde sur les épaules
  toilettes: () => (
    <>
      <rect width="320" height="180" fill="#e8eef2" />
      <g stroke="#cfd8de" strokeWidth="1.5">
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M0 ${20 + i * 26} h320`} />)}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M${i * 40} 0 v152`} />)}
      </g>
      <rect y="152" width="320" height="28" fill="#c9cfd4" />
      {/* porte de cabine, fermée, verrou mis */}
      <rect x="182" y="22" width="112" height="130" rx="4" fill="#cfe0d8" stroke="#3f3a55" strokeWidth="3" />
      <circle cx="196" cy="94" r="4" fill="#3f3a55" />
      <path d="M186 86 h16" stroke="#3f3a55" strokeWidth="3" strokeLinecap="round" />
      {/* toi, debout, tête baissée, le poing serré le long du corps */}
      <g>
        <circle cx="88" cy="76" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M80 72 l7 4 M96 72 l-7 4" {...ink} strokeWidth="2" />
        <path d="M82 86 h12" {...ink} strokeWidth="2" />
        <path d="M88 90 v32" {...ink} />
        <path d="M88 98 l-5 25 M88 98 l11 20" {...ink} />
        <path d="M88 122 l-4 26 M88 122 l4 26" {...ink} />
        <circle cx="100" cy="122" r="7" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      </g>
      <Tension x={100} y={122} r={16} />
      <text x="26" y="36" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#d9534f" transform="rotate(-6 26 36)">Père…</text>
    </>
  ),

  // Les lavabos : le reflet, l'eau froide, la promesse
  miroir: () => (
    <>
      <rect width="320" height="180" fill="#eaf0f3" />
      <rect y="152" width="320" height="28" fill="#c9cfd4" />
      {/* le miroir, et dedans un visage plus dur que le tien */}
      <rect x="54" y="14" width="212" height="76" rx="4" fill="#dce9f2" stroke="#3f3a55" strokeWidth="3" />
      <path d="M62 22 l36 56 M78 18 l26 40" stroke="#fff" strokeWidth="4" opacity="0.6" strokeLinecap="round" />
      <g>
        <circle cx="160" cy="52" r="16" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M149 44 l9 5 M171 44 l-9 5" {...ink} strokeWidth="2" />
        <path d="M152 63 h16" {...ink} strokeWidth="2" />
      </g>
      {/* toi, de dos : nuque, épaules, mains sur la faïence */}
      <g>
        <circle cx="160" cy="104" r="16" fill="#4a4363" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M142 118 q18 -7 36 0" {...ink} />
        <path d="M144 120 l-38 16 M176 120 l38 16" {...ink} />
      </g>
      {/* le lavabo, au premier plan */}
      <path d="M106 138 h108 l-12 24 h-84z" fill="#f2f6f8" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
      <rect x="100" y="132" width="120" height="8" rx="4" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M160 132 v-8 q0 -6 -8 -6" stroke="#9aa0b5" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <g className="sweat" stroke="#8fb6d9" strokeWidth="2.5" strokeLinecap="round"><path d="M160 140 v10" /></g>
    </>
  ),

  // Sous le préau : la pluie, le ciel, le vide intérieur
  preau: () => (
    <>
      <rect width="320" height="180" fill="#dfe6ec" />
      <Rain n={26} />
      <rect y="150" width="320" height="30" fill="#b9b3a6" />
      <path d="M0 40 h130" stroke="#3f3a55" strokeWidth="5" strokeLinecap="round" />
      <path d="M34 42 v110 M114 42 v110" stroke="#3f3a55" strokeWidth="4" />
      <g>
        <circle cx="212" cy="86" r="14" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M205 82 q4 4 8 0 M219 82 q-4 4 -8 0" {...ink} strokeWidth="2" />
        <path d="M206 94 h12" {...ink} strokeWidth="2" />
        <path d="M212 100 v32 M212 106 h-14 M212 106 h14 M212 132 l-10 20 M212 132 l10 20" {...ink} />
      </g>
      <ellipse cx="212" cy="168" rx="40" ry="6" fill="#8fb6d9" opacity="0.5" />
      <path d="M258 60 q10 -14 22 -2" stroke="#8fb6d9" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),

  // Le couloir : les porte-manteaux, le carrelage, l'effondrement
  couloir: () => (
    <>
      <rect width="320" height="180" fill="#f0e9df" />
      <rect y="126" width="320" height="54" fill="#d6ccbb" />
      <g stroke="#c2b6a1" strokeWidth="1.5">
        <path d="M0 126 l60 54 M80 126 l40 54 M170 126 l-30 54 M250 126 l-70 54" />
      </g>
      <path d="M0 62 h320" stroke="#3f3a55" strokeWidth="3" />
      {[30, 80, 130, 230, 280].map((x) => (
        <g key={x}>
          <path d={`M${x} 62 v8`} stroke="#3f3a55" strokeWidth="3" />
          <path d={`M${x} 70 q-14 22 -8 40 q8 16 16 0 q6 -18 -8 -40`} fill="#b8c9d8" stroke="#3f3a55" strokeWidth="2.5" />
        </g>
      ))}
      {/* toi, assis par terre, de profil, genoux remontés */}
      <g>
        <circle cx="150" cy="92" r="16" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="157" cy="88" r="2" fill="#3f3a55" />
        <path d="M152 102 q7 -3 12 1" {...ink} strokeWidth="2" />
        <path d="M150 108 l12 42" {...ink} />
        <path d="M162 150 l30 -28 l10 30" {...ink} strokeLinejoin="round" />
        <path d="M156 120 q26 -2 34 2" {...ink} />
      </g>
      <path d="M138 152 h76" stroke="#3f3a55" strokeWidth="3.5" strokeLinecap="round" />
    </>
  ),

  // La chambre, vingt-deux heures : cent fois le même mot
  chambre: () => (
    <>
      <rect width="320" height="180" fill="#2c3352" />
      <rect y="150" width="320" height="30" fill="#1f2440" />
      <rect x="18" y="16" width="70" height="56" rx="3" fill="#3d4670" stroke="#8d97c4" strokeWidth="2.5" />
      <path d="M53 16 v56 M18 44 h70" stroke="#8d97c4" strokeWidth="2" />
      <circle cx="36" cy="32" r="8" fill="#f4e4b8" />
      {/* lampe et cône de lumière */}
      <path d="M214 34 l-70 116 h150z" fill="#f6e2ad" opacity="0.25" />
      <path d="M214 40 v-16 h-22" stroke="#e0dbe8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M198 40 h32 l-8 -14 h-16z" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2.5" />
      <rect x="120" y="128" width="190" height="10" rx="3" fill="#8a5a2b" stroke="#3f3a55" strokeWidth="2.5" />
      <g transform="rotate(-4 176 122)">
        <rect x="146" y="108" width="60" height="18" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2" />
        <g stroke="#b9b1c9" strokeWidth="1.5">
          <path d="M150 114 h52 M150 119 h52" />
        </g>
      </g>
      <g>
        <circle cx="100" cy="80" r="16" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="107" cy="76" r="2" fill="#3f3a55" />
        <path d="M104 91 q7 3 13 -1" {...ink} strokeWidth="2" />
        <path d="M100 96 l18 34" {...ink} />
        <path d="M106 106 l44 16" {...ink} />
        <path d="M104 118 l26 12" {...ink} strokeWidth="2" />
      </g>
      <path d="M150 122 l12 -10" stroke="#5d4aa8" strokeWidth="4.5" strokeLinecap="round" />
      <text x="228" y="100" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#f2a9a2" transform="rotate(-5 228 100)">encore…</text>
    </>
  ),

  // Le jardin, trois ans plus tôt : réciter sous l'averse
  pluie: () => (
    <>
      <rect width="320" height="180" fill="#cfd9d2" />
      <rect y="140" width="320" height="40" fill="#8fa87f" />
      <Rain n={28} />
      {/* la maison, et derrière la vitre, ta mère */}
      <rect x="216" y="30" width="96" height="110" fill="#e6dcc8" stroke="#3f3a55" strokeWidth="3" />
      <rect x="236" y="52" width="56" height="52" fill="#b8cfe0" stroke="#3f3a55" strokeWidth="3" />
      <path d="M264 52 v52 M236 78 h56" stroke="#3f3a55" strokeWidth="2" />
      <g opacity="0.85">
        <circle cx="264" cy="72" r="9" fill="#3f3a55" />
        <path d="M264 81 q-12 8 -14 22 h28 q-2 -14 -14 -22" fill="#3f3a55" />
      </g>
      {/* toi, trempé, bras le long du corps */}
      <Kid x={96} y={92} arms="side" />
      <path d="M96 76 q-6 -8 0 -14 q6 6 0 14" fill="#8fb6d9" opacity="0.7" />
      <ellipse cx="96" cy="152" rx="26" ry="5" fill="#6f8b64" opacity="0.6" />
      <text x="24" y="46" fontFamily="'Patrick Hand', cursive" fontSize="16" fill="#3f3a55" transform="rotate(-4 24 46)">…euil, e-u-i-l</text>
    </>
  ),

  // La cuisine de mamie : les carottes, le couteau, la dictée qui ne s'arrête pas
  mamie: () => (
    <>
      <rect width="320" height="180" fill="#f6ead6" />
      <rect y="146" width="320" height="34" fill="#ddc9a8" />
      <g stroke="#e3d3b4" strokeWidth="2">
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${24 + i * 30} h320`} />)}
      </g>
      <rect x="120" y="104" width="190" height="12" rx="3" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2.5" />
      {/* carottes */}
      {[152, 174, 196].map((x, i) => (
        <g key={x} transform={`rotate(${-8 + i * 9} ${x} 100)`}>
          <path d={`M${x} 100 l10 -18 l-6 -2z`} fill="#e08b42" stroke="#3f3a55" strokeWidth="2" />
          <path d={`M${x + 8} 80 l3 -8 M${x + 10} 80 l8 -5`} stroke="#6f8b64" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {/* mamie : chignon, tablier, couteau qui ne ralentit pas */}
      <g>
        <circle cx="252" cy="62" r="15" fill="#f6d1c2" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="252" cy="44" r="8" fill="#d9d2e0" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M245 58 h6 M255 58 h6" {...ink} strokeWidth="2" />
        <path d="M246 70 h12" {...ink} strokeWidth="2" />
        <path d="M252 77 v28" {...ink} />
        <path d="M252 84 l-28 16" {...ink} />
      </g>
      <g className="tension">
        <path d="M212 100 l16 -6" stroke="#9aa0b5" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* toi, droit comme un i */}
      <Kid x={62} y={78} arms="down" />
      <text x="20" y="40" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#3f3a55">g-r-o-s-e-i-l-l-e</text>
    </>
  ),

  // L'été sacrifié : dehors la lumière, dedans les mots en -euil
  ete: () => (
    <>
      <rect width="320" height="180" fill="#f7efdc" />
      <rect y="150" width="320" height="30" fill="#e0d3b4" />
      {/* la fenêtre, et l'été qui continue sans toi */}
      <rect x="176" y="18" width="126" height="98" fill="#bfe0ef" stroke="#3f3a55" strokeWidth="3" />
      <rect x="176" y="86" width="126" height="30" fill="#9ec98a" />
      <path d="M239 18 v98 M176 67 h126" stroke="#3f3a55" strokeWidth="2.5" />
      <circle cx="288" cy="36" r="11" fill="#f7c55c" />
      <g stroke="#3f3a55" strokeWidth="2" fill="none">
        <circle cx="200" cy="86" r="6" fill="#ffe1cf" /><path d="M200 92 v12 M200 96 l-7 6 M200 96 l7 -8 M200 104 l-5 10 M200 104 l5 10" />
        <circle cx="262" cy="84" r="6" fill="#f6d1c2" /><path d="M262 90 v12 M262 94 l7 8 M262 94 l-7 -6 M262 102 l-5 10 M262 102 l5 10" />
      </g>
      <circle cx="232" cy="74" r="4" fill="#f28b7d" stroke="#3f3a55" strokeWidth="1.5" className="splash" />
      {/* toi, dos tourné, à la table de la cuisine */}
      <rect x="10" y="118" width="150" height="10" rx="3" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M28 128 v34 M142 128 v34" stroke="#3f3a55" strokeWidth="3" />
      <g transform="rotate(-3 92 112)">
        <rect x="64" y="100" width="58" height="18" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2" />
        <g stroke="#b9b1c9" strokeWidth="1.5"><path d="M70 107 h46 M70 113 h46" /></g>
      </g>
      <g>
        <circle cx="52" cy="76" r="15" fill="#4a4363" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M52 91 l12 24" {...ink} />
        <path d="M56 100 l30 10" {...ink} />
      </g>
      <text x="16" y="44" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#3f3a55">é-c-u-r-e-u-i-l</text>
    </>
  ),

  // La cour : Kévin te regarde et ne dit rien
  kevin1: () => (
    <>
      <rect width="320" height="180" fill="#dfe7ea" />
      <rect y="140" width="320" height="40" fill="#bdb6a6" />
      <g stroke="#cdd6d9" strokeWidth="2">
        <path d="M0 106 h320" /><path d="M40 106 v34 M280 106 v34" />
      </g>
      <Kid x={72} y={90} arms="down" />
      {/* Kévin, mains dans les poches, immobile */}
      <g>
        <circle cx="248" cy="88" r="13" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M242 86 h5 M251 86 h5" {...ink} strokeWidth="2" />
        <path d="M241 96 h14" {...ink} strokeWidth="2" />
        <path d="M248 101 v24 M248 108 l-12 10 M248 108 l12 10 M248 125 l-9 15 M248 125 l9 15" {...ink} />
      </g>
      <g className="wind">
        <path d="M150 104 q10 -10 22 -2 q-12 8 -22 2z" fill="#f2e7c8" stroke="#3f3a55" strokeWidth="2" />
        <path d="M128 100 h14 M132 110 h12" stroke="#9aa0b5" strokeWidth="2" strokeLinecap="round" />
      </g>
      <text x="196" y="42" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#9aa0b5">« … »</text>
    </>
  ),

  // Deux copies identiques, et la faute au milieu
  kevin2: () => (
    <>
      <rect width="320" height="180" fill="#eef1f7" />
      <rect y="150" width="320" height="30" fill="#c8c1b2" />
      {/* les deux copies brandies côte à côte */}
      {[64, 176].map((x, i) => (
        <g key={x} transform={`rotate(${i ? 3 : -3} ${x + 40} 84)`}>
          <rect x={x} y="34" width="80" height="100" rx="3" fill="#fffdf9" stroke="#3f3a55" strokeWidth="3" />
          <g stroke="#b9b1c9" strokeWidth="1.6">
            <path d={`M${x + 10} 52 h60 M${x + 10} 64 h60 M${x + 10} 88 h60 M${x + 10} 100 h60 M${x + 10} 112 h44`} />
          </g>
          <path d={`M${x + 10} 76 h44`} stroke="#3f3a55" strokeWidth="2" />
          <circle cx={x + 62} cy="76" r="9" fill="none" stroke="#d9534f" strokeWidth="3" />
          <path d={`M${x + 58} 72 l8 8 M${x + 66} 72 l-8 8`} stroke="#d9534f" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <text x="160" y="26" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#d9534f">la même faute</text>
      {/* toi, bouche ouverte, et Kévin qui regarde ses chaussures */}
      <g>
        <circle cx="28" cy="112" r="13" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="23" cy="110" r="3" fill="#fff" stroke="#3f3a55" strokeWidth="1.5" />
        <circle cx="33" cy="110" r="3" fill="#fff" stroke="#3f3a55" strokeWidth="1.5" />
        <circle cx="23" cy="110" r="1.3" fill="#3f3a55" /><circle cx="33" cy="110" r="1.3" fill="#3f3a55" />
        <ellipse cx="28" cy="120" rx="4" ry="5" fill="#3f3a55" />
        <path d="M28 125 v22 M28 132 l-12 10 M28 132 l12 10" {...ink} />
      </g>
      <g>
        <circle cx="292" cy="112" r="13" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M286 112 h5 M295 112 h5" {...ink} strokeWidth="2" />
        <path d="M286 120 q6 3 12 0" {...ink} strokeWidth="2" />
        <path d="M292 125 v22 M292 132 l-11 12 M292 132 l11 12" {...ink} />
      </g>
      <g className="sweat" stroke="#8fb6d9" strokeWidth="2.5" strokeLinecap="round"><path d="M16 104 v8" /></g>
    </>
  ),

  // Le soir, par la fenêtre : il s'entraîne seul
  kevin3: () => (
    <>
      <rect width="320" height="180" fill="#252b46" />
      <rect y="150" width="320" height="30" fill="#1b2038" />
      <rect x="66" y="22" width="188" height="118" rx="4" fill="#f6e2ad" stroke="#3f3a55" strokeWidth="3" />
      <path d="M160 22 v118 M66 82 h188" stroke="#3f3a55" strokeWidth="3" />
      {/* dans la classe : le tableau et Kévin, de dos */}
      <rect x="84" y="36" width="60" height="38" rx="2" fill="#2f5d4b" stroke="#3f3a55" strokeWidth="2.5" />
      <g stroke="#f6f1e4" strokeWidth="2" opacity="0.8">
        <path d="M90 46 h44 M90 54 h38 M90 62 h46" />
      </g>
      <g>
        <circle cx="196" cy="54" r="11" fill="#3f3a55" />
        <path d="M196 65 v22 M196 70 l-14 8 M196 70 l14 6" {...ink} stroke="#3f3a55" />
      </g>
      <g className="sweat" stroke="#8d97c4" strokeWidth="2.5" strokeLinecap="round"><path d="M212 62 v8" /></g>
      <circle cx="286" cy="40" r="12" fill="#f4e4b8" opacity="0.85" />
      <path d="M0 150 h320" stroke="#3f3a55" strokeWidth="3" />
    </>
  ),
};

export function InterludeArt({ id }: { id: string }) {
  const draw = ARTS[id];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 320 180" className="scene-art" role="img" aria-hidden="true">
      {draw()}
    </svg>
  );
}
