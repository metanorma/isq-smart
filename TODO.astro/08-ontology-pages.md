# 08 — Ontology Pages

## Goal
Rewrite ontology listing and detail pages. These are the most interactive pages — heavy use of Vue islands.

## Pages & Sources

| Route | Astro file | Source Vue component |
|-------|-----------|---------------------|
| `/ontology` | `ontology/index.astro` | `OntologyPage.vue` |
| `/ontology/{slug}` | `ontology/[slug].astro` | `OntologyDetailPage.vue` |

## Architecture
- Ontology listing: static grid of entities + `<OntologySidebar client:idle />` for navigation
- Ontology detail: static entity info + `<OntologyPanelLayout client:idle />` for SHACL shapes, class hierarchy
- Both use `OntologyLayout.astro` (TODO: create) with sidebar slot

## Data
- `ontologyEntities` from `src/data/generated/ontology.ts`
- `ontologyPrefixes`, `ontologyTypeMeta`, `ontologyNamespaces`
- `useOntology` composable for hierarchy walking

## Tasks
- [ ] Create `OntologyLayout.astro` — sidebar + content slot
- [ ] Rewrite `ontology/index.astro` — entity grid, namespace cards
- [ ] Rewrite `ontology/[slug].astro` — entity detail with:
  - Static: label, description, qname, URI, type badge
  - Island: `OntologyPanelLayout` for SHACL shapes, class hierarchy, properties
- [ ] Delete OntologyPage.vue and OntologyDetailPage.vue wrappers
