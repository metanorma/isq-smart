# 03: Property Hierarchy & Concept Hierarchy

## Status: SKIPPED

The source TTL data contains no `subPropertyOf` relationships (only one reference to `owl:topObjectProperty`) and no `skos:broader`/`skos:narrower` assertions. There is no hierarchy data to display for properties or concepts.

## If future data adds these relationships:
- Add `subPropertyOf` extraction to `vite.config.ts` ontology data plugin
- Add property parent/children display to property detail pages
- Add broader/narrower concept hierarchy to concept detail pages
