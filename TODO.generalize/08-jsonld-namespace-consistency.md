# JSON-LD / Export Namespace Consistency

## Problem

The app uses **two completely different RDF namespaces** for the same data:

1. **Ontology namespace** (from TTL): `isoiec80000:` → `https://w3id.org/standards/isoiec80000/ontologies/core/`
   - Used in ontology browser, SHACL shapes, class hierarchy
   - Defines: `isoiec80000:Quantity`, `isoiec80000:Unit`, `isoiec80000:hasUnit`, etc.

2. **JSON-LD export namespace** (in `jsonld.ts`): `iso:` → `https://iso80000.org/ns/`
   - Used in entry JSON-LD, TTL downloads, citation generation
   - Defines: `iso:QuantityEntry`, `iso:MathEntry`, `iso:num`, `iso:def`, etc.

These are not just different prefixes — they describe **different ontological models**:
- The ontology says entries are instances of `isoiec80000:Quantity` (a class)
- The JSON-LD export says entries are instances of `iso:QuantityEntry` (a different class)
- Property names differ: `skosxl:prefLabel` in ontology vs `iso:text_en` in JSON-LD export

## Current State

### `jsonld.ts` serialization

```ts
const quantitySerializer = (entry, partKey, edition) => ({
  '@type': 'iso:QuantityEntry',        // NOT isoiec80000:Quantity
  '@id': `https://iso80000.org/entry/${entry.id}`,  // NOT isoiec80000:{id}
  'iso:num': entry.num,                // NOT dcterms:identifier
  'iso:designations': [...],            // NOT skosxl:prefLabel
  'iso:def': {...},                     // NOT skos:definition
})

// TTL output:
@prefix iso: <https://iso80000.org/ns/> .
```

### `reference.vue` (RDF reference page)

Uses yet a third namespace: `isoiec80000:` with URI `https://w3id.org/standards/isoiec80000/` (note: missing `/ontologies/core/`):

```ts
const prefixes = {
  isoiec80000: 'https://w3id.org/standards/isoiec80000/',  // WRONG URI
}
```

### `SiteFooter.vue`

Uses `isoiec80000:` namespace in microdata but with the JSON-LD style model:

```html
@type: isoiec80000:Quantity
@id: isoiec80000:{id}
```

## Solution Options

### Option A: Unify on ontology namespace (recommended)

Align all exports with the ontology model. The JSON-LD/TTL downloads should use the same vocabulary as the ontology.

This means the JSON-LD context in downloads should reference:
- `isoiec80000:` → `https://w3id.org/standards/isoiec80000/ontologies/core/`
- `smart:` → SmartSDU namespace
- Standard vocabularies: `dcterms:`, `skosxl:`, `skos:`, `rdf:`, `rdfs:`

And entry serialization should use:
- `@type: isoiec80000:Quantity` (not `iso:QuantityEntry`)
- `dcterms:identifier` (not `iso:num`)
- `skosxl:prefLabel` (not `iso:text_en`)

**Pro:** Single consistent model across ontology browser and data exports
**Con:** Breaking change for anyone consuming the current JSON-LD format

### Option B: Keep dual namespaces, document clearly

If the JSON-LD export format serves a different audience (data exchange) than the ontology browser (knowledge exploration), keep both but:

1. Add clear documentation that the two vocabularies serve different purposes
2. Fix `reference.vue` to use the correct URI
3. Ensure `SiteFooter.vue` is consistent with whichever model it references
4. Consider providing a mapping between the two

### Option C: Align reference.vue and SiteFooter with jsonld.ts

Make the RDF reference page use the same `iso:` namespace as the JSON-LD exports. Less work but doesn't fix the fundamental inconsistency.

## Immediate Fixes (regardless of option)

| File | Issue | Fix |
|---|---|---|
| `reference.vue:34` | `isoiec80000: 'https://w3id.org/standards/isoiec80000/'` — wrong URI | Use correct URI: `https://w3id.org/standards/isoiec80000/ontologies/core/` or align with jsonld.ts namespace |
| `reference.vue:249` | Shows `@prefix isoiec80000:` but refers to ontology model | Align prefix and model |
| `SiteFooter.vue:48-49` | Shows `@type: isoiec80000:Quantity` in microdata | Decide if this should be ontology model or JSON-LD export model |

## Files Changed (Option A — full unification)

| File | Action |
|---|---|
| `src/data/jsonld.ts` | Rewrite serialization to use ontology vocabulary (isoiec80000:, skosxl:, dcterms:, etc.) |
| `src/pages/reference.vue` | Update prefixes and example to match ontology namespace |
| `src/components/SiteFooter.vue` | Align microdata with chosen namespace |
| `src/data/ontologyConfig.ts` | Export JSON-LD context template using ontology namespace |

## Depends On

- TODO 01 (namespace rename) — if done first, the prefix changes from `isoiec80000:` to `isq:`
- TODO 02 (data-display separation) — the config map should define both the ontology and export namespaces
