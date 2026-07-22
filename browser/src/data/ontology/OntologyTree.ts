export interface OntologyEntity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  ontology: string
  type: string
  version?: string
  imports?: string[]
}

export type EntityType =
  | 'class'
  | 'objectProperty'
  | 'datatypeProperty'
  | 'annotationProperty'
  | 'shape'
  | 'concept'
  | 'conceptScheme'
  | 'individual'
  | 'ontology'

export interface EntityTypeGroup {
  type: EntityType
  label: string
  entities: OntologyEntity[]
}

export interface OntologyGroup {
  prefix: string
  label: string
  groups: EntityTypeGroup[]
  totalCount: number
}

const TYPE_LABELS: Record<string, string> = {
  class: 'Classes',
  objectProperty: 'Object Properties',
  datatypeProperty: 'Datatype Properties',
  annotationProperty: 'Annotation Properties',
  shape: 'SHACL Shapes',
  concept: 'SKOS Concepts',
  conceptScheme: 'Concept Schemes',
  individual: 'Individuals',
  ontology: 'Ontologies',
}

const TYPE_ORDER: string[] = [
  'class',
  'objectProperty',
  'datatypeProperty',
  'annotationProperty',
  'shape',
  'concept',
  'conceptScheme',
  'individual',
  'ontology',
]

const ONTOLOGY_LABELS: Record<string, string> = {
  isq: 'ISQ Ontology',
  smart: 'SMART Core Ontology',
  external: 'External',
}

const ONTOLOGY_ORDER: string[] = ['isq', 'smart', 'external']

export function buildOntologyTree(entities: readonly OntologyEntity[]): OntologyGroup[] {
  const byOntology = new Map<string, Map<string, OntologyEntity[]>>()

  for (const entity of entities) {
    const ont = entity.ontology || 'external'
    if (!byOntology.has(ont)) byOntology.set(ont, new Map())
    const typeMap = byOntology.get(ont)!
    const type = entity.type
    if (!typeMap.has(type)) typeMap.set(type, [])
    typeMap.get(type)!.push(entity)
  }

  const groups: OntologyGroup[] = []

  const sortedOntologies = [...byOntology.keys()].sort((a, b) => {
    const ia = ONTOLOGY_ORDER.indexOf(a)
    const ib = ONTOLOGY_ORDER.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b)
  })

  for (const ont of sortedOntologies) {
    const typeMap = byOntology.get(ont)!
    const typeGroups: EntityTypeGroup[] = []
    let totalCount = 0

    for (const type of TYPE_ORDER) {
      const list = typeMap.get(type)
      if (!list || list.length === 0) continue
      list.sort((a, b) => a.label.localeCompare(b.label))
      typeGroups.push({
        type: type as EntityType,
        label: TYPE_LABELS[type] ?? type,
        entities: list,
      })
      totalCount += list.length
    }

    for (const [type, list] of typeMap) {
      if (TYPE_ORDER.includes(type)) continue
      list.sort((a, b) => a.label.localeCompare(b.label))
      typeGroups.push({
        type: type as EntityType,
        label: TYPE_LABELS[type] ?? type,
        entities: list,
      })
      totalCount += list.length
    }

    groups.push({
      prefix: ont,
      label: ONTOLOGY_LABELS[ont] ?? ont,
      groups: typeGroups,
      totalCount,
    })
  }

  return groups
}
