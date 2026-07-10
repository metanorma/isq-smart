# Astro Migration — Overview

## Current Stack
- Vue 3 SPA (client-side routing via vue-router)
- Vite 8 build with two custom plugins (`yaml-data`, `ontology-data`) that generate ~40 TS modules at build time
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- 20 pages, ~20 components, 12 composables
- Deployed as a static SPA (base path `/isq-smart/`)

## Target Stack
- **Astro 7** (host framework, file-based routing, static-first)
- **Vite 8** (bundled with Astro)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Vue 3** via `@astrojs/vue` (interactive islands only)

## Key Architectural Shifts
1. **Routing**: Vue Router (SPA) → Astro file-based routing (MPA with opt-in island hydration)
2. **Pages**: `.vue` page components → `.astro` page files that import Vue components as islands
3. **Data**: Build-time Vite plugins → Astro integration / standalone build script (output format unchanged)
4. **Interactivity**: Global SPA state → Per-island hydration with `client:load`, `client:idle`, `client:visible`
5. **Navigation**: `<router-link>` → plain `<a>` tags (Astro MPA)

## Migration Strategy
1. Expand vitest coverage first (safety net)
2. Set up Astro in parallel directory structure
3. Migrate build pipeline (keep generated/ output identical)
4. Migrate layouts
5. Migrate pages bottom-up (static → listing → detail)
6. Convert interactive components to Vue islands
7. Verify feature parity
8. Swap deployment

## TODO Index
- `01-vitest-coverage.md` — Expand test coverage
- `02-astro-infrastructure.md` — Install & configure Astro
- `03-build-pipeline.md` — Migrate Vite plugins to Astro build
- `04-layouts.md` — Convert Vue layouts to Astro layouts
- `05-static-pages.md` — Migrate static pages
- `06-listing-pages.md` — Migrate listing pages
- `07-detail-pages.md` — Migrate detail pages
- `08-vue-islands.md` — Convert interactive components to islands
- `09-cleanup.md` — Remove Vue Router, old SPA code
- `10-ci-deploy.md` — Update CI/CD
- `11-verification.md` — End-to-end verification
