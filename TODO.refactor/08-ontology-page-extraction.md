# 08 — Ontology detail page section extraction

## Status: Evaluated — high risk, moderate reward

## Analysis
The ontology/[slug].astro page is 1022 lines (70 frontmatter + 952 template).
The template has tabbed panels with tightly coupled inline sections that
reference the OntologyEntityView model extensively.

Extracting sections into components would:
- Reduce the main file by ~400 lines
- Create 5-6 new component files
- Each taking `view: OntologyEntityView` as a prop

However:
- Sections are tightly coupled to view model fields (ancestors, subclasses,
  properties, constraints, instances, where-used, concept shapes)
- The "Where Used" section is only 14 lines — extraction adds indirection
  without reducing complexity
- Risk: any mistake breaks 200+ ontology pages
- The page works correctly today

**Decision**: Defer extraction until a specific need arises (e.g., reusing
a section on another page, or the file becoming unmanageable during a feature
addition). The current monolithic template is functional and well-organized
internally with clear section comments.
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
