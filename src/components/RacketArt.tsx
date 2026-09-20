const ink = { stroke: '#3f3a55', strokeWidth: 2.5, fill: 'none' } as const;

// Le carrelage des toilettes du fond, décor commun aux deux temps du racket.
function Tiles() {
  return (
    <>
      <rect width="200" height="150" fill="#dfe6e4" />
      <g stroke="#cbd6d3" strokeWidth="2">
        <path d="M0 22 h200 M0 52 h200 M0 82 h200 M0 112 h200 M34 0 v118 M78 0 v118 M122 0 v118 M166 0 v118" />
      </g>
      <rect y="118" width="200" height="32" fill="#b9b0a4" />
      <path d="M0 118 h200" stroke="#3f3a55" strokeWidth="2" />
    </>
  );
}

// Premier temps : sa main range ton objet dans SON cartable, sans se presser.
export function Grab() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <Tiles />
      {/* son cartable, ouvert, au premier plan */}
      <g>
        <path d="M46 118 v-34 q0 -8 9 -8 h60 q9 0 9 8 v34z" fill="#c67f5a" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
        <path d="M46 96 h78" stroke="#3f3a55" strokeWidth="2.5" />
        {/* le rabat, relevé */}
        <path d="M55 76 q30 -22 60 0" fill="#b06f4c" stroke="#3f3a55" strokeWidth="3" strokeLinejoin="round" />
        <rect x="76" y="92" width="18" height="12" rx="3" fill="#e6a94c" stroke="#3f3a55" strokeWidth="2.5" />
      </g>
      {/* son bras, qui descend, et ton objet entre deux doigts */}
      <path d="M182 16 q-30 20 -48 34" {...ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M134 50 q-14 6 -12 17 q2 12 16 9 q14 -3 12 -14z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      <g transform="rotate(-16 118 68)">
        <rect x="100" y="58" width="34" height="22" rx="2" fill="#fffdf9" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M106 66 h20 M106 72 h12" stroke="#b9b1c9" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      {/* les traits de chute : l'objet descend vers le mauvais cartable */}
      <g stroke="#9aa6ad" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 5">
        <path d="M108 84 v14 M126 84 v14" />
      </g>
    </svg>
  );
}

// Second temps : tu sors, et il te tient la porte. C'est ça, le pire.
export function Exit() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art sage-art" aria-hidden="true">
      <Tiles />
      {/* la porte, grande ouverte sur le couloir */}
      <rect x="58" y="10" width="76" height="108" rx="2" fill="#eef1f3" stroke="#3f3a55" strokeWidth="3" />
      <rect x="66" y="18" width="60" height="92" fill="#cfd9de" />
      {/* toi, de dos, qui sors sans rien dire */}
      <g>
        <circle cx="96" cy="48" r="13" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M84 44 q12 -14 24 0" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M96 61 v28 M96 68 l-12 12 M96 68 l12 12 M96 89 l-8 20 M96 89 l8 20" {...ink} />
        {/* ton cartable, plus léger qu'à l'entrée */}
        <rect x="102" y="74" width="22" height="16" rx="3" fill="#c67f5a" stroke="#3f3a55" strokeWidth="2.5" />
      </g>
      {/* son bras, qui tient la porte au-dessus de toi */}
      <path d="M8 34 q34 -6 54 4" {...ink} strokeWidth="5" strokeLinecap="round" />
      <path d="M60 32 q12 2 12 10 q0 9 -11 8 q-11 -1 -11 -9z" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
      {/* et son sourire, dans le coin */}
      <g>
        <circle cx="22" cy="74" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
        <path d="M7 70 q5 -15 15 -10 q12 -6 15 8" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M14 72 l6 3 M30 72 l-6 3" {...ink} strokeWidth="2" />
        <path d="M15 82 q8 6 15 0" {...ink} strokeWidth="2.5" />
      </g>
      <text x="150" y="40" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="15" fill="#6c6475" className="sage-murmur">« à demain. »</text>
    </svg>
  );
}
