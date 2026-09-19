import { useState } from 'react';
import { curse, mutator, relics } from '../data/registry';
import { useRunStore } from '../state/runStore';

// Un tap sur une puce affiche sa description (les infobulles au survol n'existent pas au doigt).
export function RelicBar() {
  const ids = useRunStore((s) => s.run?.relicIds ?? []);
  const curseIds = useRunStore((s) => s.manche?.curseIds ?? []);
  const mutatorId = useRunStore((s) => s.manche?.mutatorId ?? null);
  const [open, setOpen] = useState<string | null>(null);
  if (ids.length === 0 && curseIds.length === 0 && !mutatorId) return null;
  const mut = mutatorId ? mutator(mutatorId) : null;
  const items = [
    ...(mut ? [{ id: mut.id, name: mut.name, description: mut.description, cls: 'mutator' }] : []),
    ...relics(ids).map((r) => ({ id: r.id, name: r.name, description: r.description, cls: r.rarity })),
    ...curseIds.map(curse).map((c) => ({ id: c.id, name: c.name, description: c.description, cls: 'curse' })),
  ];
  const current = items.find((i) => i.id === open);
  return (
    <div className="relic-bar-wrap">
      <div className="relic-bar">
        {items.map((it) => (
          <button
            key={it.id}
            className={`relic ${it.cls} ${open === it.id ? 'open' : ''}`}
            onClick={() => setOpen(open === it.id ? null : it.id)}
          >
            {it.name}
          </button>
        ))}
      </div>
      {current && <div className="relic-desc-box"><strong>{current.name}</strong> · {current.description}</div>}
    </div>
  );
}
