# 05 — Unify math/quantities detail page templates

## Problem
`src/pages/math/part-[part]/[id].astro` and `src/pages/quantities/part-[part]/[id].astro` are **90% identical**. The diff shows:
- Same breadcrumb structure
- Same hero header (num, name, URNs)
- Same designations block
- Same definition block (EN + FR)
- Same notes block (EN + FR)
- Same referenced-by block

The only differences:
- Quantities has a Units section (math doesn't)
- Quantities has concept hierarchy panel (math doesn't)
- Breadcrumb label ("Math" vs "Quantities")
- Accent color

## Solution

### Create `src/components/EntryDetailLayout.astro`
A single layout that renders the full entry detail page, parameterized by:
- `entry: Entry`
- `view: EntryDetailView`
- `meta: PartMeta`
- `domain: 'quantities' | 'math'`

Slot for domain-specific sections (units, concept hierarchy).

### Refactor both pages
```astro
--- math/[id].astro ---
<EntryDetailLayout entry={entry} view={view} meta={meta} domain="math" />

--- quantities/[id].astro ---
<EntryDetailLayout entry={entry} view={view} meta={meta} domain="quantities">
  {# units and concept hierarchy go in the slot}
</EntryDetailLayout>
```

## Benefits
- **DRY** — one template, not two 300-line near-duplicates
- Adding a new domain-specific section doesn't require editing both files
- Style changes (e.g. paragraph spacing) apply to both domains → **locality**

## Test plan
- Both pages render identical structure for shared sections
- Quantities page shows units and hierarchy; math page does not
- All existing tests still pass
