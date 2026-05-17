# Verify browser data source paths work with new structure

## Current state
`browser/vite.config.ts` reads from:
- `../../iso-iec-80000/sources/dataset/` — YAML dataset (sibling repo)
- `../../../unitsml/unitsdb` — UnitsML data (another sibling repo)
- `../reference-docs/` — SmartSDU reference model (this repo)

After restructuring, the repo root still contains `browser/` and `reference-docs/`,
so paths relative to `browser/` remain valid. The `iso-iec-80000` path is to a
sibling repo outside this monorepo — no change needed.

## Target
- Verify `npm run dev` still works after file moves
- Verify `npm run build` completes
- The GHA workflow clones `iso-iec-80000` as a sibling (already done)

## How to apply
1. `cd browser && npm run dev` — check console for yaml-data errors
2. `cd browser && npm run build` — verify clean build
3. If paths break, update `isoIec80000Dir` / `unitsmlDir` / `referenceDocsDir` in vite.config.ts
