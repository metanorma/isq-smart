import { describe, it, expect } from 'vitest'
import {
  NS, ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES,
  tagToClass, partQname, entryQname, unitQname,
} from '../../data/ontologyConfig'

describe('NS (namespace definitions)', () => {
  it('core prefix is isq', () => {
    expect(NS.core.prefix).toBe('isq')
  })

  it('core URI points to w3id.org', () => {
    expect(NS.core.uri).toBe('https://w3id.org/standards/isq/ontologies/core/')
  })

  it('smart prefix is smart', () => {
    expect(NS.smart.prefix).toBe('smart')
  })
})

describe('ONTOLOGY_CLASSES', () => {
  it('all class qnames use the isq prefix', () => {
    expect(ONTOLOGY_CLASSES.Quantity).toBe('isq:Quantity')
    expect(ONTOLOGY_CLASSES.MathConcept).toBe('isq:MathConcept')
    expect(ONTOLOGY_CLASSES.Unit).toBe('isq:Unit')
    expect(ONTOLOGY_CLASSES.Dimension).toBe('isq:Dimension')
  })

  it('TermEntry uses smart prefix', () => {
    expect(ONTOLOGY_CLASSES.TermEntry).toBe('smart:TermEntry')
    expect(ONTOLOGY_CLASSES.Entity).toBe('smart:Entity')
  })
})

describe('ONTOLOGY_PROPERTIES', () => {
  it('domain properties use isq prefix', () => {
    expect(ONTOLOGY_PROPERTIES.hasUnit).toBe('isq:hasUnit')
    expect(ONTOLOGY_PROPERTIES.hasDimension).toBe('isq:hasDimension')
  })

  it('standard vocabulary properties use correct prefixes', () => {
    expect(ONTOLOGY_PROPERTIES.identifier).toBe('dcterms:identifier')
    expect(ONTOLOGY_PROPERTIES.isPartOf).toBe('dcterms:isPartOf')
    expect(ONTOLOGY_PROPERTIES.prefLabel).toBe('skosxl:prefLabel')
    expect(ONTOLOGY_PROPERTIES.rdfType).toBe('rdf:type')
  })
})

describe('tagToClass', () => {
  it('maps quantity tag to Quantity class', () => {
    expect(tagToClass('quantity')).toBe('isq:Quantity')
  })

  it('maps math tag to MathConcept class', () => {
    expect(tagToClass('math')).toBe('isq:MathConcept')
  })
})

describe('qname constructors', () => {
  it('partQname constructs correct qnames', () => {
    expect(partQname('3')).toBe('isq:part-3')
    expect(partQname('2-5')).toBe('isq:part-2-5')
    expect(partQname('11')).toBe('isq:part-11')
  })

  it('entryQname constructs correct qnames', () => {
    expect(entryQname('t3-1')).toBe('isq:t3-1')
    expect(entryQname('t2-5.1')).toBe('isq:t2-5.1')
  })

  it('unitQname constructs correct qnames', () => {
    expect(unitQname('metre')).toBe('isq:unit-metre')
  })
})
