# 19 — useLocalFilter purification

## Problem
`src/composables/useLocalFilter.ts` mixes filtering logic (case-insensitive
matching, highlight generation) with Vue reactive state. Same pattern as
useSearch before SearchEngine extraction.

## Solution
Extract `src/lib/LocalFilter.ts`:
```ts
export class LocalFilter<T> {
  constructor(private items: readonly T[], private fields: string[]) {}
  filter(query: string): T[]
  highlight(text: string, query: string): string
}
```

useLocalFilter becomes a thin Vue wrapper.
