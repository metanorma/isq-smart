# 20 — PartKey class: consolidate part-key utilities

## Status: Evaluated — current functions are sufficient

The 6 free functions in partKey.ts are all one-liners with clear names.
They have no shared state, are independently testable, and don't need
polymorphism. Converting to a class would add constructor overhead for
every comparison without improving depth.

Deferred.
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
