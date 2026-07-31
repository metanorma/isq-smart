# 02 — useOntology purification

## Problem
`useOntology.ts` mixes ontology filtering/search logic with Vue reactivity.
The filtering (by type, prefix, search query) is pure computation.

## Solution
Extract pure filtering to `src/lib/OntologyFilter.ts`:
```ts
export class OntologyFilter {
  filter(entities, params: { type?, prefix?, query? }): OntologyEntityData[]
}
```
