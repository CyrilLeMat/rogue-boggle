import { relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { L } from '../theme/lexicon';
import { RelicCard } from './RelicCard';

export function StartPick() {
  const choices = useRunStore((s) => s.startChoices);
  const pick = useRunStore((s) => s.pickStartRelic);
  return (
    <div className="panel pick">
      <h2>{L.relicDepart}</h2>
      <p className="muted">{L.relicDepartSub}</p>
      <div className="cards">
        {relics(choices).map((r) => <RelicCard key={r.id} relic={r} onPick={() => pick(r.id)} />)}
      </div>
    </div>
  );
}
