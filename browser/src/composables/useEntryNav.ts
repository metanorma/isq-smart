import { computed, onMounted, onUnmounted, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { partUrl } from '../data/PartRegistry'
import type { Entry } from '../data/types'

export function useEntryNav(entries: Ref<Entry[]>, currentId: Ref<string>, partKey: Ref<string>) {
  const router = useRouter()

  const siblings = computed(() => {
    const idx = entries.value.findIndex(e => e.id === currentId.value)
    return {
      prev: idx > 0 ? entries.value[idx - 1] : null,
      next: idx < entries.value.length - 1 ? entries.value[idx + 1] : null,
      idx: idx + 1,
      total: entries.value.length,
    }
  })

  function onKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === 'k' && siblings.value.prev) {
      e.preventDefault()
      router.push(`${partUrl(partKey.value)}/${siblings.value.prev.id}`)
    } else if (e.key === 'j' && siblings.value.next) {
      e.preventDefault()
      router.push(`${partUrl(partKey.value)}/${siblings.value.next.id}`)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      router.push(partUrl(partKey.value))
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

  return { siblings }
}
