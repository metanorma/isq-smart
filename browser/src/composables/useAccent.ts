import type { PartMeta } from '../data/types'
import { AccentPalette } from '../lib/AccentPalette'

export { AccentPalette } from '../lib/AccentPalette'

export function neonColors(part: PartMeta) {
  return AccentPalette.neon(part)
}
export function accentColors(part: PartMeta) { return AccentPalette.colors(part) }
export function accentGradient(part: PartMeta, deg = 135) { return AccentPalette.gradient(part, deg) }
export function accentShadow(part: PartMeta, opacity = 0.25) { return AccentPalette.shadow(part, opacity) }
export function accentGlow(part: PartMeta, opacity = 0.08, blur = 100) { return AccentPalette.glow(part, opacity, blur) }
export function accentHeaderBg(part: PartMeta) { return AccentPalette.headerBg(part) }
