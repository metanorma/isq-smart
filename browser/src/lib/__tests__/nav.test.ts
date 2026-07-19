import { describe, it, expect } from 'vitest'
import { coreLinks, secondaryEntries, navLinks, isActive, isNavGroup } from '../nav'
import type { NavEntry, NavGroup, NavLink } from '../nav'

describe('nav link arrays', () => {
  it('coreLinks contains quantities, kinds, math, units, dimensions', () => {
    expect(coreLinks.map(l => l.to)).toEqual(['/quantities', '/kinds', '/math', '/units', '/dimensions'])
  })

  it('secondaryEntries groups About and Resources', () => {
    const labels = secondaryEntries.map(e => (isNavGroup(e) ? `${e.label} (group)` : e.label))
    expect(labels).toEqual(['About (group)', 'Resources (group)'])
  })

  it('About group contains about, methodology, terminology', () => {
    const about = secondaryEntries.find(e => isNavGroup(e) && e.label === 'About') as NavGroup | undefined
    expect(about).toBeDefined()
    expect(about!.items.map(i => i.to)).toEqual(['/about', '/methodology', '/terminology'])
  })

  it('Resources group contains ontology, publications, reference', () => {
    const resources = secondaryEntries.find(e => isNavGroup(e) && e.label === 'Resources') as NavGroup | undefined
    expect(resources).toBeDefined()
    expect(resources!.items.map(i => i.to)).toEqual(['/ontology', '/documents', '/reference'])
  })

  it('navLinks is the flattened concatenation of core + secondary', () => {
    const expected = [
      ...coreLinks,
      ...secondaryEntries.flatMap(e => (isNavGroup(e) ? e.items : [e])),
    ]
    expect(navLinks).toEqual(expected)
  })

  it('every link has a label', () => {
    for (const link of navLinks) {
      expect(link.label).toBeTruthy()
      expect(link.label.length).toBeGreaterThan(0)
    }
  })
})

describe('isNavGroup type guard', () => {
  it('identifies NavGroup entries', () => {
    const group: NavEntry = { label: 'Test', items: [] }
    expect(isNavGroup(group)).toBe(true)
  })

  it('rejects NavLink entries', () => {
    const link: NavEntry = { to: '/test', label: 'Test' }
    expect(isNavGroup(link)).toBe(false)
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
