import { describe, it, expect } from 'vitest'
import {
  publisherOf,
  getPartMeta,
  getPartsByDomain,
  partUrl,
  entryUrl,
  domainPath,
  getPartDocument,
  getAllDocuments,
  getSectionsForDocument,
} from '../../data/PartRegistry'

// ── Publisher determination ──

describe('publisherOf', () => {
  it('returns ISO for standard ISO parts', () => {
    expect(publisherOf('2')).toBe('ISO')
    expect(publisherOf('3')).toBe('ISO')
    expect(publisherOf('4')).toBe('ISO')
    expect(publisherOf('5')).toBe('ISO')
    expect(publisherOf('7')).toBe('ISO')
    expect(publisherOf('8')).toBe('ISO')
    expect(publisherOf('9')).toBe('ISO')
    expect(publisherOf('10')).toBe('ISO')
    expect(publisherOf('11')).toBe('ISO')
    expect(publisherOf('12')).toBe('ISO')
  })

  it('returns IEC for IEC parts', () => {
    expect(publisherOf('6')).toBe('IEC')
    expect(publisherOf('13')).toBe('IEC')
  })

  it('derives publisher from base part for sub-sections', () => {
    // Part 2 sub-sections (ISO)
    expect(publisherOf('2-5')).toBe('ISO')
    expect(publisherOf('2-20')).toBe('ISO')
    // Part 11 sub-parts (ISO)
    expect(publisherOf('11-4')).toBe('ISO')
    expect(publisherOf('11-9')).toBe('ISO')
    // IEC parts have no sub-sections but test the logic
    expect(publisherOf('6-1')).toBe('IEC')
  })
})

// ── Part document model ──

describe('getPartDocument', () => {
  it('returns document metadata for ISO parts', () => {
    const doc = getPartDocument('3')
    expect(doc).toBeDefined()
    expect(doc!.title).toBe('Space and Time')
    expect(doc!.publisher).toBe('ISO')
    expect(doc!.edition).toContain('2019')
    expect(doc!.scope).toBeTruthy()
    expect(doc!.highlights.length).toBeGreaterThan(0)
    expect(doc!.storeUrl).toContain('iso.org')
  })

  it('returns IEC documents', () => {
    const doc = getPartDocument('6')
    expect(doc).toBeDefined()
    expect(doc!.publisher).toBe('IEC')
    expect(doc!.storeUrl).toContain('iec.ch')
  })

  it('returns undefined for unknown parts', () => {
    expect(getPartDocument('99')).toBeUndefined()
  })

  it('includes Part 2 (math, now enabled)', () => {
    const doc = getPartDocument('2')
    expect(doc).toBeDefined()
    expect(doc!.title).toBe('Mathematical Signs and Symbols')
  })

  it('all visible documents have required fields', () => {
    const docs = getAllDocuments()
    for (const doc of docs) {
      expect(doc.partKey).toBeTruthy()
      expect(doc.title).toBeTruthy()
      expect(doc.publisher).toMatch(/^(ISO|IEC)$/)
      expect(doc.edition).toBeTruthy()
      expect(doc.scope).toBeTruthy()
      expect(doc.highlights.length).toBeGreaterThan(0)
      expect(doc.storeUrl).toBeTruthy()
    }
  })
})

// ── Part sections ──

describe('getSectionsForDocument', () => {
  it('returns sections for Part 2 (math, now enabled)', () => {
    const sections = getSectionsForDocument('2')
    expect(sections.length).toBeGreaterThan(0)
    expect(sections.every(s => s.parentDocument === '2')).toBe(true)
  })

  it('returns 1 section for Part 11 (sections are data-internal, not separate parts)', () => {
    const sections = getSectionsForDocument('11')
    expect(sections).toHaveLength(1)
    expect(sections[0].partKey).toBe('11')
    expect(sections[0].parentDocument).toBe('11')
  })

  it('returns single section for leaf parts', () => {
    const sections = getSectionsForDocument('3')
    expect(sections).toHaveLength(1)
    expect(sections[0].partKey).toBe('3')
    expect(sections[0].parentDocument).toBe('3')
  })
})

// ── PartMeta lookups ──

describe('getPartMeta', () => {
  it('finds leaf parts by exact key', () => {
    const meta = getPartMeta('3')
    expect(meta).toBeDefined()
    expect(meta!.partKey).toBe('3')
    expect(meta!.domain).toBe('quantities')
    expect(meta!.title).toBe('Space and Time')
  })

  it('finds math sub-sections (now enabled)', () => {
    const meta = getPartMeta('2-5')
    expect(meta).toBeDefined()
    expect(meta!.domain).toBe('math')
  })

  it('falls back to base part for unknown sub-keys', () => {
    const meta = getPartMeta('3-99')
    expect(meta).toBeDefined()
    expect(meta!.partKey).toBe('3')
  })
})

// ── Domain grouping ──

describe('getPartsByDomain', () => {
  it('returns math parts for math domain (now enabled)', () => {
    const parts = getPartsByDomain('math')
    expect(parts.length).toBeGreaterThan(0)
    expect(parts.every(p => p.domain === 'math')).toBe(true)
  })

  it('returns quantity parts for quantities domain', () => {
    const parts = getPartsByDomain('quantities')
    expect(parts.length).toBeGreaterThan(0)
    expect(parts.every(p => p.domain === 'quantities')).toBe(true)
  })
})

// ── URL generation ──

describe('partUrl', () => {
  it('generates quantity URLs', () => {
    expect(partUrl('3')).toBe('/quantities/part-3')
    expect(partUrl('4')).toBe('/quantities/part-4')
  })

  it('generates math URLs for Part 2 sub-sections', () => {
    expect(partUrl('2-5')).toBe('/math/part-2-5')
  })

  it('returns root for unknown parts', () => {
    expect(partUrl('99')).toBe('/')
  })
})

describe('entryUrl', () => {
  it('generates full entry URLs', () => {
    expect(entryUrl('3', 't3-1')).toBe('/quantities/part-3/t3-1')
  })
})

describe('domainPath', () => {
  it('returns correct paths', () => {
    expect(domainPath('quantities')).toBe('/quantities')
    expect(domainPath('math')).toBe('/math')
  })
})
