import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { yamlDataPlugin } from './build/yaml-data-plugin'
import { ontologyDataPlugin } from './build/ontology-data-plugin'
import type { BuildPaths } from './build/types'

const here = import.meta.dirname
const repoRoot = resolve(here, '..')
const isoIec80000Dir = resolve(repoRoot, process.env.ISO_80000_DIR || 'iso-iec-80000')
const unitsdbDir = resolve(repoRoot, process.env.UNITSDB_DIR || 'unitsdb')
const sduSmartDir = resolve(repoRoot, process.env.SDU_SMART_DIR || 'sdu-smart')

const paths: BuildPaths = {
  isoIec80000Dir,
  unitsdbDir,
  sduSmartDir,
  sourcesDir: resolve(isoIec80000Dir, 'sources'),
  datasetDir: resolve(isoIec80000Dir, 'sources/dataset'),
  generatedDir: resolve(here, 'src/data/generated'),
  ontologySrcDir: resolve(here, 'public/ontologies'),
  ontologyRefDir: resolve(sduSmartDir, 'reference-docs/smartsdu-information-model-share-c6362d946900/information_model'),
}

const missingRepos: string[] = []
if (!existsSync(isoIec80000Dir)) missingRepos.push('metanorma/iso-iec-80000')
if (!existsSync(unitsdbDir)) missingRepos.push('unitsml/unitsdb')
if (!existsSync(sduSmartDir)) missingRepos.push('metanorma/sdu-smart')
if (missingRepos.length) {
  console.error(`\n[isq-smart] Missing data repos. Clone them into the repo root:\n`)
  for (const repo of missingRepos) console.error(`  git clone https://github.com/${repo}.git`)
  console.error(`\n  Or set env vars: ISO_80000_DIR, UNITSDB_DIR, SDU_SMART_DIR\n`)
  process.exit(1)
}

const isDev = process.argv.slice(2).includes('dev')
const BUILD_BASE_PATH = '/isq-smart/'

export default defineConfig({
  base: isDev ? '/' : BUILD_BASE_PATH,
  output: 'static',
  integrations: [vue(), mdx()],
  vite: {
    plugins: [tailwindcss(), yamlDataPlugin(paths), ontologyDataPlugin(paths)],
  },
})
