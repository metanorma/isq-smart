# 07 — Performance

## Audit Tasks
- [ ] Check total JS shipped per page (should be minimal — Astro islands only)
- [ ] Verify heavy components use `client:idle` or `client:visible` (not `client:load`)
- [ ] Audit if Chart.js on ontology page is lazy-loaded (should be)
- [ ] Check if MathRenderer ships unnecessary JS — consider server-side MathML rendering

## Hydration Audit
| Component | Current | Optimal | Action |
|-----------|---------|---------|--------|
| ThemeToggle | client:load | client:load | ✅ (needed immediately) |
| MobileNav | client:load | client:load | ✅ (needed immediately) |
| SearchHint | client:load | client:idle | Consider — `/` shortcut needed soon but not instantly |
| GlobalSearch | client:idle | client:idle | ✅ |
| AppToast | client:idle | client:idle | ✅ |
| BackToTop | client:visible | client:visible | ✅ |
| MathRenderer | client:visible | client:visible | ✅ |
| EntryBrowser | client:idle | client:idle | ✅ |
| CitationBuilder | client:idle | client:idle | ✅ |
| Ontology* | client:idle | client:idle | ✅ |

## Bundle Analysis
- [ ] Run `astro build` and check output sizes
- [ ] No chunk should exceed 200KB gzipped (except chart.js which is lazy-loaded)
- [ ] Verify no duplicate Vue runtime chunks
