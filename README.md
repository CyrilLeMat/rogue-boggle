# Rogue Boggle Warrior — Ultimate Dictée de CE2 Edition

Boggle roguelite solo raconté comme si ta place en CM1 en dépendait : onze dictées, trois bons points,
une note à atteindre, des fournitures à acheter à la coopérative avec tes billes, des cancres qui copient,
des escargots en leçon de choses — et, entre la dixième dictée et la dernière, un règlement de comptes
avec le redoublant du fond.

Jouable au doigt ou à la souris : <https://cyrillemat.github.io/rogue-boggle/>

## Développement

```bash
npm install
npm run dev        # http://localhost:5173, exposé sur le réseau local
npm test -- --run  # tests unitaires (vitest)
npm run build      # tsc -b && vite build, sortie dans dist/
```

`npx tsc --noEmit` ne vérifie rien dans ce dépôt (le tsconfig racine n'a que des références) :
c'est `npm run build` qui type-checke.

Le dictionnaire (`src/data/dictionnaire_fr.json`) est généré depuis Lexique383 par
`npx tsx scripts/build-dictionary.ts` (télécharger `Lexique383.tsv` dans `scripts/raw/`).

## Bancs d'essai

Les valeurs marquées `[tuning]` dans le code se mesurent au lieu de se deviner :

```bash
npx vite-node scripts/sim-economy.ts      # victoires, achats et billes par niveau et par profil
npx vite-node scripts/bench-relics.ts     # valeur d'une fourniture, en points par dictée
npx vite-node scripts/bench-recitation.ts # le concours de récitation est-il gagnable ?
npx vite-node scripts/year-rhythm.ts      # le programme d'une année, écran par écran
npx vite-node scripts/token-coverage.ts   # combien de fois chaque mot de la fiche ressort
```

## Déploiement

Chaque push sur `main` builde et publie sur GitHub Pages via `.github/workflows/deploy.yml`.
La fréquentation est comptée par GoatCounter (sans cookie, hors localhost) : voir `src/analytics.ts`
pour les étapes suivies.
