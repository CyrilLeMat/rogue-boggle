import { relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { useSay } from '../theme/useSay';
import { L } from '../theme/lexicon';
import { ArchetypeArt } from './ArchetypeArt';

export function StartPick() {
  const choices = useRunStore((s) => s.startChoices);
  const pick = useRunStore((s) => s.pickStartRelic);
  const say = useSay();
  return (
    <div className="panel pick archetypes">
      <h2>{L.relicDepart}</h2>
      <p className="muted">{say(L.relicDepartSub)}</p>
      <div className="cards">
        {relics(choices).map((a) => (
          <button key={a.id} className="archetype-card" onClick={() => pick(a.id)}>
            <div className="frame"><ArchetypeArt id={a.id} /></div>
            <span className="archetype-name">{say(a.name)}</span>
            {a.recommended && <span className="badge-advice">conseillé pour une première année</span>}
            <span className="archetype-flavor">{say(a.flavor ?? '')}</span>
            <span className="archetype-effect">{say(a.description)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
