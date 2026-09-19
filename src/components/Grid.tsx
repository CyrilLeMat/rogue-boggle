import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { sfx } from '../audio/sfx';
import { areAdjacent, posKey } from '../engine/adjacency';
import type { Grid as GridModel, Pos } from '../engine/types';

interface Props {
  grid: GridModel;
  onSubmit(path: Pos[]): void;
  disabled?: boolean;
  highlightCells?: Set<number>;          // Mémoire
  radarCell?: number | null;             // Radar
  oracleCell?: number | null;            // Oracle : première lettre du mot le plus long
  oracleLength?: number;
  cursedCell?: number | null;            // Mot maudit : première lettre du mot désigné
  luckyLetter?: string | null;           // Lettre porte-bonheur : toutes ses cases
  inspiredCells?: Set<number>;           // Inspiration : cases du mot le plus long
  hintsFor?: (pos: Pos) => string[];     // Dictionnaire vivant (appui long)
  blurRadius?: number;                   // Vision trouble : flou au-delà de ce rayon autour du curseur
  targeting?: boolean;                   // consommable ciblé : un clic choisit une case au lieu de tracer
  onPickCell?: (pos: Pos) => void;
  critters?: Pos[];                      // les escargots, rendus en overlay pour glisser d'une case à l'autre
  onDoubleTap?: (pos: Pos) => void;      // Reroll de lettre sans passer par le bouton
}

const DOUBLE_TAP_MS = 350;

const samePos = (a: Pos, b: Pos) => a[0] === b[0] && a[1] === b[1];
const LONG_PRESS_MS = 500;

export function Grid({ grid, onSubmit, disabled, highlightCells, radarCell, oracleCell, oracleLength, cursedCell, luckyLetter, inspiredCells, hintsFor, blurRadius, targeting, onPickCell, critters = [], onDoubleTap }: Props) {
  const [path, setPathState] = useState<Pos[]>([]);
  const lastTap = useRef<{ pos: Pos; at: number } | null>(null);
  const [hover, setHover] = useState<Pos | null>(null);
  const [hint, setHint] = useState<{ pos: Pos; words: string[] } | null>(null);
  const dragging = useRef(false);
  const pressTimer = useRef<number | null>(null);
  // La ref est la source de vérité : plusieurs événements souris peuvent arriver
  // avant un rendu, l'état React sert uniquement à l'affichage.
  const pathRef = useRef<Pos[]>([]);
  const setPath = (p: Pos[]) => { pathRef.current = p; setPathState(p); };

  const clearPress = () => {
    if (pressTimer.current !== null) { window.clearTimeout(pressTimer.current); pressTimer.current = null; }
  };

  const finish = useCallback(() => {
    clearPress();
    if (!dragging.current) return;
    dragging.current = false;
    const p = pathRef.current;
    pathRef.current = [];
    setPathState([]);
    if (hint) { setHint(null); return; }
    if (p.length > 1) onSubmit(p); // un tap simple sur une case ne soumet rien
  }, [onSubmit, hint]);

  useEffect(() => {
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    return () => {
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
    };
  }, [finish]);

  // Souris et tactile passent par les pointer events ; on retrouve la case sous le doigt
  // avec elementFromPoint car le doigt ne déclenche pas pointerenter sur les autres cases.
  const cellAt = (x: number, y: number): Pos | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('.cell');
    if (!el || !el.dataset.pos) return null;
    const [r, c] = el.dataset.pos.split('-').map(Number);
    return [r, c];
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    const pos = cellAt(e.clientX, e.clientY);
    if (!pos) return;
    if (targeting) { onPickCell?.(pos); return; }
    const now = performance.now();
    const prev = lastTap.current;
    lastTap.current = { pos, at: now };
    if (onDoubleTap && prev && samePos(prev.pos, pos) && now - prev.at < DOUBLE_TAP_MS) {
      lastTap.current = null;
      onDoubleTap(pos);
      return;
    }
    start(pos);
  };

  const onPointerMove = (e: PointerEvent) => {
    const pos = cellAt(e.clientX, e.clientY);
    if (blurRadius !== undefined && pos && (!hover || !samePos(hover, pos))) setHover(pos);
    if (!dragging.current) return;
    if (pos) enter(pos);
  };

  const focus = path.length ? path[path.length - 1] : hover;
  const isBlurred = (r: number, c: number) =>
    blurRadius !== undefined && (!focus || Math.max(Math.abs(focus[0] - r), Math.abs(focus[1] - c)) > blurRadius);

  const start = (pos: Pos) => {
    if (disabled) return;
    dragging.current = true;
    setHint(null);
    setPath([pos]);
    sfx.select(0);
    if (hintsFor) {
      pressTimer.current = window.setTimeout(() => {
        if (dragging.current && pathRef.current.length === 1) setHint({ pos, words: hintsFor(pos) });
      }, LONG_PRESS_MS);
    }
  };

  const enter = (pos: Pos) => {
    if (!dragging.current) return;
    const p = pathRef.current;
    const last = p[p.length - 1];
    if (!last) return;
    if (samePos(last, pos)) return;
    clearPress();
    if (p.length >= 2 && samePos(p[p.length - 2], pos)) { setPath(p.slice(0, -1)); sfx.unselect(); return; }
    if (p.some((q) => samePos(q, pos))) return;
    if (!areAdjacent(last, pos)) return;
    setPath([...p, pos]);
    sfx.select(p.length);
  };

  const inPath = (r: number, c: number) => path.findIndex((p) => p[0] === r && p[1] === c);
  const word = path.map(([r, c]) => (grid.cells[r][c].isJoker ? '?' : grid.cells[r][c].letter)).join('');
  const cellPct = 100 / grid.size;

  return (
    <div className="grid-wrap">
      <div className="current-word">{word || ' '}</div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid.size}, 1fr)`,
          gap: grid.size >= 6 ? 6 : 10,
          // la lettre suit la taille de la case (utile en 6×6 / 7×7 sur téléphone), plafonnée à 2rem
          fontSize: `min(2rem, calc(min(480px, 100vw - 20px) / ${grid.size} * 0.36))`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
        data-targeting={targeting ? 'true' : undefined}
      >
        {critters.map((c, i) => (
          <div
            key={i}
            className="critter"
            style={{ left: `${(c[1] + 0.8) * cellPct}%`, top: `${(c[0] + 0.22) * cellPct}%` }}
            aria-label="escargot"
          >
            🐌
          </div>
        ))}
        <svg className="grid-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {path.length > 1 && (
            <polyline
              points={path.map(([r, c]) => `${(c + 0.5) * cellPct},${(r + 0.5) * cellPct}`).join(' ')}
              fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
            />
          )}
        </svg>
        {grid.cells.map((row, r) =>
          row.map((cell, c) => {
            const idx = inPath(r, c);
            const key = posKey(r, c);
            const cls = [
              'cell',
              idx >= 0 && 'selected',
              idx === path.length - 1 && idx >= 0 && 'head',
              cell.isJoker && 'joker',
              cell.isToxic && 'toxic',
              highlightCells?.has(key) && 'used',
              radarCell === key && 'radar',
              oracleCell === key && 'oracle',
              cursedCell === key && 'cursed',
              luckyLetter && !cell.isJoker && cell.letter[0] === luckyLetter && 'lucky',
              inspiredCells?.has(key) && 'inspired',
              (cell.cracks ?? 0) > 0 && 'cracked',
              (cell.gen ?? 0) > 0 && 'fresh',
              isBlurred(r, c) && 'blurred',
            ].filter(Boolean).join(' ');
            return (
              <div key={`${r}-${c}-${cell.gen ?? 0}`} className={cls} data-pos={`${r}-${c}`}>
                <span className="letter">{cell.isJoker ? '★' : cell.letter}</span>
                {cell.isToxic && <span className="badge badge-toxic" title="Case toxique : −8 s si utilisée">☠</span>}
                {oracleCell === key && <span className="badge badge-oracle" title="Oracle : ici commence le mot le plus long">{oracleLength}</span>}
                {cursedCell === key && <span className="badge badge-cursed" title="Mot maudit : il commence ici">✦</span>}
                {luckyLetter && !cell.isJoker && cell.letter[0] === luckyLetter && <span className="badge badge-lucky">♣</span>}
                {hint && samePos(hint.pos, [r, c]) && (
                  <div className="hint">{hint.words.length ? hint.words.join(' · ') : 'rien'}</div>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
