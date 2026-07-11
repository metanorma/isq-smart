# 09 — Reusable Astro Components (DRY)

## Audit Results
- Hero gradient pattern: duplicated across 4 pages (index, about, quantities, math)
- Breadcrumb: duplicated across 10 pages
- SectionHead (eyebrow + h2): 9 occurrences on about.astro alone
- Part grid: duplicated across 4 pages (home, quantities, math, about)

## Tasks
- [ ] `src/components/PageHero.astro` — gradient hero with breadcrumb slot, title, description, stats
- [ ] `src/components/Breadcrumb.astro` — Home link + chevron + current page label
- [ ] `src/components/SectionHead.astro` — eyebrow + h2 title + optional subtitle
- [ ] `src/components/PartGrid.astro` — responsive part card grid
- [ ] `src/components/EntryRow.astro` — entry list row (shared between EntryBrowser, PartEntryList)
- [ ] Refactor all pages to use these components
