# 11 — Performance Audit

## Current State
- `dist/` = 97MB (1323 pages, mostly HTML)
- Largest JS: domain-index (224KB) — search index shipped to EntryBrowser
- Chart.js (197KB) — already lazy-loaded on ontology stats tab

## Tasks
- [ ] Verify domain-index lazy-loads instead of being in initial bundle
- [ ] Check per-page JS payload (should be < 50KB gzipped for most pages)
- [ ] Verify no duplicate Vue runtime chunks
- [ ] Confirm `client:idle` / `client:visible` strategies are applied correctly
