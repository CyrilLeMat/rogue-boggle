import { useRunStore } from '../state/runStore';
import { DUPLICATES, PRAISES_BIG, PRAISES_SMALL, SCOLDS, TOO_SHORT, scold } from '../theme/lexicon';

export function FoundWords() {
  const found = useRunStore((s) => s.manche?.found ?? []);
  const feedback = useRunStore((s) => s.feedback);
  // un compliment sur les beaux mots, et de loin en loin sur les autres : sinon ça ne vaut plus rien
  const praise = feedback?.kind === 'ok'
    ? (feedback.score ?? 0) >= 20 ? scold(PRAISES_BIG, feedback.id)
      : feedback.id % 4 === 0 ? scold(PRAISES_SMALL, feedback.id) : null
    : null;
  const msg =
    feedback?.kind === 'ok' ? `${feedback.word} +${feedback.score}${feedback.bonus ? ` · ${feedback.bonus}` : ''}` :
    feedback?.kind === 'duplicate' ? scold(DUPLICATES, feedback.id) :
    feedback?.kind === 'invalid' ? scold(SCOLDS, feedback.id) :
    feedback?.kind === 'tooShort' ? scold(TOO_SHORT, feedback.id) : ' ';
  return (
    <div className="found">
      <div key={feedback?.id} className={`feedback ${feedback?.kind ?? ''}`}>
        {msg}
        {praise && <span className="praise">{praise}</span>}
      </div>
      <ul>
        {[...found].reverse().map((f) => (
          <li key={f.word}><span>{f.word}</span><span className="pts">{f.score}</span></li>
        ))}
      </ul>
    </div>
  );
}
