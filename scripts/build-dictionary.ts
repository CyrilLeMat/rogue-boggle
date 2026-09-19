import { readFileSync, writeFileSync } from 'node:fs';

// Lexique383 → src/data/dictionnaire_fr.json
// Sortie : [{ w, c, f }] — w = forme normalisée (majuscules, sans diacritiques),
// c = catégories grammaticales, f = mot "courant" (freqfilms2 ≥ SEUIL_COURANT)

const INPUT = 'scripts/raw/Lexique383.tsv';
const OUTPUT = 'src/data/dictionnaire_fr.json';
const SEUIL_COURANT = 3.0;

type Cat = 'NOM' | 'VER' | 'ADJ' | 'ADV' | 'AUTRE';

function toCat(cgram: string): Cat {
  const base = cgram.split(':')[0];
  if (base === 'NOM' || base === 'VER' || base === 'ADJ' || base === 'ADV') return base;
  if (base === 'AUX') return 'VER';
  return 'AUTRE';
}

function normalize(ortho: string): string | null {
  const s = ortho
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .toUpperCase();
  if (!/^[A-Z]+$/.test(s)) return null;
  if (s.length < 3) return null;
  return s;
}

const lines = readFileSync(INPUT, 'utf8').split('\n');
const header = lines[0].split('\t');
const col = (name: string) => {
  const i = header.indexOf(name);
  if (i < 0) throw new Error(`colonne manquante: ${name}`);
  return i;
};
const iOrtho = col('ortho');
const iCgram = col('cgram');
const iFreq = col('freqfilms2');

const entries = new Map<string, { cats: Set<Cat>; freq: number }>();
let skipped = 0;

for (let i = 1; i < lines.length; i++) {
  const row = lines[i].split('\t');
  if (row.length < 3) continue;
  const w = normalize(row[iOrtho]);
  if (!w) { skipped++; continue; }
  const cat = toCat(row[iCgram] ?? '');
  const freq = parseFloat(row[iFreq]) || 0;
  const e = entries.get(w);
  if (e) {
    e.cats.add(cat);
    e.freq = Math.max(e.freq, freq);
  } else {
    entries.set(w, { cats: new Set([cat]), freq });
  }
}

const out = [...entries.entries()]
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([w, { cats, freq }]) => ({ w, c: [...cats].sort(), f: freq >= SEUIL_COURANT }));

writeFileSync(OUTPUT, JSON.stringify(out));

const courant = out.filter((e) => e.f).length;
const byCat: Record<string, number> = {};
for (const e of out) for (const c of e.c) byCat[c] = (byCat[c] ?? 0) + 1;
console.log(`lignes lues: ${lines.length - 1}, ignorées: ${skipped}`);
console.log(`mots uniques: ${out.length}, courants: ${courant}`);
console.log('par catégorie:', byCat);
