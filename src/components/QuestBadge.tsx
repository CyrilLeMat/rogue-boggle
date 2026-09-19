import { useRunStore } from '../state/runStore';

export function QuestBadge() {
  const quest = useRunStore((s) => s.manche?.quest ?? null);
  if (!quest) return null;
  return (
    <div className={`quest ${quest.done ? 'done' : ''}`}>
      <span className="quest-label">{quest.done ? '✓ ' : ''}{quest.label}</span>
      <span className="quest-progress">{quest.progress}/{quest.target} · {quest.reward} b.</span>
    </div>
  );
}
