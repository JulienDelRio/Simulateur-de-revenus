# Glossaire

Definitions des termes utilises dans les specifications du simulateur de revenus. Ce glossaire est partage entre toutes les versions.

## Termes fiscaux generaux

**Revenu brut (annuel)**
Montant total des revenus percus avant toute deduction (abattement, cotisations). Dans le contexte de la v0.1, il s'agit du revenu d'activite declare (salaires et traitements).

**Revenu net imposable**
Montant du revenu soumis a l'impot, apres deduction de l'abattement forfaitaire de 10 % (ou des frais reels). Formule : `revenu_brut - abattement`.

**Revenu net apres impot**
Montant restant apres paiement de l'impot sur le revenu. Formule : `revenu_brut - impot_sur_le_revenu`.

**Foyer fiscal**
Ensemble des personnes figurant sur une meme declaration de revenus : le declarant, le conjoint eventuel (si declaration commune), et les personnes a charge (enfants).

**Declarant**
Personne principale du foyer fiscal. En cas de declaration commune, le declarant est accompagne d'un conjoint.

**Conjoint**
Seconde personne du foyer fiscal dans le cas d'un couple marie ou pacse en declaration commune.

## Impot sur le revenu (IR)

**Bareme progressif de l'IR**
Grille de taux d'imposition appliquee par tranches au revenu net imposable par part. Chaque tranche de revenu est imposee a un taux different, croissant. Le bareme est revise chaque annee dans la loi de finances.

**Tranche d'imposition**
Intervalle de revenu (par part) auquel s'applique un taux d'imposition specifique. Par exemple, la tranche de 11 601 EUR a 29 579 EUR est imposee a 11 %.

**Taux marginal d'imposition (TMI)**
Taux de la tranche d'imposition la plus elevee dans laquelle tombe le revenu par part du foyer. Il represente le taux auquel est impose le dernier euro gagne. Ce n'est pas le taux moyen d'imposition.

**Taux effectif d'imposition**
Ratio entre l'impot effectivement paye et le revenu net imposable. Formule : `impot / revenu_net_imposable * 100`. Represente la charge fiscale reelle en pourcentage.

**Impot brut**
Montant de l'impot calcule en appliquant le bareme progressif, avant application de la decote et du seuil de recouvrement.

## Quotient familial

**Quotient familial**
Mecanisme qui divise le revenu net imposable par un nombre de parts fiscales, afin de tenir compte de la composition du foyer. L'impot est calcule sur le revenu par part, puis multiplie par le nombre de parts.

**Part fiscale**
Unite de mesure de la taille du foyer fiscal. Un celibataire = 1 part, un couple = 2 parts. Les enfants ajoutent des demi-parts ou parts supplementaires.

**Nombre de parts**
Total des parts fiscales du foyer, determine par la situation familiale et le nombre de personnes a charge. Voir les regles detaillees dans la specification v0.1.

**Demi-part supplementaire**
Part fiscale additionnelle attribuee au-dela des parts de base (1 ou 2 selon la situation). Les enfants a charge et certaines situations (parent isole) donnent droit a des demi-parts supplementaires.

**Plafonnement du quotient familial**
Limitation de l'avantage fiscal procure par les demi-parts supplementaires. En 2026, le plafond general est de 1 807 EUR par demi-part supplementaire. Des plafonds specifiques existent (parent isole : 4 262 EUR pour la premiere demi-part).

## Abattements et deductions

**Abattement forfaitaire de 10 %**
Deduction automatique de 10 % appliquee sur les revenus d'activite pour tenir compte des frais professionnels. Soumis a un plancher (509 EUR) et un plafond (14 555 EUR) par membre du foyer.

**Frais reels**
Option permettant au contribuable de deduire le montant exact de ses frais professionnels a la place de l'abattement forfaitaire de 10 %. Le contribuable doit etre en mesure de justifier ces frais.

## Mecanismes de correction

**Decote**
Reduction d'impot accordee aux foyers dont l'impot brut est faible. Elle est degressive : plus l'impot est eleve, plus la decote diminue, jusqu'a disparaitre. En 2026 : 897 EUR - (impot * 45,25 %) pour un celibataire, 1 483 EUR - (impot * 45,25 %) pour un couple.

**Seuil de recouvrement**
Montant en dessous duquel l'impot n'est pas mis en recouvrement (non exige). En 2026 : 61 EUR. Si l'impot calcule est inferieur a ce seuil, il est ramene a 0 EUR.

**Arrondi fiscal**
L'impot sur le revenu est arrondi a l'euro inferieur (troncature). Par exemple, 1 563,78 EUR devient 1 563 EUR.

## Situations familiales

**Celibataire**
Personne non mariee et non pacsee. Base : 1 part fiscale.

**Marie / pacse**
Personne mariee ou liee par un PACS. En declaration commune : 2 parts de base pour le foyer.

**Veuf / veuve**
Personne dont le conjoint est decede. Avec enfants a charge : conserve les 2 parts de base du couple. Sans enfant : 1 part.

**Parent isole**
Personne seule (celibataire, divorcee, separee, veuve) assumant seule la charge d'au moins un enfant. Beneficie d'une demi-part supplementaire (case T de la declaration). En v0.1 : seule la garde exclusive est geree.

**Declaration commune**
Mode de declaration par defaut pour les couples maries ou pacses : les revenus des deux membres sont additionnes et imposes ensemble avec les parts du foyer.

**Declaration separee**
Mode de declaration optionnel pour les couples maries ou pacses : chaque membre declare et est impose individuellement.

## Termes prevus pour les versions futures

**Cotisations sociales**
Prelevements obligatoires sur les revenus d'activite, destines a financer la protection sociale (maladie, retraite, chomage). Part salariale et part patronale. Prevu pour la v0.2.

**Salaire net avant impot**
Salaire brut apres deduction des cotisations sociales salariales, avant prelevement de l'impot sur le revenu. Prevu pour la v0.2.

**Super brut / cout employeur**
Cout total du salarie pour l'employeur : salaire brut + cotisations patronales. Prevu pour la v0.4.

**Micro-entrepreneur**
Statut simplifie pour les travailleurs independants, avec cotisations forfaitaires et abattement fiscal specifique selon le type d'activite. Prevu pour la v0.3.
