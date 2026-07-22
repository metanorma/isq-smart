# 02 — Ontology Sidebar Component

## Goal
Vue island that renders the ontology tree as a collapsible/expandable sidebar.

## Features
- Collapsible sections per ontology namespace
- Collapsible sub-sections per entity type
- Active entity highlighting (based on current URL)
- Search/filter within sidebar
- Scrollable with sticky positioning
- Counts per section

## File: `src/components/OntologySidebar.vue`
- Props: `tree: OntologyTree`, `activeSlug: string`
- State: expanded sections (Set of keys)
- Click navigates to `/ontology/[slug]`
- Mobile: hidden by default, toggle button

## Status: DONE
