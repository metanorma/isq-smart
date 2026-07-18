# 06 — Serialization: New Relationships in JSON-LD/Turtle

## Goal

Update `serialization.ts` to emit the new concept hierarchy relationships in JSON-LD and Turtle output.

## Changes

### JSON-LD context additions
- `skos:broader` and `skos:narrower` (already in SKOS namespace)
- `isq:hasKind`, `isq:characterizes`, `isq:definedByEquation`

### Entry serializer updates
Each quantity entry's JSON-LD now includes:
```json
{
  "@id": "isq:t3-1.1",
  "@type": ["isq:Quantity", "smart:TermEntry"],
  "skos:prefLabel": ...,
  "skos:definition": ...,
  "isq:hasKind": { "@id": "isq:kind-L" },
  "skos:broader": [{ "@id": "isq:kind-L" }],
  "skos:narrower": [{ "@id": "isq:t3-1.2" }, ...],
  "isq:hasUnit": [...]
}
```

### New serializers
- `kindSerializer(kind: KindOfQuantity)` — emits KindOfQuantity with member links
- `entitySerializer(entity: EntityConcept)` — emits entity with kind link

### Turtle output
Same triples, Turtle format. `jsonLdToTurtle` already handles arbitrary keys — just ensure new properties pass through.

## OCP compliance

The serializer uses a strategy pattern: `entrySerializer`, `kindSerializer`, `entitySerializer`. Adding a new concept type = adding a new serializer function, not modifying existing ones.

## Status: DONE
