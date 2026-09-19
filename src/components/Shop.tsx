import { consumable, curse, relic } from '../data/registry';
import { MAX_CONSUMABLES } from '../engine/hooks';
import { MAX_SAME_CHARM } from '../engine/rules';
import { shopRerollPrice, type ShopItem } from '../engine/shop';
import { useRunStore } from '../state/runStore';
import { L, SHOP_INTRO, money } from '../theme/lexicon';
import { RelicCard } from './RelicCard';
import { ShopArt } from './ShopArt';

// Quatre rayons bien séparés : ce que chaque type d'article fait est dit une fois, en tête de rayon.
type Section = 'fourniture' | 'trousse' | 'punition' | 'gommette';
const SECTIONS: { key: Section; icon: string; title: string; hint: string }[] = [
  { key: 'fourniture', icon: '📚', title: L.relic + 's', hint: 'Permanentes : elles restent dans ton cartable toute l\'année.' },
  { key: 'trousse', icon: '✏️', title: L.consommable, hint: 'À utiliser pendant la dictée, rechargé à chaque copie. 3 places max.' },
  { key: 'punition', icon: '📝', title: L.malediction + 's', hint: 'Une seule dictée, la prochaine : un gros malus contre un gros bonus.' },
  { key: 'gommette', icon: '⭐', title: L.charme + 's', hint: `Petits bonus pas chers, cumulables jusqu'à ×${MAX_SAME_CHARM}.` },
];

function sectionOf(item: ShopItem): Section {
  if (item.kind === 'consumable') return 'trousse';
  if (item.kind === 'curse') return 'punition';
  return relic(item.id).charm ? 'gommette' : 'fourniture';
}

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
  const enter = useRunStore((s) => s.enterShop);
  if (!run) return null;

  // La toute première visite de l'année a droit à sa scène.
  if (!run.seenShop) {
    return (
      <div className="panel pick event-intro">
        <div className="frame event-hero"><ShopArt /></div>
        <h2>{SHOP_INTRO.title}</h2>
        <div className="intro-text">
          {SHOP_INTRO.lines.map((l) => <p key={l}>{l}</p>)}
        </div>
        <p className="sage-ask">{SHOP_INTRO.ask}</p>
        <button className="ready-cta" onClick={enter}>{SHOP_INTRO.cta}</button>
      </div>
    );
  }
  const rerollPrice = shopRerollPrice(rerolls.paid, rerolls.freeLeft);
  const canReroll = run.euros >= rerollPrice;
  const inventoryFull = run.consumables.length >= MAX_CONSUMABLES;
  const owned = (id: string) => run.relicIds.filter((r) => r === id).length;
  const indexed = shop.map((item, i) => ({ item, i }));

  return (
    <div className="panel pick shop">
      <div className="shop-head">
        <div className="frame shop-frame"><ShopArt /></div>
        <div className="shop-intro">
          <h2>{L.boutique}</h2>
          <p className="muted">{L.boutiqueSub}</p>
          <div className="wallet"><span className="label">{L.euros}</span><span className="amount">{run.euros}</span></div>
        </div>
      </div>

      {SECTIONS.map((sec) => {
        const items = indexed.filter(({ item }) => sectionOf(item) === sec.key);
        if (!items.length) return null;
        return (
          <section key={sec.key} className={`shelf shelf-${sec.key}`}>
            <header className="shelf-head">
              <span className="shelf-icon">{sec.icon}</span>
              <div><h3>{sec.title}</h3><p>{sec.hint}</p></div>
            </header>
            <div className="shelf-items">
              {items.map(({ item, i }) => {
                const def = cardOf(item);
                const blockedInventory = item.kind === 'consumable' && inventoryFull;
                const tooPoor = run.euros < item.price;
                const count = item.kind === 'relic' ? owned(item.id) : 0;
                const capped = 'charm' in def && !!def.charm && count >= MAX_SAME_CHARM;
                const canBuy = !item.sold && !tooPoor && !blockedInventory && !capped;
                return (
                  <div key={`${i}-${item.id}`} className={`shop-slot ${item.sold ? 'sold' : ''}`}>
                    {count > 0 && <span className="kind">déjà ×{count}</span>}
                    <RelicCard relic={def} />
                    <button className={`buy ${canBuy ? '' : 'secondary'}`} disabled={!canBuy} onClick={() => buy(i)}>
                      {item.sold ? `✓ ${L.achete}` : capped ? `${L.maxExemplaires} (×${MAX_SAME_CHARM})` : blockedInventory ? L.inventairePlein : tooPoor ? `${money(item.price)} · ${L.pasAssez}` : `${L.acheter} · ${money(item.price)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className="row">
        <button className="secondary" onClick={reroll} disabled={!canReroll}>
          ↻ {L.changerArticles} · {rerollPrice === 0 ? `gratuit (${rerolls.freeLeft})` : money(rerollPrice)}
        </button>
        <button onClick={next}>{L.manche} {run.currentManche + 1} →</button>
      </div>
    </div>
  );
}
