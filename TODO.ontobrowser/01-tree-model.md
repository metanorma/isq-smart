# 01 — Ontology Tree Model

## Goal
Create a model layer that transforms the flat `ontologyEntities` array into a hierarchical tree grouped by ontology namespace and entity type.

## Structure
```
OntologyNamespace
├── Classes (sorted, with subclass hierarchy if derivable)
├── Object Properties
├── Datatype Properties
├── Annotation Properties
├── SHACL Shapes
├── SKOS Concepts
├── Concept Schemes
└── Individuals
```

## File: `src/data/ontology/OntologyTree.ts`
- `buildOntologyTree(entities)` → grouped tree
- Pure function, no side effects
- Groups by ontology prefix (isq, smart, external)
- Within each group, sub-groups by entity type
- Sorts alphabetically by label

## Status: DONE
