# 03 — Split `jsonld.ts` into URN, serialization, and citation modules

## Problem

`jsonld.ts` (303 lines) contains three unrelated responsibilities:
- URN generation (RFC 5141 ISO/IEC identifiers)
- JSON-LD / Turtle serialization (ontology-aware)
- Citation generators (BibTeX, Chicago, RIS)

Callers that only need URN generation pull in serialization code. URN logic is entangled with `PartRegistry.publisherOf()`.

## Solution

1. `urn.ts` — URN generation (partUrn, entryUrn, unitUrns, dimensionUrns, entryDualUrn)
2. `serialization.ts` — JSON-LD + Turtle output (generateEntryJsonLd, generateIndexJsonLd, jsonLdToTurtle)
3. `citation.ts` — BibTeX, Chicago, RIS generators

Update `index.ts` barrel to re-export from new locations.

## Files affected

- `browser/src/data/jsonld.ts` → split into 3 files
- `browser/src/data/index.ts` → update re-exports
- Callers that import from `data/jsonld` or `data/index`
