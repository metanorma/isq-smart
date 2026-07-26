import { describe, it, expect } from 'vitest'
import { PartSummaryProvider } from '../PartSummaryProvider'

describe('PartSummaryProvider', () => {
  it('entryCount returns direct count for a part with entries', () => {
    const count = PartSummaryProvider.entryCount('3')
    expect(count).toBeGreaterThan(0)
  })

  it('entryCount sums sub-parts when parent has no direct entries', () => {
    const parentCount = PartSummaryProvider.entryCount('11')
    const subCount = PartSummaryProvider.entryCount('11-4')
    expect(parentCount).toBeGreaterThanOrEqual(subCount)
  })

  it('isBilingual returns true for parts with French content', () => {
    expect(PartSummaryProvider.isBilingual('3')).toBe(true)
    expect(PartSummaryProvider.isBilingual('2-5')).toBe(true)
  })

  it('isBilingual checks sub-parts for parent part 11', () => {
    expect(PartSummaryProvider.isBilingual('11')).toBe(true)
  })

  it('editions returns non-empty array for known parts', () => {
    const editions = PartSummaryProvider.editions('3')
    expect(editions.length).toBeGreaterThan(0)
  })

  it('editions aggregates from sub-parts for parent parts', () => {
    const editions = PartSummaryProvider.editions('11')
    expect(editions.length).toBeGreaterThan(0)
  })

  it('getAvailableParts returns sorted list including all parts', () => {
    const parts = PartSummaryProvider.getAvailableParts()
    expect(parts).toContain('3')
    expect(parts).toContain('2-5')
    expect(parts.length).toBeGreaterThan(20)
  })
})
