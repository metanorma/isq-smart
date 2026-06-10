# 04 — Give the entry page a single data module instead of 10 imports

## Problem

`entry.vue` has 10+ data imports and 3 composable calls. It knows about xref maps, UnitsDB, reverse-xref, AsciiDoc rendering, URN generation, and JSON-LD serialization — none of which are its concern. The data wiring is duplicated across `entry.vue` and `part.vue`.

## Solution

Create a `useEntryPage(partKey, id)` composable that encapsulates:
- Loading part data (via usePartData)
- Finding the current entry
- Generating JSON-LD for the entry
- Resolving cross-references (forward + reverse)
- Building sibling navigation (via useEntryNav)
- Tracking recent entries
- Computing URN identifiers

The page receives a single reactive object with all the data it needs.

Also consider a `usePartPage(partKey)` for the part listing page to reduce its imports.

## Files affected

- `browser/src/pages/entry.vue`
- `browser/src/pages/part.vue`
- New: `browser/src/composables/useEntryPage.ts`
- New: `browser/src/composables/usePartPage.ts` (if needed)
