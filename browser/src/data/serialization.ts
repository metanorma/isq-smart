import type { Entry, PartMeta, QuantityEntry } from './types'
import { NS, ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES, tagToClass, partQname, entryQname } from './ontologyConfig'
import type { KindOfQuantity, EntityConcept, ConceptHierarchy } from './ontology'
import { partUrn, entryUrn } from './urn'
import { ttlObject as ttlString, ttlBlankNode, declarePrefixes, escapeTurtle } from '../lib/turtle-writer'

const jsonLdContextUrl = 'https://w3id.org/standards/isq/ontologies/core/'

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

const entrySerializer = (
  entry: Entry,
  partKey: string,
  options?: {
    kindId?: string
    hierarchy?: ConceptHierarchy
    entityIds?: readonly string[]
    quantityToKind?: Record<string, string>
  },
): Record<string, unknown> => {
  const r: Record<string, unknown> = {
    '@id': entryQname(entry.id),
    ...sharedFields(entry),
    [ONTOLOGY_PROPERTIES.hasBindingnessType]: 'bindingness-type:normative',
    [ONTOLOGY_PROPERTIES.isPartOf]: { '@id': partQname(partKey) },
  }
  if ('units' in entry && (entry as QuantityEntry).units?.length) {
    r[ONTOLOGY_PROPERTIES.hasUnit] = (entry as QuantityEntry).units!.map(u => ({
      '@type': ONTOLOGY_CLASSES.Unit,
      'skos:notation': u.symbol,
      [ONTOLOGY_PROPERTIES.prefLabel]: u.en ? { '@value': u.en, '@language': 'en' } : undefined,
    }))
  }
  if (entry.remarks?.en) {
    r[ONTOLOGY_PROPERTIES.note] = { '@value': entry.remarks.en, '@language': 'en' }
  }

  const kindId = options?.kindId ?? options?.quantityToKind?.[entry.id]
  if (kindId) {
    r[ONTOLOGY_PROPERTIES.hasKind] = { '@id': `isq:${kindId}` }
    r[ONTOLOGY_PROPERTIES.broader] = [{ '@id': `isq:${kindId}` }]
  }

  const node = options?.hierarchy?.[entry.id]
  if (node) {
    const narrowerFromKind = node.narrower.filter(id => id !== kindId)
    const broaderFromHierarchy = node.broader.filter(id => id !== kindId)
    if (narrowerFromKind.length > 0) {
      r[ONTOLOGY_PROPERTIES.narrower] = narrowerFromKind.map(id => ({ '@id': `isq:${id}` }))
    }
    if (broaderFromHierarchy.length > 0) {
      const existingBroader = (r[ONTOLOGY_PROPERTIES.broader] as Array<{ '@id': string }>) ?? []
      const existing = new Set(existingBroader.map(b => b['@id']))
      for (const id of broaderFromHierarchy) {
        const iri = `isq:${id}`
        if (!existing.has(iri)) existingBroader.push({ '@id': iri })
      }
      r[ONTOLOGY_PROPERTIES.broader] = existingBroader
    }
  }

  if (options?.entityIds && options.entityIds.length > 0) {
    r[ONTOLOGY_PROPERTIES.characterizes] = options.entityIds.map(id => ({ '@id': `isq:${id}` }))
  }

  return r
}

export function generateEntryJsonLd(
  entry: Entry,
  meta: PartMeta,
  edition: string,
  options?: {
    kindId?: string
    hierarchy?: ConceptHierarchy
    entityIds?: readonly string[]
    quantityToKind?: Record<string, string>
  },
) {
  const data = entrySerializer(entry, meta.partKey, options)
  return {
    '@context': jsonLdContextUrl,
    ...data,
    'iso:urn': entryUrn(entry, meta.partKey, edition),
  }
}

export function generateKindJsonLd(kind: KindOfQuantity): Record<string, unknown> {
  return {
    '@context': jsonLdContextUrl,
    '@id': kind.iri,
    '@type': [ONTOLOGY_CLASSES.KindOfQuantity, ONTOLOGY_CLASSES.TermEntry],
    [ONTOLOGY_PROPERTIES.prefLabel]: { '@value': kind.prefLabel.en, '@language': 'en' },
    [ONTOLOGY_PROPERTIES.notation]: kind.dimensionSymbol,
    [ONTOLOGY_PROPERTIES.hasMember]: kind.quantityIds.map(id => ({ '@id': entryQname(id) })),
    [ONTOLOGY_PROPERTIES.narrower]: kind.quantityIds.map(id => ({ '@id': entryQname(id) })),
  }
}

export function generateEntityJsonLd(entity: EntityConcept): Record<string, unknown> {
  return {
    '@context': jsonLdContextUrl,
    '@id': entity.iri,
    '@type': [ONTOLOGY_CLASSES.EntityConcept, ONTOLOGY_CLASSES.TermEntry],
    [ONTOLOGY_PROPERTIES.prefLabel]: { '@value': entity.prefLabel.en, '@language': 'en' },
    [ONTOLOGY_PROPERTIES.broader]: [{ '@id': `isq:${entity.kindId}` }],
  }
}

export function generateIndexJsonLd(parts: PartMeta[]) {
  return {
    '@context': jsonLdContextUrl,
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

const TTL_KNOWN_PREFIXES = new Set(
  Object.keys(jsonLdContext).filter(k => k !== 'bindingness-type')
)

function isKnownTtlPrefix(key: string): boolean {
  const colon = key.indexOf(':')
  if (colon < 0) return false
  return TTL_KNOWN_PREFIXES.has(key.slice(0, colon))
}

/**
 * Format a JSON-LD value as a Turtle object.
 *
 * Strings are domain-aware: URIs and URNs get angle brackets, known
 * JSON-LD context prefixes pass through unquoted, everything else is
 * escaped and quoted via the shared `ttlString`. Arrays join elements
 * with ", ". Objects become bracket-notation blank nodes via the shared
 * `ttlBlankNode`.
 */
function ttlValue(value: unknown): string {
  if (typeof value === 'string') {
    if (value.startsWith('https://') || value.startsWith('urn:'))
      return `<${value}>`
    if (isKnownTtlPrefix(value))
      return value
    return ttlString(value)
  }
  if (Array.isArray(value)) return value.map(ttlValue).join(', ')
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>
    if ('@value' in obj) {
      const v = String(obj['@value'])
      const lang = obj['@language'] as string | undefined
      if (lang) return `"${escapeTurtle(v)}"@${lang}`
      return ttlString(v)
    }
    if ('@id' in obj) {
      return `<${obj['@id']}>`
    }
    return ttlBlankNode(
      obj,
      (k: string) => (isKnownTtlPrefix(k) ? k : `${NS.core.prefix}:${k}`),
      ttlValue,
    )
  }
  return String(value)
}

export function jsonLdToTurtle(data: Record<string, unknown>): string {
  const prefixLines = declarePrefixes([
    { prefix: NS.core.prefix, uri: NS.core.uri },
    { prefix: NS.smart.prefix, uri: NS.smart.uri },
    { prefix: 'rdf', uri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' },
    { prefix: 'dcterms', uri: 'http://purl.org/dc/terms/' },
    { prefix: 'skos', uri: 'http://www.w3.org/2004/02/skos/core#' },
  ])

  const lines: string[] = [prefixLines, '']

  const subject = data['@id'] as string
  const types = data['@type'] as string | string[]
  const typeStr = Array.isArray(types) ? types.join(', ') : (types || 'isq:Entry')
  const triples: string[] = [`  a ${typeStr} ;`]

  const skip = new Set(['@context', '@id', '@type'])
  for (const [key, value] of Object.entries(data)) {
    if (skip.has(key)) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        triples.push(`  ${key} ${ttlValue(item)} ;`)
      }
    } else {
      triples.push(`  ${key} ${ttlValue(value)} ;`)
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
