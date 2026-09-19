import { useState } from 'react';
import { RELICS } from '../data/relics';
import { useRunStore } from '../state/runStore';

// Outil de playtest tant que la boutique n'existe pas : ajoute un relic à la volée.
export function DevPanel() {
  const addRelic = useRunStore((s) => s.addRelic);
  const owned = useRunStore((s) => s.run?.relicIds ?? []);
  const difficulty = useRunStore((s) => s.manche?.difficulty);
  const [open, setOpen] = useState(false);
  if (!import.meta.env.DEV) return null;
  return (
    <div className="dev-panel">
      <button className="secondary small" onClick={() => setOpen(!open)}>dev</button>
      {open && difficulty && <span className="muted">potentiel {difficulty.potential} · facteur {difficulty.factor.toFixed(2)}</span>}
      {open && (
        <select value="" onChange={(e) => { if (e.target.value) addRelic(e.target.value); }}>
          <option value="">+ relic…</option>
          {RELICS.filter((r) => !owned.includes(r.id)).map((r) => (
            <option key={r.id} value={r.id}>{r.name} ({r.rarity})</option>
          ))}
        </select>
      )}
    </div>
  );
}
