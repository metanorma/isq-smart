# 21 — Remaining page data-i18n coverage

## Status: Mechanical work — incremental

## Pages with data-i18n applied
- index.astro (hero, body, domain cards, sections) ✅
- quantities/index.astro (listing) ✅
- math/index.astro (listing) ✅
- units/index.astro (stat labels) ✅
- dimensions/index.astro (stat labels) ✅
- kinds/index.astro (stat labels) ✅
- DefaultLayout.astro (header title) ✅
- SiteFooter.vue (all sections) ✅
- Entry detail pages (definition, notes, referenced-by headings) ✅

## Pages still needing data-i18n
These pages have hardcoded English strings. The text-matching fallback
handles most of them (since the strings exist in messages.yaml), but
explicit data-i18n attributes would be more reliable:

- 404.astro
- terminology.astro (will use MDX content)
- reference.astro (will use MDX content)
- methodology/*.astro (will use MDX content)
- ontology/*.astro (7 pages)
- documents/*.astro (3 pages)
- quantities/part-[part].astro (part listing)
- math/part-[part].astro (part listing)
- units/[slug].astro (unit detail)
- dimensions/[part].astro (dimension detail)
- kinds/[slug].astro (kind detail)
- reference/urn-patterns.astro

## Approach
For each page:
1. Identify hardcoded strings
2. Add corresponding keys to messages.yaml (if missing)
3. Add data-i18n attributes
4. Verify with `node scripts/generate-messages.mjs`

This is incremental data work, not architecture.
