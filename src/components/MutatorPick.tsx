import { mutator } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { RelicCard } from './RelicCard';

export function MutatorPick() {
  const choices = useRunStore((s) => s.mutatorChoices);
  const run = useRunStore((s) => s.run);
  const pick = useRunStore((s) => s.pickMutator);
  if (!run) return null;
  return (
    <div className="panel pick">
      <h2>Manche {run.currentManche}</h2>
      <p className="muted">Choisis la règle de la grille, ou garde la grille standard.</p>
      <div className="cards">
        {choices.map(mutator).map((m) => <RelicCard key={m.id} relic={m} onPick={() => pick(m.id)} />)}
      </div>
      <div className="row"><button className="secondary" onClick={() => pick(null)}>Grille standard</button></div>
    </div>
  );
}
