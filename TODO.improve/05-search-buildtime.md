# 05 — Replace runtime search index with the build-time domain index

## Problem

`useSearch.ts` builds its own search index at runtime by:
1. Loading every part sequentially via DataLoader
2. Concatenating text fields with `buildDocumentText()`
3. Storing in a module-level `docs` array

The build plugin already generates `domain-index.ts` with `{ i, n, t, s, u, p }` records for every entry — the same data, already available at import time. Two search indices exist for the same data.

## Solution

1. Enhance the build-time `domain-index.ts` if needed (add definition text for search)
2. Replace the runtime index build with direct use of `quantitiesIndex` + `mathIndex`
3. Search becomes synchronous — no async loading, no loading state
4. Delete `buildDocumentText()`, `buildIndex()`, `docs`, `buildPromise`

## Files affected

- `browser/src/composables/useSearch.ts`
- `browser/src/data/generated/domain-index.ts` (possibly enhance)
- `browser/build/yaml-data-plugin.ts` (if domain-index needs enrichment)
