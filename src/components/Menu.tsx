import { useState } from 'react';
import { loadLastYear, useRunStore } from '../state/runStore';
import { BLURBS, GAME_SUBTITLE, GAME_TITLE, HOME, TAGLINE } from '../theme/lexicon';
import { Classroom } from './Classroom';

// La salle occupe l'écran, le reste est posé dessus comme sur un bureau.
export function Menu() {
  const start = useRunStore((s) => s.startRun);
  const [seed, setSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [last] = useState(loadLastYear);
  return (
    <div className="menu-screen">
      <h1 className="sr-only">{GAME_TITLE} — {GAME_SUBTITLE}</h1>
      <div className="menu-hero">
        <Classroom />
        {last && (
        <aside className="last-year">
          <span className="pin" />
          <span className="last-label">{HOME.lastYear}</span>
          <strong>{last.moyenne.toFixed(1)}<small>/20</small></strong>
          <span className="last-mention">{last.mention}</span>
          <button className="linkish" onClick={() => start(last.seed)}>{HOME.replay}</button>
        </aside>
        )}

      </div>

      <div className="menu-body">
        <p className="tagline">{TAGLINE}</p>
        <div className="clippings">
          {BLURBS.map((b) => (
            <p key={b.text} className="clipping">« {b.text} »<small>{b.source}</small></p>
          ))}
        </div>

        <button className="menu-cta" onClick={() => start(seed || undefined)}>Entrer en classe</button>

        <div className="menu-links">
          <button className="linkish" onClick={() => setShowRules(!showRules)}>{HOME.rules}</button>
          <button className="linkish" onClick={() => setShowSeed(!showSeed)}>{HOME.seedLink}</button>
        </div>

        {showRules && (
          <div className="rules-note">
            {HOME.rulesLines.map((l) => <p key={l}>{l}</p>)}
          </div>
        )}
        {showSeed && (
          <label className="seed-label">
            <span>{HOME.seedLabel}</span>
            <input autoFocus value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="2026" />
          </label>
        )}
      </div>
    </div>
  );
}
