# 05 — Entity Taxonomy Model

## Goal

Create the entity hierarchy model (kind of entity → entity) and derive entities from quantity designations and definitions.

## Background

Pendrill's key insight: quantities characterize entities. "Length of a rod" binds the quantity "length" to the entity "rod." The current model has no entity concept.

ISO 80000 entries implicitly reference entities:
- "sound particle displacement" → entity: particle
- "mass density of substance B" → entity: substance B
- "electric current density" → entity: cross-sectional area (implicit)
- "electron energy" → entity: electron

## Model

```typescript
interface EntityKind extends ConceptNode {
  _level: 1
  _axis: 'entity'
  // e.g., "physical body", "substance", "field", "particle"
}

interface EntityConcept extends ConceptNode {
  _level: 2
  _axis: 'entity'
  kindId: string
  // e.g., "rod", "electron", "photon"
}
```

## Derivation

### Strategy 1: Particle/quantum detection (semi-automatic)
Scan designations for known entity terms:
- "particle" / "sound particle" → EntityConcept: "particle"
- "electron" → EntityConcept: "electron" (kind: "particle")
- "photon" → EntityConcept: "photon"
- "molecule" / "atom" / "nucleus" → corresponding entities

### Strategy 2: "of X" pattern (semi-automatic)
Designations matching "quantity of {entity}" extract the entity:
- "wavelength" → no entity (generic)
- "mass of substance B" → entity: "substance"
- "activity of radionuclide" → entity: "radionuclide"

### Strategy 3: Domain-specific entity catalogs
Curated entity lists per domain:
- Acoustics: particle, medium, wave
- Electromagnetism: conductor, charge, field, circuit
- Chemistry: substance, molecule, ion, solution

## Output

Writes `generated/entities.ts`:
```typescript
export const entityKinds: EntityKind[] = [...]
export const entities: EntityConcept[] = [...]
export const quantityEntities: Record<string, string[]> = { "t8-3": ["particle"], ... }
```

## Scope for this implementation

- Model definition: fully implemented ✅
- EntityKind catalog (curated): physical body, substance, field, particle, wave, body ✅
- EntityConcept derivation: Strategy 1 (particle/quantum terms) implemented ✅
- Strategy 2 (of-X pattern): infrastructure built, pattern matching implemented ✅
- Strategy 3 (domain catalogs): deferred — requires domain expertise for curation

## Status: DONE (model + basic derivation)
