import { ref, shallowRef } from 'vue'
import { getPartMeta } from '../data/PartRegistry'
import { quantitiesIndex, mathIndex } from '../data/generated/domain-index'
import { SearchEngine } from '../lib/SearchEngine'
import type { SearchResult, SearchDomain } from '../lib/SearchEngine'

export type { SearchResult, SearchDomain } from '../lib/SearchEngine'
export { MATCH_LABELS } from '../lib/SearchEngine'

const engine = new SearchEngine(
  [...(quantitiesIndex as unknown[]), ...(mathIndex as unknown[])] as never,
  getPartMeta,
)

export const searchOpen = ref(false)
export const searchQuery = ref('')
export const searchDomain = ref<SearchDomain>('all')
export const searchResults = shallowRef<SearchResult[]>([])

export function performSearch(query: string) {
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
