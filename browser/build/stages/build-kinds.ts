import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'
import type { KindOfQuantity } from '../../src/data/ontology'

const BASE_DIM_SYMBOLS = ['L', 'M', 'T', 'I', 'Θ', 'N', 'J'] as const
type BaseDim = (typeof BASE_DIM_SYMBOLS)[number]
type DimVector = Partial<Record<BaseDim, number>>

const NAMED_UNIT_DIMS: Record<string, DimVector> = {
  m: { L: 1 },
  kg: { M: 1 },
  s: { T: 1 },
  A: { I: 1 },
  K: { Θ: 1 },
  mol: { N: 1 },
  cd: { J: 1 },
  rad: {},
  sr: {},
  Hz: { T: -1 },
  N: { L: 1, M: 1, T: -2 },
  Pa: { L: -1, M: 1, T: -2 },
  J: { L: 2, M: 1, T: -2 },
  W: { L: 2, M: 1, T: -3 },
  C: { T: 1, I: 1 },
  V: { L: 2, M: 1, T: -3, I: -1 },
  F: { L: -2, M: -1, T: 4, I: 2 },
  'Ω': { L: 2, M: 1, T: -3, I: -2 },
  S: { L: -2, M: -1, T: 3, I: 2 },
  Wb: { L: 2, M: 1, T: -2, I: -1 },
  T: { M: 1, T: -2, I: -1 },
  H: { L: 2, M: 1, T: -2, I: -2 },
  lm: { J: 1 },
  lx: { L: -2, J: 1 },
  eV: { L: 2, M: 1, T: -2 },
  dB: {},
  oct: {},
  dec: {},
  Bq: { T: -1 },
  Gy: { L: 2, T: -2 },
  Sv: { L: 2, T: -2 },
  kat: { N: 1, T: -1 },
  min: { T: 1 },
  h: { T: 1 },
  d: { T: 1 },
  '°': {},
  "'": { L: 1 },
  '"': { L: 1 },
  l: { L: 3 },
  L: { L: 3 },
  t: { M: 1 },
  bar: { L: -1, M: 1, T: -2 },
  var: { L: 2, M: 1, T: -3 },
}

const DIM_LABELS: Record<string, { en: string; fr: string }> = {
  'L': { en: 'length-type quantities', fr: 'grandeurs de type longueur' },
  'M': { en: 'mass-type quantities', fr: 'grandeurs de type masse' },
  'T': { en: 'time-type quantities', fr: 'grandeurs de type temps' },
  'I': { en: 'electric current-type quantities', fr: "grandeurs de type courant électrique" },
  'Θ': { en: 'temperature-type quantities', fr: 'grandeurs de type température' },
  'N': { en: 'amount of substance-type quantities', fr: 'grandeurs de type quantité de matière' },
  'J': { en: 'luminous intensity-type quantities', fr: "grandeurs de type intensité lumineuse" },
  'L T⁻¹': { en: 'velocity-type quantities', fr: 'grandeurs de type vitesse' },
  'L T⁻²': { en: 'acceleration-type quantities', fr: 'grandeurs de type accélération' },
  'L M T⁻²': { en: 'force-type quantities', fr: 'grandeurs de type force' },
  'L⁻¹ M T⁻²': { en: 'pressure-type quantities', fr: 'grandeurs de type pression' },
  'L² M T⁻²': { en: 'energy-type quantities', fr: 'grandeurs de type énergie' },
  'L² M T⁻³': { en: 'power-type quantities', fr: 'grandeurs de type puissance' },
  'T I': { en: 'electric charge-type quantities', fr: 'grandeurs de type charge électrique' },
  'T⁻¹': { en: 'frequency-type quantities', fr: 'grandeurs de type fréquence' },
  'L² T⁻²': { en: 'dose-type quantities', fr: 'grandeurs de type dose' },
  '': { en: 'dimensionless quantities', fr: 'grandeurs sans dimension' },
}

function superscript(n: number): string {
  if (n === 0) return ''
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  const sign = n < 0 ? '⁻' : ''
  return sign + String(Math.abs(n)).split('').map(c => sup[parseInt(c)]).join('')
}

function formatVector(vec: DimVector): string {
  const parts: string[] = []
  for (const sym of BASE_DIM_SYMBOLS) {
    const power = vec[sym]
    if (power === undefined || power === 0) continue
    parts.push(power === 1 ? sym : `${sym}${superscript(power)}`)
  }
  return parts.join(' ')
}

function slugify(vec: string): string {
  return vec.replace(/ /g, '-').replace(/[⁻¹²³⁴⁵⁶⁷⁸⁹⁰]/g, m => {
    const map: Record<string, string> = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
    return map[m] ?? m
  }).toLowerCase()
}

function mergeVec(target: DimVector, source: DimVector, multiplier: number): void {
  for (const key of Object.keys(source) as BaseDim[]) {
    const power = source[key]
    if (power === undefined) continue
    target[key] = (target[key] ?? 0) + power * multiplier
  }
}

function parseFactor(factor: string): { unit: string; power: number } {
  const match = factor.match(/^([^(^]+)(?:\^?\(?(-?\d+)\)?)?$/)
  if (match) {
    return { unit: match[1].trim(), power: match[2] ? parseInt(match[2]) : 1 }
  }
  return { unit: factor, power: 1 }
}

function deriveDimension(unitSymbol: string): DimVector {
  const result: DimVector = {}
  const trimmed = unitSymbol.trim()

  if (trimmed.includes('*')) {
    for (const factor of trimmed.split('*')) {
      const { unit, power } = parseFactor(factor)
      const dim = NAMED_UNIT_DIMS[unit]
      if (dim) mergeVec(result, dim, power)
    }
    return result
  }

  if (trimmed.includes('/')) {
    const [num, ...denParts] = trimmed.split('/')
    const den = denParts.join('/')
    const numDim = deriveDimension(num.trim())
    const denDim = deriveDimension(den.trim())
    mergeVec(result, numDim, 1)
    mergeVec(result, denDim, -1)
    return result
  }

  const { unit, power } = parseFactor(trimmed)
  const dim = NAMED_UNIT_DIMS[unit]
  if (dim) mergeVec(result, dim, power)
  return result
}

function cleanZeros(vec: DimVector): DimVector {
  const result: DimVector = {}
  for (const key of Object.keys(vec) as BaseDim[]) {
    if (vec[key] !== 0 && vec[key] !== undefined) result[key] = vec[key]
  }
  return result
}

function labelForDimension(vecStr: string): { en: string; fr: string } {
  return DIM_LABELS[vecStr] ?? {
    en: `${vecStr || 'dimensionless'} quantities`,
    fr: `grandeurs ${vecStr || 'sans dimension'}`,
  }
}

function entryPrimarySymbol(entry: RawEntry): string | undefined {
  const raw = entry.units?.[0]?.symbol?.[0]
  if (!raw) return undefined
  return raw.replace(/^stem:\["?|"?\]$/g, '').replace(/"/g, '')
}

export interface KindBuildResult {
  kinds: KindOfQuantity[]
  quantityToKind: Record<string, string>
}

export function buildKinds(
  rawEntries: readonly RawEntry[],
  ctx: BuildContext,
  generatedDir: string,
): KindBuildResult {
  const byDimension = new Map<string, { vec: DimVector; vecStr: string; entryIds: string[] }>()

  for (const entry of rawEntries) {
    if (ctx.isExcluded(entry.part.toString())) continue
    const symbol = entryPrimarySymbol(entry)
    const dim = symbol ? cleanZeros(deriveDimension(symbol)) : {}
    const vecStr = formatVector(dim)

    if (!byDimension.has(vecStr)) {
      byDimension.set(vecStr, { vec: dim, vecStr, entryIds: [] })
    }
    byDimension.get(vecStr)!.entryIds.push(entry.id)
  }

  const kinds: KindOfQuantity[] = []
  const quantityToKind: Record<string, string> = {}

  for (const [vecStr, info] of byDimension) {
    if (info.entryIds.length === 0) continue
    const slug = slugify(vecStr) || 'dimensionless'
    const id = `kind-${slug}`
    const label = labelForDimension(vecStr)

    kinds.push({
      id,
      iri: `isq:${id}`,
      level: 0,
      axis: 'quantity',
      prefLabel: label,
      dimensionVector: vecStr,
      dimensionSymbol: vecStr || '1',
      quantityIds: [...info.entryIds],
    })

    for (const entryId of info.entryIds) {
      quantityToKind[entryId] = id
    }

    ctx.routes.add(`/kinds/${slug}`)
  }

  kinds.sort((a, b) => b.quantityIds.length - a.quantityIds.length || a.dimensionVector.localeCompare(b.dimensionVector))
  ctx.routes.add('/kinds')

  writeFileSync(
    resolve(generatedDir, 'kinds.ts'),
    `import type { KindOfQuantity } from '../ontology'\n`
    + `export const kindOfQuantities: KindOfQuantity[] = ${JSON.stringify(kinds, null, 2)}\n`
    + `export const quantityToKind: Record<string, string> = ${JSON.stringify(quantityToKind, null, 2)}\n`,
  )

  return { kinds, quantityToKind }
}
