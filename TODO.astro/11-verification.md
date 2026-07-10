# 11 — End-to-End Verification

## Goal
Confirm feature parity between the old Vue SPA and the new Astro site.

## Test Matrix

### 11.1 Pages render
- [ ] Home (`/`)
- [ ] About (`/about`)
- [ ] Reference (`/reference`)
- [ ] URN patterns (`/reference/urn-patterns`)
- [ ] Quantities listing (`/quantities`)
- [ ] Math listing (`/math`)
- [ ] Units listing (`/units`)
- [ ] Dimensions listing (`/dimensions`)
- [ ] Documents listing (`/documents`)
- [ ] Ontology browser (`/ontology`)
- [ ] Part pages (sample: `/quantities/part-3`, `/quantities/part-6`, `/math/part-11-4`)
- [ ] Entry pages (sample from each part)
- [ ] Unit detail (`/units/{slug}`)
- [ ] Dimension detail (`/dimensions/{part}`)
- [ ] Document detail (`/documents/{id}`)
- [ ] Document sections (`/documents/{partKey}/sections`)
- [ ] Document section detail (`/documents/{partKey}/sections/{sectionId}`)
- [ ] Ontology detail (`/ontology/{slug}`)
- [ ] 404 page

### 11.2 Interactivity
- [ ] Global search opens and returns results
- [ ] Theme toggle (light/dark) persists
- [ ] Language toggle works
- [ ] Citation builder generates BibTeX/Chicago/RIS
- [ ] RDF export downloads JSON-LD/Turtle
- [ ] Ontology panels expand/collapse
- [ ] Class tree navigation works
- [ ] Back-to-top button appears on scroll
- [ ] Toast notifications appear
- [ ] Math notation renders (MathML)

### 11.3 Links
- [ ] All internal links resolve
- [ ] External links open in new tab
- [ ] Footer links correct
- [ ] Header navigation correct
- [ ] Breadcrumbs work

### 11.4 Performance
- [ ] Lighthouse score ≥ old SPA
- [ ] First Contentful Paint improved (SSR benefit)
- [ ] No hydration errors in console

### 11.5 Data correctness
- [ ] All 13 parts present
- [ ] Entry counts match
- [ ] Part 11 sub-parts handled correctly
- [ ] IEC parts (6, 13) show correct publisher
- [ ] Cross-references resolve
- [ ] Dimensions correct

### 11.6 Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

### 11.7 Browser compatibility
- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile Safari
- [ ] Mobile Chrome

## Regression Suite
The expanded vitest suite (`01-vitest-coverage.md`) must pass 100% before declaring migration complete.
