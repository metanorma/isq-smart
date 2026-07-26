# 11 — Extract shared entry detail sections into components

## Problem
`src/pages/math/part-[part]/[id].astro` and `src/pages/quantities/part-[part]/[id].astro` share ~90% of their markup. The duplicated sections:
- Entry header (num, name, identifiers, URNs, citation builder)
- Designations block (EN/FR badges)
- Symbol showcase + notation systems
- Definition (EN/FR with space-y-4)
- Notes (EN/FR with space-y-4)
- Referenced by list

## Solution
Extract shared sections as presentational components:

- `src/components/entry/EntryHeader.astro` — num badge, rendered name, identifiers, URNs
- `src/components/entry/EntryDesignations.astro` — designations with EN/FR badges
- `src/components/entry/EntryDefinition.astro` — definition card (EN/FR)
- `src/components/entry/EntryNotes.astro` — notes card (EN/FR)
- `src/components/entry/EntryReferencedBy.astro` — referenced-by links
- `src/components/entry/EntrySymbolShowcase.astro` — symbol cards + notation systems

Both detail pages import and compose these. Domain-specific sections (units, concept hierarchy for quantities; notation systems for math) remain in the page.

## Benefits
- **DRY**: Shared markup in one place
- **Testable**: Each section is independently testable
- **OCP**: New sections added without modifying existing ones
- **Lower risk**: Changes isolated to individual components

## Test plan
- Both pages render identical structure for shared sections
- Quantities page shows units and hierarchy; math page does not
- All 554 existing tests still pass
