import { describe, it, expect } from 'vitest'
import { coreLinks, secondaryLinks, navLinks, isActive } from '../nav'

describe('nav link arrays', () => {
  it('coreLinks contains quantities, math, units, dimensions', () => {
    expect(coreLinks.map(l => l.to)).toEqual(['/quantities', '/math', '/units', '/dimensions'])
  })

  it('secondaryLinks contains documents, ontology, reference, about', () => {
    expect(secondaryLinks.map(l => l.to)).toEqual(['/documents', '/ontology', '/reference', '/about'])
  })

  it('navLinks is the concatenation of core + secondary', () => {
    expect(navLinks).toEqual([...coreLinks, ...secondaryLinks])
  })

  it('every link has a label', () => {
    for (const link of navLinks) {
      expect(link.label).toBeTruthy()
      expect(link.label.length).toBeGreaterThan(0)
    }
  })
})

describe('isActive', () => {
  it('matches exact path', () => {
    expect(isActive('/quantities', '/quantities')).toBe(true)
  })

  it('matches child paths', () => {
    expect(isActive('/quantities/part-3/t3-1.1', '/quantities')).toBe(true)
  })

  it('does not match sibling paths', () => {
    expect(isActive('/quantities', '/math')).toBe(false)
  })

  it('does not partial-match different sections', () => {
    expect(isActive('/quantities', '/units')).toBe(false)
  })

  it('handles root path', () => {
    expect(isActive('/', '/')).toBe(true)
  })

  it('does not match / for /quantities', () => {
    expect(isActive('/quantities', '/')).toBe(false)
  })
})
