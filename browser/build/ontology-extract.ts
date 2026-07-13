// Pure logic extracted from ontology-data-plugin.ts for testability.
// All functions are side-effect free (no file I/O) unless they take an n3 Store.

import { Store } from 'n3'
import type { ExternalMetaEntry } from './external-vocabulary'

// ── n3 library type shims (n3 ships without TypeScript declarations) ──

/** Minimal RDF term interface matching n3/lib/Term.js */
export interface RdfTerm {
  termType: 'NamedNode' | 'Literal' | 'BlankNode' | 'Variable' | 'DefaultGraph'
  value: string
}

/** Minimal RDF quad interface matching n3/lib/Quad.js */
export interface RdfQuad {
  subject: RdfTerm
  predicate: RdfTerm
  object: RdfTerm
  graph: RdfTerm
}

/** Subset of n3 Store API used by classification logic */
export interface RdfStore {
  getQuads(
    subject: string | RdfTerm | null,
    predicate: string | null,
    object: string | null,
    graph: string | null,
  ): RdfQuad[]
  getObjects(
    subject: string | RdfTerm,
    predicate: string,
    graph: string | null,
  ): RdfTerm[]
}

// ── Entity type definitions ──

/** SHACL property constraint extracted from a shape */
export interface ShapeConstraint {
  path: string
  minCount?: number
  maxCount?: number
  datatype?: string
  nodeKind?: string
  classValue?: string
  hasValue?: string
  uniqueLang?: boolean
}

/** Entity type union */
export type EntityType =
  | 'ontology'
  | 'class'
  | 'objectProperty'
  | 'datatypeProperty'
  | 'annotationProperty'
  | 'shape'
  | 'concept'
  | 'conceptScheme'
  | 'individual'
  | 'external'

/** A classified ontology entity — the central output of the extraction pipeline */
export interface OntologyBuildEntity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  type: EntityType | string
  ontology: 'isq' | 'smart' | 'external'
  scopeNote?: string
  example?: string
  altLabel?: string
  seeAlso?: string[]
  // Ontology-specific
  version?: string
  imports?: string[]
  // Class-specific
  parent?: string
  // Property-specific
  domain?: string[]
  range?: string[]
  functional?: boolean
  // Shape-specific
  targetClass?: string
  targetSubjectsOf?: string
  targetObjectsOf?: string
  constraints?: ShapeConstraint[]
  // Concept-specific
  scheme?: string
  instanceOf?: string[]
  // ConceptScheme-specific
  topConcepts?: string[]
  // Individual-specific
  identifier?: string
  isPartOf?: string[]
}

/** Metadata for display rendering of each entity type */
export interface TypeMeta {
  label: string
  color: string
  colorDot: string
}

/** Import chain entry for ontology-level imports */
export interface ImportChainEntry {
  imports: string[]
  description: string
  version?: string
}

/** Ontology namespace descriptor */
export interface OntologyNamespace {
  prefix: string
  uri: string
  title: string
  description: string
  color: string
  version: string
}

// ── RDF namespace constants ──

const OWL = 'http://www.w3.org/2002/07/owl#'
const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
const SKOS = 'http://www.w3.org/2004/02/skos/core#'
const SH = 'http://www.w3.org/ns/shacl#'
const SMART = 'https://w3id.org/standards/smart/ontologies/core/'
const ISO = 'https://w3id.org/standards/isq/ontologies/core/'

// ── Prefix extraction ──

/**
 * Extract prefix declarations from TTL file contents.
 * Pure function — no I/O.
 *
 * Mirrors the original inline logic: handles the special case where
 * an empty prefix whose URI contains "isq" is mapped to the "isq" key,
 * and deduplicates when the same URI appears with both empty and named prefixes.
 */
export function extractPrefixes(ttlContents: string[]): Record<string, string> {
  const allPrefixes: Record<string, string> = {}
  const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]*):\s*<([^>]+)>\s*\./g

  for (const content of ttlContents) {
    let m: RegExpExecArray | null
    const rx = new RegExp(prefixRegex.source, 'g')
    while ((m = rx.exec(content)) !== null) {
      const prefix = m[1]
      const uri = m[2]
      if (prefix === '' && allPrefixes['isq'] === uri) continue
      if (prefix === '' && uri.includes('isq')) {
        allPrefixes['isq'] = uri
        continue
      }
      allPrefixes[prefix] = uri
    }
  }

  // Deduplicate: if a URI has both empty and named prefixes, remove the empty one.
  const prefixUriSet = new Map<string, string[]>()
  for (const [pfx, uri] of Object.entries(allPrefixes)) {
    if (!prefixUriSet.has(uri)) prefixUriSet.set(uri, [])
    prefixUriSet.get(uri)!.push(pfx)
  }
  for (const [, pfxs] of prefixUriSet) {
    if (pfxs.includes('') && pfxs.some((p) => p !== '')) {
      delete allPrefixes['']
    }
  }

  return allPrefixes
}

// ── QName compaction ──

/**
 * Create a compaction function that converts full URIs to CURIE/qname form
 * using the provided prefix map. Prefixes are sorted by namespace URI length
 * (longest first) to ensure most-specific matches win.
 */
export function createCompactor(allPrefixes: Record<string, string>): (uri: string) => string {
  const prefixEntries = Object.entries(allPrefixes).sort((a, b) => b[1].length - a[1].length)
  return function compact(uri: string): string {
    for (const [prefix, ns] of prefixEntries) {
      if (uri.startsWith(ns)) return `${prefix}:${uri.slice(ns.length)}`
    }
    return uri
  }
}

/** Convert a qname to a URL-safe slug by replacing colons with hyphens */
export function slugFromQname(qname: string): string {
  return qname.replace(/:/g, '-')
}

// ── Entity classification ──

/** Extract a string value from an RDF term or plain string */
function lit(value: RdfTerm | string | null | undefined): string {
  if (!value) return ''
  return typeof value === 'string' ? value : value.value || ''
}

/**
 * Classify all entities in an RDF store by their OWL/SHACL/SKOS types.
 * Returns a fully typed array of OntologyBuildEntity objects.
 *
 * This is the core extraction logic — pure given an n3 Store (which can
 * be constructed from fixture TTL in tests).
 */
export function classifyEntities(
  store: RdfStore,
  allPrefixes: Record<string, string>,
): OntologyBuildEntity[] {
  const compact = createCompactor(allPrefixes)
  const entities: OntologyBuildEntity[] = []

  function getObjects(subject: string | RdfTerm, predicateUri: string): string[] {
    return store.getObjects(subject, predicateUri, null).map((o) => o.value)
  }

  function getFirst(subject: string | RdfTerm, predicateUri: string): string {
    const objs = getObjects(subject, predicateUri)
    return objs.length ? lit(objs[0]) : ''
  }

  // Collect unique subjects from the store
  const subjects = new Map<string, Set<{ predicate: string; object: RdfTerm }>>()
  for (const q of store.getQuads(null, null, null, null)) {
    const s = q.subject.value
    if (!subjects.has(s)) subjects.set(s, new Set())
    subjects.get(s)!.add({ predicate: q.predicate.value, object: q.object })
  }

  for (const [subjectUri] of subjects) {
    const types = getObjects(subjectUri, RDF + 'type')
    const qname = compact(subjectUri)
    if (subjectUri.startsWith('_:')) continue
    if (!qname.includes(':')) continue

    const ontology: OntologyBuildEntity['ontology'] = subjectUri.startsWith(ISO)
      ? 'isq'
      : subjectUri.startsWith(SMART)
        ? 'smart'
        : 'external'

    const label =
      getFirst(subjectUri, RDFS + 'label') ||
      getFirst(subjectUri, SKOS + 'prefLabel') ||
      qname.split(':').pop() ||
      ''
    const description = getFirst(subjectUri, SKOS + 'definition')
    const scopeNote = getFirst(subjectUri, SKOS + 'scopeNote')
    const example = getFirst(subjectUri, SKOS + 'example')
    const altLabel = getFirst(subjectUri, SKOS + 'altLabel')
    const seeAlso = getObjects(subjectUri, RDFS + 'seeAlso')

    const baseEntity: OntologyBuildEntity = {
      uri: subjectUri,
      qname,
      slug: slugFromQname(qname),
      label,
      description,
      scopeNote: scopeNote || undefined,
      example: example || undefined,
      altLabel: altLabel || undefined,
      seeAlso: seeAlso.length ? seeAlso : undefined,
      ontology,
    }

    if (types.includes(OWL + 'Ontology')) {
      baseEntity.type = 'ontology'
      baseEntity.version = getFirst(subjectUri, OWL + 'versionInfo')
      baseEntity.imports = getObjects(subjectUri, OWL + 'imports').map(compact)
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'Class')) {
      baseEntity.type = 'class'
      const parents = getObjects(subjectUri, RDFS + 'subClassOf')
      if (parents.length) baseEntity.parent = compact(parents[0])
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'ObjectProperty')) {
      baseEntity.type = 'objectProperty'
      baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter((q) => q.includes(':'))
      baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact).filter((q) => q.includes(':'))
      baseEntity.functional = types.includes(OWL + 'FunctionalProperty')
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'DatatypeProperty')) {
      baseEntity.type = 'datatypeProperty'
      baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter((q) => q.includes(':'))
      baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact)
      entities.push(baseEntity)
    } else if (types.includes(OWL + 'AnnotationProperty')) {
      baseEntity.type = 'annotationProperty'
      entities.push(baseEntity)
    } else if (types.includes(SH + 'NodeShape') || types.includes(SH + 'PropertyShape')) {
      baseEntity.type = 'shape'
      const tc = getObjects(subjectUri, SH + 'targetClass')
      if (tc.length) baseEntity.targetClass = compact(tc[0])
      const tso = getObjects(subjectUri, SH + 'targetSubjectsOf')
      if (tso.length) baseEntity.targetSubjectsOf = compact(tso[0])
      const too = getObjects(subjectUri, SH + 'targetObjectsOf')
      if (too.length) baseEntity.targetObjectsOf = compact(too[0])

      const propertyQuads = store.getQuads(subjectUri, SH + 'property', null, null)
      const constraints: ShapeConstraint[] = []
      for (const pq of propertyQuads) {
        const bnTerm = pq.object
        const pathTerms = store.getObjects(bnTerm, SH + 'path', null)
        if (!pathTerms.length) continue
        const pathTerm = pathTerms[0]
        let path: string
        const listItems = store.getQuads(pathTerm, RDF + 'first', null, null)
        if (listItems.length) {
          const items: string[] = []
          let listNode: RdfTerm | null = pathTerm
          let safety = 20
          while (safety-- > 0 && listNode) {
            const firsts = store.getObjects(listNode, RDF + 'first', null)
            if (firsts.length) items.push(compact(firsts[0].value))
            const rests = store.getObjects(listNode, RDF + 'rest', null)
            if (rests.length && rests[0].value !== RDF + 'nil') {
              listNode = rests[0]
            } else {
              break
            }
          }
          path = items.join(' / ')
        } else {
          path = compact(pathTerm.value)
        }
        if (!path.includes(':') && !path.includes('/')) continue
        const c: ShapeConstraint = { path }
        const minC = getFirst(bnTerm, SH + 'minCount')
        if (minC) c.minCount = parseInt(minC)
        const maxC = getFirst(bnTerm, SH + 'maxCount')
        if (maxC) c.maxCount = parseInt(maxC)
        const dt = getFirst(bnTerm, SH + 'datatype')
        if (dt) c.datatype = compact(dt)
        const nk = getFirst(bnTerm, SH + 'nodeKind')
        if (nk) c.nodeKind = compact(nk)
        const cls = getFirst(bnTerm, SH + 'class')
        if (cls) c.classValue = compact(cls)
        const hv = getFirst(bnTerm, SH + 'hasValue')
        if (hv) c.hasValue = compact(hv)
        const ul = getFirst(bnTerm, SH + 'uniqueLang')
        if (ul === 'true') c.uniqueLang = true
        constraints.push(c)
      }
      baseEntity.constraints = constraints.length ? constraints : undefined
      entities.push(baseEntity)
    } else if (types.includes(SKOS + 'Concept')) {
      baseEntity.type = 'concept'
      const schemes = getObjects(subjectUri, SKOS + 'inScheme').map(compact)
      if (schemes.length) baseEntity.scheme = schemes[0]
      baseEntity.instanceOf = types.filter((t) => t.startsWith(SMART)).map(compact).filter((q) => q !== 'skos:Concept')
      entities.push(baseEntity)
    } else if (types.includes(SKOS + 'ConceptScheme')) {
      baseEntity.type = 'conceptScheme'
      baseEntity.topConcepts = getObjects(subjectUri, SKOS + 'hasTopConcept').map(compact)
      entities.push(baseEntity)
    } else {
      const smartTypes = types.filter((t) => t.startsWith(SMART)).map(compact)
      if (
        smartTypes.length &&
        !qname.startsWith('rdf:') &&
        !qname.startsWith('owl:') &&
        !qname.startsWith('rdfs:') &&
        !qname.startsWith('xsd:')
      ) {
        baseEntity.type = 'individual'
        baseEntity.instanceOf = smartTypes
        const title = getFirst(subjectUri, 'http://purl.org/dc/terms/title')
        if (title) baseEntity.label = title
        const identifier = getFirst(subjectUri, 'http://purl.org/dc/terms/identifier')
        if (identifier) baseEntity.identifier = identifier
        const isPartOf = getObjects(subjectUri, 'http://purl.org/dc/terms/isPartOf')
        if (isPartOf.length) baseEntity.isPartOf = isPartOf.map(compact).filter((q) => q.includes(':'))
        entities.push(baseEntity)
      }
    }
  }

  return entities
}

// ── External stub generation ──

/**
 * Collect all qnames referenced by entities that are not in the defined set.
 * Used to determine which external references need stub entities.
 */
export function collectReferencedQnames(entities: OntologyBuildEntity[]): Set<string> {
  const referenced = new Set<string>()

  for (const e of entities) {
    if (e.parent) referenced.add(e.parent)
    for (const d of e.domain || []) referenced.add(d)
    for (const r of e.range || []) referenced.add(r)
    if (e.targetClass) referenced.add(e.targetClass)
    if (e.targetSubjectsOf) referenced.add(e.targetSubjectsOf)
    if (e.targetObjectsOf) referenced.add(e.targetObjectsOf)
    if (e.scheme) referenced.add(e.scheme)
    for (const t of e.instanceOf || []) referenced.add(t)
    for (const c of e.constraints || []) {
      if (c.path) referenced.add(c.path)
      if (c.datatype) referenced.add(c.datatype)
      if (c.classValue) referenced.add(c.classValue)
      if (c.nodeKind) referenced.add(c.nodeKind)
      if (c.hasValue) referenced.add(c.hasValue)
    }
  }

  return referenced
}

/**
 * Generate stub entities for externally-referenced qnames that are
 * not defined in our ontologies. Pure function.
 */
export function generateExternalStubs(
  referencedQnames: Set<string>,
  definedQnames: Set<string>,
  externalMeta: Record<string, ExternalMetaEntry>,
  allPrefixes: Record<string, string>,
): OntologyBuildEntity[] {
  const stubs: OntologyBuildEntity[] = []

  for (const qname of referencedQnames) {
    if (definedQnames.has(qname)) continue
    if (!qname.includes(':')) continue

    const localName = qname.split(':').pop() || ''
    const meta = externalMeta[qname]

    const prefix = qname.split(':')[0]
    const local = qname.split(':').slice(1).join(':')
    const nsUri = allPrefixes[prefix]
    const fullUri = nsUri ? nsUri + local : ''

    stubs.push({
      uri: fullUri,
      qname,
      slug: slugFromQname(qname),
      label: localName,
      description: meta?.description || '',
      ontology: 'external',
      type: meta?.type || 'external',
    })
  }

  return stubs
}

// ── Type metadata generation ──

/**
 * Build display metadata (label, color, colorDot) for each entity type
 * present in the entities array. Pure function.
 */
export function buildTypeMeta(entities: OntologyBuildEntity[]): Record<string, TypeMeta> {
  const entityTypes = [...new Set(entities.map((e) => e.type))]
  const typeMeta: Record<string, TypeMeta> = {}

  for (const t of entityTypes) {
    switch (t) {
      case 'class':
        typeMeta[t] = { label: 'Class', color: 'bg-blue-100 text-blue-800', colorDot: 'bg-blue-400' }
        break
      case 'objectProperty':
        typeMeta[t] = { label: 'Object Property', color: 'bg-green-100 text-green-800', colorDot: 'bg-green-400' }
        break
      case 'datatypeProperty':
        typeMeta[t] = { label: 'Datatype Property', color: 'bg-lime-100 text-lime-800', colorDot: 'bg-lime-400' }
        break
      case 'annotationProperty':
        typeMeta[t] = { label: 'Annotation Property', color: 'bg-amber-100 text-amber-800', colorDot: 'bg-amber-400' }
        break
      case 'shape':
        typeMeta[t] = { label: 'SHACL Shape', color: 'bg-purple-100 text-purple-800', colorDot: 'bg-purple-400' }
        break
      case 'concept':
        typeMeta[t] = { label: 'SKOS Concept', color: 'bg-teal-100 text-teal-800', colorDot: 'bg-teal-400' }
        break
      case 'conceptScheme':
        typeMeta[t] = { label: 'Concept Scheme', color: 'bg-cyan-100 text-cyan-800', colorDot: 'bg-cyan-400' }
        break
      case 'individual':
        typeMeta[t] = { label: 'Named Individual', color: 'bg-orange-100 text-orange-800', colorDot: 'bg-orange-400' }
        break
      case 'ontology':
        typeMeta[t] = { label: 'Ontology', color: 'bg-indigo-100 text-indigo-800', colorDot: 'bg-indigo-400' }
        break
      default:
        typeMeta[t] = { label: t, color: 'bg-slate-100 text-slate-600', colorDot: 'bg-slate-400' }
    }
  }

  return typeMeta
}

// ── Import chain ──

/**
 * Build the ontology import chain from entities that are of type 'ontology'
 * and have imports. Pure function.
 */
export function buildImportChain(
  entities: OntologyBuildEntity[],
  compact: (uri: string) => string,
): Record<string, ImportChainEntry> {
  const importChain: Record<string, ImportChainEntry> = {}
  for (const e of entities) {
    if (e.type === 'ontology' && e.imports?.length) {
      importChain[compact(e.uri)] = {
        imports: e.imports.map((imp) => compact(imp)),
        description: e.description,
        version: e.version,
      }
    }
  }
  return importChain
}

// ── Ontology namespaces ──

/**
 * Build ontology namespace descriptors with version info extracted from entities.
 * Pure function.
 */
export function buildOntologyNamespaces(entities: OntologyBuildEntity[]): OntologyNamespace[] {
  return [
    {
      prefix: 'isq',
      uri: ISO,
      title: 'ISQ Domain Ontology',
      description:
        'Domain ontology for ISO & IEC 80000 — defines Quantity, Unit, and MathConcept as extensions of the SMART Core Ontology.',
      color: 'brand',
      version:
        entities.find((e) => e.type === 'ontology' && e.uri === ISO)?.version || '1.0.0',
    },
    {
      prefix: 'smart',
      uri: SMART,
      title: 'SMART Core Ontology',
      description: 'Core Ontology for representing (SMART) content of standard as per the ISO/IEC Directives Part 2.',
      color: 'emerald',
      version:
        entities.find((e) => e.type === 'ontology' && e.uri.startsWith(SMART))?.version || '2.0.0',
    },
  ]
}
