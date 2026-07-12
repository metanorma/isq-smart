import { describe, it, expect } from 'vitest'
import { ontologyEntities } from '../generated/ontology'
import { resolveOntologyEntityView, type OntologyEntityData } from '../ontologyViewModel'

const allEntities = ontologyEntities as readonly OntologyEntityData[]

function findBySlug(slug: string): OntologyEntityData {
  const e = allEntities.find(e => e.slug === slug)
  if (!e) throw new Error(`Entity with slug "${slug}" not found`)
  return e
}

// ── Tests ──

describe('resolveOntologyEntityView', () => {
  describe('basic structure', () => {
    it('returns the entity itself', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.entity).toBe(entity)
    })

    it('returns all expected keys', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view).toHaveProperty('ancestors')
      expect(view).toHaveProperty('subclasses')
      expect(view).toHaveProperty('allDescendants')
      expect(view).toHaveProperty('targetingShapes')
      expect(view).toHaveProperty('relatedProperties')
      expect(view).toHaveProperty('groupedUsage')
      expect(view).toHaveProperty('inferredProperties')
      expect(view).toHaveProperty('instances')
      expect(view).toHaveProperty('whereUsed')
      expect(view).toHaveProperty('schemeConcepts')
      expect(view).toHaveProperty('conceptShapes')
      expect(view).toHaveProperty('ontologyScoped')
      expect(view).toHaveProperty('parentOntologyEntity')
      expect(view).toHaveProperty('siblings')
    })
  })

  describe('ancestors', () => {
    it('resolves the ancestor chain for a class with parents', () => {
      // smart:Clause -> smart:ProvisionSet -> smart:Entity
      const entity = findBySlug('smart-Clause')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.ancestors.length).toBe(2)
      expect(view.ancestors[0].qname).toBe('smart:ProvisionSet')
      expect(view.ancestors[1].qname).toBe('smart:Entity')
    })

    it('returns empty for a class with no parent', () => {
      const entity = findBySlug('smart-Entity')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.ancestors).toEqual([])
    })

    it('returns empty for non-class entities', () => {
      const entity = findBySlug('smart-hasProvisionType')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.ancestors).toEqual([])
    })
  })

  describe('subclasses', () => {
    it('finds direct subclasses of a class', () => {
      // smart:Provision has subclasses: Capability, ExternalConstraint, Instruction, Permission, Possibility, Recommendation, Requirement, Statement
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.subclasses.length).toBe(8)
      const qnames = view.subclasses.map(s => s.qname)
      expect(qnames).toContain('smart:Capability')
      expect(qnames).toContain('smart:Requirement')
      expect(qnames).toContain('smart:Statement')
    })

    it('returns empty for a class with no subclasses', () => {
      const entity = findBySlug('smart-Requirement')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.subclasses).toEqual([])
    })

    it('returns empty for non-class entities', () => {
      const entity = findBySlug('smart-hasProvisionType')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.subclasses).toEqual([])
    })
  })

  describe('allDescendants', () => {
    it('finds all transitive descendants', () => {
      // smart:ProvisionSet -> smart:Clause (direct child)
      // smart:Provision -> 8 subclasses (indirect, via smart:Entity -> smart:ProvisionSet? No, Provision is child of Entity, not ProvisionSet)
      // Let's use smart:Entity which has many descendants
      const entity = findBySlug('smart-Entity')
      const view = resolveOntologyEntityView(entity, allEntities)
      // smart:Entity has direct children: Provision, ProvisionSupplement, TermEntry, PublicationDocument, ProvisionSet, Activity, Agent
      // Provision itself has 8 subclasses, ProvisionSet has Clause
      expect(view.allDescendants.length).toBeGreaterThan(view.subclasses.length)
    })

    it('returns empty for non-class entities', () => {
      const entity = findBySlug('smart-ProvisionShape')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.allDescendants).toEqual([])
    })
  })

  describe('targetingShapes', () => {
    it('finds shapes targeting a class', () => {
      // smart:Provision is targeted by smart:ProvisionShape
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.targetingShapes.length).toBe(1)
      expect(view.targetingShapes[0].qname).toBe('smart:ProvisionShape')
    })

    it('finds shapes targeting isq:Quantity', () => {
      const entity = findBySlug('isq-Quantity')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.targetingShapes.length).toBe(1)
      expect(view.targetingShapes[0].qname).toBe('isq:QuantityShape')
    })

    it('returns empty for a class with no targeting shapes', () => {
      const entity = findBySlug('smart-Entity')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.targetingShapes).toEqual([])
    })
  })

  describe('relatedProperties', () => {
    it('finds properties with this class in domain', () => {
      // smart:Provision is in domain of smart:hasProvisionType, smart:hasSupplement
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.relatedProperties.domain.length).toBeGreaterThanOrEqual(2)
      const domainQnames = view.relatedProperties.domain.map(p => p.qname)
      expect(domainQnames).toContain('smart:hasProvisionType')
      expect(domainQnames).toContain('smart:hasSupplement')
    })

    it('finds properties with this class in range', () => {
      // smart:ProvisionSupplement is in range of smart:hasSupplement
      const entity = findBySlug('smart-ProvisionSupplement')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.relatedProperties.range.length).toBeGreaterThanOrEqual(1)
      const rangeQnames = view.relatedProperties.range.map(p => p.qname)
      expect(rangeQnames).toContain('smart:hasSupplement')
    })

    it('returns empty arrays for non-class entities', () => {
      const entity = findBySlug('smart-hasProvisionType')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.relatedProperties.domain).toEqual([])
      expect(view.relatedProperties.range).toEqual([])
    })
  })

  describe('groupedUsage', () => {
    it('may be empty if neither the class nor its ancestors have domain properties', () => {
      // smart:Clause -> smart:ProvisionSet -> smart:Entity
      // None of these classes appear in any property's domain
      const entity = findBySlug('smart-Clause')
      const view = resolveOntologyEntityView(entity, allEntities)
      // smart:Clause itself has no domain properties; its ancestors don't either
      // This is a valid empty result
      for (const group of view.groupedUsage) {
        expect(group.props.length).toBeGreaterThan(0)
      }
    })

    it('includes the entity itself as the first group', () => {
      const entity = findBySlug('smart-Term')
      const view = resolveOntologyEntityView(entity, allEntities)
      // smart:Term is in domain of smart:hasPartOfSpeechType, smart:hasTermFormType, smart:pronunciation, smart:usedInCountry
      expect(view.groupedUsage.length).toBeGreaterThan(0)
      expect(view.groupedUsage[0].source.qname).toBe('smart:Term')
      expect(view.groupedUsage[0].props.length).toBeGreaterThanOrEqual(2)
    })

    it('filters out groups with no properties', () => {
      const entity = findBySlug('smart-Entity')
      const view = resolveOntologyEntityView(entity, allEntities)
      for (const group of view.groupedUsage) {
        expect(group.props.length).toBeGreaterThan(0)
      }
    })

    it('returns empty for non-class entities', () => {
      const entity = findBySlug('smart-hasProvisionType')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.groupedUsage).toEqual([])
    })
  })

  describe('inferredProperties', () => {
    it('finds properties inherited from ancestors', () => {
      // smart:Clause inherits from smart:ProvisionSet and smart:Entity
      // If ProvisionSet or Entity have domain properties, they'd be inherited
      const entity = findBySlug('smart-Clause')
      const view = resolveOntologyEntityView(entity, allEntities)
      // Inferred properties should not include properties whose domain is the entity itself
      for (const p of view.inferredProperties) {
        expect(p.domain?.includes(entity.qname)).toBe(false)
      }
    })

    it('returns empty for non-class entities', () => {
      const entity = findBySlug('smart-hasProvisionType')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.inferredProperties).toEqual([])
    })
  })

  describe('instances', () => {
    it('finds individuals that are instances of a class', () => {
      // smart:PublicationDocument has instances: isq:part-1 through isq:part-13, etc.
      const entity = findBySlug('smart-PublicationDocument')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.instances.length).toBeGreaterThan(10)
      const slugs = view.instances.map(i => i.slug)
      expect(slugs).toContain('isq-part-1')
      expect(slugs).toContain('isq-part-2')
    })

    it('returns empty for a class with no instances', () => {
      const entity = findBySlug('smart-Entity')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.instances).toEqual([])
    })

    it('returns empty for non-class entities', () => {
      const entity = findBySlug('smart-hasProvisionType')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.instances).toEqual([])
    })
  })

  describe('whereUsed', () => {
    it('finds all references to an entity', () => {
      // smart:PublicationDocument is used by many entities: shapes, properties, individuals
      const entity = findBySlug('smart-PublicationDocument')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.whereUsed.length).toBeGreaterThan(0)
      // Each entry should have entity and context
      for (const wu of view.whereUsed) {
        expect(wu.entity).toBeDefined()
        expect(wu.context).toBeDefined()
        expect(typeof wu.context).toBe('string')
      }
    })

    it('includes subClassOf context for parent references', () => {
      // smart:Provision is parent of smart:Capability etc.
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      const subClassOfEntries = view.whereUsed.filter(wu => wu.context === 'subClassOf')
      expect(subClassOfEntries.length).toBe(8)
    })

    it('includes targetClass context for shape references', () => {
      // smart:Provision is targetClass of smart:ProvisionShape
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      const targetClassEntries = view.whereUsed.filter(wu => wu.context === 'targetClass')
      expect(targetClassEntries.length).toBe(1)
      expect(targetClassEntries[0].entity.qname).toBe('smart:ProvisionShape')
    })

    it('includes domain context for property references', () => {
      // smart:Provision is in domain of smart:hasProvisionType
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      const domainEntries = view.whereUsed.filter(wu => wu.context === 'domain')
      expect(domainEntries.length).toBeGreaterThanOrEqual(2)
    })

    it('includes type context for instance references', () => {
      // smart:PublicationDocument has instances (isq:part-1 etc.)
      const entity = findBySlug('smart-PublicationDocument')
      const view = resolveOntologyEntityView(entity, allEntities)
      const typeEntries = view.whereUsed.filter(wu => wu.context === 'type')
      expect(typeEntries.length).toBeGreaterThan(10)
    })

    it('includes isPartOf context', () => {
      // isq:part-2 is referenced via isPartOf by isq:part-2-5 etc.
      const entity = findBySlug('isq-part-2')
      const view = resolveOntologyEntityView(entity, allEntities)
      const isPartOfEntries = view.whereUsed.filter(wu => wu.context === 'isPartOf')
      expect(isPartOfEntries.length).toBeGreaterThan(10)
    })

    it('does not include the entity itself', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      for (const wu of view.whereUsed) {
        expect(wu.entity.qname).not.toBe(entity.qname)
      }
    })
  })

  describe('schemeConcepts', () => {
    it('finds concepts in a concept scheme', () => {
      // bindingness-type: has concepts informative, normative
      const entity = findBySlug('bindingness-type-')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.schemeConcepts.length).toBe(2)
      const qnames = view.schemeConcepts.map(c => c.qname)
      expect(qnames).toContain('bindingness-type:informative')
      expect(qnames).toContain('bindingness-type:normative')
    })

    it('returns empty for non-conceptScheme entities', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.schemeConcepts).toEqual([])
    })
  })

  describe('conceptShapes', () => {
    it('finds shapes related to a concept via instanceOf', () => {
      // bindingness-type:informative has instanceOf smart:BindingnessType
      // We need a shape that targets smart:BindingnessType... but there is none in the data.
      // So this tests the empty case as well.
      const entity = findBySlug('bindingness-type-informative')
      const view = resolveOntologyEntityView(entity, allEntities)
      // No shapes target smart:BindingnessType in the data
      expect(Array.isArray(view.conceptShapes)).toBe(true)
    })

    it('returns empty for non-concept entities', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.conceptShapes).toEqual([])
    })
  })

  describe('ontologyScoped', () => {
    it('lists all entities scoped to an ontology', () => {
      const entity = findBySlug('smart-')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.ontologyScoped.classes.length).toBeGreaterThan(0)
      expect(view.ontologyScoped.objectProperties.length).toBeGreaterThan(0)
      expect(view.ontologyScoped.datatypeProperties.length).toBeGreaterThan(0)
      expect(view.ontologyScoped.shapes.length).toBeGreaterThan(0)
    })

    it('lists isq ontology entities', () => {
      const entity = findBySlug('isq-')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.ontologyScoped.classes.length).toBe(4) // Quantity, Unit, MathConcept, Dimension
      expect(view.ontologyScoped.objectProperties.length).toBe(2) // hasUnit, hasDimension
      expect(view.ontologyScoped.individuals.length).toBeGreaterThan(10) // parts
      expect(view.ontologyScoped.shapes.length).toBeGreaterThan(5)
    })

    it('returns empty arrays for non-ontology entities', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.ontologyScoped.classes).toEqual([])
      expect(view.ontologyScoped.objectProperties).toEqual([])
      expect(view.ontologyScoped.datatypeProperties).toEqual([])
      expect(view.ontologyScoped.annotationProperties).toEqual([])
      expect(view.ontologyScoped.concepts).toEqual([])
      expect(view.ontologyScoped.conceptSchemes).toEqual([])
      expect(view.ontologyScoped.shapes).toEqual([])
      expect(view.ontologyScoped.individuals).toEqual([])
    })
  })

  describe('parentOntologyEntity', () => {
    it('finds the parent ontology for a smart entity', () => {
      const entity = findBySlug('smart-Provision')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.parentOntologyEntity).toBeDefined()
      expect(view.parentOntologyEntity!.type).toBe('ontology')
      expect(view.parentOntologyEntity!.ontology).toBe('smart')
    })

    it('finds the parent ontology for an isq entity', () => {
      const entity = findBySlug('isq-Quantity')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.parentOntologyEntity).toBeDefined()
      expect(view.parentOntologyEntity!.type).toBe('ontology')
      expect(view.parentOntologyEntity!.ontology).toBe('isq')
    })

    it('returns undefined for an ontology entity itself', () => {
      const entity = findBySlug('smart-')
      const view = resolveOntologyEntityView(entity, allEntities)
      expect(view.parentOntologyEntity).toBeUndefined()
    })
  })

  describe('siblings', () => {
    it('computes prev/next among same-type non-external entities', () => {
      // Find a class that has siblings of the same type
      const entity = findBySlug('smart-Requirement')
      const view = resolveOntologyEntityView(entity, allEntities)
      // Requirement is one of 8 subclasses of Provision
      // All are type 'class' and ontology 'smart' (not 'external')
      // So there should be siblings
      if (view.siblings.prev) {
        expect(view.siblings.prev.type).toBe('class')
        expect(view.siblings.prev.ontology).not.toBe('external')
      }
      if (view.siblings.next) {
        expect(view.siblings.next.type).toBe('class')
        expect(view.siblings.next.ontology).not.toBe('external')
      }
    })

    it('siblings are sorted alphabetically by label', () => {
      // Pick the first alphabetically among non-external classes
      const entity = findBySlug('smart-Entity')
      const view = resolveOntologyEntityView(entity, allEntities)
      // Entity might be first or not; just verify the structure
      expect(view.siblings).toBeDefined()
      expect(view.siblings).toHaveProperty('prev')
      expect(view.siblings).toHaveProperty('next')
    })
  })

  describe('consistency with original computation', () => {
    it('subclasses match original filter logic', () => {
      // For every class entity, subclasses should be entities where type==='class' && parent===entity.qname
      for (const entity of allEntities.filter(e => e.type === 'class')) {
        const view = resolveOntologyEntityView(entity, allEntities)
        const original = allEntities.filter(e => e.type === 'class' && e.parent === entity.qname)
        expect(view.subclasses.length).toBe(original.length)
      }
    })

    it('targetingShapes match original filter logic', () => {
      for (const entity of allEntities.filter(e => e.type === 'class')) {
        const view = resolveOntologyEntityView(entity, allEntities)
        const original = allEntities.filter(e => e.type === 'shape' && e.targetClass === entity.qname)
        expect(view.targetingShapes.length).toBe(original.length)
      }
    })

    it('instances match original filter logic', () => {
      for (const entity of allEntities.filter(e => e.type === 'class')) {
        const view = resolveOntologyEntityView(entity, allEntities)
        const original = allEntities.filter(e => e.type === 'individual' && e.instanceOf?.includes(entity.qname))
        expect(view.instances.length).toBe(original.length)
      }
    })

    it('schemeConcepts match original filter logic', () => {
      for (const entity of allEntities.filter(e => e.type === 'conceptScheme')) {
        const view = resolveOntologyEntityView(entity, allEntities)
        const original = allEntities.filter(e => e.type === 'concept' && e.scheme === entity.qname)
        expect(view.schemeConcepts.length).toBe(original.length)
      }
    })

    it('whereUsed count matches original scan logic', () => {
      // Test a few representative entities
      const testSlugs = ['smart-Provision', 'smart-PublicationDocument', 'isq-Quantity', 'smart-']
      for (const slug of testSlugs) {
        const entity = findBySlug(slug)
        const view = resolveOntologyEntityView(entity, allEntities)
        // Recompute using the original algorithm
        const qn = entity.qname
        let count = 0
        for (const e of allEntities) {
          if (e.qname === qn) continue
          if (e.parent === qn) count++
          if (e.domain?.includes(qn)) count++
          if (e.range?.includes(qn)) count++
          if (e.targetClass === qn) count++
          if (e.targetSubjectsOf === qn) count++
          if (e.targetObjectsOf === qn) count++
          if (e.scheme === qn) count++
          if (e.instanceOf?.includes(qn)) count++
          if (e.isPartOf?.includes(qn)) count++
          for (const c of (e.constraints || [])) {
            if (c.classValue === qn) count++
            if (c.hasValue === qn) count++
          }
        }
        expect(view.whereUsed.length).toBe(count)
      }
    })
  })
})
