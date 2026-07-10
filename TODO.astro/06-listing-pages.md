# 06 — Listing Pages Migration

## Goal
Convert listing/index pages. These read from `src/data/generated/` at build time.

## Pages

### 6.1 Home
- `src/pages/index.vue` → `src/pages/index.astro`
- Hero, quick links, featured parts
- Data: `getAllParts()`, `partSummaries` — runs in frontmatter

### 6.2 Quantities domain
- `src/pages/domain.vue` (domain='quantities') → `src/pages/quantities/index.astro`
- Lists all quantity parts with entry counts
- Data: `getPartsByDomain('quantities')`, `partEntryCount()`

### 6.3 Math domain
- `src/pages/domain.vue` (domain='math') → `src/pages/math/index.astro`
- Same pattern, different domain

### 6.4 Units
- `src/pages/units.vue` → `src/pages/units/index.astro`
- Units listing from `unitsdb.ts`
- Interactive: search/filter/sort → Vue island `client:idle`

### 6.5 Dimensions
- `src/pages/dimensions.vue` → `src/pages/dimensions/index.astro`
- Dimensions listing
- Interactive: filter → Vue island `client:idle`

### 6.6 Documents
- `src/pages/documents.vue` → `src/pages/documents/index.astro`
- Lists all documents

### 6.7 Ontology index
- `src/pages/ontology.vue` → `src/pages/ontology/index.astro`
- Ontology browser landing page
- Heavy interactivity (tree navigation, search) → Vue island `client:idle`

## Pattern for interactive listings
```astro
---
import { getAllParts } from '../data/index'
const parts = getAllParts()
---
<UnitsList client:idle parts={parts} />
```
The Vue island receives server-rendered data as props, hydrates on idle.

## Acceptance Criteria
- All listing pages render with correct data
- Filtering/search works after hydration
- Pagination/scroll works
- Links to detail pages are correct
