# 01 — Expand Vitest Coverage

## Goal
Before any framework migration, establish a comprehensive test suite that covers all business logic. This is the regression safety net — if the Astro migration breaks something, tests must catch it.

## Current State
- vitest 4.1.5 installed and configured (`vitest.config.ts`)
- 5 test files, 103 tests passing
- Coverage: EntryModel, PartRegistry, serialization/jsonld, ontologyConfig, useOntology
- Environment: `node` (needs `happy-dom` for component tests)

## Tasks

### 1.1 Switch test environment to happy-dom
- Install `happy-dom` as devDependency
- Update `vitest.config.ts`: `environment: 'happy-dom'`
- Verify existing tests still pass

### 1.2 Data module tests
- [x] `EntryModel.test.ts` (exists)
- [x] `PartRegistry.test.ts` (exists)
- [x] `jsonld.test.ts` / serialization (exists)
- [x] `ontologyConfig.test.ts` (exists)
- [ ] `urn.test.ts` — URN generation (partUrn, entryUrn, unitUrns, dimensionUrns, entryDualUrn)
- [ ] `citation.test.ts` — BibTeX, Chicago, RIS citation generators
- [ ] `asciidoc.test.ts` — AsciiDoc conversion
- [ ] `DataLoader.test.ts` — part loading, entry counts, bilingual detection, editions

### 1.3 Composable tests
- [x] `useOntology.test.ts` (exists)
- [ ] `useAccent.test.ts`
- [ ] `useEntry.test.ts`
- [ ] `useEntryNav.test.ts`
- [ ] `useEntryPage.test.ts`
- [ ] `useOntologySidebar.test.ts`
- [ ] `usePartData.test.ts`
- [ ] `useRdfExport.test.ts`
- [ ] `useRecentEntries.test.ts`
- [ ] `useSearch.test.ts`
- [ ] `useTheme.test.ts`
- [ ] `useToast.test.ts`

### 1.4 Build plugin tests
- [ ] `math-collector.test.ts` — MathML/LaTeX collection
- [ ] Build stages (load-entries, build-parts, build-xrefs, build-units, build-dimensions, build-documents, build-domain-index)
- [ ] `ontology-data-plugin.test.ts` — TTL parsing, entity extraction

### 1.5 Component smoke tests (optional)
- [ ] `IsqLogo.test.ts` — renders SVG
- [ ] `MathRenderer.test.ts` — renders MathML
- [ ] `SiteFooter.test.ts` — renders links
- [ ] `JsonLd.test.ts` — emits script tag

## Acceptance Criteria
- All tests pass: `npm test`
- Coverage covers every public function in `src/data/` and `src/composables/`
- No test uses mocks/doubles for internal types (per CLAUDE.md rule)
- Test fixtures use real data shapes from `src/data/generated/`
