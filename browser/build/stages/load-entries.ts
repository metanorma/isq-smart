import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { load as yamlLoad, dump as yamlDump } from 'js-yaml'
import type { RawEntry } from '../types'
import type { BuildContext } from '../buildContext'

export function loadEntries(datasetDir: string): { quantities: RawEntry[]; math: RawEntry[] } {
  const load = (file: string) =>
    yamlLoad(readFileSync(resolve(datasetDir, file), 'utf-8')) as RawEntry[]
  return { quantities: load('quantities.yaml'), math: load('math.yaml') }
}

export function filterEntries(
  raw: { quantities: RawEntry[]; math: RawEntry[] },
  ctx: BuildContext,
): RawEntry[] {
  return [...raw.quantities, ...raw.math].filter(e => !ctx.isExcluded(e.part.toString()))
}
