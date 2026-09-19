import { consumable, curse, relic } from '../data/registry';
import { MAX_CONSUMABLES } from '../engine/hooks';
import { MAX_SAME_CHARM } from '../engine/rules';
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
      <div className="shop-head">
        <div>
          <h2>Boutique</h2>
          <p className="muted">Manche {run.currentManche} terminée · achète ce que tu veux, puis passe à la suite.</p>
        </div>
        <div className="wallet"><span className="label">Portefeuille</span><span className="amount">{run.euros} €</span></div>
      </div>
      <div className="cards">
        {shop.map((item, i) => {
          const def = cardOf(item);
          const blockedInventory = item.kind === 'consumable' && inventoryFull;
          const tooPoor = run.euros < item.price;
          const count = item.kind === 'relic' ? owned(item.id) : 0;
          const capped = 'charm' in def && !!def.charm && count >= MAX_SAME_CHARM;
          const canBuy = !item.sold && !tooPoor && !blockedInventory && !capped;
          return (
            <div key={`${i}-${item.id}`} className={`shop-slot kind-${item.kind} ${'charm' in def && def.charm ? 'kind-charm' : ''} ${item.sold ? 'sold' : ''}`}>
              <span className="kind">{labelOf(item)}{count ? ` · déjà ×${count}` : ''}</span>
              <RelicCard relic={def} />
              <button className={`buy ${canBuy ? '' : 'secondary'}`} disabled={!canBuy} onClick={() => buy(i)}>
                {item.sold ? '✓ Acheté' : capped ? `Maximum ×${MAX_SAME_CHARM}` : blockedInventory ? 'Inventaire plein' : tooPoor ? `${item.price} € · pas assez` : `Acheter · ${item.price} €`}
              </button>
            </div>
          );
        })}
      </div>
      <div className="row">
        <button className="secondary" onClick={reroll} disabled={!canReroll}>
          ↻ Changer les articles · {rerollPrice === 0 ? `gratuit (${rerolls.freeLeft})` : `${rerollPrice} €`}
        </button>
        <button onClick={next}>Passer à la manche {run.currentManche + 1} →</button>
      </div>
    </div>
  );
}
