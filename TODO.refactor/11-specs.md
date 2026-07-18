# 11 — Specs: Comprehensive Test Coverage

## Goal

Write thorough tests for all new ontology model code, build stages, serialization, and UI components.

## Test files

### Model tests
- `src/data/ontology/__tests__/concepts.test.ts`
  - Type narrowing works for each `_level` / `_axis` combination
  - Factory functions create valid concept nodes
  - IRI generation is deterministic

### Build stage tests
- `build/__tests__/build-kinds.test.ts`
  - Correctly groups quantities by dimension
  - Handles entries with no units (edge case)
  - Dimension label mapping covers common cases
  - Auto-generates labels for unmapped dimensions

- `build/__tests__/build-hierarchy.test.ts`
  - Kind hierarchy: every quantity linked to its kind
  - Naming patterns: "specific X" → broader "X"
  - "massic/volumic/lineic X" → broader "X"
  - No false positives on unrelated entries

- `build/__tests__/build-entities.test.ts`
  - Particle/quantum detection from designations
  - "of X" pattern extraction
  - Entity kind classification

### Serialization tests
- `src/data/__tests__/serialization.test.ts`
  - JSON-LD includes hasKind, broader, narrower
  - Turtle output valid for new properties
  - KindOfQuantity serialization produces correct triples

### Component tests
- `src/components/__tests__/KindBrowser.test.ts`
- `src/components/__tests__/ConceptTree.test.ts`
- `src/components/__tests__/BroaderNarrowerList.test.ts`
- `src/components/__tests__/EntityList.test.ts`

## Testing principles

- Real data instances (no mocks/doubles)
- Test behavior, not implementation
- One assertion per test where possible
- Use the actual dataset for integration tests

## Status: DONE
