import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import { SiteConfig } from '../../src/site.config'
import type { RawEntry, BuildPaths } from '../types'

const isExcluded = SiteConfig.isExcluded

export function loadEntries(datasetDir: string): { quantities: RawEntry[]; math: RawEntry[] } {
  const load = (file: string) =>
    yaml.load(readFileSync(resolve(datasetDir, file), 'utf-8')) as RawEntry[]
  return { quantities: load('quantities.yaml'), math: load('math.yaml') }
}

export function filterEntries(raw: { quantities: RawEntry[]; math: RawEntry[] }): RawEntry[] {
  return [...raw.quantities, ...raw.math].filter(e => !isExcluded(e.part.toString()))
}
