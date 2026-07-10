# 09 — Cleanup & Remove SPA Code

## Goal
After all pages are migrated to Astro, remove the Vue Router SPA code and dead files.

## Tasks

### 9.1 Remove Vue Router
- Delete `src/router.ts`
- Uninstall `vue-router` package
- Remove `<router-link>` / `<router-view>` usage everywhere
- Replace all `<router-link to="X">` with `<a href="X">` in remaining .vue components

### 9.2 Remove SPA entry
- Delete `src/main.ts`
- Delete `src/App.vue`
- Delete `index.html` (if it exists at repo root for SPA)

### 9.3 Remove old Vue pages
- Delete `src/pages/*.vue` (all of them — replaced by .astro files)

### 9.4 Remove old Vue layouts
- Delete `src/layouts/Default.vue`
- Delete `src/layouts/OntologyLayout.vue`

### 9.5 Composables refactor
- Remove `useScrollReveal.ts` if Astro handles this via CSS
- Keep composables that are used by Vue island components
- Update composables that depended on `useRoute()` — they now receive data via props

### 9.6 Config cleanup
- Remove `src/vite-env.d.ts` if not needed
- Update `tsconfig.json` to remove Vue-specific references if unused
- Remove old `vite.config.ts` (replaced by `astro.config.mjs`)

## Acceptance Criteria
- No references to `vue-router` anywhere
- No dead .vue page files
- `npm run build` produces clean output
- `bin/check` passes
