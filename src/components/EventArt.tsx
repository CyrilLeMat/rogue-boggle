import type { ReactElement } from 'react';
import type { EventId } from '../engine/events';

const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// Un décor par événement de couloir, même trait que les cases du prologue.
const ARTS: Record<EventId, () => ReactElement> = {
  sage: () => (
    <>
      <rect width="200" height="150" fill="#efe7da" />
      <g stroke="#b9ae9c" strokeWidth="5"><path d="M16 58 v66 M32 58 v66 M48 58 v66" /></g>
      <rect x="8" y="50" width="48" height="8" rx="3" fill="#b9ae9c" />
      <path d="M74 34 q34 -10 76 2" stroke="#fff" strokeWidth="7" opacity="0.5" fill="none" strokeLinecap="round" />
      <g stroke="#3f3a55" strokeWidth="2">
        <rect x="104" y="116" width="76" height="11" rx="2" fill="#7d6bc4" />
        <rect x="110" y="107" width="64" height="9" rx="2" fill="#d9534f" />
        <rect x="106" y="98" width="70" height="9" rx="2" fill="#e6a94c" />
      </g>
      <g {...ink}><path d="M142 94 v-20 M142 80 l-20 8 M142 80 l18 4" /></g>
      <circle cx="142" cy="58" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M127 50 q15 -13 30 0" stroke="#5fae83" strokeWidth="3" fill="none" />
      <path d="M129 48 l-4 -5 M135 44 l-2 -6 M142 42 l0 -6 M149 44 l2 -6 M155 48 l4 -5" stroke="#5fae83" strokeWidth="2.5" />
      <path d="M131 62 q11 24 22 0 q2 13 -11 17 q-13 -4 -11 -17z" fill="#f6f1e4" stroke="#cfc7b8" strokeWidth="1.5" />
      <g stroke="#3f3a55" strokeWidth="1.8" fill="none"><circle cx="136" cy="58" r="5" /><circle cx="148" cy="58" r="5" /><path d="M141 58 h2" /></g>
      <circle cx="136" cy="58" r="1.8" fill="#3f3a55" /><circle cx="148" cy="58" r="1.8" fill="#3f3a55" />
      <text x="72" y="96" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#9a93a8" className="sage-murmur">« hmmm… »</text>
    </>
  ),
  // Kévin te coince dans le couloir, feuille contre le mur
  kevin: () => (
    <>
      <rect width="200" height="150" fill="#e7ecef" />
      <rect y="118" width="200" height="32" fill="#c8c3b4" />
      <g stroke="#d4dade" strokeWidth="2"><path d="M0 40 h200 M0 74 h200" /></g>
      {/* les porte-manteaux du couloir */}
      <path d="M0 30 h200" stroke="#3f3a55" strokeWidth="3" />
      {[24, 58].map((x) => (
        <g key={x}><path d={`M${x} 30 v7`} stroke="#3f3a55" strokeWidth="3" /><path d={`M${x} 37 q-9 16 -5 28 q5 11 10 0 q4 -12 -5 -28`} fill="#b8c9d8" stroke="#3f3a55" strokeWidth="2" /></g>
      ))}
      {/* la feuille plaquée au mur */}
      <g transform="rotate(-4 118 74)">
        <rect x="92" y="52" width="52" height="42" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
        <g stroke="#b9b1c9" strokeWidth="1.5"><path d="M98 62 h40 M98 70 h40 M98 78 h30" /></g>
      </g>
      {/* Kévin, bras tendu contre le mur */}
      <g>
        <circle cx="160" cy="62" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M152 58 h6 M164 58 h6" {...ink} strokeWidth="2" />
        <path d="M152 72 q8 6 16 0" {...ink} strokeWidth="2" />
        <path d="M160 77 v26 M160 84 l-22 -8 M160 84 l12 14 M160 103 l-8 18 M160 103 l8 18" {...ink} />
      </g>
      {/* toi, plus petit, adossé */}
      <g>
        <circle cx="52" cy="76" r="12" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <circle cx="47" cy="74" r="2.6" fill="#fff" stroke="#3f3a55" strokeWidth="1.3" />
        <circle cx="57" cy="74" r="2.6" fill="#fff" stroke="#3f3a55" strokeWidth="1.3" />
        <circle cx="47" cy="74" r="1.2" fill="#3f3a55" /><circle cx="57" cy="74" r="1.2" fill="#3f3a55" />
        <path d="M47 85 q5 -3 10 0" {...ink} strokeWidth="1.8" />
        <path d="M52 88 v20 M52 94 l-10 10 M52 94 l10 10 M52 108 l-7 13 M52 108 l7 13" {...ink} />
      </g>
      <g className="sweat" stroke="#8fb6d9" strokeWidth="2" strokeLinecap="round"><path d="M40 66 v7" /></g>
    </>
  ),
  inspecteur: () => (
    <>
      <rect width="200" height="150" fill="#e9e3f4" />
      <rect x="0" y="118" width="200" height="32" fill="#c9bfa8" />
      {/* silhouette en costume, carnet ouvert */}
      <path d="M62 150 q0 -48 38 -48 q38 0 38 48z" fill="#3f3a55" />
      <path d="M100 104 v34" stroke="#f6f1e4" strokeWidth="3" />
      <circle cx="100" cy="76" r="22" fill="#f2ddc8" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M78 66 q22 -20 44 0" {...ink} strokeWidth="3" />
      <g stroke="#3f3a55" strokeWidth="2" fill="none"><circle cx="90" cy="76" r="7" /><circle cx="110" cy="76" r="7" /><path d="M97 76 h6 M83 74 l-6 -3 M117 74 l6 -3" /></g>
      <circle cx="90" cy="76" r="2" fill="#3f3a55" /><circle cx="110" cy="76" r="2" fill="#3f3a55" />
      <path d="M92 92 h16" {...ink} strokeWidth="3" />
      <path d="M86 88 q14 -4 28 0" stroke="#9a93a8" strokeWidth="3" fill="none" />
      <g transform="rotate(-8 156 112)">
        <rect x="140" y="98" width="32" height="30" rx="2" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2" />
        <path d="M145 106 h22 M145 112 h22 M145 118 h14" stroke="#b9c6de" strokeWidth="1.5" />
        <path d="M168 94 l6 -12" {...ink} strokeWidth="2" />
      </g>
    </>
  ),
  reserve: () => (
    <>
      <rect width="200" height="150" fill="#efe7da" />
      {/* porte entrouverte sur les étagères */}
      <rect x="20" y="18" width="160" height="132" rx="4" fill="#8a5a2b" />
      <rect x="30" y="26" width="140" height="124" fill="#2f2a3a" />
      <g stroke="#6d667c" strokeWidth="3"><path d="M30 60 h140 M30 96 h140" /></g>
      <g stroke="#3f3a55" strokeWidth="1.5">
        <rect x="40" y="36" width="10" height="24" fill="#7d6bc4" /><rect x="52" y="40" width="9" height="20" fill="#d9534f" />
        <rect x="64" y="34" width="11" height="26" fill="#e6a94c" /><rect x="120" y="38" width="10" height="22" fill="#5fae83" />
        <rect x="44" y="74" width="26" height="22" rx="3" fill="#e6a94c" /><rect x="110" y="70" width="14" height="26" fill="#7d6bc4" />
        <rect x="132" y="76" width="20" height="20" rx="3" fill="#d9534f" />
        <rect x="48" y="110" width="30" height="16" rx="2" fill="#7fb0e0" /><rect x="120" y="106" width="24" height="20" rx="2" fill="#f6f1e4" />
      </g>
      {/* battant ouvert */}
      <path d="M96 12 l88 16 v112 l-88 16z" fill="#a6702f" stroke="#3f3a55" strokeWidth="3" />
      <circle cx="108" cy="80" r="4" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2" />
      <path d="M150 60 l6 -14 6 14" fill="none" stroke="#fffaf2" strokeWidth="2" opacity="0.6" />
    </>
  ),
  billes: () => (
    <>
      <rect width="200" height="150" fill="#d8d2c8" />
      <path d="M0 96 h200" stroke="#b9ae9c" strokeWidth="2" />
      <ellipse cx="100" cy="112" rx="62" ry="26" fill="#c9c1b4" stroke="#3f3a55" strokeWidth="2" strokeDasharray="5 6" />
      <g stroke="#3f3a55" strokeWidth="2">
        <circle cx="78" cy="110" r="9" fill="#7d6bc4" /><circle cx="100" cy="118" r="8" fill="#5fae83" />
        <circle cx="120" cy="108" r="9" fill="#d9534f" /><circle cx="92" cy="102" r="7" fill="#7fb0e0" />
        <circle cx="134" cy="120" r="7" fill="#e6a94c" />
      </g>
      {/* deux joueurs accroupis */}
      <g {...ink}>
        <circle cx="34" cy="52" r="13" fill="#ffe1cf" /><path d="M34 65 v18 l-10 12 M34 83 l12 10 M34 72 l16 12" />
        <circle cx="168" cy="48" r="13" fill="#f6d1c2" /><path d="M168 61 v18 l10 12 M168 79 l-12 10 M168 68 l-16 12" />
      </g>
      <g fill="#3f3a55"><circle cx="30" cy="50" r="1.8" /><circle cx="38" cy="50" r="1.8" /><circle cx="164" cy="46" r="1.8" /><circle cx="172" cy="46" r="1.8" /></g>
      <path d="M28 58 q6 5 12 0" {...ink} strokeWidth="2" />
    </>
  ),
  recitation: () => (
    <>
      <rect width="200" height="150" fill="#f3ece0" />
      <rect x="0" y="112" width="200" height="38" fill="#c68a4e" />
      <path d="M0 112 h200" stroke="#3f3a55" strokeWidth="2.5" />
      {/* toi, sur l'estrade */}
      <g {...ink}>
        <circle cx="100" cy="52" r="16" fill="#ffe1cf" />
        <path d="M100 68 v28 M100 76 l-16 -6 M100 76 l16 -6 M100 96 l-9 16 M100 96 l9 16" />
      </g>
      <g fill="#3f3a55"><circle cx="94" cy="50" r="2" /><circle cx="106" cy="50" r="2" /></g>
      <ellipse cx="100" cy="60" rx="5" ry="4" fill="#3f3a55" />
      <path d="M82 36 q18 -14 36 0" {...ink} strokeWidth="3" />
      {/* la classe qui regarde, de dos */}
      <g fill="#b9ae9c" stroke="#3f3a55" strokeWidth="2">
        <circle cx="24" cy="126" r="11" /><circle cx="56" cy="132" r="11" /><circle cx="146" cy="132" r="11" /><circle cx="178" cy="126" r="11" />
      </g>
      <text x="152" y="44" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="17" fill="#9a93a8" className="sage-murmur">« … »</text>
    </>
  ),
};

export function EventArt({ id }: { id: EventId }) {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      {ARTS[id]()}
    </svg>
  );
}
