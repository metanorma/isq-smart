/**
 * Shared view model for entry detail pages.
 *
 * Both `/quantities/part-[part]/[id].astro` and `/math/part-[part]/[id].astro`
 * resolve the same set of derived data from raw inputs. This pure function
 * centralizes that resolution so it is testable without Astro or Vue.
 */
import type { Entry, PartMeta, Domain } from './types'
import { EntryModel } from './EntryModel'
import { generateEntryJsonLd } from './serialization'
import { entryDualUrn } from './urn'
import { sectionLabel as formatSectionLabel } from './partKey'
import { reverseXref } from './generated/reverse-xref'
import { xrefMap } from './generated/xref-map'
import { units } from './generated/unitsdb'
import { EntryContentRenderer, type EntryViewCaches } from './EntryContentRenderer'
import { EntryAccentResolver, type EntryAccentStyle } from './EntryAccentResolver'
import { renderInline } from './asciidoc'

const unitSlugMap = new Map(units.map(u => [u.name, u.slug]))

export type { EntryViewCaches, EntryAccentStyle }
export { EntryContentRenderer, EntryAccentResolver }

export interface ReferencedBy {
  id: string
  name: string
  href: string
}

export interface SiblingNav {
  prev: Entry | null
  next: Entry | null
  idx: number
  total: number
}

export interface EntryDetailView {
  entry: Entry
  meta: PartMeta
  domain: Domain
  partKey: string
  edition: string
  bilingual: boolean
  partLabel: string
  siblings: SiblingNav
  sectionEntries: Entry[]
  sectionLabel: string
  referencedBy: ReferencedBy[]
  jsonLd: ReturnType<typeof generateEntryJsonLd>
  dualUrn: { iso: string; iec: string }
  defHtml: string
  defHtmlFr: string
  remHtml: string
  remHtmlFr: string
  renderedNameHtml: string
  accent: EntryAccentStyle
}

/**
 * Resolve all derived data for an entry detail page.
 *
 * Pure function — no DOM access, no Astro-specific APIs.
 */
export function resolveEntryDetailView(
  entry: Entry,
  partKey: string,
  meta: PartMeta,
  domain: Domain,
  editions: string[],
  bilingual: boolean,
  entries: Entry[],
  caches: EntryViewCaches,
): EntryDetailView {
  const edition = editions.join(', ')

  const idx = entries.findIndex(e => e.id === entry.id)
  const siblings: SiblingNav = {
    prev: idx > 0 ? entries[idx - 1] : null,
    next: idx < entries.length - 1 ? entries[idx + 1] : null,
    idx: idx + 1,
    total: entries.length,
  }

  const sectionGroup = EntryModel.sectionGroup(entry)
  const sectionEntries = entries.filter(e => EntryModel.sectionGroup(e) === sectionGroup)

  const refIds = reverseXref[entry.id] ?? []
  const referencedBy: ReferencedBy[] = refIds
    .map((id: string) => {
      const ref = xrefMap[id]
      return ref ? { id, name: ref.name, href: ref.href } : null
    })
    .filter(Boolean) as ReferencedBy[]

  const jsonLd = generateEntryJsonLd(entry, meta, edition)
  const dualUrn = entryDualUrn(entry, partKey, edition)

  const renderer = new EntryContentRenderer(caches)
  const defHtml = renderer.definition(entry, 'en')
  const defHtmlFr = bilingual ? renderer.definition(entry, 'fr') : ''
  const remHtml = renderer.remarks(entry, 'en')
  const remHtmlFr = bilingual ? renderer.remarks(entry, 'fr') : ''
  const renderedNameHtml = renderer.renderedName(entry, 'en')

  const accent = new EntryAccentResolver().resolve(meta)

  const partLabel = meta.parentPart
    ? `Part ${meta.parentPart} ${formatSectionLabel(partKey)}`
    : `Part ${partKey}`

  return {
    entry,
    meta,
    domain,
    partKey,
    edition,
    bilingual,
    partLabel,
    siblings,
    sectionEntries,
    sectionLabel: sectionGroup,
    referencedBy,
    jsonLd,
    dualUrn,
    defHtml,
    defHtmlFr,
    remHtml,
    remHtmlFr,
    renderedNameHtml,
    accent,
  }
}

/**
 * Strip stem:[...] wrapper to get the raw expression.
 */
export function stripStem(text: string): string {
  return text.replace(/stem:\[([^\]]+)\]/g, (_, expr) => expr.replace(/^"|"$/g, ''))
}

/**
 * Render inline AsciiDoc (stem notation) to HTML for designation text.
 */
export function renderDesignationText(text: string, mathCache: Record<string, string>): string {
  return renderInline(text, mathCache)
}

/**
 * Resolve a unit name to its browser link.
 */
export function unitLink(name: string): string {
  const slug = unitSlugMap.get(name)
  return slug ? `/units/${slug}` : `/units?q=${encodeURIComponent(name)}`
}
