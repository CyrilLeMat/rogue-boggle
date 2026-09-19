import type { Grid, Pos } from '../engine/types';

// Grille en lecture seule pour le récap : montre où était chaque lettre et, au choix, le chemin d'un mot.
export function MiniGrid({ grid, path }: { grid: Grid; path: Pos[] | null }) {
  const order = new Map<string, number>();
  path?.forEach(([r, c], i) => order.set(`${r}-${c}`, i + 1));
  const cellPct = 100 / grid.size;
  return (
    <div className="mini-grid" style={{ gridTemplateColumns: `repeat(${grid.size}, 1fr)` }}>
      {path && path.length > 1 && (
        <svg className="grid-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            points={path.map(([r, c]) => `${(c + 0.5) * cellPct},${(r + 0.5) * cellPct}`).join(' ')}
            fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"
          />
        </svg>
      )}
      {grid.cells.map((row, r) =>
        row.map((cell, c) => {
          const n = order.get(`${r}-${c}`);
          return (
            <div key={`${r}-${c}`} className={`mini-cell ${n ? 'on' : ''} ${cell.isToxic ? 'toxic' : ''}`}>
              {cell.isJoker ? '★' : cell.letter}
              {n && <span className="mini-order">{n}</span>}
            </div>
          );
        }),
      )}
    </div>
  );
}
