import { useRunStore } from '../state/runStore';

export function FoundWords() {
  const found = useRunStore((s) => s.manche?.found ?? []);
  const feedback = useRunStore((s) => s.feedback);
  const msg =
    feedback?.kind === 'ok' ? `${feedback.word} +${feedback.score}${feedback.bonus ? ` · ${feedback.bonus}` : ''}` :
    feedback?.kind === 'duplicate' ? `${feedback.word} déjà trouvé` :
    feedback?.kind === 'invalid' ? 'Mot inconnu' :
    feedback?.kind === 'tooShort' ? '3 lettres minimum' : ' ';
  return (
    <div className="found">
      <div key={feedback?.id} className={`feedback ${feedback?.kind ?? ''}`}>{msg}</div>
      <ul>
        {[...found].reverse().map((f) => (
          <li key={f.word}><span>{f.word}</span><span className="pts">{f.score}</span></li>
        ))}
      </ul>
    </div>
  );
}
