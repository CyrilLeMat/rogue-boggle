import type { Relic } from '../engine/hooks';

const RARITY_LABEL = { common: 'Commun', rare: 'Rare', legendary: 'Légendaire' } as const;

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
