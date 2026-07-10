# 05 — Scripts & Config

## bin/ Scripts
- [ ] `bin/check` — currently runs `vue-tsc --noEmit` (uninstalled). Change to:
  ```bash
  cd "$root/browser"
  npx astro check
  ```
- [ ] `bin/dev` — check if it uses `vite` or `astro dev`
- [ ] `bin/build` — check if it uses `vite build` or `astro build`

## package.json
- [ ] Verify scripts are correct:
  - `"dev": "astro dev"`
  - `"build": "astro build"`
  - `"build:check": "astro build && astro check"`
  - `"preview": "astro preview"`
  - `"test": "vitest run"`

## CLAUDE.md Updates
- [ ] Update "Browser Architecture" section — remove Vue Router references, describe Astro architecture
- [ ] Update "Commands" section — use `astro dev`, `astro build`, `astro check`
- [ ] Update "Data flow" section — describe Astro frontmatter data fetching + getStaticPaths
- [ ] Remove references to SPA, vue-router, lazy-loaded routes

## tsconfig.json
- Covered in `02-type-safety.md`

## astro.config.ts
- [ ] Verify `base` path logic is clean (dev: `/`, build: `/isq-smart/`)
- [ ] Verify all plugins are properly configured
