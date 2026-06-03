# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This repo produces the **ISQ Browser** — a static SPA for browsing the ISO 80000 & IEC 80000 series of quantities, units, and mathematical notation.

## Naming Convention: ISO 80000 & IEC 80000

The 80000 series is **NOT** published as "ISO/IEC 80000". Individual parts are published separately by ISO or IEC. Use one of these forms:

- **"ISO 80000 & IEC 80000"** — when referring to the full series
- **"ISO|IEC 80000 series"** — when referring to the series as a collective
- **"ISQ"** — short form for the International System of Quantities
- **"ISO 80000-{part}"** or **"IEC 80000-{part}"** — when citing a specific part (use the actual publisher)

**NEVER** use:
- "ISO/IEC 80000" — this implies a dual-logo publication, which is incorrect
- Bare "80000" without prefix — always say "ISO 80000" or "IEC 80000" or "the ISO 80000 & IEC 80000 series"

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
