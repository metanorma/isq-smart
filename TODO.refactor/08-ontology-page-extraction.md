# 08 — Ontology detail page section extraction

## Problem
`ontology/[slug].astro` (1022 lines) renders many sections inline:
ancestors, subclasses, properties, constraints, instances, where-used,
concept shapes, etc. Each section has its own heading, table, and styling.

## Solution
Extract sections into components under `src/components/ontology/`:
- OntologyAncestors.astro
- OntologySubclasses.astro
- OntologyProperties.astro
- OntologyConstraints.astro
- OntologyInstances.astro
- OntologyWhereUsed.astro

Parallel to the entry detail component extraction (EntryDefinition,
EntryNotes, EntryReferencedBy).

## Status
Pending — 1022-line page template is large but functional. Extraction
reduces risk of merge conflicts and improves locality.
