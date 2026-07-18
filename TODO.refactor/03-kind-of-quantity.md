# 03 — Kind-of-Quantity Derivation

## Goal

Create `build-kinds.ts` build stage that derives `KindOfQuantity` concepts from the dataset by grouping quantities according to their dimension vector.

## Background

ISO 80000 doesn't explicitly define "kinds of quantity" as named concepts, but the VIM (ISO/IEC Guide 99) does. A kind of quantity groups quantities that can be compared — e.g., height, width, wavelength, altitude are all "length-type" quantities (dimension L).

The current model has dimensions (from unitsdb) but doesn't use them as concept categories.

## Algorithm

1. For each `QuantityEntry`, derive its dimension from the first unit's symbol (using unitsml notation parsing).
2. Group quantities by dimension vector (e.g., `L`, `L T⁻¹`, `L M T⁻²`).
3. For each group, create a `KindOfQuantity`:
   - `id`: `kind-${dimensionSlug}` (e.g., `kind-L`, `kind-L-T-1`)
   - `prefLabel`: derived from the dimension (e.g., "length-type quantities", "velocity-type quantities")
   - `dimension`: the dimension vector string
   - `quantityIds`: list of member quantity IDs
4. Back-link each `QuantityConcept` to its `kindId`.

## Dimension label mapping

Provide a curated mapping for common dimensions:
- `L` → "length-type"
- `L T⁻¹` → "velocity-type"
- `L M T⁻²` → "force-type"
- `L² M T⁻²` → "energy-type"
- `L² M T⁻³` → "power-type"
- etc.

For unmapped dimensions, auto-generate: `${vectorNotation}-type quantities`.

## Output

Writes `generated/kinds.ts`:
```typescript
export const kindOfQuantities: KindOfQuantity[] = [...]
export const quantityToKind: Record<string, string> = { "t3-1.1": "kind-L", ... }
```

## Status: DONE
