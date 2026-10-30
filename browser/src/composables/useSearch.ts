import { ref, shallowRef } from 'vue'
import { getPartMeta } from '../data/PartRegistry'
import { SearchEngine } from '../lib/SearchEngine'
import type { SearchResult, SearchDomain } from '../lib/SearchEngine'
import type { OntologyEntityData } from '../data/ontologyViewModel'

export type { SearchResult, SearchDomain } from '../lib/SearchEngine'
export { MATCH_LABELS } from '../lib/SearchEngine'

export interface OntologySearchResult {
  kind: 'ontology'
  slug: string
  qname: string
  label: string
  type: string
  description: string
}

export type CombinedSearchResult = (SearchResult & { kind: 'entry' }) | OntologySearchResult

let enginePromise: Promise<SearchEngine> | null = null
let ontologyEntities: readonly OntologyEntityData[] | null = null

function loadEngine(): Promise<SearchEngine> {
  if (!enginePromise) {
    enginePromise = Promise.all([
      import('../data/generated/domain-index'),
      import('../data/generated/ontology'),
    ]).then(([{ quantitiesIndex, mathIndex }, { ontologyEntities: entities }]) => {
      ontologyEntities = entities as readonly OntologyEntityData[]
      return new SearchEngine(
        [...(quantitiesIndex as unknown[]), ...(mathIndex as unknown[])] as never,
        getPartMeta,
      )
    })
  }
  return enginePromise
}

function searchOntologyEntities(query: string, limit: number): OntologySearchResult[] {
  if (!ontologyEntities) return []
  const q = query.toLowerCase()
  const hits: OntologySearchResult[] = []
  for (const e of ontologyEntities) {
    if (e.type === 'ontology' || e.ontology === 'external') continue
    const hay = `${e.label} ${e.qname} ${e.description ?? ''}`.toLowerCase()
    if (!hay.includes(q)) continue
    hits.push({
      kind: 'ontology',
      slug: e.slug,
      qname: e.qname,
      label: e.label,
      type: e.type,
      description: e.description ?? '',
    })
    if (hits.length >= limit) break
  }
  return hits
}

export const searchOpen = ref(false)
export const searchQuery = ref('')
export const searchDomain = ref<SearchDomain>('all')
export const searchResults = shallowRef<CombinedSearchResult[]>([])

export async function performSearch(query: string) {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  const engine = await loadEngine()
  const entries: CombinedSearchResult[] = engine
    .search(query, searchDomain.value)
    .map(r => ({ ...r, kind: 'entry' as const }))
  const ontology: OntologySearchResult[] =
    searchDomain.value === 'ontology'
      ? searchOntologyEntities(query, 30)
      : searchDomain.value === 'all'
        ? searchOntologyEntities(query, 6)
        : []
  searchResults.value = [...entries, ...ontology].slice(0, 30)
}

export function matchLabel(field: string): string {
  return SearchEngine.matchLabel(field)
}

export function openSearch() {
  searchOpen.value = true
  searchQuery.value = ''
  searchResults.value = []
}

export function closeSearch() {
  searchOpen.value = false
}
