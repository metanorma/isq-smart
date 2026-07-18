# 04 — Concept Hierarchy (Broader/Narrower)

## Goal

Create `build-hierarchy.ts` build stage that derives `skos:broader` / `skos:narrower` relationships between quantity concepts.

## Background

ISO 80000 entries have implicit broader/narrower relationships:
- "phase speed" and "group speed" are narrower than "speed"
- "mass density" is narrower than "density"
- "specific entropy" is narrower than "entropy"

These are currently invisible in the flat model.

## Derivation strategies (in priority order)

### Strategy 1: Kind-of-quantity hierarchy (automatic)
Every quantity is narrower than its kind-of-quantity:
- `length` → narrower of → `kind-L` (length-type)

### Strategy 2: Naming pattern matching (semi-automatic)
Detect patterns like:
- "X of Y" → Y is broader than X (e.g., "wavelength" broader than nothing, but "speed of sound" narrower than "speed")
- "specific X" → X is broader (e.g., "specific entropy" → broader: "entropy")
- "massic X" / "volumic X" / "lineic X" → X is broader
- "differential X" → X is broader

### Strategy 3: Part-section structure (automatic)
Within each part, entries are grouped by section (e.g., `t3-1.x` is "space and time" subgroup). Section groupings provide weak broader/narrower hints.

### Strategy 4: Definition cross-references (semi-automatic)
Definitions that reference other entries via `<<id>>` create candidate broader/narrower links. E.g., "phase speed is the speed at which the phase of a wave propagates" → broader: speed.

## Output

Writes `generated/hierarchy.ts`:
```typescript
export const broaderNarrower: Record<string, { broader: string[]; narrower: string[] }> = {
  "t3-1.1": { broader: ["kind-L"], narrower: ["t3-1.2", "t3-1.3"] },
  ...
}
```

## Scope for this implementation

- Strategy 1 (kind hierarchy): fully implemented ✅
- Strategy 2 (naming patterns): implement for "specific/massic/volumic/lineic" patterns ✅
- Strategy 3 (section structure): skip for now — weak signal
- Strategy 4 (definition xrefs): skip for now — requires NLP-level parsing

## Status: DONE (strategies 1 and 2)
