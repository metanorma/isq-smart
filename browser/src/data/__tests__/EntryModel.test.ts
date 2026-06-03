import { describe, it, expect } from 'vitest'
import { EntryModel } from '../index'
import type { Entry, QuantityEntry, MathEntry } from '../types'

// ── Test fixtures ──

function makeQuantity(overrides: Partial<QuantityEntry> = {}): QuantityEntry {
  return {
    _tag: 'quantity',
    partKey: '4',
    edition: '2019',
    id: 't4-1',
    num: '4-1',
    designations: [
      { designation: { en: { text: 'length' }, fr: { text: 'longueur' } } },
      { designation: { en: { text: 'height' } } },
    ],
    symbols: ['l', 'h'],
    def: { en: 'linear extent of a path', fr: 'étendue linéaire' },
    units: [{ en: 'metre', fr: 'mètre', symbol: ['m'] }],
    remarks: { en: 'See also height.' },
    ...overrides,
  }
}

function makeMath(overrides: Partial<MathEntry> = {}): MathEntry {
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

const emptyCache: Record<string, string> = {}

// ── name ──

describe('EntryModel.name', () => {
  it('returns English name for en lang', () => {
    expect(EntryModel.name(makeQuantity(), 'en')).toBe('length, height')
  })

  it('returns French name for fr lang', () => {
    expect(EntryModel.name(makeQuantity(), 'fr')).toBe('longueur')
  })

  it('returns both languages for "both"', () => {
    expect(EntryModel.name(makeQuantity(), 'both')).toBe('length, height / longueur')
  })

  it('returns just English when French matches', () => {
    const entry = makeQuantity({
      designations: [
        { designation: { en: { text: 'mass' }, fr: { text: 'mass' } } },
      ],
    })
    expect(EntryModel.name(entry, 'both')).toBe('mass')
  })

  it('returns just English when no French', () => {
    expect(EntryModel.name(makeMath(), 'both')).toBe('variable')
  })
})

// ── definition ──

describe('EntryModel.definition', () => {
  it('returns English definition', () => {
    const def = EntryModel.definition(makeQuantity(), 'en', emptyCache)
    expect(def).toContain('linear extent')
  })

  it('returns French definition', () => {
    const def = EntryModel.definition(makeQuantity(), 'fr', emptyCache)
    expect(def).toContain('étendue linéaire')
  })

  it('uses "both" as English', () => {
    const def = EntryModel.definition(makeQuantity(), 'both', emptyCache)
    expect(def).toContain('linear extent')
  })

  it('falls back to English when lang missing', () => {
    const def = EntryModel.definition(makeMath(), 'fr', emptyCache)
    expect(def).toContain('unknown')
  })
})

// ── remarks ──

describe('EntryModel.remarks', () => {
  it('returns remarks text', () => {
    const r = EntryModel.remarks(makeQuantity(), 'en', emptyCache)
    expect(r).toContain('See also height')
  })

  it('returns empty string when no remarks', () => {
    expect(EntryModel.remarks(makeMath(), 'en', emptyCache)).toBe('')
  })

  it('falls back to English when lang missing', () => {
    expect(EntryModel.remarks(makeQuantity(), 'fr', emptyCache)).toContain('See also')
  })
})

// ── unitName ──

describe('EntryModel.unitName', () => {
  it('returns unit name for quantity', () => {
    expect(EntryModel.unitName(makeQuantity(), 'en')).toBe('metre')
  })

  it('returns French unit name', () => {
    expect(EntryModel.unitName(makeQuantity(), 'fr')).toBe('mètre')
  })

  it('returns empty string for math entry', () => {
    expect(EntryModel.unitName(makeMath(), 'en')).toBe('')
  })

  it('returns empty string for quantity with no units', () => {
    expect(EntryModel.unitName(makeQuantity({ units: undefined }), 'en')).toBe('')
  })

  it('joins multiple units', () => {
    const entry = makeQuantity({
      units: [
        { en: 'metre per second', symbol: ['m/s'] },
        { en: 'kilometre per hour', symbol: ['km/h'] },
      ],
    })
    expect(EntryModel.unitName(entry, 'en')).toBe('metre per second, kilometre per hour')
  })
})

// ── unitSymbols ──

describe('EntryModel.unitSymbols', () => {
  it('returns unit symbols', () => {
    expect(EntryModel.unitSymbols(makeQuantity())).toEqual(['m'])
  })

  it('returns empty array for math entry', () => {
    expect(EntryModel.unitSymbols(makeMath())).toEqual([])
  })

  it('returns empty array for quantity with no units', () => {
    expect(EntryModel.unitSymbols(makeQuantity({ units: undefined }))).toEqual([])
  })

  it('flattens multiple unit symbols', () => {
    const entry = makeQuantity({
      units: [
        { en: 'a', symbol: ['x', 'y'] },
        { en: 'b', symbol: ['z'] },
      ],
    })
    expect(EntryModel.unitSymbols(entry)).toEqual(['x', 'y', 'z'])
  })
})

// ── hasFrench ──

describe('EntryModel.hasFrench', () => {
  it('returns true when French designation exists', () => {
    expect(EntryModel.hasFrench(makeQuantity())).toBe(true)
  })

  it('returns true when only French definition exists', () => {
    const entry = makeQuantity({
      designations: [{ designation: { en: { text: 'mass' } } }],
      def: { en: 'mass', fr: 'masse' },
    })
    expect(EntryModel.hasFrench(entry)).toBe(true)
  })

  it('returns false when no French', () => {
    expect(EntryModel.hasFrench(makeMath())).toBe(false)
  })
})

// ── sectionGroup ──

describe('EntryModel.sectionGroup', () => {
  it('extracts section prefix from dotted num', () => {
    expect(EntryModel.sectionGroup(makeQuantity({ num: '4-1.2' }))).toBe('4-1')
  })

  it('returns num itself when no dot', () => {
    expect(EntryModel.sectionGroup(makeQuantity({ num: '4-1' }))).toBe('4-1')
  })

  it('handles nested dot notation', () => {
    expect(EntryModel.sectionGroup(makeQuantity({ num: '11-4.2.3' }))).toBe('11-4')
  })
})

// ── shortDef ──

describe('EntryModel.shortDef', () => {
  it('returns full definition when under max length', () => {
    expect(EntryModel.shortDef(makeQuantity())).toBe('linear extent of a path')
  })

  it('truncates long definitions', () => {
    const longDef = 'A '.repeat(100)
    const entry = makeQuantity({ def: { en: longDef } })
    const short = EntryModel.shortDef(entry, 50)
    expect(short.length).toBeLessThanOrEqual(53) // maxLen + '…'
    expect(short).toMatch(/…$/)
  })

  it('strips stem markup', () => {
    const entry = makeQuantity({ def: { en: 'value is stem:[x^2] plus stem:[y]' } })
    expect(EntryModel.shortDef(entry)).toBe('value is x^2 plus y')
  })

  it('respects lang parameter', () => {
    expect(EntryModel.shortDef(makeQuantity(), 140, 'fr')).toContain('étendue')
  })

  it('returns empty string for missing definition', () => {
    const entry = makeQuantity({ def: { en: '' } })
    expect(EntryModel.shortDef(entry)).toBe('')
  })
})
