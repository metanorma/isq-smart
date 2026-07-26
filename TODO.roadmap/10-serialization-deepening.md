# 10 — Deepen serialization: split JSON-LD from Turtle

## Problem
`src/data/serialization.ts` (233 lines) has two concerns:
1. **JSON-LD generation** — `generateEntryJsonLd()`, `generateIndexJsonLd()`
2. **Turtle serialization** — `jsonLdToTurtle()`, `ttlValue()`, `isKnownTtlPrefix()`

These share the `jsonLdContext` constant but are otherwise independent.

## Solution
Split into:
- `src/data/JsonLdSerializer.ts` — entry/index JSON-LD object generation
- `src/data/TurtleSerializer.ts` — JSON-LD → Turtle conversion
- `src/data/RdfContext.ts` — shared namespace/context constants

## Test plan
- JsonLdSerializer produces valid JSON-LD with @context, @id, @type
- TurtleSerializer produces valid Turtle with @prefix declarations
- Context URIs are consistent between formats
