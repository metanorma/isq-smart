# ISQ Browser

A static site for browsing the **ISO 80000 & IEC 80000** series of international standards — quantities, units of measurement, and mathematical notation.

Built with **Astro 7** (file-based routing, static SSR) and **Vue 3** islands for interactive components. All data is compiled at build time from YAML and Turtle sources.

## Naming Convention

The 80000 series is **NOT** published as "ISO/IEC 80000". Individual parts are published separately by ISO or IEC. Use one of these forms:

- **"ISO 80000 & IEC 80000"** — when referring to the full series
- **"ISO|IEC 80000 series"** — when referring to the series as a collective
- **"ISQ"** — short form for the International System of Quantities
- **"ISO 80000-{part}"** or **"IEC 80000-{part}"** — when citing a specific part (use the actual publisher)

**NEVER** use "ISO/IEC 80000" (implies a dual-logo publication, which is incorrect) or bare "80000" without a prefix.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:4321
```

The Astro dev server auto-generates TypeScript data modules from YAML/Turtle sources on first start. Subsequent starts use the cached output.

## Prerequisites

- **Node.js** >= 20 (tested with 22.x)
- **npm** >= 9

External data repos must be cloned at the repo root (or configured via env vars):

```bash
git clone https://github.com/metanorma/iso-iec-80000.git    # YAML source data
git clone https://github.com/unitsml/unitsdb.git             # UnitsML units/dimensions
git clone https://github.com/metanorma/sdu-smart.git         # SmartSDU TTL (ontology)
```

| Env var | Default | Source |
|---------|---------|--------|
| `ISO_80000_DIR` | `iso-iec-80000` | `metanorma/iso-iec-80000` |
| `UNITSDB_DIR` | `unitsdb` | `unitsml/unitsdb` |
| `SDU_SMART_DIR` | `sdu-smart` | `metanorma/sdu-smart` |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Astro dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run build:check` | Build + `astro check` type-checking |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest unit tests |

For type-checking alone:

```bash
npx astro check
```

## Architecture

### Stack

- **Astro 7** — host framework, file-based routing, static-first SSR
- **Vue 3** — interactive islands only (via `@astrojs/vue`)
- **Tailwind CSS 4** — via `@tailwindcss/vite`
- **Vite 8** — bundled with Astro

### Data pipeline

```
iso-iec-80000/sources/dataset/*.yaml     ─┐
unitsdb/*.yaml                            ─┤→ Vite plugins → src/data/generated/*.ts
sdu-smart/reference-docs/*.ttl            ─┤
public/ontologies/*.ttl                   ─┘
```

Two Vite plugins (`yaml-data`, `ontology-data`) read source files and generate ~40 TypeScript modules:
- `part-*.ts` — per-part entry data
- `meta.ts` — part metadata (titles, descriptions, icons)
- `domain-index.ts` — lightweight entry summaries for listing pages
- `unitsdb.ts` — UnitsML unit database
- `physical-dimensions.ts` — dimension vectors and quantity cross-references
- `ontology.ts` — parsed OWL ontology entities from Turtle files
- `iso80000.ts` — document/clause/term structure from SHACL ontology

### Routing (file-based, no client-side router)

| Route | Page |
|-------|------|
| `/` | Home — overview with domain cards and stats |
| `/quantities` | Quantities domain — all quantity entries |
| `/quantities/part-{part}` | Part listing |
| `/quantities/part-{part}/{id}` | Entry detail |
| `/math` | Math domain |
| `/units` | Units browser (UnitsML-based) |
| `/units/{slug}` | Unit detail |
| `/dimensions` | Dimensional analysis browser |
| `/documents` | Publications listing |
| `/ontology` | OWL ontology browser |
| `/reference` | Technical reference (URNs, identifiers) |
| `/about` | Project background |

### Source directories

```
src/
  layouts/        BaseLayout.astro, DefaultLayout.astro
  pages/          Astro page templates (file-based routing)
  components/     Vue islands (interactive) + .astro components (static)
  composables/    Vue composables (useTheme, useSearch, useAccent)
  lib/            Shared utilities (asset, nav, animations, rdf)
  data/           Data layer (PartRegistry, EntryModel, DataLoader, urn, citation)
    generated/    Auto-generated TypeScript data (gitignored)
  styles/         Tailwind CSS v4 theme
```

### Vue islands

Pages are native `.astro` templates with data fetched in frontmatter. Vue components are used as hydrated islands with `client:load`, `client:idle`, or `client:visible` directives. Static content is server-rendered — no JavaScript shipped for non-interactive parts.

## Deployment

The build produces a fully static multi-page site in `dist/`:

```bash
npm run build
# dist/ contains 1300+ static HTML pages + assets
```

### GitHub Pages

The production base path is `/isq-smart/` (configured in `astro.config.ts`). In dev, the base path is `/` for convenience.

### Any static host

Upload the contents of `dist/`. No SPA fallback needed — each route is a separate `.html` file.

## RDF exports

Pre-generated Turtle and JSON-LD files in `public/exports/` are produced by the Ruby rake task (requires the parent `sdu-smart` gem):

```bash
cd .. && bundle exec rake export:all
```

The browser also generates JSON-LD/Turtle client-side on entry and ontology detail pages.
