# Ontology Panel DRY Refactoring

## Problem

Three ontology panel components (`EntryOntologyPanel.vue`, `UnitOntologyPanel.vue`, `DimensionOntologyPanel.vue`) share ~80% identical code:

1. **Identical ontology helper functions** duplicated 3×:
   - `findByQname(qname)` — finds entity in `ontologyEntities` array
   - `linkTo(qname)` — maps qname to `/ontology/:slug` URL
   - `OntEntity` interface — same shape defined in each file

2. **Identical UI sections** duplicated 3×:
   - Class hierarchy (ancestor walking → breadcrumb display)
   - Instance IRI display
   - Properties table (path + value columns)
   - Related entities (clickable badge pills)

3. **Identical computed properties** duplicated 3×:
   - `ancestors` — walks parent chain up to 10 levels
   - `fullHierarchy` — reverses and appends class entity
   - `shapes` — finds SHACL shapes targeting the class

## Current Duplication Count

| Code Element | EntryPanel | UnitPanel | DimensionPanel |
|---|---|---|---|
| `OntEntity` interface | ✓ | ✓ | ✓ |
| `findByQname()` | ✓ | ✓ | ✓ |
| `linkTo()` | ✓ | ✓ | ✓ |
| `ancestors` computed | ✓ | ✓ | ✓ |
| `fullHierarchy` computed | ✓ | ✓ | ✓ |
| `shapes` computed | ✓ | ✓ | ✓ |
| Class hierarchy template | ✓ | ✓ | ✓ |
| Instance IRI template | ✓ | ✓ | ✓ |
| Properties table template | ✓ | ✓ | ✓ |
| Related entities template | ✓ | ✓ | ✓ |
| `PropertyRow` interface | ✓ | ✓ | ✓ |

## Solution

### 1. Create `src/composables/useOntology.ts`

Shared composable that encapsulates all common logic:

```ts
import { computed, type MaybeRef, unref } from 'vue'
import { ontologyEntities } from '../data/generated/ontology'

export interface OntEntity {
  uri: string; qname: string; slug: string; label: string
  description: string; ontology: string; type: string
  parent?: string; targetClass?: string
  domain?: string[]; range?: string[]
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string }[]
  instanceOf?: string[]; isPartOf?: string[]; identifier?: string
}

export interface PropertyRow {
  path: string; pathSlug: string
  values: { label: string; link: string; type: 'iri' | 'literal' }[]
  shapeSource?: string; shapeSourceSlug?: string
}

const allEntities = ontologyEntities as readonly OntEntity[]

export function findByQname(qname: string): OntEntity | undefined {
  return allEntities.find(e => e.qname === qname)
}

export function linkTo(qname: string): string {
  const e = findByQname(qname)
  return e ? `/ontology/${e.slug}` : ''
}

export function useClassHierarchy(classQname: MaybeRef<string>) {
  const classEntity = computed(() => findByQname(unref(classQname)))

  const ancestors = computed(() => {
    const chain: OntEntity[] = []
    let current = classEntity.value
    let safety = 10
    while (safety-- > 0 && current?.parent) {
      const p = findByQname(current.parent)
      if (!p) break
      chain.push(p)
      current = p
    }
    return chain
  })

  const fullHierarchy = computed(() =>
    [...ancestors.value.reverse(), classEntity.value].filter(Boolean) as OntEntity[]
  )

  const shapes = computed(() =>
    allEntities.filter(e => e.type === 'shape' && e.targetClass === unref(classQname))
  )

  return { classEntity, ancestors, fullHierarchy, shapes }
}
```

### 2. Create `src/components/OntologyPanelLayout.vue`

Shared layout component that renders the four standard sections:

```vue
<script setup lang="ts">
import type { OntEntity, PropertyRow } from '../composables/useOntology'

defineProps<{
  classEntity?: OntEntity
  hierarchy: OntEntity[]
  shapes: OntEntity[]
  instanceIri: string
  instanceIriStyle: string  // color class for the IRI badge
  propertyTable: PropertyRow[]
  relatedEntities: { qname: string; slug: string; color: string }[]
}>()
</script>
```

Renders: class hierarchy, instance IRI, properties table, related entities. Accepts slots for section-specific customization.

### 3. Simplify each panel

Each panel becomes a thin wrapper:

```vue
<!-- EntryOntologyPanel.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useClassHierarchy, findByQname, linkTo } from '../composables/useOntology'
import { tagToClass } from '../data/ontologyConfig'
import type { Entry, QuantityEntry } from '../data/types'

const props = defineProps<{ entry: Entry; partParam: string }>()

const classQname = computed(() => tagToClass(props.entry._tag))
const { classEntity, fullHierarchy, shapes } = useClassHierarchy(classQname)

// Build propertyTable — only the entry-specific rows
const propertyTable = computed(() => {
  // ... entry-specific property mapping (units, designations, etc.)
})

// Build relatedEntities — only the entry-specific links
</script>

<template>
  <OntologyPanelLayout
    :class-entity="classEntity"
    :hierarchy="fullHierarchy"
    :shapes="shapes"
    :instance-iri="`${NS.core.prefix}:${entry.id}`"
    instance-iri-style="brand"
    :property-table="propertyTable"
    :related-entities="relatedEntities"
  />
</template>
```

### 4. Remove the existing `useOntologySidebar.ts` if redundant

Check if `useOntologySidebar.ts` overlaps with the new `useOntology.ts` composable. If so, merge into one.

## Files Changed

| File | Action |
|---|---|
| `src/composables/useOntology.ts` | **NEW** — shared ontology helpers (`findByQname`, `linkTo`, `useClassHierarchy`, types) |
| `src/components/OntologyPanelLayout.vue` | **NEW** — shared layout (hierarchy, IRI, properties table, related entities) |
| `src/components/EntryOntologyPanel.vue` | Strip duplicated code; use composable + layout |
| `src/components/UnitOntologyPanel.vue` | Strip duplicated code; use composable + layout |
| `src/components/DimensionOntologyPanel.vue` | Strip duplicated code; use composable + layout |

## Depends On

- TODO 02 (data-display separation) — the `ontologyConfig.ts` provides class qnames used in the panels
- TODO 01 (namespace rename) — the qnames will change but the composable abstracts that
