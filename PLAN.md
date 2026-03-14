# PLAN.md — v0.1 Simulateur d'impôt sur le revenu

## Architecture

```
src/
  engine/           # Moteur de calcul fiscal (TypeScript pur, zero dépendance UI)
  components/       # Composants React (formulaires, résultats, graphiques)
  layouts/          # Layout Astro
  pages/            # Page unique index.astro
  styles/           # Tailwind global.css
tests/
  engine/           # Tests unitaires du moteur fiscal
.github/
  workflows/        # CI/CD GitHub Pages
```

Stack : **Astro + React + Recharts + Tailwind + TypeScript**

---

## Phase 1 — Initialisation du projet

| # | Tâche | Statut | Fichiers |
|---|-------|--------|----------|
| T1 | Scaffolding Astro + React + Tailwind + Recharts | ✅ | `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`, `src/pages/index.astro`, `src/layouts/Layout.astro` |
| T2 | GitHub Actions pour GitHub Pages | ✅ | `.github/workflows/deploy.yml` |
| T3 | Configuration Vitest | ✅ | `vitest.config.ts`, `package.json` |

## Phase 2 — Moteur de calcul fiscal

| # | Tâche | Statut | Fichiers | Règles métier |
|---|-------|--------|----------|---------------|
| T4 | Types TypeScript | ⬜ | `src/engine/types.ts` | — |
| T5 | Constantes barème 2026 | ⬜ | `src/engine/tax-brackets.ts` | — |
| T6 | Calcul abattement | ⬜ | `src/engine/compute-allowance.ts`, `tests/engine/compute-allowance.test.ts` | RM-001 → RM-004 |
| T7 | Calcul nombre de parts (QF) | ⬜ | `src/engine/compute-parts.ts`, `tests/engine/compute-parts.test.ts` | RM-005 → RM-009 |
| T8 | Calcul IR complet + orchestrateur | ⬜ | `src/engine/compute-tax.ts`, `src/engine/compute-results.ts`, `src/engine/simulate.ts`, `tests/engine/simulate.test.ts` | RM-010 → RM-021 |

## Phase 3 — Interface utilisateur

| # | Tâche | Statut | Fichiers |
|---|-------|--------|----------|
| T9 | Formulaire situation familiale | ⬜ | `src/components/FamilyForm.tsx` |
| T10 | Formulaire scénario (actuel/futur) | ⬜ | `src/components/ScenarioForm.tsx` |
| T11 | Composant racine + état global | ⬜ | `src/components/SimulatorApp.tsx` |
| T12 | Tableaux résultats + comparaison | ⬜ | `src/components/ResultsTable.tsx`, `src/components/ComparisonTable.tsx` |
| T13 | Graphique barres empilées | ⬜ | `src/components/BreakdownChart.tsx` |
| T14 | Courbe taux effectif | ⬜ | `src/components/EffectiveTaxRateChart.tsx` |

## Phase 4 — Intégration et polish

| # | Tâche | Statut | Fichiers |
|---|-------|--------|----------|
| T15 | Page Astro + SEO + disclaimer | ⬜ | `src/pages/index.astro`, `src/layouts/Layout.astro` |
| T16 | Responsive mobile-first | ⬜ | tous les `.tsx` |
| T17 | Tests d'intégration (4 cas spec) | ⬜ | `tests/engine/simulate.test.ts` |
| T18 | Mise à jour README + .gitignore | ⬜ | `README.md`, `.gitignore` |

---

## Dépendances

```
T1 ──> T2, T3, T4, T5, T9, T10
T4 + T5 ──> T6, T7
T6 + T7 ──> T8
T8 + T9 + T10 ──> T11
T11 ──> T12, T13, T14
T12-T14 ──> T15, T16
T8 ──> T17 (parallélisable avec Phase 3)
T18 : indépendant
```

## Pièges identifiés

1. **Précision float64** — pas d'arrondi prématuré, la troncature finale (RM-018) absorbe les erreurs
2. **TMI après plafonnement QF** (RM-019) — calculer sur parts de base, pas parts réelles
3. **Parent isolé** (RM-013) — plafond QF 4 262 € pour la 1re demi-part (pas 1 807 €)
4. **Veuf avec enfants** (RM-008) — même régime que couple (2 parts de base)
5. **Décote** (RM-016) — seuls couples mariés/pacsés en déclaration commune = décote couple
6. **GitHub Pages base path** — `base: '/Simulateur-de-revenus'` dans `astro.config.mjs`

## Cas de test de référence (spec v0.1)

| Cas | Situation | Revenu | IR attendu | Net attendu |
|-----|-----------|--------|------------|-------------|
| 1 | Célibataire, 0 enfant | 30 000 € | 1 563 € | 28 437 € |
| 2 | Couple marié, 2 enfants | 80 000 € | 4 193 € | 75 807 € |
| 3 | Célibataire, 13 000 € | 13 000 € | 0 € | 13 000 € |
| 4 | Parent isolé, 1 enfant | 60 000 € | 3 388 € | 56 612 € |
