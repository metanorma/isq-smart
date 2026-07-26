import { ENG, FRA } from './Language'
import type { Language } from './Language'

export class TextMatcher {
  private readonly enToFr: Map<string, string>

  constructor(enToFr: Map<string, string>) {
    this.enToFr = enToFr
  }

  translateText(text: string, lang: Language): string | null {
    if (lang === ENG) return null
    const trimmed = text.trim()
    const match = this.enToFr.get(trimmed)
    if (!match) return null
    const leading = text.match(/^\s*/)?.[0] ?? ''
    const trailing = text.match(/\s*$/)?.[0] ?? ''
    return leading + match + trailing
  }
}

export function buildTextMatcher(
  messages: Record<string, unknown>,
): TextMatcher {
  const enFlat = new Map<string, string>()
  const frFlat = new Map<string, string>()

  function flatten(obj: Record<string, unknown>, prefix: string, target: Map<string, string>): void {
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k
      if (typeof v === 'object' && v !== null) {
        flatten(v as Record<string, unknown>, full, target)
      } else if (typeof v === 'string') {
        target.set(full, v)
      }
    }
  }

  flatten((messages as Record<string, Record<string, unknown>>).en ?? {}, '', enFlat)
  flatten((messages as Record<string, Record<string, unknown>>).fr ?? {}, '', frFlat)

  const enToFr = new Map<string, string>()
  for (const [key, enText] of enFlat) {
    const frText = frFlat.get(key)
    if (frText && frText !== enText) {
      enToFr.set(enText, frText)
    }
  }

  return new TextMatcher(enToFr)
}

export { FRA }
