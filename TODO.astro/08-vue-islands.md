# 08 — Vue Islands Conversion

## Goal
Convert interactive Vue components to Astro islands with appropriate hydration directives.

## Hydration Strategy
| Directive | Use Case |
|-----------|----------|
| `client:load` | Immediately needed (header, search, theme toggle) |
| `client:idle` | Needed soon but not critical (citation builder, ontology panels) |
| `client:visible` | Only when scrolled into view (math renderer, back-to-top) |
| `client:media` | Conditionally on viewport size |
| `client:only` | Skip SSR entirely (rare) |

## Components → Islands

### 8.1 Global (header/footer)
- `SiteHeader.vue` (new, extract from Default.vue) — `client:load`
- `GlobalSearch.vue` — inside header, `client:load`
- `LanguageToggle.vue` — inside header, `client:idle`
- `SiteFooter.vue` — static (no island)

### 8.2 Theme & UI
- `useTheme.ts` composable — needs refactor for MPA (persist to localStorage, apply on load)
- `BackToTop.vue` — `client:visible`
- `AppToast.vue` — `client:idle`
- `JsonLd.vue` — static (emits `<script type="application/ld+json>` at build time)
- `JsonLdActions.vue` — static

### 8.3 Content rendering
- `MathRenderer.vue` — `client:visible` (heavy)
- `PartIcon.vue` — static (emoji/text)
- `IsqLogo.vue` — static (SVG)
- `ReferenceBadge.vue` — static

### 8.4 Entry/unit detail
- `CitationBuilder.vue` — `client:idle`
- `EntryOntologyPanel.vue` — `client:idle`
- `UnitOntologyPanel.vue` — `client:idle`
- `DimensionOntologyPanel.vue` — `client:idle`
- `OntologyPanelLayout.vue` — wrapper for above
- `OntologySidebar.vue` — `client:idle`
- `ClassTreeNode.vue` — `client:idle` (recursive)

### 8.5 Search hint
- `SearchHint.vue` — `client:load` (keyboard shortcut listener)

## SPA State Migration
Vue Router params (`useRoute()`) → Astro props (passed from .astro page):
- `useEntry.ts`, `useEntryNav.ts`, `useEntryPage.ts`, `usePartData.ts` — receive data as props instead of reading route

## Acceptance Criteria
- All interactive components hydrate at the right time
- No layout shift on hydration
- No duplicate event listeners across page navigations
- localStorage (theme, recent entries) persists across MPA navigations
