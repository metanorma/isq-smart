# 01 — Shared Utilities (DRY)

## Problem
The `asset()` helper is copy-pasted into every .astro page and Vue component:
```js
const base = import.meta.env.BASE_URL
const asset = (path: string) => (base + path.replace(/^\//, '')).replace(/\/\//g, '/')
```
12+ copies across the codebase. Scroll-reveal script is similarly duplicated.

## Solution
Create `src/lib/` with shared utilities. Single source of truth.

### Tasks
- [ ] Create `src/lib/asset.ts` — `asset(path: string): string` using `import.meta.env.BASE_URL`
- [ ] Create `src/lib/scroll-reveal.ts` — exported `initScrollReveal()` function
- [ ] Create `src/lib/nav.ts` — `coreLinks`, `secondaryLinks`, `isActive(pathname, path)` — shared between DefaultLayout and any page needing nav
- [ ] Replace all inline `asset()` definitions in .astro pages with import from `src/lib/asset`
- [ ] Replace all inline `asset()` definitions in Vue components with import
- [ ] Replace scroll-reveal inline scripts with `<script>import { initScrollReveal } from '../lib/scroll-reveal'; initScrollReveal()</script>` (or inline script tag that calls the function)
- [ ] Remove `SiteConfig.asset()` method (dead code)

## Architecture Principle
DRY — single source of truth for path resolution. OCP — new utilities can be added to `src/lib/` without modifying existing code.
