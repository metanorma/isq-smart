# ISO/IEC 80000 Browser

A static Vue.js application for browsing the [ISO/IEC 80000](https://www.iso.org/standard/30669.html) series of international standards — quantities, units of measurement, and mathematical notation.

The site is built as a fully static SPA with no backend. All data is compiled into JavaScript bundles at build time from YAML sources.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:5173
```

The Vite dev server auto-generates TypeScript data modules from YAML sources on first start. Subsequent starts use the cached output.

## Prerequisites

- **Node.js** >= 20 (tested with 22.x)
- **npm** >= 9

The YAML source data lives in a sibling directory (`../iso-iec-80000/sources/dataset/`). If that directory is absent, the build will fail — clone the `iso-iec-80000` repo alongside this one.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`vue-tsc`) then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest unit tests |

For type-checking alone:

```bash
npx vue-tsc --noEmit
```

## Architecture

### Data pipeline

```
iso-iec-80000/sources/dataset/*.yaml
  → Vite plugin (vite.config.ts) transforms at build time
  → src/data/generated/*.ts
  → lazy-loaded by Vue Router page components
```

The Vite plugin (`yaml-data` in `vite.config.ts`) reads YAML sources and writes ~40 TypeScript modules to `src/data/generated/`:
- `part-*.ts` — per-part entry data (one file per part or sub-part)
- `meta.ts` — part metadata (titles, descriptions, icons)
- `domain-index.ts` — lightweight entry summaries for domain listing pages
- `unitsdb.ts` — UnitsML unit database with dimensional analysis
- `physical-dimensions.ts` — dimension vectors and quantity cross-references
- `ontology.ts` — parsed OWL ontology entities from Turtle files
- `xref-map.ts` / `reverse-xref.ts` — cross-reference indexes
- `iso80000.ts` — document/clause/term structure from SHACL ontology
- `sections.ts` — AsciiDoc-rendered provision sections

**On `dev`**: generates in background on first start, uses cache on subsequent starts.
**On `build`**: regenerates all files synchronously before bundling.

### Routing

| Route | Page |
|-------|------|
| `/` | Index — overview with domain cards and stats |
| `/quantities` | Quantities domain — all quantity entries |
| `/quantities/part-:part` | Part listing — entries for one part |
| `/quantities/part-:part/:id` | Entry detail — single quantity |
| `/math` | Math domain — math notation entries |
| `/math/part-:part/:id` | Math entry detail |
| `/units` | Units browser (UnitsML-based) |
| `/units/:slug` | Unit detail |
| `/dimensions` | Dimensional analysis browser |
| `/documents` | Publications listing |
| `/documents/part-:part` | Part document (scope, publisher, highlights) |
| `/ontology` | OWL ontology browser |
| `/ontology/:slug` | Ontology entity detail |
| `/reference` | Technical reference (URNs, identifiers) |
| `/about` | Project background and history |

### Key source directories

```
src/
  layouts/       Default.vue (header/footer/shell), OntologyLayout.vue
  pages/         Route components (one file per route)
  components/    Reusable UI components (MathRenderer, LanguageToggle, etc.)
  composables/   Vue composables (useTheme, useSearch, useAccent)
  data/          Data layer
    index.ts       Public API — re-exports from PartRegistry, EntryModel
    PartRegistry.ts  Part metadata, URL generation, domain grouping
    types.ts       TypeScript type definitions
    aboutParts.ts  Part introduction content (scope, highlights, publisher)
    generated/    Auto-generated TypeScript data (gitignored)
```

### Static assets

```
public/
  img/             Logos (ISO, IEC, BIPM, QUDT, UCUM, UnitsML)
  ontologies/      Turtle files (ontology + SHACL shapes)
  exports/         Pre-generated TTL and JSON-LD downloads (via `rake export:all`)
```

### Styling

Tailwind CSS v4 with `@tailwindcss/vite` plugin. Theme colors (`brand-*`, `dark-*`) defined in `src/style.css`. Per-part accent colors via `useAccent` composable.

## Deployment

The build produces a fully static site in `dist/`. Deploy to any static host:

```bash
npm run build
# dist/ contains the production assets
```

### Netlify

No config file needed. Set:
- **Build command**: `cd browser && npm install && npm run build`
- **Publish directory**: `browser/dist`

### GitHub Pages

```bash
npm run build
# Deploy dist/ contents to gh-pages branch
```

### Any static host

Upload the contents of `dist/`. The app uses `createWebHistory()` — configure the host to redirect all paths to `index.html` for client-side routing.

## RDF exports

Pre-generated Turtle and JSON-LD files in `public/exports/` are produced by the Ruby rake task (requires the parent `sdu-smart` gem):

```bash
cd .. && bundle exec rake export:all
```

This generates per-part and bulk exports with a `manifest.json` index. The browser serves these as static downloads — no Ruby runtime needed.
