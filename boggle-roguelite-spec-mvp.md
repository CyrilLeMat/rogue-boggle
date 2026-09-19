# Boggle Roguelite — Spécification MVP (v2, décisions figées)

Document de référence pour le développement du MVP. Toutes les décisions de design et d'architecture actées sont figées ici. Les valeurs numériques marquées **[tuning]** sont des valeurs de départ à ajuster en playtest, pas des points ouverts : le dev les prend telles quelles.

---

## 1. Vision du jeu

Boggle roguelite solo, jouable sur Mac (application web packagée). Le joueur enchaîne **10 manches** de Boggle (trouver des mots dans une grille de lettres adjacentes, minimum 3 lettres), avec un score cumulé, un seuil de score progressif à atteindre par manche, 3 vies, et une boutique entre chaque manche pour acheter des relics/consommables/malédictions avec une monnaie séparée (« euros »).

Le contenu est volontairement large et déséquilibré : la run doit être chaotique. On ne cherche pas l'équilibre au MVP.

**Couche optionnelle : les ennemis.** Certains mutateurs et malédictions posent des ennemis sur la grille. Un mot tracé à travers un ennemi lui inflige son score en dégâts ; le tuer rapporte des euros. Le seuil de score reste la condition de réussite, les ennemis sont une prise de risque (section 7.5).

Pas de meta-progression inter-run au MVP (tout le contenu est disponible dès la run 1). Prévu en v2.

---

## 2. Stack technique

| Brique | Choix |
|---|---|
| Langage | TypeScript |
| Framework | React + Vite |
| State management | Zustand |
| Rendu grille | DOM (CSS Grid) + Framer Motion pour animations |
| Packaging desktop | Tauri v2 (framework) — phase 2 du projet, le MVP tourne en navigateur |
| Dictionnaire | Lexique383, formes fléchies incluses, filtré min. 3 lettres |
| Aléatoire | RNG seedé (ex. `seedrandom` ou mulberry32) partout dans le moteur |

---

## 3. Règles de jeu — MVP (figées)

### 3.1 Boucle

- **Taille de grille** : elle grandit avec la run **[tuning]** : manches 1-2 en **4×4**, 3-5 en **5×5**, 6-10 en **6×6**. Le **7×7 est l'exception**, pas le trajet normal : il n'arrive que par la condition « Grille géante ». La référence de difficulté (3.1.1) est propre à chaque taille, donc le seuil reste comparable ; une grande grille offre plus de choix, pas plus de points gratuits. Lettres et espacement s'adaptent pour tenir sur un téléphone.
- **Chrono** : 90 s en 4×4, **+15 s par palier de taille** (105 s en 5×5, 120 s en 6×6, 135 s en 7×7) **[tuning]**. Après une vie perdue, la manche suivante offre **+10 s de répit** (filet anti-spirale).
- **Écran « prêt »** entre la boutique et la manche : grille visible mais floutée, résumé (seuil, humeur, objectif, chrono), le chrono démarre au premier toucher.
- **Run** : 10 manches. Manche 10 réussie → écran de félicitations (score final, relics, mots marquants). Pas de mode endless au MVP.
- **Vies** : 3. Seuil non atteint à la fin du chrono → -1 vie, **on passe quand même à la manche suivante**. 0 vie → game over.
- **Seuil** : porte sur le **score de la manche** (pas le cumul). Courbe de base `seuil(n) = 60 × 1.25^(n-1)` **[tuning]** → 60, 80, 90, 120, 150, 180, 230, 290, 360, 450 (×1.2 s'est révélé trivial en fin de run une fois les multiplicateurs empilés), puis **ajustée à la difficulté de la grille** (3.1.1) et arrondie à la dizaine.

**Pourquoi ×1.2** : simulation de 150 runs par profil (`scripts/sim-runs.ts`). Un humain trouve un nombre à peu près constant de mots par manche (12-15 pour un joueur moyen, ~90 pts), donc une courbe exponentielle rapide exige des relics un multiplicateur énorme (×7 à la manche 10 avec ×1.3). Avec ×1.2 et le chrono par taille, un bon joueur finit la run sans relic une fois sur deux, un joueur moyen atteint la manche 6-7 et a besoin de la boutique : c'est le bon endroit pour les relics.

#### 3.1.1 Difficulté de grille et seuil ajusté

Mesuré : entre une grille faible (p10) et une grille riche (p90), le potentiel varie d'un facteur ~3. Un seuil fixe ferait perdre des vies sur le tirage.

Mot **courant** = fréquence films ≥ **3 par million** (9 722 mots ; à 1/million, « duce » passait pour courant).

- **Potentiel** d'une grille = score cumulé de ses **25 meilleurs mots courants** (flag `f` du dictionnaire). C'est ce qu'un bon joueur trace réellement en 90 s ; la métrique ignore les formes obscures.
- **Référence** = médiane mesurée sur 500 grilles à poids standards (`scripts/bench-difficulty.ts`) : 4×4 → 190, 5×5 → 349, 6×6 → 452, 7×7 → 562. À remesurer si les poids ou le dictionnaire changent.
- **Facteur** = potentiel / référence, borné à **[0.7, 1.3]**. `seuil ajusté = arrondi10(seuil(n) × facteur)`.
- **Humeur affichée** au joueur : facteur ≥ 1.12 → « généreuse », ≤ 0.88 → « aride », sinon « normale ». Visible dans le tableau de bord et le récap.
- Le potentiel est calculé sur la **grille brute**, avant les `onGridGenerate` des relics (jokers) : améliorer sa grille ne doit jamais durcir le seuil. Les mutateurs (taille, pondération) sont en revanche pris en compte via la référence de leur taille.
- **Garde qualité** renforcée : potentiel minimum = 60 % de la référence (≈ p10). Si 20 essais échouent, on garde la meilleure grille tirée.
- **Score de run** : cumul de toutes les manches, affiché en permanence, jamais dépensé. Sert au classement entre runs.
- **Euros** : **plancher 20 €** si la manche est réussie (10 € si ratée), **+1 € par point au-dessus du seuil**, bonus plafonné à **80 €** **[tuning]**. Les relics/malédictions (Économe, Dette de temps) s'appliquent sur le total. Le récap montre le plancher, puis le bonus qui monte avec un compteur animé ; pendant la manche, le tableau de bord affiche en direct les euros en cours de gain dès que le seuil est franchi. Sert exclusivement en boutique.

### 3.2 Déroulé d'une manche

**Avant la manche 1** : le joueur choisit son **relic de départ** parmi 3 communs tirés au sort (hors relics d'attaque et relics à prérequis). Il donne une direction à la run dès la première grille.

1. **Un thème par manche** à partir de la manche 2 (section 7.2), tiré au sort, jamais deux fois le même d'affilée, annoncé sur l'écran « prêt ». La manche 1 est du Boggle pur. **Une seule couche spéciale à la fois** : retour playtest, escargots + objectif + mot maudit + condition s'empilaient trop. Les escargots et l'objectif de manche ne sont donc plus permanents, ce sont des thèmes. Le choix de mutateur parmi 3 a été testé puis retiré.
2. Génération de la grille (mutateur + relics `onGridGenerate` + malédictions actives).
3. Manche chronométrée. Dès que le seuil est atteint, un bouton **« Terminer la manche »** permet de s'arrêter : chaque tranche de **5 s restantes rapporte 1 €** **[tuning]**, affiché en direct sur le bouton. Rester jusqu'au bout reste rentable si on dépasse le seuil de plus de 1 pt par 5 s.
4. **Récap** : mots trouvés, score de la manche vs seuil, 5 meilleurs mots manqués (satisfaction Boggle classique), euros gagnés (plancher, dépassement animé, objectif, fin anticipée, relics).
   **Écran de fin** : tableau manche par manche (grille, score, seuil, meilleur mot, euros), relics, mots marquants, seed copiable et « Rejouer cette seed ».
5. **Boutique** (section 6), puis manche suivante.

### 3.2.1 Les escargots (thème « Escargots »)

Quand le thème est tiré, des escargots se promènent sur la grille : **1 en 4×4, 2 en 5×5 et 6×6, 3 en 7×7** (sinon la cible s'efface avec la taille : ~25 % des mots touchés en 4×4, 8 % en 7×7 avec un seul). Chacun occupe une case, avance d'une case adjacente toutes les **6 s** **[tuning]** (décalés entre eux), jamais sur un joker ni sur un autre escargot. Un mot dont le chemin passe par une de leurs cases reçoit un **×2 final par escargot touché**, après quoi l'escargot saute sur une case voisine hors du chemin. Pas de PV : c'est une cible mobile permanente, indépendante de la couche ennemis (7.5). Leurs déplacements tirent dans un **RNG dédié** (`seed + '-snail'`) : ils dépendent du timing du joueur et ne doivent pas désynchroniser grilles et boutiques d'une même seed.

### 3.2.2 La série

Chaque mot validé moins de **5 s** après le précédent ajoute un maillon ; le multiplicateur final vaut `1 + 0.1 × maillons` plafonné à **×1.5** (5 maillons) **[tuning]**. Une jauge visible montre le multiplicateur et le temps restant pour enchaîner. Le relic Combo élargit la fenêtre à 8 s et le plafond à ×2. Récompense le rythme, lisible d'un coup d'œil.

### 3.2.3 L'objectif de manche (thème « Objectif »)

Quand le thème est tiré, un mini-objectif est tiré parmi ceux réalisables dans la grille, payé en euros à la fin : un mot de (taille+1) lettres (+20 €), trois mots de 5+ lettres (+15 €), trois mots commençant par une lettre donnée (+15 €), un mot avec lettre rare (+15 €), N mots dans la manche (+15 €, N = 8 + 2 par palier de taille). Progression affichée à côté de la jauge de série.

### 3.3 Saisie — souris uniquement

- Le joueur **trace** le mot : `mousedown` sur une case, déplacement sur des cases adjacentes non encore utilisées (le chemin se dessine), `mouseup` valide.
- Revenir sur l'avant-dernière case du chemin la retire (correction sans relâcher).
- **Mot valide** : +score, animation, ajouté à la liste visible des mots trouvés.
- **Mot invalide** : aucune pénalité par défaut (shake). La malédiction « Un seul essai » change cette règle.
- **Doublon** : rejeté silencieusement (aucun score, feedback discret).
- Longueur minimum : 3 lettres. Une case = une lettre, sauf la case **QU** (voir 4.5) qui compte 2 lettres.

### 3.4 Ordre de calcul du score d'un mot (pipeline figé)

```
base      = Σ valeur(lettre) × multLongueur(len)
flat      = base + Σ bonus plats            (Voyelliste, Rareté, Un seul essai, Mot maudit, Anagramme, Palindrome…)
mult      = flat × Π (1 + bonus %)          (Lexicographe, Conjugueur, Amplificateur, Grille toxique… MULTIPLICATIFS entre eux)
final     = mult × Π multiplicateurs finaux (escargots ×2, série, Lettre porte-bonheur ×2)
```

Valeurs de lettre (Scrabble FR) : A E I L N O R S T U = 1 · D G M = 2 · B C P = 3 · F H V = 4 · J Q = 8 · K W X Y Z = 10 · QU = 8 · **joker = 1** (règle 7.1.1).

`multLongueur` : 3-4 lettres ×1 · 5-6 ×2 · 7 ×3 · 8+ ×4 **[tuning]**.

Les bonus en % se **multiplient** entre eux (×1.5 × ×1.4 = ×2.1) : c'est ce qui permet à une build de suivre la courbe de seuil. Décision prise après simulation (additif : ×3 au mieux avec 5 relics, insuffisant).

---

## 4. Architecture du moteur de jeu

### 4.1 Dictionnaire — pipeline de préparation (script one-shot, hors runtime)

```
Lexique383 (.tsv brut)
   │
   ▼ filtre : colonne `ortho`, longueur ≥ 3, caractères alphabétiques uniquement
   │          (exclure apostrophes, tirets, espaces)
   ▼ normalisation : majuscules, suppression des diacritiques (É→E, Ç→C, Œ→OE)
   │
   ▼ agrégation par forme normalisée : Set de cgram (un mot a souvent plusieurs
   │  catégories : « porte » = NOM + VER), fréquence max (freqfilms2)
   │
   ▼ flag `courant` = freqfilms2 ≥ 1.0 par million [tuning]
   │  (utilisé pour Mot maudit et Dictionnaire vivant, pas pour la validation)
   ▼
dictionnaire_fr.json → [{ w: string, c: ('NOM'|'VER'|'ADJ'|'ADV'|'AUTRE')[], f: boolean }]
```

Le dictionnaire complet sert à la validation (généreux, on accepte les formes rares). Le sous-ensemble `courant` sert aux tirages qui doivent produire un mot que le joueur reconnaît.

Ce script est exécuté une fois (Node), pas intégré au build. Le JSON est chargé au démarrage pour construire le Trie et la map `mot → Set<catégorie>`.

### 4.2 Structure de données du Trie

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isWord = false;
}

class Trie {
  root = new TrieNode();
  insert(word: string) {
    let node = this.root;
    for (const letter of word) {
      if (!node.children.has(letter)) node.children.set(letter, new TrieNode());
      node = node.children.get(letter)!;
    }
    node.isWord = true;
  }
  // Avance de plusieurs lettres (case QU) ; null si le préfixe n'existe pas
  walk(node: TrieNode, letters: string): TrieNode | null {
    for (const l of letters) {
      const next = node.children.get(l);
      if (!next) return null;
      node = next;
    }
    return node;
  }
}

type WordCategory = 'NOM' | 'VER' | 'ADJ' | 'ADV' | 'AUTRE';
const wordCategories: Map<string, Set<WordCategory>> = new Map();
```

**Règle relics de catégorie** : le bonus s'applique si la catégorie figure dans le Set (n'importe laquelle matche). « Porte » déclenche Conjugueur ET Nominaliste.

### 4.3 Graphe d'adjacence — paramétré, pas câblé en dur

```typescript
function getAdjacentCells(row: number, col: number, grid: Grid): [number, number][] {
  const deltas = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  return deltas
    .map(([dr, dc]) => [row + dr, col + dc] as [number, number])
    .filter(([r, c]) => r >= 0 && r < grid.size && c >= 0 && c < grid.size);
}
```

### 4.4 Recherche exhaustive des mots valides (DFS)

Calculée une fois par grille générée. Sert au récap de fin de manche, à la garde qualité de génération (4.5), aux relics d'information (Oracle, Radar, Mot maudit) et au placement des ennemis (7.5).

Le DFS remplit aussi `cellWordCount: number[][]` (nombre de mots distincts passant par chaque case) : c'est la mesure d'« atteignabilité » d'une case, utilisée pour ne jamais poser un ennemi sur une case intuable.

Gère le joker (26 branches) et la case QU (`trie.walk`).

```typescript
function findAllWords(grid: Grid, trie: Trie): Set<string> {
  const found = new Set<string>();

  function dfs(row: number, col: number, node: TrieNode, path: string, used: Set<string>) {
    const cell = grid.cells[row][col];
    const branches = cell.isJoker ? [...node.children.keys()] : [cell.letter]; // letter peut être "QU"

    for (const branch of branches) {
      const child = trie.walk(node, branch);
      if (!child) continue;
      const newPath = path + branch;
      if (child.isWord && newPath.length >= 3) found.add(newPath);

      for (const [r, c] of getAdjacentCells(row, col, grid)) {
        const key = `${r},${c}`;
        if (!used.has(key)) {
          used.add(key);
          dfs(r, c, child, newPath, used);
          used.delete(key);
        }
      }
    }
  }

  for (let r = 0; r < grid.size; r++)
    for (let c = 0; c < grid.size; c++)
      dfs(r, c, trie.root, '', new Set([`${r},${c}`]));
  return found;
}
```

**Validation d'un chemin tracé** (`validatePath(cells) → string | null`) : concaténer les lettres du chemin ; si le chemin contient un ou deux jokers, énumérer les candidats (26 ou 26² patterns) via le Trie, filtrer ceux déjà trouvés, **retenir le candidat au score final le plus élevé** après application des relics (les catégories peuvent départager). Aucun candidat → mot invalide.

### 4.5 Génération de grille — pondérée, avec garde qualité

```typescript
type LetterWeights = Record<string, number>;

const FRENCH_STANDARD_WEIGHTS: LetterWeights = {
  E: 14.7, A: 7.6, I: 7.5, S: 7.9, N: 7.1, R: 6.5, T: 7.2, O: 5.3,
  U: 6.3, L: 5.5, D: 3.7, C: 3.3, M: 2.9, P: 3.0, G: 1.1, B: 0.9,
  V: 1.6, H: 0.7, F: 1.1, QU: 1.4, Y: 0.3, X: 0.4, J: 0.5, K: 0.05, W: 0.05, Z: 0.3
};

function generateGrid(size: number, weights: LetterWeights, rng: Rng): Grid {
  for (let attempt = 0; attempt < 20; attempt++) {
    const cells = /* tirage pondéré indépendant par case */;
    const grid = { size, cells };
    if (passesQualityGate(grid)) return grid;
  }
  return grid; // dernière tentative, tant pis
}
```

- **Le Q n'existe pas seul** : la case est **QU** (comme le dé Boggle). Elle vaut 8 pts et compte 2 lettres pour la longueur.
- **Garde qualité** **[tuning]** : au moins `size` voyelles (A E I O U Y), au plus 2 lettres de valeur ≥ 8, et `findAllWords(grid).size ≥ 25` (4×4) / 60 (5×5) / 100 (6×6). Sinon on régénère (max 20 essais).
- Les mutateurs (7.2) sont des variantes de `weights` ou des post-traitements (marquer une case toxique). Les relics joker posent leur case en post-traitement, puis la garde qualité est réévaluée.

### 4.6 Modèle de données — run, relics, hooks

Chaque relic est un objet **sans état** enregistré dans un registre par id. Le store ne contient que des ids (sérialisable, seedable). Le moteur applique tous les hooks actifs en séquence : aucun code par combinaison.

```typescript
interface ScoreModifier {
  flat?: number;     // ajouté après la base
  percent?: number;  // ajouté au multiplicateur additif (0.5 = +50 %)
  final?: number;    // multiplicateur final (Combo = 2)
}

interface RunContext {
  rng: Rng;
  run: RunState;
  manche: MancheState;                 // grille, mots trouvés (avec timestamps), chrono restant, mutateur actif
  timer: { add(s: number): void; setMin(s: number): void };
  allWords: Set<string>;               // findAllWords de la grille courante
  categoriesOf(word: string): Set<WordCategory>;
}

interface Relic {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
  description: string;
  requires?: string;                   // id d'un relic prérequis (Double joker requiert Case joker)
  unlocked: boolean;                   // toujours true au MVP

  onWordFound?:    (word: string, ctx: RunContext) => ScoreModifier | void;   // PUR : appelé pour chaque candidat joker
  onWordAccepted?: (found: FoundWord, ctx: RunContext) => void;               // effets de bord (chrono…), une fois le mot retenu
  onGridGenerate?: (grid: Grid, ctx: RunContext) => Grid;
  onMancheStart?:  (ctx: RunContext) => void;
  onMancheEnd?:    (ctx: RunContext, success: boolean, euros: number) => number; // renvoie les euros modifiés
  onRunEnd?:       (ctx: RunContext) => number;                                  // renvoie un bonus de score
  onCellUsed?:     (cell: Cell, ctx: RunContext) => 'neutralize' | void;         // Bouclier de case
  onDamage?:       (word: string, enemy: Enemy, damage: number, ctx: RunContext) => number; // renvoie les dégâts modifiés
  onEnemyKilled?:  (enemy: Enemy, bounty: number, ctx: RunContext) => number;   // renvoie la prime modifiée
  ui?: UiFlags;                        // Mémoire, Radar, Oracle, Dictionnaire vivant : lus par les composants
}

type UiFlags = Partial<{
  highlightUsedCells: boolean;   // Mémoire
  radarLongWord: boolean;        // Radar : halo sur une case d'un mot 7+
  showLongestLength: boolean;    // Oracle
  longPressHints: boolean;       // Dictionnaire vivant (appui long ≥ 500 ms)
  targetedReroll: boolean;       // Reroll ciblé
}>;

interface Mutator {
  id: string;
  name: string;
  description: string;
  gridSize?: number;
  applyToWeights?: (w: LetterWeights) => LetterWeights;
  applyToGrid?: (grid: Grid, rng: Rng) => Grid;
  onWordFound?: (word: string, ctx: RunContext) => ScoreModifier | void;  // Grille toxique +50 %
}

interface Consumable { id: string; name: string; rarity: Rarity; usesPerManche: number; use(ctx: RunContext, target?: Cell): void; }
interface Curse      { id: string; name: string; price: number; /* mêmes hooks que Relic, actif 1 manche */ }

interface EnemyType {
  id: string;
  name: string;
  cellCount: number;                  // cases occupées (contiguës)
  hpRatio: number;                    // PV = seuil(n) × hpRatio
  bounty: number;                     // euros à la mort
  blocksPath?: boolean;               // Mur : cases intraçables, dégâts par adjacence
  onSpawn?:        (enemy: Enemy, ctx: RunContext) => void;   // Empoisonneur : cases adjacentes toxiques
  onWordValidated?:(enemy: Enemy, word: string, ctx: RunContext) => void; // Fuyard, Boss : déplacement
  onDeath?:        (enemy: Enemy, ctx: RunContext) => void;   // Diviseur : spawn de limaces
}

interface Enemy { id: string; typeId: string; cells: [number, number][]; hp: number; maxHp: number; }

interface MancheState {
  grid: Grid;                         // Cell porte `enemyId?: string`
  wordsFound: { word: string; at: number; score: number }[];
  timeLeft: number;
  mutatorId: string | null;
  enemies: Enemy[];
}

interface RunState {
  seed: string;
  score: number;
  euros: number;
  lives: number;
  currentManche: number;              // 1..10
  relicIds: string[];
  consumables: { id: string; charges: number }[];   // max 3 emplacements
  pendingCurseIds: string[];          // s'appliquent à la prochaine manche uniquement
  history: MancheResult[];
}
```

**Pourquoi deux hooks** : avec un joker, `onWordFound` est évalué pour chaque mot candidat afin de choisir le meilleur. Un effet de bord dedans (Métronome) se déclencherait N fois. Les effets vont donc dans `onWordAccepted`. Le moteur y expose aussi `manche.timeLeftBeforeWord` (chrono à la validation, avant les effets des autres relics) pour que Sablier fissuré ne dépende pas de l'ordre des relics.

**Résolution des hooks `onWordFound`** : le moteur collecte tous les `ScoreModifier` (relics + mutateur + malédictions), somme les `flat`, somme les `percent`, multiplie les `final`, puis applique le pipeline 3.4.

**Résolution des dégâts** : après le score final, pour chaque ennemi dont une case est sur le chemin (ou adjacente au chemin pour un ennemi `blocksPath`), `dégâts = score final` passé dans les hooks `onDamage`. Un mot qui touche deux ennemis blesse les deux à plein. Puis `onWordValidated` de chaque ennemi vivant (déplacements), puis `onDeath` et `onEnemyKilled` pour les morts.

### 4.7 Structure de projet

```
scripts/
└── build-dictionary.ts        # Lexique383 → src/data/dictionnaire_fr.json
src/
├── engine/
│   ├── rng.ts
│   ├── trie.ts
│   ├── adjacency.ts
│   ├── gridGenerator.ts
│   ├── wordFinder.ts          # findAllWords + validatePath
│   ├── scoring.ts             # pipeline 3.4
│   ├── enemies.ts             # placement, dégâts, déplacement
│   └── manche.ts              # cycle de vie, dispatch des hooks
├── data/
│   ├── relics.ts
│   ├── mutators.ts
│   ├── consumables.ts
│   ├── curses.ts
│   ├── enemies.ts
│   ├── registry.ts            # id → objet
│   └── dictionnaire_fr.json
├── state/
│   └── runStore.ts
├── components/
│   ├── Grid.tsx               # tracé souris
│   ├── EnemyOverlay.tsx       # sprites + barres de PV par-dessus la grille
│   ├── MutatorPick.tsx
│   ├── Shop.tsx
│   ├── Timer.tsx
│   ├── ScoreBoard.tsx
│   ├── MancheRecap.tsx
│   └── EndScreen.tsx          # félicitations / game over
└── App.tsx
```

---

## 5. Ordre de développement

1. Script dictionnaire (normalisation, multi-cgram, flag courant)
2. RNG seedé, Trie, génération 4×4 avec garde qualité, `findAllWords`
3. Grille React + tracé souris + validation + scoring de base (sans relics)
4. Boucle complète : chrono, seuil, vies, 10 manches, récap, écran de fin — **premier playtest ici, caler [tuning] avant d'aller plus loin**
5. Pipeline de hooks + relics simples (Lexicographe, Voyelliste, Métronome, Conjugueur)
6. Boutique + euros + consommables
7. Choix de mutateur + mutateurs
8. Relics restants, malédictions, relics UI (Mémoire, Radar, Oracle, Dictionnaire vivant)
9. Ennemis : moteur (placement, dégâts, déplacement), Limace et Tank d'abord, puis les autres types, boss, relics d'attaque et malédictions associées

---

## 6. Économie et boutique

| Rareté | Prix relic | Prix consommable | Poids de tirage |
|---|---|---|---|
| Commun | 20 | 10 | 60 |
| Rare | 50 | 30 | 30 |
| Légendaire | 100 | 60 | 10 |

Malédictions : 10 € (Vision trouble, Dette de temps, Infestation), 15 € (Un seul essai, Peau dure).

- La boutique propose **3 objets** : 2 tirés dans relics + consommables, 1 tiré dans malédictions + consommables **[tuning]**.
- Un relic déjà possédé n'est pas proposé. Un relic avec `requires` n'est proposé que si le prérequis est possédé.
- Pas de plafond de relics.
- **4 emplacements** : 2 tirés parmi relics + consommables, 1 parmi malédictions + consommables, et **1 charme** toujours présent (5-8 €).
- **Charmes** (3 exemplaires max d'un même charme **[tuning]**, garde-fou contre les fins de run triviales) : petits relics empilables générés depuis des gabarits paramétrés (`src/data/charms.ts`), l'id encode le gabarit : `charme-lettre-E` (+10 % sur les mots contenant un E), `charme-longueur-4` (+15 % sur les 4 lettres), `charme-categorie-NOM` (+10 % sur les noms), `charme-finale-S`, `charme-initiale-voyelle`, `charme-plat-1` (+1 pt par mot), `charme-chrono-3` (+3 s par manche), `charme-long-6` (+20 % sur 6+). Plusieurs exemplaires se cumulent (multiplicatif). Réponse au retour « pas grand-chose à dépenser ».
- **Changer les articles** : bouton en boutique, **5 €** le premier changement de la visite, puis 10, 15… **[tuning]**. Les 4 emplacements sont retirés, achetés ou non : un joueur riche enchaîne achats et changements (avec 1 000 €, une dizaine d'objets par visite). Le relic **Brocanteur** offre 2 changements gratuits par visite.
- Consommables : 3 emplacements max, achat = recharge des charges.
- Malédictions : achetées en boutique, appliquées à la **prochaine manche uniquement**.
- **La boutique s'ouvre après chaque manche, y compris la première.** Revenu attendu : 20 € garantis + le dépassement du seuil, donc 20 à 100 €/manche selon la performance : un consommable ou une malédiction à chaque manche, un relic commun dès qu'on dépasse le seuil de 20 pts, un rare quand on l'écrase.

---

## 7. Contenu du MVP

### 7.1 Relics passifs (36)

| # | Nom | Effet | Rareté | Hook | Note |
|---|---|---|---|---|---|
| 1 | Lexicographe | +50 % sur mots de 6+ lettres | Commun | onWordFound percent | |
| 2 | Voyelliste | +1 pt par voyelle du mot | Commun | onWordFound flat | |
| 3 | Rareté | +5 pts plats si le mot contient K, W, X, Y, Z, J ou QU | Commun | onWordFound flat | |
| 4 | Combo | La série (3.2.2) tient 8 s au lieu de 5 et monte jusqu'à ×2 au lieu de ×1.5 | Rare | streakWindow / streakMaxLinks | Remplace le combo binaire |
| 5 | Métronome | +2 s de chrono par mot validé | Commun | onWordFound → timer.add | |
| 6 | Sablier fissuré | Mot validé alors qu'il reste ≤ 5 s → chrono remonte à 10 s | Rare | onWordFound → timer.setMin | Cumul avec #5 accepté (chaos) |
| 7 | Bouclier de case | Neutralise la 1re case toxique utilisée par manche | Commun | onCellUsed | |
| 8 | Mémoire | Cases utilisées restent colorées ; quand toutes les cases **sauf 2 (4×4, 5×5) ou 3 (6×6, 7×7)** ont servi : +100 pts (1×/manche) | Commun | ui + onWordAccepted → addBonus | 100 % jugé trop dur en playtest |
| 9 | Oracle | Marque la case de la première lettre du mot le plus long (anneau doré) **avec son nombre de lettres écrit dans la case** | Commun | ui + allWords.longestStart | Retour playtest ×2 : longueur seule, puis « 1 » peu lisible |
| 10 | Radar | Halo sur une case appartenant à un mot de 7+ lettres | Rare | ui + allWords | Rien si aucun mot 7+ |
| 11 | Dictionnaire vivant | Appui long sur une case → 3 mots courants de 3 lettres commençant par elle, présents dans la grille | Légendaire | ui + allWords | Sous-ensemble `courant` |
| 12 | Économe | +30 % d'euros par manche réussie | Commun | onMancheEnd | |
| 13 | Reroll ciblé | Le consommable Reroll propose 3 lettres au choix | Légendaire | ui | |
| 14 | Case joker | Une case joker par grille | Rare | onGridGenerate | Lettre joker = 1 pt |
| 15 | Double joker | Deux cases jokers | Légendaire | onGridGenerate | `requires: case-joker` |
| 16 | Mot maudit | Mot `courant` de 4 à (taille+2) lettres tiré dans `allWords` en début de manche, **caché** : seuls sa longueur et la case de sa première lettre (anneau violet) sont donnés ; +60 pts plats si tracé, le mot est révélé une fois trouvé | Commun | onMancheStart + onWordFound flat | Affiché en clair + case marquée = trivial (208 pts pour un seuil de 50) |
| 17 | Anagramme bonus | +30 pts plats quand le mot est l'anagramme d'un mot déjà trouvé dans la manche | Rare | onWordFound flat | |
| 18 | Chasseur de palindromes | +150 pts plats si palindrome (4+ lettres) | Légendaire | onWordFound flat | Jackpot rare |
| 19 | Alchimiste | Euros restants en fin de run × 2 ajoutés au score | Rare | onRunEnd | |
| 20 | Conjugueur | +40 % sur les verbes | Commun | onWordFound percent | Catégorie ∈ Set |
| 21 | Qualificatif | +40 % sur les adjectifs | Commun | onWordFound percent | |
| 22 | Nominaliste | +30 % sur les noms | Commun | onWordFound percent | |
| 23 | Chasseur d'adverbes | +100 % sur les adverbes | Rare | onWordFound percent | Stack naturel avec #1 (adverbes en -ment) |
| 24 | Bretteur | Dégâts ×2 sur les mots de 6+ lettres | Commun | onDamage | Inutile sans ennemi |
| 25 | Éclaboussure | Un mot qui touche un ennemi inflige 50 % de ses dégâts à tout ennemi adjacent au chemin | Rare | onDamage | |
| 26 | Vampire | Tuer un ennemi → +5 s de chrono | Commun | onEnemyKilled → timer.add | |
| 27 | Chasseur de primes | Primes +50 % | Commun | onEnemyKilled | |
| 28 | Harpon | Chaque mot valide inflige 25 % de son score à l'ennemi le plus proche du chemin, même sans le toucher | Rare | onWordFound (side-effect) | Débloque les grilles où l'ennemi est mal placé |
| 30 | Brocanteur | 2 changements d'articles gratuits par visite de boutique | Commun | shopRerolls | |
| 31 | Amplificateur | ×1.3 sur tous les mots | Rare | onWordFound percent | Multiplicateur pur |
| 32 | Résonance | ×1.6 sur tous les mots | Légendaire | onWordFound percent | |
| 33 | Lettre porte-bonheur | Une lettre de la grille tirée par manche (elle commence ≥ 3 mots), cases marquées : mots qui **commencent** par elle ×2 | Rare | onMancheStart + onWordFound final | Idée joueur |
| 34 | Lettre bénie | La lettre porte-bonheur double aussi les mots qui la **contiennent** | Légendaire | onWordFound final, `requires: porte-bonheur` | |
| 36 | Épargne | +5 % des euros en poche à chaque fin de manche (arrondi sup.) — l'intérêt de Balatro | Commun | onMancheEnd | Idée joueur |
| 35 | Sourcier | Sur l'écran « prêt », retirer la grille jusqu'à 2 fois par manche en voyant son humeur et son seuil (choisir plus ou moins aride) | Rare | gridRerolls | Idée joueur |
| 29 | Collectionneur de crânes | +3 % de score (percent) par ennemi tué depuis le début de la run, permanent | Légendaire | onWordFound percent, compteur dans `run.history` | Snowball assumé |

Les relics 24-29 ne sont proposés en boutique qu'à partir de la manche 2, et leur poids de tirage est doublé si le joueur a déjà pris un mutateur à ennemis dans la run (sinon ils sont des achats morts).

**7.1.1 — Case joker, règle de score** : la lettre résolue par un joker vaut toujours 1 pt, jamais la valeur d'une lettre rare. En cas de plusieurs mots possibles, on retient celui au score final le plus élevé (4.4).

**Coupé du MVP** : Chasseur de chaîne / Famille lexicale (lemmatisation), Grammairien (multi-catégories).

### 7.2 Thèmes de manche (8) — un par manche dès la manche 2

Un thème partage les hooks de mot d'un relic et peut en plus changer la taille, le chrono, le seuil, post-traiter la grille, ou activer une couche (escargots, objectif, ennemi). Il apparaît comme une puce bleue dans la barre des relics et sur l'écran « prêt ». **Retirés** : Dense voyelles, Dense consonnes (imperceptibles), Grille XXL.

| # | Nom | Effet |
|---|---|---|
| A | Escargots | Voir 3.2.1 |
| B | Objectif | Voir 3.2.3 |
| C | Chasse | Un ennemi (voir 7.5) : Limace 1 case, Tank 2 cases en 6×6+, PV = seuil × 0.6. Abattu : +30 € ; survivant : −15 € sur les gains |
| 1 | Grille géante | +1 de taille par rapport à la manche, plafonné à **7×7**, chrono adapté. Seule voie vers le 7×7 |
| 5 | Grille toxique | 2 cases toxiques visibles (marquées) : chaque utilisation dans un mot validé coûte -8 s ; +50 % sur tous les mots de la manche |
| 8 | **Terre fracturée** | Chaque case utilisée dans un mot valide se **fissure** (rendu visuel) ; à la **2e utilisation** elle se brise et révèle une nouvelle lettre (animation). Les mots trouvables sont recalculés. Pousse à réfléchir avant de tracer : une lettre clé peut disparaître. Idée joueur |
| 9 | Sprint | −30 s, seuil −30 % |
| 10 | Marathon | +45 s, seuil +40 %. Pas avant la manche 4, comme Grille géante |
| 6 | Grille infestée | 2 à 3 ennemis tirés dans le pool (hors boss). Chaque ennemi survivant en fin de manche mord : -10 € sur les euros de la manche (min 0) |
| 7 | Antre du boss | Manches 5 et 10 uniquement, toujours proposé. 1 boss. Tué → prime + **choix d'un relic gratuit parmi 3**. Survivant → -1 vie en plus de l'éventuel échec de seuil |

**Coupé** : Sauts, Double grille (adjacence inter-grilles non définie, moteur à part).

### 7.3 Consommables (5)

| # | Nom | Effet | Charges/manche | Rareté |
|---|---|---|---|---|
| 1 | Reroll de lettre | **Double-tap sur une case** (ou bouton puis case) → nouvelle lettre tirée (aveugle, ou 3 choix avec Reroll ciblé). Un tap simple sur une case ne soumet rien | 5 | Commun |
| 2 | Gel du temps | +15 s au chrono | 1 | Commun |
| 3 | Shuffle total | Régénère la grille (garde qualité incluse), chrono inchangé, mots déjà trouvés conservés (les ennemis sont repositionnés) | 1 | Rare |
| 4 | Grenade | 30 dégâts à tous les ennemis de la grille | 1 | Rare |
| 5 | Inspiration | Illumine 6 s les cases du mot le plus long de la grille (sans l'ordre) et affiche sa longueur et sa première lettre. Le joueur doit encore trouver le chemin | 1 | Rare |

### 7.4 Malédictions (5) — achats volontaires, 1 manche

| # | Nom | Prix | Malus | Bonus |
|---|---|---|---|---|
| 1 | Vision trouble | 10 | Grille floutée hors d'un rayon de 2 cases autour du curseur | +100 % sur la manche |
| 2 | Dette de temps | 10 | Chrono démarre à 70 s | +100 % euros sur la manche |
| 3 | Un seul essai | 15 | Mot invalide → -10 s | +10 pts plats par mot valide |
| 4 | Infestation | 10 | 3 ennemis supplémentaires sur la prochaine manche (cumulable avec Grille infestée) | Primes ×2 |
| 5 | Peau dure | 15 | Tous les ennemis ont PV ×2 | Primes ×3, chaque mort donne +5 s |

### 7.5 Ennemis — couche optionnelle

**État : première version implémentée** via le thème « Chasse » (7.2) : un ennemi statique (Limace 1 case, Tank 2 cases sur 6×6+), dégâts = score final du mot traversant, Harpon (25 % à distance), Bretteur, Vampire, Chasseur de primes, Collectionneur de crânes et Grenade actifs. Les relics d'attaque sont proposés en boutique à partir de la manche 2. Le reste de cette section (types mobiles, boss, mutateur Infestation) reste à faire.

**Principe** : un ennemi occupe une ou plusieurs cases contiguës, affiché par-dessus la grille avec une barre de PV. Un mot validé dont le chemin passe par une de ses cases lui inflige **le score final du mot** en dégâts. Les cases d'un ennemi restent traçables normalement (sauf Mur). Le mot compte aussi pour le seuil : blesser un ennemi n'a aucun coût, c'est le placement qui contraint.

**Règles** :
- PV = `seuil(n) × hpRatio` **[tuning]**, arrondi. Les dégâts en excès sont perdus.
- Mort → prime en euros (immédiate, hors calcul `10 + 5n`), cases libérées, effet `onDeath`.
- **Placement** : cases tirées parmi celles dont `cellWordCount ≥ 5` (4×4) **[tuning]**, en évitant les cases déjà toxiques ou joker. Pour un ennemi multi-cases, on tire la première puis on étend par adjacence en respectant la même contrainte. Si aucune case ne convient, l'ennemi n'apparaît pas (log, pas de crash).
- Fin de manche : les survivants appliquent leur malus (défini par le mutateur ou la malédiction qui les a posés), puis disparaissent. Rien ne persiste entre manches sauf le compteur de kills de la run.
- **Shuffle total** repositionne les ennemis vivants (PV conservés).

**Types (6 + boss)** **[tuning]** :

| # | Nom | Cases | PV (× seuil) | Prime | Comportement |
|---|---|---|---|---|---|
| 1 | Limace | 1 | 0.15 | 10 € | Immobile. Chair à canon |
| 2 | Fuyard | 1 | 0.25 | 20 € | Après chaque mot validé (touché ou non), se déplace sur une case adjacente libre atteignable (`cellWordCount ≥ 3`) |
| 3 | Tank | 2 | 0.60 | 30 € | Immobile |
| 4 | Empoisonneur | 1 | 0.25 | 25 € | Tant qu'il vit, ses cases adjacentes sont toxiques (-8 s si utilisées). Sa mort purge |
| 5 | Diviseur | 1 | 0.30 | 15 € | À sa mort, spawn 2 Limaces sur des cases adjacentes libres (prime des limaces en plus) |
| 6 | Mur | 3 | 0.40 | 20 € | `blocksPath` : ses cases sont intraçables. Prend les dégâts des mots passant par une case adjacente. Mort → cases libérées |
| B | Hydre (boss) | 3 | 1.20 | 60 € + relic gratuit | Après chaque mot validé, déplace une de ses cases vers une case adjacente libre. À 50 % PV, rend une case adjacente toxique |

**Interaction avec l'existant** : Bouclier de case neutralise aussi la toxicité d'un Empoisonneur. Case joker n'est jamais une case d'ennemi. Radar ignore les cases de Mur. Mot maudit n'est jamais tiré parmi les mots impossibles à cause d'un Mur (on recalcule `allWords` avec les cases bloquées retirées).

**Ce que ça teste en playtest** : est-ce que le joueur prend « Grille infestée » quand « Grille standard » est proposée à côté ? Si non, monter les primes ou rendre les mutateurs sans ennemis plus rares. L'objectif est que la couche soit choisie une manche sur deux environ.

### 7.6 Pool total MVP

| Catégorie | Quantité |
|---|---|
| Relics | 36 |
| Conditions | 5 |
| Consommables | 5 |
| Malédictions | 5 |
| Ennemis | 6 + 1 boss |

---

## 8. Hors scope MVP (v2+)

- Meta-progression inter-run
- Mode endless après la manche 10
- Cases dorées (bonus euros sur la grille)
- Double grille, Gravité, Marée
- Relics Séquence croissante, Lettre pivot, Chaîne de lettres, Compte à rebours lexical, Mot miroir de longueur
- Chasseur de chaîne / Famille lexicale (lemmatisation)
- Ennemis en cœur de jeu (vagues remplaçant le seuil), ennemis persistants entre manches, ennemis qui attaquent le chrono
- Mode daily-run partageable (seed reproductible : RNG escargots séparé, bouton « Rejouer cette seed » déjà là)
- Packaging Tauri final
