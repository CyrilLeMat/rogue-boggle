import { INTERLUDES } from '../data/interludes';
import { InterludeArt } from './InterludeArt';
import { say } from '../theme/lexicon';

// Planche de contrôle des transitions, sur ?transitions. Jamais depuis le jeu.
export function InterludesGallery() {
  return (
    <div className="gallery">
      {INTERLUDES.map((scene) => (
        <div key={scene.id} className="panel pick interlude">
          <div className="frame scene-frame"><InterludeArt id={scene.id} /></div>
          <div className="intro-text">
            {scene.lines.map((l) => <p key={l}>{say(l, null)}</p>)}
          </div>
          {scene.cry && <p className="interlude-cry">« {say(scene.cry, null)} »</p>}
          <p className="interlude-fall">{say(scene.fall, null)}</p>
        </div>
      ))}
    </div>
  );
}
