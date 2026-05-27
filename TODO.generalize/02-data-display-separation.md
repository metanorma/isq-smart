# Data-Definition vs App-Display Separation

## Problem

Ontology qnames (e.g. `isoiec80000:Quantity`, `isoiec80000:Unit`) are hardcoded as string literals in Vue components and composables. The app's display layer is tightly coupled to specific ontology class names, violating the open/closed principle: adding a new domain class requires editing multiple components.

## Current Hardcoded Qnames

### `src/composables/useEntry.ts`
```ts
export function entryRdfClass(e: Entry): string {
  return e._tag === 'quantity' ? 'isoiec80000:Quantity' : 'isoiec80000:MathConcept'
}
```

### `src/components/EntryOntologyPanel.vue` (18 refs)
- `isoiec80000:part-${partParam}` — part individual lookup
- `isoiec80000:hasUnit`, `isoiec80000:hasDimension`, `isoiec80000:Unit`, `isoiec80000:Dimension`
- `isoiec80000:${entry.id}` — instance IRI display
- `smart:TermEntry` — base class

### `src/components/UnitOntologyPanel.vue` (8 refs)
- `isoiec80000:Unit`, `isoiec80000:hasDimension`, `isoiec80000:Dimension`, `isoiec80000:unit-${slug}`
- `smart:TermEntry`

### `src/components/DimensionOntologyPanel.vue` (4 refs)
- `isoiec80000:Dimension`, `isoiec80000:Unit`, `isoiec80000:hasDimension`
- `smart:TermEntry`

### `src/components/SiteFooter.vue` (2 refs)
- `isoiec80000:Quantity`, `isoiec80000:{id}` in JSON-LD microdata

### `src/pages/reference.vue` (7 refs)
- `isoiec80000:Quantity`, `isoiec80000:MathConcept`, `isoiec80000:part-${partKey}`, `isoiec80000:${entry.id}`
- Context prefix `isoiec80000: https://w3id.org/standards/isoiec80000/`

## Solution: Ontology Config Map

### 1. Create `src/data/ontologyConfig.ts`

Single source of truth for all namespace/class/property mappings. Derived from the ontology TTL at build time or maintained alongside it.

```ts
export const NS = {
  core: {
    prefix: 'isoiec80000',  // → 'isq' after namespace rename
    uri: 'https://w3id.org/standards/isoiec80000/ontologies/core/',
  },
  smart: {
    prefix: 'smart',
    uri: 'https://example.org/smart-sdu/',
  },
} as const

export const DOMAIN_CLASSES = {
  quantity: `${NS.core.prefix}:Quantity`,
  math: `${NS.core.prefix}:MathConcept`,
  unit: `${NS.core.prefix}:Unit`,
  dimension: `${NS.core.prefix}:Dimension`,
} as const

export const DOMAIN_PROPERTIES = {
  hasUnit: `${NS.core.prefix}:hasUnit`,
  hasDimension: `${NS.core.prefix}:hasDimension`,
} as const

// Tag → class mapping (replaces hardcoded useEntry.ts)
export function tagToClass(tag: 'quantity' | 'math'): string {
  return tag === 'quantity' ? DOMAIN_CLASSES.quantity : DOMAIN_CLASSES.math
}

// Part individual qname
export function partQname(partKey: string): string {
  return `${NS.core.prefix}:part-${partKey}`
}

// Entry instance qname
export function entryQname(entryId: string): string {
  return `${NS.core.prefix}:${entryId}`
}
```

### 2. Refactor `useEntry.ts`

```ts
import { tagToClass } from '../data/ontologyConfig'
export function entryRdfClass(e: Entry): string {
  return tagToClass(e._tag)
}
```

### 3. Refactor ontology panels to use config

All three panels replace hardcoded strings with imports from `ontologyConfig`. The `findByQname`, `linkTo`, and `ancestor-walking` logic (duplicated 3×) moves to a shared composable — see TODO 04.

### 4. Refactor `SiteFooter.vue` and `reference.vue`

Replace `isoiec80000:` string literals with `NS.core.prefix` references.

## Files Changed

| File | Action |
|---|---|
| `src/data/ontologyConfig.ts` | **NEW** — namespace constants, class/property maps, helper functions |
| `src/composables/useEntry.ts` | Import `tagToClass` from config |
| `src/components/EntryOntologyPanel.vue` | Replace all hardcoded qnames with config imports |
| `src/components/UnitOntologyPanel.vue` | Replace all hardcoded qnames with config imports |
| `src/components/DimensionOntologyPanel.vue` | Replace all hardcoded qnames with config imports |
| `src/components/SiteFooter.vue` | Replace hardcoded qnames with config imports |
| `src/pages/reference.vue` | Replace hardcoded qnames with config imports |

## Depends On

- TODO 01 (namespace rename) — if done first, the strings change from `isoiec80000:` to `isq:`; the config map makes the rename a single-line change

## Benefit

After this change, the namespace rename (TODO 01) becomes: update `NS.core.prefix` and `NS.core.uri` in one file. All downstream code flows from the config.
