# 01: Complete External Vocabulary Entities

## Problem
The Vite ontology plugin only generates entities for subjects defined in TTL files. Externally-referenced URIs (e.g., `rdfs:Class`, `owl:Thing`, `xsd:string`) appear as qnames in domain/range/constraints but have no entity detail pages.

## Tasks
- [x] Audit current entity generation for coverage gaps
- [ ] Add stub entity generation in `vite.config.ts` for known external vocabularies
- [ ] Ensure all qnames referenced in domain/range/parent/constraints resolve to clickable links

## Key Namespaces Needing Stubs
- `owl:` — Class, Thing, ObjectProperty, DatatypeProperty, AnnotationProperty, FunctionalProperty, Ontology
- `rdfs:` — label, comment, subClassOf, domain, range, seeAlso, Class, Resource, Literal
- `rdf:` — type, Property, List, nil, Statement, Subject, Predicate, Object
- `xsd:` — string, integer, boolean, decimal, float, double, anyURI, dateTime, langString
- `sh:` — NodeShape, PropertyShape, targetClass, property, path, minCount, maxCount, datatype, class, nodeKind, hasValue
- `skosxl:` — Label, prefLabel, altLabel, hiddenLabel, literalForm
- `prov:` — wasGeneratedBy, wasAttributedTo, Activity, Entity, Agent
- `tbx:` — Term, TermEntry, language, termNote

## Approach
After generating entities from TTL parsing, scan all generated entities for qname references in `parent`, `domain`, `range`, `constraints[].path`, `constraints[].datatype`, `constraints[].classValue`, `constraints[].nodeKind`, `targetClass`, `instanceOf`, `scheme`. For each referenced qname that doesn't have an entity, create a stub with `type: 'external'` and label derived from the local name.
