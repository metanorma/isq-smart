# 07 — Wire terminology and reference pages to content collections

## Problem
`terminology.astro` and `reference.astro` have English-only content
hardcoded in template arrays. MDX content files exist at
`src/content/terminology/index.{en,fr}.mdx` and
`src/content/reference/index.{en,fr}.mdx` but are not wired up.

## Solution
For pages where the content is structured (terminology has a terms table,
reference has code examples), the MDX approach works but may lose the
structured rendering. Two options:

1. **Full MDX migration**: Replace the hardcoded arrays with MDX content
   rendered via `getLocalizedDoc()`. Simpler but loses structured layout.

2. **Data-driven with i18n**: Keep the structured layout but move the
   English strings to messages.yaml and add data-i18n attributes. More
   work but preserves the rich layout.

Option 2 is more practical for terminology (which has a custom table
layout) and reference (which has code blocks).

## Status
Lower priority — these pages are covered by the text-matching fallback
for now.
