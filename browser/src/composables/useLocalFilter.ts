import { ref, computed, type Ref } from 'vue'
import { LocalFilter } from '../lib/LocalFilter'
import { highlightText } from '../lib/text'

export function useLocalFilter<
  T,
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
    const all = sourceItems.value
    const q = searchQuery.value
    if (!q.trim()) return all
    return new LocalFilter(all, searchFields).filter(q)
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
