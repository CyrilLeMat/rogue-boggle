import { relics } from '../data/registry';
import { uiFlags } from '../engine/hookRunner';
import { useRunStore } from '../state/runStore';
import { useSay } from '../theme/useSay';

// Légende des marqueurs actifs sur la grille : indispensable au doigt, où rien ne se survole.
export function GridLegend() {
  const manche = useRunStore((s) => s.manche);
  const relicIds = useRunStore((s) => s.run?.relicIds ?? []);
  const say = useSay();
  if (!manche) return null;
  const flags = uiFlags(relics(relicIds));
  const lines: { icon: string; cls: string; text: string }[] = [];
  if (flags.showLongestLength && manche.search.longestStart !== null) {
    lines.push({ icon: String(manche.search.longestLength), cls: 'oracle', text: `Petit Larousse : le mot le plus long fait ${manche.search.longestLength} lettres et commence sur la case marquée de ce chiffre` });
  }
  if (manche.amorce) {
    lines.push({ icon: '…', cls: 'amorce', text: `Antisèche : un mot de ${manche.amorce.length} lettres commence par ${manche.amorce.prefix}${manche.amorce.start !== null ? ', sur la case marquée d\'un point vert' : ''}` });
  }
  if (manche.cursedWord && manche.cursedStart !== null && !manche.found.some((f) => f.word === manche.cursedWord)) {
    lines.push(manche.cursedVisible
      ? { icon: '✦', cls: 'cursed', text: `La maîtresse dicte « ${manche.cursedWord} » : il commence sur la case marquée ✦ (+30 pts, puis elle en dicte un autre)` }
      : { icon: '✦', cls: 'cursed', text: `Mot mystère : ${manche.cursedWord.length} lettres, il commence sur la case marquée ✦ (+60 pts)` });
  }
  if (manche.luckyLetter) lines.push({ icon: manche.luckyLetter, cls: 'lucky', text: `Lettre soulignée : les mots qui commencent par ${manche.luckyLetter} (cases jaunes) comptent double` });
  if (manche.grid.cells.flat().some((c) => c.isToxic)) lines.push({ icon: '●', cls: 'toxic', text: 'Tache d\'encre : −8 s à chaque utilisation' });
  if (manche.critters.length) lines.push({ icon: '🐌', cls: '', text: `Escargot : un mot qui passe par sa case compte double` });
  const alive = manche.enemies.filter((e) => e.hp > 0);
  const boss = alive.find((e) => e.typeId === 'kevin');
  if (boss) lines.push({ icon: '🧒', cls: 'enemy', text: `{rival} (${boss.hp} d'endurance) : il change de place toutes les 5 s ; trace des mots à travers sa case, chaque mot lui retire son score. Il tombe à zéro, et pas avant` });
  else if (alive.length === 1) lines.push({ icon: '🧒', cls: 'enemy', text: `Cancre (${alive[0].hp} d'endurance) : il change de place toutes les 8 s ; trace des mots à travers sa case, chaque mot lui retire son score. Calmé : +30 billes, toujours là : −15 billes` });
  if (alive.length > 1) lines.push({ icon: '🧒', cls: 'enemy', text: `${alive.length} cancres (${alive[0].maxHp} d'endurance chacun) : ils changent de place toutes les 8 s ; un mot qui traverse leur case leur retire son score. Calmé : +30 billes, toujours là : −15 billes` });
  if (lines.length === 0) return null;
  return (
    <ul className="legend">
      {lines.map((l) => (
        <li key={l.text}><span className={`legend-icon ${l.cls}`}>{l.icon}</span><span>{say(l.text)}</span></li>
      ))}
    </ul>
  );
}
