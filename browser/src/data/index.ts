import type { Domain, PartKey, Entry, Lang, PartData } from './types'
import { partSummaries } from './generated/meta'
import {
  getDomains, getDomain, getPartMeta, getPartsByDomain,
  getAllParts, partUrl, entryUrl, domainPath,
} from './PartRegistry'
import { render as renderAsciiDoc } from './asciidoc'
import { xrefMap } from './generated/xref-map'

export {
  getDomains, getDomain, getPartMeta, getPartsByDomain,
  getAllParts, partUrl, entryUrl, domainPath,
}

export type {
  Domain, PartKey, Entry, PartMeta, PartSummary, PartData,
  QuantityEntry, MathEntry, Designation, DesignationLang,
  Definition, Remark, ISO80000Unit, DomainInfo, DomainEntry,
} from './types'

// ═══════════════════════════════════════════════════════════════
// Internal utilities
// ═══════════════════════════════════════════════════════════════

function renderStem(text: string, cache: Record<string, string>): string {
  return renderAsciiDoc(text, cache, xrefMap)
}

function sortPartKey(a: string, b: string): number {
  const pa = a.includes('-') ? a.split('-').map(Number) : [Number(a), 0]
  const pb = b.includes('-') ? b.split('-').map(Number) : [Number(b), 0]
  return pa[0] !== pb[0] ? pa[0] - pb[0] : pa[1] - pb[1]
}

// ═══════════════════════════════════════════════════════════════
// EntryModel — encapsulated entry behavior
// ═══════════════════════════════════════════════════════════════

export const EntryModel = {
  name(entry: Entry, lang: Lang | 'both'): string {
    if (lang === 'both') {
      const en = entry.designations.map(d => d.designation.en?.text).filter(Boolean).join(', ')
      const fr = entry.designations.map(d => d.designation.fr?.text).filter(Boolean).join(', ')
      if (fr && fr !== en) return `${en} / ${fr}`
      return en
    }
    return entry.designations
      .map(d => d.designation[lang]?.text).filter(Boolean).join(', ')
  },

  definition(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    const l = lang === 'both' ? 'en' : lang
    const def = entry.def as unknown as Record<string, string>
    const raw = def[l] ?? def.en ?? entry.def.en
    return renderStem(raw, cache)
  },

  remarks(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
    if (!entry.remarks) return ''
    const l = lang === 'both' ? 'en' : lang
    const rem = entry.remarks as unknown as Record<string, string>
    const raw = rem[l] ?? (entry.remarks as unknown as Record<string, string>).en
    return raw ? renderStem(raw, cache) : ''
  },

  unitName(entry: Entry, lang: Lang | 'both'): string {
    if (entry._tag !== 'quantity') return ''
    const l = lang === 'both' ? 'en' : lang
    return entry.units?.map(u => {
      const um = u as unknown as Record<string, string>
      return um[l] ?? um.en ?? u.en
    }).join(', ') ?? ''
  },

  unitSymbols(entry: Entry): string[] {
    if (entry._tag !== 'quantity') return []
    return entry.units?.flatMap(u => u.symbol ?? []) ?? []
  },

  hasFrench(entry: Entry): boolean {
    return entry.designations.some(d => d.designation.fr?.text) || !!entry.def.fr
  },

  sectionGroup(entry: Entry): string {
    const parts = entry.num.split('.')
    return parts.length > 1 ? parts[0] : entry.num
  },

  shortDef(entry: Entry, maxLen = 140, lang: Lang | 'both' = 'en'): string {
    const l = lang === 'both' ? 'en' : lang
    const defObj = entry.def as unknown as Record<string, string | undefined>
    const raw = (defObj[l] ?? defObj['en'] ?? entry.def.en ?? '').replace(/stem:\[([^\]]+)\]/g, '$1')
    if (raw.length <= maxLen) return raw
    return raw.slice(0, maxLen).replace(/\s\S*$/, '…')
  },
}

// ═══════════════════════════════════════════════════════════════
// Backward-compatible function exports (delegate to models)
// ═══════════════════════════════════════════════════════════════

export function getText(entry: Entry, lang: Lang | 'both'): string {
  return EntryModel.name(entry, lang)
}

export function getDefinition(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
  return EntryModel.definition(entry, lang, cache)
}

export function getRemarks(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
  return EntryModel.remarks(entry, lang, cache)
}

export function getUnitName(entry: Entry, lang: Lang | 'both'): string {
  return EntryModel.unitName(entry, lang)
}

export function getUnitSymbols(entry: Entry): string[] {
  return EntryModel.unitSymbols(entry)
}

// ═══════════════════════════════════════════════════════════════
// DataLoader — lazy loading via import.meta.glob
// ═══════════════════════════════════════════════════════════════

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

const DataLoader = {
  async loadPart(partKey: PartKey): Promise<PartData> {
    const directKey = `./generated/part-${partKey}.ts`
    const loader = partModules[directKey]
    if (loader) {
      const mod = await loader()
      return {
        entries: mod.default,
        editions: mod.editions,
        bilingual: mod.bilingual,
        mathCache: mod.mathCache,
        latexCache: mod.latexCache,
      }
    }
    // Aggregate sub-parts
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
    return { entries, editions: [...new Set(editions)], bilingual, mathCache, latexCache }
  },

  async loadAll(): Promise<Entry[]> {
    const keys = Object.keys(partSummaries)
    const results = await Promise.all(keys.map(pk => DataLoader.loadPart(pk)))
    return results.flatMap(r => r.entries)
  },
}

export async function loadPartEntries(partKey: PartKey): Promise<PartData> {
  return DataLoader.loadPart(partKey)
}

// ═══════════════════════════════════════════════════════════════
// PartMetaStore — generated metadata access
// ═══════════════════════════════════════════════════════════════

const PartMetaStore = {
  availableParts(): PartKey[] {
    return Object.keys(partSummaries).sort(sortPartKey)
  },

  entryCount(partKey: PartKey): number {
    return partSummaries[partKey]?.count ?? 0
  },

  isBilingual(partKey: PartKey): boolean {
    return partSummaries[partKey]?.bilingual ?? false
  },

  domain(partKey: PartKey): Domain | undefined {
    return partSummaries[partKey]?.domain as Domain | undefined
  },

  editions(partKey: PartKey): string[] {
    return partSummaries[partKey]?.editions ?? []
  },
}

export function getAvailableParts(): PartKey[] {
  return PartMetaStore.availableParts()
}

export function partEntryCount(partKey: PartKey): number {
  if (partSummaries[partKey]) return PartMetaStore.entryCount(partKey)
  return getSubKeys(partKey).reduce((s, k) => s + (partSummaries[k]?.count ?? 0), 0)
}

export function getPartEntryCount(partKey: PartKey): number {
  return PartMetaStore.entryCount(partKey)
}

export function isBilingual(partKey: PartKey): boolean {
  return PartMetaStore.isBilingual(partKey)
}

export function getPartEditions(partKey: PartKey): string[] {
  return PartMetaStore.editions(partKey)
}

export { partSummaries }
