import { useRunStore } from '../state/runStore';
import { dictionary } from '../data/dictionary';
import { DUPLICATES, PRAISES_BIG, PRAISES_HUGE, PRAISES_SMALL, SCOLDS, SUSPICIONS, TOO_SHORT, scold } from '../theme/lexicon';

export function FoundWords() {
  const found = useRunStore((s) => s.manche?.found ?? []);
  const feedback = useRunStore((s) => s.feedback);
  // Un mot que personne ne connaît la rend suspicieuse ; un beau mot l'impressionne ;
  // le reste du temps, un encouragement de loin en loin, sinon ça ne vaut plus rien.
  const rare = !!feedback?.word && !dictionary.common.has(feedback.word);
  const score = feedback?.score ?? 0;
  const praise = feedback?.kind !== 'ok' ? null
    : score >= 50 ? scold(PRAISES_HUGE, feedback.id)
    : rare ? scold(SUSPICIONS, feedback.id)
    : score >= 20 ? scold(PRAISES_BIG, feedback.id)
    : feedback.id % 4 === 0 ? scold(PRAISES_SMALL, feedback.id)
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
        {praise && <span className={`praise ${score >= 50 ? 'huge' : rare ? 'suspicious' : ''}`}>{praise}</span>}
      </div>
      <ul>
        {[...found].reverse().map((f) => (
          <li key={f.word}><span>{f.word}</span><span className="pts">{f.score}</span></li>
        ))}
      </ul>
    </div>
  );
}
