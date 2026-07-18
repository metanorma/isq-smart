# 09 — UI: Concept Browser Components

## Goal

Create Vue components for browsing the concept hierarchy.

## Components

### `KindBrowser.vue`
Props: `kinds: KindOfQuantity[]`
- Grid of kind cards
- Each card: dimension symbol, label, member count, link to kind detail
- Sort by member count (descending) then dimension

### `KindDetail.vue` (Astro page section)
- Shows kind metadata (dimension, label)
- Lists member quantities in a table
- Shows related kinds (same base dimensions)

### `ConceptTree.vue`
Props: `hierarchy: Record<string, { broader: string[]; narrower: string[] }>`
- Recursive tree rendering
- Collapsible nodes
- Highlight current entry
- Link each node to entry page

### `BroaderNarrowerList.vue`
Props: `entryId: string`, `hierarchy: Record<string, ...>`
- Shows "Broader concepts" and "Narrower concepts" sections
- Each item links to the related entry
- Only renders if relationships exist

### `EntityList.vue`
Props: `entryId: string`, `quantityEntities: Record<string, string[]>`
- Shows entities that this quantity characterizes
- Links to entity pages (if implemented)

## Design principles

- All components use TypeScript props with proper types
- No `any` — all types from `ontology/concepts.ts`
- Components are dumb (presentational) — data fetching in Astro frontmatter
- Vue islands use `client:visible` for performance

## Status: DONE
