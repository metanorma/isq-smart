# 05 — Static Pages Migration

## Goal
Convert the mostly-static pages to Astro. These have no dynamic route params and minimal interactivity.

## Pages

### 5.1 About
- `src/pages/about.vue` → `src/pages/about.astro`
- Fully static content
- Uses `SiteConfig.asset()` for images — works in Astro frontmatter
- Part data (`getPartsByDomain`, `partEntryCount`) runs in Astro frontmatter (build-time)
- Publisher logos, ecosystem cards — all static at build time

### 5.2 Reference
- `src/pages/reference.vue` → `src/pages/reference.astro`
- API documentation, static content
- Code examples rendered at build time

### 5.3 URN Patterns
- `src/pages/urn-patterns.vue` → `src/pages/reference/urn-patterns.astro`
- Update route: `/reference/urn-patterns` (already this path)
- Interactive URN builder (if any) → Vue island `client:idle`

### 5.4 404 Not Found
- `src/pages/not-found.vue` → `src/pages/404.astro`
- Static error page

## Pattern
For each page:
1. Create `.astro` file
2. Move Vue `<script setup>` logic to Astro frontmatter (between `---` fences)
3. Move template to markup body
4. Import Vue components as islands where interactivity is needed
5. Replace `<router-link to="X">` with `<a href="X">`
6. Replace `SiteConfig.asset(path)` with import or `import.meta.env.BASE_URL + path`

## Acceptance Criteria
- All four static pages render correctly
- Links to other pages work (plain `<a>` tags)
- No console errors
- Dark mode works
