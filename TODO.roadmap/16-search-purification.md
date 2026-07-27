# 16 — Search system purification

## Problem
`src/composables/useSearch.ts` and `useLocalFilter.ts` mix search
algorithm logic with Vue reactive state (refs, watchers). The search
scoring and matching is pure but coupled to Vue's reactivity system.

## Solution
Extract pure search logic to `src/lib/SearchEngine.ts`:
```ts
export class SearchEngine<T> {
  constructor(
    private items: readonly T[],
    private indexer: (item: T) => SearchableText,
  ) {}

  search(query: string, domain?: string): SearchResult<T>[]
}
```

The Vue composable becomes a thin wrapper managing reactive state
and delegating to SearchEngine.

## Test plan
- SearchEngine: exact match, fuzzy match, domain filter
- useSearch: Vue reactivity unchanged
