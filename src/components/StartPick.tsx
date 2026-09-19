import { relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { L } from '../theme/lexicon';
import { ArchetypeArt } from './ArchetypeArt';

export function StartPick() {
  const choices = useRunStore((s) => s.startChoices);
  const pick = useRunStore((s) => s.pickStartRelic);
  return (
    <div className="panel pick archetypes">
      <h2>{L.relicDepart}</h2>
      <p className="muted">{L.relicDepartSub}</p>
      <div className="cards">
        {relics(choices).map((a) => (
          <button key={a.id} className="archetype-card" onClick={() => pick(a.id)}>
            <div className="frame"><ArchetypeArt id={a.id} /></div>
            <span className="archetype-name">{a.name}</span>
            <span className="archetype-flavor">{a.flavor}</span>
            <span className="archetype-effect">{a.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
