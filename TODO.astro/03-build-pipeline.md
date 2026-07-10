# 03 — Build Pipeline Migration

## Goal
Migrate the two custom Vite plugins (`yaml-data`, `ontology-data`) so they run under Astro's Vite instance. The generated output in `src/data/generated/` must remain byte-identical.

## Current State
- `build/yaml-data-plugin.ts` — reads YAML from `iso-iec-80000/sources/dataset/`, generates ~30 TS modules
- `build/ontology-data-plugin.ts` — parses TTL files from `sdu-smart/reference-docs/` and `public/ontologies/`, generates `ontology.ts`
- Both hook into `configResolved` — run at build start, cache at dev start
- Build stages live in `build/stages/`

## Tasks

### 3.1 Keep plugins as Vite plugins
Astro runs on Vite — the plugins work as-is when listed in `astro.config.mjs → vite.plugins`.

### 3.2 Verify plugin compatibility
- Confirm `configResolved` hook fires under Astro's Vite instance
- Confirm `command === 'build'` detection still works
- Confirm dev-mode caching behavior

### 3.3 External data repos
- Ensure `ISO_80000_DIR`, `UNITSDB_DIR`, `SDU_SMART_DIR` env vars still resolved
- Same missing-repo guard

### 3.4 Generated data verification
- Run `npm run build`
- Diff `src/data/generated/` before and after migration
- Must be byte-identical

## Acceptance Criteria
- `src/data/generated/*.ts` unchanged after migration
- Dev server regenerates data on first run, uses cache after
- Build regenerates data every time
