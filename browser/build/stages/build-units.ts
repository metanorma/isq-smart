import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import type { RawEntry } from '../types'

interface IsoUnit {
  slug: string
  name: string
  symbols: string[]
  quantityCount: number
  parts: string[]
  sampleQuantities: { id: string; num: string; name: string; part: string }[]
  quantities: { id: string; num: string; name: string; part: string }[]
  nistId?: string
  unitsmlId?: string
  refs?: { authority: string; uri: string; type: string }[]
  unitSystems?: string[]
  scaleRef?: string
  root?: boolean
  quantityRefs?: string[]
  dimensionRef?: string
  dimensionSlug?: string
}

export function buildUnits(
  qData: RawEntry[],
  unitsdbDir: string,
  routes: Set<string>,
  generatedDir: string,
): IsoUnit[] {
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

  const isoUnits: IsoUnit[] = Array.from(unitsByName.values()).map(u => {
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

  for (const u of isoUnits) routes.add(`/units/${u.slug}`)

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

  writeFileSync(
    resolve(generatedDir, 'unitsdb.ts'),
    `export const units = ${JSON.stringify(isoUnits)}\n`
    + `export const dimensions = ${JSON.stringify(isoDimensions)}\n`,
  )

  return isoUnits
}
