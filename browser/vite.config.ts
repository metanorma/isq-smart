import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import { SiteConfig } from './src/site.config'

// ── Domain index: lightweight entry summary for fast domain browsing ──

interface DomainEntry {
  i: string   // id
  n: string   // num
  t: string   // title/name
  s: string[] // symbols
  u: string[] // unit symbols
  p: string   // partKey
}

interface RawDesignationLang {
  text: string
  index_as?: string[]
  noun?: string
  gender?: string
  adj?: string
}

interface RawDesignation {
  designation: {
    en?: RawDesignationLang
    fr?: RawDesignationLang
  }
}

interface RawDefinition {
  en: string
  fr?: string
}

interface RawRemark {
  en: string
  fr?: string
}

interface RawUnit {
  en: string
  fr?: string
  symbol?: string[]
}

interface RawEntry {
  part: number | string
  edition?: string | number
  id: string
  num: string
  oldnum?: string
  designations: RawDesignation[]
  symbols?: string[]
  def: RawDefinition
  units?: RawUnit[]
  remarks?: RawRemark
}

// ISO/IEC 80000 data types
interface TermEntryData {
  id: string
  partKey: string
  num: string
  designations: RawDesignation[]
  symbols?: string[]
  def: RawDefinition
  units?: RawUnit[]
  remarks?: RawRemark
  bindingnessType: string
  publicationDocument: string
}

interface ClauseData {
  id: string
  partKey: string
  title: string
  sectionNumber: string
  bindingnessType: string
  parentId: string
}

interface PublicationDocumentData {
  id: string
  partKey: string
  title: string
  edition: string
  publicationType: string
  publisher: string
  clauseCount: number
  termCount: number
}

interface DocumentSection {
  id: string
  partKey: string
  filename: string
  title: string
  content: string
  clauseType: string
}

interface ParsedClause {
  id: string
  partKey: string
  sectionNumber: string
  title: string
  anchor: string
  bindingnessType: string
  parentId: string
  provisionCount: number
}

// ── Build-time part exclusion (delegates to site.config.ts) ──

const isExcluded = SiteConfig.isExcluded

// ── Data source paths (env-var configurable, defaults to subdirectories of repo root) ──
//   For CI: repos are checked out as workspace subdirectories (GHA can't go above workspace)
//   For local dev: clone or symlink as subdirectories, or set env vars to sibling paths
const repoRoot = resolve(__dirname, '..')
const isoIec80000Dir = resolve(repoRoot, process.env.ISO_80000_DIR || 'iso-iec-80000')
const unitsdbDir = resolve(repoRoot, process.env.UNITSDB_DIR || 'unitsdb')
const sduSmartDir = resolve(repoRoot, process.env.SDU_SMART_DIR || 'sdu-smart')

const datasetDir = resolve(isoIec80000Dir, 'sources/dataset')
const sourcesDir = resolve(isoIec80000Dir, 'sources')
const generatedDir = resolve(__dirname, 'src/data/generated')
const ontologySrcDir = resolve(__dirname, 'public/ontologies')
const ontologyRefDir = resolve(sduSmartDir, 'reference-docs/smartsdu-information-model-share-c6362d946900/information_model')

const missingRepos: string[] = []
if (!existsSync(isoIec80000Dir)) missingRepos.push('metanorma/iso-iec-80000')
if (!existsSync(unitsdbDir)) missingRepos.push('unitsml/unitsdb')
if (!existsSync(sduSmartDir)) missingRepos.push('metanorma/sdu-smart')
if (missingRepos.length) {
  console.error(`\n[isq-smart] Missing data repos. Clone them into the repo root:\n`)
  for (const repo of missingRepos) console.error(`  git clone https://github.com/${repo}.git`)
  console.error(`\n  Or set env vars: ISO_80000_DIR, UNITSDB_DIR, SDU_SMART_DIR\n`)
  process.exit(1)
}

const PART_TITLES: Record<string, string> = {
  '1': 'General', '2': 'Mathematics', '3': 'Space and time',
  '4': 'Mechanics', '5': 'Thermodynamics', '6': 'Electromagnetism',
  '7': 'Light', '8': 'Acoustics', '9': 'Physical chemistry and molecular physics',
  '10': 'Atomic and nuclear physics', '11': 'Characteristic numbers',
  '12': 'Condensed matter physics', '13': 'Information science',
}

// ── Build pipeline models ──

const MathCollector = {
  collect(entries: RawEntry[]): Set<string> {
    const exprs = new Set<string>()
    const stemRe = /stem:\[([^\]]+)\]/g
    const blockRe = /\[stem%unnumbered\]\n\+{4}\n([\s\S]*?)\n\+{4}/g
    const stemWrap = /^stem:\[([^\]]+)\]$/

    const collectFrom = (obj: Record<string, string | undefined> | undefined) => {
      if (!obj) return
      for (const text of Object.values(obj)) {
        if (typeof text !== 'string') continue
        stemRe.lastIndex = 0
        let m
        while ((m = stemRe.exec(text)) !== null) exprs.add(m[1])
        blockRe.lastIndex = 0
        while ((m = blockRe.exec(text)) !== null) exprs.add(m[1].trim())
      }
    }

    for (const entry of entries) {
      entry.symbols?.forEach(s => {
        const unwrapped = s.replace(stemWrap, '$1')
        exprs.add(unwrapped)
      })
      entry.units?.forEach(u => u.symbol?.forEach(s => exprs.add(s.replace(stemWrap, '$1'))))
      collectFrom(entry.def as unknown as Record<string, string | undefined>)
      if (entry.remarks) collectFrom(entry.remarks as unknown as Record<string, string | undefined>)
    }
    return exprs
  },

  async render(exprs: Set<string>): Promise<{ mathml: Record<string, string>; latex: Record<string, string> }> {
    const mathml: Record<string, string> = {}
    const latex: Record<string, string> = {}
    const decodeEntities = (s: string) => s.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    try {
      const { default: Plurimath } = await import('@plurimath/plurimath')
      for (const expr of exprs) {
        try {
          const decoded = decodeEntities(expr)
          const f = new Plurimath(decoded, 'asciimath')
          mathml[expr] = f.toMathml().replace('display="block"', 'display="inline"')
          latex[expr] = f.toLatex()
        } catch { mathml[expr] = ''; latex[expr] = '' }
      }
    } catch { /* Plurimath unavailable */ }
    return { mathml, latex }
  },
}

const PartWriter = {
  sortKeys(keys: Set<string>): string[] {
    return Array.from(keys).sort((a, b) => {
      const pa = a.includes('-') ? a.split('-').map(Number) : [Number(a), 0]
      const pb = b.includes('-') ? b.split('-').map(Number) : [Number(b), 0]
      return pa[0] !== pb[0] ? pa[0] - pb[0] : pa[1] - pb[1]
    })
  },

  write(
    partKey: string,
    domain: 'quantities' | 'math',
    rawEntries: RawEntry[],
    globalMathCache: Record<string, string>,
    globalLatexCache: Record<string, string>,
    partExprs: Set<string>,
    summaries: Record<string, { domain: string; count: number; bilingual: boolean; editions: string[] }>,
    routes: Set<string>,
  ) {
    const tag = domain === 'quantities' ? 'quantity' : 'math'
    const STEM_WRAP = /^stem:\[([^\]]+)\]$/
    const entries = rawEntries.map(e => {
      const { part, ...rest } = e
      return {
        _tag: tag,
        partKey: part.toString(),
        ...rest,
        symbols: rest.symbols?.map(s => s.replace(STEM_WRAP, '$1')),
      }
    })

    const editions = [...new Set(rawEntries.map(e => e.edition?.toString()).filter((v): v is string => Boolean(v)))]
    const bilingual = domain === 'quantities' && rawEntries.some(e => e.def?.fr || e.remarks?.fr)

    const partMathCache: Record<string, string> = {}
    const partLatexCache: Record<string, string> = {}
    for (const expr of partExprs) {
      if (globalMathCache[expr]) partMathCache[expr] = globalMathCache[expr]
      if (globalLatexCache[expr]) partLatexCache[expr] = globalLatexCache[expr]
    }

    summaries[partKey] = { domain, count: entries.length, bilingual, editions }

    const prefix = domain === 'math' ? '/math' : '/quantities'
    routes.add(`${prefix}/part-${partKey}`)
    for (const entry of entries) routes.add(`${prefix}/part-${partKey}/${(entry as { id: string }).id}`)

    if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })

    writeFileSync(
      resolve(generatedDir, `part-${partKey}.ts`),
      `import type { Entry } from '../types'\n`
      + `export default ${JSON.stringify(entries)} as Entry[]\n`
      + `export const editions = ${JSON.stringify(editions)} as string[]\n`
      + `export const bilingual = ${bilingual}\n`
      + `export const mathCache = ${JSON.stringify(partMathCache)} as Record<string, string>\n`
      + `export const latexCache = ${JSON.stringify(partLatexCache)} as Record<string, string>\n`,
    )
  },
}

function parseAdocClauses(content: string, partKey: string, filename: string): {
  clauses: ParsedClause[]
} {
  const lines = content.split('\n')
  const clauses: ParsedClause[] = []

  let currentAnchor = ''
  let currentTitle = ''

  const bindingness = detectClauseType(filename, currentTitle) === 'informative' ? 'informative' : 'normative'

  for (const line of lines) {
    const trimmed = line.trim()

    const anchorMatch = trimmed.match(/^\[\[([^\]]+)\]\]$/)
    if (anchorMatch) {
      currentAnchor = anchorMatch[1]
      continue
    }

    const headingMatch = trimmed.match(/^(={2,5})\s+(.+)/)
    if (headingMatch) {
      currentTitle = headingMatch[2].replace(/\[([^\]]*)\]/g, '').trim()
      if (currentAnchor) {
        clauses.push({
          id: `clause-${partKey}-${currentAnchor}`,
          partKey,
          sectionNumber: currentAnchor.replace('cls-', ''),
          title: currentTitle,
          anchor: currentAnchor,
          bindingnessType: bindingness,
          parentId: `iso80000-${partKey}`,
          provisionCount: 0,
        })
      }
    }
  }

  return { clauses }
}

function discoverAllProvisions(): {
  clauses: ParsedClause[]
} {
  const allClauses: ParsedClause[] = []

  if (!existsSync(sourcesDir)) return { clauses: allClauses }

  const partDirs = readdirSync(sourcesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && (d.name.startsWith('iso-80000-') || d.name.startsWith('iec-80000-')))
    .map(d => d.name)

  for (const dirName of partDirs) {
    const dirPath = resolve(sourcesDir, dirName)
    const match = dirName.match(/(?:iso|iec)-80000-(\d+)/)
    if (!match) continue
    const partKey = match[1]
    if (isExcluded(partKey)) continue

    const possibleSections = [
      resolve(dirPath, 'sections'),
      resolve(dirPath, 'en', 'sections'),
    ]

    for (const sectionsPath of possibleSections) {
      if (!existsSync(sectionsPath)) continue
      const files = readdirSync(sectionsPath).filter(f => f.endsWith('.adoc')).sort()
      for (const file of files) {
        const content = readFileSync(resolve(sectionsPath, file), 'utf-8')
        const { clauses } = parseAdocClauses(content, partKey, file)
        allClauses.push(...clauses)
      }
      break
    }
  }

  return { clauses: allClauses }
}

function parseAsciiDocTitle(content: string): string {
  const match = content.match(/^==\s+(.+)/m)
  return match ? match[1].trim() : ''
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

function discoverDocumentSections(): DocumentSection[] {
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
    if (isExcluded(partKey)) continue

    // Find sections directory (may be in en/ or root)
    const possibleSections = [
      resolve(dirPath, 'sections'),
      resolve(dirPath, 'en', 'sections'),
    ]

    for (const sectionsPath of possibleSections) {
      if (!existsSync(sectionsPath)) continue
      const files = readdirSync(sectionsPath).filter(f => f.endsWith('.adoc')).sort()
      for (const file of files) {
        const content = readFileSync(resolve(sectionsPath, file), 'utf-8')
        const title = parseAsciiDocTitle(content)
        sections.push({
          id: `${partKey}-${file.replace('.adoc', '')}`,
          partKey,
          filename: file,
          title,
          content: content.trim(),
          clauseType: detectClauseType(file, title),
        })
      }
      break // Only use the first found sections directory
    }
  }
  return sections
}

function generateIso80000Data(rawEntries: RawEntry[]): {
  termEntries: TermEntryData[]
  clauses: ClauseData[]
  publicationDocuments: PublicationDocumentData[]
} {
  const termEntries: TermEntryData[] = rawEntries.map(e => ({
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

  // Group by part to create clauses
  const clausesByPart = new Map<string, ClauseData[]>()
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

  // Build publication documents
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
    publicationType: pk === '13' || pk === '6' ? 'internationalStandard' : 'internationalStandard',
    publisher: pk === '13' || pk === '6' ? 'IEC' : 'ISO',
    clauseCount: clausesByPart.get(pk)?.length ?? 0,
    termCount: info.count,
  }))

  return { termEntries, clauses: Array.from(clausesByPart.values()).flat(), publicationDocuments }
}

function yamlDataPlugin(): Plugin {
  function loadAllData(): { quantities: RawEntry[]; math: RawEntry[] } {
    const load = (file: string) =>
      yaml.load(readFileSync(resolve(datasetDir, file), 'utf-8')) as RawEntry[]
    return { quantities: load('quantities.yaml'), math: load('math.yaml') }
  }

  async function generateFiles() {
    const rawData = loadAllData()
    const allEntries = [...rawData.quantities, ...rawData.math].filter(e => !isExcluded(e.part.toString()))

    // Render all math expressions via Plurimath
    const allExprs = MathCollector.collect(allEntries)
    const { mathml: globalMathCache, latex: globalLatexCache } = await MathCollector.render(allExprs)

    const iso80000Data = generateIso80000Data(allEntries)

    if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })

    // Clean stale generated files (e.g. excluded parts from previous builds)
    for (const f of readdirSync(generatedDir)) {
      if (f.endsWith('.ts')) {
        const match = f.match(/^part-(.+)\.ts$/)
        if (match && isExcluded(match[1])) {
          unlinkSync(resolve(generatedDir, f))
        }
      }
    }

    // Discover document sections
    const docSections = discoverDocumentSections()

    // Per-part data files with mathCache/latexCache/editions/bilingual
    const summaries: Record<string, { domain: string; count: number; bilingual: boolean; editions: string[] }> = {}
    const routes = new Set<string>(['/', '/quantities', '/reference', '/units', '/dimensions', '/smartsdu'])

    const qParts = PartWriter.sortKeys(new Set(rawData.quantities.map(e => e.part.toString()))).filter(pk => !isExcluded(pk))
    for (const pk of qParts) {
      const partEntries = rawData.quantities.filter(e => e.part.toString() === pk)
      const partExprs = MathCollector.collect(partEntries)
      PartWriter.write(pk, 'quantities', partEntries, globalMathCache, globalLatexCache, partExprs, summaries, routes)
    }

    const mParts = PartWriter.sortKeys(new Set(rawData.math.map(e => e.part.toString()))).filter(pk => !isExcluded(pk))
    for (const pk of mParts) {
      const partEntries = rawData.math.filter(e => e.part.toString() === pk)
      const partExprs = MathCollector.collect(partEntries)
      PartWriter.write(pk, 'math', partEntries, globalMathCache, globalLatexCache, partExprs, summaries, routes)
    }

    if (mParts.length) routes.add('/math')

    // ISO/IEC 80000 instance data (quantities, documents)
    const { clauses: docClauses } = discoverAllProvisions()

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

    // Document sections
    writeFileSync(
      resolve(generatedDir, 'sections.ts'),
      `export const sections = ${JSON.stringify(docSections)}\n`,
    )

    // Meta with bilingual and editions
    writeFileSync(
      resolve(generatedDir, 'meta.ts'),
      `import type { PartSummary } from '../types'\n`
      + `export const partSummaries = ${JSON.stringify(summaries)} as Record<string, PartSummary>\n`,
    )

    // ── UnitsDB: units + dimensions from quantity entry data ──
    const qData = rawData.quantities

    const unitsByName = new Map<string, { name: string; symbols: Set<string>; quantities: { id: string; num: string; name: string; part: string }[]; parts: Set<string> }>()
    for (const e of qData) {
      for (const u of (e.units ?? [])) {
        if (!unitsByName.has(u.en)) {
          unitsByName.set(u.en, { name: u.en, symbols: new Set(), quantities: [], parts: new Set() })
        }
        const entry = unitsByName.get(u.en)!
        for (const s of (u.symbol ?? [])) entry.symbols.add(s)
        entry.quantities.push({
          id: e.id,
          num: e.num,
          name: e.designations[0]?.designation.en?.text ?? '',
          part: e.part.toString(),
        })
        entry.parts.add(e.part.toString())
      }
    }

    const isoUnits = Array.from(unitsByName.values()).map(u => {
      const slug = u.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return {
        slug,
        name: u.name,
        symbols: Array.from(u.symbols),
        quantityCount: u.quantities.length,
        parts: Array.from(u.parts).sort((a, b) => {
          const pa = a.includes('-') ? a.split('-').map(Number) : [Number(a), 0]
          const pb = b.includes('-') ? b.split('-').map(Number) : [Number(b), 0]
          return pa[0] !== pb[0] ? pa[0] - pb[0] : pa[1] - pb[1]
        }),
        sampleQuantities: u.quantities.slice(0, 3),
        quantities: u.quantities,
      }
    })

    // Add unit detail routes
    for (const u of isoUnits) routes.add(`/units/${u.slug}`)

    // ── Enrich units with UnitsML identifiers ──
    const unitsmlUnitsPath = resolve(unitsdbDir, 'units.yaml')
    if (existsSync(unitsmlUnitsPath)) {
      const rawUnitsmlUnits = (yaml.load(readFileSync(unitsmlUnitsPath, 'utf-8')) as any).units as any[]
      const unitsByNameKey = new Map<string, any>()
      for (const u of rawUnitsmlUnits) {
        const enName = u.names?.find((n: any) => n.lang === 'en')?.value
        if (enName) unitsByNameKey.set(enName.toLowerCase(), u)
      }
      for (const u of isoUnits) {
        const uml = unitsByNameKey.get(u.name.toLowerCase())
        if (!uml) continue
        const nistId = uml.identifiers?.find((i: any) => i.type === 'nist')?.id
        const unitsmlId = uml.identifiers?.find((i: any) => i.type === 'unitsml')?.id
        const refs: { authority: string; uri: string; type: string }[] = []
        for (const r of uml.references ?? []) {
          refs.push({ authority: r.authority, uri: r.uri, type: r.type })
        }
        const unitSystems = (uml.unit_system_reference ?? []).map((r: any) => r.id ?? r.type)
        const scaleRef = uml.scale_reference?.id
        const root = !!uml.root
        const quantityRefs = (uml.quantity_references ?? []).map((r: any) => r.id)
        Object.assign(u, { nistId, unitsmlId, refs, unitSystems, scaleRef, root, quantityRefs })
      }
    }

    const dimsByPart = new Map<string, { partKey: string; entries: { num: string; name: string; symbols: string[]; unitSymbols: string[] }[] }>()
    for (const e of qData) {
      const pk = e.part.toString()
      if (!dimsByPart.has(pk)) dimsByPart.set(pk, { partKey: pk, entries: [] })
      const group = dimsByPart.get(pk)!
      group.entries.push({
        num: e.num,
        name: e.designations[0]?.designation.en?.text ?? '',
        symbols: e.symbols ?? [],
        unitSymbols: (e.units ?? []).flatMap(u => u.symbol ?? []),
      })
    }

    const isoDimensions = Array.from(dimsByPart.values()).map(d => ({
      partKey: d.partKey,
      count: d.entries.length,
      sampleEntries: d.entries.slice(0, 5),
    }))

    // ── UnitsML Dimensions (from unitsml/unitsdb) ──
    interface UnitsmlDimRef { type: string; id: string }
    interface UnitsmlDimName { value: string; lang: string }
    interface UnitsmlDimSymbol { latex?: string; unicode?: string; ascii?: string; mathml?: string; id: string }
    interface UnitsmlBaseDim { power: number; symbol: string; symbols?: UnitsmlDimSymbol[] }
    interface UnitsmlDimRef2 { type: string; authority: string; uri: string }
    interface UnitsmlDimension {
      identifiers: UnitsmlDimRef[]
      names: UnitsmlDimName[]
      short: string
      dimensionless?: boolean
      length?: UnitsmlBaseDim
      mass?: UnitsmlBaseDim
      time?: UnitsmlBaseDim
      electric_current?: UnitsmlBaseDim
      thermodynamic_temperature?: UnitsmlBaseDim
      amount_of_substance?: UnitsmlBaseDim
      luminous_intensity?: UnitsmlBaseDim
      plane_angle?: UnitsmlBaseDim
      references?: UnitsmlDimRef2[]
    }
    interface UnitsmlQuantity {
      dimension_reference: { type: string; id: string }
      identifiers: UnitsmlDimRef[]
      names: UnitsmlDimName[]
      short: string
      quantity_type: string
      references?: UnitsmlDimRef2[]
    }

    const BASE_DIMS = ['length', 'mass', 'time', 'electric_current', 'thermodynamic_temperature', 'amount_of_substance', 'luminous_intensity', 'plane_angle'] as const
    const DIM_SYMBOLS: Record<string, string> = {
      length: 'L', mass: 'M', time: 'T', electric_current: 'I',
      thermodynamic_temperature: 'Θ', amount_of_substance: 'N', luminous_intensity: 'J', plane_angle: 'φ',
    }

    function dimensionVector(dim: UnitsmlDimension): { base: string; power: number }[] {
      return BASE_DIMS
        .filter(k => dim[k])
        .map(k => ({ base: DIM_SYMBOLS[k], power: dim[k]!.power }))
    }

    function formatVector(vec: { base: string; power: number }[]): string {
      if (vec.length === 0) return '1'
      return vec.map(d => d.power === 1 ? d.base : `${d.base}${superscript(d.power)}`).join(' ')
    }

    function superscript(n: number): string {
      const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
      const sign = n < 0 ? '⁻' : ''
      return sign + String(Math.abs(n)).split('').map(c => sup[parseInt(c)]).join('')
    }

    // Build ISO 80000 quantity name → entry lookup (for linkage)
    const isoQuantityByName = new Map<string, { id: string; num: string; name: string; part: string }[]>()
    for (const u of isoUnits) {
      for (const q of u.quantities) {
        const key = q.name.toLowerCase().replace(/ <.*>/, '')
        if (!isoQuantityByName.has(key)) isoQuantityByName.set(key, [])
        isoQuantityByName.get(key)!.push(q)
      }
    }

    let physicalDimensions: any[] = []
    const unitsmlDimsPath = resolve(unitsdbDir, 'dimensions.yaml')
    const unitsmlQuantitiesPath = resolve(unitsdbDir, 'quantities.yaml')

    if (existsSync(unitsmlDimsPath) && existsSync(unitsmlQuantitiesPath)) {
      const rawDims = (yaml.load(readFileSync(unitsmlDimsPath, 'utf-8')) as any).dimensions as UnitsmlDimension[]
      const rawQuants = (yaml.load(readFileSync(unitsmlQuantitiesPath, 'utf-8')) as any).quantities as UnitsmlQuantity[]

      // Build NISTd ID → dimension lookup
      const dimByNistId = new Map<string, UnitsmlDimension>()
      for (const d of rawDims) {
        const nistId = d.identifiers.find(i => i.type === 'nist')?.id
        if (nistId) dimByNistId.set(nistId, d)
      }

      // Build NISTd ID → UnitsML quantity names
      const dimQuantNames = new Map<string, string[]>()
      for (const q of rawQuants) {
        const nistDimId = q.dimension_reference.id
        if (!dimQuantNames.has(nistDimId)) dimQuantNames.set(nistDimId, [])
        dimQuantNames.get(nistDimId)!.push(q.short)
      }

      // Build ISO quantity name → unit slug lookup
      const isoUnitByName = new Map<string, string[]>()
      for (const u of isoUnits) {
        for (const q of u.quantities) {
          const key = q.name.toLowerCase().replace(/ <.*>/, '')
          if (!isoUnitByName.has(key)) isoUnitByName.set(key, [])
          isoUnitByName.get(key)!.push(u.slug)
        }
      }

      physicalDimensions = rawDims.map(d => {
        const nistId = d.identifiers.find(i => i.type === 'nist')?.id ?? ''
        const unitsmlId = d.identifiers.find(i => i.type === 'unitsml')?.id ?? ''
        const name = d.names.find(n => n.lang === 'en')?.value ?? d.short
        const vec = dimensionVector(d)
        const vecStr = formatVector(vec)

        // Find linked UnitsML quantities
        const linkedQuantNames = dimQuantNames.get(nistId) ?? []

        // Find linked ISO 80000 quantities (by name match)
        const linkedIsoEntries: { id: string; num: string; name: string; part: string; unitSlugs: string[] }[] = []
        const seenIds = new Set<string>()
        for (const qn of linkedQuantNames) {
          const normalized = qn.toLowerCase().replace(/_/g, ' ')
          const matches = isoQuantityByName.get(normalized) ?? []
          for (const m of matches) {
            if (!seenIds.has(m.id)) {
              seenIds.add(m.id)
              linkedIsoEntries.push({
                ...m,
                unitSlugs: isoUnitByName.get(m.name.toLowerCase().replace(/ <.*>/, '')) ?? [],
              })
            }
          }
        }

        // Find linked units (ISO units whose quantities overlap with linked ISO entries)
        const linkedUnitSlugs = new Set<string>()
        for (const entry of linkedIsoEntries) {
          for (const us of entry.unitSlugs) linkedUnitSlugs.add(us)
        }

        // Get the symbol with rendering info
        const baseSymbol = vec.map(d => {
          const baseKey = Object.entries(DIM_SYMBOLS).find(([, v]) => v === d.base)?.[0]
          const baseDim = baseKey ? (d as any)[baseKey] : undefined
          return { base: d.base, power: d.power }
        })

        return {
          nistId,
          unitsmlId,
          slug: d.short.replace(/[^a-z0-9_]/gi, '-').toLowerCase(),
          name,
          shortName: d.short,
          dimensionless: !!d.dimensionless,
          vector: vec,
          vectorNotation: vecStr,
          linkedQuantities: linkedQuantNames,
          isoEntries: linkedIsoEntries,
          isoUnitSlugs: Array.from(linkedUnitSlugs),
          qudtUri: d.references?.find(r => r.authority === 'qudt')?.uri,
        }
      }).sort((a, b) => {
        // Dimensionless last, then alphabetical
        if (a.dimensionless !== b.dimensionless) return a.dimensionless ? 1 : -1
        if (a.vector.length !== b.vector.length) return a.vector.length - b.vector.length
        return a.name.localeCompare(b.name)
      })

      // Add dimension routes
      for (const d of physicalDimensions) routes.add(`/dimensions/${d.slug}`)

      // Reverse-map: assign dimensionRef to units from dimension→unit linkage
      const dimByUnitSlug = new Map<string, { unitsmlId: string; slug: string }>()
      for (const d of physicalDimensions) {
        for (const us of d.isoUnitSlugs ?? []) {
          if (!dimByUnitSlug.has(us)) dimByUnitSlug.set(us, { unitsmlId: d.unitsmlId, slug: d.slug })
        }
      }
      for (const u of isoUnits) {
        const dim = dimByUnitSlug.get(u.slug)
        if (dim) {
          if (!u.dimensionRef) Object.assign(u, { dimensionRef: dim.unitsmlId, dimensionSlug: dim.slug })
        }
      }
    }

    writeFileSync(
      resolve(generatedDir, 'unitsdb.ts'),
      `export const units = ${JSON.stringify(isoUnits)}\n`
      + `export const dimensions = ${JSON.stringify(isoDimensions)}\n`,
    )

    writeFileSync(
      resolve(generatedDir, 'physical-dimensions.ts'),
      `export const physicalDimensions = ${JSON.stringify(physicalDimensions)}\n`,
    )

    // ── Routes (for prerendering) ──
    writeFileSync(
      resolve(generatedDir, 'routes.ts'),
      `export const allRoutes: string[] = ${JSON.stringify([...routes].sort())}\n`,
    )

    // ── Cross-reference map (entry ID / standard ref -> route + name) ──
    const xrefData: Record<string, { href?: string; name: string }> = {}
    for (const entry of allEntries) {
      const pk = entry.part.toString()
      const prefix = pk.startsWith('2-') ? '/math' : '/quantities'
      xrefData[entry.id] = {
        href: `${prefix}/part-${pk}/${entry.id}`,
        name: entry.designations[0]?.designation.en?.text ?? entry.id,
      }
    }
    for (const [num, title] of Object.entries(PART_TITLES)) {
      xrefData[`iso80000-${num}`] = { href: `/documents/part-${num}`, name: `ISO 80000-${num}: ${title}` }
      xrefData[`iec80000-${num}`] = { href: `/documents/part-${num}`, name: `IEC 80000-${num}: ${title}` }
    }
    writeFileSync(
      resolve(generatedDir, 'xref-map.ts'),
      `export const xrefMap: Record<string, { href?: string; name: string }> = ${JSON.stringify(xrefData)}\n`,
    )

    // ── Reverse reference map (entryId -> entries that reference it) ──
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
          if (xrefData[targetId]?.href) referenced.add(targetId)
        }
      }
      for (const targetId of referenced) {
        if (!reverseXref[targetId]) reverseXref[targetId] = []
        reverseXref[targetId].push(entry.id)
      }
    }
    writeFileSync(
      resolve(generatedDir, 'reverse-xref.ts'),
      `export const reverseXref: Record<string, string[]> = ${JSON.stringify(reverseXref)}\n`,
    )

    // ── Lightweight domain index for fast browsing ──
    const STEM_WRAP_RE = /^stem:\[([^\]]+)\]$/
    const STEM_INLINE_RE = /stem:\[([^\]]+)\]/g
    const qIndex: DomainEntry[] = []
    const mIndex: DomainEntry[] = []
    for (const e of allEntries) {
      const pk = e.part.toString()
      const item: DomainEntry = {
        i: e.id,
        n: e.num,
        t: (e.designations[0]?.designation.en?.text ?? '').replace(STEM_INLINE_RE, (_, expr) => expr.replace(/^"|"$/g, '')),
        s: (e.symbols ?? []).map(s => s.replace(STEM_WRAP_RE, '$1')),
        u: (e.units ?? []).flatMap(u => (u.symbol ?? []).map(s => s.replace(STEM_WRAP_RE, '$1'))),
        p: pk,
      }
      if (pk.startsWith('2-')) mIndex.push(item)
      else qIndex.push(item)
    }

    // Collect unique symbols and unit symbols for domain-level MathML cache
    const allSymbols = new Set<string>()
    const allUnitSymbols = new Set<string>()
    for (const e of allEntries) {
      e.symbols?.forEach(s => allSymbols.add(s.replace(STEM_WRAP_RE, '$1')))
      e.units?.forEach(u => u.symbol?.forEach(s => allUnitSymbols.add(s.replace(STEM_WRAP_RE, '$1'))))
    }
    const symbolCache: Record<string, string> = {}
    for (const sym of [...allSymbols, ...allUnitSymbols]) {
      if (globalMathCache[sym]) symbolCache[sym] = globalMathCache[sym]
    }

    writeFileSync(
      resolve(generatedDir, 'domain-index.ts'),
      `export const quantitiesIndex = ${JSON.stringify(qIndex)}\n`
      + `export const mathIndex = ${JSON.stringify(mIndex)}\n`
      + `export const symbolCache = ${JSON.stringify(symbolCache)} as Record<string, string>\n`,
    )
  }

  return {
    name: 'yaml-data',
    async configResolved(config) {
      const isBuild = config.command === 'build'
      const metaExists = existsSync(resolve(generatedDir, 'meta.ts'))

      if (!isBuild && metaExists) {
        console.log('[yaml-data] Using cached generated data')
        return
      }

      if (!isBuild && !metaExists) {
        console.log('[yaml-data] Generating data in background...')
        generateFiles().then(() => console.log('[yaml-data] Done')).catch(e => console.error('[yaml-data] Failed:', e.message))
        return
      }

      console.log('[yaml-data] Generating data files...')
      await generateFiles()
      console.log('[yaml-data] Done')
    },
  }
}

// ─── Ontology TTL Parser Plugin (using n3) ────────────────────────────────────

function ontologyDataPlugin(): Plugin {
  const ontoDir = ontologySrcDir
  const refDir = ontologyRefDir
  const genDir = generatedDir

  async function generateOntologyData() {
    const { Parser, Store } = await import('n3')

    const store = new Store()
    const parser = new Parser()

    const ttlFiles = [
      resolve(refDir, 'ontologies/core-ontology.ttl'),
      resolve(refDir, 'ontologies/external/vocabulary.ttl'),
      resolve(refDir, 'schemas/shacl/core-ontology.shacl.ttl'),
      resolve(refDir, 'schemas/shacl/annotation-ontology.shacl.ttl'),
      resolve(refDir, 'schemas/shacl/terminology-model.shacl.ttl'),
      ...readdirSync(resolve(refDir, 'taxonomies')).filter(f => f.endsWith('.ttl')).map(f => resolve(refDir, 'taxonomies', f)),
      resolve(ontoDir, 'isq.ttl'),
      resolve(ontoDir, 'isq.shacl.ttl'),
    ]

    // Manually extract @prefix declarations from TTL content
    const allPrefixes: Record<string, string> = {}
    const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]*):\s*<([^>]+)>\s*\./g

    for (const file of ttlFiles) {
      if (!existsSync(file)) continue
      const content = readFileSync(file, 'utf-8')
      let m: RegExpExecArray | null
      const rx = new RegExp(prefixRegex.source, 'g')
      while ((m = rx.exec(content)) !== null) {
        const prefix = m[1]
        const uri = m[2]
        // Skip empty prefix — prefer named prefix for same namespace
        if (prefix === '' && allPrefixes['isq'] === uri) continue
        if (prefix === '' && uri.includes('isq')) {
          allPrefixes['isq'] = uri
          continue
        }
        allPrefixes[prefix] = uri
      }
      const quads = parser.parse(content)
      store.addQuads(quads)
    }

    // Remove empty prefix if a named prefix already covers the same namespace
    const prefixUriSet = new Map<string, string[]>()
    for (const [pfx, uri] of Object.entries(allPrefixes)) {
      if (!prefixUriSet.has(uri)) prefixUriSet.set(uri, [])
      prefixUriSet.get(uri)!.push(pfx)
    }
    for (const [uri, pfxs] of prefixUriSet) {
      if (pfxs.includes('') && pfxs.some(p => p !== '')) {
        delete allPrefixes['']
      }
    }

    // Helper: compact a URI to qname using extracted prefixes
    const prefixEntries = Object.entries(allPrefixes).sort((a, b) => b[1].length - a[1].length)
    function compact(uri: string): string {
      for (const [prefix, ns] of prefixEntries) {
        if (uri.startsWith(ns)) return `${prefix}:${uri.slice(ns.length)}`
      }
      return uri
    }

    function slugFromQname(qname: string): string {
      return qname.replace(/:/g, '-')
    }

    function lit(value: any): string {
      if (!value) return ''
      return typeof value === 'string' ? value : value.value || ''
    }

    // Collect all unique subjects
    const subjects = new Map<string, Set<{ predicate: string; object: any }>>()
    for (const q of store.getQuads(null, null, null, null)) {
      const s = q.subject.value
      if (!subjects.has(s)) subjects.set(s, new Set())
      subjects.get(s)!.add({ predicate: q.predicate.value, object: q.object })
    }

    // Known type URIs
    const OWL = 'http://www.w3.org/2002/07/owl#'
    const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
    const SKOS = 'http://www.w3.org/2004/02/skos/core#'
    const SH = 'http://www.w3.org/ns/shacl#'
    const SMART = 'https://w3id.org/standards/smart/ontologies/core/'
    const ISO = 'https://w3id.org/standards/isq/ontologies/core/'

    function getObjects(subject: any, predicateUri: string): string[] {
      return store.getObjects(subject, predicateUri, null).map(o => o.value)
    }

    function getFirst(subject: any, predicateUri: string): string {
      const objs = getObjects(subject, predicateUri)
      return objs.length ? lit(objs[0]) : ''
    }

    // Build entities
    const entities: any[] = []

    for (const [subjectUri, _predicates] of subjects) {
      const types = getObjects(subjectUri, RDF + 'type')
      const qname = compact(subjectUri)
      if (subjectUri.startsWith('_:')) continue // skip blank nodes
      if (!qname.includes(':')) continue // skip unresolvable URIs

      const ontology = subjectUri.startsWith(ISO) ? 'isq'
        : subjectUri.startsWith(SMART) ? 'smart'
        : 'external'

      const label = getFirst(subjectUri, RDFS + 'label')
        || getFirst(subjectUri, SKOS + 'prefLabel')
        || qname.split(':').pop() || ''
      const description = getFirst(subjectUri, SKOS + 'definition')
      const scopeNote = getFirst(subjectUri, SKOS + 'scopeNote')
      const example = getFirst(subjectUri, SKOS + 'example')
      const altLabel = getFirst(subjectUri, SKOS + 'altLabel')
      const seeAlso = getObjects(subjectUri, RDFS + 'seeAlso')

      const baseEntity: any = {
        uri: subjectUri,
        qname,
        slug: slugFromQname(qname),
        label,
        description,
        scopeNote: scopeNote || undefined,
        example: example || undefined,
        altLabel: altLabel || undefined,
        seeAlso: seeAlso.length ? seeAlso : undefined,
        ontology,
      }

      // Determine entity type
      if (types.includes(OWL + 'Ontology')) {
        baseEntity.type = 'ontology'
        baseEntity.version = getFirst(subjectUri, OWL + 'versionInfo')
        baseEntity.imports = getObjects(subjectUri, OWL + 'imports').map(compact)
        entities.push(baseEntity)
      } else if (types.includes(OWL + 'Class')) {
        baseEntity.type = 'class'
        const parents = getObjects(subjectUri, RDFS + 'subClassOf')
        if (parents.length) baseEntity.parent = compact(parents[0])
        entities.push(baseEntity)
      } else if (types.includes(OWL + 'ObjectProperty')) {
        baseEntity.type = 'objectProperty'
        baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter(q => q.includes(':'))
        baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact).filter(q => q.includes(':'))
        baseEntity.functional = types.includes(OWL + 'FunctionalProperty')
        entities.push(baseEntity)
      } else if (types.includes(OWL + 'DatatypeProperty')) {
        baseEntity.type = 'datatypeProperty'
        baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter(q => q.includes(':'))
        baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact)
        entities.push(baseEntity)
      } else if (types.includes(OWL + 'AnnotationProperty')) {
        baseEntity.type = 'annotationProperty'
        entities.push(baseEntity)
      } else if (types.includes(SH + 'NodeShape') || types.includes(SH + 'PropertyShape')) {
        baseEntity.type = 'shape'
        const tc = getObjects(subjectUri, SH + 'targetClass')
        if (tc.length) baseEntity.targetClass = compact(tc[0])
        const tso = getObjects(subjectUri, SH + 'targetSubjectsOf')
        if (tso.length) baseEntity.targetSubjectsOf = compact(tso[0])
        const too = getObjects(subjectUri, SH + 'targetObjectsOf')
        if (too.length) baseEntity.targetObjectsOf = compact(too[0])

        // Extract constraints from sh:property blank nodes
        const propertyQuads = store.getQuads(subjectUri, SH + 'property', null, null)
        const constraints: any[] = []
        for (const pq of propertyQuads) {
          const bnTerm = pq.object
          const pathTerms = store.getObjects(bnTerm, SH + 'path', null)
          if (!pathTerms.length) continue
          const pathTerm = pathTerms[0]
          let path: string
          // Handle RDF list paths like ( skosxl:prefLabel skosxl:literalForm )
          const listItems = store.getQuads(pathTerm, RDF + 'first', null, null)
          if (listItems.length) {
            const items: string[] = []
            let listNode: any = pathTerm
            let safety = 20
            while (safety-- > 0 && listNode) {
              const firsts = store.getObjects(listNode, RDF + 'first', null)
              if (firsts.length) items.push(compact(firsts[0].value))
              const rests = store.getObjects(listNode, RDF + 'rest', null)
              if (rests.length && rests[0].value !== RDF + 'nil') {
                listNode = rests[0]
              } else {
                break
              }
            }
            path = items.join(' / ')
          } else {
            path = compact(pathTerm.value)
          }
          // Skip unresolvable paths
          if (!path.includes(':') && !path.includes('/')) continue
          const c: any = { path }
          const minC = getFirst(bnTerm, SH + 'minCount')
          if (minC) c.minCount = parseInt(minC)
          const maxC = getFirst(bnTerm, SH + 'maxCount')
          if (maxC) c.maxCount = parseInt(maxC)
          const dt = getFirst(bnTerm, SH + 'datatype')
          if (dt) c.datatype = compact(dt)
          const nk = getFirst(bnTerm, SH + 'nodeKind')
          if (nk) c.nodeKind = compact(nk)
          const cls = getFirst(bnTerm, SH + 'class')
          if (cls) c.classValue = compact(cls)
          const hv = getFirst(bnTerm, SH + 'hasValue')
          if (hv) c.hasValue = compact(hv)
          const ul = getFirst(bnTerm, SH + 'uniqueLang')
          if (ul === 'true') c.uniqueLang = true
          constraints.push(c)
        }
        baseEntity.constraints = constraints.length ? constraints : undefined
        entities.push(baseEntity)
      } else if (types.includes(SKOS + 'Concept')) {
        baseEntity.type = 'concept'
        const schemes = getObjects(subjectUri, SKOS + 'inScheme').map(compact)
        if (schemes.length) baseEntity.scheme = schemes[0]
        // Also store which class types this concept is an instance of
        baseEntity.instanceOf = types.filter(t => t.startsWith(SMART)).map(compact).filter(q => q !== 'skos:Concept')
        entities.push(baseEntity)
      } else if (types.includes(SKOS + 'ConceptScheme')) {
        baseEntity.type = 'conceptScheme'
        baseEntity.topConcepts = getObjects(subjectUri, SKOS + 'hasTopConcept').map(compact)
        entities.push(baseEntity)
      } else {
        // Named individual - typed with at least one smart: class
        const smartTypes = types.filter(t => t.startsWith(SMART)).map(compact)
        if (smartTypes.length && !qname.startsWith('rdf:') && !qname.startsWith('owl:') && !qname.startsWith('rdfs:') && !qname.startsWith('xsd:')) {
          baseEntity.type = 'individual'
          baseEntity.instanceOf = smartTypes
          const title = getFirst(subjectUri, 'http://purl.org/dc/terms/title')
          if (title) baseEntity.label = title
          const identifier = getFirst(subjectUri, 'http://purl.org/dc/terms/identifier')
          if (identifier) baseEntity.identifier = identifier
          const isPartOf = getObjects(subjectUri, 'http://purl.org/dc/terms/isPartOf')
          if (isPartOf.length) baseEntity.isPartOf = isPartOf.map(compact).filter(q => q.includes(':'))
          entities.push(baseEntity)
        }
      }
    }

    // ─── Generate stub entities for externally-referenced qnames ──────────────

    const definedQnames = new Set(entities.map((e: any) => e.qname))
    const referencedQnames = new Set<string>()

    for (const e of entities) {
      if (e.parent) referencedQnames.add(e.parent)
      for (const d of (e.domain || [])) referencedQnames.add(d)
      for (const r of (e.range || [])) referencedQnames.add(r)
      if (e.targetClass) referencedQnames.add(e.targetClass)
      if (e.targetSubjectsOf) referencedQnames.add(e.targetSubjectsOf)
      if (e.targetObjectsOf) referencedQnames.add(e.targetObjectsOf)
      if (e.scheme) referencedQnames.add(e.scheme)
      for (const t of (e.instanceOf || [])) referencedQnames.add(t)
      for (const c of (e.constraints || [])) {
        if (c.path) referencedQnames.add(c.path)
        if (c.datatype) referencedQnames.add(c.datatype)
        if (c.classValue) referencedQnames.add(c.classValue)
        if (c.nodeKind) referencedQnames.add(c.nodeKind)
        if (c.hasValue) referencedQnames.add(c.hasValue)
      }
    }

    // Known external entity metadata
    const externalMeta: Record<string, { type: string; description: string }> = {
      'rdf:type': { type: 'annotationProperty', description: 'The type of the subject resource.' },
      'rdf:value': { type: 'datatypeProperty', description: 'The value of the subject resource.' },
      'rdf:langString': { type: 'class', description: 'The class of RDF language-tagged string literals.' },
      'dcterms:title': { type: 'annotationProperty', description: 'A name given to the resource.' },
      'dcterms:description': { type: 'annotationProperty', description: 'An account of the resource.' },
      'dcterms:identifier': { type: 'annotationProperty', description: 'An unambiguous reference to the resource.' },
      'dcterms:isPartOf': { type: 'objectProperty', description: 'A related resource in which the described resource is physically or logically included.' },
      'dcterms:hasVersion': { type: 'objectProperty', description: 'A related resource that is a version, edition, or adaptation of the described resource.' },
      'dcterms:format': { type: 'annotationProperty', description: 'The file format, physical medium, or dimensions of the resource.' },
      'dcterms:issued': { type: 'annotationProperty', description: 'Date of formal issuance of the resource.' },
      'dcterms:replaces': { type: 'objectProperty', description: 'A related resource that is supplanted, displaced, or superseded by the described resource.' },
      'skos:prefLabel': { type: 'annotationProperty', description: 'The preferred lexical label for a resource.' },
      'skos:altLabel': { type: 'annotationProperty', description: 'An alternative lexical label for a resource.' },
      'skos:definition': { type: 'annotationProperty', description: 'A complete explanation of the intended meaning of a concept.' },
      'skos:notation': { type: 'annotationProperty', description: 'A notation is a string of characters used to uniquely identify a concept.' },
      'skos:note': { type: 'annotationProperty', description: 'A general note about a concept.' },
      'skos:scopeNote': { type: 'annotationProperty', description: 'A note that helps to clarify the meaning and/or the use of a concept.' },
      'skos:changeNote': { type: 'annotationProperty', description: 'A note about a modification to a concept.' },
      'skosxl:prefLabel': { type: 'objectProperty', description: 'Relates a resource to its preferred label as a skosxl:Label instance.' },
      'skosxl:altLabel': { type: 'objectProperty', description: 'Relates a resource to an alternative label as a skosxl:Label instance.' },
      'skosxl:literalForm': { type: 'datatypeProperty', description: 'The literal form of a skosxl:Label.' },
      'xsd:string': { type: 'class', description: 'The class of XML Schema string values.' },
      'xsd:date': { type: 'class', description: 'The class of XML Schema date values.' },
      'sh:IRI': { type: 'class', description: 'A SHACL node kind indicating the value must be an IRI.' },
      'sh:BlankNodeOrIRI': { type: 'class', description: 'A SHACL node kind indicating the value must be a blank node or IRI.' },
      'oa:hasBody': { type: 'objectProperty', description: 'The body of the annotation.' },
      'oa:hasTarget': { type: 'objectProperty', description: 'The target of the annotation.' },
      'oa:hasSelector': { type: 'objectProperty', description: 'The selector of an OA SpecificResource.' },
      'oa:hasSource': { type: 'objectProperty', description: 'The source resource of an OA SpecificResource.' },
      'dcat:distribution': { type: 'objectProperty', description: 'An available distribution of the dataset.' },
      'prov:entity': { type: 'objectProperty', description: 'The entity referenced by a prov:Derivation.' },
      'prov:qualifiedDerivation': { type: 'objectProperty', description: 'A qualified derivation relationship.' },
      'smart:hasSectionNumber': { type: 'datatypeProperty', description: 'The section number of a clause within a document.' },
      'smart:deprecatedLabel': { type: 'annotationProperty', description: 'A deprecated label for an entity.' },
    }

    for (const qname of referencedQnames) {
      if (definedQnames.has(qname)) continue
      if (!qname.includes(':')) continue

      const localName = qname.split(':').pop() || ''
      const meta = externalMeta[qname]

      // Resolve full URI from prefix map
      const prefix = qname.split(':')[0]
      const local = qname.split(':').slice(1).join(':')
      const nsUri = allPrefixes[prefix]
      const fullUri = nsUri ? nsUri + local : ''

      entities.push({
        uri: fullUri,
        qname,
        slug: slugFromQname(qname),
        label: localName,
        description: meta?.description || '',
        ontology: 'external',
        type: meta?.type || 'external',
      })
    }

    // Build namespace/prefix list
    const prefixes = Object.entries(allPrefixes).map(([prefix, uri]) => ({ prefix, uri }))

    // Import chain
    const importChain: Record<string, any> = {}
    for (const e of entities) {
      if (e.type === 'ontology' && e.imports?.length) {
        importChain[compact(e.uri)] = {
          imports: e.imports.map((imp: string) => compact(imp)),
          description: e.description,
          version: e.version,
        }
      }
    }

    // ─── Build type metadata (derived from entity data) ─────────────────────

    const entityTypes = [...new Set(entities.map((e: any) => e.type))]
    const typeMeta: Record<string, { label: string; color: string; colorDot: string }> = {}
    for (const t of entityTypes) {
      switch (t) {
        case 'class': typeMeta[t] = { label: 'Class', color: 'bg-blue-100 text-blue-800', colorDot: 'bg-blue-400' }; break
        case 'objectProperty': typeMeta[t] = { label: 'Object Property', color: 'bg-green-100 text-green-800', colorDot: 'bg-green-400' }; break
        case 'datatypeProperty': typeMeta[t] = { label: 'Datatype Property', color: 'bg-lime-100 text-lime-800', colorDot: 'bg-lime-400' }; break
        case 'annotationProperty': typeMeta[t] = { label: 'Annotation Property', color: 'bg-amber-100 text-amber-800', colorDot: 'bg-amber-400' }; break
        case 'shape': typeMeta[t] = { label: 'SHACL Shape', color: 'bg-purple-100 text-purple-800', colorDot: 'bg-purple-400' }; break
        case 'concept': typeMeta[t] = { label: 'SKOS Concept', color: 'bg-teal-100 text-teal-800', colorDot: 'bg-teal-400' }; break
        case 'conceptScheme': typeMeta[t] = { label: 'Concept Scheme', color: 'bg-cyan-100 text-cyan-800', colorDot: 'bg-cyan-400' }; break
        case 'individual': typeMeta[t] = { label: 'Named Individual', color: 'bg-orange-100 text-orange-800', colorDot: 'bg-orange-400' }; break
        case 'ontology': typeMeta[t] = { label: 'Ontology', color: 'bg-indigo-100 text-indigo-800', colorDot: 'bg-indigo-400' }; break
        default: typeMeta[t] = { label: t, color: 'bg-slate-100 text-slate-600', colorDot: 'bg-slate-400' }
      }
    }

    // Ontology namespace metadata (derived from entities)
    const ontologyNamespaces = [
      {
        prefix: 'isq',
        uri: ISO,
        title: 'ISQ Domain Ontology',
        description: 'Domain ontology for ISO & IEC 80000 — defines Quantity, Unit, and MathConcept as extensions of the SMART Core Ontology.',
        color: 'brand',
        version: entities.find((e: any) => e.type === 'ontology' && e.uri === ISO)?.version || '1.0.0',
      },
      {
        prefix: 'smart',
        uri: SMART,
        title: 'SMART Core Ontology',
        description: 'Core Ontology for representing (SMART) content of standard as per the ISO/IEC Directives Part 2.',
        color: 'emerald',
        version: entities.find((e: any) => e.type === 'ontology' && e.uri.startsWith(SMART))?.version || '2.0.0',
      },
    ]

    if (!existsSync(genDir)) mkdirSync(genDir, { recursive: true })

    writeFileSync(
      resolve(genDir, 'ontology.ts'),
      `// Auto-generated from TTL files by ontology-data Vite plugin\n`
      + `// Do not edit manually\n\n`
      + `export const ontologyEntities = ${JSON.stringify(entities, null, 2)} as const\n\n`
      + `export const ontologyPrefixes = ${JSON.stringify(prefixes)} as const\n\n`
      + `export const ontologyImportChain = ${JSON.stringify(importChain)} as const\n\n`
      + `export const ontologyTypeMeta = ${JSON.stringify(typeMeta)} as const\n\n`
      + `export const ontologyNamespaces = ${JSON.stringify(ontologyNamespaces)} as const\n\n`
      + `export type OntologyEntity = typeof ontologyEntities[number]\n`
    )
  }

  return {
    name: 'ontology-data',
    async configResolved(config) {
      const isBuild = config.command === 'build'
      const exists = existsSync(resolve(genDir, 'ontology.ts'))

      if (!isBuild && exists) {
        console.log('[ontology-data] Using cached generated data')
        return
      }

      console.log('[ontology-data] Generating ontology data...')
      await generateOntologyData()
      console.log('[ontology-data] Done')
    },
  }
}

export default defineConfig({
  base: SiteConfig.basePath,
  plugins: [vue(), tailwindcss(), yamlDataPlugin(), ontologyDataPlugin()],
  build: {
    sourcemap: true,
  },
})
