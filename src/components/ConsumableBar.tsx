import { consumable } from '../data/registry';
import { useRunStore } from '../state/runStore';

export function ConsumableBar() {
  const owned = useRunStore((s) => s.run?.consumables ?? []);
  const targeting = useRunStore((s) => s.manche?.targeting ?? null);
  const rerollChoice = useRunStore((s) => s.manche?.rerollChoice ?? null);
  const use = useRunStore((s) => s.useConsumable);
  const cancel = useRunStore((s) => s.cancelTargeting);
  const choose = useRunStore((s) => s.chooseRerollLetter);
  const inspiration = useRunStore((s) => s.manche?.inspiration ?? null);
  const elapsed = useRunStore((s) => s.manche?.elapsed ?? 0);
  if (owned.length === 0) return null;
  const inspired = inspiration && inspiration.until > elapsed ? inspiration : null;
  return (
    <div className="consumables">
      {owned.map((o) => {
        const def = consumable(o.id);
        return (
          <button
            key={o.id}
            className={`consumable ${o.charges <= 0 ? 'empty' : ''} ${targeting && def.needsTarget ? 'active' : ''}`}
            title={def.description}
            disabled={o.charges <= 0}
            onClick={() => (targeting && def.needsTarget ? cancel() : use(o.id))}
          >
            {def.name} <span className="charges">{o.charges}</span>
          </button>
        );
      })}
      {inspired && <span className="targeting-hint">Mot de {inspired.length} lettres, commence par {inspired.first}</span>}
      {targeting && !rerollChoice && <span className="targeting-hint">Touche la case à gommer…</span>}
      {!targeting && owned.some((o) => o.id === 'reroll' && o.charges > 0) && <span className="muted small-hint">double-tap sur une case = gomme</span>}
      {rerollChoice && (
        <span className="reroll-choice">
          {rerollChoice.letters.map((l) => <button key={l} className="small" onClick={() => choose(l)}>{l}</button>)}
        </span>
      )}
    </div>
  );
}
