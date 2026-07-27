import { describe, it, expect } from 'vitest'
import { AccentPalette } from '../AccentPalette'
import type { PartMeta } from '../../data/types'

function makeMeta(accent = 'blue'): PartMeta {
  return {
    domain: 'quantities',
    partKey: '3',
    title: 'Test',
    description: 'Test',
    icon: '×',
    accent,
  } as PartMeta
}

describe('AccentPalette', () => {
  it('resolves colors for blue accent', () => {
    const c = AccentPalette.colors(makeMeta('blue'))
    expect(c.from).toBe('#2563eb')
    expect(c.to).toBe('#1d4ed8')
  })

  it('resolves colors for violet accent', () => {
    const c = AccentPalette.colors(makeMeta('violet'))
    expect(c.from).toBe('#7c3aed')
  })

  it('falls back to blue for unknown accent', () => {
    const c = AccentPalette.colors(makeMeta('nonexistent' as never))
    expect(c.from).toBe('#2563eb')
  })

  it('generates a gradient string', () => {
    const g = AccentPalette.gradient(makeMeta('blue'), 135)
    expect(g).toContain('linear-gradient(135deg')
    expect(g).toContain('#2563eb')
  })

  it('generates a shadow with opacity', () => {
    const s = AccentPalette.shadow(makeMeta('blue'), 0.25)
    expect(s).toContain('0 8px 24px')
  })

  it('generates a glow object', () => {
    const glow = AccentPalette.glow(makeMeta('blue'), 0.08, 100)
    expect(glow.background).toContain('radial-gradient')
  })

  it('generates a header background', () => {
    const bg = AccentPalette.headerBg(makeMeta('blue'))
    expect(bg.background).toContain('linear-gradient')
  })

  it('resolves neon colors', () => {
    const n = AccentPalette.neon(makeMeta('violet'))
    expect(n.from).toBe('#a78bfa')
  })
})
