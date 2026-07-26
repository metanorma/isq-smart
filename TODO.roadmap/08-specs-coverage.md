# 08 — Specs coverage

## Problem
New code added in recent PRs lacks focused unit tests:
- `i18n/client.ts` — no tests for `applyDataI18n`, `applyTextMatching`
- `data/asciidoc.ts` — no tests for inline math displaystyle fix
- `data/entryViewModel.ts` — French fields tested but not accent resolution
- `scripts/render-math.mjs` — no tests for expression collection

## Solution
Add test files alongside each module:

### `src/i18n/__tests__/MessageLookup.test.ts`
- Key resolution returns correct string
- Missing key returns the key itself
- Nested key resolution works

### `src/i18n/__tests__/TextMatcher.test.ts`
- Exact match replacement
- Preserves leading/trailing whitespace
- Returns null for no match

### `src/i18n/__tests__/DomTranslator.test.ts`
- `data-i18n` attribute replacement
- `data-i18n-html` uses innerHTML
- Elements without attributes are untouched

### `src/data/__tests__/asciidoc.test.ts`
- Inline stem → MathML with displaystyle="false"
- Block stem → div with display="block"
- Cross-reference → hyperlink when xref exists
- Paragraph splitting on double newline

### `src/data/__tests__/PartRouter.test.ts`
- URL generation for quantities, math
- Sub-part URLs (part-11-4)
- Parent part URLs (part-11)

### `src/data/__tests__/PartSummaryProvider.test.ts`
- Parent part bilingual checks sub-parts
- Entry count sums sub-parts

## Coverage target
- All new modules: 100% line coverage
- All edge cases documented in test names
- Integration tests for the composition root

## Test principles
- Use **real model instances**, not mocks (per CLAUDE.md)
- Test **behavior**, not implementation
- One assertion per test where possible
