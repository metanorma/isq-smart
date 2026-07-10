# Astro Migration — Architecture & Strategy

## Target Stack
- **Astro 7** — host framework, file-based routing, static-first SSR
- **Vite 8** — bundled with Astro, runs all plugins
- **Tailwind CSS 4** — via `@tailwindcss/vite` plugin
- **Vue 3** — via `@astrojs/vue`, interactive islands only

## Architectural Principles
1. **OCP** — pages open for extension via props/frontmatter, closed for modification
2. **DRY** — shared patterns extracted to layouts and components
3. **MECE** — each concern lives in exactly one place (data, layout, island, page)
4. **Model-driven** — data layer (PartRegistry, EntryModel) is the single source of truth
5. **Encapsulation** — Vue islands receive data as props, never access route/router directly
6. **Single source of truth** — `SiteConfig` for config, `PartRegistry` for part metadata

## Layer Architecture

```
Layer 1: Build-time data generation
  build/stages/*.ts → src/data/generated/*.ts (auto-generated)

Layer 2: Data access (single source of truth)
  src/data/PartRegistry.ts    — part metadata, domains, documents
  src/data/EntryModel.ts      — entry model with methods
  src/data/DataLoader.ts      — lazy part loading
  src/data/urn.ts             — URN generation
  src/data/citation.ts        — citation generation
  src/data/serialization.ts   — JSON-LD/Turtle serialization

Layer 3: Astro layouts (static HTML shell)
  BaseLayout.astro      — HTML, meta, fonts, dark-mode flash prevention
  DefaultLayout.astro   — header (static), footer, island slots
  OntologyLayout.astro  — ontology browser chrome

Layer 4: Astro pages (native .astro templates)
  Static:   index, about, reference, 404
  Listing:  quantities, math, units, dimensions, documents, ontology
  Detail:   part, entry, unit, dimension, document, ontology-detail

Layer 5: Vue islands (interactive only, hydrated client-side)
  Header:     ThemeToggle, MobileNav, GlobalSearch, SearchHint
  UI:         BackToTop, AppToast, RecentEntries
  Content:    MathRenderer, CitationBuilder
  Ontology:   OntologySidebar, EntryOntologyPanel, UnitOntologyPanel,
              DimensionOntologyPanel, ClassTreeNode, OntologyPanelLayout

Layer 6: Static .astro components (no JavaScript)
  IsqLogo.astro, PartIcon.astro, ReferenceBadge.astro
```

## Hydration Strategy
| Directive | Components |
|-----------|-----------|
| `client:load` | ThemeToggle, MobileNav, SearchHint |
| `client:idle` | GlobalSearch, AppToast, RecentEntries, CitationBuilder, Ontology* |
| `client:visible` | BackToTop, MathRenderer |

## Migration Status
- ✅ Astro config, base path (dev: `/`, build: `/isq-smart/`)
- ✅ BaseLayout.astro, DefaultLayout.astro (static header HTML)
- ✅ ThemeToggle, MobileNav, RecentEntries islands
- ✅ GlobalSearch updated (listens for `open-search` event)
- ✅ index.astro rewritten as native .astro (not wrapper)
- ⬜ All other pages still use wrapper approach — must rewrite as native .astro
- ⬜ Delete wrapper components (src/components/pages/)
- ⬜ Remove vue-router dependency
- ⬜ Comprehensive specs
