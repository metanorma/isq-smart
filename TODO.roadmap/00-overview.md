# Roadmap Overview

## Goals
- Full bilingual (eng/fra) site with first-class language support
- Clean, deep module architecture following OCP, DRY, MECE
- Comprehensive test coverage
- Model-driven, semantically-driven code

## Active Roadmap Items

| # | Title | Priority | Status |
|---|-------|----------|--------|
| 01 | [eng/fra first-class language architecture](01-eng-fra-first-class.md) | P0 | pending |
| 02 | [Deepen i18n module: split store, lookup, DOM translator](02-i18n-module-deepening.md) | P0 | pending |
| 03 | [Deepen entryViewModel into composed resolvers](03-entry-view-model-deepening.md) | P1 | pending |
| 04 | [Deepen PartRegistry into catalog + router + summary](04-part-registry-deepening.md) | P1 | pending |
| 05 | [Unify math/quantities detail page templates](05-unified-detail-page.md) | P1 | pending |
| 06 | [MDX content collections per locale for long-form pages](06-mdx-content-collections.md) | P2 | pending |
| 07 | [Full data-i18n coverage on all 33 pages](07-full-i18n-page-coverage.md) | P2 | pending |
| 08 | [Specs: comprehensive test coverage for new modules](08-specs-coverage.md) | P1 | pending |

## Principles Applied
- **OCP**: New languages/pages/features added by extension, not modification
- **DRY**: Single source of truth for translations, part metadata, entry rendering
- **MECE**: Each concern in exactly one module; no overlap
- **Model-driven**: Modules named after domain concepts
- **No dynamic dispatch**: No `eval`, no bracket-notation property access on unknown types
- **Proper typing**: TypeScript types, not runtime duck-typing
- **Lazy loading**: Dynamic imports for code-splitting where appropriate
