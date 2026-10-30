import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'
import { comparePartKeys } from '../../src/data/partKey'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'
import type { IsoUnit, UnitsmlYaml, UnitsmlUnit } from './types'

function unitSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function buildUnits(
  qData: RawEntry[],
  unitsdbDir: string,
  ctx: BuildContext,
  generatedDir: string,
): IsoUnit[] {
  // Key by slug, not raw name: the same unit can appear under name variants
  // that differ only in line breaks, which must map to a single route.
  const unitsBySlug = new Map<string, { name: string; symbols: Set<string>; quantities: { id: string; num: string; name: string; part: string }[]; parts: Set<string> }>()
  for (const e of qData) {
    for (const u of (e.units ?? [])) {
      const slug = unitSlug(u.en)
      if (!unitsBySlug.has(slug)) {
        unitsBySlug.set(slug, { name: u.en, symbols: new Set(), quantities: [], parts: new Set() })
      }
      const entry = unitsBySlug.get(slug)!
      for (const s of (u.symbol ?? [])) entry.symbols.add(s)
      if (!entry.quantities.some(q => q.id === e.id)) {
        entry.quantities.push({
          id: e.id,
          num: e.num,
          name: e.designations[0]?.designation.en?.text ?? '',
          part: e.part.toString(),
        })
        entry.parts.add(e.part.toString())
      }
    }
  }

  const isoUnits: IsoUnit[] = Array.from(unitsBySlug.values()).map(u => ({
    slug: unitSlug(u.name),
    name: u.name,
    symbols: Array.from(u.symbols),
    quantityCount: u.quantities.length,
    parts: Array.from(u.parts).sort(comparePartKeys),
    sampleQuantities: u.quantities.slice(0, 3),
    quantities: u.quantities,
  }))

  for (const u of isoUnits) ctx.routes.add(`/units/${u.slug}`)

  const unitsmlUnitsPath = resolve(unitsdbDir, 'units.yaml')
  if (existsSync(unitsmlUnitsPath)) {
    const unitsmlData = yamlLoad(readFileSync(unitsmlUnitsPath, 'utf-8')) as UnitsmlYaml
    const rawUnitsmlUnits = unitsmlData.units
    const unitsByNameKey = new Map<string, UnitsmlUnit>()
    for (const u of rawUnitsmlUnits) {
      const enName = u.names?.find(n => n.lang === 'en')?.value
      if (enName) unitsByNameKey.set(enName.toLowerCase(), u)
    }
    for (const u of isoUnits) {
      const uml = unitsByNameKey.get(u.name.toLowerCase())
      if (!uml) continue
      const nistId = uml.identifiers?.find(i => i.type === 'nist')?.id
      const unitsmlId = uml.identifiers?.find(i => i.type === 'unitsml')?.id
      const refs: { authority: string; uri: string; type: string }[] = []
      for (const r of uml.references ?? []) {
        refs.push({ authority: r.authority, uri: r.uri, type: r.type })
      }
      const unitSystems = (uml.unit_system_reference ?? []).map(r => r.id ?? r.type)
      const scaleRef = uml.scale_reference?.id
      const root = !!uml.root
      const quantityRefs = (uml.quantity_references ?? []).map(r => r.id)
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
