# 11 — Cleanup

## Goal
Remove all SPA code, wrapper components, and vue-router dependency.

## Tasks

### 11.1 Remove vue-router
- [ ] `npm uninstall vue-router`
- [ ] Delete `src/router.ts`
- [ ] Remove `vue-router` from any remaining imports
- [ ] Remove `<router-link>` / `<router-view>` from any remaining files

### 11.2 Delete wrapper components
- [ ] Delete entire `src/components/pages/` directory (19 files)
  - AboutPage.vue, DimensionDetailPage.vue, DimensionsPage.vue,
  - DocumentDetailPage.vue, DocumentPartPage.vue, DocumentSectionDetailPage.vue,
  - DocumentSectionsPage.vue, DocumentsPage.vue, DomainPage.vue,
  - EntryPage.vue, HomePage.vue, NotFoundPage.vue, OntologyDetailPage.vue,
  - OntologyPage.vue, PartPage.vue, ReferencePage.vue, UnitPage.vue,
  - UnitsPage.vue, UrnPatternsPage.vue

### 11.3 Delete old SPA entry files
- [ ] Delete `src/main.ts`
- [ ] Delete `src/App.vue`
- [ ] Delete `src/layouts/Default.vue` (old Vue layout)
- [ ] Delete `src/layouts/OntologyLayout.vue` (old Vue layout)
- [ ] Delete `src/vite-env.d.ts` (if not needed by Astro)
- [ ] Delete `vite.config.ts` (replaced by astro.config.ts)
- [ ] Delete `src/pages-vue-backup/` (temporary backup)

### 11.4 Clean up composables
- [ ] Remove `useScrollReveal.ts` (replaced by inline script in pages)
- [ ] Remove `useEntryPage.ts` (was vue-router dependent, data now in props)
- [ ] Remove `useEntryNav.ts` (was vue-router dependent)
- [ ] Keep composables that are used by Vue island components

### 11.5 Config cleanup
- [ ] Update `tsconfig.json` — extend `astro/tsconfigs/strictest`
- [ ] Remove `vue-tsc` from devDependencies (replaced by `astro check`)
- [ ] Remove `@vitejs/plugin-vue` (Astro uses `@astrojs/vue` instead)
