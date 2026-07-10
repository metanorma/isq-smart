# 03 — About Page (about.astro)

## Goal
Rewrite `about.astro` as native `.astro` template. Currently uses wrapper approach (`<AboutPage client:load />`).

## Source
- `src/components/pages/AboutPage.vue` (560 lines) — the full Vue template

## Tasks
- [ ] Move all data logic to Astro frontmatter:
  - `getPartsByDomain('quantities')`, `getPartsByDomain('math')`
  - `partEntryCount()`, `publisherOf()`
  - `ecosystem` array, `timeline` array, `audiences` array, `concepts` array
- [ ] Convert Vue template to Astro template:
  - `v-for` → `.map()`
  - `:class` → template literals
  - `:href` → `href={...}`
  - `SiteConfig.asset()` → `import.meta.env.BASE_URL + path`
  - `<router-link>` → `<a>` (already done in wrapper)
- [ ] Replace `<IsqLogo>` Vue component with static SVG or keep as `client:only` island
- [ ] No `client:load` on the whole page — only interactive parts as islands
- [ ] Delete `src/components/pages/AboutPage.vue`

## Sections (all become static HTML)
1. Hero — gradient background, floating elements
2. ISQ Emblem — logo + ISO/IEC fusion diagram
3. The Need — problem/solution cards
4. What It Is — overview with TC links
5. Scope — part grid with entry counts
6. Who It's For — audience cards
7. Key Concepts — quantity/dimension/unit cards
8. Timeline — evolution history
9. Ecosystem — related projects grid
10. Provided by — ISO/TC 12 + IEC/TC 25 cards
11. CTA — start browsing buttons
