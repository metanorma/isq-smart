import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { buildConceptLinks } from '../stages/build-concept-links'
import type { KindOfQuantity } from '../../src/data/ontology'
import type { PhysicalDimension } from '../stages/build-dimensions'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-links-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function makeKind(id: string, vec: string, quantityIds: string[]): KindOfQuantity {
  return {
    id,
    iri: `isq:${id}`,
    level: 0,
    axis: 'quantity',
    prefLabel: { en: `${id} kind` },
    dimensionVector: vec,
    dimensionSymbol: vec || '1',
    quantityIds,
  }
}

function makeDim(slug: string, vec: string, entries: { id: string }[]): PhysicalDimension {
  return {
    nistId: `NISTd_${slug}`,
    unitsmlId: `d:${slug}`,
    slug,
    name: slug.replace(/_/g, ' '),
    shortName: slug,
    dimensionless: vec === '1' || vec === '',
    vector: [],
    vectorNotation: vec,
    linkedQuantities: [],
    isoEntries: entries.map(e => ({ id: e.id, num: e.id, name: e.id, part: '3', unitSlugs: [] })),
    isoUnitSlugs: [],
  }
}

describe('buildConceptLinks', () => {
  it('links kind to matching dimension by normalized vector', () => {
    const kinds = [makeKind('kind-l', 'L', ['t3-1.1', 't3-1.2'])]
    const dims = [makeDim('length', 'L', [{ id: 't3-1.1' }])]
    const result = buildConceptLinks(kinds, dims, tmpDir)

    expect(result.kindToDimension['kind-l'].dimensionSlug).toBe('length')
    expect(result.kindToDimension['kind-l'].dimensionName).toBe('length')
  })

  it('links dimension back to its kind', () => {
    const kinds = [makeKind('kind-l', 'L', ['t3-1.1'])]
    const dims = [makeDim('length', 'L', [{ id: 't3-1.1' }])]
    const result = buildConceptLinks(kinds, dims, tmpDir)

    expect(result.dimensionToKind['length'].kindId).toBe('kind-l')
    expect(result.dimensionToKind['length'].kindMemberCount).toBe(1)
  })

  it('identifies quantities in kind but not in dimension (name match gap)', () => {
    const kinds = [makeKind('kind-l', 'L', ['t3-1.1', 't3-1.2', 't3-1.3'])]
    const dims = [makeDim('length', 'L', [{ id: 't3-1.1' }])]
    const result = buildConceptLinks(kinds, dims, tmpDir)

    expect(result.dimensionToKind['length'].kindOnlyQuantityIds).toContain('t3-1.2')
    expect(result.dimensionToKind['length'].kindOnlyQuantityIds).toContain('t3-1.3')
    expect(result.dimensionToKind['length'].kindOnlyQuantityIds).not.toContain('t3-1.1')
  })

  it('handles kind with no matching dimension', () => {
    const kinds = [makeKind('kind-unknown', 'L⁵ M⁵', ['t-x'])]
    const dims = [makeDim('length', 'L', [])]
    const result = buildConceptLinks(kinds, dims, tmpDir)

    expect(result.kindToDimension['kind-unknown'].dimensionSlug).toBeNull()
  })

  it('normalizes dimensionless vectors (empty string and "1" match)', () => {
    const kinds = [makeKind('kind-dimensionless', '', ['t-a'])]
    const dims = [makeDim('ratio', '1', [{ id: 't-a' }])]
    const result = buildConceptLinks(kinds, dims, tmpDir)

    expect(result.kindToDimension['kind-dimensionless'].dimensionSlug).toBe('ratio')
  })

  it('handles multiple kinds matching different dimensions', () => {
    const kinds = [
      makeKind('kind-l', 'L', ['t1']),
      makeKind('kind-t', 'T', ['t2']),
    ]
    const dims = [
      makeDim('length', 'L', [{ id: 't1' }]),
      makeDim('time', 'T', [{ id: 't2' }]),
    ]
    const result = buildConceptLinks(kinds, dims, tmpDir)

    expect(result.kindToDimension['kind-l'].dimensionSlug).toBe('length')
    expect(result.kindToDimension['kind-t'].dimensionSlug).toBe('time')
  })

  it('handles empty inputs', () => {
    const result = buildConceptLinks([], [], tmpDir)
    expect(Object.keys(result.kindToDimension)).toHaveLength(0)
    expect(Object.keys(result.dimensionToKind)).toHaveLength(0)
  })
})
