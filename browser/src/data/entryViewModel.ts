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
import { renderInline } from './asciidoc'
import { sectionLabel as formatSectionLabel } from './partKey'
import { reverseXref } from './generated/reverse-xref'
import { xrefMap } from './generated/xref-map'
import { units } from './generated/unitsdb'
import {
  accentGlow,
  accentGradient,
  accentColors,
  accentHeaderBg,
} from '../composables/useAccent'

const unitSlugMap = new Map(units.map(u => [u.name, u.slug]))

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

export interface EntryAccentStyle {
  symbolGlow: { boxShadow: string }
  heroGlow: Record<string, string>
  defAccentStyle: { background: string }
  showcasePattern: { backgroundImage: string; backgroundSize: string }
  headerBg: Record<string, string>
  accentFrom: string
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
  remHtml: string
  renderedNameHtml: string
  accent: EntryAccentStyle
}

export interface EntryViewCaches {
  mathCache: Record<string, string>
  latexCache: Record<string, string>
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

  // Siblings
  const idx = entries.findIndex(e => e.id === entry.id)
  const siblings: SiblingNav = {
    prev: idx > 0 ? entries[idx - 1] : null,
    next: idx < entries.length - 1 ? entries[idx + 1] : null,
    idx: idx + 1,
    total: entries.length,
  }

  // Section entries
  const sectionGroup = EntryModel.sectionGroup(entry)
  const sectionEntries = entries.filter(e => EntryModel.sectionGroup(e) === sectionGroup)

  // Referenced by
  const refIds = reverseXref[entry.id] ?? []
  const referencedBy: ReferencedBy[] = refIds
    .map((id: string) => {
      const ref = xrefMap[id]
      return ref ? { id, name: ref.name, href: ref.href } : null
    })
    .filter(Boolean) as ReferencedBy[]

  // JSON-LD
  const jsonLd = generateEntryJsonLd(entry, meta, edition)

  // Dual URN
  const dualUrn = entryDualUrn(entry, partKey, edition)

  // Rendered content
  const defHtml = EntryModel.definition(entry, 'en', caches.mathCache)
  const remHtml = EntryModel.remarks(entry, 'en', caches.mathCache)
  const renderedNameHtml = EntryModel.renderedName(entry, 'en', caches.mathCache)

  // Accent styles
  const accentFrom = accentColors(meta).from
  const accent: EntryAccentStyle = {
    symbolGlow: {
      boxShadow: `0 0 32px ${accentFrom}18, 0 0 64px ${accentFrom}0a`,
    },
    heroGlow: accentGlow(meta, 0.05, 180),
    defAccentStyle: { background: accentGradient(meta, 160) },
    showcasePattern: {
      backgroundImage: `radial-gradient(circle 1px at center, ${accentFrom}08 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    },
    headerBg: accentHeaderBg(meta),
    accentFrom,
  }

  // Part label
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
    remHtml,
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
