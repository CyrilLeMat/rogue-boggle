# Rogue Boggle — Ultimate Dictée de CE2 Edition

Boggle roguelite solo raconté comme si ta place en sixième en dépendait : dix dictées, trois bons points,
une note à atteindre, des fournitures à acheter à la coopérative avec tes billes, des cancres qui copient,
des escargots en leçon de choses.
Jouable au doigt ou à la souris. Spécification complète dans `boggle-roguelite-spec-mvp.md`.

## Développement

```bash
npm install
npm run dev        # http://localhost:5173, exposé sur le réseau local
npm test -- --run  # tests unitaires (vitest)
npm run build      # build statique dans dist/
```

Le dictionnaire (`src/data/dictionnaire_fr.json`) est généré depuis Lexique383 par
`npx tsx scripts/build-dictionary.ts` (télécharger `Lexique383.tsv` dans `scripts/raw/`).

## Déploiement

Chaque push sur `main` builde et publie sur GitHub Pages via `.github/workflows/deploy.yml`.
