# 02: Class Detail Enhancements

## Gap
Ontospy shows for each class: tree diagram (parent→self→children), inferred properties from ancestors, usage table grouped by source class, instances, and SHACL constraint details.

## Current State
Detail page shows: superclasses, direct subclasses, all descendants, targeting shapes, domain/range properties, where-used. Missing: tree diagram, inferred properties, grouped usage, instances.

## Implementation
- **Tree diagram**: Render a visual parent→self→children tree (like Ontospy's `tree-container` div) on the class detail page
- **Inferred properties**: Traverse ancestor chain, collect all properties whose domain includes any ancestor
- **Grouped usage table**: Properties grouped by source class ("From smart:Entity: [properties]", etc.)
- **Instances**: Show all individuals whose `instanceOf` includes this class
