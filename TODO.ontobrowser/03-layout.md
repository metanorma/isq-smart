# 03 — Ontology Layout

## Goal
Two-column layout: sticky sidebar (left, 280px) + content area (right, flex-1).

## File: `src/layouts/OntologyLayout.astro`
- Sidebar on desktop (lg+), drawer on mobile
- Content area scrolls independently
- Used by ALL ontology sub-pages

## Pages to update:
- /ontology/index.astro → overview in content area
- /ontology/[slug].astro → entity detail
- /ontology/diagram.astro → class diagram
- /ontology/concepts.astro → concepts listing
- /ontology/properties.astro → properties listing
- /ontology/shapes.astro → shapes listing
- /ontology/individuals.astro → individuals listing
- /ontology/statistics.astro → statistics

## Status: DONE
