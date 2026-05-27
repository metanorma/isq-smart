# Part Model Semantics — Fix Part 2 / Part 11 Confusion

## Problem

The current part model conflates three distinct concepts:

1. **Standard Part** — an ISO/IEC 80000 part document (e.g. Part 2 "Mathematical Notation")
2. **Sub-section** — a section within a Part that defines a group of entries (e.g. §2-5 "Variables & Functions")
3. **Domain** — the application-level grouping: quantities vs math notation

Part 2 is the clearest example of the confusion: it's a single ISO-published document containing 16 sub-sections (tables 2-5 through 2-20). But the code treats each sub-section as an independent "part" with its own route, data file, and PartRegistry entry — while also trying to synthesize a parent "Part 2" view that aggregates them.

## Current State Analysis

### Data layer

| Concept | Implementation | Problem |
|---|---|---|
| Part document | `PartMeta` with `partKey: '2'`, `domain: 'math'` | **No data file exists** for `part-2.ts`. Only `part-2-5.ts` through `part-2-20.ts` are generated. |
| Sub-section | `PartMeta` with `partKey: '2-5'`, `parentPart: '2'` | Has its own data file, route, entry count. Treated as a top-level part by most code. |
| Aggregation | `DataLoader.loadPart('2')` falls through to `getSubKeys('2')` | Merges all sub-section entries into one flat list. No section structure preserved. |

### `aboutParts.ts` — correctly models Part as document

The `PartIntro` type with `publisher`, `edition`, `scope`, `highlights`, `storeUrl` is the correct model for a Part *document*. It only has entries for base parts (2, 3, 4, ..., 13) — not sub-sections.

### `PartRegistry.ts` — mixes concerns

`PARTS` array contains both:
- Base quantity parts: `{ partKey: '3', domain: 'quantities', ... }`
- Math sub-sections: `{ partKey: '2-5', domain: 'math', parentPart: '2', ... }`
- Part 11 sub-parts: `{ partKey: '11-4', domain: 'quantities', parentPart: '11', ... }`

The `Domain` type (`'quantities' | 'math'`) is derived from whether a part contains quantities or math notation, not from the standard's structure. Part 11 sub-parts are `quantities` domain but they're dimensionless characteristic numbers — conceptually different from Parts 3-10.

### Routing

Routes handle both `/quantities/part-3` and `/math/part-2-5`. When navigating to `/math/part-2` (the parent), `document-part.vue` synthesizes the view by:
1. Loading `partIntros['2']` for the document metadata
2. Aggregating entries from all sub-sections via `DataLoader.loadPart('2')`

But `/quantities/part-11` is not routed — only `/quantities/part-11-4` through `part-11-9` are.

### `jsonld.ts` — publisher confusion

`ISO_PARTS` Set includes both `'2'` (the parent Part) AND all `'2-N'` sub-sections. Since Part 2 is ISO-published, all its sub-sections are ISO-published — but the Set encodes this by listing every sub-section individually rather than deriving from the parent.

For Part 11: `'11-4'` through `'11-9'` are in `ISO_PARTS`, but `'11'` itself is NOT — despite Part 11 being ISO-published. This happens to work because `'11'` is never passed to `isIecPart()` (no data file for `part-11.ts`), but it's semantically wrong.

### `about.vue` — correct publisher logic (different implementation)

```ts
function publisher(partKey: string): 'ISO' | 'IEC' {
  const base = partKey.split('-')[0]
  return base === '6' || base === '13' ? 'IEC' : 'ISO'
}
```

This is simpler and correct: derive publisher from the base part number. The `jsonld.ts` `ISO_PARTS` Set should use the same approach.

## Solution

### 1. Formalize the Part hierarchy model

Introduce explicit types distinguishing **Document** (a published standard) from **Section** (a group of entries within a document):

```ts
interface PartDocument {
  partKey: string          // '2', '3', ..., '13'
  publisher: 'ISO' | 'IEC'
  edition: string
  title: string
  scope: string
  storeUrl: string
  sections: string[]       // partKeys of child sections: ['2-5', '2-6', ..., '2-20']
}

interface PartSection {
  sectionKey: string       // '2-5', '2-6', ..., '2-20', '11-4', ..., '11-9'
  parentDocument: string   // partKey of parent document: '2', '11'
  title: string
  description: string
  accent: string
  icon: string
}
```

### 2. Replace `ISO_PARTS` Set with data-driven publisher

```ts
const IEC_BASE_PARTS = new Set(['6', '13'])

function publisherOf(partKey: string): 'ISO' | 'IEC' {
  const base = partKey.split('-')[0]
  return IEC_BASE_PARTS.has(base) ? 'IEC' : 'ISO'
}
```

This is a 3-line replacement for the 30+ line `ISO_PARTS` + `YEAR_TO_ED` + `IEC_ED_DATES` configuration. Remove `isIecPart()` entirely.

### 3. Merge `aboutParts.ts` into the registry

`aboutParts.ts` contains document-level metadata (publisher, edition, scope, storeUrl) that's the correct model. Move this into `PartRegistry.ts` as the `PartDocument` type. The existing `PartMeta` entries with `parentPart` become `PartSection` entries.

### 4. Clean up DataLoader aggregation

When loading a parent document's entries, preserve section structure:

```ts
interface PartData {
  sections?: { sectionKey: string; entries: Entry[] }[]
  entries: Entry[]         // flat list (backward compat)
  editions: string[]
  bilingual: boolean
  mathCache: Record<string, string>
  latexCache: Record<string, string>
}
```

This allows the document view to group entries by section, rather than showing a flat list.

### 5. Add `/documents/part-2` route (already works)

The `document-part.vue` already handles parent parts by synthesizing from `partIntros`. This should continue to work, but using the unified model instead of the separate `aboutParts.ts` file.

### 6. Normalize `_tag` derivation

Currently in `vite.config.ts` line 216:
```ts
const tag = domain === 'quantities' ? 'quantity' : 'math'
```

The `domain` comes from `PartRegistry` → hardcoded per part. This is correct but should reference the document model: if `parentDocument === '2'` then `_tag = 'math'`, otherwise `_tag = 'quantity'`.

## Files Changed

| File | Action |
|---|---|
| `src/data/PartRegistry.ts` | Add `PartDocument` + `PartSection` types; merge `aboutParts.ts` content; simplify to document/section split |
| `src/data/aboutParts.ts` | **DELETE** — content merged into PartRegistry |
| `src/data/jsonld.ts` | Replace `ISO_PARTS` Set with `IEC_BASE_PARTS` + `publisherOf()` |
| `src/pages/about.vue` | Remove local `publisher()` function; import from registry |
| `src/pages/document-part.vue` | Use unified `PartDocument` type; show section-grouped entries |
| `src/pages/documents.vue` | Import from unified registry |
| `vite.config.ts` | Update `_tag` derivation to use parent document reference |

## Depends On

- TODO 01 (namespace rename) — no direct dependency but cleaner to do first
- TODO 02 (data-display separation) — the `tagToClass()` function should use the formalized domain model
