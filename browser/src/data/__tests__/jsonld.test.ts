import { describe, it, expect } from 'vitest'
import {
  generateEntryJsonLd,
  generateIndexJsonLd,
  jsonLdToTurtle,
} from '../../data/serialization'
import {
  generateBibTeX,
  generateChicago,
  generateRis,
} from '../../data/citation'
import {
  partUrn,
  entryUrn,
} from '../../data/urn'
import { NS, ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES } from '../../data/ontologyConfig'
import type { Entry, QuantityEntry, PartMeta } from '../../data/types'

// ── Test fixtures ──

function makeQuantityEntry(overrides: Partial<QuantityEntry> = {}): QuantityEntry {
  return {
    _tag: 'quantity',
    partKey: '4',
    edition: '2019',
    id: 't4-1',
    num: '4-1',
    designations: [
      { designation: { en: { text: 'length' } } },
      { designation: { en: { text: 'L' } } },
    ],
    symbols: ['l'],
    def: { en: 'linear extent' },
    units: [{ en: 'metre', symbol: ['m'] }],
    remarks: { en: 'Length does not include width.' },
    ...overrides,
  }
}

function makeMathEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    _tag: 'math',
    partKey: '2',
    edition: '2019',
    id: 't2-5.1',
    num: '2-5.1',
    designations: [
      { designation: { en: { text: 'variable' } } },
    ],
    symbols: ['x'],
    def: { en: 'A symbol representing an unknown.' },
    ...overrides,
  }
}

const isoPartMeta: PartMeta = {
  domain: 'quantities',
  partKey: '4',
  title: 'Mechanics',
  description: 'Mass, force, pressure, energy, power',
  icon: '⚙',
  accent: 'slate',
}

const iecPartMeta: PartMeta = {
  domain: 'quantities',
  partKey: '6',
  title: 'Electromagnetism',
  description: 'Electric and magnetic quantities',
  icon: '⚡',
  accent: 'amber',
}

const mathPartMeta: PartMeta = {
  domain: 'math',
  partKey: '2-5',
  title: 'Variables & Functions',
  description: 'Variables, functions, and operators',
  icon: '𝝨',
  accent: 'violet',
  parentPart: '2',
}

// ── URN generation ──

describe('partUrn', () => {
  it('generates ISO URN for ISO parts', () => {
    const urn = partUrn('4', '2019')
    expect(urn).toBe('urn:iso:std:iso:80000:-4:ed-2:en')
  })

  it('generates IEC URN for IEC parts', () => {
    const urn = partUrn('6', '2022')
    expect(urn).toBe('urn:iec:std:iec:80000-6:2022-11:::')
  })

  it('handles sub-sections by extracting base part', () => {
    const urn = partUrn('2-5', '2019')
    expect(urn).toBe('urn:iso:std:iso:80000:-2:ed-2:en')
  })

  it('generates IEC URN for Part 13', () => {
    const urn = partUrn('13', '2025')
    expect(urn).toBe('urn:iec:std:iec:80000-13:2025-02:::')
  })
})

describe('entryUrn', () => {
  it('generates ISO entry URN with :item:', () => {
    const entry = makeQuantityEntry()
    const urn = entryUrn(entry, '4', '2019')
    expect(urn).toContain(':item:4-1')
  })

  it('generates IEC entry URN without :item:', () => {
    const entry = makeQuantityEntry({ partKey: '6' })
    const urn = entryUrn(entry, '6', '2022')
    expect(urn).toContain('4-1')
    expect(urn).not.toContain(':item:')
  })
})

// ── JSON-LD generation ──

describe('generateEntryJsonLd', () => {
  it('produces valid JSON-LD for quantity entry', () => {
    const entry = makeQuantityEntry()
    const result = generateEntryJsonLd(entry, isoPartMeta, '2019') as Record<string, unknown>

    expect(result['@context']).toBeDefined()
    expect((result['@context'] as Record<string, string>)[NS.core.prefix]).toBe(NS.core.uri)
    expect(result['@id']).toBe('isq:t4-1')
    expect(result[ONTOLOGY_PROPERTIES.rdfType]).toEqual([ONTOLOGY_CLASSES.Quantity, ONTOLOGY_CLASSES.TermEntry])
    expect(result[ONTOLOGY_PROPERTIES.identifier]).toBe('4-1')
    expect(result[ONTOLOGY_PROPERTIES.prefLabel]).toEqual({ '@value': 'length', '@language': 'en' })
    expect(result[ONTOLOGY_PROPERTIES.hasUnit]).toBeDefined()
    expect(result[ONTOLOGY_PROPERTIES.note]).toEqual({ '@value': 'Length does not include width.', '@language': 'en' })
    expect(result[ONTOLOGY_PROPERTIES.hasBindingnessType]).toBe('bindingness-type:normative')
    expect(result[ONTOLOGY_PROPERTIES.isPartOf]).toEqual({ '@id': 'isq:part-4' })
  })

  it('produces valid JSON-LD for math entry', () => {
    const entry = makeMathEntry()
    const result = generateEntryJsonLd(entry, mathPartMeta, '2019') as Record<string, unknown>

    expect(result['@id']).toBe('isq:t2-5.1')
    expect(result[ONTOLOGY_PROPERTIES.rdfType]).toEqual([ONTOLOGY_CLASSES.MathConcept, ONTOLOGY_CLASSES.TermEntry])
    expect(result[ONTOLOGY_PROPERTIES.hasUnit]).toBeUndefined()
  })

  it('includes altLabels from additional designations and symbols', () => {
    const entry = makeQuantityEntry()
    const result = generateEntryJsonLd(entry, isoPartMeta, '2019') as Record<string, unknown>
    const altLabels = result[ONTOLOGY_PROPERTIES.altLabel] as { '@value': string; '@language': string }[]

    expect(altLabels).toBeDefined()
    const values = altLabels.map(a => a['@value'])
    expect(values).toContain('L')
    expect(values).toContain('l')
  })

  it('includes units with symbol and name', () => {
    const entry = makeQuantityEntry()
    const result = generateEntryJsonLd(entry, isoPartMeta, '2019') as Record<string, unknown>
    const units = result[ONTOLOGY_PROPERTIES.hasUnit] as Record<string, unknown>[]

    expect(units).toHaveLength(1)
    expect(units[0]['skos:notation']).toEqual(['m'])
  })

  it('omits units when entry has no units', () => {
    const entry = makeQuantityEntry({ units: undefined })
    const result = generateEntryJsonLd(entry, isoPartMeta, '2019') as Record<string, unknown>
    expect(result[ONTOLOGY_PROPERTIES.hasUnit]).toBeUndefined()
  })

  it('omits notes when entry has no remarks', () => {
    const entry = makeQuantityEntry({ remarks: undefined })
    const result = generateEntryJsonLd(entry, isoPartMeta, '2019') as Record<string, unknown>
    expect(result[ONTOLOGY_PROPERTIES.note]).toBeUndefined()
  })

  it('includes URN', () => {
    const entry = makeQuantityEntry()
    const result = generateEntryJsonLd(entry, isoPartMeta, '2019') as Record<string, unknown>
    expect(result['iso:urn']).toContain('urn:')
  })
})

describe('generateIndexJsonLd', () => {
  it('produces valid collection JSON-LD', () => {
    const result = generateIndexJsonLd([isoPartMeta, mathPartMeta])

    expect(result['@type']).toBe('skos:Collection')
    expect(result['@id']).toBe('https://w3id.org/standards/isq/parts')
    const members = result['skos:member'] as Record<string, unknown>[]
    expect(members).toHaveLength(2)
    expect(members[0]['@id']).toBe('isq:part-4')
    expect(members[1]['@id']).toBe('isq:part-2-5')
  })
})

// ── Turtle serialization ──

describe('jsonLdToTurtle', () => {
  it('produces valid Turtle with prefixes', () => {
    const data = generateEntryJsonLd(makeQuantityEntry(), isoPartMeta, '2019')
    const ttl = jsonLdToTurtle(data)

    expect(ttl).toContain('@prefix isq:')
    expect(ttl).toContain('@prefix smart:')
    expect(ttl).toContain('@prefix dcterms:')
    expect(ttl).toContain('@prefix skos:')
    expect(ttl).toContain('<isq:t4-1>')
  })

  it('ends with a period', () => {
    const data = generateEntryJsonLd(makeQuantityEntry(), isoPartMeta, '2019')
    const ttl = jsonLdToTurtle(data)
    const lastNonEmpty = ttl.split('\n').filter(l => l.trim()).at(-1)!
    expect(lastNonEmpty.trim()).toMatch(/\.$/)
  })

  it('escapes special characters in literal values', () => {
    const entry = makeQuantityEntry({ def: { en: 'a "quoted" value\nwith newline' } })
    const data = generateEntryJsonLd(entry, isoPartMeta, '2019')
    const ttl = jsonLdToTurtle(data)
    expect(ttl).toContain('\\"quoted\\"')
    expect(ttl).toContain('\\n')
  })
})

// ── Citation generators ──

describe('generateBibTeX', () => {
  it('produces BibTeX for ISO entry', () => {
    const entry = makeQuantityEntry()
    const bibtex = generateBibTeX(entry, isoPartMeta, '2019')

    expect(bibtex).toContain('@standard{')
    expect(bibtex).toContain('ISO 80000-4:2')
    expect(bibtex).toContain('International Organization for Standardization')
    expect(bibtex).toContain('length')
    expect(bibtex).toContain('year = {2019}')
  })

  it('uses IEC publisher for IEC parts', () => {
    const entry = makeQuantityEntry({ partKey: '6' })
    const bibtex = generateBibTeX(entry, iecPartMeta, '2022')

    expect(bibtex).toContain('International Electrotechnical Commission')
    expect(bibtex).not.toContain('International Organization for Standardization')
  })
})

describe('generateChicago', () => {
  it('produces Chicago citation for ISO entry', () => {
    const entry = makeQuantityEntry()
    const chicago = generateChicago(entry, isoPartMeta, '2019')

    expect(chicago).toContain('ISO 80000-4:2')
    expect(chicago).toContain('entry 4-1')
    expect(chicago).toContain('length')
    expect(chicago).toContain('International Organization for Standardization')
  })

  it('uses IEC publisher for IEC parts', () => {
    const entry = makeQuantityEntry({ partKey: '6' })
    const chicago = generateChicago(entry, iecPartMeta, '2022')

    expect(chicago).toContain('International Electrotechnical Commission')
  })
})

describe('generateRis', () => {
  it('produces RIS citation for ISO entry', () => {
    const entry = makeQuantityEntry()
    const ris = generateRis(entry, isoPartMeta, '2019')

    expect(ris).toContain('TY  - STD')
    expect(ris).toContain('PB  - International Organization for Standardization')
    expect(ris).toContain('ER  - ')
  })

  it('uses IEC publisher for IEC parts', () => {
    const entry = makeQuantityEntry({ partKey: '6' })
    const ris = generateRis(entry, iecPartMeta, '2022')

    expect(ris).toContain('PB  - International Electrotechnical Commission')
  })
})
