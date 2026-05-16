# 02: Ontospy-Level Browser Features

## Goal
Make the ontology browser at `/ontology` as fully functional as Ontospy's HTML documentation output.

## Ontospy Features to Implement

### Class Hierarchy Tree (like `printClassTree()`)
- [x] Basic class tree in overview (3 levels hardcoded)
- [ ] **Recursive expandable tree** — click to expand/collapse children at any depth
- [ ] **Top-level classes** view — classes with no parent (like `toplayer_classes`)
- [ ] **Full class tree** — all classes in a single indented tree view

### Property Networks
- [x] Object/datatype/annotation property tables
- [ ] **Property hierarchy** — subproperty chains if any exist
- [ ] **Inverse properties** — show inverseOf relationships
- [ ] **Property usage matrix** — which classes use which properties (domain/range cross-reference)

### Per-Entity Detail Page Enhancements
- [x] Basic entity detail with type-specific sections
- [ ] **RDF Source view** — Turtle serialization per entity (like `c1.rdf_source()`)
- [ ] **JSON-LD export** — toggle between Turtle and JSON-LD
- [ ] **Download buttons** — download Turtle/JSON-LD for individual entities
- [ ] **All predicate values** — show all RDF triples for the entity, not just the ones we extracted

### Cross-Reference Navigation
- [x] Subclasses, ancestors for classes
- [x] Domain/range usage for classes
- [ ] **"Where used"** — for properties, show all entities that reference this property
- [ ] **Incoming/outgoing relationships** — for any entity, show all triples where it appears as subject or object
- [ ] **Inverse relationships** — clicking a class from a property's range links back

### Search
- [x] Basic text filter on listing page
- [ ] **Global search** — search across all entities from any page
- [ ] **Search by URI** — find entity by full URI
- [ ] **Search by prefix** — filter by namespace prefix

### SKOS Concept Browsing
- [x] Concept schemes with concept tables
- [ ] **Broader/narrower concept hierarchies** — if present in data
- [ ] **Concept alphabetical index** — all concepts sorted by label

### Graph Visualization
- [ ] **Class hierarchy D3.js tree** — interactive expandable tree
- [ ] **Property network D3.js graph** — domain/range connections between classes
- [ ] **Ontology dependency graph** — visualize import chain

### Ontology Metadata
- [x] Namespace declarations table
- [x] Import chain
- [ ] **Per-ontology statistics** — entity counts per ontology
- [ ] **Ontology comparison** — side-by-side class/property counts
