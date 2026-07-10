# Remaining Tasks — Full Astro 7 Migration Cleanup

## Audit Findings (2026-07-11)

### Type Safety
- `citation.test.ts:63` — error: assigning to readonly `designations` property
- `EntryModel.test.ts:3` — unused `Entry` import
- `PartRegistry.test.ts:5` — unused `getAllParts` import
- `tsconfig.json` doesn't extend `astro/tsconfigs/strictest`, missing `.astro` includes

### DRY Violations
- `asset()` helper duplicated in every .astro page (12+ copies) and Vue components
- Scroll-reveal inline script duplicated in index.astro and other pages
- Count-up animation inline in index.astro

### Dead Code
- `OntologySidebar.vue` — not imported by any page (agent inlined sidebar)
- `SiteHeader.vue` — replaced by static HTML in DefaultLayout.astro
- `JsonLd.vue` — replaced by inline `<script type="application/ld+json">` in pages
- `useEntry.ts` — was used by deleted EntryPage.vue
- `usePartData.ts` — was used by deleted PartPage.vue
- `useOntologySidebar.ts` — used only by dead OntologySidebar.vue
- `SiteConfig.asset()` — replaced by `import.meta.env.BASE_URL` pattern

### Organization
- `PartEntryList.vue` in `islands/` subdirectory, all other islands flat — inconsistent
- `bin/check` uses `vue-tsc` (uninstalled) — should use `astro check`
- `bin/dev`, `bin/build` may reference old Vite commands

### Missing Tests
- No tests for new islands: EntryBrowser, UnitBrowser, DimensionBrowser, PartEntryList
- No tests for: RecentEntries, ThemeToggle, MobileNav, DatasetDownload
- No tests for remaining composables: useSearch, useTheme, useRdfExport
- No tests for build plugins: yaml-data-plugin, ontology-data-plugin

## TODO Index
- `01-shared-utilities.md` — Extract DRY utilities (asset, scroll-reveal, nav config)
- `02-type-safety.md` — Fix TS errors, update tsconfig for Astro
- `03-dead-code-removal.md` — Delete unused components, composables, methods
- `04-component-organization.md` — Consistent island structure
- `05-scripts-config.md` — Fix bin scripts, package.json, CLAUDE.md
- `06-specs.md` — Comprehensive test coverage
- `07-performance.md` — Audit hydration, bundle sizes
- `08-documentation.md` — Update CLAUDE.md, README, TODO status
