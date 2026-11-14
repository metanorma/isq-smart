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

  it('secondaryEntries: three consistent groups', () => {
    const labels = secondaryEntries.map(e => (isNavGroup(e) ? `${e.label} (group)` : e.label))
    expect(labels).toEqual(['About (group)', 'Resources (group)'])
  })

  it('About group contains the four About pages', () => {
    const about = secondaryEntries.find(e => isNavGroup(e) && e.label === 'About') as NavGroup | undefined
    expect(about).toBeDefined()
    expect(about!.items.map(i => i.to)).toEqual(['/about', '/about/emblem', '/about/history', '/about/ecosystem'])
    for (const item of about!.items) expect(item.to.startsWith('/about')).toBe(true)
  })

  it('Resources group contains publications, presentations, reference', () => {
    const resources = secondaryEntries.find(e => isNavGroup(e) && e.label === 'Resources') as NavGroup | undefined
    expect(resources).toBeDefined()
    expect(resources!.items.map(i => i.to)).toEqual(['/documents', '/presentations', '/reference'])
  })

  it('Ontology is promoted to the primary data nav', () => {
    expect(coreLinks.map(l => l.to)).toContain('/ontology')
  })

  it('every group stays inside its own route hierarchy', () => {
    const prefixes: Record<string, string> = { About: '/about', Resources: '/resources' }
    for (const entry of secondaryEntries) {
      if (!isNavGroup(entry)) continue
      const prefix = entry.label === 'About' ? '/about' : entry.label === 'Methodology' ? '/methodology' : null
      if (!prefix) continue
      for (const item of entry.items) expect(item.to.startsWith(prefix)).toBe(true)
    }
  })

  it('methodology and kinds live outside the header, reachable from hub pages', () => {
    const all = navLinks.map(l => l.to)
    expect(all).not.toContain('/methodology')
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
