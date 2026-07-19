import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { KindOfQuantity } from '../../src/data/ontology'
import type { PhysicalDimension } from './build-dimensions'

export interface KindDimensionLink {
  kindId: string
  dimensionSlug: string | null
  dimensionName: string | null
  dimensionNistId: string | null
  dimensionUnitsmlId: string | null
}

export interface DimensionKindLink {
  dimensionSlug: string
  kindId: string | null
  kindMemberCount: number
  kindOnlyQuantityIds: string[]
}

export interface ConceptLinkResult {
  kindToDimension: Record<string, KindDimensionLink>
  dimensionToKind: Record<string, DimensionKindLink>
}

function normalizeVector(vec: string): string {
  if (!vec || vec.trim() === '') return '1'
  return vec.trim().replace(/\s+/g, ' ')
}

export function buildConceptLinks(
  kinds: readonly KindOfQuantity[],
  dimensions: readonly PhysicalDimension[],
  generatedDir: string,
): ConceptLinkResult {
  const dimByVector = new Map<string, PhysicalDimension>()
  for (const dim of dimensions) {
    const key = normalizeVector(dim.vectorNotation)
    const existing = dimByVector.get(key)
    // When multiple dimensions share the same vector (common for dimensionless),
    // prefer the one with more ISO entries — it's more representative.
    if (!existing || dim.isoEntries.length > existing.isoEntries.length) {
      dimByVector.set(key, dim)
    }
  }

  const kindToDimension: Record<string, KindDimensionLink> = {}
  const dimensionToKind: Record<string, DimensionKindLink> = {}

  for (const kind of kinds) {
    const kindVec = normalizeVector(kind.dimensionVector)
    const dim = dimByVector.get(kindVec)

    if (dim) {
      kindToDimension[kind.id] = {
        kindId: kind.id,
        dimensionSlug: dim.slug,
        dimensionName: dim.name,
        dimensionNistId: dim.nistId,
        dimensionUnitsmlId: dim.unitsmlId,
      }

      const dimEntryIds = new Set(dim.isoEntries.map(e => e.id))
      const kindOnly = kind.quantityIds.filter(id => !dimEntryIds.has(id))

      dimensionToKind[dim.slug] = {
        dimensionSlug: dim.slug,
        kindId: kind.id,
        kindMemberCount: kind.quantityIds.length,
        kindOnlyQuantityIds: kindOnly,
      }
    } else {
      kindToDimension[kind.id] = {
        kindId: kind.id,
        dimensionSlug: null,
        dimensionName: null,
        dimensionNistId: null,
        dimensionUnitsmlId: null,
      }
    }
  }

  writeFileSync(
    resolve(generatedDir, 'concept-links.ts'),
    `export const kindToDimension = ${JSON.stringify(kindToDimension, null, 2)} as Record<string, any>\n`
    + `export const dimensionToKind = ${JSON.stringify(dimensionToKind, null, 2)} as Record<string, any>\n`,
  )

  return { kindToDimension, dimensionToKind }
}
