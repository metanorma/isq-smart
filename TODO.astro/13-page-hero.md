# 13 — PageHero Component

## Problem
5 pages have 20+ lines of identical hero markup (gradient bg, floating dots, breadcrumb, title, description).

Pages: index.astro, about.astro, quantities/index.astro, math/index.astro, documents/part-[part].astro

## Tasks
- [ ] Create `src/components/PageHero.astro` with props: variant (brand/violet), crumbs, title, subtitle, stats slot
- [ ] Apply to all 5 pages with hero gradient
- [ ] Verify build
