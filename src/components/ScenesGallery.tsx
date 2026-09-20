import { SCENES } from '../data/scenes';
import { SceneTags } from './SceneTags';
import { SceneArt } from './SceneArt';
import { say } from '../theme/lexicon';

// Planche de contrôle : toutes les scènes d'un coup, pour les relire et les valider.
// Accessible sur ?planches, jamais depuis le jeu.
export function ScenesGallery() {
  return (
    <div className="gallery">
      {SCENES.map((scene) => (
        <div key={scene.id} className="panel pick scene-pick">
          <div className="frame scene-frame"><SceneArt id={scene.id} /></div>
          <h2>{scene.title}</h2>
          <div className="intro-text">
            {scene.lines.map((l) => <p key={l}>{say(l, null)}</p>)}
          </div>
          <div className="cards">
            {scene.choices.map((c) => (
              <div key={c.label} className="scene-card">
                <span className="scene-choice">{c.label}</span>
                <span className="scene-detail">{say(c.detail, null)}</span>
                <SceneTags effects={c.effects} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
