import { INTERLUDES } from '../data/interludes';
import { InterludeArt } from './InterludeArt';

// Planche de contrôle des transitions, sur ?transitions. Jamais depuis le jeu.
export function InterludesGallery() {
  return (
    <div className="gallery">
      {INTERLUDES.map((scene) => (
        <div key={scene.id} className="panel pick interlude">
          <div className="frame scene-frame"><InterludeArt id={scene.id} /></div>
          <div className="intro-text">
            {scene.lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          {scene.cry && <p className="interlude-cry">« {scene.cry} »</p>}
          <p className="interlude-fall">{scene.fall}</p>
        </div>
      ))}
    </div>
  );
}
