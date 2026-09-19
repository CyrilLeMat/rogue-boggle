# Rogue Boggle

Boggle roguelite solo : 10 manches, 3 vies, un seuil qui grimpe, des relics, une boutique, des escargots.
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
