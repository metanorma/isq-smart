import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import yaml from 'js-yaml'
import { buildUnits } from '../stages/build-units'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'
import type { UnitsmlYaml } from '../stages/types'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-units-'))
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

function makeEntry(
  id: string,
  part: number | string,
  name: string,
  units: { en: string; symbol?: string[] }[] = [],
): RawEntry {
  return {
    part,
    id,
    num: `${part}-1`,
    designations: [{ designation: { en: { text: name } } }],
    def: { en: '' },
    units,
  }
}

describe('buildUnits', () => {
  describe('unit aggregation from quantities', () => {
    it('aggregates units across quantities and parts', () => {
      const qData: RawEntry[] = [
        makeEntry('length', 3, 'length', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('wavelength', 3, 'wavelength', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('mass', 4, 'mass', [{ en: 'kilogram', symbol: ['kg'] }]),
      ]

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)

      // Two distinct unit names: metre, kilogram
      expect(units).toHaveLength(2)

      const metre = units.find(u => u.name === 'metre')!
      expect(metre).toBeDefined()
      expect(metre.symbols).toEqual(['m'])
      expect(metre.quantityCount).toBe(2)
      expect(metre.parts).toEqual(['3'])
      expect(metre.quantities.map(q => q.id)).toEqual(['length', 'wavelength'])

      const kilogram = units.find(u => u.name === 'kilogram')!
      expect(kilogram.symbols).toEqual(['kg'])
      expect(kilogram.quantityCount).toBe(1)
      expect(kilogram.parts).toEqual(['4'])
    })

    it('deduplicates symbols within the same unit', () => {
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'quantity one', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('q2', 3, 'quantity two', [{ en: 'metre', symbol: ['m', 'm'] }]),
      ]

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)

      const metre = units.find(u => u.name === 'metre')!
      // The symbol 'm' should appear once, not three times
      expect(metre.symbols).toEqual(['m'])
    })

    it('merges parts when the same unit appears in different parts', () => {
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'q1', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('q2', 4, 'q2', [{ en: 'metre', symbol: ['m'] }]),
      ]

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)
      const metre = units.find(u => u.name === 'metre')!
      expect(metre.parts).toEqual(['3', '4'])
    })

    it('generates correct slugs from unit names', () => {
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'q1', [{ en: 'Metre per Second!', symbol: ['m/s'] }]),
      ]

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)
      const u = units.find(u => u.name === 'Metre per Second!')!
      expect(u.slug).toBe('metre-per-second')
    })

    it('limits sampleQuantities to 3 entries', () => {
      const qData: RawEntry[] = [1, 2, 3, 4, 5].map(i =>
        makeEntry(`q${i}`, 3, `quantity ${i}`, [{ en: 'metre', symbol: ['m'] }]),
      )

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)
      const metre = units.find(u => u.name === 'metre')!
      expect(metre.sampleQuantities).toHaveLength(3)
      expect(metre.quantityCount).toBe(5)
    })

    it('registers unit routes in ctx', () => {
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'q1', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('q2', 3, 'q2', [{ en: 'kilogram', symbol: ['kg'] }]),
      ]

      const ctx = makeCtx()
      buildUnits(qData, tmpDir, ctx, tmpDir)

      expect(ctx.routes.has('/units/metre')).toBe(true)
      expect(ctx.routes.has('/units/kilogram')).toBe(true)
    })
  })

  describe('unitsdb enrichment', () => {
    it('enriches units with nistId, unitsmlId, refs from units.yaml', () => {
      const qData: RawEntry[] = [
        makeEntry('length', 3, 'length', [{ en: 'metre', symbol: ['m'] }]),
      ]

      const unitsml: UnitsmlYaml = {
        units: [{
          identifiers: [
            { type: 'nist', id: 'NISTu1' },
            { type: 'unitsml', id: 'u:meter' },
          ],
          names: [{ value: 'metre', lang: 'en' }],
          short: 'meter',
          references: [
            { type: 'normative', authority: 'si', uri: 'http://si.example/metre' },
          ],
          unit_system_reference: [{ type: 'unitsml', id: 'si-base' }],
          scale_reference: { type: 'unitsml', id: 'continuous_ratio' },
          root: true,
          quantity_references: [{ type: 'nist', id: 'NISTq1' }],
        }],
      }

      writeFileSync(resolve(tmpDir, 'units.yaml'), yaml.dump(unitsml))

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)
      const metre = units.find(u => u.name === 'metre')!

      expect(metre.nistId).toBe('NISTu1')
      expect(metre.unitsmlId).toBe('u:meter')
      expect(metre.refs).toEqual([
        { authority: 'si', uri: 'http://si.example/metre', type: 'normative' },
      ])
      expect(metre.unitSystems).toEqual(['si-base'])
      expect(metre.scaleRef).toBe('continuous_ratio')
      expect(metre.root).toBe(true)
      expect(metre.quantityRefs).toEqual(['NISTq1'])
    })

    it('leaves units without unitsdb match unenriched', () => {
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'q1', [{ en: 'exotic unit', symbol: ['x'] }]),
      ]

      const unitsml: UnitsmlYaml = {
        units: [{
          identifiers: [{ type: 'nist', id: 'NISTu1' }],
          names: [{ value: 'metre', lang: 'en' }],
          short: 'meter',
        }],
      }

      writeFileSync(resolve(tmpDir, 'units.yaml'), yaml.dump(unitsml))

      const units = buildUnits(qData, tmpDir, makeCtx(), tmpDir)
      const exotic = units.find(u => u.name === 'exotic unit')!

      expect(exotic.nistId).toBeUndefined()
      expect(exotic.unitsmlId).toBeUndefined()
    })

    it('handles missing units.yaml gracefully', () => {
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'q1', [{ en: 'metre', symbol: ['m'] }]),
      ]

      // No units.yaml in tmpDir for this test, but we need to use a dir
      // where units.yaml does NOT exist
      const emptyDir = mkdtempSync(resolve(tmpdir(), 'isq-no-units-'))
      try {
        const units = buildUnits(qData, emptyDir, makeCtx(), emptyDir)
        const metre = units.find(u => u.name === 'metre')!
        expect(metre.nistId).toBeUndefined()
      } finally {
        rmSync(emptyDir, { recursive: true, force: true })
      }
    })
  })

  describe('generated file output', () => {
    it('writes unitsdb.ts with units and dimensions exports', () => {
      const qData: RawEntry[] = [
        makeEntry('length', 3, 'length', [{ en: 'metre', symbol: ['m'] }]),
      ]

      buildUnits(qData, tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'unitsdb.ts'), 'utf-8')
      expect(content).toContain('export const units =')
      expect(content).toContain('export const dimensions =')
      expect(content).toContain('"metre"')
    })

    it('groups dimension sample entries by part', () => {
      const qData: RawEntry[] = [
        makeEntry('length', 3, 'length', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('mass', 4, 'mass', [{ en: 'kilogram', symbol: ['kg'] }]),
      ]

      buildUnits(qData, tmpDir, makeCtx(), tmpDir)
      const content = readFileSync(resolve(tmpDir, 'unitsdb.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return { units, dimensions }')()

      const part3 = parsed.dimensions.find((d: any) => d.partKey === '3')
      expect(part3).toBeDefined()
      expect(part3.count).toBe(1)

      const part4 = parsed.dimensions.find((d: any) => d.partKey === '4')
      expect(part4).toBeDefined()
      expect(part4.count).toBe(1)
    })
  })

  describe('excluded parts filtering', () => {
    it('the caller filters excluded parts before calling buildUnits', () => {
      // buildUnits itself does not filter — the caller (yaml-data-plugin)
      // filters via filterEntries before passing qData. This test documents
      // that buildUnits processes whatever qData it receives, and that
      // filtering happens upstream. The full pipeline test is in
      // load-entries.test.ts.
      const qData: RawEntry[] = [
        makeEntry('q1', 3, 'q1', [{ en: 'metre', symbol: ['m'] }]),
        makeEntry('q2', 6, 'q2', [{ en: 'metre', symbol: ['m'] }]),
      ]

      // Simulate upstream filtering: remove part 6
      const filtered = qData.filter(e => e.part !== 6)
      const units = buildUnits(filtered, tmpDir, makeCtx(), tmpDir)

      const metre = units.find(u => u.name === 'metre')!
      // Only part 3 quantity remains
      expect(metre.parts).toEqual(['3'])
      expect(metre.quantities).toHaveLength(1)
      expect(metre.quantities[0]!.id).toBe('q1')
    })
  })
})
