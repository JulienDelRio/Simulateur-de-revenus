# Idées — Simulateur de revenus

## Objectif

Site très user-friendly permettant à un visiteur de simuler ses revenus nets. Cible principale : freelances et entrepreneurs français.

L'objectif principal est de **comparer un revenu actuel et un revenu futur** (ex : changement de poste, passage freelance, augmentation) pour visualiser l'impact sur le net après impôt.

## Structure du dossier specs

- `ideas.md` — ce fichier, idées brutes à transformer en specs
- `docs/` — documentation de référence (barèmes, réglementation, ressources externes)

## Roadmap

### v0.1 — Simulation impôt sur le revenu

Simuler le revenu net après impôt sur le revenu (IR) en comparant une situation actuelle et une situation future.

#### Informations à demander au visiteur

**Situation fiscale (commune aux deux simulations) :**
1. Situation familiale — célibataire, marié/pacsé, veuf
2. Nombre d'enfants à charge
3. Déclaration commune ou séparée (si marié/pacsé)
4. Parent isolé (demi-part supplémentaire)

**Pour chaque simulation (actuel / futur) :**
5. Revenu brut annuel
6. Abattement : 10 % par défaut, avec option pour saisir un montant précis en €

#### Résultats affichés (pour chaque simulation + comparaison)

- Revenu net imposable (après abattement)
- Montant de l'impôt sur le revenu
- Revenu net après impôt
- Taux marginal d'imposition (TMI)
- Décomposition par tranche IR (montant imposé par tranche + taux)
- **Delta actuel vs futur** sur chaque ligne

#### Questions ouvertes

- Gère-t-on les revenus du conjoint séparément ?
- Quel barème IR utiliser ? (année en cours vs année précédente)

#### Graphiques v0.1

- **Barres empilées actuel vs futur** — visualiser la répartition brut → impôt → net pour les deux scénarios côte à côte
- **Courbe du taux effectif d'imposition** — évolution du taux effectif en fonction du revenu, avec les deux points (actuel / futur) marqués dessus. Permet de démystifier le passage d'une tranche à l'autre.

#### Idées de graphiques (futures versions)

- **Camembert / donut** — proportion impôt vs net sur le revenu brut
- **Graphique par tranche** — barres horizontales montrant combien est imposé dans chaque tranche IR

### Futures versions (idées)

- Cotisations sociales (micro-entrepreneur, TNS, salarié)
- Simulation multi-statuts (comparaison SASU / micro / EI)
- Prélèvement à la source (taux personnalisé vs neutre)
- CFE, TVA
- Aide au choix de statut juridique
