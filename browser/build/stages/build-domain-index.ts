import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RawEntry } from '../types'

export function buildDomainIndex(
  allEntries: RawEntry[],
  globalMathCache: Record<string, string>,
  generatedDir: string,
): void {
  const STEM_WRAP_RE = /^stem:\[([^\]]+)\]$/
  const STEM_INLINE_RE = /stem:\[([^\]]+)\]/g

  const qIndex: { i: string; n: string; t: string; s: string[]; u: string[]; p: string; d: string }[] = []
  const mIndex: { i: string; n: string; t: string; s: string[]; u: string[]; p: string; d: string }[] = []

  for (const e of allEntries) {
    const pk = e.part.toString()
    const defText = (e.def?.en ?? '').replace(STEM_INLINE_RE, (_, expr) => expr.replace(/^"|"$/g, ''))
    const item = {
      i: e.id,
      n: e.num,
      t: (e.designations[0]?.designation.en?.text ?? '').replace(STEM_INLINE_RE, (_, expr) => expr.replace(/^"|"$/g, '')),
      s: (e.symbols ?? []).map(s => s.replace(STEM_WRAP_RE, '$1')),
      u: (e.units ?? []).flatMap(u => (u.symbol ?? []).map(s => s.replace(STEM_WRAP_RE, '$1'))),
      p: pk,
      d: defText,
    }
    if (pk.startsWith('2-')) mIndex.push(item)
    else qIndex.push(item)
  }

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
