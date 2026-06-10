# 01 — Collapse the barrel: merge `data/index.ts` into its sources

## Problem

`data/index.ts` claims to be a "pure barrel: re-exports only, no logic" but contains 5 helper functions:
- `getSubKeys()` — duplicated identically from `DataLoader.ts`
- `sortPartKey()` — private, used only by `getAvailableParts()`
- `getAvailableParts()` — wraps `Object.keys(partSummaries)`
- `partEntryCount()` — identical to `getPartEntryCount()`
- `getPartEntryCount()` — wraps `partSummaries` lookup
- `isBilingual()` — wraps `partSummaries` lookup
- `getPartEditions()` — wraps `partSummaries` lookup
- `loadPartEntries()` — delegates to `DataLoader.loadPart()`

Callers import from both `data/index` and directly from `DataLoader`/`PartRegistry`, creating confusion about where things live.

## Solution

1. Move `getSubKeys()` into `DataLoader.ts` (canonical location — it's already there, just remove the duplicate from index.ts)
2. Move `getAvailableParts()`, `partEntryCount`/`getPartEntryCount()`, `isBilingual()`, `getPartEditions()` into `DataLoader.ts` (they query `partSummaries` which DataLoader already imports)
3. Move `loadPartEntries()` into `DataLoader.ts` or remove it (trivial delegation)
4. Update `index.ts` to be a true pure barrel — only re-exports
5. Update all callers to import from the owning module

## Files affected

- `browser/src/data/index.ts`
- `browser/src/data/DataLoader.ts`
- All pages/composables that import from `data/index`
