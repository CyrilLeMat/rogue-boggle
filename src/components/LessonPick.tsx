import { mutator } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { LESSON_SCENES } from '../theme/lexicon';

// La scène : la maîtresse hésite, et c'est le joueur qui tranche.
function Blackboard() {
  return (
    <svg viewBox="0 0 320 160" className="panel-art lesson-art" aria-hidden="true">
      <rect width="320" height="160" fill="#f3ece0" />
      <rect x="18" y="12" width="284" height="116" rx="4" fill="#8a5a2b" />
      <rect x="26" y="20" width="268" height="100" rx="3" fill="#2f5d4b" />
      {/* deux colonnes griffonnées : les deux idées */}
      <g stroke="#f6f1e4" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <path d="M52 44 h76 M52 58 h60 M52 72 h70 M52 86 h44" />
        <path d="M192 44 h76 M192 58 h52 M192 72 h68 M192 86 h58" />
      </g>
      <path d="M160 28 v84" stroke="#f2a9a2" strokeWidth="2" strokeDasharray="6 6" />
      <rect x="26" y="120" width="268" height="7" rx="2" fill="#6f4822" />
      {/* la maîtresse, de dos, craie en main, hésitante */}
      <g stroke="#3f3a55" strokeWidth="3" strokeLinecap="round" fill="none">
        <circle cx="286" cy="112" r="11" fill="#3f3a55" />
        <path d="M286 123 v26 M286 132 l-16 -14 M286 132 l12 10" />
      </g>
      <rect x="264" y="112" width="11" height="5" rx="2" fill="#f6f1e4" transform="rotate(-30 269 114)" />
      <text x="248" y="96" fontFamily="'Patrick Hand', cursive" fontSize="18" fill="#f2a9a2">?</text>
    </svg>
  );
}

export function LessonPick() {
  const choices = useRunStore((s) => s.lessonChoices);
  const manche = useRunStore((s) => s.run?.currentManche ?? 2);
  const pick = useRunStore((s) => s.pickLesson);
  const scene = LESSON_SCENES[(manche / 2) % LESSON_SCENES.length | 0];
  return (
    <div className="panel pick lesson-pick">
      <div className="frame lesson-frame"><Blackboard /></div>
      <h2>{scene.title}</h2>
      <div className="intro-text">
        {scene.lines.map((l) => <p key={l}>{l}</p>)}
      </div>
      <div className="cards">
        {choices.map(mutator).map((m) => (
          <button key={m.id} className="lesson-card" onClick={() => pick(m.id)}>
            <span className="lesson-name">{m.name}</span>
            {m.scene && <span className="lesson-scene">{m.scene}</span>}
            <span className="lesson-effect">{m.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
