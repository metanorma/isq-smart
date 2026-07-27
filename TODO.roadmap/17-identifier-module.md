# 17 — Identifier module: consolidate URN and qname generation

## Status: Evaluated — current separation is sufficient

The current modules (urn.ts, ontologyConfig.ts) are already well-organized
with clear MECE boundaries. A barrel Identifier module would add indirection
without improving depth or locality.

Deferred unless a new identifier type emerges that doesn't fit either module.
URN and qname generation is scattered across:
- `src/data/urn.ts` — `partUrn()`, `entryUrn()`, `unitUrns()`, `dimensionUrns()`, `entryDualUrn()`
- `src/data/ontologyConfig.ts` — `partQname()`, `entryQname()`
- `src/lib/content.ts` — content slug resolution

These are all "identifier resolution" — mapping domain objects to stable URIs.

## Solution
Create `src/data/Identifier.ts`:
```ts
export class Identifier {
  static partUrn(partKey, edition): string
  static entryUrn(entry, partKey, edition): string
  static partQname(partKey): string
  static entryQname(entryId): string
  static dualUrn(entry, partKey, edition): { iso: string; iec: string }
}
```

Consolidates all identifier logic in one MECE module. Callers import from
one place instead of guessing which file has which function.
