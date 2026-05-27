# Publisher Logic: Data-Driven Determination

## Problem

The publisher (ISO vs IEC) for each ISO/IEC 80000 part is determined by a hardcoded `Set<string>` listing every ISO-published part key. This is fragile and not data-driven.

## Current Implementations (3 separate ones!)

### 1. `src/data/jsonld.ts` — `ISO_PARTS` Set

```ts
const ISO_PARTS = new Set(['2', '3', '4', '5', '7', '8', '9', '10', '12',
  '2-5', '2-6', '2-7', '2-8', '2-9', '2-10', '2-11', '2-12', '2-13', '2-14', '2-15', '2-16', '2-17', '2-18', '2-19', '2-20',
  '11-4', '11-5', '11-6', '11-7', '11-8', '11-9'])

function isIecPart(partKey: string): boolean {
  return !ISO_PARTS.has(partKey)  // negative logic
}
```

Lists all 30+ part keys individually. Uses negative logic (anything NOT in ISO_PARTS is IEC).

### 2. `src/data/aboutParts.ts` — per-part `publisher` field

```ts
{ partKey: '6', publisher: 'IEC', ... }
{ partKey: '13', publisher: 'IEC', ... }
```

Correct model: each part document has a publisher. But only base parts are listed (2, 3, ..., 13) — sub-sections inherit from parent.

### 3. `src/pages/about.vue` — local `publisher()` function

```ts
function publisher(partKey: string): 'ISO' | 'IEC' {
  const base = partKey.split('-')[0]
  return base === '6' || base === '13' ? 'IEC' : 'ISO'
}
```

Simplest correct implementation. Derives from base part number.

## The Correct Model

Only two parts are IEC-published: Part 6 (Electromagnetism) and Part 13 (Information Science). All others are ISO-published. The publisher of a sub-section is the publisher of its parent document.

## Solution

### 1. Single canonical publisher function

Add to `PartRegistry.ts` (or the unified model from TODO 03):

```ts
const IEC_BASE_PARTS = new Set(['6', '13'])

export function publisherOf(partKey: string): 'ISO' | 'IEC' {
  const base = partKey.split('-')[0]
  return IEC_BASE_PARTS.has(base) ? 'IEC' : 'ISO'
}
```

### 2. Remove all three existing implementations

- Delete `ISO_PARTS`, `isIecPart()` from `jsonld.ts`
- Delete `publisher` field from `aboutParts.ts` (or from merged registry)
- Delete local `publisher()` from `about.vue`
- Import `publisherOf` from the canonical location in all consumers

### 3. Move URN logic out of jsonld.ts

The `Urn` module in `jsonld.ts` generates standard URNs (ISO/IEC) using the publisher. It should import `publisherOf` rather than calling `isIecPart()`.

### 4. Edition data should be on the PartDocument model

`YEAR_TO_ED` and `IEC_ED_DATES` maps are edition metadata that belongs on the document model (see TODO 03), not in the JSON-LD serialization module.

## Files Changed

| File | Action |
|---|---|
| `src/data/PartRegistry.ts` | Add `publisherOf()` and `IEC_BASE_PARTS` |
| `src/data/jsonld.ts` | Remove `ISO_PARTS`, `isIecPart()`; import `publisherOf` from registry |
| `src/data/aboutParts.ts` | Remove `publisher` field (derived from `publisherOf()`) |
| `src/pages/about.vue` | Remove local `publisher()`; import from registry |
| `src/pages/documents.vue` | Import from registry (already imports from jsonld, just changes source) |

## Depends On

- TODO 03 (part model semantics) — the `PartDocument` type should carry publisher and edition data
- Can be done independently as a quick win before TODO 03
