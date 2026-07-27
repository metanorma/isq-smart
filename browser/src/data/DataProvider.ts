import type { PartKey, PartData, Entry } from './types'
import { partSummaries } from './generated/meta'

interface PartModule {
  default: Entry[]
  editions: string[]
  bilingual: boolean
  mathCache: Record<string, string>
  latexCache: Record<string, string>
}

type PartModuleMap = Record<string, () => Promise<PartModule>>
type PartCache = Map<PartKey, PartData>

export class DataProvider {
  constructor(
    private readonly partModules: PartModuleMap,
    private readonly cache: PartCache,
    private readonly summaries: Record<string, { count: number; bilingual: boolean; editions: string[] }>,
  ) {}

  async loadPart(partKey: PartKey): Promise<PartData> {
    const cached = this.cache.get(partKey)
    if (cached) return cached

    const directKey = `./generated/part-${partKey}.ts`
    const loader = this.partModules[directKey]
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
      result = await this.loadFromSubParts(partKey)
    }

    this.cache.set(partKey, result)
    return result
  }

  async loadAll(): Promise<Entry[]> {
    const keys = Object.keys(this.summaries)
    const results = await Promise.all(keys.map(pk => this.loadPart(pk)))
    return results.flatMap(r => r.entries)
  }

  invalidate(partKey?: PartKey): void {
    if (partKey) {
      this.cache.delete(partKey)
    } else {
      this.cache.clear()
    }
  }

  private async loadFromSubParts(partKey: PartKey): Promise<PartData> {
    const entries: Entry[] = []
    const editions: string[] = []
    let bilingual = false
    const mathCache: Record<string, string> = {}
    const latexCache: Record<string, string> = {}

    for (const subKey of this.getSubKeys(partKey)) {
      const key = `./generated/part-${subKey}.ts`
      const subLoader = this.partModules[key]
      if (subLoader) {
        const mod = await subLoader()
        entries.push(...mod.default)
        editions.push(...mod.editions)
        bilingual = bilingual || mod.bilingual
        Object.assign(mathCache, mod.mathCache)
        Object.assign(latexCache, mod.latexCache)
      }
    }

    return {
      entries,
      editions: [...new Set(editions)],
      bilingual,
      mathCache,
      latexCache,
    }
  }

  private getSubKeys(partKey: string): string[] {
    const prefix = partKey + '-'
    return Object.keys(this.summaries).filter(k => k.startsWith(prefix))
  }
}
