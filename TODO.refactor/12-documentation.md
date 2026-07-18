# 12 — Documentation: Ontology Model Docs

## Goal

Document the new ontology model, concept hierarchy, and alignment with Pendrill (2024).

## Documentation updates

### README.adoc
Add new section: "Concept Hierarchy" explaining:
- Four levels (0–3) and three axes (quantity, entity, measurement)
- How ISO 80000 entries map to Level 1
- How kinds of quantity are derived
- Reference to Pendrill (2024) doi:10.1515/9783111036496-002

### Ontology page (`/ontology`)
Update to show:
- New concept classes with descriptions
- Visual hierarchy diagram
- Links to browse by concept type

### Inline code documentation
- `ontology/concepts.ts` — JSDoc on each interface explaining its level/axis
- `ontologyConfig.ts` — JSDoc on new classes/properties
- Build stages — JSDoc on algorithm

### Architecture decision record
Create `docs/adr/001-pendrill-concept-hierarchy.md`:
- Context: why align with Pendrill's model
- Decision: which levels to implement (0, 1, 2 — not 3)
- Consequences: what's gained, what's deferred

## Status: DONE
