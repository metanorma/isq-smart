import type { Plugin } from 'vite'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { MathCollector } from './math-collector'
import type { BuildPaths } from './types'
import { createBuildContext } from './buildContext'
import { loadEntries, filterEntries } from './stages/load-entries'
import { buildParts } from './stages/build-parts'
import { buildXrefs } from './stages/build-xrefs'
import { buildUnits } from './stages/build-units'
import { buildDimensions } from './stages/build-dimensions'
import { buildDocuments } from './stages/build-documents'
import { buildDomainIndex } from './stages/build-domain-index'
import { buildKinds } from './stages/build-kinds'
import { buildHierarchy } from './stages/build-hierarchy'
import { buildEntities } from './stages/build-entities'

export function yamlDataPlugin(paths: BuildPaths): Plugin {
  const { sourcesDir, generatedDir, unitsdbDir } = paths

  async function generateFiles() {
    const raw = loadEntries(paths.datasetDir)
    const ctx = createBuildContext(paths)
    const allEntries = filterEntries(raw, ctx)

    const allExprs = MathCollector.collect(allEntries)
    const { mathml: globalMathCache, latex: globalLatexCache } = await MathCollector.render(allExprs)

    if (!existsSync(generatedDir)) mkdirSync(generatedDir, { recursive: true })

    const { summaries } = buildParts(raw, globalMathCache, globalLatexCache, generatedDir, ctx)

    const kindResult = buildKinds(raw.quantities, ctx, generatedDir)
    buildHierarchy(raw.quantities, kindResult, ctx, generatedDir)
    buildEntities(raw.quantities, ctx, generatedDir)

    buildDocuments(allEntries, sourcesDir, generatedDir, ctx)

    const isoUnits = buildUnits(raw.quantities, unitsdbDir, ctx, generatedDir)

    buildDimensions(isoUnits, unitsdbDir, ctx, generatedDir)

    writeFileSync(
      resolve(generatedDir, 'meta.ts'),
      `import type { PartSummary } from '../types'\n`
      + `export const partSummaries = ${JSON.stringify(summaries)} as Record<string, PartSummary>\n`,
    )

    writeFileSync(
      resolve(generatedDir, 'routes.ts'),
      `export const allRoutes: string[] = ${JSON.stringify([...ctx.routes].sort())}\n`,
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

      console.log('[yaml-data] Generating data files...')
      await generateFiles()
      console.log('[yaml-data] Done')
    },
  }
}
