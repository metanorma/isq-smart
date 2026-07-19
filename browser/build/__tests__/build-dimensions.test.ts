import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { tmpdir } from 'node:os'
import yaml from 'js-yaml'
import { buildDimensions } from '../stages/build-dimensions'
import type { BuildContext } from '../buildContext'
import type { IsoUnit, DimensionsYaml, QuantitiesYaml } from '../stages/types'

let tmpDir: string

beforeAll(() => {
  tmpDir = mkdtempSync(resolve(tmpdir(), 'isq-dims-'))
})

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true })
})

function makeCtx(): BuildContext {
  return {
    paths: {} as any,
    isExcluded: () => false,
    routes: new Set(),
  }
}

/** Create minimal isoUnits with quantities matching unitsdb quantity names */
function makeIsoUnit(
  slug: string,
  name: string,
  quantities: { id: string; num: string; name: string; part: string }[] = [],
): IsoUnit {
  return {
    slug,
    name,
    symbols: [],
    quantityCount: quantities.length,
    parts: [...new Set(quantities.map(q => q.part))],
    sampleQuantities: quantities.slice(0, 3),
    quantities,
  }
}

describe('buildDimensions', () => {
  describe('dimension vector parsing', () => {
    it('parses base dimension vectors correctly', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1' },
            { type: 'unitsml', id: 'd:length' },
          ],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          length: { power: 1, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd1' },
          identifiers: [{ type: 'nist', id: 'NISTq1' }],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          quantity_type: 'base',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      const isoUnits: IsoUnit[] = [
        makeIsoUnit('metre', 'metre', [
          { id: 'q1', num: '3-1', name: 'length', part: '3' },
        ]),
      ]

      buildDimensions(isoUnits, tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'physical-dimensions.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return physicalDimensions')()

      const lengthDim = parsed[0]
      expect(lengthDim.name).toBe('length')
      expect(lengthDim.nistId).toBe('NISTd1')
      expect(lengthDim.unitsmlId).toBe('d:length')
      expect(lengthDim.vector).toEqual([{ base: 'L', power: 1 }])
      expect(lengthDim.vectorNotation).toBe('L')
      expect(lengthDim.dimensionless).toBe(false)
      expect(lengthDim.slug).toBe('length')
    })

    it('formats derived dimension vectors with superscript powers', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd10' },
            { type: 'unitsml', id: 'd:volume' },
          ],
          names: [{ value: 'volume', lang: 'en' }],
          short: 'volume',
          length: { power: 3, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd10' },
          identifiers: [{ type: 'nist', id: 'NISTq10' }],
          names: [{ value: 'volume', lang: 'en' }],
          short: 'volume',
          quantity_type: 'derived',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      buildDimensions([], tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'physical-dimensions.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return physicalDimensions')()

      const volumeDim = parsed[0]
      expect(volumeDim.vector).toEqual([{ base: 'L', power: 3 }])
      // Unicode superscript 3
      expect(volumeDim.vectorNotation).toBe('L³')
    })

    it('returns "1" for dimensionless vectors', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1d' },
            { type: 'unitsml', id: 'd:dimensionless' },
          ],
          names: [{ value: 'dimensionless', lang: 'en' }],
          short: 'dimensionless',
          dimensionless: true,
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd1d' },
          identifiers: [{ type: 'nist', id: 'NISTq1d' }],
          names: [{ value: 'dimensionless', lang: 'en' }],
          short: 'dimensionless',
          quantity_type: 'derived',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      buildDimensions([], tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'physical-dimensions.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return physicalDimensions')()

      const dimless = parsed.find((d: any) => d.dimensionless)
      expect(dimless).toBeDefined()
      expect(dimless.vector).toEqual([])
      expect(dimless.vectorNotation).toBe('1')
    })

    it('combines multiple base dimensions into a compound vector', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd5' },
            { type: 'unitsml', id: 'd:velocity' },
          ],
          names: [{ value: 'velocity', lang: 'en' }],
          short: 'velocity',
          length: { power: 1, symbol: 'L' },
          time: { power: -1, symbol: 'T' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd5' },
          identifiers: [{ type: 'nist', id: 'NISTq5' }],
          names: [{ value: 'velocity', lang: 'en' }],
          short: 'velocity',
          quantity_type: 'derived',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      buildDimensions([], tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'physical-dimensions.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return physicalDimensions')()

      const vel = parsed[0]
      expect(vel.vector).toContainEqual({ base: 'L', power: 1 })
      expect(vel.vector).toContainEqual({ base: 'T', power: -1 })
      // Negative superscript: T⁻¹
      expect(vel.vectorNotation).toContain('T⁻¹')
    })

    it('sorts dimensionless last and by vector length', () => {
      const dims: DimensionsYaml = {
        dimensions: [
          {
            identifiers: [{ type: 'nist', id: 'NISTd1' }, { type: 'unitsml', id: 'd:volume' }],
            names: [{ value: 'volume', lang: 'en' }],
            short: 'volume',
            length: { power: 3, symbol: 'L' },
          },
          {
            identifiers: [{ type: 'nist', id: 'NISTd2' }, { type: 'unitsml', id: 'd:mass' }],
            names: [{ value: 'mass', lang: 'en' }],
            short: 'mass',
            mass: { power: 1, symbol: 'M' },
          },
          {
            identifiers: [{ type: 'nist', id: 'NISTd3' }, { type: 'unitsml', id: 'd:dimless' }],
            names: [{ value: 'dimensionless', lang: 'en' }],
            short: 'dimensionless',
            dimensionless: true,
          },
        ],
      }

      const quants: QuantitiesYaml = { quantities: [] }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      buildDimensions([], tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'physical-dimensions.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return physicalDimensions')()

      // mass (1 base dim) before volume (1 base dim but alphabetical v > m... no: mass < volume)
      // Both have 1 base dim, so sorted by name: mass < volume
      // dimensionless last
      expect(parsed[0].shortName).toBe('mass')
      expect(parsed[1].shortName).toBe('volume')
      expect(parsed[2].shortName).toBe('dimensionless')
      expect(parsed[2].dimensionless).toBe(true)
    })
  })

  describe('unit-to-dimension linking', () => {
    it('links units to dimensions via matched quantity names', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1' },
            { type: 'unitsml', id: 'd:length' },
          ],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          length: { power: 1, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd1' },
          identifiers: [{ type: 'nist', id: 'NISTq1' }],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          quantity_type: 'base',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      const isoUnits: IsoUnit[] = [
        makeIsoUnit('metre', 'metre', [
          { id: 'q1', num: '3-1', name: 'length', part: '3' },
        ]),
      ]

      buildDimensions(isoUnits, tmpDir, makeCtx(), tmpDir)

      const content = readFileSync(resolve(tmpDir, 'physical-dimensions.ts'), 'utf-8')
      // Strip 'export ' prefix to evaluate as plain JS
      const stripped = content.replace(/^export /gm, '')
      const parsed = new Function(stripped + '; return physicalDimensions')()

      const lengthDim = parsed[0]
      // The 'metre' unit should be linked because the quantity 'length' maps to it
      expect(lengthDim.isoUnitSlugs).toContain('metre')
      expect(lengthDim.isoEntries).toHaveLength(1)
      expect(lengthDim.isoEntries[0].id).toBe('q1')
      expect(lengthDim.isoEntries[0].unitSlugs).toContain('metre')
    })

    it('enriches isoUnits with dimensionRef and dimensionSlug in-place', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1' },
            { type: 'unitsml', id: 'd:length' },
          ],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          length: { power: 1, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd1' },
          identifiers: [{ type: 'nist', id: 'NISTq1' }],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          quantity_type: 'base',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      const isoUnits: IsoUnit[] = [
        makeIsoUnit('metre', 'metre', [
          { id: 'q1', num: '3-1', name: 'length', part: '3' },
        ]),
      ]

      const result = buildDimensions(isoUnits, tmpDir, makeCtx(), tmpDir)

      // The returned array is the same enriched objects
      const metre = result.isoUnits.find(u => u.slug === 'metre')!
      expect(metre.dimensionRef).toBe('d:length')
      expect(metre.dimensionSlug).toBe('length')

      // Mutation is in-place: the original array elements are modified
      expect(isoUnits[0]!.dimensionRef).toBe('d:length')
      expect(isoUnits[0]!.dimensionSlug).toBe('length')
    })

    it('does not enrich units that have no matching dimension', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1' },
            { type: 'unitsml', id: 'd:length' },
          ],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          length: { power: 1, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd1' },
          identifiers: [{ type: 'nist', id: 'NISTq1' }],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          quantity_type: 'base',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      const isoUnits: IsoUnit[] = [
        makeIsoUnit('metre', 'metre', [
          { id: 'q1', num: '3-1', name: 'length', part: '3' },
        ]),
        makeIsoUnit('exotic', 'exotic', [
          { id: 'q2', num: '3-2', name: 'exotic quantity', part: '3' },
        ]),
      ]

      buildDimensions(isoUnits, tmpDir, makeCtx(), tmpDir)

      const exotic = isoUnits.find(u => u.slug === 'exotic')!
      expect(exotic.dimensionRef).toBeUndefined()
      expect(exotic.dimensionSlug).toBeUndefined()
    })

    it('preserves existing dimensionRef values', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1' },
            { type: 'unitsml', id: 'd:length' },
          ],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          length: { power: 1, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = {
        quantities: [{
          dimension_reference: { type: 'nist', id: 'NISTd1' },
          identifiers: [{ type: 'nist', id: 'NISTq1' }],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          quantity_type: 'base',
        }],
      }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      const isoUnits: IsoUnit[] = [
        makeIsoUnit('metre', 'metre', [
          { id: 'q1', num: '3-1', name: 'length', part: '3' },
        ]),
      ]
      // Pre-set a dimensionRef — it should not be overwritten
      isoUnits[0]!.dimensionRef = 'd:pre-existing'

      buildDimensions(isoUnits, tmpDir, makeCtx(), tmpDir)

      expect(isoUnits[0]!.dimensionRef).toBe('d:pre-existing')
    })
  })

  describe('missing unitsdb files', () => {
    it('writes empty physicalDimensions and returns units unchanged when files missing', () => {
      const emptyDir = mkdtempSync(resolve(tmpdir(), 'isq-no-dims-'))
      try {
        const isoUnits: IsoUnit[] = [
          makeIsoUnit('metre', 'metre', [
            { id: 'q1', num: '3-1', name: 'length', part: '3' },
          ]),
        ]

        const result = buildDimensions(isoUnits, emptyDir, makeCtx(), emptyDir)

        // Returns the same units unchanged
        expect(result).toBe(isoUnits)
        expect(isoUnits[0]!.dimensionRef).toBeUndefined()

        const content = readFileSync(resolve(emptyDir, 'physical-dimensions.ts'), 'utf-8')
        expect(content).toBe('export const physicalDimensions = []\n')
      } finally {
        rmSync(emptyDir, { recursive: true, force: true })
      }
    })
  })

  describe('route registration', () => {
    it('registers dimension routes in ctx', () => {
      const dims: DimensionsYaml = {
        dimensions: [{
          identifiers: [
            { type: 'nist', id: 'NISTd1' },
            { type: 'unitsml', id: 'd:length' },
          ],
          names: [{ value: 'length', lang: 'en' }],
          short: 'length',
          length: { power: 1, symbol: 'L' },
        }],
      }

      const quants: QuantitiesYaml = { quantities: [] }

      writeFileSync(resolve(tmpDir, 'dimensions.yaml'), yaml.dump(dims))
      writeFileSync(resolve(tmpDir, 'quantities.yaml'), yaml.dump(quants))

      const ctx = makeCtx()
      buildDimensions([], tmpDir, ctx, tmpDir)

      expect(ctx.routes.has('/dimensions/length')).toBe(true)
    })
  })
})
