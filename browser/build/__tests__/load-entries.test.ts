import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import yaml from 'js-yaml'
import { loadEntries, filterEntries } from '../stages/load-entries'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-load-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function makeCtx(excludedParts: string[] = []): BuildContext {
  const set = new Set(excludedParts)
  return {
    paths: {} as any,
    isExcluded: (pk: string) => set.has(pk),
    routes: new Set(),
  }
}

describe('loadEntries', () => {
  it('loads quantities and math from YAML files', () => {
    const quantities: RawEntry[] = [
      { part: 1, id: 'length', num: '1-1.1', designations: [{ designation: { en: { text: 'length' } } }], def: { en: 'distance' } },
    ]
    const math: RawEntry[] = [
      { part: '2-1', id: 'math-1', num: '2-1.1', designations: [{ designation: { en: { text: 'set' } } }], def: { en: 'a collection' } },
    ]

    writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quantities))
    writeFileSync(resolve(tmpDir, 'math.yaml'), yaml.dump(math))

    const result = loadEntries(tmpDir)

    expect(result.quantities).toHaveLength(1)
    expect(result.quantities[0].id).toBe('length')
    expect(result.math).toHaveLength(1)
    expect(result.math[0].id).toBe('math-1')
  })
})

describe('filterEntries', () => {
  const raw = {
    quantities: [
      { part: 1, id: 'q1', num: '1-1', designations: [{ designation: { en: { text: 'q1' } } }], def: { en: '' } },
      { part: 3, id: 'q3', num: '3-1', designations: [{ designation: { en: { text: 'q3' } } }], def: { en: '' } },
    ] as RawEntry[],
    math: [
      { part: '2-1', id: 'm1', num: '2-1.1', designations: [{ designation: { en: { text: 'm1' } } }], def: { en: '' } },
      { part: '2-5', id: 'm5', num: '2-5.1', designations: [{ designation: { en: { text: 'm5' } } }], def: { en: '' } },
    ] as RawEntry[],
  }

  it('returns all entries when nothing is excluded', () => {
    const filtered = filterEntries(raw, makeCtx([]))
    expect(filtered).toHaveLength(4)
    expect(filtered.map(e => e.id)).toEqual(['q1', 'q3', 'm1', 'm5'])
  })

  it('filters out entries whose part is excluded', () => {
    const filtered = filterEntries(raw, makeCtx(['3']))
    expect(filtered).toHaveLength(3)
    expect(filtered.map(e => e.id)).toEqual(['q1', 'm1', 'm5'])
  })

  it('filters out entries whose part matches by string value', () => {
    const filtered = filterEntries(raw, makeCtx(['2-1']))
    expect(filtered).toHaveLength(3)
    expect(filtered.map(e => e.id)).toEqual(['q1', 'q3', 'm5'])
  })

  it('combines quantities and math in the correct order', () => {
    const filtered = filterEntries(raw, makeCtx([]))
    // quantities first, then math
    expect(filtered[0].id).toBe('q1')
    expect(filtered[1].id).toBe('q3')
    expect(filtered[2].id).toBe('m1')
    expect(filtered[3].id).toBe('m5')
  })
})
