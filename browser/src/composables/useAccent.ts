import type { PartMeta } from '../data/types'

const palettes: Record<string, { from: string; to: string }> = {
  violet:  { from: '#7c3aed', to: '#5b21b6' },
  sky:     { from: '#0284c7', to: '#0369a1' },
  slate:   { from: '#475569', to: '#334155' },
  orange:  { from: '#ea580c', to: '#c2410c' },
  amber:   { from: '#d97706', to: '#b45309' },
  yellow:  { from: '#ca8a04', to: '#a16207' },
  teal:    { from: '#0d9488', to: '#0f766e' },
  emerald: { from: '#059669', to: '#047857' },
  cyan:    { from: '#0891b2', to: '#0e7490' },
  indigo:  { from: '#6366f1', to: '#4f46e5' },
  rose:    { from: '#e11d48', to: '#be123c' },
  blue:    { from: '#2563eb', to: '#1d4ed8' },
}

const DEFAULT = palettes.blue

function resolve(part: PartMeta) {
  return palettes[part.accent ?? 'blue'] ?? DEFAULT
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function hexOpacity(opacity: number): string {
  return Math.round(opacity * 255).toString(16).padStart(2, '0')
}

const AccentPalette = {
  colors(part: PartMeta) {
    const p = resolve(part)
    return { from: p.from, to: p.to }
  },

  gradient(part: PartMeta, deg = 135): string {
    const { from, to } = AccentPalette.colors(part)
    return `linear-gradient(${deg}deg, ${from}, ${to})`
  },

  shadow(part: PartMeta, opacity = 0.25): string {
    const { from } = AccentPalette.colors(part)
    return `0 8px 24px -4px ${from}${hexOpacity(opacity)}`
  },

  rgba(part: PartMeta, alpha: number): string {
    const { from } = AccentPalette.colors(part)
    return hexToRgba(from, alpha)
  },

  hoverTint(part: PartMeta): string {
    return `${AccentPalette.colors(part).from}08`
  },
}

export function accentColors(part: PartMeta) { return AccentPalette.colors(part) }
export function accentGradient(part: PartMeta, deg = 135) { return AccentPalette.gradient(part, deg) }
export function accentShadow(part: PartMeta, opacity = 0.25) { return AccentPalette.shadow(part, opacity) }

export function accentGlow(part: PartMeta, opacity = 0.08, blur = 100): Record<string, string> {
  const { from } = AccentPalette.colors(part)
  return {
    background: `radial-gradient(circle at 70% 30%, ${hexToRgba(from, opacity)}, transparent ${blur}px)`,
  }
}

export function accentHeaderBg(part: PartMeta): Record<string, string> {
  const { from } = AccentPalette.colors(part)
  return { background: `linear-gradient(135deg, ${from}06, transparent 60%)` }
}
