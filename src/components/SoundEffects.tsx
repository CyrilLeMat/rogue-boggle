import { useEffect, useRef, useState } from 'react';
import { isMusicEnabled, setMusicEnabled, setMusicIntensity, setMusicMood, startMusic, stopMusic } from '../audio/music';
import { isMuted, setMuted, sfx, unlockAudio } from '../audio/sfx';
import { useRunStore } from '../state/runStore';
import { scoreTier } from '../theme/intensity';

// Écoute le store et joue les sons : le store reste pur.
export function SoundEffects() {
  const feedback = useRunStore((s) => s.feedback);
  const phase = useRunStore((s) => s.phase);
  const lastResult = useRunStore((s) => s.lastResult);
  const shop = useRunStore((s) => s.shop);
  const timeLeft = useRunStore((s) => s.manche?.timeLeft ?? 0);
  const mutatorId = useRunStore((s) => s.manche?.mutatorId ?? null);
  const [muted, setMutedState] = useState(isMuted());
  const [music, setMusicState] = useState(isMusicEnabled());
  const soldCount = useRef(0);
  const lastTick = useRef(-1);

  useEffect(() => {
    const unlock = () => { unlockAudio(); startMusic(); };
    window.addEventListener('pointerdown', unlock, { once: true });
    // onglet en arrière-plan : on coupe la musique, elle reprend au retour
    const onVisibility = () => { if (document.hidden) stopMusic(); else startMusic(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    if (feedback.kind === 'ok') {
      sfx.valid(feedback.score ?? 0);
      sfx.impact(scoreTier(feedback.score ?? 0));
      if (feedback.bonus?.includes('escargot')) sfx.snail();
      else if (feedback.bonus) sfx.bonus();
    } else if (feedback.kind === 'duplicate') sfx.duplicate();
    else if (feedback.kind === 'invalid') sfx.invalid();
  }, [feedback]);

  useEffect(() => {
    if (phase === 'recap' && lastResult) (lastResult.success ? sfx.success : sfx.fail)();
    if (phase === 'victory') sfx.success();
    if (phase === 'gameover') sfx.fail();
  }, [phase, lastResult]);

  useEffect(() => {
    const sold = shop.filter((s) => s.sold).length;
    if (sold > soldCount.current) sfx.buy();
    soldCount.current = sold;
  }, [shop]);

  useEffect(() => {
    // les 20 dernières secondes accélèrent la musique, le reste du temps elle reste calme
    setMusicIntensity(phase === 'playing' && timeLeft <= 20 ? 1 - timeLeft / 20 : 0);
  }, [timeLeft, phase]);

  useEffect(() => {
    // le prologue a sa propre bande-son, case par case : on ne lui passe pas dessus
    if (phase === 'intro') return;
    // la couleur du moment : le couloir fait peur, le souvenir fait mal, une leçon se combat
    const combat = phase === 'playing' && (!!mutatorId || timeLeft <= 20);
    setMusicMood(
      phase === 'event' ? 'choc'
      : phase === 'interlude' ? 'triste'
      : combat ? 'combat'
      : 'classe',
    );
  }, [phase, mutatorId, timeLeft <= 20]);

  useEffect(() => {
    if (phase !== 'playing') { lastTick.current = -1; return; }
    const sec = Math.ceil(timeLeft);
    if (sec <= 5 && sec > 0 && sec !== lastTick.current) { lastTick.current = sec; sfx.tick(); }
  }, [timeLeft, phase]);

  return (
    <div className="audio-toggles">
      <button
        className="secondary small mute"
        aria-label={music ? 'Couper la musique' : 'Activer la musique'}
        onClick={() => { const m = !music; setMusicEnabled(m); setMusicState(m); }}
      >
        {music ? '🎵' : '🎵̸'}
      </button>
      <button
        className="secondary small mute"
        aria-label={muted ? 'Activer les sons' : 'Couper les sons'}
        onClick={() => { const m = !muted; setMuted(m); setMutedState(m); }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
