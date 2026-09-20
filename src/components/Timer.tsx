import { useEffect } from 'react';
import { useRunStore } from '../state/runStore';

export function Timer() {
  const timeLeft = useRunStore((s) => s.manche?.timeLeft ?? 0);
  const total = useRunStore((s) => s.manche?.totalSeconds ?? 90);
  const phase = useRunStore((s) => s.phase);
  const tick = useRunStore((s) => s.tick);

  // Un appel, une notification, un changement d'onglet : le temps s'arrête aussi.
  useEffect(() => {
    if (phase !== 'playing') return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (document.hidden) { last = now; return; }
      tick((now - last) / 1000);
      last = now;
    }, 100);
    const resume = () => { last = performance.now(); };
    document.addEventListener('visibilitychange', resume);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', resume); };
  }, [phase, tick]);

  const pct = Math.max(0, Math.min(100, (timeLeft / total) * 100));
  const urgent = timeLeft <= 10;
  return (
    <div className={`timer ${urgent ? 'urgent' : ''}`}>
      <div className="timer-bar" style={{ width: `${pct}%` }} />
      <span className="timer-text">{Math.ceil(timeLeft)}s</span>
    </div>
  );
}
