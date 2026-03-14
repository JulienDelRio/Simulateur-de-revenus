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

### v0.2 — Cotisations sociales salarié (brut → net)

Ajouter le calcul du passage salaire brut → salaire net avant impôt pour les salariés.
Complète la v0.1 : le visiteur entre un salaire brut et obtient toute la chaîne brut → net après cotisations → net imposable → net après IR.

#### Informations supplémentaires à demander

- Statut : cadre / non-cadre (impact sur le taux de cotisation)
- Temps partiel éventuel (pour le calcul des plafonds sécu)

#### Résultats supplémentaires affichés

- Détail des cotisations salariales (CSG, CRDS, retraite, chômage, etc.)
- Salaire net avant impôt
- Taux global de cotisations salariales
- Coût total employeur (si pertinent)

#### Questions ouvertes

- Gère-t-on les heures supplémentaires défiscalisées ?
- Intègre-t-on la mutuelle obligatoire ?
- Affiche-t-on le coût employeur ou uniquement la part salariale ?

### v0.3 — Micro-entrepreneur

Cotisations sociales forfaitaires (taux fixe selon type d'activité) et abattement IR spécifique par activité (34 %, 50 % ou 71 %).

### v0.4 — Super brut / coût employeur

Ajouter le calcul du super brut (coût total employeur) pour les salariés : salaire brut + cotisations patronales.
Permet de visualiser la chaîne complète : super brut → brut → net avant impôt → net après IR.

### Futures versions (idées)

- v0.5 — Comparaison multi-statuts (salarié vs micro vs SASU vs EI)
- Prélèvement à la source (taux personnalisé vs neutre)
- CFE, TVA
- Aide au choix de statut juridique
