# 06 — Specs

## Current: 161 tests, 11 files

## Missing Tests

### Composables
- [ ] `useSearch.test.ts` — search index building, filtering by query/domain, result limiting
- [ ] `useTheme.test.ts` — toggle, persistence (localStorage), SSR safety
- [ ] `useRdfExport.test.ts` — RDF/Turtle generation from entries

### Vue Islands (component tests using @vue/test-utils or mount testing)
- [ ] `ThemeToggle.test.ts` — renders sun/moon, toggles on click
- [ ] `RecentEntries.test.ts` — reads localStorage on mount, renders links
- [ ] `EntryBrowser.test.ts` — search filters results, part filter works, show-more expands
- [ ] `UnitBrowser.test.ts` — search filters, group toggle works

### Build Pipeline
- [ ] `build/stages/load-entries.test.ts` — YAML loading, entry filtering
- [ ] `build/stages/build-parts.test.ts` — part module generation
- [ ] `build/math-collector.test.ts` — MathML/LaTeX collection and rendering

### Acceptance Criteria
- All tests use real data models (no mocks/doubles per CLAUDE.md)
- `npm test` passes 100%
- Coverage covers every public function in data layer and composables
