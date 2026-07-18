import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { buildEntities } from '../stages/build-entities'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-ent-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function makeCtx(): BuildContext {
  return {
    paths: {} as unknown,
    isExcluded: () => false,
    routes: new Set<string>(['/']),
  } as BuildContext
}

function makeEntry(id: string, name: string, def: string, part = '10'): RawEntry {
  return {
    part,
    id,
    num: id.replace('t', ''),
    designations: [{ designation: { en: { text: name } } }],
    def: { en: def },
  }
}

describe('buildEntities', () => {
  it('detects electron entity from designation and definition', () => {
    const entries: RawEntry[] = [
      makeEntry('t10-1', 'electron mass', 'mass of the electron at rest'),
    ]
    const result = buildEntities(entries, makeCtx(), tmpDir)

    expect(result.quantityEntities['t10-1']).toContain('entity-electron')
  })

  it('detects molecule and atom entities', () => {
    const entries: RawEntry[] = [
      makeEntry('t9-1', 'number density of molecules', 'number of molecules divided by volume'),
    ]
    const result = buildEntities(entries, makeCtx(), tmpDir)

    expect(result.quantityEntities['t9-1']).toContain('entity-molecule')
  })

  it('detects wave entity', () => {
    const entries: RawEntry[] = [
      makeEntry('t3-13', 'wavelength', 'distance between consecutive wave crests'),
    ]
    const result = buildEntities(entries, makeCtx(), tmpDir)

    expect(result.quantityEntities['t3-13']).toContain('entity-wave')
  })

  it('returns empty mapping for entries with no entity references', () => {
    const entries: RawEntry[] = [
      makeEntry('t3-1.1', 'length', 'distance between two points'),
    ]
    const result = buildEntities(entries, makeCtx(), tmpDir)

    expect(result.quantityEntities['t3-1.1']).toBeUndefined()
  })

  it('provides entity kinds catalog', () => {
    const result = buildEntities([], makeCtx(), tmpDir)
    const kindIds = result.entityKinds.map(k => k.id)
    expect(kindIds).toContain('entity-kind-particle')
    expect(kindIds).toContain('entity-kind-substance')
    expect(kindIds).toContain('entity-kind-field')
  })

  it('links entities to their kind', () => {
    const result = buildEntities([], makeCtx(), tmpDir)
    const electron = result.entities.find(e => e.id === 'entity-electron')
    expect(electron?.kindId).toBe('entity-kind-particle')
  })
})
