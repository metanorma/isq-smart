import type { PartMeta, Domain } from '../data/types'

export interface SearchIndexItem {
  i: string
  n: string
  t: string
  s: string[]
  u: string[]
  p: string
  d: string
}

export interface SearchResult {
  id: string
  num: string
  name: string
  symbols: string[]
  unitSymbols: string[]
  partKey: string
  partTitle: string
  partDomain: string
  matchField: string
}

export type SearchDomain = 'all' | Domain

const MATCH_FIELDS = ['number', 'name', 'symbol', 'definition', 'unit'] as const
export type MatchField = typeof MATCH_FIELDS[number]

export const MATCH_LABELS: Record<MatchField, string> = {
  number: 'Number',
  name: 'Name',
  symbol: 'Symbol',
  definition: 'Definition',
  unit: 'Unit',
}

const MAX_RESULTS = 30

function detectMatchField(query: string, item: SearchIndexItem): string {
  const q = query.toLowerCase()
  if (item.n.toLowerCase().includes(q)) return 'number'
  if (item.t.toLowerCase().includes(q)) return 'name'
  if (item.s.some(s => s.toLowerCase().includes(q))) return 'symbol'
  if (item.d.toLowerCase().includes(q)) return 'definition'
  if (item.u.some(u => u.toLowerCase().includes(q))) return 'unit'
  return ''
}

function buildSearchableText(item: SearchIndexItem): string {
  return `${item.t} ${item.s.join(' ')} ${item.u.join(' ')} ${item.d ?? ''} ${item.n}`.toLowerCase()
}

interface IndexedItem extends SearchIndexItem {
  _searchText: string
}

export class SearchEngine {
  private readonly items: IndexedItem[]
  private readonly partMetaLookup: (partKey: string) => PartMeta | undefined

  constructor(
    rawItems: readonly SearchIndexItem[],
    partMetaLookup: (partKey: string) => PartMeta | undefined,
  ) {
    this.items = rawItems.map(item => ({
      ...item,
      d: item.d ?? '',
      _searchText: buildSearchableText(item),
    }))
    this.partMetaLookup = partMetaLookup
  }

  search(query: string, domain: SearchDomain = 'all'): SearchResult[] {
    const q = query.toLowerCase().trim()
    if (!q) return []

    const results: SearchResult[] = []
    for (const item of this.items) {
      if (!item._searchText.includes(q)) continue
      const meta = this.partMetaLookup(item.p)
      if (!meta) continue
      if (domain !== 'all' && meta.domain !== domain) continue
      results.push({
        id: item.i,
        num: item.n,
        name: item.t,
        symbols: item.s,
        unitSymbols: item.u,
        partKey: item.p,
        partTitle: meta.title,
        partDomain: meta.domain,
        matchField: detectMatchField(query, item),
      })
      if (results.length >= MAX_RESULTS) break
    }
    return results
  }

  static matchLabel(field: string): string {
    return MATCH_LABELS[field as MatchField] ?? ''
  }
}
