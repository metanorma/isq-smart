import type { Entry, QuantityEntry } from '../data/types'
import { getEntryName, unitUri, entryRdfClass } from './useEntry'

const ISO = 'https://w3id.org/standards/isoiec80000/ontologies/core/'
const SMART = 'https://w3id.org/standards/smart/ontologies/core/'
const DCTERMS = 'http://purl.org/dc/terms/'
const SKOS = 'http://www.w3.org/2004/02/skos/core#'
const SKOSXL = 'http://www.w3.org/2008/05/skos-xl#'

function termId(entryId: string, idx: number): string {
  return `term-${entryId}-${idx}`
}

function escapeLiteral(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function generateEntryTurtle(e: Entry, partParam: string): string {
  const lines = [
    '@prefix isoiec80000: <' + ISO + '> .',
    '@prefix smart: <' + SMART + '> .',
    '@prefix dcterms: <' + DCTERMS + '> .',
    '@prefix skos: <' + SKOS + '> .',
    '@prefix skosxl: <' + SKOSXL + '> .',
    '',
  ]

  // Term instances for designations
  e.designations.forEach((des, i) => {
    const tid = termId(e.id, i)
    lines.push(`isoiec80000:${tid} a smart:Term, skosxl:Label ;`)
    if (des.designation.en) {
      lines.push(`  skosxl:literalForm "${escapeLiteral(des.designation.en.text)}"@en ;`)
    }
    lines.push(`  smart:hasTermFormType smart:fullForm .`)
    lines.push('')
  })

  // Term instances for symbols
  ;(e.symbols ?? []).forEach((sym, i) => {
    const tid = `sym-${e.id}-${i}`
    lines.push(`isoiec80000:${tid} a smart:Term, skosxl:Label ;`)
    lines.push(`  skosxl:literalForm "${escapeLiteral(sym)}"@en ;`)
    lines.push(`  smart:hasTermFormType smart:symbol .`)
    lines.push('')
  })

  // Main entry
  lines.push(`isoiec80000:${e.id} a ${entryRdfClass(e)}, smart:TermEntry ;`)
  lines.push(`  dcterms:identifier "${e.num}" ;`)

  // skosxl:prefLabel for first designation
  if (e.designations.length > 0) {
    lines.push(`  skosxl:prefLabel isoiec80000:${termId(e.id, 0)} ;`)
  }

  // skosxl:altLabel for remaining designations
  for (let i = 1; i < e.designations.length; i++) {
    lines.push(`  skosxl:altLabel isoiec80000:${termId(e.id, i)} ;`)
  }

  // skosxl:altLabel for symbol terms
  ;(e.symbols ?? []).forEach((_sym, i) => {
    lines.push(`  skosxl:altLabel isoiec80000:sym-${e.id}-${i} ;`)
  })

  if (e.def?.en) lines.push(`  skos:definition """${escapeLiteral(e.def.en)}"""@en ;`)
  if (e.remarks?.en) lines.push(`  skos:note """${escapeLiteral(e.remarks.en)}"""@en ;`)

  if (e._tag === 'quantity') {
    for (const u of (e as QuantityEntry).units ?? []) {
      lines.push(`  isoiec80000:hasUnit isoiec80000:${unitUri(u)} ;`)
    }
  }
  lines.push('  smart:hasBindingnessType smart:normative ;')
  lines.push(`  dcterms:isPartOf isoiec80000:part-${partParam} .`)
  return lines.join('\n')
}

export function generateEntryJsonLd(e: Entry, partParam: string): object {
  // Term instances for designations
  const terms = e.designations.map((des, i) => ({
    '@id': `${ISO}${termId(e.id, i)}`,
    '@type': ['smart:Term', 'skosxl:Label'],
    'skosxl:literalForm': des.designation.en
      ? { '@value': des.designation.en.text, '@language': 'en' }
      : undefined,
    'smart:hasTermFormType': { '@id': 'smart:fullForm' },
  })).filter((t: any) => t['skosxl:literalForm'] !== undefined)

  // Term instances for symbols
  const symbolTerms = (e.symbols ?? []).map((sym, i) => ({
    '@id': `${ISO}sym-${e.id}-${i}`,
    '@type': ['smart:Term', 'skosxl:Label'],
    'skosxl:literalForm': { '@value': sym, '@language': 'en' },
    'smart:hasTermFormType': { '@id': 'smart:symbol' },
  }))

  const allTerms = [...terms, ...symbolTerms]

  const result: Record<string, unknown> = {
    '@context': {
      isoiec80000: ISO, smart: SMART, dcterms: DCTERMS, skos: SKOS, skosxl: SKOSXL,
    },
    '@graph': [
      ...allTerms,
      {
        '@id': `${ISO}${e.id}`,
        '@type': [entryRdfClass(e), 'smart:TermEntry'],
        'dcterms:identifier': e.num,
        'skosxl:prefLabel': e.designations.length > 0
          ? { '@id': `${ISO}${termId(e.id, 0)}` }
          : undefined,
        'skosxl:altLabel': [
          ...e.designations.slice(1).map((_d, i) => ({ '@id': `${ISO}${termId(e.id, i + 1)}` })),
          ...(e.symbols ?? []).map((_s, i) => ({ '@id': `${ISO}sym-${e.id}-${i}` })),
        ],
        'skos:definition': e.def?.en ? { '@value': e.def.en, '@language': 'en' } : undefined,
        'skos:note': e.remarks?.en ? { '@value': e.remarks.en, '@language': 'en' } : undefined,
        'smart:hasBindingnessType': { '@id': 'smart:normative' },
        'dcterms:isPartOf': { '@id': `${ISO}part-${partParam}` },
      },
    ],
  }

  // Add units for quantities
  if (e._tag === 'quantity') {
    const graph = result['@graph'] as Record<string, unknown>[]
    const entryNode = graph[graph.length - 1]
    const units = (e as QuantityEntry).units ?? []
    if (units.length) {
      entryNode['isoiec80000:hasUnit'] = units.map(u => ({ '@id': `isoiec80000:${unitUri(u)}` }))
    }
  }

  return result
}

export { termId, escapeLiteral }
