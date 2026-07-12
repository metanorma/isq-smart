import type { Entry, Lang } from './types'
import { render as renderAsciiDoc, renderInline } from './asciidoc'
import { xrefMap } from './generated/xref-map'

function renderStem(text: string, cache: Record<string, string>): string {
  return renderAsciiDoc(text, cache, xrefMap)
}

/** Resolve 'both' to 'en' as the single-locale fallback. */
function resolveLang(lang: Lang | 'both'): Lang {
  return lang === 'both' ? 'en' : lang
}

export function entryName(entry: Entry, lang: Lang | 'both'): string {
  if (lang === 'both') {
    const en = entry.designations.map(d => d.designation.en?.text).filter(Boolean).join(', ')
    const fr = entry.designations.map(d => d.designation.fr?.text).filter(Boolean).join(', ')
    if (fr && fr !== en) return `${en} / ${fr}`
    return en
  }
  return entry.designations
    .map(d => d.designation[lang]?.text).filter(Boolean).join(', ')
}

export function entryRenderedName(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
  const plain = entryName(entry, lang)
  return renderInline(plain, cache)
}

export function entryDefinition(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
  const l = resolveLang(lang)
  const def = entry.def as unknown as Record<string, string>
  const raw = def[l] ?? def.en ?? entry.def.en
  return renderStem(raw, cache)
}

export function entryRemarks(entry: Entry, lang: Lang | 'both', cache: Record<string, string>): string {
  if (!entry.remarks) return ''
  const l = resolveLang(lang)
  const rem = entry.remarks as unknown as Record<string, string>
  const raw = rem[l] ?? (entry.remarks as unknown as Record<string, string>).en
  return raw ? renderStem(raw, cache) : ''
}

export function entryUnitName(entry: Entry, lang: Lang | 'both'): string {
  if (entry._tag !== 'quantity') return ''
  const l = resolveLang(lang)
  return entry.units?.map(u => {
    const um = u as unknown as Record<string, string>
    return um[l] ?? um.en ?? u.en
  }).join(', ') ?? ''
}

export function entryUnitSymbols(entry: Entry): string[] {
  if (entry._tag !== 'quantity') return []
  return entry.units?.flatMap(u => u.symbol ?? []) ?? []
}

export function entryHasFrench(entry: Entry): boolean {
  return entry.designations.some(d => d.designation.fr?.text) || !!entry.def.fr
}

export function entrySectionGroup(entry: Entry): string {
  const parts = entry.num.split('.')
  return parts.length > 1 ? parts[0] : entry.num
}

export function entryShortDef(entry: Entry, maxLen = 140, lang: Lang | 'both' = 'en'): string {
  const l = resolveLang(lang)
  const defObj = entry.def as unknown as Record<string, string | undefined>
  const raw = (defObj[l] ?? defObj['en'] ?? entry.def.en ?? '')
    .replace(/\[stem[^\]]*\]\n\+{4}\n[\s\S]*?\+{4}\n?/g, '')
    .replace(/stem:\[([^\]]+)\]\s*::\s*/g, '')
    .replace(/stem:\[([^\]]+)\]/g, '')
    .replace(/<<([^>,>]+)(?:,[^>]*)?>>/g, '$1')
    .replace(/::\s*/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!raw) return ''
  if (raw.length <= maxLen) return raw
  return raw.slice(0, maxLen).replace(/\s\S*$/, '…')
}

export function entryPlainName(entry: Entry, lang: Lang | 'both'): string {
  return entryName(entry, lang).replace(/stem:\[([^\]]+)\]/g, (_, expr) => expr.replace(/^"|"$/g, ''))
}

// ── Backward-compat object wrapper ──
// Callers can use either the standalone functions above or this object.
export const EntryModel = {
  name: entryName,
  renderedName: entryRenderedName,
  definition: entryDefinition,
  remarks: entryRemarks,
  unitName: entryUnitName,
  unitSymbols: entryUnitSymbols,
  hasFrench: entryHasFrench,
  sectionGroup: entrySectionGroup,
  shortDef: entryShortDef,
  plainName: entryPlainName,
}
