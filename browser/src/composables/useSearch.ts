import { ref, shallowRef } from 'vue'
import { loadPartEntries, getPartMeta, getAvailableParts } from '../data/index'
import type { Entry, PartMeta } from '../data/types'

// ═══════════════════════════════════════════════════════════════
// Search helpers
// ═══════════════════════════════════════════════════════════════

const MATCH_LABELS: Record<string, string> = {
  number: 'Number',
  name: 'Name',
  symbol: 'Symbol',
  definition: 'Definition',
  unit: 'Unit',
}

function detectMatchField(query: string, entry: Entry): string {
  const q = query.toLowerCase()
  if (entry.num.toLowerCase().includes(q)) return 'number'
  const nameEn = (entry.designations[0]?.designation.en?.text ?? '').toLowerCase()
  if (nameEn.includes(q)) return 'name'
  if (entry.symbols?.some(s => s.toLowerCase().includes(q))) return 'symbol'
  if (entry.def.en?.toLowerCase().includes(q) || entry.def.fr?.toLowerCase().includes(q)) return 'definition'
  if (entry._tag === 'quantity' && entry.units?.some(u =>
    u.en?.toLowerCase().includes(q) || u.symbol?.some(s => s.toLowerCase().includes(q))
  )) return 'unit'
  return ''
}

function buildDocumentText(entry: Entry): string {
  const names = entry.designations
    .flatMap(d => [d.designation.en?.text, d.designation.fr?.text].filter(Boolean))
    .join(' ')
  const syms = (entry.symbols ?? []).join(' ')
  const def = [entry.def.en, entry.def.fr].filter(Boolean).join(' ')
  const units = entry._tag === 'quantity'
    ? entry.units?.map(u => `${u.en} ${u.fr ?? ''} ${(u.symbol ?? []).join(' ')}`).join(' ') ?? ''
    : ''
  return `${names} ${syms} ${def} ${units} ${entry.num}`
}

// Simple client-side search index (no flexsearch dependency)
interface SearchDoc {
  entry: Entry
  partMeta: PartMeta
  text: string
}

let docs: SearchDoc[] = []
let buildPromise: Promise<void> | null = null

export interface SearchResult {
  entry: Entry
  partMeta: PartMeta
  matchField: string
}

async function buildIndex() {
  if (docs.length > 0) return
  if (buildPromise) { await buildPromise; return }

  buildPromise = (async () => {
    const partKeys = getAvailableParts()
    const allEntries: SearchDoc[] = []

    for (const partKey of partKeys) {
      const meta = getPartMeta(partKey)
      if (!meta) continue
      const data = await loadPartEntries(partKey)
      for (const entry of data.entries) {
        allEntries.push({ entry, partMeta: meta, text: buildDocumentText(entry).toLowerCase() })
      }
    }

    docs = allEntries
  })()

  await buildPromise
}

// ═══════════════════════════════════════════════════════════════
// Reactive state
// ═══════════════════════════════════════════════════════════════

export const searchOpen = ref(false)
export const searchQuery = ref('')
export const searchDomain = ref<'all' | 'quantities' | 'math'>('all')
export const searchResults = shallowRef<SearchResult[]>([])
export const searchLoading = ref(false)

// ═══════════════════════════════════════════════════════════════
// Public operations
// ═══════════════════════════════════════════════════════════════

export async function performSearch(query: string) {
  if (!query.trim()) { searchResults.value = []; return }
  searchLoading.value = true
  await buildIndex()
  const q = query.toLowerCase()
  const domain = searchDomain.value
  const results = docs
    .filter(d => d.text.includes(q))
    .slice(0, 30)
    .map(d => ({
      entry: d.entry,
      partMeta: d.partMeta,
      matchField: detectMatchField(query, d.entry),
    }))
    .filter((r): r is SearchResult => {
      if (domain !== 'all' && r.partMeta.domain !== domain) return false
      return true
    })
  searchResults.value = results
  searchLoading.value = false
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
