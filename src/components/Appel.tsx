import { useState } from 'react';
import { LEVELS } from '../data/levels';
import { useRunStore } from '../state/runStore';
import type { Gender } from '../theme/lexicon';

const MAX_NAME = 14;

// L'appel : on écrit son prénom sur la feuille de présence et on coche sa case.
export function Appel() {
  const run = useRunStore((s) => s.run);
  const setIdentity = useRunStore((s) => s.setIdentity);
  const [name, setName] = useState(run?.identity.name ?? '');
  const [gender, setGender] = useState<Gender | null>(run?.identity.gender ?? null);
  const [levelId, setLevelId] = useState(run?.levelId ?? 'adulte');
  const clean = name.trim();
  const ready = clean.length > 0 && gender !== null;
  const submit = () => { if (ready) setIdentity({ name: clean, gender: gender! }, levelId); };
  return (
    <div className="panel appel">
      <h2>Feuille de présence</h2>
      <p className="appel-sub">La maîtresse fait l'appel. Elle ne le refera pas.</p>
      <form
        className="appel-form"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <label className="appel-field">
          <span>Prénom</span>
          <input
            autoFocus
            value={name}
            maxLength={MAX_NAME}
            placeholder="écris ici"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="appel-field">
          <span>Case à cocher</span>
          <div className="appel-boxes">
            <button type="button" className={`appel-box ${gender === 'm' ? 'on' : ''}`} onClick={() => setGender('m')}>
              <i>{gender === 'm' ? '✓' : ''}</i> Élève
            </button>
            <button type="button" className={`appel-box ${gender === 'f' ? 'on' : ''}`} onClick={() => setGender('f')}>
              <i>{gender === 'f' ? '✓' : ''}</i> Élève<small>e</small>
            </button>
          </div>
        </div>
        <div className="appel-field">
          <span>Âge déclaré</span>
          <div className="appel-levels">
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.id}
                className={`appel-level ${levelId === l.id ? 'on' : ''}`}
                onClick={() => setLevelId(l.id)}
              >
                <strong>{l.label}</strong>
                <small>{l.hint}</small>
              </button>
            ))}
          </div>
        </div>
        <button className="ready-cta" type="submit" disabled={!ready}>Présent{gender === 'f' ? 'e' : ''} !</button>
      </form>
    </div>
  );
}
