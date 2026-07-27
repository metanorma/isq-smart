# 20 — PartKey class: consolidate part-key utilities

## Problem
`src/data/partKey.ts` has free functions: `basePartKey`, `parsePartKey`,
`comparePartKeys`, `sortPartKeys`, `isSubSection`, `sectionLabel`.
These are all operations on the `PartKey` concept but have no shared type.

## Solution
Create a `PartKey` value class:
```ts
export class PartKey {
  constructor(readonly raw: string) {}
  get base(): string
  get section(): string | undefined
  get isSubSection(): boolean
  compareTo(other: PartKey): number
  get sectionLabel(): string
}
```

Plus static helpers: `PartKey.sort(keys: PartKey[])`.
