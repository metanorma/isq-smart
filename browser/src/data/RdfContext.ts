import { NS } from './ontologyConfig'

export const jsonLdContextUrl = 'https://w3id.org/standards/isq/ontologies/core/'

export const jsonLdContext = {
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

export const ttlKnownPrefixes = new Set(
  Object.keys(jsonLdContext).filter(k => k !== 'bindingness-type'),
)

export function isKnownTtlPrefix(key: string): boolean {
  const colon = key.indexOf(':')
  if (colon < 0) return false
  return ttlKnownPrefixes.has(key.slice(0, colon))
}
