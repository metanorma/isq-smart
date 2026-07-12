import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { buildXrefs } from '../stages/build-xrefs'
import type { RawEntry } from '../types'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-xref-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function makeEntry(
  id: string,
  part: number | string,
  text: string,
  def?: string,
): RawEntry {
  return {
    part,
    id,
    num: `1.1`,
    designations: [{ designation: { en: { text } } }],
    def: { en: def ?? '' },
  }
}

describe('buildXrefs', () => {
  it('builds xref map with correct hrefs for quantity entries', () => {
    const entries = [
      makeEntry('length', 3, 'length', 'The measure of distance.'),
      makeEntry('mass', 4, 'mass'),
    ]

    const { xrefMap } = buildXrefs(entries, tmpDir)

    expect(xrefMap['length']).toEqual({
      href: '/quantities/part-3/length',
      name: 'length',
    })
    expect(xrefMap['mass']).toEqual({
      href: '/quantities/part-4/mass',
      name: 'mass',
    })
  })

  it('routes math entries (part 2-x) to /math prefix', () => {
    const entries = [
      makeEntry('math-thing', '2-1', 'math thing'),
    ]

    const { xrefMap } = buildXrefs(entries, tmpDir)

    expect(xrefMap['math-thing'].href).toBe('/math/part-2-1/math-thing')
  })

  it('creates document xref entries for all parts', () => {
    const { xrefMap } = buildXrefs([], tmpDir)

    expect(xrefMap['iso80000-1']).toEqual({
      href: '/documents/part-1',
      name: 'ISO 80000-1: General',
    })
    expect(xrefMap['iec80000-6']).toEqual({
      href: '/documents/part-6',
      name: 'IEC 80000-6: Electromagnetism',
    })
    expect(xrefMap['iso80000-13']).toEqual({
      href: '/documents/part-13',
      name: 'ISO 80000-13: Information science',
    })
  })

  it('builds reverse xref map from <<target>> references in definitions', () => {
    const entries = [
      makeEntry('area', 3, 'area', 'The measure of a surface. See <<length>> for the base quantity.'),
      makeEntry('volume', 3, 'volume', 'See <<area>> and <<length>>.'),
      makeEntry('length', 3, 'length', 'The measure of distance.'),
    ]

    const { reverseXref } = buildXrefs(entries, tmpDir)

    // Both 'area' and 'volume' reference 'length'.
    expect(reverseXref['length']).toContain('area')
    expect(reverseXref['length']).toContain('volume')

    // 'volume' references 'area'.
    expect(reverseXref['area']).toContain('volume')
  })

  it('ignores xref targets that do not exist in the map', () => {
    const entries = [
      makeEntry('area', 3, 'area', 'See <<nonexistent>> for nothing.'),
    ]

    const { reverseXref } = buildXrefs(entries, tmpDir)

    expect(reverseXref['nonexistent']).toBeUndefined()
  })

  it('writes xref-map.ts and reverse-xref.ts to the generated directory', () => {
    buildXrefs([], tmpDir)

    const xrefContent = readFileSync(resolve(tmpDir, 'xref-map.ts'), 'utf-8')
    expect(xrefContent).toContain('export const xrefMap')

    const reverseContent = readFileSync(resolve(tmpDir, 'reverse-xref.ts'), 'utf-8')
    expect(reverseContent).toContain('export const reverseXref')
  })
})
