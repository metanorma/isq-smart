import { describe, it, expect } from 'vitest'
import { buildOntologyTree } from '../OntologyTree'
import type { OntologyEntity } from '../OntologyTree'

function makeEntity(
  qname: string,
  label: string,
  ontology: string,
  type: string,
  slug?: string
): OntologyEntity {
  return {
    uri: `https://example.org/${qname}`,
    qname,
    slug: slug ?? qname.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
    label,
    description: '',
    ontology,
    type,
  }
}

describe('buildOntologyTree', () => {
  it('groups entities by ontology namespace', () => {
    const entities = [
      makeEntity('isq:Quantity', 'Quantity', 'isq', 'class'),
      makeEntity('smart:TermEntry', 'Term Entry', 'smart', 'class'),
    ]
    const tree = buildOntologyTree(entities)
    expect(tree).toHaveLength(2)
    expect(tree[0].prefix).toBe('isq')
    expect(tree[1].prefix).toBe('smart')
  })

  it('orders ontologies: isq first, then smart, then external', () => {
    const entities = [
      makeEntity('ext:foo', 'Foo', 'external', 'class'),
      makeEntity('isq:bar', 'Bar', 'isq', 'class'),
      makeEntity('smart:baz', 'Baz', 'smart', 'class'),
    ]
    const tree = buildOntologyTree(entities)
    expect(tree.map(g => g.prefix)).toEqual(['isq', 'smart', 'external'])
  })

  it('groups by entity type within each ontology', () => {
    const entities = [
      makeEntity('isq:Quantity', 'Quantity', 'isq', 'class'),
      makeEntity('isq:hasUnit', 'has unit', 'isq', 'objectProperty'),
      makeEntity('isq:myShape', 'My Shape', 'isq', 'shape'),
    ]
    const tree = buildOntologyTree(entities)
    expect(tree[0].groups).toHaveLength(3)
    expect(tree[0].groups.map(g => g.type)).toEqual(['class', 'objectProperty', 'shape'])
  })

  it('sorts entities alphabetically by label', () => {
    const entities = [
      makeEntity('isq:Zebra', 'Zebra', 'isq', 'class'),
      makeEntity('isq:Alpha', 'Alpha', 'isq', 'class'),
      makeEntity('isq:Mango', 'Mango', 'isq', 'class'),
    ]
    const tree = buildOntologyTree(entities)
    const labels = tree[0].groups[0].entities.map(e => e.label)
    expect(labels).toEqual(['Alpha', 'Mango', 'Zebra'])
  })

  it('counts total entities per ontology', () => {
    const entities = [
      makeEntity('isq:A', 'A', 'isq', 'class'),
      makeEntity('isq:B', 'B', 'isq', 'objectProperty'),
      makeEntity('smart:C', 'C', 'smart', 'class'),
    ]
    const tree = buildOntologyTree(entities)
    expect(tree[0].totalCount).toBe(2)
    expect(tree[1].totalCount).toBe(1)
  })

  it('handles empty input', () => {
    const tree = buildOntologyTree([])
    expect(tree).toHaveLength(0)
  })

  it('assigns human-readable labels to entity types', () => {
    const entities = [
      makeEntity('isq:A', 'A', 'isq', 'class'),
      makeEntity('isq:B', 'B', 'isq', 'objectProperty'),
      makeEntity('isq:C', 'C', 'isq', 'shape'),
      makeEntity('isq:D', 'D', 'isq', 'individual'),
    ]
    const tree = buildOntologyTree(entities)
    expect(tree[0].groups.map(g => g.label)).toEqual([
      'Classes',
      'Object Properties',
      'SHACL Shapes',
      'Individuals',
    ])
  })
})
