import { describe, it, expect } from 'vitest'
import { findByQname, linkTo, useClassHierarchy, relatedBadgeColor } from '../../composables/useOntology'
import { ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES } from '../../data/ontologyConfig'
import { ref, computed } from 'vue'

describe('findByQname', () => {
  it('finds known entities', () => {
    const entity = findByQname('isq:Quantity')
    expect(entity).toBeDefined()
    expect(entity!.qname).toBe('isq:Quantity')
    expect(entity!.type).toBe('class')
  })

  it('finds smart:TermEntry', () => {
    const entity = findByQname('smart:TermEntry')
    expect(entity).toBeDefined()
    expect(entity!.type).toBe('class')
  })

  it('finds properties', () => {
    const entity = findByQname('isq:hasUnit')
    expect(entity).toBeDefined()
    expect(entity!.type).toMatch(/property/i)
  })

  it('returns undefined for unknown qnames', () => {
    expect(findByQname('isq:NonExistent')).toBeUndefined()
    expect(findByQname('')).toBeUndefined()
  })

  it('finds part individuals', () => {
    const entity = findByQname('isq:part-4')
    expect(entity).toBeDefined()
  })
})

describe('linkTo', () => {
  it('generates ontology detail URLs', () => {
    const link = linkTo('isq:Quantity')
    expect(link).toBe('/ontology/isq-Quantity')
  })

  it('returns empty string for unknown entities', () => {
    expect(linkTo('isq:NonExistent')).toBe('')
  })
})

describe('useClassHierarchy', () => {
  it('walks hierarchy for isq:Quantity', () => {
    const { classEntity, fullHierarchy, shapes } = useClassHierarchy(ref('isq:Quantity'))
    expect(classEntity.value).toBeDefined()
    expect(classEntity.value!.qname).toBe('isq:Quantity')

    // Hierarchy should include parent chain
    expect(fullHierarchy.value.length).toBeGreaterThanOrEqual(1)
    expect(fullHierarchy.value[fullHierarchy.value.length - 1]!.qname).toBe('isq:Quantity')

    // Should find shapes targeting Quantity
    expect(shapes.value.length).toBeGreaterThan(0)
  })

  it('walks hierarchy for isq:Unit', () => {
    const { fullHierarchy } = useClassHierarchy(ref('isq:Unit'))
    expect(fullHierarchy.value.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty hierarchy for unknown class', () => {
    const { classEntity, fullHierarchy } = useClassHierarchy(ref('isq:NonExistent'))
    expect(classEntity.value).toBeUndefined()
    expect(fullHierarchy.value).toEqual([])
  })
})

describe('relatedBadgeColor', () => {
  it('returns teal for Unit class', () => {
    const color = relatedBadgeColor(ONTOLOGY_CLASSES.Unit)
    expect(color.bg).toContain('teal')
    expect(color.dot).toContain('teal')
  })

  it('returns emerald for TermEntry class', () => {
    const color = relatedBadgeColor(ONTOLOGY_CLASSES.TermEntry)
    expect(color.bg).toContain('emerald')
  })

  it('returns sky for Dimension class', () => {
    const color = relatedBadgeColor(ONTOLOGY_CLASSES.Dimension)
    expect(color.bg).toContain('sky')
  })
})
