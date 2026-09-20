import { useState } from 'react';
import { LEVELS } from '../data/levels';
import { useRunStore } from '../state/runStore';
import { DEFAULT_PROFILE, PROFILE_IDEAS, type Gender, type Profile } from '../theme/lexicon';

const MAX_NAME = 14;
const MAX_ANSWER = 24;

const QUESTIONS: { key: keyof Profile; label: string }[][] = [
  [
    { key: 'salut', label: 'Comment je dis bonjour à mes amis' },
    { key: 'phrase', label: 'Ma phrase fétiche' },
    { key: 'surnom', label: 'Le surnom qu\'on me donne' },
    { key: 'cour', label: 'Ce que je fais le plus dans la cour' },
    { key: 'heros', label: 'Mon personnage préféré' },
  ],
  [
    { key: 'metier', label: 'Ce que je veux faire plus tard' },
    { key: 'admire', label: 'La personne que j\'admire le plus' },
    { key: 'chanson', label: 'Ma chanson préférée' },
    { key: 'plat', label: 'Mon plat préféré' },
    { key: 'horreur', label: 'Le plat que je déteste' },
  ],
];

const ALL_QUESTIONS = QUESTIONS.flat();

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

// L'appel, en deux temps : la feuille de présence, puis la fiche de renseignements.
export function Appel() {
  const run = useRunStore((s) => s.run);
  const setIdentity = useRunStore((s) => s.setIdentity);
  const [page, setPage] = useState(0);
  const [name, setName] = useState(run?.identity.name ?? '');
  const [gender, setGender] = useState<Gender | null>(run?.identity.gender ?? null);
  const [levelId, setLevelId] = useState(run?.levelId ?? 'adulte');
  const [profile, setProfile] = useState<Profile>(run?.identity.profile ?? DEFAULT_PROFILE);
  const clean = name.trim();
  const ready = clean.length > 0 && gender !== null;

  const surprise = () => setProfile(
    Object.fromEntries(ALL_QUESTIONS.map((q) => [q.key, pick(PROFILE_IDEAS[q.key])])) as unknown as Profile,
  );

  const submit = () => {
    if (!ready) return;
    const filled = Object.fromEntries(
      ALL_QUESTIONS.map((q) => [q.key, profile[q.key].trim() || DEFAULT_PROFILE[q.key]]),
    ) as unknown as Profile;
    setIdentity({ name: clean, gender: gender!, profile: filled }, levelId);
  };

  if (page > 0) {
    const last = page === QUESTIONS.length;
    return (
      <div className="panel appel">
        <h2>Fiche de renseignements</h2>
        <p className="appel-sub">
          {page === 1
            ? 'Elle garde ça dans un classeur. Elle s\'en sert plus tard.'
            : 'Deuxième feuillet. Elle a tout son temps, et toi aussi.'}
        </p>
        <form className="appel-form" onSubmit={(e) => { e.preventDefault(); if (last) submit(); else setPage(page + 1); }}>
          {QUESTIONS[page - 1].map((q) => (
            <label className="appel-field" key={q.key}>
              <span>{q.label}</span>
              <input
                value={profile[q.key]}
                maxLength={MAX_ANSWER}
                onChange={(e) => setProfile({ ...profile, [q.key]: e.target.value })}
              />
            </label>
          ))}
          <button className="ready-cta" type="submit">
            {last ? `Présent${gender === 'f' ? 'e' : ''} !` : 'Feuillet suivant →'}
          </button>
          <div className="appel-foot">
            <button type="button" className="secondary small" onClick={() => setPage(page - 1)}>← Retour</button>
            <button type="button" className="secondary small" onClick={surprise}>Surprends-moi</button>
            {!last && <button type="button" className="secondary small" onClick={submit}>Passer le reste</button>}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="panel appel">
      <h2>Feuille de présence</h2>
      <p className="appel-sub">La maîtresse fait l'appel. Elle ne le refera pas.</p>
      <form className="appel-form" onSubmit={(e) => { e.preventDefault(); if (ready) setPage(1); }}>
        <label className="appel-field">
          <span>Prénom</span>
          <input autoFocus value={name} maxLength={MAX_NAME} placeholder="écris ici" onChange={(e) => setName(e.target.value)} />
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
              <button type="button" key={l.id} className={`appel-level ${levelId === l.id ? 'on' : ''}`} onClick={() => setLevelId(l.id)}>
                <strong>{l.label}</strong>
                <small>{l.hint}</small>
              </button>
            ))}
          </div>
        </div>
        <button className="ready-cta" type="submit" disabled={!ready}>Suite de la fiche →</button>
      </form>
    </div>
  );
}
