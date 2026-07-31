# 01 — CitationGenerator strategy pattern

## Problem
`citation.ts` has three format generators (BibTeX, Chicago, RIS) as free
functions. Adding a new format requires modifying the file — violating OCP.

## Solution
Extract a `CitationGenerator` class with a strategy interface:
```ts
export class CitationGenerator {
  constructor(private formatters: Record<CitationFormat, CitationFormatter>) {}
  generate(entry, meta, edition, format): string
}
```

Adding a new format = adding a new CitationFormatter, not editing existing code.
