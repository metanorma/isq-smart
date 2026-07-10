# 02 — Astro Infrastructure

## Goal
Install Astro 7 and configure it alongside the existing Vue/Vite/Tailwind stack, without breaking the current build. The Astro app lives in `browser/` (same directory, replacing the Vite-only setup).

## Tasks

### 2.1 Install dependencies
```bash
cd browser
npm install astro@^7 @astrojs/vue
# already have: vite, @tailwindcss/vite, tailwindcss, vue
```

### 2.2 Create `astro.config.mjs`
- `integrations: [vue()]`
- `vite: { plugins: [tailwindcss()] }`
- `base: SiteConfig.basePath`
- `output: 'static'`
- Apply yaml-data and ontology-data plugins via Astro's `vite.plugins` hook (they are Vite plugins and work as-is)

### 2.3 Restructure directories
- `src/pages/` → `src/pages/` (Astro convention, .astro files)
- `src/layouts/` → Astro layouts
- `src/components/` → stays (Vue components imported by .astro pages)
- `src/composables/` → stays (used by Vue island components)
- `src/data/` → stays (build-time output)
- `src/styles/main.css` → imported in Astro layout

### 2.4 Update npm scripts
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run",
  "check": "astro check"
}
```

### 2.5 TypeScript config
- Extend `astro/tsconfigs/strictest` in `tsconfig.json`
- Keep existing path aliases

### 2.6 Entrypoint
- Remove `src/main.ts` (Astro uses `.astro` pages as entrypoints)
- Remove `index.html` (Astro generates its own)

## Acceptance Criteria
- `npm run dev` starts Astro dev server
- `npm run build` produces a static build in `dist/`
- Tailwind CSS compiles correctly
- No regression in generated data (yaml-data and ontology-data plugins still run)
