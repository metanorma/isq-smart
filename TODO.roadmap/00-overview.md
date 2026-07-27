# Roadmap Overview

## Goals
- Full bilingual (eng/fra) site with first-class language support
- Clean, deep module architecture following OCP, DRY, MECE
- Comprehensive test coverage
- Model-driven, semantically-driven code

## Active Roadmap Items

| # | Title | Priority | Status |
|---|-------|----------|--------|
| 01 | [eng/fra first-class language architecture](01-eng-fra-first-class.md) | P0 | done (Language.ts) |
| 02 | [Deepen i18n module: split store, lookup, DOM translator](02-i18n-module-deepening.md) | P0 | done |
| 03 | [Deepen entryViewModel into composed resolvers](03-entry-view-model-deepening.md) | P1 | done (EntryContentRenderer, EntryAccentResolver) |
| 04 | [Deepen PartRegistry into catalog + router + summary](04-part-registry-deepening.md) | P1 | done |
| 05 | [Unify math/quantities detail page templates](05-unified-detail-page.md) | P1 | done (via 11: component extraction) |
| 06 | [MDX content collections per locale for long-form pages](06-mdx-content-collections.md) | P2 | infrastructure done |
| 07 | [Full data-i18n coverage on all 33 pages](07-full-i18n-page-coverage.md) | P2 | in progress |
| 08 | [Specs: comprehensive test coverage for new modules](08-specs-coverage.md) | P1 | done (593 tests) |
| 09 | [Component-level i18n: PageHero, Breadcrumb](09-component-i18n.md) | P2 | done |
| 10 | [Serialization deepening: JSON-LD vs Turtle](10-serialization-deepening.md) | P1 | done |
| 11 | [Entry detail shared components](11-entry-detail-components.md) | P1 | done |
| 12 | [PathResolver centralized URL construction](12-path-resolver.md) | P1 | done |
| 13 | [EntryModel deepening](13-entry-model-deepening.md) | P1 | done |
| 14 | [AccentPalette purification](14-accent-palette-purification.md) | P1 | done |
| 15 | [Build pipeline formalization](15-build-pipeline-formalization.md) | P2 | evaluated — sufficient |
| 16 | [Search system purification](16-search-purification.md) | P2 | done |
| 17 | [Identifier module](17-identifier-module.md) | P2 | evaluated — sufficient |
| 18 | [DataProvider pattern](18-data-provider.md) | P2 | done |
| 19 | [LocalFilter purification](19-local-filter-purification.md) | P2 | done |
| 20 | [PartKey class](20-part-key-class.md) | P3 | evaluated — sufficient |

## Principles Applied
- **OCP**: New languages/pages/features added by extension, not modification
- **DRY**: Single source of truth for translations, part metadata, entry rendering
- **MECE**: Each concern in exactly one module; no overlap
- **Model-driven**: Modules named after domain concepts
- **No dynamic dispatch**: No `eval`, no bracket-notation property access on unknown types
- **Proper typing**: TypeScript types, not runtime duck-typing
- **Lazy loading**: Dynamic imports for code-splitting where appropriate
