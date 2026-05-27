import { describe, it, expect } from 'vitest'
import {
  publisherOf,
  getPartMeta,
  getAllParts,
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
  it('returns document metadata for known parts', () => {
    const doc = getPartDocument('2')
    expect(doc).toBeDefined()
    expect(doc!.title).toBe('Mathematical Signs and Symbols')
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

  it('all documents have required fields', () => {
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
  it('returns 16 sections for Part 2', () => {
    const sections = getSectionsForDocument('2')
    expect(sections).toHaveLength(16)
    expect(sections[0].partKey).toBe('2-5')
    expect(sections[15].partKey).toBe('2-20')
  })

  it('returns 6 sections for Part 11', () => {
    const sections = getSectionsForDocument('11')
    expect(sections).toHaveLength(6)
    expect(sections.map(s => s.partKey)).toEqual(['11-4', '11-5', '11-6', '11-7', '11-8', '11-9'])
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

  it('finds sub-sections', () => {
    const meta = getPartMeta('2-5')
    expect(meta).toBeDefined()
    expect(meta!.partKey).toBe('2-5')
    expect(meta!.domain).toBe('math')
    expect(meta!.parentPart).toBe('2')
  })

  it('falls back to base part for unknown sub-keys', () => {
    const meta = getPartMeta('3-99')
    expect(meta).toBeDefined()
    expect(meta!.partKey).toBe('3')
  })
})

// ── Domain grouping ──

describe('getPartsByDomain', () => {
  it('returns math parts for math domain', () => {
    const parts = getPartsByDomain('math')
    expect(parts.length).toBe(16) // 2-5 through 2-20
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

  it('generates math URLs', () => {
    expect(partUrl('2-5')).toBe('/math/part-2-5')
    expect(partUrl('2-20')).toBe('/math/part-2-20')
  })

  it('returns root for unknown parts', () => {
    expect(partUrl('99')).toBe('/')
  })
})

describe('entryUrl', () => {
  it('generates full entry URLs', () => {
    expect(entryUrl('3', 't3-1')).toBe('/quantities/part-3/t3-1')
    expect(entryUrl('2-5', 't2-5.1')).toBe('/math/part-2-5/t2-5.1')
  })
})

describe('domainPath', () => {
  it('returns correct paths', () => {
    expect(domainPath('quantities')).toBe('/quantities')
    expect(domainPath('math')).toBe('/math')
  })
})
