import { describe, it, expect } from 'vitest'
import { generateBibTeX, generateChicago, generateRis } from '../citation'
import type { Entry, PartMeta } from '../types'

function mkEntry(opts: { id: string; num: string; text?: string }): Entry {
  const text = opts.text ?? `Entry ${opts.num}`
  return {
    _tag: 'quantity' as const,
    partKey: '3',
    edition: '2019',
    id: opts.id,
    num: opts.num,
    designations: [{ designation: { en: { text } } }],
    def: { en: 'Definition body' },
  }
}

const isoMeta: PartMeta = {
  domain: 'quantities',
  partKey: '3',
  title: 'Space and time',
  description: '',
  icon: '🌌',
  accent: 'brand',
}

const iecMeta: PartMeta = {
  domain: 'quantities',
  partKey: '6',
  title: 'Electromagnetism',
  description: '',
  icon: '⚡',
  accent: 'iec',
}

describe('generateBibTeX', () => {
  it('emits a BibTeX @standard entry for ISO parts', () => {
    const e = mkEntry({ id: '4-1', num: '4-1', text: 'length' })
    const out = generateBibTeX(e, isoMeta, '2019')
    expect(out).toContain('@standard{iso80000-3-2019-4-1')
    expect(out).toContain('title = {ISO 80000-3:2019 -- Space and time}')
    expect(out).toContain('entry = {4-1 length}')
    expect(out).toContain('organization = {International Organization for Standardization}')
    expect(out).toContain('year = {2019}')
    expect(out).toContain('url = {https://iso80000.org/quantities/part-3/4-1}')
  })

  it('uses IEC publisher name and prefix for IEC parts', () => {
    const e = mkEntry({ id: '6-1', num: '6-1', text: 'electric current' })
    const out = generateBibTeX(e, iecMeta, '2022')
    expect(out).toContain('title = {IEC 80000-6:2022 -- Electromagnetism}')
    expect(out).toContain('organization = {International Electrotechnical Commission}')
  })

  it('escapes non-alphanumeric chars in citation key', () => {
    const e = mkEntry({ id: '11-4.1', num: '11-4.1' })
    const out = generateBibTeX(e, { ...isoMeta, partKey: '11-4' }, '2019')
    expect(out).toMatch(/@standard\{iso80000-11-4-2019-11-4-1,/)
  })

  it('falls back to entry num when designation is missing', () => {
    const e = mkEntry({ id: '4-1', num: '4-1' })
    e.designations = []
    const out = generateBibTeX(e, isoMeta, '2019')
    expect(out).toContain('entry = {4-1 4-1}')
  })
})

describe('generateChicago', () => {
  it('formats Chicago-style citation for ISO parts', () => {
    const e = mkEntry({ id: '4-1', num: '4-1', text: 'length' })
    const out = generateChicago(e, isoMeta, '2019')
    expect(out).toBe('ISO 80000-3:2019, entry 4-1, "length." International Organization for Standardization.')
  })

  it('formats Chicago-style citation for IEC parts', () => {
    const e = mkEntry({ id: '6-1', num: '6-1', text: 'electric current' })
    const out = generateChicago(e, iecMeta, '2022')
    expect(out).toBe('IEC 80000-6:2022, entry 6-1, "electric current." International Electrotechnical Commission.')
  })
})

describe('generateRis', () => {
  it('emits RIS record with TY/ER bookends', () => {
    const e = mkEntry({ id: '4-1', num: '4-1', text: 'length' })
    const out = generateRis(e, isoMeta, '2019')
    expect(out.startsWith('TY  - STD\n')).toBe(true)
    expect(out.endsWith('\nER  - ')).toBe(true)
  })

  it('includes title with part, edition, entry, and designation', () => {
    const e = mkEntry({ id: '4-1', num: '4-1', text: 'length' })
    const out = generateRis(e, isoMeta, '2019')
    expect(out).toContain('TI  - ISO 80000-3:2019 -- Space and time, entry 4-1: length')
  })

  it('includes publisher, year, and url fields', () => {
    const e = mkEntry({ id: '4-1', num: '4-1' })
    const out = generateRis(e, isoMeta, '2019')
    expect(out).toContain('PB  - International Organization for Standardization')
    expect(out).toContain('PY  - 2019')
    expect(out).toContain('UR  - https://iso80000.org/quantities/part-3/4-1')
  })
})
