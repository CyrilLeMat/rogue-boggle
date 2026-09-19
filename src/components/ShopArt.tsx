// Le comptoir de la coopérative scolaire : on comprend l'endroit d'un coup d'œil.
export function ShopArt() {
  return (
    <svg viewBox="0 0 200 150" className="panel-art shop-art" aria-hidden="true">
      <rect width="200" height="150" fill="#f3ece0" />
      {/* étagères garnies */}
      <rect x="10" y="14" width="180" height="76" rx="3" fill="#e2d6c2" stroke="#3f3a55" strokeWidth="2.5" />
      <g stroke="#3f3a55" strokeWidth="2"><path d="M10 42 h180 M10 68 h180" /></g>
      <g stroke="#3f3a55" strokeWidth="1.5">
        {/* cahiers */}
        <rect x="18" y="20" width="9" height="21" fill="#7d6bc4" /><rect x="29" y="22" width="8" height="19" fill="#d9534f" />
        <rect x="39" y="19" width="10" height="22" fill="#5fae83" /><rect x="51" y="23" width="8" height="18" fill="#e6a94c" />
        {/* trousses */}
        <rect x="70" y="24" width="30" height="16" rx="6" fill="#f2a9a2" />
        <rect x="110" y="22" width="26" height="18" rx="4" fill="#7fb0e0" />
        <rect x="146" y="20" width="12" height="21" fill="#7d6bc4" /><rect x="160" y="24" width="10" height="17" fill="#5fae83" />
        {/* gommes et gommettes */}
        <rect x="20" y="50" width="16" height="12" rx="2" fill="#f6f1e4" /><rect x="40" y="52" width="14" height="10" rx="2" fill="#f2a9a2" />
        <circle cx="70" cy="56" r="6" fill="#e6a94c" /><circle cx="86" cy="56" r="6" fill="#7d6bc4" /><circle cx="102" cy="56" r="6" fill="#5fae83" />
        <rect x="120" y="48" width="22" height="16" rx="2" fill="#fffaf2" />
        <rect x="150" y="50" width="22" height="14" rx="2" fill="#ece6f7" />
      </g>
      {/* panneau */}
      <g transform="rotate(-3 100 80)">
        <rect x="54" y="70" width="92" height="18" rx="3" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2" />
        <text x="100" y="84" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="14" fill="#d9534f">COOPÉRATIVE</text>
      </g>
      {/* comptoir */}
      <rect x="0" y="104" width="200" height="46" fill="#c68a4e" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M0 116 h200" stroke="#a6702f" strokeWidth="3" />
      {/* l'élève de service, derrière la caisse */}
      <g stroke="#3f3a55" strokeWidth="2.5" fill="none">
        <path d="M150 104 v-14" />
      </g>
      <circle cx="150" cy="78" r="13" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="2.5" />
      <path d="M137 72 q13 -12 26 0" stroke="#3f3a55" strokeWidth="3" fill="none" />
      <g fill="#3f3a55"><circle cx="145" cy="78" r="1.8" /><circle cx="155" cy="78" r="1.8" /></g>
      <path d="M145 85 q5 4 10 0" stroke="#3f3a55" strokeWidth="2" fill="none" />
      {/* caisse en fer et billes sur le comptoir */}
      <rect x="22" y="88" width="42" height="26" rx="3" fill="#b9ae9c" stroke="#3f3a55" strokeWidth="2.5" />
      <rect x="30" y="94" width="26" height="8" rx="2" fill="#fffaf2" />
      <path d="M36 88 v-8 h14 v8" stroke="#3f3a55" strokeWidth="2" fill="none" />
      <g stroke="#3f3a55" strokeWidth="1.5">
        <circle cx="84" cy="110" r="6" fill="#7d6bc4" /><circle cx="98" cy="113" r="5" fill="#5fae83" /><circle cx="110" cy="109" r="6" fill="#d9534f" />
      </g>
    </svg>
  );
}
