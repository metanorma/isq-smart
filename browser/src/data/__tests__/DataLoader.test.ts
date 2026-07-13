import { describe, it, expect } from 'vitest'
import {
  getAvailableParts,
  getPartEntryCount,
  isBilingual,
  getPartEditions,
} from '../PartRegistry'

describe('getAvailableParts', () => {
  it('returns a sorted list of part keys', () => {
    const parts = getAvailableParts()
    expect(parts.length).toBeGreaterThan(0)
    // Numeric sort — part-3 before part-4, sub-parts after parent
    const idx3 = parts.indexOf('3')
    const idx4 = parts.indexOf('4')
    expect(idx3).toBeGreaterThanOrEqual(0)
    expect(idx4).toBeGreaterThan(idx3)
  })

  it('includes sub-parts after their parent', () => {
    const parts = getAvailableParts()
    if (parts.includes('11-4') && parts.includes('11-5')) {
      const idx4 = parts.indexOf('11-4')
      const idx5 = parts.indexOf('11-5')
      expect(idx5).toBeGreaterThan(idx4)
    }
  })
})

describe('getPartEntryCount', () => {
  it('returns a positive count for known parts', () => {
    expect(getPartEntryCount('3')).toBeGreaterThan(0)
  })

  it('aggregates sub-part counts for composite parts', () => {
    const direct = getPartEntryCount('11-4')
    const aggregate = getPartEntryCount('11')
    expect(aggregate).toBeGreaterThanOrEqual(direct)
  })

  it('returns 0 for unknown parts', () => {
    expect(getPartEntryCount('nonexistent')).toBe(0)
  })
})

describe('isBilingual', () => {
  it('returns a boolean for known parts', () => {
    expect(typeof isBilingual('3')).toBe('boolean')
  })

  it('returns false for unknown parts', () => {
    expect(isBilingual('nonexistent')).toBe(false)
  })
})

describe('getPartEditions', () => {
  it('returns at least one edition for known parts', () => {
    expect(getPartEditions('3').length).toBeGreaterThan(0)
  })

  it('returns an empty array for unknown parts', () => {
    expect(getPartEditions('nonexistent')).toEqual([])
  })

  it('aggregates editions across sub-parts', () => {
    const editions = getPartEditions('11')
    if (getAvailableParts().some(p => p.startsWith('11-'))) {
      expect(editions.length).toBeGreaterThan(0)
    }
  })
})
