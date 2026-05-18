# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This repo produces the **ISQ Browser** — a static SPA for browsing ISO/IEC 80000 quantities, units, and mathematical notation.

The Ruby gems live in their own repositories:
- **sdu-smart** — https://github.com/metanorma/sdu-smart (`SduSmart` module)
- **isq** — https://github.com/metanorma/isq (`Isq` module)

## Repository Layout

| Directory | Description |
|---|---|
| `browser/` | Vue.js 3 + TypeScript + Tailwind CSS v4 static site. Vite plugins generate data at build time |
| `bin/` | Dev scripts: `bin/check` (type-check), `bin/dev`, `bin/build` |

## Commands

```bash
cd browser && npm run dev          # Vite dev server → http://localhost:5173
cd browser && npm run build        # vue-tsc + vite build
bin/check                          # Frontend type-check
```

## External Data Repos

The browser reads raw data files from three GitHub repos at build time. Clone or symlink them inside this repo:

```bash
cd isq-smart
git clone https://github.com/metanorma/iso-iec-80000.git    # YAML source data
git clone https://github.com/unitsml/unitsdb.git             # UnitsML units/dimensions
git clone https://github.com/metanorma/sdu-smart.git         # SmartSDU TTL (ontology browser)
```

Paths are configurable via env vars (defaults assume these directories exist at repo root):

| Env var | Default | Source |
|---|---|---|
| `ISO_80000_DIR` | `iso-iec-80000` | `metanorma/iso-iec-80000` |
| `UNITSDB_DIR` | `unitsdb` | `unitsml/unitsdb` |
| `SDU_SMART_DIR` | `sdu-smart` | `metanorma/sdu-smart` |

CI (GHA) checks out all three repos as workspace subdirectories automatically.

## Browser Architecture

- **Build-time data pipeline**: Two Vite plugins (`yaml-data`, `ontology-data`) read YAML/Turtle sources and generate ~40 TypeScript modules into `src/data/generated/`
- **Pages**: Lazy-loaded per-part data via Vue Router. Key pages: quantities listing, math notation, units browser, dimensions, ontology browser, documents
- **Routing**: Uses `createWebHistory()` — host must redirect all paths to `index.html`

### Data flow

- YAML sources (`iso-iec-80000/sources/dataset/*.yaml`) → Vite `yaml-data` plugin → TypeScript modules
- SmartSDU Turtle files (`sdu-smart/reference-docs/`) + ISO 80000 Turtle files (`public/ontologies/`) → Vite `ontology-data` plugin → ontology browser data
- UnitsML YAML files (`unitsdb/*.yaml`) → Vite `yaml-data` plugin → units and dimensions pages
- Vue Router lazy-loads per-part data on navigation

### RDF exports

The `rake export:all` task in the isq gem generates static RDF files (TTL/JSON-LD) served from `public/exports/`. These are **downloadable files only** — the browser does not consume them at build or runtime. JSON-LD/Turtle downloads on entry pages are generated client-side.
