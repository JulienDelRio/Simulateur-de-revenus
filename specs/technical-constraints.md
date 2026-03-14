# Contraintes techniques

## Hébergement

- **GitHub Pages** — site statique uniquement
- Pas de backend, pas de base de données, pas de server-side rendering
- Tous les calculs sont effectués côté client (JavaScript/TypeScript)
- Pas de stockage de données utilisateur côté serveur

## Conséquences

- Les barèmes et taux doivent être embarqués dans le code (fichier de config ou JSON)
- Mise à jour des barèmes = nouveau déploiement
- Aucune API externe nécessaire pour les calculs

## Stack technique

| Rôle | Technologie | Justification |
|------|-------------|---------------|
| Framework principal | **Astro** | Build statique, SEO natif (HTML pré-rendu), intégration React pour l'interactivité |
| Composants interactifs | **React** (via Astro) | Formulaires, graphiques, état local |
| Graphiques | **Recharts** | API React déclarative, basé sur D3, barres empilées et courbes |
| CSS | **Tailwind CSS** | Mobile-first par défaut, responsive intégré |
| Langage | **TypeScript** | Typage des calculs fiscaux, fiabilité |
| Build / Dev | **Vite** (intégré à Astro) | Hot reload, build rapide |

## Responsive

- Mobile-first dès la v0.1
- Tailwind CSS gère les breakpoints

## SEO

- Astro génère du HTML statique (contenu indexable par les moteurs de recherche)
- Meta tags, titres et descriptions gérés nativement par Astro
- Les composants React sont hydratés côté client uniquement quand nécessaire (`client:load` / `client:visible`)
