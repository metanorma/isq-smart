# 06 — Type safety: reduce `as unknown as` casts

## Problem
14 `as unknown as` type casts in src/. Most are necessary narrowing from
`as const` objects (messages, generated data), but some can be eliminated
by improving type definitions.

### Fixable casts
- `EntryTextRenderer.ts`: `entry.def as unknown as Record<string, string>` —
  the `Definition` type has `en: string` and `fr?: string`. Accessing by
  variable key requires the cast. Fix: add an index signature or helper.
- `useSearch.ts`: `as never` — type escape for combining index arrays.

### Acceptable casts (no action needed)
- `messages as unknown as Record<...>` — `as const` creates narrow types
  that don't satisfy Record interfaces. This is by design.
- `ontologyEntities as unknown as readonly OntologyEntityData[]` — the
  generated type is a union of 200+ object types; the supertype interface
  is the correct way to use it.

## Solution
Add a `langField()` helper that accesses language-specific fields with
proper typing, eliminating the Record casts in EntryTextRenderer.
