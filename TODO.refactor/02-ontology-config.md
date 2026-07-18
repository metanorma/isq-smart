# 02 — Ontology Config: New Classes and Properties

## Goal

Extend `ontologyConfig.ts` with new ontology classes and properties for the Pendrill concept hierarchy.

## Changes

### New classes (in `ONTOLOGY_CLASSES`)
- `KindOfQuantity` (`isq:KindOfQuantity`) — L0 concept grouping quantities of the same kind
- `EntityKind` (`isq:EntityKind`) — L1 entity category (physical body, substance, field)
- `EntityConcept` (`isq:EntityConcept`) — L2 specific entity type (rod, electron)
- `DedicatedQuantity` (`isq:DedicatedQuantity`) — L2 quantity bound to entity

### New properties (in `ONTOLOGY_PROPERTIES`)
- `hasKind` (`isq:hasKind`) — links a quantity to its kind-of-quantity
- `characterizes` (`isq:characterizes`) — links a dedicated quantity to its entity
- `broader` (`skos:broader`) — SKOS broader concept
- `narrower` (`skos:narrower`) — SKOS narrower concept
- `definedByEquation` (`isq:definedByEquation`) — links quantity to its defining equation

### New badge colors
- `KindOfQuantity` — indigo (abstract/conceptual)
- `EntityKind` / `EntityConcept` — rose (physical world)
- `DedicatedQuantity` — amber (bound/specific)

## OCP compliance

Classes and properties are `const` maps. Adding new entries doesn't modify existing keys. Badge colors use the same pattern.

## Status: DONE
