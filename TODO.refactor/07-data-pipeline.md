# 07 — Data Pipeline: New Build Stages

## Goal

Wire the new build stages into the Vite data plugin and generate TypeScript modules for the concept hierarchy.

## Changes to `yaml-data-plugin.ts`

Add calls to new build stages:
```typescript
const { kinds, quantityToKind } = buildKinds(raw.quantities, ctx)
const hierarchy = buildHierarchy(raw.quantities, kinds, quantityToKind)
const { entityKinds, entities, quantityEntities } = buildEntities(raw.quantities, ctx)
```

### New generated files
- `generated/kinds.ts` — KindOfQuantity[] and quantityToKind map
- `generated/hierarchy.ts` — broader/narrower adjacency
- `generated/entities.ts` — entity taxonomy + quantity-entity links
- `generated/concepts.ts` — unified concept index (all concept nodes)

### Meta.ts update
Add kind and entity counts to `partSummaries`:
```typescript
summaries[partKey] = { ..., kindCount: number, entityCount: number }
```

## Build order

1. `loadEntries` → raw YAML data
2. `buildParts` → per-part modules (existing)
3. `buildKinds` → kind-of-quantity derivation (NEW)
4. `buildHierarchy` → broader/narrower (NEW, depends on kinds)
5. `buildEntities` → entity taxonomy (NEW)
6. `buildUnits` → unit extraction (existing)
7. `buildDimensions` → dimension linking (existing)
8. `buildXrefs` → cross-references (existing)

## Status: DONE
