# 01: Persistent Sidebar Layout

## Gap
Ontospy has a persistent sidebar with search and collapsible entity lists (classes, properties, concepts, individuals) that stays visible while browsing any page.

## Current State
No sidebar. The ontology listing page (`smartsdu-ontology.vue`) is a standalone page with tab navigation. Entity detail pages (`smartsdu-ontology-detail.vue`) are separate routes with no shared navigation.

## Implementation
- Create `src/layouts/OntologyLayout.vue` with sidebar + `<router-view>` content area
- Sidebar contains:
  - Search input (filters all entity lists)
  - Collapsible sections: Classes, Object Properties, Datatype Properties, Annotation Properties, Concepts, Shapes, Individuals
  - Each section shows filtered entity links with type dots
  - Active entity highlighted
- Update `router.ts` to use nested routes under `/ontology` parent
- Sidebar state (expanded sections) preserved via route

## Data-Driven
- Entity type labels and colors from `ontologyTypeMeta`
- No hard-coded entity group labels in sidebar
