import type { Dictionary } from './dictionary';
import type { MancheView, Relic, RunContext, RunView } from './hooks';
import type { FoundWord } from './manche';
import type { Rng } from './rng';
import type { ScoreModifier } from './scoring';
import type { Grid } from './types';

export const TOXIC_PENALTY_SECONDS = 8;

// Construit un contexte dont les mutations (chrono, état relic) s'appliquent sur `manche` en place.
export function makeContext(rng: Rng, run: RunView, manche: MancheView, dict: Dictionary): RunContext {
  return {
    rng,
    run,
    manche,
    timer: {
      add: (s) => { manche.timeLeft = Math.max(0, manche.timeLeft + s); },
      setMin: (s) => { manche.timeLeft = Math.max(manche.timeLeft, s); },
    },
    addBonus: (label, points) => { manche.bonuses.push({ label, points }); },
    categoriesOf: (w) => dict.categoriesOf(w),
    isCommon: (w) => dict.common.has(w),
    hasRelic: (id) => run.relicIds.includes(id),
  };
}

export function collectModifiers(word: string, relics: Relic[], ctx: RunContext, extra: ScoreModifier[] = []): ScoreModifier[] {
  const mods: ScoreModifier[] = [...extra];
  for (const r of relics) {
    const m = r.onWordFound?.(word, ctx);
    if (m) mods.push(m);
  }
  return mods;
}

// Effets de bord après acceptation : cases toxiques, puis hooks des relics.
export function runWordAccepted(found: FoundWord, relics: Relic[], ctx: RunContext) {
  ctx.manche.timeLeftBeforeWord = ctx.manche.timeLeft;
  for (const [r, c] of found.path) {
    const cell = ctx.manche.grid.cells[r][c];
    if (!cell.isToxic) continue;
    const neutralized = relics.some((rel) => rel.onCellUsed?.(cell, ctx) === 'neutralize');
    if (!neutralized) ctx.timer.add(-TOXIC_PENALTY_SECONDS);
  }
  for (const r of relics) r.onWordAccepted?.(found, ctx);
}

export function runInvalidWord(relics: Relic[], ctx: RunContext) {
  for (const r of relics) r.onInvalidWord?.(ctx);
}

export function mancheSeconds(base: number, relics: Relic[]): number {
  return Math.max(10, relics.reduce((s, r) => (r.mancheSeconds ? r.mancheSeconds(s) : s), base));
}

export function runGridGenerate(grid: Grid, relics: Relic[], ctx: RunContext): Grid {
  return relics.reduce((g, r) => (r.onGridGenerate ? r.onGridGenerate(g, ctx) : g), grid);
}

export function runMancheStart(relics: Relic[], ctx: RunContext) {
  for (const r of relics) r.onMancheStart?.(ctx);
}

export function runMancheEnd(relics: Relic[], ctx: RunContext, success: boolean, euros: number): number {
  return relics.reduce((e, r) => (r.onMancheEnd ? r.onMancheEnd(ctx, success, e) : e), euros);
}

export function runRunEnd(relics: Relic[], ctx: RunContext): number {
  return relics.reduce((bonus, r) => bonus + (r.onRunEnd?.(ctx) ?? 0), 0);
}

export function jokerMinLength(relics: readonly Relic[], base: number, floor: number): number {
  return relics.some((r) => r.jokerFree) ? floor : base;
}

export function streakRules(relics: Relic[], base: { window: number; maxLinks: number; step: number }) {
  return relics.reduce((acc, r) => ({
    window: Math.max(acc.window, r.streakWindow ?? 0),
    maxLinks: Math.max(acc.maxLinks, r.streakMaxLinks ?? 0),
    step: Math.max(acc.step, r.streakStep ?? 0),
  }), base);
}

export const thresholdMultiplier = (relics: Relic[]) => relics.reduce((m, r) => m * (r.thresholdMult ?? 1), 1);
export const eurosMultiplier = (relics: Relic[]) => relics.reduce((m, r) => m * (r.eurosMult ?? 1), 1);
export const extraLives = (relics: Relic[]) => relics.reduce((n, r) => n + (r.extraLives ?? 0), 0);

export function uiFlags(relics: Relic[]) {
  return relics.reduce((acc, r) => ({ ...acc, ...r.ui }), {} as NonNullable<Relic['ui']>);
}
