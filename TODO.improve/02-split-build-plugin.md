# 02 — Split the build plugin into a pipeline of focused stages

## Problem

`yaml-data-plugin.ts` is 740 lines with one `generateFiles()` function that handles:
1. YAML loading and entry transformation
2. Math expression collection and rendering
3. Cross-reference map building
4. UnitsML integration and enrichment
5. Physical dimension computation
6. Domain index, route generation, document section discovery

No stage can be tested or reasoned about in isolation.

## Solution

Extract each responsibility into its own function with clear inputs/outputs. Keep the plugin as a thin coordinator. The stages:

1. `loadEntries(datasetDir)` → raw entries
2. `renderAllMath(entries)` → { mathCache, latexCache }
3. `buildXrefMap(entries)` → { xrefMap, reverseXref }
4. `enrichUnits(entries, unitsdbDir)` → enriched units
5. `computeDimensions(entries, unitsdbDir)` → physical dimensions
6. `emitOutputs(entries, units, dimensions, ...)` → writes generated files

Each function lives in its own file under `browser/build/`.

## Files affected

- `browser/build/yaml-data-plugin.ts`
- `browser/build/math-collector.ts` (already extracted)
- New: `browser/build/stages/` directory with focused stage modules
