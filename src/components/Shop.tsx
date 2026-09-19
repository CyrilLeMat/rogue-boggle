import { consumable, curse, relic } from '../data/registry';
import { MAX_CONSUMABLES } from '../engine/hooks';
import { shopRerollPrice, type ShopItem } from '../engine/shop';
import { useRunStore } from '../state/runStore';
import { RelicCard } from './RelicCard';

const KIND_LABEL: Record<ShopItem['kind'], string> = { relic: 'Relic', consumable: 'Consommable', curse: 'Malédiction' };
const labelOf = (item: ShopItem) => (item.kind === 'relic' && relic(item.id).charm ? 'Charme' : KIND_LABEL[item.kind]);

function cardOf(item: ShopItem) {
  if (item.kind === 'relic') return relic(item.id);
  if (item.kind === 'curse') return curse(item.id);
  const c = consumable(item.id);
  return { id: c.id, name: c.name, rarity: c.rarity, description: c.description };
}

export function Shop() {
  const shop = useRunStore((s) => s.shop);
  const run = useRunStore((s) => s.run);
  const buy = useRunStore((s) => s.buy);
  const next = useRunStore((s) => s.nextManche);
  const reroll = useRunStore((s) => s.rerollShop);
  const rerolls = useRunStore((s) => s.shopRerolls);
  if (!run) return null;
  const rerollPrice = shopRerollPrice(rerolls.paid, rerolls.freeLeft);
  const canReroll = run.euros >= rerollPrice;
  const inventoryFull = run.consumables.length >= MAX_CONSUMABLES;
  const owned = (id: string) => run.relicIds.filter((r) => r === id).length;
  return (
    <div className="panel pick shop">
      <h2>Boutique</h2>
      <p className="muted">Manche {run.currentManche} terminée · <strong className="euros">{run.euros} €</strong> en poche</p>
      <div className="cards">
        {shop.map((item, i) => {
          const def = cardOf(item);
          const blockedInventory = item.kind === 'consumable' && inventoryFull;
          const canBuy = !item.sold && run.euros >= item.price && !blockedInventory;
          const count = item.kind === 'relic' ? owned(item.id) : 0;
          const footer = item.sold ? 'Acheté' : blockedInventory ? 'Inventaire plein' : `${item.price} €${count ? ` · déjà ×${count}` : ''}`;
          return (
            <div key={`${i}-${item.id}`} className={`shop-slot kind-${item.kind} ${def.charm ? 'kind-charm' : ''}`}>
              <span className="kind">{labelOf(item)}</span>
              <RelicCard relic={def} onPick={canBuy ? () => buy(i) : undefined} footer={footer} disabled={!canBuy} />
            </div>
          );
        })}
      </div>
      <div className="row">
        <button className="secondary" onClick={reroll} disabled={!canReroll}>
          Changer les articles · {rerollPrice === 0 ? `gratuit (${rerolls.freeLeft})` : `${rerollPrice} €`}
        </button>
        <button onClick={next}>Manche {run.currentManche + 1}</button>
      </div>
    </div>
  );
}
