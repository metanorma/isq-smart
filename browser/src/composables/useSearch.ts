import { ref, shallowRef } from 'vue'
import { getPartMeta } from '../data/PartRegistry'
import { quantitiesIndex, mathIndex } from '../data/generated/domain-index'

// ═══════════════════════════════════════════════════════════════
// Search types
// ═══════════════════════════════════════════════════════════════

interface IndexItem {
  i: string   // id
  n: string   // num
  t: string   // title/name
  s: string[] // symbols
  u: string[] // unit symbols
  p: string   // partKey
  d: string   // definition text
}

const MATCH_LABELS: Record<string, string> = {
  number: 'Number',
  name: 'Name',
  symbol: 'Symbol',
  definition: 'Definition',
  unit: 'Unit',
}

function detectMatchField(query: string, item: IndexItem): string {
  const q = query.toLowerCase()
  if (item.n.toLowerCase().includes(q)) return 'number'
  if (item.t.toLowerCase().includes(q)) return 'name'
  if (item.s.some(s => s.toLowerCase().includes(q))) return 'symbol'
  if (item.d.toLowerCase().includes(q)) return 'definition'
  if (item.u.some(u => u.toLowerCase().includes(q))) return 'unit'
  return ''
}

function searchableText(item: IndexItem): string {
  return `${item.t} ${item.s.join(' ')} ${item.u.join(' ')} ${item.d ?? ''} ${item.n}`.toLowerCase()
}

// Build a combined, pre-indexed list from build-time data
const allItems: (IndexItem & { _searchText: string })[] = [
  ...quantitiesIndex,
  ...mathIndex,
].map(item => ({ ...item, d: (item as any).d ?? '', _searchText: searchableText(item as IndexItem) }))

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

// ═══════════════════════════════════════════════════════════════
// Reactive state
// ═══════════════════════════════════════════════════════════════

export const searchOpen = ref(false)
export const searchQuery = ref('')
export const searchDomain = ref<'all' | 'quantities' | 'math'>('all')
export const searchResults = shallowRef<SearchResult[]>([])

// ═══════════════════════════════════════════════════════════════
// Public operations
// ═══════════════════════════════════════════════════════════════

export function performSearch(query: string) {
  if (!query.trim()) { searchResults.value = []; return }
  const q = query.toLowerCase()
  const domain = searchDomain.value
  const results: SearchResult[] = []
  for (const item of allItems) {
    if (!item._searchText.includes(q)) continue
    const meta = getPartMeta(item.p)
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
    if (results.length >= 30) break
  }
  searchResults.value = results
}

export function matchLabel(field: string): string { return MATCH_LABELS[field] ?? '' }

export function openSearch() {
  searchOpen.value = true
  searchQuery.value = ''
  searchResults.value = []
}

export function closeSearch() {
  searchOpen.value = false
}
