# 03 — Deepen entryViewModel into composed resolvers

## Problem
`resolveEntryDetailView()` is a **god function** (191 lines) computing 10+ unrelated things:
1. Sibling navigation (prev/next/idx/total)
2. Section grouping
3. Reverse xref lookup (referencedBy)
4. JSON-LD generation
5. Dual URN generation
6. Definition HTML rendering (en + fr)
7. Remarks HTML rendering (en + fr)
8. Rendered name HTML
9. Accent style computation (6 sub-objects)
10. Part label formatting

All callers must pass all 9 arguments even if they only need siblings.

## Solution
Split into focused resolvers, each with a small interface:

### `src/data/EntryNavigationResolver.ts`
```ts
export class EntryNavigationResolver {
  constructor(private entries: Entry[]) {}
  siblings(entry: Entry): SiblingNav
  sectionEntries(entry: Entry): Entry[]
}
```

### `src/data/EntryReferenceResolver.ts`
```ts
export class EntryReferenceResolver {
  constructor(private xrefMap, private reverseXref) {}
  referencedBy(entry: Entry): ReferencedBy[]
}
```

### `src/data/EntryContentRenderer.ts`
```ts
export class EntryContentRenderer {
  constructor(private mathCache, private latexCache) {}
  definition(entry: Entry, lang: Language): string
  remarks(entry: Entry, lang: Language): string
  renderedName(entry: Entry, lang: Language): string
}
```

### `src/data/EntryAccentResolver.ts`
```ts
export class EntryAccentResolver {
  constructor() {}
  resolve(meta: PartMeta): EntryAccentStyle
}
```

### `src/data/EntryDetailView.ts` (composition root)
```ts
export class EntryDetailView {
  static resolve(params: EntryViewParams): EntryDetailView
  // Composes navigation + references + content + accent + serialization
}
```

## Benefits
- Each resolver is independently testable with a fixture entry
- `EntryDetailView` is now a thin orchestrator — its test asserts composition, not computation
- Adding a new concern (e.g. "related entries") means adding a resolver, not editing the god function → **OCP**
- Callers can use individual resolvers without pulling the full view

## Test plan
- Each resolver: unit tests with fixture entries
- EntryDetailView: integration test asserting all fields populated
