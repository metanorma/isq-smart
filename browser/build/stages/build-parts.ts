import { writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { resolve } from 'node:path'
import { MathCollector } from '../math-collector'
import { sortPartKeys } from '../../src/data/partKey'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'

export interface PartSummary {
  domain: string
  count: number
  bilingual: boolean
  editions: string[]
}

function sortKeys(keys: Set<string>): string[] {
  return sortPartKeys(Array.from(keys))
}

function writePart(
  partKey: string,
  domain: 'quantities' | 'math',
  rawEntries: RawEntry[],
  globalMathCache: Record<string, string>,
  globalLatexCache: Record<string, string>,
  partExprs: Set<string>,
  summaries: Record<string, PartSummary>,
  ctx: BuildContext,
  generatedDir: string,
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
  ctx.routes.add(`${prefix}/part-${partKey}`)
  for (const entry of entries) ctx.routes.add(`${prefix}/part-${partKey}/${(entry as { id: string }).id}`)

  writeFileSync(
    resolve(generatedDir, `part-${partKey}.ts`),
    `import type { Entry } from '../types'\n`
    + `export default ${JSON.stringify(entries)} as Entry[]\n`
    + `export const editions = ${JSON.stringify(editions)} as string[]\n`
    + `export const bilingual = ${bilingual}\n`
    + `export const mathCache = ${JSON.stringify(partMathCache)} as Record<string, string>\n`
    + `export const latexCache = ${JSON.stringify(partLatexCache)} as Record<string, string>\n`,
  )
}

export function buildParts(
  raw: { quantities: RawEntry[]; math: RawEntry[] },
  globalMathCache: Record<string, string>,
  globalLatexCache: Record<string, string>,
  generatedDir: string,
  ctx: BuildContext,
): { summaries: Record<string, PartSummary> } {
  if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })

  for (const f of readdirSync(generatedDir)) {
    if (f.endsWith('.ts')) {
      const match = f.match(/^part-(.+)\.ts$/)
      if (match && ctx.isExcluded(match[1])) {
        unlinkSync(resolve(generatedDir, f))
      }
    }
  }

  const summaries: Record<string, PartSummary> = {}

  const qParts = sortKeys(new Set(raw.quantities.map(e => e.part.toString()))).filter(pk => !ctx.isExcluded(pk))
  for (const pk of qParts) {
    const partEntries = raw.quantities.filter(e => e.part.toString() === pk)
    const partExprs = MathCollector.collect(partEntries)
    writePart(pk, 'quantities', partEntries, globalMathCache, globalLatexCache, partExprs, summaries, ctx, generatedDir)
  }

  const mParts = sortKeys(new Set(raw.math.map(e => e.part.toString()))).filter(pk => !ctx.isExcluded(pk))
  for (const pk of mParts) {
    const partEntries = raw.math.filter(e => e.part.toString() === pk)
    const partExprs = MathCollector.collect(partEntries)
    writePart(pk, 'math', partEntries, globalMathCache, globalLatexCache, partExprs, summaries, ctx, generatedDir)
  }

  if (mParts.length) ctx.routes.add('/math')

  return { summaries }
}
