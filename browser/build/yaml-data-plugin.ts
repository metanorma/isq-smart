import type { Plugin } from 'vite'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { MathCollector } from './math-collector'
import type { BuildPaths } from './types'
import { loadEntries, filterEntries } from './stages/load-entries'
import { buildParts } from './stages/build-parts'
import { buildXrefs } from './stages/build-xrefs'
import { buildUnits } from './stages/build-units'
import { buildDimensions } from './stages/build-dimensions'
import { buildDocuments } from './stages/build-documents'
import { buildDomainIndex } from './stages/build-domain-index'

export function yamlDataPlugin(paths: BuildPaths): Plugin {
  const { sourcesDir, generatedDir, unitsdbDir } = paths

  async function generateFiles() {
    const raw = loadEntries(paths.datasetDir)
    const allEntries = filterEntries(raw)

    const allExprs = MathCollector.collect(allEntries)
    const { mathml: globalMathCache, latex: globalLatexCache } = await MathCollector.render(allExprs)

    if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })

    const { summaries, routes } = buildParts(raw, globalMathCache, globalLatexCache, generatedDir)

    buildDocuments(allEntries, sourcesDir, generatedDir)

    const isoUnits = buildUnits(raw.quantities, unitsdbDir, routes, generatedDir)

    buildDimensions(isoUnits, unitsdbDir, routes, generatedDir)

    writeFileSync(
      resolve(generatedDir, 'meta.ts'),
      `import type { PartSummary } from '../types'\n`
      + `export const partSummaries = ${JSON.stringify(summaries)} as Record<string, PartSummary>\n`,
    )

    writeFileSync(
      resolve(generatedDir, 'routes.ts'),
      `export const allRoutes: string[] = ${JSON.stringify([...routes].sort())}\n`,
    )

    buildXrefs(allEntries, generatedDir)
    buildDomainIndex(allEntries, globalMathCache, generatedDir)
  }

  return {
    name: 'yaml-data',
    async configResolved(config) {
      const isBuild = config.command === 'build'
      const metaExists = existsSync(resolve(generatedDir, 'meta.ts'))

      if (!isBuild && metaExists) {
        console.log('[yaml-data] Using cached generated data')
        return
      }

      if (!isBuild && !metaExists) {
        console.log('[yaml-data] Generating data in background...')
        generateFiles().then(() => console.log('[yaml-data] Done')).catch(e => console.error('[yaml-data] Failed:', e.message))
        return
      }

      if (isBuild && metaExists) {
        try {
          console.log('[yaml-data] Generating data files...')
          await generateFiles()
          console.log('[yaml-data] Done')
        } catch (e) {
          console.warn(`[yaml-data] Regeneration failed (${(e as Error).message}), using cached data`)
        }
        return
      }

      console.log('[yaml-data] Generating data files...')
      await generateFiles()
      console.log('[yaml-data] Done')
    },
  }
}

