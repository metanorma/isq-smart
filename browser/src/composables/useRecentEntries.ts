import { ref, watch } from 'vue'
import type { Entry } from '../data/types'
import { entryUrl } from '../data/PartRegistry'

const STORAGE_KEY = 'recent-entries'
const MAX = 12

interface RecentEntry {
  id: string
  num: string
  name: string
  partKey: string
  href: string
  ts: number
}

const recent = ref<RecentEntry[]>([])

function load(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function save(entries: RecentEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

recent.value = load()

export function useRecentEntries() {
  function track(entry: Entry, partKey: string) {
    const item: RecentEntry = {
      id: entry.id,
      num: entry.num,
      name: entry.designations[0]?.designation.en?.text ?? entry.id,
      partKey,
      href: entryUrl(partKey, entry.id),
      ts: Date.now(),
    }
    const filtered = recent.value.filter(r => r.id !== entry.id)
    filtered.unshift(item)
    recent.value = filtered.slice(0, MAX)
    save(recent.value)
  }

  function clear() {
    recent.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return { recent, track, clear }
}
