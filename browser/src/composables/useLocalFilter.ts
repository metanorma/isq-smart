/**
 * Shared composable for local search/filter/highlight in browser components.
 * Eliminates duplicated search input + filter + highlight logic across
 * EntryBrowser, PartEntryList, UnitBrowser, and DimensionBrowser.
 */

import { ref, computed, type Ref } from 'vue'
import { highlightText } from '../lib/text'

export interface FilterableItem {
  [key: string]: unknown
}

export function useLocalFilter<
  T extends FilterableItem,
  Fields extends keyof T & string,
>(
  items: Ref<T[]> | T[],
  searchFields: Fields[],
  options?: { pageSize?: number },
) {
  const searchQuery = ref('')
  const showCount = ref(options?.pageSize ?? 60)

  const sourceItems = 'value' in items ? items : { value: items }

  const filtered = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return sourceItems.value

    return sourceItems.value.filter(item =>
      searchFields.some(field => {
        const val = item[field]
        if (val == null) return false
        if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q))
        return String(val).toLowerCase().includes(q)
      }),
    )
  })

  const visibleItems = computed(() => filtered.value.slice(0, showCount.value))
  const hasMore = computed(() => showCount.value < filtered.value.length)

  const isBrowsing = computed(() => !searchQuery.value.trim())

  function showMore() {
    showCount.value += options?.pageSize ?? 60
  }

  function clear() {
    searchQuery.value = ''
    showCount.value = options?.pageSize ?? 60
  }

  function hl(text: string): string {
    return highlightText(text, searchQuery.value)
  }

  return {
    searchQuery,
    filtered,
    visibleItems,
    hasMore,
    isBrowsing,
    showMore,
    clear,
    hl,
  }
}
