import { NS } from './ontologyConfig'
import { ttlObject as ttlString, ttlBlankNode, declarePrefixes, escapeTurtle } from '../lib/turtle-writer'
import { isKnownTtlPrefix } from './RdfContext'

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

export const TurtleSerializer = {
  fromJsonLd(data: Record<string, unknown>): string {
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
  },
}
