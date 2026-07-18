# 08 — IA: New Navigation Modes

## Goal

Update the information architecture to support concept-based browsing alongside the current part-based browsing.

## Current IA
```
Home
├── Quantities (by part)
├── Math (by section)
├── Units
├── Dimensions
├── Ontology
├── Documents
└── About
```

## Proposed IA
```
Home
├── Quantities
│   ├── By Part (existing) — /quantities
│   ├── By Kind (NEW) — /kinds
│   └── By Concept (NEW) — /concepts
├── Math
├── Units
├── Dimensions
├── Ontology
├── Documents
└── About
```

## New pages

### `/kinds` — Browse by Kind of Quantity
- Grid of KindOfQuantity cards, each showing dimension vector + member count
- Click → `/kinds/[dimension-slug]` showing all quantities of that kind

### `/kinds/[slug]` — Kind Detail
- Dimension vector, label, description
- Member quantities grouped by part
- Broader/narrower kinds (if applicable)

### `/concepts` — Concept Hierarchy Browser
- Tree view of broader/narrower relationships
- Filter by part/domain
- Search

## Navigation updates

Update `Nav.astro` / nav data to add:
- "By Kind" link under Quantities
- "Concept Map" link

## Status: DONE
