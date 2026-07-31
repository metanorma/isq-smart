import { describe, it, expect } from 'vitest'
import { CitationGenerator } from '../CitationGenerator'
import type { Entry, PartMeta } from '../types'

const entry = {
  _tag: 'quantity',
  id: 't3-1.1',
  num: '3-1.1',
  partKey: '3',
  designations: [{ designation: { en: { text: 'length' } } }],
  def: { en: 'extent in space' },
} as unknown as Entry

const meta = {
  domain: 'quantities',
  partKey: '3',
  title: 'Space and Time',
  description: '',
  icon: '×',
  accent: 'sky',
} as PartMeta

const gen = new CitationGenerator()

describe('CitationGenerator', () => {
  it('generates BibTeX with standard structure', () => {
    const result = gen.generate(entry, meta, '2019', 'bibtex')
    expect(result).toContain('@standard{')
    expect(result).toContain('ISO 80000-3')
    expect(result).toContain('length')
    expect(result).toContain('International Organization for Standardization')
    expect(result).toContain('url = {')
  })

  it('generates Chicago citation', () => {
    const result = gen.generate(entry, meta, '2019', 'chicago')
    expect(result).toContain('ISO 80000-3')
    expect(result).toContain('3-1.1')
    expect(result).toContain('"length."')
  })

  it('generates RIS citation', () => {
    const result = gen.generate(entry, meta, '2019', 'ris')
    expect(result).toContain('TY  - STD')
    expect(result).toContain('TI  -')
    expect(result).toContain('ER  -')
  })

  it('uses IEC prefix for IEC parts', () => {
    const iecMeta = { ...meta, partKey: '6' } as PartMeta
    const result = gen.generate(entry, iecMeta, '2022', 'chicago')
    expect(result).toContain('IEC 80000-6')
    expect(result).toContain('International Electrotechnical Commission')
  })

  it('generateAll returns all formats', () => {
    const all = gen.generateAll(entry, meta, '2019')
    expect(all.bibtex).toContain('@standard')
    expect(all.chicago).toContain('ISO')
    expect(all.ris).toContain('TY  - STD')
  })

  it('lists available formats', () => {
    expect(CitationGenerator.formats()).toEqual(['bibtex', 'chicago', 'ris'])
  })
})
