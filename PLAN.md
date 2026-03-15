# PLAN.md — Simulateur de revenus

## Architecture

```
src/
  engine/
    simulate.ts          # Moteur IR (barème, QF, décote, plafonnement)
    deduction.ts         # Abattement 10% / frais réels
    parts.ts             # Quotient familial
    tax.ts               # Calcul par tranche
    constants.ts         # Barème IR 2026
    types.ts             # TaxInput, TaxResult, MemberIncome
    social/              # v0.2 — Cotisations salariales
      simulate.ts        # simulateSocial() → brut → net avant IR
      constants.ts       # PASS, CSG/CRDS, Agirc-Arrco
      types.ts           # SocialInput, SocialResult
    employer/            # v0.3 — Cotisations patronales + RGDU
      simulate.ts        # simulateEmployer() → super brut
      rgdu.ts            # Réduction générale dégressive unique
      constants.ts       # Taux patronaux, SMIC, paramètres RGDU
      types.ts           # EmployerInput, EmployerResult, CompanySize
    combined.ts          # simulateCombined() → chaîne complète
    index.ts             # Exports
  components/
    SimulatorApp.tsx     # Composant racine, onglets, state
    useUrlState.ts       # État URL (ScenarioState ↔ query string)
    FamilyForm.tsx       # Situation familiale
    ScenarioForm.tsx     # Revenus (brut, abattement)
    SalaryForm.tsx       # Statut salarié (cadre, HS, mutuelle)
    EmployerForm.tsx     # Paramètres employeur (effectif, AT/MP, transport, prévoyance)
    TabNav.tsx           # Navigation par onglets
    ResultsTable.tsx     # Résultats IR + comparaison
    SalaryResultsTable.tsx   # Décomposition salaire + comparaison
    EmployerResultsTable.tsx # Coût employeur + comparaison
    StackedCostChart.tsx     # Barres empilées super brut → net
    BreakdownChart.tsx       # Barres empilées IR (net vs impôt)
    EffectiveRateChart.tsx   # Courbe taux effectif IR
    TaxBracketsTable.tsx     # Tableau des tranches IR
    contributionFamilies.ts  # Regroupement cotisations par finalité
  layouts/
  pages/
  styles/
tests/
  engine/
    simulate.test.ts     # 14 tests IR
    social.test.ts       # 7 tests cotisations salariales
    employer.test.ts     # 7 tests cotisations patronales
    combined.test.ts     # 4 tests chaîne complète
```

Stack : **Astro 6 + React 19 + Recharts + Tailwind v4 + TypeScript + Vitest**

---

## Versions

### v0.1 — Impôt sur le revenu ✅

Barème IR 2026, quotient familial, décote, plafonnement QF, seuil 61 €.
Comparaison deux situations. Graphiques (barres empilées, courbe taux effectif).

### v0.2 — Cotisations sociales salarié ✅

Brut → net avant IR. Vieillesse, Agirc-Arrco, CSG/CRDS, heures sup, mutuelle.
Navigation par onglets (Situation / Salaire / IR).

### v0.3 — Super brut / coût employeur 🚧

Cotisations patronales (25 règles métier RM-200 à RM-225).
RGDU (ex-Fillon) avec formule dégressive P=1,75.
Paramètres employeur ajustables (effectif, AT/MP, transport, prévoyance).
Vue synthèse/détails. Graphique barres empilées 7 colonnes.
Option IR avec taux foyer ou individualisé (formule BOFIP).

### v0.4 — Micro-entrepreneur (à venir)

Cotisations forfaitaires, abattement IR par activité, versement libératoire, ACRE.

### v0.5+ — Roadmap

Comparaison multi-statuts, comparaison de foyers, PAS, CFE/TVA.

---

## Tests

32 tests au total :
- `npx vitest run` — tous doivent passer
- `npm run build` — build statique OK

## Déploiement

GitHub Pages via GitHub Actions (push sur `main`).
CI : build + tests sur PRs vers `main`/`develop`.
