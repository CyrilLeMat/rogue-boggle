import { useState } from 'react';
import { relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { L } from '../theme/lexicon';

export function EndScreen({ victory }: { victory: boolean }) {
  const run = useRunStore((s) => s.run);
  const back = useRunStore((s) => s.backToMenu);
  const restart = useRunStore((s) => s.startRun);
  const [copied, setCopied] = useState(false);
  if (!run) return null;
  const allWords = run.history.flatMap((h) => h.words);
  const best = [...allWords].sort((a, b) => b.score - a.score).slice(0, 5);
  const copySeed = async () => {
    try { await navigator.clipboard.writeText(run.seed); setCopied(true); } catch { /* presse-papier indisponible */ }
  };
  return (
    <div className="panel end">
      <h1 className="title">{victory ? L.victoire : L.gameover}</h1>
      <p className="muted">{victory ? L.victoireSub : L.gameoverSub(run.currentManche)}</p>
      <p className="big">{run.score} pts</p>
      {run.endBonus > 0 && <p className="ok">dont +{run.endBonus} pts de bonus de fin d'année</p>}
      <p className="muted">{allWords.length} mots · {run.euros} {L.nonDepenses}</p>

      <table className="run-table">
        <thead><tr><th>Dictée</th><th>Feuille</th><th>Note</th><th>Attendu</th><th>Meilleur mot</th><th>Billes</th></tr></thead>
        <tbody>
          {run.history.map((h) => (
            <tr key={h.manche} className={h.success ? '' : 'ko'}>
              <td>{h.manche}</td>
              <td>{h.gridSize}×{h.gridSize}</td>
              <td>{h.score}</td>
              <td>{h.threshold}</td>
              <td>{h.bestWord ? `${h.bestWord.word} (${h.bestWord.score})` : '—'}</td>
              <td>{h.euros}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {run.relicIds.length > 0 && (
        <div className="relic-bar end-relics">
          {relics(run.relicIds).map((r) => <span key={r.id} className={`relic ${r.rarity}`}>{r.name}</span>)}
        </div>
      )}

      <h3>{L.motsMarquants}</h3>
      <ul>{best.map((w) => <li key={w.word + w.at}>{w.word} <span className="pts">{w.score}</span></li>)}</ul>

      <p className="muted seed-line">{L.seed} <code>{run.seed}</code> <button className="secondary small" onClick={copySeed}>{copied ? 'copiée' : 'copier'}</button></p>
      <div className="row">
        <button onClick={() => restart()}>{L.nouvelleRun}</button>
        <button className="secondary" onClick={() => restart(run.seed)}>{L.rejouer}</button>
        <button className="secondary" onClick={back}>{L.menu}</button>
      </div>
    </div>
  );
}
