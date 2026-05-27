# Spec / Test Plan

## Current State

No automated tests exist in the browser repo. The `bin/check` command runs `vue-tsc --noEmit` for type-checking but there are no unit, integration, or e2e tests.

## What to Test

### 1. Data Layer Tests (Vitest — unit)

Highest priority. These test the pure functions that drive the entire app.

| Module | Tests |
|---|---|
| `PartRegistry.ts` | `getPartMeta`, `partUrl`, `entryUrl`, `domainPath`, `getPartsByDomain` return correct values for base parts, sub-sections, and parent parts |
| `PartRegistry.ts` | `publisherOf` returns ISO for parts 2-5,7-10,12 and IEC for 6, 13; sub-sections inherit correctly |
| `ontologyConfig.ts` | `tagToClass`, `partQname`, `entryQname` produce correct qnames |
| `useOntology.ts` | `findByQname` finds entity or returns undefined; `linkTo` returns `/ontology/:slug` or empty string; `useClassHierarchy` walks parent chain correctly, handles cycles |
| `EntryModel` (in `index.ts`) | `name`, `definition`, `remarks`, `unitName`, `unitSymbols`, `hasFrench`, `sectionGroup`, `shortDef` for both quantity and math entries, bilingual entries |
| `jsonld.ts` | `generateEntryJsonLd`, `jsonLdToTurtle`, `generateBibTeX`, `generateChicago`, `generateRis` produce correct output for quantity/math entries |
| `Urn` module | `Urn.part`, `Urn.entry` produce correct ISO and IEC URNs |
| `DataLoader` | `loadPart` returns entries for leaf parts; aggregates correctly for parent parts (2, 11) |

### 2. Build Pipeline Tests (Vitest — unit)

Test the Vite plugin logic that generates data.

| Module | Tests |
|---|---|
| `vite.config.ts` yaml-data plugin | Generated TypeScript modules have correct shape; `_tag` is 'quantity' or 'math' per part domain |
| `vite.config.ts` ontology-data plugin | Generated `ontology.ts` has expected entities; entity types (class, property, shape, individual, taxonomy) are correct; qnames resolve correctly |
| `vite.config.ts` xref generation | Xref map keys use correct format (`iso80000-N`, `iec80000-N`); hrefs point to `/documents/part-N` |
| `vite.config.ts` namespace metadata | Prefix and URI match ontology TTL source |

### 3. Component Tests (Vitest + Vue Test Utils)

| Component | Tests |
|---|---|
| `EntryOntologyPanel.vue` | Renders correct class qname for quantity/math entries; property table has expected rows; related entities section has correct links |
| `UnitOntologyPanel.vue` | Renders `isoiec80000:Unit` class; shows dimension link when `dimensionRef` present |
| `DimensionOntologyPanel.vue` | Renders `isoiec80000:Dimension` class; shows vector notation when not dimensionless |
| `OntologyPanelLayout.vue` | Renders hierarchy, IRI, properties table, related entities from props |

### 4. Routing Tests (Vitest + Vue Router)

| Test | Description |
|---|---|
| `/quantities/part-3/t3-1` | Loads part-3 data, finds entry, renders entry page |
| `/math/part-2-19/t2-19.1` | Loads part-2-19 data, finds math entry, renders entry page |
| `/documents/part-4` | Renders document detail for Part 4 |
| `/ontology/smart-TermEntry` | Renders ontology detail for smart:TermEntry entity |
| `/quantities/part-2` | Aggregates math sub-sections (should this route exist?) |

### 5. Snapshot / Golden Tests

| What | Why |
|---|---|
| Generated `ontology.ts` structure | Catch regressions in ontology data pipeline |
| Generated `meta.ts` (part summaries) | Catch regressions in YAML data pipeline |
| JSON-LD output for sample entries | Catch regressions in serialization |
| TTL output for sample entries | Catch regressions in Turtle serialization |

## Setup

```bash
npm install -D vitest @vue/test-utils @vitejs/plugin-vue jsdom
```

Add `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

Add script to `package.json`:

```json
{ "scripts": { "test": "vitest run", "test:watch": "vitest" } }
```

## Priority Order

1. Data layer tests (PartRegistry, jsonld, EntryModel) — highest ROI
2. Build pipeline tests (ontology-data, yaml-data plugins) — catch data regressions
3. Component tests — verify UI correctness
4. Routing tests — verify navigation
5. Snapshot tests — catch output drift
