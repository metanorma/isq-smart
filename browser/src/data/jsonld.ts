import type { Entry, PartMeta, QuantityEntry } from './types'

// ═══════════════════════════════════════════════════════════════
// URN module — encapsulated URN generation (RFC 5141)
// ═══════════════════════════════════════════════════════════════

const ISO_PARTS = new Set(['2', '3', '4', '5', '7', '8', '9', '10', '12',
  '2-5', '2-6', '2-7', '2-8', '2-9', '2-10', '2-11', '2-12', '2-13', '2-14', '2-15', '2-16', '2-17', '2-18', '2-19', '2-20',
  '11-4', '11-5', '11-6', '11-7', '11-8', '11-9'])

const YEAR_TO_ED: Record<string, string> = {
  '2019': '2', '2020': '1', '2022': '1',
}

const IEC_ED_DATES: Record<string, string> = {
  '6': '2022-11', '13': '2025-02',
}

function isIecPart(partKey: string): boolean {
  return !ISO_PARTS.has(partKey)
}

export function publisherOf(partKey: string): string {
  return isIecPart(partKey) ? 'IEC' : 'ISO'
}

function basePart(partKey: string): string {
  return partKey.includes('-') ? partKey.split('-')[0] : partKey
}

const Urn = {
  part(partKey: string, edition: string): string {
    if (isIecPart(partKey)) {
      const edDate = IEC_ED_DATES[partKey] || edition
      return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
    }
    const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
    return `urn:iso:std:iso:80000:-${basePart(partKey)}:ed-${edNum}:en`
  },

  partBilingual(partKey: string, edition: string): string {
    if (isIecPart(partKey)) {
      const edDate = IEC_ED_DATES[partKey] || edition
      return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
    }
    const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
    return `urn:iso:std:iso:80000:-${basePart(partKey)}:ed-${edNum}:en,fr`
  },

  entry(entry: Entry, partKey: string, edition: string): string {
    if (isIecPart(partKey)) {
      return `${Urn.part(partKey, edition)}${entry.num}`
    }
    return `${Urn.part(partKey, edition)}:item:${entry.num}`
  },
}

export const partUrn = Urn.part
export const partUrnFr = Urn.partBilingual
export const entryUrn = Urn.entry
export const entryUrnFr = (entry: Entry, partKey: string, edition: string) =>
  `${Urn.partBilingual(partKey, edition)}:term:${entry.num}`

// ═══════════════════════════════════════════════════════════════
// JSON-LD context — UnitsML vocabulary
// ═══════════════════════════════════════════════════════════════

export const UNITSML_CONTEXT = {
  '@context': {
    '@vocab': 'https://unitsml.org/ns/',
    iso: 'https://iso80000.org/ns/',
    id: '@id', type: '@type',
    schema_version: 'schema_version',
    identifiers: { '@id': 'identifiers', '@container': '@set' },
    names: { '@id': 'names', '@container': '@set' },
    symbols: { '@id': 'symbols', '@container': '@set' },
    value: 'value', lang: 'lang', short: 'short', root: 'root',
    quantity_type: 'quantity_type', dimensionless: 'dimensionless',
    scale_reference: 'scale_reference',
    unit_system_reference: { '@id': 'unit_system_reference', '@container': '@set' },
    dimension_reference: 'dimension_reference',
    quantity_references: { '@id': 'quantity_references', '@container': '@set' },
    root_units: { '@id': 'root_units', '@container': '@set' },
    power: 'power', base: 'base', unit_reference: 'unit_reference',
    prefix_reference: 'prefix_reference',
    references: { '@id': 'references', '@container': '@set' },
    latex: 'latex', unicode: 'unicode', ascii: 'ascii', html: 'html', mathml: 'mathml',
    uri: { '@id': 'uri', '@type': '@id' }, authority: 'authority',
    properties: 'properties', continuous: 'continuous', ordered: 'ordered',
    logarithmic: 'logarithmic', interval: 'interval', ratio: 'ratio',
    length: 'length', mass: 'mass', time: 'time',
    electric_current: 'electric_current',
    thermodynamic_temperature: 'thermodynamic_temperature',
    amount_of_substance: 'amount_of_substance',
    luminous_intensity: 'luminous_intensity',
    plane_angle: 'plane_angle', symbol: 'symbol', acceptable: 'acceptable',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// JSON-LD entry serialization
// ═══════════════════════════════════════════════════════════════

type EntrySerializer = (entry: Entry, partKey: string, edition: string) => Record<string, unknown>

const sharedFields = (entry: Entry): Record<string, unknown> => ({
  'iso:num': entry.num,
  'iso:designations': entry.designations.map(d => ({
    '@type': 'iso:Designation',
    ...(d.designation.en ? { 'iso:text_en': d.designation.en.text, 'iso:index_as_en': d.designation.en.index_as } : {}),
    ...(d.designation.fr ? { 'iso:text_fr': d.designation.fr.text, 'iso:index_as_fr': d.designation.fr.index_as } : {}),
  })),
  'iso:def': { 'iso:en': entry.def.en, ...(entry.def.fr ? { 'iso:fr': entry.def.fr } : {}) },
})

const quantitySerializer: EntrySerializer = (entry, partKey, edition) => {
  const r: Record<string, unknown> = {
    '@type': 'iso:QuantityEntry',
    '@id': `https://iso80000.org/entry/${entry.id}`,
    'iso:urn': Urn.entry(entry, partKey, edition),
    ...sharedFields(entry),
  }
  if (entry.symbols?.length) r['iso:symbols'] = entry.symbols
  if ((entry as QuantityEntry).units?.length) {
    r['iso:units'] = (entry as QuantityEntry).units!.map(u => ({
      '@type': 'iso:Unit',
      'iso:name_en': u.en, ...(u.fr ? { 'iso:name_fr': u.fr } : {}), 'iso:symbol': u.symbol,
    }))
  }
  if (entry.remarks?.en) r['iso:remarks'] = { 'iso:en': entry.remarks.en, ...(entry.remarks.fr ? { 'iso:fr': entry.remarks.fr } : {}) }
  return r
}

const mathSerializer: EntrySerializer = (entry, partKey, edition) => {
  const r: Record<string, unknown> = {
    '@type': 'iso:MathEntry',
    '@id': `https://iso80000.org/entry/${entry.id}`,
    'iso:urn': Urn.entry(entry, partKey, edition),
    ...sharedFields(entry),
  }
  if (entry.symbols?.length) r['iso:symbols'] = entry.symbols
  if (entry.remarks?.en) r['iso:remarks'] = { 'iso:en': entry.remarks.en, ...(entry.remarks.fr ? { 'iso:fr': entry.remarks.fr } : {}) }
  return r
}

const serializers: Record<string, EntrySerializer> = {
  quantity: quantitySerializer,
  math: mathSerializer,
}

function serializeEntry(entry: Entry, partKey: string, edition: string): Record<string, unknown> {
  const serializer = serializers[entry._tag]
  if (!serializer) throw new Error(`No JSON-LD serializer for entry type: ${entry._tag}`)
  return serializer(entry, partKey, edition)
}

// ═══════════════════════════════════════════════════════════════
// Public JSON-LD generators
// ═══════════════════════════════════════════════════════════════

export function generatePartJsonLd(meta: PartMeta, edition: string, entries: Entry[]) {
  return {
    '@context': '/ns/unitsml.jsonld',
    '@type': 'iso:Part',
    '@id': `https://iso80000.org/part/${meta.partKey}/${edition}`,
    'iso:urn': Urn.part(meta.partKey, edition),
    'iso:part': meta.partKey,
    'iso:domain': meta.domain,
    'iso:edition': edition,
    'iso:title': meta.title,
    'iso:description': meta.description,
    'iso:entryCount': entries.length,
    'iso:entries': { '@list': entries.map(e => serializeEntry(e, meta.partKey, edition)) },
  }
}

export function generateEntryJsonLd(entry: Entry, meta: PartMeta, edition: string) {
  const base = serializeEntry(entry, meta.partKey, edition)
  return {
    '@context': '/ns/unitsml.jsonld',
    ...base,
    'iso:partOf': {
      '@type': 'iso:Part',
      '@id': `https://iso80000.org/part/${meta.partKey}/${edition}`,
      'iso:urn': Urn.part(meta.partKey, edition),
      'iso:title': meta.title,
    },
  }
}

export function generateIndexJsonLd(parts: PartMeta[]) {
  return {
    '@context': '/ns/unitsml.jsonld',
    '@type': 'iso:PartCollection',
    '@id': 'https://iso80000.org/parts',
    'iso:parts': parts.map(p => ({
      '@type': 'iso:Part',
      '@id': `https://iso80000.org/part/${p.partKey}`,
      'iso:urn': isIecPart(p.partKey) ? `urn:iec:std:iec:80000-${p.partKey}` : `urn:iso:std:iso:80000:-${p.partKey}`,
      'iso:part': p.partKey,
      'iso:domain': p.domain,
      'iso:title': p.title,
      'iso:description': p.description,
    })),
  }
}

// ── Turtle (TTL) serialization ──

function escapeTurtle(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

function ttlObject(value: unknown): string {
  if (typeof value === 'string') {
    if (value.startsWith('https://') || value.startsWith('urn:'))
      return `<${value}>`
    if (value.startsWith('iso:'))
      return value
    return `"${escapeTurtle(value)}"`
  }
  if (Array.isArray(value)) return value.map(ttlObject).join(', ')
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([k]) => k !== '@type')
      .map(([k, v]) => `${k.startsWith('iso:') ? k : `iso:${k}`} ${ttlObject(v)}`)
      .join(' ;\n    ')
    return `[\n    ${entries}\n  ]`
  }
  return String(value)
}

export function jsonLdToTurtle(data: Record<string, unknown>): string {
  const lines: string[] = [
    '@prefix iso:   <https://iso80000.org/ns/> .',
    '@prefix unitsml: <https://unitsml.org/ns/> .',
    '@prefix rdf:   <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
    '@prefix dcterms: <http://purl.org/dc/terms/> .',
    '@prefix skos:  <http://www.w3.org/2004/02/skos/core#> .',
    '',
  ]

  const subject = data['@id'] as string
  const type = (data['@type'] as string) || 'iso:Entry'
  const triples: string[] = [`  a ${type} ;`]

  const skip = new Set(['@context', '@id', '@type'])
  for (const [key, value] of Object.entries(data)) {
    if (skip.has(key)) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        triples.push(`  ${key} ${ttlObject(item)} ;`)
      }
    } else if (typeof value === 'object' && value !== null) {
      triples.push(`  ${key} ${ttlObject(value)} ;`)
    } else {
      triples.push(`  ${key} ${ttlObject(value)} ;`)
    }
  }

  if (triples.length > 0) {
    triples[triples.length - 1] = triples[triples.length - 1].replace(/ ;$/, ' .')
  }

  lines.push(`<${subject}>`)
  lines.push(triples.join('\n'))
  lines.push('')
  return lines.join('\n')
}

// ── Citation generators ──

export function generateBibTeX(entry: Entry, meta: PartMeta, edition: string): string {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  const key = `iso80000-${meta.partKey}-${edNum}-${entry.num.replace(/[^a-zA-Z0-9]/g, '-')}`
  return [
    `@standard{${key},`,
    `  title = {ISO 80000-${meta.partKey}:${edNum} -- ${meta.title}},`,
    `  entry = {${entry.num} ${name}},`,
    `  organization = {International Organization for Standardization},`,
    `  year = {${edNum}},`,
    `  url = {https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}}`,
    `}`,
  ].join('\n')
}

export function generateChicago(entry: Entry, meta: PartMeta, edition: string): string {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  return `ISO 80000-${meta.partKey}:${edNum}, entry ${entry.num}, "${name}." International Organization for Standardization.`
}

export function generateRis(entry: Entry, meta: PartMeta, edition: string): string {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  return [
    'TY  - STD',
    `TI  - ISO 80000-${meta.partKey}:${edNum} -- ${meta.title}, entry ${entry.num}: ${name}`,
    `PB  - International Organization for Standardization`,
    `PY  - ${edNum}`,
    `UR  - https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}`,
    'ER  - ',
  ].join('\n')
}
