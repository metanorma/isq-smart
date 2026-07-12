import type { Entry, PartMeta } from './types'
import { publisherOf } from './PartRegistry'

const PUBLISHER_NAMES: Record<string, string> = {
  ISO: 'International Organization for Standardization',
  IEC: 'International Electrotechnical Commission',
} as const

interface CitationContext {
  edNum: string
  name: string
  publisher: string
  prefix: string
}

function resolveCitationContext(entry: Entry, meta: PartMeta, edition: string): CitationContext {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  const publisher = PUBLISHER_NAMES[publisherOf(meta.partKey)] ?? PUBLISHER_NAMES.ISO
  const prefix = publisherOf(meta.partKey) === 'IEC' ? 'IEC' : 'ISO'
  return { edNum, name, publisher, prefix }
}

export function generateBibTeX(entry: Entry, meta: PartMeta, edition: string): string {
  const { edNum, name, publisher, prefix } = resolveCitationContext(entry, meta, edition)
  const key = `iso80000-${meta.partKey}-${edNum}-${entry.num.replace(/[^a-zA-Z0-9]/g, '-')}`
  return [
    `@standard{${key},`,
    `  title = {${prefix} 80000-${meta.partKey}:${edNum} -- ${meta.title}},`,
    `  entry = {${entry.num} ${name}},`,
    `  organization = {${publisher}},`,
    `  year = {${edNum}},`,
    `  url = {https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}}`,
    `}`,
  ].join('\n')
}

export function generateChicago(entry: Entry, meta: PartMeta, edition: string): string {
  const { edNum, name, publisher, prefix } = resolveCitationContext(entry, meta, edition)
  return `${prefix} 80000-${meta.partKey}:${edNum}, entry ${entry.num}, "${name}." ${publisher}.`
}

export function generateRis(entry: Entry, meta: PartMeta, edition: string): string {
  const { edNum, name, publisher, prefix } = resolveCitationContext(entry, meta, edition)
  return [
    'TY  - STD',
    `TI  - ${prefix} 80000-${meta.partKey}:${edNum} -- ${meta.title}, entry ${entry.num}: ${name}`,
    `PB  - ${publisher}`,
    `PY  - ${edNum}`,
    `UR  - https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}`,
    'ER  - ',
  ].join('\n')
}
