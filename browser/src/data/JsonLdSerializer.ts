import type { Entry, PartMeta, QuantityEntry } from './types'
import { NS, ONTOLOGY_CLASSES, ONTOLOGY_PROPERTIES, tagToClass, partQname, entryQname } from './ontologyConfig'
import type { KindOfQuantity, EntityConcept, ConceptHierarchy } from './ontology'
import { partUrn, entryUrn } from './urn'
import { jsonLdContextUrl } from './RdfContext'

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

function entrySerializer(
  entry: Entry,
  partKey: string,
  options?: {
    kindId?: string
    hierarchy?: ConceptHierarchy
    entityIds?: readonly string[]
    quantityToKind?: Record<string, string>
  },
): Record<string, unknown> {
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

export const JsonLdSerializer = {
  forEntry(
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
  },

  forKind(kind: KindOfQuantity): Record<string, unknown> {
    return {
      '@context': jsonLdContextUrl,
      '@id': kind.iri,
      '@type': [ONTOLOGY_CLASSES.KindOfQuantity, ONTOLOGY_CLASSES.TermEntry],
      [ONTOLOGY_PROPERTIES.prefLabel]: { '@value': kind.prefLabel.en, '@language': 'en' },
      [ONTOLOGY_PROPERTIES.notation]: kind.dimensionSymbol,
      [ONTOLOGY_PROPERTIES.hasMember]: kind.quantityIds.map(id => ({ '@id': entryQname(id) })),
      [ONTOLOGY_PROPERTIES.narrower]: kind.quantityIds.map(id => ({ '@id': entryQname(id) })),
    }
  },

  forEntity(entity: EntityConcept): Record<string, unknown> {
    return {
      '@context': jsonLdContextUrl,
      '@id': entity.iri,
      '@type': [ONTOLOGY_CLASSES.EntityConcept, ONTOLOGY_CLASSES.TermEntry],
      [ONTOLOGY_PROPERTIES.prefLabel]: { '@value': entity.prefLabel.en, '@language': 'en' },
      [ONTOLOGY_PROPERTIES.broader]: [{ '@id': `isq:${entity.kindId}` }],
    }
  },

  forIndex(parts: PartMeta[]) {
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
  },
}

export { entryUrn, partUrn }
