import { writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RawEntry, PublicationDocumentData } from '../types'
import type { BuildContext } from '../buildContext'
import { PART_TITLES } from '../shared'
import type { Designation, Definition, Remark, ISO80000Unit, DocumentClauseData, DocumentSection } from '../../src/data/types'

function generateIso80000Data(rawEntries: RawEntry[]): {
  termEntries: { id: string; partKey: string; num: string; designations: Designation[]; symbols?: string[]; def: Definition; units?: ISO80000Unit[]; remarks?: Remark; bindingnessType: string; publicationDocument: string }[]
  clauses: { id: string; partKey: string; title: string; sectionNumber: string; bindingnessType: string; parentId: string }[]
  publicationDocuments: PublicationDocumentData[]
} {
  const termEntries = rawEntries.map(e => ({
    id: `term-entry-${e.id}`,
    partKey: e.part.toString(),
    num: e.num,
    designations: e.designations,
    symbols: e.symbols,
    def: e.def,
    units: e.units,
    remarks: e.remarks,
    bindingnessType: 'normative',
    publicationDocument: `iso80000-${e.part}`,
  }))

  const clausesByPart = new Map<string, { id: string; partKey: string; title: string; sectionNumber: string; bindingnessType: string; parentId: string }[]>()
  for (const entry of rawEntries) {
    const pk = entry.part.toString()
    const prefix = entry.num.split('.')[0]
    const clauseId = `clause-${pk}-${prefix}`
    if (!clausesByPart.has(pk)) clausesByPart.set(pk, [])
    const clauses = clausesByPart.get(pk)!
    if (!clauses.find(c => c.id === clauseId)) {
      clauses.push({
        id: clauseId,
        partKey: pk,
        title: `Section ${prefix}`,
        sectionNumber: `${pk}-${prefix}`,
        bindingnessType: 'normative',
        parentId: `iso80000-${pk}`,
      })
    }
  }

  const partsSeen = new Map<string, { editions: Set<string>; count: number }>()
  for (const e of rawEntries) {
    const pk = e.part.toString()
    if (!partsSeen.has(pk)) partsSeen.set(pk, { editions: new Set(), count: 0 })
    const info = partsSeen.get(pk)!
    if (e.edition) info.editions.add(e.edition.toString())
    info.count++
  }

  const publicationDocuments: PublicationDocumentData[] = Array.from(partsSeen.entries()).map(([pk, info]) => ({
    id: `iso80000-${pk}`,
    partKey: pk,
    title: PART_TITLES[pk] || `Part ${pk}`,
    edition: Array.from(info.editions).join(', '),
    publicationType: 'internationalStandard',
    publisher: pk === '13' || pk === '6' ? 'IEC' : 'ISO',
    clauseCount: clausesByPart.get(pk)?.length ?? 0,
    termCount: info.count,
  }))

  return { termEntries, clauses: Array.from(clausesByPart.values()).flat(), publicationDocuments }
}

function detectClauseType(filename: string, title: string): string {
  const lower = (filename + ' ' + title).toLowerCase()
  if (lower.includes('scope')) return 'scope'
  if (lower.includes('norm-refs') || lower.includes('normative reference')) return 'normative-references'
  if (lower.includes('terms')) return 'terms'
  if (lower.includes('definition')) return 'definitions'
  if (lower.includes('foreword') || lower.includes('preface')) return 'foreword'
  if (lower.includes('intro')) return 'introduction'
  if (lower.includes('bibliography')) return 'bibliography'
  if (lower.includes('quantities')) return 'normative'
  if (lower.includes('dimensions')) return 'normative'
  if (lower.includes('units')) return 'normative'
  if (lower.includes('section') || filename.match(/^\d+/)) return 'normative'
  return 'informative'
}

function parseAdocClauses(content: string, partKey: string, filename: string): DocumentClauseData[] {
  const lines = content.split('\n')
  const clauses: DocumentClauseData[] = []
  let currentAnchor = ''

  for (const line of lines) {
    const trimmed = line.trim()
    const anchorMatch = trimmed.match(/^\[\[([^\]]+)\]\]$/)
    if (anchorMatch) { currentAnchor = anchorMatch[1]; continue }
    const headingMatch = trimmed.match(/^(={2,5})\s+(.+)/)
    if (headingMatch && currentAnchor) {
      clauses.push({
        id: `clause-${partKey}-${currentAnchor}`,
        partKey,
        sectionNumber: currentAnchor.replace('cls-', ''),
        title: headingMatch[2].replace(/\[([^\]]*)\]/g, '').trim(),
        anchor: currentAnchor,
        bindingnessType: detectClauseType(filename, headingMatch[2]) === 'informative' ? 'informative' : 'normative',
        parentId: `iso80000-${partKey}`,
        provisionCount: 0,
      })
      currentAnchor = ''
    }
  }
  return clauses
}

function discoverDocumentSections(sourcesDir: string, ctx: BuildContext): DocumentSection[] {
  const sections: DocumentSection[] = []
  if (!existsSync(sourcesDir)) return sections

  const partDirs = readdirSync(sourcesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && (d.name.startsWith('iso-80000-') || d.name.startsWith('iec-80000-')))
    .map(d => d.name)

  for (const dirName of partDirs) {
    const dirPath = resolve(sourcesDir, dirName)
    const match = dirName.match(/(?:iso|iec)-80000-(\d+)/)
    if (!match) continue
    const partKey = match[1]
    if (ctx.isExcluded(partKey)) continue

    const possibleSections = [resolve(dirPath, 'sections'), resolve(dirPath, 'en', 'sections')]
    for (const sectionsPath of possibleSections) {
      if (!existsSync(sectionsPath)) continue
      const files = readdirSync(sectionsPath).filter(f => f.endsWith('.adoc')).sort()
      for (const file of files) {
        const content = readFileSync(resolve(sectionsPath, file), 'utf-8')
        const title = (content.match(/^==\s+(.+)/m) ?? [])[1]?.trim() ?? ''
        sections.push({
          id: `${partKey}-${file.replace('.adoc', '')}`,
          partKey,
          filename: file,
          title,
          content: content.trim(),
          clauseType: detectClauseType(file, title),
        })
      }
      break
    }
  }
  return sections
}

function discoverAllProvisions(sourcesDir: string, ctx: BuildContext): DocumentClauseData[] {
  const allClauses: DocumentClauseData[] = []
  if (!existsSync(sourcesDir)) return allClauses

  const partDirs = readdirSync(sourcesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && (d.name.startsWith('iso-80000-') || d.name.startsWith('iec-80000-')))
    .map(d => d.name)

  for (const dirName of partDirs) {
    const dirPath = resolve(sourcesDir, dirName)
    const match = dirName.match(/(?:iso|iec)-80000-(\d+)/)
    if (!match) continue
    const partKey = match[1]
    if (ctx.isExcluded(partKey)) continue

    const possibleSections = [resolve(dirPath, 'sections'), resolve(dirPath, 'en', 'sections')]
    for (const sectionsPath of possibleSections) {
      if (!existsSync(sectionsPath)) continue
      const files = readdirSync(sectionsPath).filter(f => f.endsWith('.adoc')).sort()
      for (const file of files) {
        const content = readFileSync(resolve(sectionsPath, file), 'utf-8')
        allClauses.push(...parseAdocClauses(content, partKey, file))
      }
      break
    }
  }
  return allClauses
}

export function buildDocuments(
  allEntries: RawEntry[],
  sourcesDir: string,
  generatedDir: string,
  ctx: BuildContext,
): void {
  const iso80000Data = generateIso80000Data(allEntries)
  const docSections = discoverDocumentSections(sourcesDir, ctx)
  const docClauses = discoverAllProvisions(sourcesDir, ctx)

  writeFileSync(
    resolve(generatedDir, 'iso80000-terms.ts'),
    `export const termEntries = ${JSON.stringify(iso80000Data.termEntries)}\n`,
  )

  writeFileSync(
    resolve(generatedDir, 'iso80000.ts'),
    `import type { DocumentClauseData } from '../types'\n`
    + `export const clauses = ${JSON.stringify(iso80000Data.clauses)}\n`
    + `export const publicationDocuments = ${JSON.stringify(iso80000Data.publicationDocuments)}\n`
    + `export const documentClauses = ${JSON.stringify(docClauses)} as DocumentClauseData[]\n`,
  )

  writeFileSync(
    resolve(generatedDir, 'sections.ts'),
    `export const sections = ${JSON.stringify(docSections)}\n`,
  )
}
