import { relics } from '../data/registry';
import { uiFlags } from '../engine/hookRunner';
import { useRunStore } from '../state/runStore';

// Légende des marqueurs actifs sur la grille : indispensable au doigt, où rien ne se survole.
export function GridLegend() {
  const manche = useRunStore((s) => s.manche);
  const relicIds = useRunStore((s) => s.run?.relicIds ?? []);
  if (!manche) return null;
  const flags = uiFlags(relics(relicIds));
  const lines: { icon: string; cls: string; text: string }[] = [];
  if (flags.showLongestLength && manche.search.longestStart !== null) {
    lines.push({ icon: String(manche.search.longestLength), cls: 'oracle', text: `Oracle : le mot le plus long fait ${manche.search.longestLength} lettres et commence sur la case cerclée d'or` });
  }
  if (manche.cursedWord && manche.cursedStart !== null && !manche.found.some((f) => f.word === manche.cursedWord)) {
    lines.push({ icon: '✦', cls: 'cursed', text: `Mot maudit : ${manche.cursedWord.length} lettres, il commence sur la case cerclée de violet (+60 pts)` });
  }
  if (manche.luckyLetter) lines.push({ icon: '♣', cls: 'lucky', text: `Lettre porte-bonheur : les mots qui commencent par ${manche.luckyLetter} comptent double` });
  if (manche.grid.cells.flat().some((c) => c.isToxic)) lines.push({ icon: '☠', cls: 'toxic', text: 'Case toxique : −8 s à chaque utilisation' });
  if (flags.radarLongWord && manche.radarCell !== null) lines.push({ icon: '◌', cls: 'radar', text: 'Radar : la case qui brille appartient à un mot de 7 lettres ou plus' });
  if (manche.critters.length) lines.push({ icon: '🐌', cls: '', text: `Escargot : un mot qui passe par sa case compte double` });
  if (lines.length === 0) return null;
  return (
    <ul className="legend">
      {lines.map((l) => (
        <li key={l.text}><span className={`legend-icon ${l.cls}`}>{l.icon}</span><span>{l.text}</span></li>
      ))}
    </ul>
  );
}
