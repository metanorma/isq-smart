import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import type { RawEntry } from '../types'

interface IsoUnit {
  slug: string
  name: string
  quantities: { id: string; num: string; name: string; part: string }[]
  dimensionRef?: string
  dimensionSlug?: string
}

interface UnitsmlDimension {
  identifiers: { type: string; id: string }[]
  names: { value: string; lang: string }[]
  short: string
  dimensionless?: boolean
  length?: { power: number; symbol: string }
  mass?: { power: number; symbol: string }
  time?: { power: number; symbol: string }
  electric_current?: { power: number; symbol: string }
  thermodynamic_temperature?: { power: number; symbol: string }
  amount_of_substance?: { power: number; symbol: string }
  luminous_intensity?: { power: number; symbol: string }
  plane_angle?: { power: number; symbol: string }
  references?: { type: string; authority: string; uri: string }[]
}

interface UnitsmlQuantity {
  dimension_reference: { type: string; id: string }
  identifiers: { type: string; id: string }[]
  names: { value: string; lang: string }[]
  short: string
  quantity_type: string
}

const BASE_DIMS = ['length', 'mass', 'time', 'electric_current', 'thermodynamic_temperature', 'amount_of_substance', 'luminous_intensity', 'plane_angle'] as const
const DIM_SYMBOLS: Record<string, string> = {
  length: 'L', mass: 'M', time: 'T', electric_current: 'I',
  thermodynamic_temperature: 'Θ', amount_of_substance: 'N', luminous_intensity: 'J', plane_angle: 'φ',
}

function superscript(n: number): string {
  const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹'
  const sign = n < 0 ? '⁻' : ''
  return sign + String(Math.abs(n)).split('').map(c => sup[parseInt(c)]).join('')
}

export function buildDimensions(
  isoUnits: IsoUnit[],
  unitsdbDir: string,
  routes: Set<string>,
  generatedDir: string,
): void {
  const unitsmlDimsPath = resolve(unitsdbDir, 'dimensions.yaml')
  const unitsmlQuantitiesPath = resolve(unitsdbDir, 'quantities.yaml')

  if (!existsSync(unitsmlDimsPath) || !existsSync(unitsmlQuantitiesPath)) {
    writeFileSync(resolve(generatedDir, 'physical-dimensions.ts'), 'export const physicalDimensions = []\n')
    return
  }

  const rawDims = (yaml.load(readFileSync(unitsmlDimsPath, 'utf-8')) as any).dimensions as UnitsmlDimension[]
  const rawQuants = (yaml.load(readFileSync(unitsmlQuantitiesPath, 'utf-8')) as any).quantities as UnitsmlQuantity[]

  const isoQuantityByName = new Map<string, { id: string; num: string; name: string; part: string }[]>()
  for (const u of isoUnits) {
    for (const q of u.quantities) {
      const key = q.name.toLowerCase().replace(/ <.*>/, '')
      if (!isoQuantityByName.has(key)) isoQuantityByName.set(key, [])
      isoQuantityByName.get(key)!.push(q)
    }
  }

  const isoUnitByName = new Map<string, string[]>()
  for (const u of isoUnits) {
    for (const q of u.quantities) {
      const key = q.name.toLowerCase().replace(/ <.*>/, '')
      if (!isoUnitByName.has(key)) isoUnitByName.set(key, [])
      isoUnitByName.get(key)!.push(u.slug)
    }
  }

  const dimQuantNames = new Map<string, string[]>()
  for (const q of rawQuants) {
    const nistDimId = q.dimension_reference.id
    if (!dimQuantNames.has(nistDimId)) dimQuantNames.set(nistDimId, [])
    dimQuantNames.get(nistDimId)!.push(q.short)
  }

  function dimensionVector(dim: UnitsmlDimension): { base: string; power: number }[] {
    return BASE_DIMS.filter(k => dim[k]).map(k => ({ base: DIM_SYMBOLS[k], power: dim[k]!.power }))
  }

  function formatVector(vec: { base: string; power: number }[]): string {
    if (vec.length === 0) return '1'
    return vec.map(d => d.power === 1 ? d.base : `${d.base}${superscript(d.power)}`).join(' ')
  }

  const physicalDimensions = rawDims.map(d => {
    const nistId = d.identifiers.find(i => i.type === 'nist')?.id ?? ''
    const unitsmlId = d.identifiers.find(i => i.type === 'unitsml')?.id ?? ''
    const name = d.names.find(n => n.lang === 'en')?.value ?? d.short
    const vec = dimensionVector(d)
    const vecStr = formatVector(vec)

    const linkedQuantNames = dimQuantNames.get(nistId) ?? []

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

    const linkedUnitSlugs = new Set<string>()
    for (const entry of linkedIsoEntries) {
      for (const us of entry.unitSlugs) linkedUnitSlugs.add(us)
    }

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
    if (a.dimensionless !== b.dimensionless) return a.dimensionless ? 1 : -1
    if (a.vector.length !== b.vector.length) return a.vector.length - b.vector.length
    return a.name.localeCompare(b.name)
  })

  for (const d of physicalDimensions) routes.add(`/dimensions/${d.slug}`)

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

  writeFileSync(
    resolve(generatedDir, 'physical-dimensions.ts'),
    `export const physicalDimensions = ${JSON.stringify(physicalDimensions)}\n`,
  )
}
