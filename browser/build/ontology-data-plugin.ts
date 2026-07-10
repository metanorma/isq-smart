import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { Parser, Store } from 'n3'
import { SiteConfig } from '../src/site.config'
import type { BuildPaths } from './types'

const isExcluded = SiteConfig.isExcluded

export function ontologyDataPlugin(paths: BuildPaths): Plugin {
  const { ontologySrcDir: ontoDir, ontologyRefDir: refDir, generatedDir: genDir } = paths

  function generateOntologyData() {
    const store = new Store()
    const parser = new Parser()

    const ttlFiles = [
      resolve(refDir, 'ontologies/core-ontology.ttl'),
      resolve(refDir, 'ontologies/external/vocabulary.ttl'),
      resolve(refDir, 'schemas/shacl/core-ontology.shacl.ttl'),
      resolve(refDir, 'schemas/shacl/annotation-ontology.shacl.ttl'),
      resolve(refDir, 'schemas/shacl/terminology-model.shacl.ttl'),
      ...readdirSync(resolve(refDir, 'taxonomies')).filter(f => f.endsWith('.ttl')).map(f => resolve(refDir, 'taxonomies', f)),
      resolve(ontoDir, 'isq.ttl'),
      resolve(ontoDir, 'isq.shacl.ttl'),
    ]

    const allPrefixes: Record<string, string> = {}
    const prefixRegex = /@prefix\s+([a-zA-Z0-9_-]*):\s*<([^>]+)>\s*\./g

    for (const file of ttlFiles) {
      if (!existsSync(file)) continue
      const content = readFileSync(file, 'utf-8')
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
      const quads = parser.parse(content)
      store.addQuads(quads)
    }

    const prefixUriSet = new Map<string, string[]>()
    for (const [pfx, uri] of Object.entries(allPrefixes)) {
      if (!prefixUriSet.has(uri)) prefixUriSet.set(uri, [])
      prefixUriSet.get(uri)!.push(pfx)
    }
    for (const [uri, pfxs] of prefixUriSet) {
      if (pfxs.includes('') && pfxs.some(p => p !== '')) {
        delete allPrefixes['']
      }
    }

    const prefixEntries = Object.entries(allPrefixes).sort((a, b) => b[1].length - a[1].length)
    function compact(uri: string): string {
      for (const [prefix, ns] of prefixEntries) {
        if (uri.startsWith(ns)) return `${prefix}:${uri.slice(ns.length)}`
      }
      return uri
    }

    function slugFromQname(qname: string): string {
      return qname.replace(/:/g, '-')
    }

    function lit(value: any): string {
      if (!value) return ''
      return typeof value === 'string' ? value : value.value || ''
    }

    const subjects = new Map<string, Set<{ predicate: string; object: any }>>()
    for (const q of store.getQuads(null, null, null, null)) {
      const s = q.subject.value
      if (!subjects.has(s)) subjects.set(s, new Set())
      subjects.get(s)!.add({ predicate: q.predicate.value, object: q.object })
    }

    const OWL = 'http://www.w3.org/2002/07/owl#'
    const RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
    const RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
    const SKOS = 'http://www.w3.org/2004/02/skos/core#'
    const SH = 'http://www.w3.org/ns/shacl#'
    const SMART = 'https://w3id.org/standards/smart/ontologies/core/'
    const ISO = 'https://w3id.org/standards/isq/ontologies/core/'

    function getObjects(subject: any, predicateUri: string): string[] {
      return store.getObjects(subject, predicateUri, null).map(o => o.value)
    }

    function getFirst(subject: any, predicateUri: string): string {
      const objs = getObjects(subject, predicateUri)
      return objs.length ? lit(objs[0]) : ''
    }

    const entities: any[] = []

    for (const [subjectUri, _predicates] of subjects) {
      const types = getObjects(subjectUri, RDF + 'type')
      const qname = compact(subjectUri)
      if (subjectUri.startsWith('_:')) continue
      if (!qname.includes(':')) continue

      const ontology = subjectUri.startsWith(ISO) ? 'isq'
        : subjectUri.startsWith(SMART) ? 'smart'
        : 'external'

      const label = getFirst(subjectUri, RDFS + 'label')
        || getFirst(subjectUri, SKOS + 'prefLabel')
        || qname.split(':').pop() || ''
      const description = getFirst(subjectUri, SKOS + 'definition')
      const scopeNote = getFirst(subjectUri, SKOS + 'scopeNote')
      const example = getFirst(subjectUri, SKOS + 'example')
      const altLabel = getFirst(subjectUri, SKOS + 'altLabel')
      const seeAlso = getObjects(subjectUri, RDFS + 'seeAlso')

      const baseEntity: any = {
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
        baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter(q => q.includes(':'))
        baseEntity.range = getObjects(subjectUri, RDFS + 'range').map(compact).filter(q => q.includes(':'))
        baseEntity.functional = types.includes(OWL + 'FunctionalProperty')
        entities.push(baseEntity)
      } else if (types.includes(OWL + 'DatatypeProperty')) {
        baseEntity.type = 'datatypeProperty'
        baseEntity.domain = getObjects(subjectUri, RDFS + 'domain').map(compact).filter(q => q.includes(':'))
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
        const constraints: any[] = []
        for (const pq of propertyQuads) {
          const bnTerm = pq.object
          const pathTerms = store.getObjects(bnTerm, SH + 'path', null)
          if (!pathTerms.length) continue
          const pathTerm = pathTerms[0]
          let path: string
          const listItems = store.getQuads(pathTerm, RDF + 'first', null, null)
          if (listItems.length) {
            const items: string[] = []
            let listNode: any = pathTerm
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
          const c: any = { path }
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
        baseEntity.instanceOf = types.filter(t => t.startsWith(SMART)).map(compact).filter(q => q !== 'skos:Concept')
        entities.push(baseEntity)
      } else if (types.includes(SKOS + 'ConceptScheme')) {
        baseEntity.type = 'conceptScheme'
        baseEntity.topConcepts = getObjects(subjectUri, SKOS + 'hasTopConcept').map(compact)
        entities.push(baseEntity)
      } else {
        const smartTypes = types.filter(t => t.startsWith(SMART)).map(compact)
        if (smartTypes.length && !qname.startsWith('rdf:') && !qname.startsWith('owl:') && !qname.startsWith('rdfs:') && !qname.startsWith('xsd:')) {
          baseEntity.type = 'individual'
          baseEntity.instanceOf = smartTypes
          const title = getFirst(subjectUri, 'http://purl.org/dc/terms/title')
          if (title) baseEntity.label = title
          const identifier = getFirst(subjectUri, 'http://purl.org/dc/terms/identifier')
          if (identifier) baseEntity.identifier = identifier
          const isPartOf = getObjects(subjectUri, 'http://purl.org/dc/terms/isPartOf')
          if (isPartOf.length) baseEntity.isPartOf = isPartOf.map(compact).filter(q => q.includes(':'))
          entities.push(baseEntity)
        }
      }
    }

    // ─── Generate stub entities for externally-referenced qnames ───

    const definedQnames = new Set(entities.map((e: any) => e.qname))
    const referencedQnames = new Set<string>()

    for (const e of entities) {
      if (e.parent) referencedQnames.add(e.parent)
      for (const d of (e.domain || [])) referencedQnames.add(d)
      for (const r of (e.range || [])) referencedQnames.add(r)
      if (e.targetClass) referencedQnames.add(e.targetClass)
      if (e.targetSubjectsOf) referencedQnames.add(e.targetSubjectsOf)
      if (e.targetObjectsOf) referencedQnames.add(e.targetObjectsOf)
      if (e.scheme) referencedQnames.add(e.scheme)
      for (const t of (e.instanceOf || [])) referencedQnames.add(t)
      for (const c of (e.constraints || [])) {
        if (c.path) referencedQnames.add(c.path)
        if (c.datatype) referencedQnames.add(c.datatype)
        if (c.classValue) referencedQnames.add(c.classValue)
        if (c.nodeKind) referencedQnames.add(c.nodeKind)
        if (c.hasValue) referencedQnames.add(c.hasValue)
      }
    }

    const externalMeta: Record<string, { type: string; description: string }> = {
      'rdf:type': { type: 'annotationProperty', description: 'The type of the subject resource.' },
      'rdf:value': { type: 'datatypeProperty', description: 'The value of the subject resource.' },
      'rdf:langString': { type: 'class', description: 'The class of RDF language-tagged string literals.' },
      'dcterms:title': { type: 'annotationProperty', description: 'A name given to the resource.' },
      'dcterms:description': { type: 'annotationProperty', description: 'An account of the resource.' },
      'dcterms:identifier': { type: 'annotationProperty', description: 'An unambiguous reference to the resource.' },
      'dcterms:isPartOf': { type: 'objectProperty', description: 'A related resource in which the described resource is physically or logically included.' },
      'dcterms:hasVersion': { type: 'objectProperty', description: 'A related resource that is a version, edition, or adaptation of the described resource.' },
      'dcterms:format': { type: 'annotationProperty', description: 'The file format, physical medium, or dimensions of the resource.' },
      'dcterms:issued': { type: 'annotationProperty', description: 'Date of formal issuance of the resource.' },
      'dcterms:replaces': { type: 'objectProperty', description: 'A related resource that is supplanted, displaced, or superseded by the described resource.' },
      'skos:prefLabel': { type: 'annotationProperty', description: 'The preferred lexical label for a resource.' },
      'skos:altLabel': { type: 'annotationProperty', description: 'An alternative lexical label for a resource.' },
      'skos:definition': { type: 'annotationProperty', description: 'A complete explanation of the intended meaning of a concept.' },
      'skos:notation': { type: 'annotationProperty', description: 'A notation is a string of characters used to uniquely identify a concept.' },
      'skos:note': { type: 'annotationProperty', description: 'A general note about a concept.' },
      'skos:scopeNote': { type: 'annotationProperty', description: 'A note that helps to clarify the meaning and/or the use of a concept.' },
      'skos:changeNote': { type: 'annotationProperty', description: 'A note about a modification to a concept.' },
      'skosxl:prefLabel': { type: 'objectProperty', description: 'Relates a resource to its preferred label as a skosxl:Label instance.' },
      'skosxl:altLabel': { type: 'objectProperty', description: 'Relates a resource to an alternative label as a skosxl:Label instance.' },
      'skosxl:literalForm': { type: 'datatypeProperty', description: 'The literal form of a skosxl:Label.' },
      'xsd:string': { type: 'class', description: 'The class of XML Schema string values.' },
      'xsd:date': { type: 'class', description: 'The class of XML Schema date values.' },
      'sh:IRI': { type: 'class', description: 'A SHACL node kind indicating the value must be an IRI.' },
      'sh:BlankNodeOrIRI': { type: 'class', description: 'A SHACL node kind indicating the value must be a blank node or IRI.' },
      'oa:hasBody': { type: 'objectProperty', description: 'The body of the annotation.' },
      'oa:hasTarget': { type: 'objectProperty', description: 'The target of the annotation.' },
      'oa:hasSelector': { type: 'objectProperty', description: 'The selector of an OA SpecificResource.' },
      'oa:hasSource': { type: 'objectProperty', description: 'The source resource of an OA SpecificResource.' },
      'dcat:distribution': { type: 'objectProperty', description: 'An available distribution of the dataset.' },
      'prov:entity': { type: 'objectProperty', description: 'The entity referenced by a prov:Derivation.' },
      'prov:qualifiedDerivation': { type: 'objectProperty', description: 'A qualified derivation relationship.' },
      'smart:hasSectionNumber': { type: 'datatypeProperty', description: 'The section number of a clause within a document.' },
      'smart:deprecatedLabel': { type: 'annotationProperty', description: 'A deprecated label for an entity.' },
    }

    for (const qname of referencedQnames) {
      if (definedQnames.has(qname)) continue
      if (!qname.includes(':')) continue

      const localName = qname.split(':').pop() || ''
      const meta = externalMeta[qname]

      const prefix = qname.split(':')[0]
      const local = qname.split(':').slice(1).join(':')
      const nsUri = allPrefixes[prefix]
      const fullUri = nsUri ? nsUri + local : ''

      entities.push({
        uri: fullUri,
        qname,
        slug: slugFromQname(qname),
        label: localName,
        description: meta?.description || '',
        ontology: 'external',
        type: meta?.type || 'external',
      })
    }

    const prefixes = Object.entries(allPrefixes).map(([prefix, uri]) => ({ prefix, uri }))

    const importChain: Record<string, any> = {}
    for (const e of entities) {
      if (e.type === 'ontology' && e.imports?.length) {
        importChain[compact(e.uri)] = {
          imports: e.imports.map((imp: string) => compact(imp)),
          description: e.description,
          version: e.version,
        }
      }
    }

    const entityTypes = [...new Set(entities.map((e: any) => e.type))]
    const typeMeta: Record<string, { label: string; color: string; colorDot: string }> = {}
    for (const t of entityTypes) {
      switch (t) {
        case 'class': typeMeta[t] = { label: 'Class', color: 'bg-blue-100 text-blue-800', colorDot: 'bg-blue-400' }; break
        case 'objectProperty': typeMeta[t] = { label: 'Object Property', color: 'bg-green-100 text-green-800', colorDot: 'bg-green-400' }; break
        case 'datatypeProperty': typeMeta[t] = { label: 'Datatype Property', color: 'bg-lime-100 text-lime-800', colorDot: 'bg-lime-400' }; break
        case 'annotationProperty': typeMeta[t] = { label: 'Annotation Property', color: 'bg-amber-100 text-amber-800', colorDot: 'bg-amber-400' }; break
        case 'shape': typeMeta[t] = { label: 'SHACL Shape', color: 'bg-purple-100 text-purple-800', colorDot: 'bg-purple-400' }; break
        case 'concept': typeMeta[t] = { label: 'SKOS Concept', color: 'bg-teal-100 text-teal-800', colorDot: 'bg-teal-400' }; break
        case 'conceptScheme': typeMeta[t] = { label: 'Concept Scheme', color: 'bg-cyan-100 text-cyan-800', colorDot: 'bg-cyan-400' }; break
        case 'individual': typeMeta[t] = { label: 'Named Individual', color: 'bg-orange-100 text-orange-800', colorDot: 'bg-orange-400' }; break
        case 'ontology': typeMeta[t] = { label: 'Ontology', color: 'bg-indigo-100 text-indigo-800', colorDot: 'bg-indigo-400' }; break
        default: typeMeta[t] = { label: t, color: 'bg-slate-100 text-slate-600', colorDot: 'bg-slate-400' }
      }
    }

    const ontologyNamespaces = [
      {
        prefix: 'isq',
        uri: ISO,
        title: 'ISQ Domain Ontology',
        description: 'Domain ontology for ISO & IEC 80000 — defines Quantity, Unit, and MathConcept as extensions of the SMART Core Ontology.',
        color: 'brand',
        version: entities.find((e: any) => e.type === 'ontology' && e.uri === ISO)?.version || '1.0.0',
      },
      {
        prefix: 'smart',
        uri: SMART,
        title: 'SMART Core Ontology',
        description: 'Core Ontology for representing (SMART) content of standard as per the ISO/IEC Directives Part 2.',
        color: 'emerald',
        version: entities.find((e: any) => e.type === 'ontology' && e.uri.startsWith(SMART))?.version || '2.0.0',
      },
    ]

    if (!existsSync(genDir)) mkdirSync(genDir, { recursive: true })

    writeFileSync(
      resolve(genDir, 'ontology.ts'),
      `// Auto-generated from TTL files by ontology-data Vite plugin\n`
      + `// Do not edit manually\n\n`
      + `export const ontologyEntities = ${JSON.stringify(entities, null, 2)} as const\n\n`
      + `export const ontologyPrefixes = ${JSON.stringify(prefixes)} as const\n\n`
      + `export const ontologyImportChain = ${JSON.stringify(importChain)} as const\n\n`
      + `export const ontologyTypeMeta = ${JSON.stringify(typeMeta)} as const\n\n`
      + `export const ontologyNamespaces = ${JSON.stringify(ontologyNamespaces)} as const\n\n`
      + `export type OntologyEntity = typeof ontologyEntities[number]\n`
    )
  }

  return {
    name: 'ontology-data',
    async configResolved(config) {
      const isBuild = config.command === 'build'
      const exists = existsSync(resolve(genDir, 'ontology.ts'))

      if (!isBuild && exists) {
        console.log('[ontology-data] Using cached generated data')
        return
      }

      console.log('[ontology-data] Generating ontology data...')
      generateOntologyData()
      console.log('[ontology-data] Done')
    },
  }
}
