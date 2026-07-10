# 10 — CI/CD Update

## Goal
Update GitHub Actions workflow and deployment config for the Astro build.

## Tasks

### 10.1 Update build workflow
- `.github/workflows/*.yml` — update build commands:
  - `npm install` → same
  - Build command: `astro build` (via `npm run build`)
  - Output dir: `dist/` (Astro default)
  - Confirm external data repos still checked out

### 10.2 External data repos
- Verify CI still checks out `iso-iec-80000`, `unitsdb`, `sdu-smart`
- Verify env vars (`ISO_80000_DIR`, `UNITSDB_DIR`, `SDU_SMART_DIR`) point to workspace subdirs

### 10.3 Base path
- Confirm `SiteConfig.basePath` (`/isq-smart/`) is applied to Astro config
- All internal links must be prefixed correctly

### 10.4 SPA fallback (if needed)
- Astro static output is MPA — each route is a separate .html file
- No need for SPA fallback (`/* → /index.html`)
- Verify hosting platform (GitHub Pages) serves all routes correctly

### 10.5 Sitemap
- Astro generates routes from `getStaticPaths()` — all valid part/entry/unit routes must be enumerated
- Generate `sitemap.xml` via `@astrojs/sitemap` integration (optional)

### 10.6 bin/ scripts
- Update `bin/check` if it references Vite-specific commands
- Update `bin/dev` if needed
- Update `bin/build` if needed

## Acceptance Criteria
- CI pipeline builds successfully
- Deployed site serves all routes
- No 404s on valid routes
- Generated data is correct in production
