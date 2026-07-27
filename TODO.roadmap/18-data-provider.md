# 18 — DataProvider: formalize data loading

## Problem
`src/data/DataLoader.ts` uses a module-level cache Map and async loadPart/loadAll
functions. The cache is a private module variable — callers can't observe or
invalidate it. The API mixes caching, loading, and part-key resolution.

## Solution
Create a `DataProvider` class:
```ts
export class DataProvider {
  constructor(private readonly cache: PartCache) {}
  async loadPart(partKey: PartKey): Promise<PartData>
  async loadAll(): Promise<Entry[]>
  invalidate(partKey?: PartKey): void
}
```

The cache becomes an injected dependency (testable, observable). The
module-level singleton is created once and exported for convenience.
