import { SCENE_BY_ID } from '../data/scenes';
import { SceneTags } from './SceneTags';
import { useRunStore } from '../state/runStore';
import { SceneArt } from './SceneArt';
import { useSay } from '../theme/useSay';

// Il se passe quelque chose en classe. Tu as deux façons de réagir, et ça engage la dictée.
export function ScenePick() {
  const sceneId = useRunStore((s) => s.currentScene);
  const pick = useRunStore((s) => s.pickSceneChoice);
  const say = useSay();
  const scene = sceneId ? SCENE_BY_ID.get(sceneId) : null;
  if (!scene) return null;
  return (
    <div className="panel pick scene-pick">
      <div className="frame scene-frame"><SceneArt id={scene.id} /></div>
      <h2>{scene.title}</h2>
      <div className="intro-text">
        {scene.lines.map((l) => <p key={l}>{say(l)}</p>)}
      </div>
      <div className="cards">
        {scene.choices.map((c, i) => (
          <button key={c.label} className="scene-card" onClick={() => pick(i)}>
            <span className="scene-choice">{c.label}</span>
            <span className="scene-detail">{say(c.detail)}</span>
            <SceneTags effects={c.effects} />
          </button>
        ))}
      </div>
    </div>
  );
}
