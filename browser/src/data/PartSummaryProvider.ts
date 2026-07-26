import { partSummaries } from './generated/meta'
import { sortPartKeys } from './partKey'

function getSubKeys(partKey: string): string[] {
  const prefix = partKey + '-'
  return Object.keys(partSummaries).filter(k => k.startsWith(prefix))
}

export const PartSummaryProvider = {
  getAvailableParts(): string[] {
    return sortPartKeys(Object.keys(partSummaries))
  },

  entryCount(partKey: string): number {
    const direct = partSummaries[partKey]?.count
    if (direct != null) return direct
    return getSubKeys(partKey).reduce((s, k) => s + (partSummaries[k]?.count ?? 0), 0)
  },

  isBilingual(partKey: string): boolean {
    const direct = partSummaries[partKey]?.bilingual
    if (direct != null) return direct
    return getSubKeys(partKey).some(k => partSummaries[k]?.bilingual)
  },

  editions(partKey: string): string[] {
    const direct = partSummaries[partKey]?.editions
    if (direct?.length) return direct
    const all = new Set<string>()
    for (const k of getSubKeys(partKey)) {
      for (const e of partSummaries[k]?.editions ?? []) all.add(e)
    }
    return [...all]
  },
}
