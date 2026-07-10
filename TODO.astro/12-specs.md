# 12 — Specs

## Goal
Comprehensive test coverage for all data modules and composables. Tests must pass before and after migration.

## Current State
- 161 tests passing across 11 test files
- Environment: `happy-dom`

## Test Files

### Data layer (existing + new)
- [x] `EntryModel.test.ts`
- [x] `PartRegistry.test.ts`
- [x] `jsonld.test.ts` (serialization)
- [x] `ontologyConfig.test.ts`
- [x] `urn.test.ts`
- [x] `citation.test.ts`
- [x] `DataLoader.test.ts`
- [ ] `asciidoc.test.ts` — AsciiMath conversion
- [ ] `serialization.test.ts` — deeper Turtle/RDF tests

### Composables (existing + new)
- [x] `useOntology.test.ts`
- [x] `useAccent.test.ts`
- [x] `useRecentEntries.test.ts`
- [x] `useToast.test.ts`
- [ ] `useSearch.test.ts` — search index, filtering
- [ ] `useTheme.test.ts` — theme toggle, persistence
- [ ] `useRdfExport.test.ts` — RDF export generation

### Build pipeline
- [ ] `math-collector.test.ts` — MathML/LaTeX collection
- [ ] Build stages — load-entries, build-parts, build-xrefs, etc.

### Acceptance Criteria
- All tests use real model instances (no doubles per CLAUDE.md)
- Test fixtures use real data shapes from `src/data/generated/`
- `npm test` passes 100%
