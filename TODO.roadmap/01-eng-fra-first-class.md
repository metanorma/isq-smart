# 01 — eng/fra first-class language architecture

## Problem
The site uses `'en'`/`'fr'` as ad-hoc language codes stored in `localStorage`. There is no concept of language as a first-class domain concept. Language affects:
- Which translation map is used (`messages.yaml`)
- Which content variant is rendered
- The `lang` attribute on `<html>`
- The `hreflang` alternate links

These are scattered across `i18n/client.ts`, `BaseLayout.astro`, and page frontmatter.

## Solution
Introduce a `Language` value object (not just a string union) that encapsulates:
- ISO 639-3 codes: `'eng'` / `'fra'`
- ISO 639-1 codes: `'en'` / `'fr'` (for HTML lang attribute)
- Display names
- Directionality (both LTR, but model-driven)

### Files to create
- `src/i18n/Language.ts` — `Language` class with `ENG`, `FRA` constants, `fromCode()`, `toHtmlLang()`
- `src/i18n/LanguagePreference.ts` — manages stored/URL/cookie-derived preference

### Migration
1. Add `Language` type alongside existing `'en'|'fr'`
2. Map `'en'` ↔ `eng`, `'fr'` ↔ `fra` at boundaries
3. Use `'eng'`/`'fra'` in URLs and data; `'en'`/`'fr'` only for HTML output

## Test plan
- `Language.fromCode('eng')` returns the English Language
- `Language.fromCode('en')` also returns English (backward compat)
- `Language.ENG.toHtmlLang()` returns `'en'`
- `Language.ENG.displayName('fra')` returns `'English'`
