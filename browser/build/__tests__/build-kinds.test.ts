import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { buildKinds } from '../stages/build-kinds'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-kinds-'))
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

function makeEntry(id: string, part: string, unitSymbol?: string): RawEntry {
  return {
    part,
    id,
    num: id.replace('t', ''),
    designations: [{ designation: { en: { text: id } } }],
    def: { en: `${id} definition` },
    units: unitSymbol ? [{ en: 'unit', symbol: [unitSymbol] }] : [],
  }
}

describe('buildKinds', () => {
  it('groups quantities by dimension', () => {
    const entries: RawEntry[] = [
      makeEntry('t3-1.1', '3', 'm'),
      makeEntry('t3-1.2', '3', 'm'),
      makeEntry('t3-3', '3', 'm*s^(-1)'),
    ]
    const result = buildKinds(entries, makeCtx(), tmpDir)

    expect(result.kinds.length).toBe(2)

    const lengthKind = result.kinds.find(k => k.dimensionVector === 'L')
    expect(lengthKind).toBeDefined()
    expect(lengthKind!.quantityIds).toContain('t3-1.1')
    expect(lengthKind!.quantityIds).toContain('t3-1.2')

    const velocityKind = result.kinds.find(k => k.dimensionVector === 'L T⁻¹')
    expect(velocityKind).toBeDefined()
    expect(velocityKind!.quantityIds).toContain('t3-3')
  })

  it('links quantities to their kind via quantityToKind', () => {
    const entries: RawEntry[] = [
      makeEntry('t3-1.1', '3', 'm'),
      makeEntry('t3-3', '3', 'm/s'),
    ]
    const result = buildKinds(entries, makeCtx(), tmpDir)

    expect(result.quantityToKind['t3-1.1']).toMatch(/^kind-/)
    expect(result.quantityToKind['t3-3']).toMatch(/^kind-/)
    expect(result.quantityToKind['t3-1.1']).not.toBe(result.quantityToKind['t3-3'])
  })

  it('parses compound unit expressions with exponents', () => {
    const entries: RawEntry[] = [
      makeEntry('t4-1', '4', 'kg*m^(-1)*s^(-2)'),
    ]
    const result = buildKinds(entries, makeCtx(), tmpDir)
    const pressureKind = result.kinds.find(k => k.dimensionVector === 'L⁻¹ M T⁻²')
    expect(pressureKind).toBeDefined()
    expect(pressureKind!.quantityIds).toContain('t4-1')
  })

  it('handles dimensionless units', () => {
    const entries: RawEntry[] = [
      makeEntry('t11-4.1', '11', 'rad'),
      makeEntry('t11-4.2', '11', ''),
    ]
    const result = buildKinds(entries, makeCtx(), tmpDir)
    const dimlessKind = result.kinds.find(k => k.dimensionVector === '')
    expect(dimlessKind).toBeDefined()
  })

  it('uses curated dimension labels for common dimensions', () => {
    const entries: RawEntry[] = [
      makeEntry('t3-1.1', '3', 'm'),
    ]
    const result = buildKinds(entries, makeCtx(), tmpDir)
    const lengthKind = result.kinds[0]
    expect(lengthKind.prefLabel.en).toBe('length-type quantities')
  })

  it('auto-generates labels for unmapped dimensions', () => {
    const entries: RawEntry[] = [
      makeEntry('t-x', '3', 'cd*kg^(-1)*m^(-2)*s^(3)'),
    ]
    const result = buildKinds(entries, makeCtx(), tmpDir)
    const kind = result.kinds[0]
    expect(kind.prefLabel.en).toContain('quantities')
  })

  it('adds /kinds and /kinds/[slug] routes', () => {
    const entries: RawEntry[] = [makeEntry('t3-1.1', '3', 'm')]
    const ctx = makeCtx()
    buildKinds(entries, ctx, tmpDir)
    expect(ctx.routes.has('/kinds')).toBe(true)
    expect([...ctx.routes].some(r => r.startsWith('/kinds/'))).toBe(true)
  })
})
