import { describe, it, expect } from 'vitest'
import {
  accentColors,
  accentGradient,
  accentShadow,
  accentGlow,
  accentHeaderBg,
  neonColors,
} from '../useAccent'
import type { PartMeta } from '../../data/types'

function mkPart(accent: string): PartMeta {
  return {
    domain: 'quantities',
    partKey: '3',
    title: 'Test',
    description: '',
    icon: '🌌',
    accent,
  }
}

describe('accentColors', () => {
  it('returns the named palette', () => {
    expect(accentColors(mkPart('violet'))).toEqual({ from: '#7c3aed', to: '#5b21b6' })
  })

  it('falls back to blue when accent is unknown', () => {
    expect(accentColors(mkPart('nonexistent'))).toEqual({ from: '#2563eb', to: '#1d4ed8' })
  })

  it('falls back to blue when accent is missing', () => {
    expect(accentColors(mkPart(''))).toEqual({ from: '#2563eb', to: '#1d4ed8' })
  })
})

describe('accentGradient', () => {
  it('builds a CSS linear-gradient with default 135deg', () => {
    expect(accentGradient(mkPart('blue')))
      .toBe('linear-gradient(135deg, #2563eb, #1d4ed8)')
  })

  it('respects a custom angle', () => {
    expect(accentGradient(mkPart('blue'), 90))
      .toBe('linear-gradient(90deg, #2563eb, #1d4ed8)')
  })
})

describe('accentShadow', () => {
  it('emits a box-shadow with hex opacity suffix', () => {
    // opacity 0.25 → 0.25 * 255 = 63.75 → 64 → '40'
    expect(accentShadow(mkPart('blue')))
      .toBe('0 8px 24px -4px #2563eb40')
  })

  it('respects custom opacity', () => {
    // opacity 0.5 → 128 → '80'
    expect(accentShadow(mkPart('blue'), 0.5))
      .toBe('0 8px 24px -4px #2563eb80')
  })
})

describe('accentGlow', () => {
  it('returns a style object with a radial-gradient background', () => {
    const glow = accentGlow(mkPart('blue'))
    expect(glow.background).toContain('radial-gradient(circle at 70% 30%')
    expect(glow.background).toContain('rgba(37, 99, 235, 0.08)')
    expect(glow.background).toContain('transparent 100px')
  })

  it('honors custom opacity and blur', () => {
    const glow = accentGlow(mkPart('blue'), 0.2, 200)
    expect(glow.background).toContain('rgba(37, 99, 235, 0.2)')
    expect(glow.background).toContain('transparent 200px')
  })
})

describe('accentHeaderBg', () => {
  it('returns a style object with a faint linear gradient', () => {
    const bg = accentHeaderBg(mkPart('blue'))
    expect(bg.background).toBe('linear-gradient(135deg, #2563eb06, transparent 60%)')
  })
})

describe('neonColors', () => {
  it('returns the neon variant of the palette', () => {
    expect(neonColors(mkPart('violet')))
      .toEqual({ from: '#a78bfa', to: '#8b5cf6' })
  })

  it('falls back to neon blue', () => {
    expect(neonColors(mkPart('nonexistent')))
      .toEqual({ from: '#60a5fa', to: '#3b82f6' })
  })
})
