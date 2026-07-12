import { ontologyPrefixes } from '../data/generated/ontology'
import { escapeTurtle, declareStandardPrefixes } from './turtle-writer'
import { downloadFile } from './download'

interface Entity {
  uri: string
  qname: string
  label: string
  description: string
  ontology: string
  type: string
  parent?: string
  domain?: string[]
  range?: string[]
  functional?: boolean
  targetClass?: string
  targetSubjectsOf?: string
  targetObjectsOf?: string
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string }[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
  version?: string
  imports?: string[]
  scopeNote?: string
  example?: string
  altLabel?: string
}

function prefixFor(qname: string): string {
  return qname.split(':')[0]
}

function localFor(qname: string): string {
  return qname.split(':').slice(1).join(':')
}

function nsUri(prefix: string): string {
  return ontologyPrefixes.find((p: { prefix: string }) => p.prefix === prefix)?.uri || ''
}

export function toTurtle(entity: Entity): string {
  const lines: string[] = []
  const usedPrefixes = new Set<string>()

  usedPrefixes.add(prefixFor(entity.qname))

  const collectRefs = (...values: (string | string[] | undefined)[]) => {
    for (const v of values) {
      if (!v) continue
      if (typeof v === 'string' && v.includes(':')) usedPrefixes.add(prefixFor(v))
      if (Array.isArray(v)) v.forEach(x => { if (x.includes(':')) usedPrefixes.add(prefixFor(x)) })
    }
  }

  collectRefs(entity.parent, entity.domain, entity.range, entity.targetClass, entity.targetSubjectsOf, entity.targetObjectsOf, entity.scheme, entity.instanceOf)
  if (entity.constraints) {
    for (const c of entity.constraints) {
      collectRefs(c.path, c.datatype, c.classValue, c.nodeKind, c.hasValue)
    }
  }

  for (const pfx of usedPrefixes) {
    const uri = nsUri(pfx)
    if (uri) lines.push(`@prefix ${pfx}: <${uri}> .`)
  }
  lines.push(declareStandardPrefixes())
  lines.push('')

  const subjects: string[] = [`${entity.qname} a`]

  switch (entity.type) {
    case 'class':
      subjects.push('owl:Class')
      break
    case 'objectProperty':
      subjects.push('owl:ObjectProperty')
      break
    case 'datatypeProperty':
      subjects.push('owl:DatatypeProperty')
      break
    case 'annotationProperty':
      subjects.push('owl:AnnotationProperty')
      break
    case 'shape':
      subjects.push('sh:NodeShape')
      break
    case 'concept':
      subjects.push('skos:Concept')
      break
    case 'conceptScheme':
      subjects.push('skos:ConceptScheme')
      break
    case 'ontology':
      subjects.push('owl:Ontology')
      break
    case 'individual':
      if (entity.instanceOf?.length) {
        subjects.push(...entity.instanceOf)
      }
      break
    default:
      subjects.push('rdf:Resource')
  }

  if (entity.instanceOf?.length && entity.type !== 'individual') {
    subjects.push(...entity.instanceOf)
  }

  const predicates: string[] = []
  predicates.push(`  rdfs:label "${escapeTurtle(entity.label)}"`)

  if (entity.description) {
    predicates.push(`  skos:definition "${escapeTurtle(entity.description)}"`)
  }

  if (entity.parent) {
    predicates.push(`  rdfs:subClassOf ${entity.parent}`)
  }

  if (entity.domain?.length) {
    if (entity.domain.length === 1) {
      predicates.push(`  rdfs:domain ${entity.domain[0]}`)
    } else {
      predicates.push(`  rdfs:domain [ owl:unionOf ( ${entity.domain.join(' ')} ) ]`)
    }
  }

  if (entity.range?.length) {
    if (entity.range.length === 1) {
      predicates.push(`  rdfs:range ${entity.range[0]}`)
    } else {
      predicates.push(`  rdfs:range [ owl:unionOf ( ${entity.range.join(' ')} ) ]`)
    }
  }

  if (entity.functional) {
    predicates.push('  a owl:FunctionalProperty')
  }

  if (entity.targetClass) {
    predicates.push(`  sh:targetClass ${entity.targetClass}`)
  }

  if (entity.scheme) {
    predicates.push(`  skos:inScheme ${entity.scheme}`)
  }

  if (entity.scopeNote) {
    predicates.push(`  skos:scopeNote "${escapeTurtle(entity.scopeNote)}"`)
  }

  if (entity.version) {
    predicates.push(`  owl:versionInfo "${entity.version}"`)
  }

  if (entity.imports?.length) {
    for (const imp of entity.imports) {
      predicates.push(`  owl:imports ${imp}`)
    }
  }

  if (entity.constraints?.length) {
    for (const c of entity.constraints) {
      const parts = [`sh:path ${c.path}`]
      if (c.minCount !== undefined) parts.push(`sh:minCount ${c.minCount}`)
      if (c.maxCount !== undefined) parts.push(`sh:maxCount ${c.maxCount}`)
      if (c.datatype) parts.push(`sh:datatype ${c.datatype}`)
      if (c.classValue) parts.push(`sh:class ${c.classValue}`)
      if (c.nodeKind) parts.push(`sh:nodeKind ${c.nodeKind}`)
      if (c.hasValue) parts.push(`sh:hasValue ${c.hasValue}`)
      predicates.push(`  sh:property [\n    ${parts.join(' ;\n    ')} ;\n  ]`)
    }
  }

  const subjectLine = subjects.length === 1 ? subjects[0] : subjects.join(',\n    ')
  const predBlock = predicates.join(' ;\n')

  lines.push(`${subjectLine} ;`)
  lines.push(predBlock)
  lines.push(' .')
  lines.push('')

  return lines.join('\n')
}

export function toJsonLd(entity: Entity): string {
  const context: Record<string, string> = {}
  for (const p of ontologyPrefixes) {
    context[p.prefix || ''] = p.uri
  }

  const obj: Record<string, any> = {
    '@context': context,
    '@id': entity.qname,
  }

  switch (entity.type) {
    case 'class': obj['@type'] = 'owl:Class'; break
    case 'objectProperty': obj['@type'] = 'owl:ObjectProperty'; break
    case 'datatypeProperty': obj['@type'] = 'owl:DatatypeProperty'; break
    case 'annotationProperty': obj['@type'] = 'owl:AnnotationProperty'; break
    case 'shape': obj['@type'] = 'sh:NodeShape'; break
    case 'concept': obj['@type'] = 'skos:Concept'; break
    case 'conceptScheme': obj['@type'] = 'skos:ConceptScheme'; break
    case 'ontology': obj['@type'] = 'owl:Ontology'; break
    case 'individual':
      obj['@type'] = entity.instanceOf?.length ? entity.instanceOf : 'owl:NamedIndividual'
      break
  }

  if (entity.label) obj['rdfs:label'] = entity.label
  if (entity.description) obj['skos:definition'] = entity.description
  if (entity.parent) obj['rdfs:subClassOf'] = entity.parent
  if (entity.domain?.length) obj['rdfs:domain'] = entity.domain.length === 1 ? entity.domain[0] : entity.domain
  if (entity.range?.length) obj['rdfs:range'] = entity.range.length === 1 ? entity.range[0] : entity.range
  if (entity.targetClass) obj['sh:targetClass'] = entity.targetClass
  if (entity.scheme) obj['skos:inScheme'] = entity.scheme
  if (entity.scopeNote) obj['skos:scopeNote'] = entity.scopeNote
  if (entity.version) obj['owl:versionInfo'] = entity.version
  if (entity.imports?.length) obj['owl:imports'] = entity.imports

  if (entity.constraints?.length) {
    obj['sh:property'] = entity.constraints.map(c => {
      const prop: Record<string, any> = { 'sh:path': c.path }
      if (c.minCount !== undefined) prop['sh:minCount'] = c.minCount
      if (c.maxCount !== undefined) prop['sh:maxCount'] = c.maxCount
      if (c.datatype) prop['sh:datatype'] = c.datatype
      if (c.classValue) prop['sh:class'] = c.classValue
      if (c.nodeKind) prop['sh:nodeKind'] = c.nodeKind
      if (c.hasValue) prop['sh:hasValue'] = c.hasValue
      return prop
    })
  }

  return JSON.stringify(obj, null, 2)
}

export { downloadFile } from './download'
