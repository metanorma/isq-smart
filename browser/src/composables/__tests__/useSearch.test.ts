import { describe, it, expect, beforeEach } from 'vitest'
import { searchQuery, searchDomain, searchResults, performSearch, openSearch, closeSearch, matchLabel } from '../useSearch'

beforeEach(() => {
  openSearch()
})

describe('performSearch', () => {
  it('returns empty results for empty query', async () => {
    await performSearch('')
    expect(searchResults.value).toHaveLength(0)
  })

  it('returns results for "length"', async () => {
    await performSearch('length')
    expect(searchResults.value.length).toBeGreaterThan(0)
  })

  it('limits results to 30', async () => {
    await performSearch('a')
    expect(searchResults.value.length).toBeLessThanOrEqual(30)
  })

  it('filters by domain', async () => {
    searchDomain.value = 'quantities'
    await performSearch('length')
    for (const r of searchResults.value) {
      expect(r.partDomain).toBe('quantities')
    }
    searchDomain.value = 'all'
  })

  it('appends ontology entities in the all domain', async () => {
    await performSearch('MeasuredQuantity')
    const ontology = searchResults.value.filter(r => r.kind === 'ontology')
    expect(ontology.length).toBeGreaterThan(0)
    expect(ontology[0]!.qname).toBe('isq:MeasuredQuantity')
  })

  it('returns only ontology results in the ontology domain', async () => {
    searchDomain.value = 'ontology'
    await performSearch('rod')
    expect(searchResults.value.length).toBeGreaterThan(0)
    for (const r of searchResults.value) {
      expect(r.kind).toBe('ontology')
    }
    searchDomain.value = 'all'
  })
})

describe('closeSearch', () => {
  it('closes the search modal', () => {
    openSearch()
    expect(searchQuery.value).toBe('')
    closeSearch()
    expect(searchResults.value).toHaveLength(0)
  })
})

describe('matchLabel', () => {
  it('returns human-readable labels for known fields', () => {
    expect(matchLabel('number')).toBe('Number')
    expect(matchLabel('name')).toBe('Name')
    expect(matchLabel('symbol')).toBe('Symbol')
  })

  it('returns empty string for unknown field', () => {
    expect(matchLabel('nonexistent')).toBe('')
  })
})
