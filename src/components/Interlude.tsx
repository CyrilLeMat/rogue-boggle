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
  // chaque bloc attend que le précédent soit arrivé, quel que soit le nombre de lignes
  const cry = 0.1 + scene.lines.length * 0.65;
  const fall = cry + (scene.cry ? 0.9 : 0);
  return (
    <div className="panel pick interlude">
      <div className="frame scene-frame"><InterludeArt id={scene.id} /></div>
      <div className="intro-text">
        {scene.lines.map((l, i) => (
          <p key={l} style={{ animationDelay: `${(0.1 + i * 0.65).toFixed(2)}s` }}>{say(l)}</p>
        ))}
      </div>
      {scene.cry && (
        <p className="interlude-cry" style={{ animationDelay: `${cry.toFixed(2)}s` }}>« {say(scene.cry)} »</p>
      )}
      <p className="interlude-fall" style={{ animationDelay: `${fall.toFixed(2)}s` }}>{say(scene.fall)}</p>
      <button className="ready-cta" style={{ animationDelay: `${(fall + 0.6).toFixed(2)}s` }} onClick={next}>Retourner en classe</button>
    </div>
  );
}
