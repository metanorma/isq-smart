import { describe, it, expect } from 'vitest'
import { coreLinks, secondaryEntries, navLinks, isActive, isNavGroup } from '../nav'
import type { NavEntry, NavGroup, NavLink } from '../nav'

describe('nav link arrays', () => {
  it('coreLinks contains math, quantities, kinds, units, dimensions', () => {
    expect(coreLinks.map(l => l.to)).toEqual(['/quantities', '/math', '/units', '/ontology'])
  })

  it('every nav link has an i18nKey', () => {
    for (const link of navLinks) {
      expect(link.i18nKey).toBeTruthy()
      expect(link.i18nKey.length).toBeGreaterThan(0)
    }
  })

  it('secondaryEntries: one Explore group', () => {
    const labels = secondaryEntries.map(e => (isNavGroup(e) ? `${e.label} (group)` : e.label))
    expect(labels).toEqual(['Explore (group)'])
  })

  it('Ontology is promoted to the primary data nav', () => {
    expect(coreLinks.map(l => l.to)).toContain('/ontology')
  })

  it('Explore dropdown groups Learn and Services sections', () => {
    const explore = secondaryEntries.find(e => isNavGroup(e)) as NavGroup | undefined
    expect(explore).toBeDefined()
    expect(explore!.sections!.map(sec => sec.label)).toEqual(['Learn', 'Services'])
    expect(explore!.sections![0].items.map(i => i.to)).toEqual(['/about', '/about/emblem', '/about/history', '/about/ecosystem', '/methodology'])
    expect(explore!.sections![1].items.map(i => i.to)).toEqual(['/documents', '/presentations', '/reference'])
  })

  it('kinds and dimensions are hub views, not header items', () => {
    const all = navLinks.map(l => l.to)
    expect(all).not.toContain('/kinds')
    expect(all).not.toContain('/dimensions')
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
    const group: NavEntry = { label: 'Test', i18nKey: 'test', items: [] }
    expect(isNavGroup(group)).toBe(true)
  })

  it('rejects NavLink entries', () => {
    const link: NavEntry = { to: '/test', label: 'Test', i18nKey: 'test' }
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
