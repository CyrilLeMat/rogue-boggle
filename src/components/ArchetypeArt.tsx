import type { ReactElement } from 'react';

// Portraits des personnalités d'élève. Même trait que les cases du prologue :
// aplats pastel, contour encre, un attribut qui dit tout.

const SKIN = ['#ffe1cf', '#f6d1c2', '#e8c2a8', '#f2ddc8'];
const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

function Head({ x = 60, y = 52, r = 22, skin = 0 }: { x?: number; y?: number; r?: number; skin?: number }) {
  return <circle cx={x} cy={y} r={r} fill={SKIN[skin]} stroke="#3f3a55" strokeWidth="2.5" />;
}
function Eyes({ x = 60, y = 50, d = 8, closed = false }: { x?: number; y?: number; d?: number; closed?: boolean }) {
  return closed
    ? <g {...ink}><path d={`M${x - d - 3} ${y} q3 -4 6 0`} /><path d={`M${x + d - 3} ${y} q3 -4 6 0`} /></g>
    : <g fill="#3f3a55"><circle cx={x - d} cy={y} r="2.4" /><circle cx={x + d} cy={y} r="2.4" /></g>;
}
function Body({ color, x = 60, y = 78 }: { color: string; x?: number; y?: number }) {
  return <path d={`M${x - 22} 120 q0 -32 22 -32 q22 0 22 32z`} fill={color} stroke="#3f3a55" strokeWidth="2.5" transform={`translate(0 ${y - 78})`} />;
}

const ARTS: Record<string, () => ReactElement> = {
  chouchou: () => (
    <>
      <Body color="#cfe0f5" />
      <Head />
      <ellipse cx="60" cy="24" rx="16" ry="5" fill="none" stroke="#e6a94c" strokeWidth="3" />
      <Eyes />
      <path d="M50 60 q10 9 20 0" {...ink} />
      <path d="M38 40 q10 -10 22 -8 q12 -2 22 8" {...ink} strokeWidth="3" />
      <circle cx="92" cy="98" r="9" fill="#d9534f" stroke="#3f3a55" strokeWidth="2" />
      <path d="M92 89 q2 -6 7 -7" {...ink} strokeWidth="2" />
    </>
  ),
  'fond-de-classe': () => (
    <>
      <Body color="#9a93a8" />
      <Head skin={1} />
      <path d="M36 50 q4 -30 24 -30 q20 0 24 30 q-8 -14 -24 -14 q-16 0 -24 14z" fill="#6d667c" stroke="#3f3a55" strokeWidth="2.5" />
      <g fill="#3f3a55"><circle cx="56" cy="52" r="2.4" /><circle cx="70" cy="52" r="2.4" /></g>
      <path d="M52 64 q10 3 18 -2" {...ink} />
      <path d="M12 96 l26 -8 -10 12 12 2z" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2" />
    </>
  ),
  footballeur: () => (
    <>
      <Body color="#f6f1e4" />
      <path d="M46 92 v28 M60 88 v32 M74 92 v28" stroke="#d9534f" strokeWidth="4" />
      <Head skin={2} />
      <path d="M38 38 q8 -12 14 -4 q6 -10 12 -2 q8 -10 16 2" {...ink} strokeWidth="3" />
      <Eyes />
      <path d="M52 62 q8 6 16 0" {...ink} />
      <path d="M86 44 q4 8 0 12" stroke="#7fb0e0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="96" cy="100" r="14" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M96 90 l6 5 -2 8 h-8 l-2 -8z" fill="#3f3a55" />
    </>
  ),
  redoublant: () => (
    <>
      <Body color="#7d6bc4" y={72} />
      <Head y={46} r={24} skin={3} />
      <path d="M34 40 q26 -18 52 0" {...ink} strokeWidth="3" />
      <Eyes y={44} closed />
      <path d="M48 58 h24" {...ink} />
      <g fill="#9a93a8"><circle cx="50" cy="64" r="1" /><circle cx="56" cy="66" r="1" /><circle cx="64" cy="66" r="1" /><circle cx="70" cy="64" r="1" /></g>
      <path d="M34 108 q26 -10 52 0" {...ink} strokeWidth="3" />
    </>
  ),
  'petit-dernier': () => (
    <>
      <Body color="#f7c5bd" y={92} />
      <Head y={62} r={19} />
      <path d="M44 48 l4 -12 M54 44 l2 -14 M66 44 l2 -13 M76 48 l5 -11" {...ink} strokeWidth="3" />
      <Eyes y={60} d={7} />
      <path d="M52 70 q8 7 16 0" {...ink} />
      <path d="M26 118 q14 -6 28 0 M66 118 q14 -6 28 0" stroke="#9a93a8" strokeWidth="2" fill="none" />
    </>
  ),
  'rat-de-billes': () => (
    <>
      <Body color="#e6a94c" />
      <Head skin={1} />
      <path d="M40 42 q20 -12 40 0" {...ink} strokeWidth="3" />
      <Eyes />
      <path d="M50 60 q10 8 20 -2" {...ink} />
      <g stroke="#3f3a55" strokeWidth="2">
        <circle cx="34" cy="106" r="6" fill="#7d6bc4" /><circle cx="46" cy="112" r="5" fill="#5fae83" />
        <circle cx="86" cy="106" r="6" fill="#d9534f" /><circle cx="76" cy="113" r="5" fill="#7fb0e0" />
      </g>
    </>
  ),
  // concentration totale, casque sur les oreilles, le bruit reste dehors
  specialiste: () => (
    <>
      <Body color="#dcebe4" />
      <Head />
      <path d="M36 40 q24 -16 48 0" {...ink} strokeWidth="3" />
      <g fill="#3f3a55"><circle cx="52" cy="48" r="2.4" /><circle cx="68" cy="48" r="2.4" /></g>
      <path d="M53 62 h14" {...ink} strokeWidth="2.5" />
      {/* le casque anti-bruit */}
      <path d="M34 44 q26 -26 52 0" stroke="#5fae83" strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="26" y="42" width="14" height="20" rx="6" fill="#5fae83" stroke="#3f3a55" strokeWidth="2.5" />
      <rect x="80" y="42" width="14" height="20" rx="6" fill="#5fae83" stroke="#3f3a55" strokeWidth="2.5" />
      {/* le livre, ouvert à la même page depuis des heures */}
      <path d="M40 92 h18 v16 h-18z M62 92 h18 v16 h-18z" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
      <g stroke="#b9b1c9" strokeWidth="1.5"><path d="M44 98 h10 M44 103 h10 M66 98 h10 M66 103 h10" /></g>
    </>
  ),
  reveur: () => (
    <>
      <Body color="#ece6f7" />
      <Head />
      <path d="M38 42 q12 -14 24 -6 q12 -6 20 8" {...ink} strokeWidth="3" />
      <g fill="#3f3a55"><circle cx="52" cy="46" r="2.2" /><circle cx="68" cy="46" r="2.2" /></g>
      <path d="M52 62 q8 4 16 -2" {...ink} />
      <g fill="#fffaf2" stroke="#3f3a55" strokeWidth="2">
        <ellipse cx="96" cy="26" rx="14" ry="8" /><ellipse cx="22" cy="40" rx="11" ry="6" />
      </g>
      <path d="M84 52 q6 -5 12 0 q-6 3 -12 0z" fill="#7d6bc4" />
    </>
  ),
  nouveau: () => (
    <>
      <Body color="#cfe0c8" />
      <Head />
      <path d="M38 40 q22 -14 44 0" {...ink} strokeWidth="3" />
      <Eyes />
      <path d="M52 62 q8 5 16 0" {...ink} />
      {/* étiquette « bonjour, je m'appelle » toute neuve */}
      <g transform="rotate(-4 60 104)">
        <rect x="42" y="94" width="36" height="20" rx="3" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2" />
        <path d="M42 101 h36" stroke="#d9534f" strokeWidth="2" />
        <path d="M48 108 q6 -4 10 0 q5 3 10 -2" stroke="#7d6bc4" strokeWidth="2" fill="none" />
      </g>
      {/* cartable neuf, encore raide */}
      <rect x="92" y="92" width="20" height="24" rx="4" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M96 92 v-6 q6 -5 12 0 v6" {...ink} strokeWidth="2" />
    </>
  ),
};

const BG: Record<string, string> = {
  nouveau: '#eef5ec', chouchou: '#eef4fb', 'fond-de-classe': '#eceaf0', footballeur: '#e9f1ea',
  redoublant: '#f1edf9', 'petit-dernier': '#fdeae6', 'rat-de-billes': '#fff5e2', reveur: '#f3effb', specialiste: '#e7f2ec',
};

export function ArchetypeArt({ id }: { id: string }) {
  const draw = ARTS[id];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 120 120" className="panel-art archetype-art" aria-hidden="true">
      <rect width="120" height="120" fill={BG[id] ?? '#f3ece0'} />
      {draw()}
    </svg>
  );
}
