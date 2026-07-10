# 05 — Listing Pages

## Goal
Rewrite all listing pages as native `.astro` templates with frontmatter data fetching.

## Pages & Sources

| Route | Astro file | Source Vue component |
|-------|-----------|---------------------|
| `/quantities` | `quantities/index.astro` | `DomainPage.vue` (domain=quantities) |
| `/math` | `math/index.astro` | `DomainPage.vue` (domain=math) |
| `/units` | `units/index.astro` | `UnitsPage.vue` |
| `/dimensions` | `dimensions/index.astro` | `DimensionsPage.vue` |
| `/documents` | `documents/index.astro` | `DocumentsPage.vue` |
| `/ontology` | `ontology/index.astro` | `OntologyPage.vue` |

## Pattern
```astro
---
import DefaultLayout from '../../layouts/DefaultLayout.astro'
import { getPartsByDomain, partEntryCount } from '../../data/index'
const parts = getPartsByDomain('quantities')
---
<DefaultLayout title="..." description="...">
  <!-- static HTML using parts data -->
</DefaultLayout>
```

## Interactive Parts → Vue Islands
- Units page: search/filter → `<UnitFilter client:idle units={units} />`
- Dimensions page: filter → `<DimensionFilter client:idle ... />`
- Ontology page: tree navigation → `<OntologySidebar client:idle ... />`

## Tasks
- [ ] Rewrite quantities/index.astro
- [ ] Rewrite math/index.astro
- [ ] Rewrite units/index.astro (extract filter as island)
- [ ] Rewrite dimensions/index.astro (extract filter as island)
- [ ] Rewrite documents/index.astro
- [ ] Rewrite ontology/index.astro
- [ ] Delete wrapper components
