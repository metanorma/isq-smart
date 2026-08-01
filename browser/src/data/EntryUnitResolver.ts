import type { Entry, Lang } from './types'
import { langValue } from './langValue'

export class EntryUnitResolver {
  static name(entry: Entry, lang: Lang | 'both'): string {
    if (entry._tag !== 'quantity') return ''
    const l: Lang = lang === 'both' ? 'en' : lang
    return entry.units?.map(u => langValue(u, l)).join(', ') ?? ''
  }

  static symbols(entry: Entry): string[] {
    if (entry._tag !== 'quantity') return []
    return entry.units?.flatMap(u => u.symbol ?? []) ?? []
  }
}
