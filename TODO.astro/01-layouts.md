# 01 — Layouts

## Goal
All layouts are native `.astro` files. Header is static HTML with `Astro.url.pathname` for active link detection. Only truly interactive parts are Vue islands.

## Status: ✅ DONE (may need refinement)

## Files
- `src/layouts/BaseLayout.astro` — HTML shell, meta, fonts, dark-mode inline script
- `src/layouts/DefaultLayout.astro` — header (static), footer, island slots
- `src/layouts/OntologyLayout.astro` — (TODO: create for ontology pages)

## What's Done
- DefaultLayout renders header as static HTML with `<a>` tags
- Active link detection via `Astro.url.pathname` (server-side, no JS needed)
- ThemeToggle.vue — `client:load` island
- MobileNav.vue — `client:load` island, receives links + activePath as props
- GlobalSearch.vue — `client:idle`, listens for `open-search` custom event
- SearchHint.vue — `client:load`
- BackToTop.vue — `client:visible`
- AppToast.vue — `client:idle`
- SiteFooter.vue — static (no island)

## Remaining
- [ ] Create OntologyLayout.astro for ontology pages (sidebar + content)
- [ ] Verify dark mode toggle works across MPA navigations
- [ ] Verify mobile nav works (transition, close on navigate)
