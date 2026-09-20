import { useState } from 'react';
import { curse, mutator, relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { useSay } from '../theme/useSay';

// La leçon du jour reste visible ; les fournitures se replient dans un « cartable » qu'on ouvre au tap.
export function RelicBar() {
  const ids = useRunStore((s) => s.run?.relicIds ?? []);
  const curseIds = useRunStore((s) => s.manche?.curseIds ?? []);
  const mutatorId = useRunStore((s) => s.manche?.mutatorId ?? null);
  const [open, setOpen] = useState(false);
  const say = useSay();
  const mut = mutatorId ? mutator(mutatorId) : null;
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  const items = [
    ...relics([...counts.keys()]).map((r) => ({
      id: r.id, name: (counts.get(r.id) ?? 1) > 1 ? `${say(r.name)} ×${counts.get(r.id)}` : say(r.name),
      description: r.description, cls: r.charm ? 'charm' : r.rarity,
    })),
    ...curseIds.map(curse).map((c) => ({ id: c.id, name: c.name, description: c.description, cls: 'curse' })),
  ];
  if (!mut && items.length === 0) return null;
  return (
    <div className="relic-bar-wrap">
      <div className="relic-bar">
        {mut && <span className="relic mutator" title={mut.description}>{mut.name}</span>}
        {items.length > 0 && (
          <button className={`relic cartable ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
            🎒 Cartable · {items.length}{curseIds.length ? ` · ${curseIds.length} punition${curseIds.length > 1 ? 's' : ''}` : ''}
          </button>
        )}
      </div>
      {open && (
        <ul className="cartable-list">
          {mut && <li className="mutator"><strong>{mut.name}</strong><span>{mut.description}</span></li>}
          {items.map((it) => (
            <li key={it.id} className={it.cls}><strong>{it.name}</strong><span>{it.description}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
