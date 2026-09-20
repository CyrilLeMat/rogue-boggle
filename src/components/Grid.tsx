import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { sfx } from '../audio/sfx';
import { areAdjacent, posKey } from '../engine/adjacency';
import { LETTER_VALUES } from '../engine/gridGenerator';
import type { Enemy } from '../engine/hooks';
import type { Grid as GridModel, Pos } from '../engine/types';
import type { WordPreview } from '../state/runStore';
import { scoreTier } from '../theme/intensity';

// couleur de case = palier de valeur de la lettre (1 / 2-3 / 4 / 8+)
const valueTier = (letter: string) => {
  const v = LETTER_VALUES[letter] ?? 1;
  return v >= 8 ? 'val-8' : v >= 4 ? 'val-4' : v >= 2 ? 'val-2' : 'val-1';
};

interface Props {
  grid: GridModel;
  onSubmit(path: Pos[]): void;
  disabled?: boolean;
  highlightCells?: Set<number>;          // Mémoire
  oracleCell?: number | null;            // Oracle : première lettre du mot le plus long
  oracleLength?: number;
  cursedCell?: number | null;            // Mot maudit : première lettre du mot désigné
  luckyLetter?: string | null;           // Lettre porte-bonheur : toutes ses cases
  amorceCell?: number | null;            // Amorce sûre : case de départ du mot amorcé
  inspiredCells?: Set<number>;           // Inspiration : cases du mot le plus long
  blurRadius?: number;                   // Vision trouble : flou au-delà de ce rayon autour du curseur
  targeting?: boolean;                   // consommable ciblé : un clic choisit une case au lieu de tracer
  onPickCell?: (pos: Pos) => void;
  critters?: Pos[];                      // les escargots, rendus en overlay pour glisser d'une case à l'autre
  onDoubleTap?: (pos: Pos) => void;      // Reroll de lettre sans passer par le bouton
  enemies?: Enemy[];                     // thème Chasse : cases occupées + barre de PV
  onPathChange?: (path: Pos[]) => void;  // pour la prévisualisation du score
  preview?: WordPreview | null;
  flash?: { id: number; path: Pos[]; score: number; bonus?: string; word?: string } | null; // dernier mot validé : lettres qui s'allument, score qui s'envole
  lockedCells?: Set<number>;             // Sage : cases grisées, hors du tracé
  plain?: boolean;                       // Sage : ni couleur par valeur ni chiffre (pas de score ici)
}

const DOUBLE_TAP_MS = 350;

const samePos = (a: Pos, b: Pos) => a[0] === b[0] && a[1] === b[1];

export function Grid({ grid, onSubmit, disabled, highlightCells, oracleCell, oracleLength, cursedCell, luckyLetter, amorceCell, inspiredCells, blurRadius, targeting, onPickCell, critters = [], onDoubleTap, enemies = [], onPathChange, preview, flash, lockedCells, plain }: Props) {
  const isLocked = (r: number, c: number) => lockedCells?.has(posKey(r, c)) ?? false;
  const enemyAt = (r: number, c: number) => enemies.find((e) => e.hp > 0 && e.cells.some((p) => p[0] === r && p[1] === c));
  const [path, setPathState] = useState<Pos[]>([]);
  const lastTap = useRef<{ pos: Pos; at: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Pos | null>(null);
  const dragging = useRef(false);
  // La ref est la source de vérité : plusieurs événements souris peuvent arriver
  // avant un rendu, l'état React sert uniquement à l'affichage.
  const pathRef = useRef<Pos[]>([]);
  const setPath = (p: Pos[]) => { pathRef.current = p; setPathState(p); onPathChange?.(p); };

  const finish = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    const p = pathRef.current;
    pathRef.current = [];
    setPathState([]);
    onPathChange?.([]);
    if (p.length > 1) onSubmit(p); // un tap simple sur une case ne soumet rien
  }, [onSubmit, onPathChange]);

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
    if (disabled || isLocked(pos[0], pos[1])) return;
    dragging.current = true;
    setPath([pos]);
    sfx.select(0);
  };

  const enter = (pos: Pos) => {
    if (!dragging.current) return;
    const p = pathRef.current;
    const last = p[p.length - 1];
    if (!last) return;
    if (samePos(last, pos)) return;
    if (isLocked(pos[0], pos[1])) return;
    if (p.length >= 2 && samePos(p[p.length - 2], pos)) { setPath(p.slice(0, -1)); sfx.unselect(); return; }
    if (p.some((q) => samePos(q, pos))) return;
    if (!areAdjacent(last, pos)) return;
    setPath([...p, pos]);
    sfx.select(p.length);
  };

  const inPath = (r: number, c: number) => path.findIndex((p) => p[0] === r && p[1] === c);
  const word = path.map(([r, c]) => (grid.cells[r][c].isJoker ? '?' : grid.cells[r][c].letter)).join('');
  const cellPct = 100 / grid.size;
  const flashIndex = (r: number, c: number) => flash?.path.findIndex((p) => p[0] === r && p[1] === c) ?? -1;
  const flashLast = flash?.path[flash.path.length - 1];
  const tier = flash ? scoreTier(flash.score) : 0;
  const state = path.length < 2 ? 'idle' : !preview || preview.word === null ? 'unknown' : preview.duplicate ? 'dup' : 'ok';

  // La feuille encaisse le coup : plus le mot est gros, plus elle tremble.
  useEffect(() => {
    const el = gridRef.current;
    if (!flash || tier < 3 || !el?.animate) return;
    const a = tier === 3 ? 4 : tier === 4 ? 8 : 13;
    el.animate(
      [
        { transform: 'translate(0,0)' },
        { transform: `translate(${a}px, ${-a * 0.6}px)` },
        { transform: `translate(${-a}px, ${a * 0.5}px)` },
        { transform: `translate(${a * 0.5}px, ${a * 0.4}px)` },
        { transform: 'translate(0,0)' },
      ],
      { duration: 130 + tier * 55, easing: 'ease-out' },
    );
  }, [flash?.id, tier]);

  return (
    <div className="grid-wrap">
      <div className={`current-word ${state}`}>
        <span className="cw-word">{state === 'ok' && preview?.word ? preview.word : word || ' '}</span>
        {state === 'ok' && preview && preview.score > 0 && (
          <span className="cw-score">
            <span className="cw-total">+{preview.score}</span>
            <span className="cw-parts">{preview.parts.map((p) => <span key={p.label} className={`cw-part ${p.label}`}>{p.value} <small>{p.label}</small></span>)}</span>
          </span>
        )}
        {state === 'dup' && <span className="cw-note">déjà trouvé</span>}
        {state === 'unknown' && word.length >= 3 && <span className="cw-note">…</span>}
      </div>
      <div
        ref={gridRef}
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
        {flash && flashLast && tier >= 3 && (
          <svg key={`lines-${flash.id}`} className="speed-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const cx = (flashLast[1] + 0.5) * cellPct;
              const cy = (flashLast[0] + 0.5) * cellPct;
              return (
                <line key={i}
                  x1={cx + Math.cos(a) * 12} y1={cy + Math.sin(a) * 12}
                  x2={cx + Math.cos(a) * (26 + tier * 7)} y2={cy + Math.sin(a) * (26 + tier * 7)}
                  stroke="var(--coral)" strokeWidth={tier >= 5 ? 2.4 : 1.6} strokeLinecap="round"
                />
              );
            })}
          </svg>
        )}
        {flash && tier >= 4 && flash.word && (
          <div key={`blast-${flash.id}`} className={`word-blast t${tier}`}>{flash.word}</div>
        )}
        {flash && tier >= 5 && <div key={`white-${flash.id}`} className="grid-whiteout" />}
        {flash && flashLast && (
          <div
            key={`pop-${flash.id}`}
            className={`score-pop t${tier}`}
            style={{ left: `${(flashLast[1] + 0.5) * cellPct}%`, top: `${(flashLast[0] + 0.5) * cellPct}%` }}
          >
            +{flash.score}
            {flash.bonus && <small>{flash.bonus}</small>}
          </div>
        )}
        {grid.cells.map((row, r) =>
          row.map((cell, c) => {
            const idx = inPath(r, c);
            const fi = flashIndex(r, c);
            const key = posKey(r, c);
            const cls = [
              'cell',
              !cell.isJoker && !plain && valueTier(cell.letter),
              isLocked(r, c) && (cell.hole ? 'hole' : 'dim'),
              idx >= 0 && 'selected',
              idx === path.length - 1 && idx >= 0 && 'head',
              cell.isJoker && 'joker',
              cell.isToxic && 'toxic',
              highlightCells?.has(key) && 'used',
              amorceCell === key && 'amorce',
              luckyLetter && !cell.isJoker && cell.letter[0] === luckyLetter && 'lucky',
              inspiredCells?.has(key) && 'inspired',
              (cell.cracks ?? 0) > 0 && 'cracked',
              (cell.gen ?? 0) > 0 && 'fresh',
              enemyAt(r, c) && 'enemy',
              isBlurred(r, c) && 'blurred',
            ].filter(Boolean).join(' ');
            return (
              <div key={`${r}-${c}-${cell.gen ?? 0}`} className={cls} data-pos={`${r}-${c}`}>
                <span className="letter">{cell.isJoker ? '★' : cell.letter}</span>
                {!plain && !cell.isJoker && (LETTER_VALUES[cell.letter] ?? 1) >= 2 && <span className="value">{LETTER_VALUES[cell.letter]}</span>}
                {fi >= 0 && flash && <span key={`flash-${flash.id}`} className="flash-ring" style={{ animationDelay: `${fi * 45}ms` }} />}
                {cell.isToxic && <span className="badge badge-toxic" title="Case toxique : −8 s si utilisée">☠</span>}
                {oracleCell === key && <span className="badge badge-oracle" title="Oracle : ici commence le mot le plus long">{oracleLength}</span>}
                {cursedCell === key && <span className="badge badge-cursed" title="Mot maudit : il commence ici">✦</span>}
                {(() => { const e = enemyAt(r, c); return e && e.cells[0][0] === r && e.cells[0][1] === c ? (
                  <span className="enemy-tag" title={`${e.hp} / ${e.maxHp} PV`}>
                    <span className="enemy-icon">👾</span>
                    <span className="hp"><span style={{ width: `${(e.hp / e.maxHp) * 100}%` }} /></span>
                    <span className="hp-text">{e.hp}</span>
                  </span>
                ) : null; })()}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
