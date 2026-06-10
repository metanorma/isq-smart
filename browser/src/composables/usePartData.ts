import { ref, watch, type Ref } from 'vue'
import { DataLoader } from '../data/DataLoader'
import type { Entry, PartData } from '../data/types'

export function usePartData(partKey: Ref<string>) {
  const entries = ref<Entry[]>([]) as Ref<Entry[]>
  const mathCache = ref<Record<string, string>>({})
  const latexCache = ref<Record<string, string>>({})
  const loading = ref(false)

  async function load(key: string) {
    loading.value = true
    const data: PartData = await DataLoader.loadPart(key)
    entries.value = data.entries
    mathCache.value = data.mathCache
    latexCache.value = data.latexCache
    loading.value = false
  }

  // Initial load (caller awaits this)
  const initialPromise = DataLoader.loadPart(partKey.value).then((data: PartData) => {
    entries.value = data.entries
    mathCache.value = data.mathCache
    latexCache.value = data.latexCache
  })

  watch(partKey, (newKey) => load(newKey))

  return { entries, mathCache, latexCache, loading, initialPromise }
}
