import { SCENE_BY_ID, sceneTags } from '../data/scenes';
import { useRunStore } from '../state/runStore';
import { SceneArt } from './SceneArt';

// Il se passe quelque chose en classe. Tu as deux façons de réagir, et ça engage la dictée.
export function ScenePick() {
  const sceneId = useRunStore((s) => s.currentScene);
  const pick = useRunStore((s) => s.pickSceneChoice);
  const scene = sceneId ? SCENE_BY_ID.get(sceneId) : null;
  if (!scene) return null;
  return (
    <div className="panel pick scene-pick">
      <div className="frame scene-frame"><SceneArt id={scene.id} /></div>
      <h2>{scene.title}</h2>
      <div className="intro-text">
        {scene.lines.map((l) => <p key={l}>{l}</p>)}
      </div>
      <div className="cards">
        {scene.choices.map((c, i) => (
          <button key={c.label} className="scene-card" onClick={() => pick(i)}>
            <span className="scene-choice">{c.label}</span>
            <span className="scene-detail">{c.detail}</span>
            <span className="scene-tags">
              {sceneTags(c.effects).map((t) => <span key={t.text} className={`scene-tag ${t.tone}`}>{t.text}</span>)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
