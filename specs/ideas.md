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
4. Parent isolé (demi-part supplémentaire, garde exclusive uniquement)

**Pour chaque simulation (actuel / futur) :**
5. Revenu brut annuel
6. Abattement : 10 % par défaut, avec option pour saisir un montant précis en €

#### Revenus du foyer

Par défaut, on demande les revenus du foyer. Option pour séparer les revenus du déclarant et du conjoint.
Si revenus séparés : chaque membre peut choisir indépendamment entre abattement 10 % et frais réels.
Si revenus du foyer : un seul choix d'abattement pour le foyer.

#### Règles de calcul intégrées

- **Barème IR** : dernier barème connu (2026, revenus 2025), affiché explicitement à l'utilisateur
- **Décote** : réduction pour faibles impositions (célibataire et couple)
- **Plafonnement du quotient familial** : 1 807 € par demi-part supplémentaire
- **Seuil de recouvrement** : impôt non dû si < 61 €
- **Arrondis fiscaux** : IR arrondi à l'euro inférieur

#### Résultats affichés (pour chaque simulation + comparaison)

- Revenu net imposable (après abattement)
- Montant de l'impôt sur le revenu (après décote et plafonnement)
- Revenu net après impôt
- Taux marginal d'imposition (TMI)
- Taux effectif d'imposition
- Décomposition par tranche IR (montant imposé par tranche + taux)
- **Delta actuel vs futur** sur chaque ligne

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
- *(option)* Heures supplémentaires défiscalisées (montant annuel)
- *(option)* Mutuelle obligatoire (montant mensuel salarié)

#### Résultats supplémentaires affichés

- Détail des cotisations salariales (CSG, CRDS, retraite, etc.)
- Salaire net avant impôt
- Taux global de cotisations salariales
- Uniquement la part salariale (le coût employeur / super brut arrive en v0.4)

### v0.3 — Micro-entrepreneur

Cotisations sociales forfaitaires (taux fixe selon type d'activité) et abattement IR spécifique par activité.

#### Types d'activité

- BIC vente (abattement 71 %)
- BIC prestation de services (abattement 50 %)
- BNC (abattement 34 %)

#### Options à gérer

- **Versement libératoire de l'IR** — taux forfaitaire sur le CA au lieu du barème progressif
- **ACRE** — exonération partielle de cotisations la première année

#### Questions ouvertes

- Vérifie-t-on / affiche-t-on les seuils de CA (188 700 € / 77 700 €) ?

### v0.4 — Super brut / coût employeur

Ajouter le calcul du super brut (coût total employeur) pour les salariés : salaire brut + cotisations patronales.
Permet de visualiser la chaîne complète : super brut → brut → net avant impôt → net après IR.

### v0.5 — Comparaison multi-statuts

Comparaison côte à côte : salarié vs micro-entrepreneur vs SASU vs EI.

### v0.6 — Comparaison de foyers

Comparer deux foyers avec des compositions différentes (situation familiale, nombre d'enfants, parts) pour un même niveau de revenus. Permet de visualiser l'impact de la structure du foyer sur l'imposition.

### Futures versions (idées)

- Prélèvement à la source (taux personnalisé vs neutre)
- CFE, TVA
- Aide au choix de statut juridique

## Idées sans version attribuée

- **Résidence alternée** — gestion des parts fiscales en garde alternée (plus complexe que la garde exclusive)
- **Divorcé / séparé** — distinguer du statut célibataire (demi-part si a élevé seul un enfant 5 ans+)
- **Régime Alsace-Moselle** — cotisation maladie salariale supplémentaire de 1,30 %
- **Demi-part invalidité / ancien combattant** — cas spéciaux de parts supplémentaires
- **Accessibilité** — conformité WCAG, navigation clavier, lecteur d'écran
