# 13 — Deepen EntryModel into focused resolvers

## Problem
`src/data/EntryModel.ts` (102 lines) is a barrel of 10+ functions mixing:
- Name resolution (entryName, entryRenderedName, entryPlainName)
- Definition/remarks rendering (entryDefinition, entryRemarks)
- Unit helpers (entryUnitName, entryUnitSymbols)
- Feature flags (entryHasFrench)
- Section grouping (entrySectionGroup)
- Short definitions (entryShortDef)

These are unrelated concerns sharing one namespace.

## Solution
Split into focused modules:
- `EntryNameResolver.ts` — name resolution from designations
- `EntryTextRenderer.ts` — definition/remarks rendering via AsciiDoc
- `EntryUnitResolver.ts` — unit name and symbol helpers
- `EntryClassification.ts` — hasFrench, sectionGroup predicates

The `EntryModel` object remains as a backward-compat barrel.

## Test plan
- Each resolver tested independently with fixture entries
- EntryModel barrel re-exports verified
