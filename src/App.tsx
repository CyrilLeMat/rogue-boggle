import { useCallback, useMemo, useState } from 'react';
import { activeHooks } from './data/registry';
import { posKey } from './engine/adjacency';
import { uiFlags } from './engine/hookRunner';
import type { Pos } from './engine/types';
import { Classroom } from './components/Classroom';
import { ConsumableBar } from './components/ConsumableBar';
import { DevPanel } from './components/DevPanel';
import { EndScreen } from './components/EndScreen';
import { FinishButton } from './components/FinishButton';
import { RelicBar } from './components/RelicBar';
import { FoundWords } from './components/FoundWords';
import { Grid } from './components/Grid';
import { GridLegend } from './components/GridLegend';
import { Intro } from './components/Intro';
import { LessonPick } from './components/LessonPick';
import { MancheRecap } from './components/MancheRecap';
import { QuestBadge } from './components/QuestBadge';
import { ReadyOverlay } from './components/ReadyScreen';
import { StreakGauge } from './components/StreakGauge';
import { ScoreBoard } from './components/ScoreBoard';
import { EventScreen } from './components/EventScreen';
import { Shop } from './components/Shop';
import { SoundEffects } from './components/SoundEffects';
import { StartPick } from './components/StartPick';
import { Timer } from './components/Timer';
import { useRunStore } from './state/runStore';
import { GAME_SUBTITLE, GAME_TITLE, TAGLINE } from './theme/lexicon';

function Menu() {
  const start = useRunStore((s) => s.startRun);
  const [seed, setSeed] = useState('');
  return (
    <div className="panel menu">
      <h1 className="sr-only">{GAME_TITLE} — {GAME_SUBTITLE}</h1>
      <div className="frame menu-frame"><Classroom /></div>
      <p className="tagline">{TAGLINE}</p>
      <button className="menu-cta" onClick={() => start(seed || undefined)}>Entrer en classe</button>
      <input placeholder="année (seed, optionnel)" value={seed} onChange={(e) => setSeed(e.target.value)} />
    </div>
  );
}

function Playing() {
  const manche = useRunStore((s) => s.manche);
  const phase = useRunStore((s) => s.phase);
  const relicIds = useRunStore((s) => s.run?.relicIds ?? []);
  const curseIds = useRunStore((s) => s.manche?.curseIds ?? []);
  const submit = useRunStore((s) => s.submitPath);
  const pickCell = useRunStore((s) => s.pickCell);
  const previewPath = useRunStore((s) => s.previewPath);
  const feedback = useRunStore((s) => s.feedback);
  const [preview, setPreview] = useState<ReturnType<typeof previewPath>>(null);
  const onPathChange = useCallback((p: Pos[]) => setPreview(previewPath(p)), [previewPath]);
  const flash = feedback?.kind === 'ok' && feedback.path ? { id: feedback.id, path: feedback.path, score: feedback.score ?? 0, bonus: feedback.bonus } : null;
  const rerollCell = useRunStore((s) => s.rerollCell);
  const hasReroll = useRunStore((s) => (s.run?.consumables ?? []).some((c) => c.id === 'reroll' && c.charges > 0));
  const mutatorId = useRunStore((s) => s.manche?.mutatorId ?? null);
  const flags = useMemo(() => uiFlags(activeHooks(relicIds, curseIds, mutatorId)), [relicIds, curseIds, mutatorId]);
  const usedCells = useMemo(() => {
    if (!flags.highlightUsedCells || !manche) return undefined;
    const set = new Set<number>();
    for (const f of manche.found) for (const [r, c] of f.path) set.add(posKey(r, c));
    return set;
  }, [flags.highlightUsedCells, manche]);
  if (!manche) return null;
  return (
    <div className={`playing ${phase === 'ready' ? 'is-ready' : ''}`}>
      <ScoreBoard />
      <Timer />
      <RelicBar />
      <div className="under-bar">
        <StreakGauge />
        <QuestBadge />
      </div>
      <div className="board">
        {phase === 'ready' && <ReadyOverlay />}
        <Grid
          grid={manche.grid}
          onSubmit={submit}
          highlightCells={usedCells}
          oracleCell={flags.showLongestLength ? manche.search.longestStart : null}
          amorceCell={manche.amorce?.start ?? null}
          oracleLength={manche.search.longestLength}
          inspiredCells={manche.inspiration && manche.inspiration.until > manche.elapsed ? new Set(manche.inspiration.cells) : undefined}
          cursedCell={manche.cursedWord ? manche.cursedStart : null}
          luckyLetter={manche.luckyLetter}
          blurRadius={flags.blurOutsideCursor ? 2 : undefined}
          targeting={manche.targeting !== null}
          onPickCell={pickCell}
          critters={manche.critters.map((c) => c.pos)}
          disabled={phase === 'ready'}
          onDoubleTap={hasReroll ? rerollCell : undefined}
          enemies={manche.enemies}
          onPathChange={onPathChange}
          preview={preview}
          flash={flash}
        />
        <div>
          <ConsumableBar />
          <GridLegend />
          <FoundWords />
          <FinishButton />
        </div>
      </div>
      <DevPanel />
    </div>
  );
}

export default function App() {
  const phase = useRunStore((s) => s.phase);
  return (
    <main>
      <SoundEffects />
      {phase === 'menu' && <Menu />}
      {phase === 'intro' && <Intro />}
      {phase === 'startPick' && <StartPick />}
      {phase === 'lessonPick' && <LessonPick />}
      {(phase === 'playing' || phase === 'ready') && <Playing />}
      {phase === 'recap' && <MancheRecap />}
      {phase === 'event' && <EventScreen />}
      {phase === 'shop' && <Shop />}
      {phase === 'victory' && <EndScreen victory />}
      {phase === 'gameover' && <EndScreen victory={false} />}
    </main>
  );
}
