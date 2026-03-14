# Simulateur de revenus

Site statique pour estimer ses revenus nets depuis le chiffre d'affaires, en simulant impôts et cotisations sociales. Destiné aux salariés et freelancers français. Hébergé sur [GitHub Pages](https://juliendelrio.github.io/Simulateur-de-revenus/).

## v0.1 — Impôt sur le revenu

- Calcul de l'IR (barème 2026, revenus 2025)
- Quotient familial, plafonnement QF, décote, seuil 61 €
- Abattement forfaitaire 10 % ou frais réels
- Comparaison de deux scénarios (actuel vs futur)
- Graphiques : barres empilées (net/impôt) + courbe du taux effectif

## Stack

- **Astro** + **React** + **TypeScript**
- **Tailwind CSS** (mobile-first)
- **Recharts** (graphiques)
- **Vitest** (tests)

## Développement

```bash
npm install       # installer les dépendances
npm run dev       # serveur de dev (http://localhost:4321)
npm run build     # build statique
npm test          # lancer les tests
```

## Licence

MIT
