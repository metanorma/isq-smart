# 03: RDF Export Per Entity

## Goal
Each entity detail page should show its RDF representation in Turtle and JSON-LD, with download buttons.

## Tasks
- [ ] Create a `useRdfExport()` composable that generates Turtle and JSON-LD from entity data
- [ ] Add Turtle serialization using prefix declarations and triple patterns
- [ ] Add JSON-LD serialization using `@context` with prefix mappings
- [ ] Add toggle buttons on entity detail page to switch between views
- [ ] Add download buttons for each format
- [ ] Generate RDF for:
  - Classes: `rdf:type owl:Class`, `rdfs:subClassOf`, `rdfs:label`, `skos:definition`
  - Properties: `rdf:type owl:ObjectProperty/DatatypeProperty`, `rdfs:domain`, `rdfs:range`
  - Shapes: `rdf:type sh:NodeShape`, `sh:targetClass`, `sh:property` with blank nodes
  - Concepts: `rdf:type skos:Concept`, `skos:inScheme`, `skos:prefLabel`, `skos:definition`
  - Individuals: `rdf:type` (all instanceOf values)

## Turtle Template
```turtle
@prefix smart: <https://w3id.org/standards/smart/ontologies/core/> .
@prefix isoiec80000: <https://w3id.org/standards/isoiec80000/ontologies/core/> .

smart:Entity a owl:Class ;
  rdfs:label "Entity"@en ;
  skos:definition "Base class for all SMART ontology resources"@en .
```

## JSON-LD Template
```json
{
  "@context": { "smart": "https://w3id.org/standards/smart/ontologies/core/" },
  "@id": "smart:Entity",
  "@type": "owl:Class",
  "rdfs:label": { "@value": "Entity", "@language": "en" }
}
```
