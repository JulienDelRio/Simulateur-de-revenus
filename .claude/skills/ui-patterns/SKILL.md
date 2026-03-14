---
name: ui-patterns
description: Frontend component structure, state management, routing, and accessibility conventions
---

# Skill: UI Patterns

Frontend component and state conventions for this project.

> **See also**: `.claude/rules/coding-style.md` (naming conventions)

## Component Structure

- One component per file
- Name components with PascalCase: `PropertyCard`, `SearchFilter`
- Co-locate related files (component, styles, tests) in the same directory
- Keep components small — extract when a component exceeds ~150 lines

```
components/
  PropertyCard/
    PropertyCard.tsx
    PropertyCard.test.tsx
    PropertyCard.module.css
```

<!-- TODO: finalize component file structure when frontend framework is chosen -->

## Component Naming

- Pages/routes: `<Name>Page` (`SearchPage`, `PropertyDetailPage`)
- Layouts: `<Name>Layout` (`MainLayout`, `AuthLayout`)
- Reusable UI: descriptive noun (`PropertyCard`, `PriceTag`, `SearchFilter`)
- Containers/logic wrappers: `<Name>Container` if separating logic from presentation

## State Management

- Local state for UI-only concerns (form inputs, toggles, modals)
- Shared state for cross-component data (search results, user preferences)
- Server state (fetched data) should be managed by a data-fetching library, not manual state

<!-- TODO: choose state management solution when frontend stack is decided -->

## Routing

- Use descriptive URL paths: `/properties/:id`, `/search`, `/saved-searches`
- Match API resource paths where possible
- Handle 404 gracefully with a dedicated not-found page

<!-- TODO: define route structure when pages are specified -->

## Accessibility Basics

- All images must have `alt` text (empty `alt=""` for decorative images)
- Interactive elements must be keyboard-navigable
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<button>`) over generic `<div>`
- Form inputs must have associated `<label>` elements
- Color contrast: minimum 4.5:1 ratio for text
- Provide visible focus indicators — never remove `outline` without a replacement

## Responsive Design

- Mobile-first approach
- Breakpoints: define a small set and use consistently
- Touch targets: minimum 44x44px for interactive elements

<!-- TODO: define breakpoints and design tokens when UI design is established -->
