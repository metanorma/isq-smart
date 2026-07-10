# 08 — Documentation

## CLAUDE.md
- [ ] Update "Browser Architecture" section to describe Astro:
  - File-based routing (not Vue Router)
  - Static SSR with selective hydration (Vue islands)
  - `getStaticPaths()` for dynamic routes
  - `client:load` / `client:idle` / `client:visible` directives
- [ ] Update "Commands" section:
  - `astro dev` (not `vite`)
  - `astro build` (not `vite build`)
  - `astro check` (not `vue-tsc`)
- [ ] Update "Data flow" section:
  - Build-time: Vite plugins generate TS modules from YAML/TTL
  - Page-time: Astro frontmatter fetches data, renders static HTML
  - Client-time: Vue islands hydrate with props from Astro
- [ ] Remove SPA references (vue-router, lazy-loaded routes, createWebHistory)

## TODO.astro Status
- [ ] Mark completed TODOs with ✅
- [ ] Delete TODO files that are fully done (or keep for reference)

## README.adoc
- [ ] Update if it references Vue SPA architecture
