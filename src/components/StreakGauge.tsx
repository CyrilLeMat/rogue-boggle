import { relics } from '../data/registry';
import { streakRules } from '../engine/hookRunner';
import { STREAK_MAX_LINKS, STREAK_STEP, STREAK_WINDOW } from '../engine/rules';
import { useRunStore } from '../state/runStore';

// Jauge de série : le multiplicateur courant et le temps qu'il reste pour enchaîner.
export function StreakGauge() {
  const manche = useRunStore((s) => s.manche);
  const relicIds = useRunStore((s) => s.run?.relicIds ?? []);
  if (!manche) return null;
  const rules = streakRules(relics(relicIds), { window: STREAK_WINDOW, maxLinks: STREAK_MAX_LINKS });
  const since = manche.elapsed - manche.streak.lastAt;
  const alive = manche.streak.links > 0 && since <= rules.window;
  const nextMult = 1 + STREAK_STEP * Math.min(manche.streak.links, rules.maxLinks);
  const pct = alive ? Math.max(0, 1 - since / rules.window) * 100 : 0;
  return (
    <div className={`streak ${alive ? 'alive' : ''}`} title="Enchaîne les mots pour faire monter la série">
      <span className="streak-label">Série</span>
      <span className="streak-mult">×{(alive ? nextMult : 1).toFixed(1)}</span>
      <span className="streak-bar"><span style={{ width: `${pct}%` }} /></span>
      {alive && <span className="streak-links">{manche.streak.links}</span>}
    </div>
  );
}
