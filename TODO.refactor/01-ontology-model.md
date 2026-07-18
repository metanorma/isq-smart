# 01 — Ontology Model: Pendrill Concept Hierarchy

## Goal

Refactor the flat ontology model (`isq:Quantity`, `isq:MathConcept`) into a layered concept hierarchy that reflects Pendrill (2024) — four levels (0–3) across three parallel axes (quantity, entity, measurement).

## Background

Current model in `browser/src/data/types.ts` and `browser/src/data/ontologyConfig.ts` treats every ISO 80000 entry as a flat `QuantityEntry` with no concept hierarchy. Pendrill's model distinguishes:

- **L0 — Kind of quantity**: abstract category (e.g., "length-type" — all quantities of dimension L)
- **L1 — Quantity**: named, defined concept (e.g., "length") ← current model lives here
- **L2 — Dedicated/Entity quantity**: quantity bound to an entity kind (e.g., "length of rod")
- **L3 — Measured quantity**: individual measurement result (e.g., "1.234 m")

Parallel **Entity** hierarchy: kind of entity → entity → entity instance.
Parallel **Measurement** hierarchy: quantity as measured (L3 only).

## Scope (this TODO)

- [x] Define `ConceptLevel`, `ConceptAxis` enums
- [x] Define `ConceptNode` base interface (id, iri, level, axis, prefLabel, altLabels, definition)
- [x] Define `KindOfQuantity` (L0, quantity axis) with dimension + member quantity IDs
- [x] Define `QuantityConcept` (L1, quantity axis) extending current `QuantityEntry` with `kindId`, `broader`, `narrower`
- [x] Define `EntityKind` (L1, entity axis)
- [x] Define `EntityConcept` (L2, entity axis) with `kindId`
- [x] Define `DedicatedQuantity` (L2, quantity axis) binding a quantity to an entity kind
- [x] Define `ConceptHierarchy` builder type (adjacency lists for broader/narrower)
- [x] Use discriminated unions (`_level` / `_axis`) for type-safe dispatch
- [x] All types in `browser/src/data/ontology/concepts.ts` (new file)
- [x] Re-export from `browser/src/data/ontology/index.ts`

## Out of scope

- Data population (TODO 03, 04, 05)
- Serialization (TODO 06)
- UI (TODO 08–10)
- Specs (TODO 11)

## OCP compliance

New concept levels (e.g., L3 MeasuredQuantity) can be added by extending the discriminated union — no modification to existing concept code. Each concept type is a sealed variant of `ConceptNode`.

## Status: DONE
