import { describe, it, expect } from 'vitest'
import type { Entry, PartMeta, QuantityEntry, MathEntry } from '../types'
import {
  resolveEntryDetailView,
  stripStem,
  renderDesignationText,
  unitLink,
} from '../entryViewModel'

// ── Test fixtures ──

const meta: PartMeta = {
  domain: 'quantities',
  partKey: '3',
  title: 'Space and time',
  description: 'ISO 80000-3 quantities of space and time',
  icon: 'space',
  accent: 'blue',
}

const metaSub: PartMeta = {
  domain: 'quantities',
  partKey: '11-4',
  title: 'Atomic physics',
  description: 'ISO 80000-11-4 atomic physics',
  icon: 'atom',
  accent: 'violet',
  parentPart: '11',
  parentTitle: 'Characteristics',
}

function makeQuantity(overrides: Partial<QuantityEntry> = {}): QuantityEntry {
  return {
    _tag: 'quantity',
    partKey: '3',
    edition: '2019',
    id: 't3-1.1',
    num: '3-1.1',
    designations: [{ designation: { en: { text: 'length' } } }],
    symbols: ['l'],
    def: { en: 'distance between two points' },
    units: [{ en: 'metre', symbol: ['m'] }],
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
    designations: [{ designation: { en: { text: 'plus' } } }],
    symbols: ['+'],
    def: { en: 'addition operation' },
    ...overrides,
  }
}

const emptyCaches = {
  mathCache: {},
  latexCache: {},
}

// ── Tests ──

describe('resolveEntryDetailView', () => {
  it('resolves basic entry metadata', () => {
    const entry = makeQuantity()
    const view = resolveEntryDetailView(
      entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
    )
    expect(view.entry).toBe(entry)
    expect(view.meta).toBe(meta)
    expect(view.domain).toBe('quantities')
    expect(view.partKey).toBe('3')
    expect(view.edition).toBe('2019')
    expect(view.bilingual).toBe(false)
  })

  it('joins multiple editions with comma', () => {
    const entry = makeQuantity()
    const view = resolveEntryDetailView(
      entry, '3', meta, 'quantities', ['2019', '2024'], false, [entry], emptyCaches,
    )
    expect(view.edition).toBe('2019, 2024')
  })

  describe('siblings', () => {
    it('computes prev/next/index/total correctly', () => {
      const e1 = makeQuantity({ id: 'a', num: '3-1' })
      const e2 = makeQuantity({ id: 'b', num: '3-2' })
      const e3 = makeQuantity({ id: 'c', num: '3-3' })
      const entries = [e1, e2, e3]

      const view = resolveEntryDetailView(
        e2, '3', meta, 'quantities', ['2019'], false, entries, emptyCaches,
      )
      expect(view.siblings.idx).toBe(2)
      expect(view.siblings.total).toBe(3)
      expect(view.siblings.prev).toBe(e1)
      expect(view.siblings.next).toBe(e3)
    })

    it('returns null prev for first entry', () => {
      const e1 = makeQuantity({ id: 'a', num: '3-1' })
      const e2 = makeQuantity({ id: 'b', num: '3-2' })

      const view = resolveEntryDetailView(
        e1, '3', meta, 'quantities', ['2019'], false, [e1, e2], emptyCaches,
      )
      expect(view.siblings.prev).toBeNull()
      expect(view.siblings.next).toBe(e2)
    })

    it('returns null next for last entry', () => {
      const e1 = makeQuantity({ id: 'a', num: '3-1' })
      const e2 = makeQuantity({ id: 'b', num: '3-2' })

      const view = resolveEntryDetailView(
        e2, '3', meta, 'quantities', ['2019'], false, [e1, e2], emptyCaches,
      )
      expect(view.siblings.prev).toBe(e1)
      expect(view.siblings.next).toBeNull()
    })

    it('handles single-entry parts', () => {
      const e1 = makeQuantity({ id: 'a', num: '3-1' })
      const view = resolveEntryDetailView(
        e1, '3', meta, 'quantities', ['2019'], false, [e1], emptyCaches,
      )
      expect(view.siblings.idx).toBe(1)
      expect(view.siblings.total).toBe(1)
      expect(view.siblings.prev).toBeNull()
      expect(view.siblings.next).toBeNull()
    })
  })

  describe('sectionEntries', () => {
    it('groups entries by section number prefix', () => {
      const e1 = makeQuantity({ id: 'a', num: '3-1.1' })
      const e2 = makeQuantity({ id: 'b', num: '3-1.2' })
      const e3 = makeQuantity({ id: 'c', num: '3-2' })
      const entries = [e1, e2, e3]

      const view = resolveEntryDetailView(
        e1, '3', meta, 'quantities', ['2019'], false, entries, emptyCaches,
      )
      expect(view.sectionLabel).toBe('3-1')
      expect(view.sectionEntries).toHaveLength(2)
      expect(view.sectionEntries.map(e => e.id)).toEqual(['a', 'b'])
    })

    it('uses the bare num as section label when no dot', () => {
      const e1 = makeQuantity({ id: 'a', num: '3-5' })
      const view = resolveEntryDetailView(
        e1, '3', meta, 'quantities', ['2019'], false, [e1], emptyCaches,
      )
      expect(view.sectionLabel).toBe('3-5')
      expect(view.sectionEntries).toHaveLength(1)
    })
  })

  describe('dualUrn', () => {
    it('generates ISO and IEC URNs', () => {
      const entry = makeQuantity({ num: '3-1.1' })
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.dualUrn.iso).toBe('urn:iso:std:iso:80000:-3:ed-2:en:item:3-1.1')
      expect(view.dualUrn.iec).toBe('urn:iec:std:iec:80000-3:2019:::item:3-1.1')
    })
  })

  describe('jsonLd', () => {
    it('generates valid JSON-LD with context and id', () => {
      const entry = makeQuantity()
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      const ld = view.jsonLd as Record<string, unknown>
      expect(ld['@context']).toBeDefined()
      expect(ld['@id']).toBeDefined()
      expect(ld['iso:urn']).toBeDefined()
    })
  })

  describe('accent styles', () => {
    it('computes accent style objects from meta', () => {
      const entry = makeQuantity()
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.accent.accentFrom).toMatch(/^#[0-9a-f]{6}$/i)
      expect(view.accent.symbolGlow.boxShadow).toContain(view.accent.accentFrom)
      expect(view.accent.heroGlow.background).toContain('radial-gradient')
      expect(view.accent.defAccentStyle.background).toContain('linear-gradient')
      expect(view.accent.showcasePattern.backgroundImage).toContain('radial-gradient')
      expect(view.accent.showcasePattern.backgroundSize).toBe('24px 24px')
      expect(view.accent.headerBg.background).toContain('linear-gradient')
    })
  })

  describe('partLabel', () => {
    it('shows plain part key for non-sub-section parts', () => {
      const entry = makeQuantity()
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.partLabel).toBe('Part 3')
    })

    it('shows parent part + section label for sub-section parts', () => {
      const entry = makeQuantity({ partKey: '11-4', id: 't11-4.1', num: '11-4.1' })
      const view = resolveEntryDetailView(
        entry, '11-4', metaSub, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.partLabel).toBe('Part 11 §4')
    })
  })

  describe('rendered content', () => {
    it('renders definition HTML', () => {
      const entry = makeQuantity({ def: { en: 'A simple definition' } })
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.defHtml).toContain('A simple definition')
    })

    it('renders empty remarks when undefined', () => {
      const entry = makeQuantity()
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.remHtml).toBe('')
    })

    it('renders remarks HTML when present', () => {
      const entry = makeQuantity({ remarks: { en: 'Some remark' } })
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.remHtml).toContain('Some remark')
    })

    it('renders name HTML from designations', () => {
      const entry = makeQuantity({
        designations: [{ designation: { en: { text: 'length' } } }],
      })
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.renderedNameHtml).toContain('length')
    })
  })

  describe('referencedBy', () => {
    it('resolves reverse xref entries that exist in xrefMap', () => {
      // t3-1.1 is referenced by entries that are in the generated xrefMap
      const entry = makeQuantity({ id: 't3-1.1', num: '3-1.1' })
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      // reverseXref['t3-1.1'] maps to real entries in the generated xref-map
      expect(view.referencedBy.length).toBeGreaterThan(0)
      for (const ref of view.referencedBy) {
        expect(ref.id).toBeDefined()
        expect(ref.name).toBeDefined()
        expect(ref.href).toBeDefined()
      }
    })

    it('returns empty array for unknown entry id', () => {
      const entry = makeQuantity({ id: 'nonexistent-entry' })
      const view = resolveEntryDetailView(
        entry, '3', meta, 'quantities', ['2019'], false, [entry], emptyCaches,
      )
      expect(view.referencedBy).toEqual([])
    })
  })

  it('works for math domain entries', () => {
    const entry = makeMath()
    const mathMeta: PartMeta = {
      domain: 'math',
      partKey: '2',
      title: 'Mathematics',
      description: 'ISO 80000-2 mathematical signs and symbols',
      icon: 'math',
      accent: 'indigo',
    }
    const view = resolveEntryDetailView(
      entry, '2', mathMeta, 'math', ['2019'], false, [entry], emptyCaches,
    )
    expect(view.domain).toBe('math')
    expect(view.entry._tag).toBe('math')
    expect(view.defHtml).toContain('addition operation')
  })
})

describe('stripStem', () => {
  it('extracts expression from stem:[...] wrapper', () => {
    expect(stripStem('stem:[x^2]')).toBe('x^2')
  })

  it('strips surrounding quotes from expression', () => {
    expect(stripStem('stem:["alpha"]')).toBe('alpha')
  })

  it('returns plain text unchanged', () => {
    expect(stripStem('hello world')).toBe('hello world')
  })

  it('handles multiple stem expressions in one string', () => {
    expect(stripStem('stem:[a] and stem:[b]')).toBe('a and b')
  })
})

describe('renderDesignationText', () => {
  it('returns empty string for empty input', () => {
    expect(renderDesignationText('', {})).toBe('')
  })

  it('renders plain text unchanged when no stem notation', () => {
    expect(renderDesignationText('length', {})).toBe('length')
  })

  it('renders stem notation using math cache', () => {
    const mathCache = { 'x^2': '<math>x²</math>' }
    expect(renderDesignationText('stem:[x^2]', mathCache)).toBe('<math>x²</math>')
  })

  it('renders fallback code for unknown stem expressions', () => {
    expect(renderDesignationText('stem:[unknown]', {})).toBe('<code class="math-inline">unknown</code>')
  })
})

describe('unitLink', () => {
  it('links to the unit slug page when slug is known', () => {
    // 'metre' is in the generated unitsdb
    expect(unitLink('metre')).toBe('/units/metre')
  })

  it('links to search page when slug is unknown', () => {
    expect(unitLink('unknown-unit')).toBe('/units?q=unknown-unit')
  })

  it('encodes special characters in search query', () => {
    expect(unitLink('totally unknown unit!')).toBe('/units?q=totally%20unknown%20unit!')
  })
})
