import type { PartKey, PartData, Entry } from './types'
import { partSummaries } from './generated/meta'
import { sortPartKeys } from './partKey'

const partModules = import.meta.glob<{
  default: Entry[]
  editions: string[]
  bilingual: boolean
  mathCache: Record<string, string>
  latexCache: Record<string, string>
}>('./generated/part-*.ts')

function getSubKeys(partKey: string): string[] {
  const prefix = partKey + '-'
  return Object.keys(partSummaries).filter(k => k.startsWith(prefix))
}

export const DataLoader = {
  _cache: new Map<PartKey, PartData>(),

  async loadPart(partKey: PartKey): Promise<PartData> {
    const cached = this._cache.get(partKey)
    if (cached) return cached

    const directKey = `./generated/part-${partKey}.ts`
    const loader = partModules[directKey]
    let result: PartData
    if (loader) {
      const mod = await loader()
      result = {
        entries: mod.default,
        editions: mod.editions,
        bilingual: mod.bilingual,
        mathCache: mod.mathCache,
        latexCache: mod.latexCache,
      }
    } else {
      const entries: Entry[] = []
      const editions: string[] = []
      let bilingual = false
      const mathCache: Record<string, string> = {}
      const latexCache: Record<string, string> = {}
      for (const subKey of getSubKeys(partKey)) {
        const key = `./generated/part-${subKey}.ts`
        const subLoader = partModules[key]
        if (subLoader) {
          const mod = await subLoader()
          entries.push(...mod.default)
          editions.push(...mod.editions)
          bilingual = bilingual || mod.bilingual
          Object.assign(mathCache, mod.mathCache)
          Object.assign(latexCache, mod.latexCache)
        }
      }
      result = { entries, editions: [...new Set(editions)], bilingual, mathCache, latexCache }
    }

    this._cache.set(partKey, result)
    return result
  },

  async loadAll(): Promise<Entry[]> {
    const keys = Object.keys(partSummaries)
    const results = await Promise.all(keys.map(pk => DataLoader.loadPart(pk)))
    return results.flatMap(r => r.entries)
  },
}

// ── Part metadata helpers (single source of truth) ──

export function getAvailableParts(): string[] {
  return sortPartKeys(Object.keys(partSummaries))
}

export function getPartEntryCount(partKey: string): number {
  const direct = partSummaries[partKey]?.count
  if (direct != null) return direct
  return getSubKeys(partKey).reduce((s, k) => s + (partSummaries[k]?.count ?? 0), 0)
}

export function isBilingual(partKey: string): boolean {
  return partSummaries[partKey]?.bilingual ?? false
}

export function getPartEditions(partKey: string): string[] {
  const direct = partSummaries[partKey]?.editions
  if (direct?.length) return direct
  const editions = new Set<string>()
  for (const k of getSubKeys(partKey)) {
    for (const e of partSummaries[k]?.editions ?? []) editions.add(e)
  }
  return [...editions]
}
