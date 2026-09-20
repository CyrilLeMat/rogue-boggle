import { useState } from 'react';
import { relic, relics } from '../data/registry';
import { useRunStore } from '../state/runStore';
import { epilogue } from '../theme/epilogue';
import { L, SIGNATURE, mention, noteSur20, say } from '../theme/lexicon';

export function EndScreen({ victory }: { victory: boolean }) {
  const run = useRunStore((s) => s.run);
  const duelWon = useRunStore((s) => s.duelWon);
  const back = useRunStore((s) => s.backToMenu);
  const restart = useRunStore((s) => s.startRun);
  const [copied, setCopied] = useState(false);
  const [showBulletin, setShowBulletin] = useState(false);
  if (!run) return null;
  const allWords = run.history.flatMap((h) => h.words);
  const best = [...allWords].sort((a, b) => b.score - a.score).slice(0, 5);
  const notes = run.history.map((h) => noteSur20(h.score, h.threshold));
  const moyenne = notes.length ? notes.reduce((a, b) => a + b, 0) / notes.length : 0;
  const verdict = mention(moyenne, victory);
  // L'épilogue se lit avant les chiffres : on raconte l'année, puis on la compte.
  const beats = epilogue({
    victory, moyenne, lives: run.lives,
    duelDone: run.duelDone, duelWon,
    stolen: run.stolenRelicId ? say(relic(run.stolenRelicId).name, run.identity) : null,
    words: allWords.length,
    bestWord: best[0]?.word ?? null,
    manche: run.currentManche,
  });
  const copySeed = async () => {
    try { await navigator.clipboard.writeText(run.seed); setCopied(true); } catch { /* presse-papier indisponible */ }
  };
  return (
    <div className="panel end">
      <h1 className="title">{victory ? L.victoire : L.gameover}</h1>

      <div className="epilogue">
        {beats.map((b, i) => (
          <p
            key={b.text}
            className={b.kind ?? ''}
            style={{ animationDelay: `${(0.3 + i * 0.9).toFixed(2)}s` }}
          >
            {b.kind === 'quote' ? <>« {say(b.text, run.identity)} »</> : say(b.text, run.identity)}
          </p>
        ))}
        {!showBulletin && (
          <button
            className="ready-cta"
            style={{ animationDelay: `${(0.3 + beats.length * 0.9).toFixed(2)}s` }}
            onClick={() => setShowBulletin(true)}
          >
            {L.voirBulletin}
          </button>
        )}
      </div>

      {showBulletin && <>
      <p className="big">{run.score} pts</p>
      {run.endBonus > 0 && <p className="ok">dont +{run.endBonus} pts de bonus de fin d'année</p>}
      <p className="muted">
        {allWords.length} mots · {run.euros} {L.nonDepenses}
        {run.sageWins > 0 && ` · ${run.sageWins} ${run.sageWins > 1 ? 'défis de couloir relevés' : 'défi de couloir relevé'}`}
      </p>

      <div className="bulletin">
        <div className="bulletin-head">
          <span className="bulletin-school">École communale · classe de CE2</span>
          <span className="bulletin-pupil">Élève : {run.identity.name} <em>dit {run.identity.profile.surnom}</em></span>
          <span className="bulletin-hobby">
            Passe-temps : {run.identity.profile.cour} · Projet : {run.identity.profile.metier} · Caractère : {run.identity.profile.adjectif}
          </span>
          <span className="bulletin-file">
            Fiche : aime {run.identity.profile.plat}, ne supporte pas {run.identity.profile.horreur},
            voudrait {run.identity.profile.action} toute la journée, fredonne {run.identity.profile.chanson},
            admire {run.identity.profile.admire}.
          </span>
          <span className="bulletin-title">Bulletin de fin d'année</span>
          <span className="bulletin-year">Année {run.seed}</span>
        </div>
        <table className="run-table">
          <thead><tr><th>Dictée</th><th>Feuille</th><th>Note</th><th>Appréciation</th></tr></thead>
          <tbody>
            {run.history.map((h) => {
              const note = noteSur20(h.score, h.threshold);
              return (
                <tr key={h.manche} className={h.success ? '' : 'ko'}>
                  <td>{h.manche}</td>
                  <td>{h.gridSize}×{h.gridSize}</td>
                  <td className="note-cell">{note}<span className="sur">/20</span></td>
                  <td className="appr-cell">{say(h.appreciation, run.identity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <a className="feedback-link" href="https://github.com/CyrilLeMat/rogue-boggle/issues/new" target="_blank" rel="noreferrer">
          dire ce que tu en as pensé
        </a>
        <div className="bulletin-foot">
          <div>
            <span className="bulletin-label">Moyenne générale</span>
            <span className="bulletin-average">{moyenne.toFixed(1)}<span className="sur">/20</span></span>
          </div>
          <div className="bulletin-mention">
            <span className="stamp">{verdict.label}</span>
            <p>{say(verdict.note, run.identity)}</p>
            <span className="signature">{say(SIGNATURE, run.identity)}</span>
          </div>
        </div>
      </div>

      {run.relicIds.length > 0 && (
        <div className="relic-bar end-relics">
          {relics(run.relicIds).map((r) => <span key={r.id} className={`relic ${r.rarity}`}>{say(r.name, run.identity)}</span>)}
        </div>
      )}

      <h3>{L.motsMarquants}</h3>
      <ul>{best.map((w) => <li key={w.word + w.at}>{w.word} <span className="pts">{w.score}</span></li>)}</ul>

      </>}

      <p className="muted seed-line">{L.seed} <code>{run.seed}</code> <button className="secondary small" onClick={copySeed}>{copied ? 'copiée' : 'copier'}</button></p>
      <div className="row">
        <button onClick={() => restart()}>{L.nouvelleRun}</button>
        <button className="secondary" onClick={() => restart(run.seed)}>{L.rejouer}</button>
        <button className="secondary" onClick={back}>{L.menu}</button>
      </div>
    </div>
  );
}
