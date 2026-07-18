# ADR 001: Pendrill Concept Hierarchy

## Context

The ISQ Browser modeled all ISO 80000 entries as flat `isq:Quantity` concepts. Leslie Pendrill (2024) proposed a richer concept system distinguishing four levels (0–3) across three parallel axes (quantity, entity, measurement):

- **L0**: Kind of quantity (e.g., "length-type" — all quantities of dimension L)
- **L1**: Quantity (e.g., "length") — the level ISO 80000 defines
- **L2**: Dedicated/Entity quantity (e.g., "length of rod") — quantity bound to entity
- **L3**: Measured quantity (e.g., "1.234 m") — individual measurement

Source: Pendrill, L. R. (2024). "Quantities and units: order amongst complexity." Chapter 2 in *Models, Measurement, and Metrology extending the SI*. De Gruyter. doi:10.1515/9783111036496-002

## Decision

Implement **Levels 0 and 1** of the quantity axis, plus a basic **entity hierarchy** (Level 1–2). Defer Level 3 (measured quantity) as out of scope for a standards browser.

### What was implemented

1. **Kind of Quantity (L0)**: Derived automatically from dimension analysis. Each quantity's primary unit symbol is parsed into a dimension vector, and quantities sharing the same vector are grouped. Browsable at `/kinds`.

2. **Broader/narrower relationships**: SKOS `skos:broader` / `skos:narrower`. Derived from:
   - Kind hierarchy (every quantity → its kind)
   - Naming patterns ("specific X" → broader "X", "massic/volumic/lineic X" → broader "X")

3. **Entity taxonomy (L1–L2)**: Curated entity kinds (particle, substance, body, field, medium, molecule, source, system) and named entities (electron, photon, molecule, etc.). Quantities are linked to entities via pattern matching on designations and definitions.

4. **Serialization**: JSON-LD and Turtle output includes `isq:hasKind`, `skos:broader`, `skos:narrower`, `isq:characterizes`.

### What was deferred

- **L3 (Measured Quantity)**: Individual measurement instances are not modeled — this is a standards browser, not a measurement database.
- **Full entity annotation**: Pattern matching catches ~30% of entity references; the rest requires manual curation.
- **Defining equations**: Quantity definitions contain equations in prose/AsciiDoc; structured extraction is deferred.

## Consequences

- The ontology is richer but still machine-readable via SKOS + custom properties.
- Kind-of-quantity grouping is fully automatic — new entries are classified at build time.
- Entity and hierarchy relationships are partially derived; manual curation improves coverage over time.
- The IA gains a new top-level entry point (`/kinds`) for dimension-based browsing.
