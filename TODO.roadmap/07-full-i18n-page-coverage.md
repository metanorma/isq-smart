# 07 — Full data-i18n coverage on all pages

## Problem
Only 5 of 33 pages use `data-i18n` attributes. The remaining 28 pages rely on the text-matching fallback, which:
- Misses strings not in `messages.yaml`
- Misses dynamic strings (counts, part titles)
- Misses attribute values (alt, title, placeholder)

## Pages needing i18n coverage
| Page | Priority | Strings |
|------|----------|---------|
| `index.astro` | P0 | DONE (partially) |
| `quantities/index.astro` | P1 | ~15 |
| `math/index.astro` | P1 | ~12 |
| `units/index.astro` | P1 | ~10 |
| `dimensions/index.astro` | P1 | ~10 |
| `kinds/index.astro` | P1 | ~10 |
| `quantities/part-[part].astro` | P1 | ~8 |
| `math/part-[part].astro` | P1 | ~8 |
| `quantities/.../[id].astro` | P1 | ~20 |
| `math/.../[id].astro` | P1 | ~20 |
| `units/[slug].astro` | P2 | ~15 |
| `dimensions/[part].astro` | P2 | ~12 |
| `kinds/[slug].astro` | P2 | ~15 |
| `ontology/*.astro` (7 pages) | P2 | ~50 total |
| `documents/*.astro` (3 pages) | P2 | ~20 total |
| `methodology/*.astro` (4 pages) | P2 | via MDX (see 06) |
| `about.astro` | P2 | via MDX (see 06) |
| `terminology.astro` | P2 | via MDX (see 06) |
| `reference.astro` | P2 | via MDX (see 06) |
| `404.astro` | P3 | ~5 |

## Approach
1. Add all missing translation keys to `messages.yaml`
2. Add `data-i18n` attributes to every hardcoded string
3. Use `data-i18n-html` for elements with inline formatting
4. Use template-based keys for dynamic strings: `data-i18n="label.entries_count"` with the count in a separate `<span>`

## Naming convention
```
page.{pageName}.{section}.{key}
e.g. page.quantities.hero.title
     page.units.list.symbol_header
```

## Test plan
- Audit script: grep all pages for strings without `data-i18n`
- Visual test: switch to FR, verify no English remains on each page
