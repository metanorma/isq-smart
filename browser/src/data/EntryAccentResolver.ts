import type { PartMeta } from './types'
import {
  accentGlow,
  accentGradient,
  accentColors,
  accentHeaderBg,
} from '../composables/useAccent'

export interface EntryAccentStyle {
  symbolGlow: { boxShadow: string }
  heroGlow: Record<string, string>
  defAccentStyle: { background: string }
  showcasePattern: { backgroundImage: string; backgroundSize: string }
  headerBg: Record<string, string>
  accentFrom: string
}

export class EntryAccentResolver {
  resolve(meta: PartMeta): EntryAccentStyle {
    const accentFrom = accentColors(meta).from
    return {
      symbolGlow: {
        boxShadow: `0 0 32px ${accentFrom}18, 0 0 64px ${accentFrom}0a`,
      },
      heroGlow: accentGlow(meta, 0.05, 180),
      defAccentStyle: { background: accentGradient(meta, 160) },
      showcasePattern: {
        backgroundImage: `radial-gradient(circle 1px at center, ${accentFrom}08 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      },
      headerBg: accentHeaderBg(meta),
      accentFrom,
    }
  }
}
