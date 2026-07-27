import { describe, it, expect } from 'vitest'
import { SearchEngine } from '../SearchEngine'
import type { SearchIndexItem } from '../SearchEngine'
import type { PartMeta } from '../../data/types'

const testItems: SearchIndexItem[] = [
  { i: 't3-1.1', n: '3-1.1', t: 'length', s: ['l', 'L'], u: ['m'], p: '3', d: 'extent in space' },
  { i: 't3-1.2', n: '3-1.2', t: 'width', s: ['b'], u: ['m'], p: '3', d: 'breadth' },
  { i: 't4-1', n: '4-1', t: 'mass', s: ['m'], u: ['kg'], p: '4', d: 'quantity of matter' },
]

const partMeta: Record<string, PartMeta> = {
  '3': { domain: 'quantities', partKey: '3', title: 'Space and Time', description: '', icon: '×', accent: 'sky' } as PartMeta,
  '4': { domain: 'quantities', partKey: '4', title: 'Mechanics', description: '', icon: '×', accent: 'slate' } as PartMeta,
}

const engine = new SearchEngine(testItems, (pk) => partMeta[pk])

describe('SearchEngine', () => {
  it('finds by name', () => {
    const results = engine.search('length')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('length')
  })

  it('finds by number', () => {
    const results = engine.search('3-1')
    expect(results.some(r => r.num === '3-1.1')).toBe(true)
  })

  it('finds by symbol', () => {
    const results = engine.search('kg')
    expect(results.some(r => r.partKey === '4')).toBe(true)
  })

  it('finds by definition text', () => {
    const results = engine.search('extent')
    expect(results.some(r => r.id === 't3-1.1')).toBe(true)
  })

  it('returns empty for empty query', () => {
    expect(engine.search('')).toEqual([])
  })

  it('returns empty for whitespace query', () => {
    expect(engine.search('   ')).toEqual([])
  })

  it('respects domain filter', () => {
    const allResults = engine.search('m', 'all')
    const qtyResults = engine.search('m', 'quantities')
    expect(qtyResults.length).toBeLessThanOrEqual(allResults.length)
    expect(qtyResults.every(r => r.partDomain === 'quantities')).toBe(true)
  })

  it('detects match field correctly', () => {
    const results = engine.search('length')
    expect(results[0].matchField).toBe('name')
  })

  it('matchLabel returns label for known fields', () => {
    expect(SearchEngine.matchLabel('name')).toBe('Name')
    expect(SearchEngine.matchLabel('symbol')).toBe('Symbol')
  })

  it('matchLabel returns empty string for unknown fields', () => {
    expect(SearchEngine.matchLabel('unknown')).toBe('')
  })
})
