import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { buildHierarchy } from '../stages/build-hierarchy'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-hier-'))
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

function makeEntry(id: string, name: string, part = '3'): RawEntry {
  return {
    part,
    id,
    num: id.replace('t', ''),
    designations: [{ designation: { en: { text: name } } }],
    def: { en: `${name} definition` },
  }
}

describe('buildHierarchy', () => {
  it('links every quantity to its kind as broader', () => {
    const entries: RawEntry[] = [makeEntry('t3-1.1', 'length')]
    const kindResult = {
      quantityToKind: { 't3-1.1': 'kind-l' },
      kinds: [{ id: 'kind-l', quantityIds: ['t3-1.1'] }],
    }
    const { hierarchy } = buildHierarchy(entries, kindResult, makeCtx(), tmpDir)

    expect(hierarchy['t3-1.1'].broader).toContain('kind-l')
    expect(hierarchy['kind-l'].narrower).toContain('t3-1.1')
  })

  it('derives broader links from "specific X" naming pattern', () => {
    const entries: RawEntry[] = [
      makeEntry('t5-1', 'entropy'),
      makeEntry('t5-2', 'specific entropy'),
    ]
    const kindResult = { quantityToKind: {}, kinds: [] }
    const { hierarchy } = buildHierarchy(entries, kindResult, makeCtx(), tmpDir)

    expect(hierarchy['t5-2']?.broader).toContain('t5-1')
    expect(hierarchy['t5-1']?.narrower).toContain('t5-2')
  })

  it('derives broader links from "massic/volumic/lineic" patterns', () => {
    const entries: RawEntry[] = [
      makeEntry('t4-2', 'density'),
      makeEntry('t4-2b', 'massic density'),
      makeEntry('t4-2c', 'volumic density'),
    ]
    const kindResult = { quantityToKind: {}, kinds: [] }
    const { hierarchy } = buildHierarchy(entries, kindResult, makeCtx(), tmpDir)

    expect(hierarchy['t4-2b']?.broader).toContain('t4-2')
    expect(hierarchy['t4-2c']?.broader).toContain('t4-2')
  })

  it('does not create false links for entries without base', () => {
    const entries: RawEntry[] = [makeEntry('t-x', 'specific unfindable')]
    const kindResult = { quantityToKind: {}, kinds: [] }
    const { hierarchy } = buildHierarchy(entries, kindResult, makeCtx(), tmpDir)

    expect(hierarchy['t-x']).toBeUndefined()
  })

  it('handles empty input gracefully', () => {
    const { hierarchy } = buildHierarchy([], { quantityToKind: {}, kinds: [] }, makeCtx(), tmpDir)
    expect(Object.keys(hierarchy)).toHaveLength(0)
  })
})
