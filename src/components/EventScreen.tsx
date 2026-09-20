import { useCallback, useEffect, useState } from 'react';
import { sfx } from '../audio/sfx';
import { posKey } from '../engine/adjacency';
import { ruleAccepts, ruleLabel, type ChoiceEvent, type HarvestEvent, type HuntEvent } from '../engine/events';
import { wordFromPath } from '../engine/sage';
import type { Pos } from '../engine/types';
import { dictionary } from '../data/dictionary';
import { relics } from '../data/registry';
import { useSay } from '../theme/useSay';
import { useRunStore } from '../state/runStore';
import { EV, SCOLDS, money, scold } from '../theme/lexicon';
import { EventArt } from './EventArt';
import { Grid } from './Grid';
import { RelicCard } from './RelicCard';

function Chrono({ left, total }: { left: number; total: number }) {
  return (
    <div className={`timer sage-timer ${left <= 10 ? 'urgent' : ''}`}>
      <div className="timer-bar" style={{ width: `${(left / total) * 100}%` }} />
      <span className="timer-text">{Math.ceil(left)}s</span>
    </div>
  );
}

// Sage et inspecteur : un mot désigné à retrouver dans la feuille.
function Hunt({ ev }: { ev: HuntEvent }) {
  const submit = useRunStore((s) => s.eventSubmit);
  const say = useSay();
  const [traced, setTraced] = useState('');
  const playing = ev.outcome === 'playing';
  const onPathChange = useCallback((p: Pos[]) => setTraced(wordFromPath(ev.grid, p)), [ev.grid]);

  const active = new Set(ev.active);
  const locked = new Set<number>();
  if (ev.dimmed) {
    for (let r = 0; r < ev.grid.size; r++)
      for (let c = 0; c < ev.grid.size; c++)
        if (!active.has(posKey(r, c))) locked.add(posKey(r, c));
  }
  const startCell = ev.solution.length ? posKey(ev.solution[0][0], ev.solution[0][1]) : null;

  return (
    <>
      {playing && <Chrono left={ev.timeLeft} total={ev.seconds} />}
      {ev.id !== 'sage' && <p className="sage-ask target-word">« {ev.word} »</p>}
      <div className="sage-board">
        <Grid
          grid={ev.grid}
          onSubmit={submit}
          onPathChange={onPathChange}
          preview={traced ? { word: traced, score: 0, base: 0, parts: [], duplicate: false } : null}
          lockedCells={ev.dimmed ? locked : undefined}
          plain
          disabled={!playing}
          amorceCell={ev.hintGiven && playing ? startCell : null}
          highlightCells={!playing ? active : undefined}
        />
      </div>
      {playing && ev.hintGiven && <p className="muted small-hint">{say(EV[ev.id].hint)}</p>}
      {playing && ev.attempts > 0 && (
        <p className="ko small-hint">{say(ev.id === 'sage' ? scold(SCOLDS, ev.attempts) : EV[ev.id].wrong)}</p>
      )}
    </>
  );
}

// Partie de billes et concours de récitation : on ramasse des mots.
function Harvest({ ev }: { ev: HarvestEvent }) {
  const submit = useRunStore((s) => s.eventSubmit);
  const say = useSay();
  const stake = useRunStore((s) => s.eventStake);
  const purse = useRunStore((s) => s.run?.euros ?? 0);
  const [traced, setTraced] = useState('');
  const [rejected, setRejected] = useState<string | null>(null);
  const playing = ev.outcome === 'playing';
  const waiting = ev.id === 'billes' && ev.stake === null;

  const onPathChange = useCallback((p: Pos[]) => setTraced(wordFromPath(ev.grid, p)), [ev.grid]);
  const onSubmit = useCallback((p: Pos[]) => {
    const word = wordFromPath(ev.grid, p);
    if (word.length >= 3 && ev.search.words.has(word) && !ruleAccepts(ev.ruleId, word, dictionary)) setRejected(word);
    else setRejected(null);
    submit(p);
  }, [ev.grid, ev.search, ev.ruleId, submit]);

  if (waiting) {
    return (
      <div className="stakes">
        <p className="sage-ask">{say(EV.billes.ask())}</p>
        {ev.stakeOptions.length === 0
          ? <p className="ko">Tes poches sont vides. Reviens quand tu auras des billes.</p>
          : (
            <div className="row">
              {ev.stakeOptions.map((n) => (
                <button key={n} onClick={() => stake(n)} disabled={n > purse}>{money(n)}</button>
              ))}
            </div>
          )}
      </div>
    );
  }

  return (
    <>
      {playing && <Chrono left={ev.timeLeft} total={ev.seconds} />}
      <p className="sage-ask target-word">
        {ev.ruleId ? ruleLabel(ev.ruleId) : EV.billes.goal(ev.target)}
        <span className="harvest-count"> {ev.found.length}/{ev.target}</span>
      </p>
      <div className="sage-board">
        <Grid
          grid={ev.grid}
          onSubmit={onSubmit}
          onPathChange={onPathChange}
          preview={traced ? { word: traced, score: 0, base: 0, parts: [], duplicate: false } : null}
          plain
          disabled={!playing}
        />
      </div>
      {ev.found.length > 0 && <p className="muted small-hint">{ev.found.join(' · ')}</p>}
      {rejected && playing && <p className="ko small-hint">« {rejected} » ne respecte pas la consigne.</p>}
    </>
  );
}

// La réserve : une fourniture gratuite.
function Choice({ ev }: { ev: ChoiceEvent }) {
  const choose = useRunStore((s) => s.eventChoose);
  if (ev.outcome !== 'playing') return null;
  return (
    <div className="cards">
      {relics(ev.offers).map((r) => (
        <div key={r.id} className="shop-slot">
          <RelicCard relic={r} />
          <button className="buy" onClick={() => choose(r.id)}>{EV.reserve.take}</button>
        </div>
      ))}
    </div>
  );
}

export function EventScreen() {
  const ev = useRunStore((s) => s.event);
  const tick = useRunStore((s) => s.eventTick);
  const giveUp = useRunStore((s) => s.eventGiveUp);
  const leave = useRunStore((s) => s.leaveEvent);
  const start = useRunStore((s) => s.eventStart);
  const playing = ev?.outcome === 'playing';

  useEffect(() => {
    if (!playing || !ev || ev.seconds === 0) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (document.hidden) { last = now; return; } // le couloir attend, lui aussi
      tick((now - last) / 1000);
      last = now;
    }, 100);
    return () => clearInterval(id);
  }, [playing, ev, tick]);

  useEffect(() => {
    if (ev?.outcome === 'won') sfx.success();
    if (ev?.outcome === 'lost') sfx.fail();
  }, [ev?.outcome]);

  if (!ev) return null;
  const text = EV[ev.id];
  const say = useSay();
  const canGiveUp = playing && ev.kind !== 'choice' && !(ev.kind === 'harvest' && ev.stake === null);

  // La scène d'abord, en grand. Le défi ne commence qu'au clic.
  if (!ev.started) {
    return (
      <div className="panel pick event-intro">
        <div className="frame event-hero"><EventArt id={ev.id} /></div>
        <h2>{text.title}</h2>
        <div className="intro-text">
          {text.intro.map((l, i) => <p key={l} style={{ animationDelay: `${(0.1 + i * 0.55).toFixed(2)}s` }}>{say(l)}</p>)}
        </div>
        <p className="sage-ask">
          {ev.kind === 'hunt' ? say(EV[ev.id].ask(ev.word.length)) : ''}
          {ev.kind === 'choice' ? say(EV.reserve.ask()) : ''}
          {ev.kind === 'harvest' ? say(ev.id === 'billes' ? EV.billes.ask() : ruleLabel(ev.ruleId ?? '')) : ''}
        </p>
        <button className="ready-cta" onClick={start}>{say(text.start)}</button>
      </div>
    );
  }

  return (
    <div className="panel pick sage">
      <div className="sage-head compact">
        <div className="frame sage-frame"><EventArt id={ev.id} /></div>
        <div className="sage-speech">
          <h2>{text.title}</h2>
          {ev.kind === 'hunt' && <p className="sage-ask">{say(EV[ev.id].ask(ev.word.length))}</p>}
          {ev.kind === 'choice' && <p className="sage-ask">{say(EV.reserve.ask())}</p>}
        </div>
      </div>

      {ev.kind === 'hunt' && <Hunt ev={ev} />}
      {ev.kind === 'harvest' && <Harvest ev={ev} />}
      {ev.kind === 'choice' && <Choice ev={ev} />}

      {ev.outcome !== 'playing' && (
        <div className={`sage-outcome ${ev.outcome === 'won' ? 'ok' : 'ko'}`}>
          {ev.kind === 'hunt' && <p className="big">{ev.word}</p>}
          <p>{say(ev.outcome === 'won' ? text.won : text.lost)}</p>
          <p className="sage-ask">{say(ev.outcome === 'won' ? text.wonSub : text.lostSub)}</p>
          {ev.extraLife && <p className="ok">★ Un bon point de plus au tableau.</p>}
          {ev.reward !== 0 && <p className="euros">{ev.reward > 0 ? '+' : ''}{money(ev.reward)}</p>}
        </div>
      )}

      <div className="row">
        {canGiveUp
          ? <button className="secondary" onClick={giveUp}>{say(text.giveUp)}</button>
          : ev.outcome !== 'playing' && <button onClick={leave}>{say(text.leave)}</button>}
      </div>
    </div>
  );
}
