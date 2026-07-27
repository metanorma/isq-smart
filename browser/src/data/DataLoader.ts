import type { PartKey, PartData, Entry } from './types'
import { partSummaries } from './generated/meta'
import { DataProvider } from './DataProvider'

const partModules = import.meta.glob<{
  default: Entry[]
  editions: string[]
  bilingual: boolean
  mathCache: Record<string, string>
  latexCache: Record<string, string>
}>('./generated/part-*.ts')

const cache = new Map<PartKey, PartData>()

const provider = new DataProvider(partModules, cache, partSummaries)

export const DataLoader = {
  loadPart: (partKey: PartKey) => provider.loadPart(partKey),
  loadAll: () => provider.loadAll(),
  invalidate: (partKey?: PartKey) => provider.invalidate(partKey),
}

export { DataProvider }
