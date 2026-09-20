import { INTERLUDE_BY_ID } from '../data/interludes';
import { useRunStore } from '../state/runStore';
import { InterludeArt } from './InterludeArt';
import { useSay } from '../theme/useSay';

// Entre deux dictées : le narrateur en fait trop, l'élève encore plus, la réalité tranche.
export function Interlude() {
  const id = useRunStore((s) => s.currentInterlude);
  const next = useRunStore((s) => s.continueAfterInterlude);
  const say = useSay();
  const scene = id ? INTERLUDE_BY_ID.get(id) : null;
  if (!scene) return null;
  return (
    <div className="panel pick interlude">
      <div className="frame scene-frame"><InterludeArt id={scene.id} /></div>
      <div className="intro-text">
        {scene.lines.map((l) => <p key={l}>{say(l)}</p>)}
      </div>
      {scene.cry && <p className="interlude-cry">« {say(scene.cry)} »</p>}
      <p className="interlude-fall">{say(scene.fall)}</p>
      <button className="ready-cta" onClick={next}>Retourner en classe</button>
    </div>
  );
}
