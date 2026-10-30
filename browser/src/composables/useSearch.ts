import { ref, shallowRef } from 'vue'
import { getPartMeta } from '../data/PartRegistry'
import { SearchEngine } from '../lib/SearchEngine'
import type { SearchResult, SearchDomain } from '../lib/SearchEngine'

export type { SearchResult, SearchDomain } from '../lib/SearchEngine'
export { MATCH_LABELS } from '../lib/SearchEngine'

let enginePromise: Promise<SearchEngine> | null = null

function loadEngine(): Promise<SearchEngine> {
  if (!enginePromise) {
    enginePromise = import('../data/generated/domain-index').then(
      ({ quantitiesIndex, mathIndex }) =>
        new SearchEngine(
          [...(quantitiesIndex as unknown[]), ...(mathIndex as unknown[])] as never,
          getPartMeta,
        ),
    )
  }
  return enginePromise
}

export const searchOpen = ref(false)
export const searchQuery = ref('')
export const searchDomain = ref<SearchDomain>('all')
export const searchResults = shallowRef<SearchResult[]>([])

export async function performSearch(query: string) {
  const engine = await loadEngine()
  searchResults.value = engine.search(query, searchDomain.value)
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
