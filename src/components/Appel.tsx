import { useState } from 'react';
import { LEVELS } from '../data/levels';
import { useRunStore } from '../state/runStore';
import { useScrollTop } from '../useScrollTop';
import { DEFAULT_PROFILE, PROFILE_IDEAS, type Gender, type Profile } from '../theme/lexicon';

const MAX_NAME = 24;
const MAX_ANSWER = 60;

const PAGES: { key: keyof Profile; label: string }[][] = [
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
    { key: 'pere', label: 'Le prénom de mon père' },
    { key: 'chanson', label: 'Ma chanson préférée' },
    { key: 'plat', label: 'Mon plat préféré' },
    { key: 'horreur', label: 'Le plat que je déteste' },
  ],
  [
    { key: 'rigolo', label: 'Un mot rigolo' },
    { key: 'adjectif', label: 'Un adjectif' },
    { key: 'adjectif2', label: 'Un autre adjectif' },
    { key: 'adjectif3', label: 'Un troisième adjectif' },
    { key: 'objet', label: 'Un objet (une chaussette, un tournevis…)' },
    { key: 'nombre', label: 'Un nombre' },
  ],
  [
    { key: 'animal', label: 'Un animal (un hérisson, une otarie…)' },
    { key: 'corps', label: 'Une partie du corps (le genou, la nuque…)' },
    { key: 'distance', label: 'Une distance (trois mètres, deux pas…)' },
    { key: 'action', label: 'Une action (sauter, courir…)' },
    { key: 'cri', label: 'Ce que je crie quand j\'ai peur' },
    { key: 'faute', label: 'Un mot que j\'écris toujours mal' },
  ],
];

const QUESTIONS = PAGES.flat();

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

// Deux frimousses valent mieux qu'un « e » en exposant.
function Portrait({ gender }: { gender: Gender }) {
  return (
    <svg viewBox="0 0 48 48" className="portrait" aria-hidden="true">
      <circle cx="24" cy="26" r="15" fill="#ffe1cf" stroke="#3f3a55" strokeWidth="3" />
      {gender === 'm'
        ? <path d="M9 24 q3 -16 15 -16 q12 0 15 16 q-6 -8 -15 -8 q-9 0 -15 8z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
        : (
          <>
            <path d="M8 30 q0 -22 16 -22 q16 0 16 22 q-5 -12 -16 -12 q-11 0 -16 12z" fill="#6f4a33" stroke="#3f3a55" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M8 30 v6 M40 30 v6" stroke="#6f4a33" strokeWidth="6" strokeLinecap="round" />
          </>
        )}
      <g fill="#3f3a55"><circle cx="18" cy="27" r="2.2" /><circle cx="30" cy="27" r="2.2" /></g>
      <path d="M19 34 q5 4 10 0" stroke="#3f3a55" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// L'appel, en deux temps : la feuille de présence, puis la fiche de renseignements.
export function Appel() {
  const run = useRunStore((s) => s.run);
  const setIdentity = useRunStore((s) => s.setIdentity);
  const [page, setPage] = useState(0);
  useScrollTop(page);
  const [name, setName] = useState(run?.identity.name ?? '');
  const [gender, setGender] = useState<Gender | null>(run?.identity.gender ?? null);
  const [levelId, setLevelId] = useState(run?.levelId ?? 'adulte');
  const [profile, setProfile] = useState<Profile>(run?.identity.profile ?? DEFAULT_PROFILE);
  const clean = name.trim();
  const ready = clean.length > 0 && gender !== null;

  const surprise = () => setProfile(
    Object.fromEntries(QUESTIONS.map((q) => [q.key, pick(PROFILE_IDEAS[q.key])])) as unknown as Profile,
  );

  const submit = () => {
    if (!ready) return;
    const filled = Object.fromEntries(
      QUESTIONS.map((q) => [q.key, profile[q.key].trim() || DEFAULT_PROFILE[q.key]]),
    ) as unknown as Profile;
    setIdentity({ name: clean, gender: gender!, profile: filled }, levelId);
  };

  if (page > 0) {
    return (
      <div className="panel appel">
        <h2>Fiche de renseignements</h2>
        {/* le joueur ne peut pas deviner que ces mots reviendront dans les planches : on le lui dit */}
        <p className="appel-sub">
          Tes réponses reviennent dans l'histoire, mot pour mot, toute l'année : la maîtresse et le narrateur s'en servent, et ils ne demandent pas la permission.
        </p>
        <p className="appel-sub">
          Prends le temps de les changer, c'est là que le jeu devient le tien. Le 🎲 en tire une au hasard, et rien n'est obligatoire.
        </p>
        <form className="appel-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="appel-foot sticky">
            <button type="button" className="secondary small" onClick={() => setPage(0)}>← Retour</button>
            <button type="button" className="secondary small" onClick={surprise}>Tout tirer au sort</button>
            <button type="button" className="secondary small" onClick={submit}>Passer →</button>
          </div>
          <div className="appel-list">
            {QUESTIONS.map((q) => (
              <label className="appel-field" key={q.key}>
                <span>{q.label}</span>
                <span className="appel-input">
                  <input
                    value={profile[q.key]}
                    maxLength={MAX_ANSWER}
                    onChange={(e) => setProfile({ ...profile, [q.key]: e.target.value })}
                  />
                  <button
                    type="button"
                    className="dice"
                    title="Inspire-moi"
                    onClick={() => setProfile({ ...profile, [q.key]: pick(PROFILE_IDEAS[q.key]) })}
                  >
                    🎲
                  </button>
                </span>
              </label>
            ))}
          </div>
          <button className="ready-cta" type="submit">Présent{gender === 'f' ? 'e' : ''} !</button>
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
              <Portrait gender="m" />
              <span>Un élève</span>
            </button>
            <button type="button" className={`appel-box ${gender === 'f' ? 'on' : ''}`} onClick={() => setGender('f')}>
              <Portrait gender="f" />
              <span>Une élève</span>
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
        <button className="ready-cta" type="submit" disabled={!ready}>La fiche de renseignements →</button>
      </form>
    </div>
  );
}
