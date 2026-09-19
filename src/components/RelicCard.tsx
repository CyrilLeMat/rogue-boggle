import type { Relic } from '../engine/hooks';
import { RARITY_LABEL } from '../theme/lexicon';

interface Props { relic: Relic; onPick?: () => void; footer?: string; disabled?: boolean }

export function RelicCard({ relic, onPick, footer, disabled }: Props) {
  return (
    <button className={`relic-card ${relic.rarity}`} onClick={onPick} disabled={disabled || !onPick}>
      <span className="relic-rarity">{RARITY_LABEL[relic.rarity]}</span>
      <span className="relic-title">{relic.name}</span>
      <span className="relic-desc">{relic.description}</span>
      {footer && <span className="relic-footer">{footer}</span>}
    </button>
  );
}
