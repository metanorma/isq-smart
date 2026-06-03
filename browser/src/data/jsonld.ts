import type { Entry, PartMeta, QuantityEntry } from './types'
import { NS, ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES, tagToClass, partQname, entryQname } from './ontologyConfig'
import { publisherOf } from './PartRegistry'

// ═══════════════════════════════════════════════════════════════
// URN module — encapsulated URN generation (RFC 5141)
// ═══════════════════════════════════════════════════════════════

const YEAR_TO_ED: Record<string, string> = {
  '2019': '2', '2020': '1', '2022': '1',
}

const IEC_ED_DATES: Record<string, string> = {
  '6': '2022-11', '13': '2025-02',
}

function basePart(partKey: string): string {
  return partKey.includes('-') ? partKey.split('-')[0] : partKey
}

const Urn = {
  part(partKey: string, edition: string): string {
    if (publisherOf(partKey) === 'IEC') {
      const edDate = IEC_ED_DATES[partKey] || edition
      return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
    }
    const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
    return `urn:iso:std:iso:80000:-${basePart(partKey)}:ed-${edNum}:en`
  },

  partBilingual(partKey: string, edition: string): string {
    if (publisherOf(partKey) === 'IEC') {
      const edDate = IEC_ED_DATES[partKey] || edition
      return `urn:iec:std:iec:80000-${partKey}:${edDate}:::`
    }
    const edNum = YEAR_TO_ED[edition] || edition.replace(/^.*?(\d+).*$/, '$1') || '1'
    return `urn:iso:std:iso:80000:-${basePart(partKey)}:ed-${edNum}:en,fr`
  },

  entry(entry: { num: string }, partKey: string, edition: string): string {
    if (publisherOf(partKey) === 'IEC') {
      return `${Urn.part(partKey, edition)}${entry.num}`
    }
    return `${Urn.part(partKey, edition)}:item:${entry.num}`
  },
}

export const partUrn = Urn.part
export const entryUrn = Urn.entry

// ═══════════════════════════════════════════════════════════════
// JSON-LD entry serialization — uses ontology vocabulary
// ═══════════════════════════════════════════════════════════════

const jsonLdContext = {
  [NS.core.prefix]: NS.core.uri,
  [NS.smart.prefix]: NS.smart.uri,
  dcterms: 'http://purl.org/dc/terms/',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  skosxl: 'http://www.w3.org/2008/05/skos-xl#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  'bindingness-type': 'https://w3id.org/standards/smart/ontologies/core/taxonomies/bindingness-type/',
} as const

const sharedFields = (entry: Entry): Record<string, unknown> => ({
  [ONTOLOGY_PROPERTIES.rdfType]: [tagToClass(entry._tag), ONTOLOGY_CLASSES.TermEntry],
  [ONTOLOGY_PROPERTIES.identifier]: entry.num,
  [ONTOLOGY_PROPERTIES.prefLabel]: entry.designations[0]?.designation.en?.text
    ? { '@value': entry.designations[0].designation.en.text, '@language': 'en' }
    : undefined,
  [ONTOLOGY_PROPERTIES.altLabel]: [
    ...entry.designations.slice(1).map(d => d.designation.en?.text).filter(Boolean).map(t => ({ '@value': t, '@language': 'en' })),
    ...(entry.symbols?.map(s => ({ '@value': s, '@language': 'en' })) ?? []),
  ],
  [ONTOLOGY_PROPERTIES.definition]: entry.def?.en ? { '@value': entry.def.en, '@language': 'en' } : undefined,
})

const quantitySerializer = (entry: Entry, partKey: string, edition: string): Record<string, unknown> => {
  const r: Record<string, unknown> = {
    '@id': entryQname(entry.id),
    ...sharedFields(entry),
    [ONTOLOGY_PROPERTIES.hasBindingnessType]: 'bindingness-type:normative',
    [ONTOLOGY_PROPERTIES.isPartOf]: { '@id': partQname(partKey) },
  }
  if ((entry as QuantityEntry).units?.length) {
    r[ONTOLOGY_PROPERTIES.hasUnit] = (entry as QuantityEntry).units!.map(u => ({
      '@type': ONTOLOGY_CLASSES.Unit,
      'skos:notation': u.symbol,
      [ONTOLOGY_PROPERTIES.prefLabel]: u.en ? { '@value': u.en, '@language': 'en' } : undefined,
    }))
  }
  if (entry.remarks?.en) {
    r[ONTOLOGY_PROPERTIES.note] = { '@value': entry.remarks.en, '@language': 'en' }
  }
  return r
}

const mathSerializer = (entry: Entry, partKey: string, edition: string): Record<string, unknown> => {
  const r: Record<string, unknown> = {
    '@id': entryQname(entry.id),
    ...sharedFields(entry),
    [ONTOLOGY_PROPERTIES.hasBindingnessType]: 'bindingness-type:normative',
    [ONTOLOGY_PROPERTIES.isPartOf]: { '@id': partQname(partKey) },
  }
  if (entry.remarks?.en) {
    r[ONTOLOGY_PROPERTIES.note] = { '@value': entry.remarks.en, '@language': 'en' }
  }
  return r
}

const serializers: Record<string, (entry: Entry, partKey: string, edition: string) => Record<string, unknown>> = {
  quantity: quantitySerializer,
  math: mathSerializer,
}

// ═══════════════════════════════════════════════════════════════
// Public JSON-LD generators
// ═══════════════════════════════════════════════════════════════

export function generateEntryJsonLd(entry: Entry, meta: PartMeta, edition: string) {
  const serializer = serializers[entry._tag]
  const data = serializer(entry, meta.partKey, edition)
  return {
    '@context': jsonLdContext,
    ...data,
    'iso:urn': Urn.entry(entry, meta.partKey, edition),
  }
}

export function generateIndexJsonLd(parts: PartMeta[]) {
  return {
    '@context': jsonLdContext,
    '@type': 'skos:Collection',
    '@id': 'https://w3id.org/standards/isq/parts',
    'skos:member': parts.map(p => ({
      '@id': partQname(p.partKey),
      [ONTOLOGY_PROPERTIES.identifier]: p.partKey,
      [ONTOLOGY_PROPERTIES.prefLabel]: { '@value': p.title, '@language': 'en' },
      'skos:note': { '@value': p.description, '@language': 'en' },
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

// ── TTL prefix recognition (derived from context, not hardcoded) ──

const TTL_KNOWN_PREFIXES = new Set(
  Object.keys(jsonLdContext).filter(k => k !== 'bindingness-type')
)

function isKnownTtlPrefix(key: string): boolean {
  const colon = key.indexOf(':')
  if (colon < 0) return false
  return TTL_KNOWN_PREFIXES.has(key.slice(0, colon))
}

function ttlObject(value: unknown): string {
  if (typeof value === 'string') {
    if (value.startsWith('https://') || value.startsWith('urn:'))
      return `<${value}>`
    if (isKnownTtlPrefix(value))
      return value
    return `"${escapeTurtle(value)}"`
  }
  if (Array.isArray(value)) return value.map(ttlObject).join(', ')
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([k]) => k !== '@type')
      .map(([k, v]) => `${isKnownTtlPrefix(k) ? k : `${NS.core.prefix}:${k}`} ${ttlObject(v)}`)
      .join(' ;\n    ')
    return `[\n    ${entries}\n  ]`
  }
  return String(value)
}

export function jsonLdToTurtle(data: Record<string, unknown>): string {
  const lines: string[] = [
    `@prefix isq:    <${NS.core.uri}> .`,
    `@prefix smart:  <${NS.smart.uri}> .`,
    '@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .',
    '@prefix dcterms: <http://purl.org/dc/terms/> .',
    '@prefix skos:   <http://www.w3.org/2004/02/skos/core#> .',
    '',
  ]

  const subject = data['@id'] as string
  const types = data['@type'] as string | string[]
  const typeStr = Array.isArray(types) ? types.join(', ') : (types || 'isq:Entry')
  const triples: string[] = [`  a ${typeStr} ;`]

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

const PUBLISHER_NAMES: Record<string, string> = {
  ISO: 'International Organization for Standardization',
  IEC: 'International Electrotechnical Commission',
} as const

export function generateBibTeX(entry: Entry, meta: PartMeta, edition: string): string {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  const key = `iso80000-${meta.partKey}-${edNum}-${entry.num.replace(/[^a-zA-Z0-9]/g, '-')}`
  const publisher = PUBLISHER_NAMES[publisherOf(meta.partKey)] ?? PUBLISHER_NAMES.ISO
  return [
    `@standard{${key},`,
    `  title = {ISO 80000-${meta.partKey}:${edNum} -- ${meta.title}},`,
    `  entry = {${entry.num} ${name}},`,
    `  organization = {${publisher}},`,
    `  year = {${edNum}},`,
    `  url = {https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}}`,
    `}`,
  ].join('\n')
}

export function generateChicago(entry: Entry, meta: PartMeta, edition: string): string {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  const publisher = PUBLISHER_NAMES[publisherOf(meta.partKey)] ?? PUBLISHER_NAMES.ISO
  return `ISO 80000-${meta.partKey}:${edNum}, entry ${entry.num}, "${name}." ${publisher}.`
}

export function generateRis(entry: Entry, meta: PartMeta, edition: string): string {
  const edNum = edition.replace(/^.*?(\d+).*$/, '$1') || '1'
  const name = entry.designations[0]?.designation.en?.text ?? entry.num
  const publisher = PUBLISHER_NAMES[publisherOf(meta.partKey)] ?? PUBLISHER_NAMES.ISO
  return [
    'TY  - STD',
    `TI  - ISO 80000-${meta.partKey}:${edNum} -- ${meta.title}, entry ${entry.num}: ${name}`,
    `PB  - ${publisher}`,
    `PY  - ${edNum}`,
    `UR  - https://iso80000.org/quantities/part-${meta.partKey}/${entry.id}`,
    'ER  - ',
  ].join('\n')
}
