import { useState } from 'react';
import { isMusicEnabled, setMusicEnabled, startMusic } from '../audio/music';
import { loadLastYear, loadSavedRun, useRunStore } from '../state/runStore';
import { BLURBS, GAME_SUBTITLE, GAME_TITLE, HOME, TAGLINE } from '../theme/lexicon';
import { Classroom } from './Classroom';
import { TraceDemo } from './TraceDemo';

// La salle occupe l'écran, le reste est posé dessus comme sur un bureau.
export function Menu() {
  const start = useRunStore((s) => s.startRun);
  const [seed, setSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [last] = useState(loadLastYear);
  const [saved] = useState(loadSavedRun);
  const [music, setMusic] = useState(isMusicEnabled);
  const resume = useRunStore((s) => s.resumeRun);
  return (
    <div className="menu-screen">
      <h1 className="sr-only">{GAME_TITLE} — {GAME_SUBTITLE}</h1>
      <div className="menu-hero">
        <Classroom />
        {last && !saved && (
        <aside className="last-year" title={`Bulletin de ${last.name}, année ${last.seed}`}>
          <span className="pin" />
          <span className="last-label">{HOME.lastYear}</span>
          <strong>{last.moyenne.toFixed(1)}<small>/20</small></strong>
          <span className="last-mention">{last.mention}</span>
          <span className="last-seed">année {last.seed}</span>
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

        {saved
          ? (
            <>
              <button className="menu-cta" onClick={resume}>Reprendre l'année · dictée {saved.manche}</button>
              <button className="linkish" onClick={() => start(seed || undefined)}>recommencer une nouvelle année</button>
            </>
          )
          : <button className="menu-cta" onClick={() => start(seed || undefined)}>Entrer en classe</button>}

        {!music && (
          <button
            className="linkish music-hint"
            onClick={() => { setMusicEnabled(true); startMusic(); setMusic(true); }}
          >
            ♫ mettre la musique
          </button>
        )}

        <div className="menu-links">
          <button className="linkish" onClick={() => setShowRules(!showRules)}>{HOME.rules}</button>
          <button className="linkish" onClick={() => setShowSeed(!showSeed)}>{HOME.seedLink}</button>
        </div>

        {showRules && (
          <div className="rules-note">
            {HOME.rulesLines.map((l) => <p key={l}>{l}</p>)}
            <TraceDemo />
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
