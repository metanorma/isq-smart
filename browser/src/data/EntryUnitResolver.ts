import type { Entry, Lang } from './types'

export class EntryUnitResolver {
  static name(entry: Entry, lang: Lang | 'both'): string {
    if (entry._tag !== 'quantity') return ''
    const l = lang === 'both' ? 'en' : lang
    return entry.units?.map(u => {
      const um = u as unknown as Record<string, string>
      return um[l] ?? um.en ?? u.en
    }).join(', ') ?? ''
  }

  static symbols(entry: Entry): string[] {
    if (entry._tag !== 'quantity') return []
    return entry.units?.flatMap(u => u.symbol ?? []) ?? []
  }
}
