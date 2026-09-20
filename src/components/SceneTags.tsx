import { sceneTags, type SceneEffects } from '../data/scenes';

// Les conséquences en pastilles. Une leçon dit ce qu'elle fait au survol,
// et à défaut de survol (téléphone) elle le dit en dessous.
export function SceneTags({ effects }: { effects: SceneEffects }) {
  const tags = sceneTags(effects);
  const hints = tags.filter((t) => t.hint);
  return (
    <>
      <span className="scene-tags">
        {tags.map((t) => (
          <span key={t.text} className={`scene-tag ${t.tone}`}>
            {t.text}
            {t.hint && <span className="tag-hint">{t.hint}</span>}
          </span>
        ))}
      </span>
      {hints.length > 0 && (
        <span className="scene-hints">
          {hints.map((t) => <span key={t.text}>{t.hint}</span>)}
        </span>
      )}
    </>
  );
}
