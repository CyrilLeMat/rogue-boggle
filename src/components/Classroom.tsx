import { GAME_SUBTITLE, GAME_TITLE } from '../theme/lexicon';

// Bandeau d'accueil : la salle de classe, dans le style des cases du prologue.
export function Classroom() {
  return (
    <svg viewBox="0 0 480 270" className="classroom" role="img" aria-label={`${GAME_TITLE}, ${GAME_SUBTITLE}`}>
      <rect width="480" height="270" fill="#f3ece0" />
      <rect y="196" width="480" height="74" fill="#e2d6c2" />
      <path d="M0 196 h480" stroke="#c9b9a0" strokeWidth="2" />

      {/* carte de France enroulée */}
      <g>
        <rect x="18" y="26" width="58" height="8" rx="3" fill="#8a5a2b" />
        <rect x="24" y="34" width="46" height="58" fill="#e7eddd" stroke="#b9ae9c" strokeWidth="2" />
        <path d="M34 46 q10 -8 18 0 q10 6 6 18 q-4 14 -14 14 q-14 -2 -14 -16 q0 -10 4 -16z" fill="#cfe0c8" stroke="#7d9b74" strokeWidth="1.5" />
        <circle cx="45" cy="60" r="2" fill="#d9534f" />
      </g>

      {/* horloge */}
      <g>
        <circle cx="432" cy="52" r="22" fill="#fffaf2" stroke="#3f3a55" strokeWidth="3" />
        <circle cx="432" cy="52" r="2" fill="#3f3a55" />
        <path d="M432 52 V38" stroke="#3f3a55" strokeWidth="2.5" strokeLinecap="round" className="hand-h" />
        <path d="M432 52 l12 6" stroke="#d9534f" strokeWidth="2" strokeLinecap="round" className="hand-m" />
      </g>

      {/* tableau noir */}
      <rect x="96" y="22" width="288" height="146" rx="5" fill="#8a5a2b" />
      <rect x="104" y="30" width="272" height="122" rx="3" fill="#2f5d4b" />
      <text x="240" y="84" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="42" fill="#f6f1e4" className="chalk-title">{GAME_TITLE}</text>
      <text x="240" y="112" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="19" fill="#f2a9a2" className="chalk-sub">{GAME_SUBTITLE}</text>
      <path d="M128 130 q50 -8 100 2 q60 6 116 -4" stroke="#f6f1e4" strokeWidth="2" opacity="0.5" fill="none" strokeLinecap="round" />
      {/* rebord et craies */}
      <rect x="104" y="152" width="272" height="8" rx="2" fill="#6f4822" />
      <rect x="130" y="153" width="24" height="5" rx="2" fill="#f6f1e4" />
      <rect x="160" y="153" width="16" height="5" rx="2" fill="#f2a9a2" />
      <rect x="330" y="152" width="34" height="7" rx="2" fill="#5b4a3a" />

      {/* pupitre au premier plan */}
      <g>
        <path d="M150 268 v-52 h180 v52z" fill="#c68a4e" stroke="#3f3a55" strokeWidth="3" />
        <path d="M150 216 h180" stroke="#3f3a55" strokeWidth="3" />
        {/* cahier ouvert */}
        <g transform="rotate(-3 240 238)">
          <rect x="182" y="222" width="116" height="40" rx="2" fill="#fffaf2" stroke="#3f3a55" strokeWidth="2" />
          <path d="M240 222 v40" stroke="#c9b9a0" strokeWidth="1.5" />
          <g stroke="#b9c6de" strokeWidth="1.2">
            <path d="M188 232 h46 M188 240 h46 M188 248 h46 M246 232 h46 M246 240 h46 M246 248 h46" />
          </g>
          <path d="M190 232 q8 -4 14 2 q6 6 14 -2" stroke="#7d6bc4" strokeWidth="2" fill="none" />
          <path d="M248 240 q10 -5 18 2" stroke="#7d6bc4" strokeWidth="2" fill="none" />
        </g>
        {/* encrier et plume */}
        <rect x="306" y="240" width="20" height="16" rx="3" fill="#5d4aa8" stroke="#3f3a55" strokeWidth="2" />
        <path d="M316 240 l14 -30" stroke="#3f3a55" strokeWidth="2.5" strokeLinecap="round" className="quill" />
        <path d="M330 210 q10 6 2 14 q-6 -2 -2 -14z" fill="#f6f1e4" stroke="#3f3a55" strokeWidth="1.5" className="quill" />
      </g>

      {/* bons points épinglés au mur */}
      <g className="stars-wall">
        <path d="M404 120 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" fill="#e6a94c" />
        <path d="M60 128 l3 7 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" fill="#e6a94c" opacity="0.8" />
      </g>
    </svg>
  );
}
