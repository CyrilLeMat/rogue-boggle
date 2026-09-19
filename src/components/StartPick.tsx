import { relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { RelicCard } from './RelicCard';

export function StartPick() {
  const choices = useRunStore((s) => s.startChoices);
  const pick = useRunStore((s) => s.pickStartRelic);
  return (
    <div className="panel pick">
      <h2>Relic de départ</h2>
      <p className="muted">Choisis-en un. Il t'accompagne toute la run.</p>
      <div className="cards">
        {relics(choices).map((r) => <RelicCard key={r.id} relic={r} onPick={() => pick(r.id)} />)}
      </div>
    </div>
  );
}
