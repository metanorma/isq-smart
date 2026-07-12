import { describe, it, expect } from 'vitest'
import {
  basePartKey,
  parsePartKey,
  comparePartKeys,
  sortPartKeys,
  isSubSection,
  sectionLabel,
} from '../partKey'

describe('basePartKey', () => {
  it('returns the key itself for simple parts', () => {
    expect(basePartKey('3')).toBe('3')
    expect(basePartKey('13')).toBe('13')
  })

  it('extracts the base for sub-sections', () => {
    expect(basePartKey('2-5')).toBe('2')
    expect(basePartKey('11-4')).toBe('11')
  })
})

describe('parsePartKey', () => {
  it('parses simple parts with sub=0', () => {
    expect(parsePartKey('3')).toEqual({ base: 3, sub: 0 })
  })

  it('parses sub-sections', () => {
    expect(parsePartKey('2-5')).toEqual({ base: 2, sub: 5 })
    expect(parsePartKey('11-9')).toEqual({ base: 11, sub: 9 })
  })
})

describe('comparePartKeys', () => {
  it('orders by base part number', () => {
    expect(comparePartKeys('3', '4')).toBeLessThan(0)
    expect(comparePartKeys('10', '4')).toBeGreaterThan(0)
  })

  it('orders sub-sections after their parent', () => {
    expect(comparePartKeys('11-4', '11-5')).toBeLessThan(0)
    expect(comparePartKeys('11-9', '11-4')).toBeGreaterThan(0)
  })

  it('orders sub-sections relative to other base parts', () => {
    expect(comparePartKeys('2-20', '3')).toBeLessThan(0)
    expect(comparePartKeys('3', '11-4')).toBeLessThan(0)
  })
})

describe('sortPartKeys', () => {
  it('sorts a mixed list correctly', () => {
    const sorted = sortPartKeys(['11-9', '3', '11-4', '2-20', '2-5', '10'])
    expect(sorted).toEqual(['2-5', '2-20', '3', '10', '11-4', '11-9'])
  })

  it('does not mutate the input array', () => {
    const input = ['3', '2', '1']
    sortPartKeys(input)
    expect(input).toEqual(['3', '2', '1'])
  })
})

describe('isSubSection', () => {
  it('returns true for compound keys', () => {
    expect(isSubSection('2-5')).toBe(true)
    expect(isSubSection('11-4')).toBe(true)
  })

  it('returns false for simple keys', () => {
    expect(isSubSection('3')).toBe(false)
  })
})

describe('sectionLabel', () => {
  it('returns §N for sub-sections', () => {
    expect(sectionLabel('2-5')).toBe('§5')
    expect(sectionLabel('11-4')).toBe('§4')
  })

  it('returns the raw key for simple parts', () => {
    expect(sectionLabel('3')).toBe('3')
  })
})
