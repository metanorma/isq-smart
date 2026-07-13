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

/**
 * Format a record as a Turtle blank node in bracket notation.
 *
 * Each entry becomes a predicate-object pair. The `formatPredicate` callback
 * handles any domain-specific key transformation (e.g. prefixing bare keys);
 * values are formatted recursively via `formatValue` (defaults to `ttlObject`
 * for strings and recurses into nested objects/arrays).
 *
 * The `@type` key is dropped from the output.
 */
export function ttlBlankNode(
  obj: Record<string, unknown>,
  formatPredicate: (key: string) => string,
  formatValue?: (value: unknown) => string,
): string {
  const valueFormatter = formatValue ?? ((v: unknown): string => {
    if (typeof v === 'string') return ttlObject(v)
    if (Array.isArray(v)) return v.map(item => valueFormatter(item)).join(', ')
    if (typeof v === 'object' && v !== null)
      return ttlBlankNode(v as Record<string, unknown>, formatPredicate, valueFormatter)
    return String(v)
  })

  const entries = Object.entries(obj)
    .filter(([k]) => k !== '@type')
    .map(([k, v]) => `${formatPredicate(k)} ${valueFormatter(v)}`)
    .join(' ;\n    ')
  return `[\n    ${entries}\n  ]`
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
