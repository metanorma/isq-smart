# 07 — Detail Pages Migration

## Goal
Convert dynamic detail pages. These use route params to load specific entries.

## Pages

### 7.1 Part listing
- `src/pages/part.vue` → `src/pages/quantities/part-[part].astro` + `src/pages/math/part-[part].astro`
- Route: `/quantities/part-{part}` → `/quantities/part-[part]`
- Dynamic param: `part` (e.g., `3`, `4`, `6`)
- Loads `part-{part}.ts` from generated data

### 7.2 Entry detail
- `src/pages/entry.vue` → `src/pages/quantities/part-[part]/[id].astro` + math variant
- Route: `/quantities/part-{part}/{id}`
- Loads specific quantity/math entry
- Interactive: ontology panel, citation builder, RDF export → Vue islands

### 7.3 Unit detail
- `src/pages/unit.vue` → `src/pages/units/[slug].astro`
- Route: `/units/{slug}`

### 7.4 Dimension detail
- `src/pages/dimension-detail.vue` → `src/pages/dimensions/[part].astro`
- Route: `/dimensions/{part}`

### 7.5 Document part
- `src/pages/document-part.vue` → `src/pages/documents/part-[part].astro`
- Route: `/documents/part-{part}`

### 7.6 Document detail
- `src/pages/document-detail.vue` → `src/pages/documents/[id].astro`
- Route: `/documents/{id}`

### 7.7 Document sections
- `src/pages/document-sections.vue` → `src/pages/documents/[partKey]/sections.astro`
- Route: `/documents/{partKey}/sections`

### 7.8 Document section detail
- `src/pages/document-section-detail.vue` → `src/pages/documents/[partKey]/sections/[sectionId].astro`
- Route: `/documents/{partKey}/sections/{sectionId}`

### 7.9 Ontology detail
- `src/pages/ontology-detail.vue` → `src/pages/ontology/[slug].astro`
- Route: `/ontology/{slug}`
- Interactive: hierarchy tree, SHACL shapes → Vue islands

## Astro Dynamic Route Pattern
```astro
---
import { getPartMeta } from '../../data/PartRegistry'
export function getStaticPaths() {
  return getAllParts().map(p => ({
    params: { part: p.partKey },
    props: { part: p }
  }))
}
const { part } = Astro.props
---
```

## Acceptance Criteria
- All detail pages render for valid params
- 404 for invalid params
- Interactive panels (ontology, citation, export) hydrate correctly
- Deep links work
