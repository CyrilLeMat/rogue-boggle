import type { Relic } from '../engine/hooks';
import type { Rng } from '../engine/rng';

// Charmes : petits achats à 5-8 €, générés à la volée depuis des gabarits, empilables.
// L'id encode le gabarit et son paramètre (charme-lettre-E) pour être reconstruit sans état.

const LETTERS = ['E', 'A', 'I', 'S', 'N', 'R', 'T', 'O', 'U', 'L'];
const FINALS = ['S', 'E', 'T', 'R'];
const CATEGORIES: Record<string, string> = { NOM: 'les noms', VER: 'les verbes', ADJ: 'les adjectifs' };

interface Template {
  kind: string;
  params: string[];
  make: (param: string) => Relic;
}

const base = (id: string, name: string, description: string, price: number, extra: Partial<Relic>): Relic => ({
  id, name, description, price, rarity: 'common', charm: true, stackable: true, ...extra,
});

const TEMPLATES: Template[] = [
  {
    kind: 'lettre', params: LETTERS,
    make: (l) => base(`charme-lettre-${l}`, `Gommette ${l}`, `+10 % sur les mots contenant un ${l}`, 8,
      { onWordFound: (w) => (w.includes(l) ? { percent: 0.1 } : undefined) }),
  },
  {
    kind: 'longueur', params: ['3', '4', '5'],
    make: (n) => base(`charme-longueur-${n}`, `Gommette ${n} lettres`, `+15 % sur les mots de ${n} lettres`, 8,
      { onWordFound: (w) => (w.length === Number(n) ? { percent: 0.15 } : undefined) }),
  },
  {
    kind: 'categorie', params: Object.keys(CATEGORIES),
    make: (c) => base(`charme-categorie-${c}`, `Gommette ${CATEGORIES[c]}`, `+10 % sur ${CATEGORIES[c]}`, 9,
      { onWordFound: (w, ctx) => (ctx.categoriesOf(w).has(c as 'NOM') ? { percent: 0.1 } : undefined) }),
  },
  {
    kind: 'finale', params: FINALS,
    make: (l) => base(`charme-finale-${l}`, `Gommette finale ${l}`, `+10 % sur les mots finissant par ${l}`, 8,
      { onWordFound: (w) => (w.endsWith(l) ? { percent: 0.1 } : undefined) }),
  },
  {
    kind: 'initiale', params: ['voyelle', 'consonne'],
    make: (k) => base(`charme-initiale-${k}`, `Gommette ${k}`, `+10 % sur les mots commençant par une ${k}`, 8,
      { onWordFound: (w) => ('AEIOUY'.includes(w[0]) === (k === 'voyelle') ? { percent: 0.1 } : undefined) }),
  },
  {
    kind: 'plat', params: ['1'],
    make: () => base('charme-plat-1', 'Gommette +1', '+1 pt sur chaque mot', 9, { onWordFound: () => ({ flat: 1 }) }),
  },
  {
    kind: 'chrono', params: ['3'],
    make: () => base('charme-chrono-3', 'Gommette 3 s', '+3 s de chrono à chaque dictée', 9, { mancheSeconds: (s) => s + 3 }),
  },
  {
    kind: 'long', params: ['6'],
    make: () => base('charme-long-6', 'Gommette longueur', '+20 % sur les mots de 6 lettres ou plus', 12,
      { onWordFound: (w) => (w.length >= 6 ? { percent: 0.2 } : undefined) }),
  },
];

export function randomCharm(rng: Rng): Relic {
  const t = rng.pick(TEMPLATES);
  return t.make(rng.pick(t.params));
}

export function charmFromId(id: string): Relic | null {
  const m = /^charme-([a-z]+)-(.+)$/.exec(id);
  if (!m) return null;
  const t = TEMPLATES.find((x) => x.kind === m[1]);
  if (!t || !t.params.includes(m[2])) return null;
  return t.make(m[2]);
}

export const isCharmId = (id: string) => id.startsWith('charme-');
