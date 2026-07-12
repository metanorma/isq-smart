/**
 * Shared Turtle writer utilities used by both entry serialization
 * (src/data/serialization.ts) and ontology RDF export (src/lib/rdf.ts).
 */

export function escapeTurtle(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

export function ttlObject(value: string): string {
  if (/^https?:\/\//.test(value) || /^[a-z]+:/.test(value)) return value
  return `"${escapeTurtle(value)}"`
}

export interface PrefixDecl {
  prefix: string
  uri: string
}

export function declarePrefixes(prefixes: PrefixDecl[]): string {
  return prefixes
    .map(({ prefix, uri }) => `@prefix ${prefix}: <${uri}> .`)
    .join('\n')
}

const STANDARD_PREFIXES: PrefixDecl[] = [
  { prefix: 'rdfs', uri: 'http://www.w3.org/2000/01/rdf-schema#' },
  { prefix: 'rdf', uri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' },
  { prefix: 'owl', uri: 'http://www.w3.org/2002/07/owl#' },
  { prefix: 'skos', uri: 'http://www.w3.org/2004/02/skos/core#' },
]

export function declareStandardPrefixes(): string {
  return declarePrefixes(STANDARD_PREFIXES)
}
