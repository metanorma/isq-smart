# 04 — Deepen PartRegistry into catalog + router + summary

## Problem
`PartRegistry.ts` (240 lines) has **four responsibilities**:
1. **Static catalog** — `ISO_PARTS` array with titles, scopes, icons, publishers
2. **URL routing** — `partUrl()`, `entryUrl()`, `domainPath()`
3. **Summary queries** — `getPartEntryCount()`, `isBilingual()`, `getPartEditions()`
4. **Domain definitions** — `DOMAINS` array

The `bilingual: boolean` field is duplicated — once in `ISO_PARTS` (static) and once computed from `partSummaries` (dynamic). These can diverge.

## Solution

### `src/data/PartCatalog.ts`
Pure static metadata — no functions, just the `PartMeta` array. This is the **single source of truth** for titles, icons, publishers.

### `src/data/PartRouter.ts`
```ts
export class PartRouter {
  constructor(private catalog: PartCatalog) {}
  partUrl(partKey: PartKey): string
  entryUrl(partKey: PartKey, id: string): string
  domainPath(domain: Domain): string
}
```

### `src/data/PartSummaryProvider.ts`
```ts
export class PartSummaryProvider {
  constructor(private summaries: Record<string, PartSummary>) {}
  entryCount(partKey: PartKey): number
  isBilingual(partKey: PartKey): boolean
  editions(partKey: PartKey): string[]
}
```

### Remove static `bilingual` from `ISO_PARTS`
The `bilingual` field in `ISO_PARTS` is dead data — it's always overridden by `partSummaries`. Remove it; `PartSummaryProvider.isBilingual()` is the sole authority.

## Benefits
- **Single source of truth** for each concern
- `PartRouter` has no state — pure URL generation (easily testable)
- `PartSummaryProvider` wraps generated data — tests don't need the full YAML
- Adding a new domain = add to `PartCatalog`, not edit 4 functions → **OCP**

## Test plan
- PartRouter: URL generation for quantities, math, sub-parts, parent parts
- PartSummaryProvider: bilingual flag for parent part 11 (checks sub-parts)
- PartCatalog: every part has required fields
