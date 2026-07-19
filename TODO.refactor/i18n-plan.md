# i18n Implementation Plan

## Architecture

### Phase 1: Client-side i18n (CURRENT — infrastructure done)
- Translation YAML file (`src/i18n/messages.yaml`) as single source of truth
- `t(key, lang)` helper for build-time rendering
- `data-i18n="key"` attributes on all translatable elements
- Client-side `LanguageSwitcher.vue` with localStorage persistence
- `initLanguage()` script applies saved language on page load
- No page reload needed — instant text swap via `applyLanguage(lang)`

### Phase 2: Full UI label coverage (TODO)
- Add `data-i18n` attributes to ALL labels across all pages
- Translate: heroes, section headers, metadata labels, buttons, breadcrumbs
- Translate: footer, 404 page, search results, filter labels

### Phase 3: Narrative content localization (TODO)
- Create French versions of About, Methodology, Terminology
- Strategy: per-language MDX files loaded via content collections
- Or: inline `data-i18n-en` / `data-i18n-fr` for shorter content

### Phase 4: URL-based routing (FUTURE)
- Move from client-side switching to `/en/` and `/fr/` URL prefixes
- Each page generated in both languages (~3360 pages)
- Proper SEO with hreflang tags
- Per-language sitemaps
- Server-side rendering of correct language (no JS dependency)

## Design Principles
- **Single source of truth**: every translatable string lives in messages.yaml
- **OCP**: adding a new language = adding a YAML section, no code changes
- **DRY**: no hardcoded strings in components — all via t() or data-i18n
- **Progressive enhancement**: English is default; French is enhancement
- **Performance**: translations embedded at build time; switching is instant

## Status: Phase 1 infrastructure COMPLETE
