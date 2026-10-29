import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RawEntry } from '../types'
import { PART_TITLES } from '../shared'
import { PartCatalog } from '../../src/data/PartCatalog'
import { basePartKey } from '../../src/data/partKey'

export function buildXrefs(
  allEntries: RawEntry[],
  generatedDir: string,
): { xrefMap: Record<string, { href?: string; name: string }>; reverseXref: Record<string, string[]> } {
  const xrefMap: Record<string, { href?: string; name: string }> = {}
  const routablePartKeys = new Set(PartCatalog.getAllParts().map(p => p.partKey))
  const documentPartKeys = new Set(PartCatalog.getAllDocuments().map(d => d.partKey))
  for (const entry of allEntries) {
    const pk = entry.part.toString()
    const routePart = routablePartKeys.has(pk) ? pk : basePartKey(pk)
    const meta = PartCatalog.getPartMeta(routePart)
    const prefix = meta ? (meta.domain === 'math' ? '/math' : '/quantities') : (pk.startsWith('2-') ? '/math' : '/quantities')
    xrefMap[entry.id] = {
      href: `${prefix}/part-${routePart}/${entry.id}`,
      name: entry.designations[0]?.designation.en?.text ?? entry.id,
    }
  }
  for (const [num, title] of Object.entries(PART_TITLES)) {
    if (!documentPartKeys.has(num)) continue
    xrefMap[`iso80000-${num}`] = { href: `/documents/part-${num}`, name: `ISO 80000-${num}: ${title}` }
    xrefMap[`iec80000-${num}`] = { href: `/documents/part-${num}`, name: `IEC 80000-${num}: ${title}` }
  }

  const XREF_RE = /<<([^>]+)>>/g
  const reverseXref: Record<string, string[]> = {}
  for (const entry of allEntries) {
    const texts = [
      entry.def?.en, entry.def?.fr,
      entry.remarks?.en, entry.remarks?.fr,
    ].filter((t): t is string => Boolean(t))
    const referenced = new Set<string>()
    for (const text of texts) {
      const re = new RegExp(XREF_RE.source, XREF_RE.flags)
      let m
      while ((m = re.exec(text)) !== null) {
        const targetId = m[1]
        if (xrefMap[targetId]?.href) referenced.add(targetId)
      }
    }
    for (const targetId of referenced) {
      if (!reverseXref[targetId]) reverseXref[targetId] = []
      reverseXref[targetId].push(entry.id)
    }
  }

  writeFileSync(
    resolve(generatedDir, 'xref-map.ts'),
    `export const xrefMap: Record<string, { href?: string; name: string }> = ${JSON.stringify(xrefMap)}\n`,
  )

  writeFileSync(
    resolve(generatedDir, 'reverse-xref.ts'),
    `export const reverseXref: Record<string, string[]> = ${JSON.stringify(reverseXref)}\n`,
  )

  return { xrefMap, reverseXref }
}
