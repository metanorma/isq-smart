# 13 — CI/CD & Verification

## Goal
Update CI for Astro build, verify end-to-end.

## CI Updates
- [ ] `.github/workflows/*.yml` — build command is `astro build` (already updated in package.json)
- [ ] Verify external data repos still checked out in CI
- [ ] Verify base path `/isq-smart/` applied in production build

## Verification Checklist

### Pages render (all return 200)
- [ ] `/` (home)
- [ ] `/about`
- [ ] `/reference`
- [ ] `/reference/urn-patterns`
- [ ] `/quantities`
- [ ] `/math`
- [ ] `/units`
- [ ] `/dimensions`
- [ ] `/documents`
- [ ] `/ontology`
- [ ] `/quantities/part-3` (sample part)
- [ ] `/quantities/part-3/t3-1.1` (sample entry)
- [ ] `/units/metre` (sample unit)
- [ ] `/dimensions/length` (sample dimension)
- [ ] `/ontology/isq-Quantity` (sample ontology entity)
- [ ] `/404` (not found)

### Interactivity (browser test)
- [ ] Search opens with `/` key or button click
- [ ] Search returns results for "length", "ampere", "force"
- [ ] Theme toggle switches light/dark and persists
- [ ] Mobile nav opens and closes
- [ ] Back-to-top appears on scroll
- [ ] Citation builder generates BibTeX/RIS/Chicago
- [ ] Ontology panels expand/collapse
- [ ] Math notation renders correctly

### Performance
- [ ] Lighthouse score ≥ 90
- [ ] No hydration errors in console
- [ ] No `[Vue warn]` messages
- [ ] No `router-link` resolution errors

### Data correctness
- [ ] Home page shows correct counts (not 0)
- [ ] Quantities listing shows all 16 parts
- [ ] Entry counts match between listing and detail pages
- [ ] IEC parts (6, 13) show correct publisher badge
