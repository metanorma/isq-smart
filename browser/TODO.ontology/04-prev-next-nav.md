# 04: Prev/Next Entity Navigation

## Gap
Ontospy provides prev/next links on every entity detail page for sequential browsing through entities of the same type.

## Current State
No prev/next navigation. Users must go back to the listing page to browse to another entity.

## Implementation
- Compute prev/next entities by sorting all entities of the same type alphabetically
- Show prev/next links at the top of the detail page (like Ontospy's `← prev | next →` pattern)
- Links should use router-link to navigate without full page reload
