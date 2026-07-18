import { describe, it, expect } from 'vitest'
import {
  isKindOfQuantity,
  isQuantityConcept,
  isEntityKind,
  isEntityConcept,
  conceptPrefLabel,
} from '../concepts'
import type { KindOfQuantity, QuantityConcept, EntityKind, EntityConcept } from '../concepts'

describe('ontology concepts', () => {
  const kind: KindOfQuantity = {
    id: 'kind-l',
    iri: 'isq:kind-l',
    level: 0,
    axis: 'quantity',
    prefLabel: { en: 'length-type', fr: 'type longueur' },
    dimensionVector: 'L',
    dimensionSymbol: 'L',
    quantityIds: ['t3-1.1', 't3-1.2'],
  }

  const quantity: QuantityConcept = {
    id: 't3-1.1',
    iri: 'isq:t3-1.1',
    level: 1,
    axis: 'quantity',
    prefLabel: { en: 'length' },
    kindId: 'kind-l',
    symbols: ['l', 'L'],
    partKey: '3',
    entryId: 't3-1.1',
  }

  const entityKind: EntityKind = {
    id: 'entity-kind-particle',
    iri: 'isq:entity-kind-particle',
    level: 1,
    axis: 'entity',
    prefLabel: { en: 'particle' },
  }

  const entity: EntityConcept = {
    id: 'entity-electron',
    iri: 'isq:entity-electron',
    level: 2,
    axis: 'entity',
    kindId: 'entity-kind-particle',
    prefLabel: { en: 'electron', fr: 'électron' },
  }

  describe('type guards', () => {
    it('identifies KindOfQuantity by level 0 and quantity axis', () => {
      expect(isKindOfQuantity(kind)).toBe(true)
      expect(isKindOfQuantity(quantity)).toBe(false)
    })

    it('identifies QuantityConcept by level 1 and quantity axis', () => {
      expect(isQuantityConcept(quantity)).toBe(true)
      expect(isQuantityConcept(kind)).toBe(false)
    })

    it('identifies EntityKind by level 1 and entity axis', () => {
      expect(isEntityKind(entityKind)).toBe(true)
      expect(isEntityKind(quantity)).toBe(false)
    })

    it('identifies EntityConcept by level 2 and entity axis', () => {
      expect(isEntityConcept(entity)).toBe(true)
      expect(isEntityConcept(entityKind)).toBe(false)
    })
  })

  describe('conceptPrefLabel', () => {
    it('returns English label by default', () => {
      expect(conceptPrefLabel(kind)).toBe('length-type')
    })

    it('returns French label when requested and available', () => {
      expect(conceptPrefLabel(kind, 'fr')).toBe('type longueur')
    })

    it('falls back to English when French is missing', () => {
      expect(conceptPrefLabel(quantity, 'fr')).toBe('length')
    })
  })
})
