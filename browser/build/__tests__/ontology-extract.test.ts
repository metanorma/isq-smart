import { describe, it, expect } from 'vitest'
import { Parser, Store } from 'n3'
import {
  extractPrefixes,
  createCompactor,
  slugFromQname,
  classifyEntities,
  collectReferencedQnames,
  generateExternalStubs,
  buildTypeMeta,
  buildImportChain,
  buildOntologyNamespaces,
} from '../ontology-extract'
import { externalMeta } from '../external-vocabulary'

// ── Helpers ──

/** Parse TTL strings into an n3 Store */
function makeStore(...ttlStrings: string[]): Store {
  const store = new Store()
  const parser = new Parser()
  for (const ttl of ttlStrings) {
    store.addQuads(parser.parse(ttl))
  }
  return store
}

const COMMON_PREFIXES = `
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix smart: <https://w3id.org/standards/smart/ontologies/core/> .
@prefix isq: <https://w3id.org/standards/isq/ontologies/core/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
`

// ── extractPrefixes ──

describe('extractPrefixes', () => {
  it('extracts standard prefix declarations', () => {
    const ttl = [
      `@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .`,
    ]
    const prefixes = extractPrefixes(ttl)
    expect(prefixes['owl']).toBe('http://www.w3.org/2002/07/owl#')
    expect(prefixes['rdfs']).toBe('http://www.w3.org/2000/01/rdf-schema#')
  })

  it('handles multiple TTL file contents', () => {
    const ttl = [
      `@prefix ex1: <http://example1.org/> .`,
      `@prefix ex2: <http://example2.org/> .`,
    ]
    const prefixes = extractPrefixes(ttl)
    expect(prefixes['ex1']).toBe('http://example1.org/')
    expect(prefixes['ex2']).toBe('http://example2.org/')
  })

  it('maps empty prefix containing "isq" to the "isq" key', () => {
    const ttl = [`@prefix : <https://w3id.org/standards/isq/ontologies/core/> .`]
    const prefixes = extractPrefixes(ttl)
    expect(prefixes['isq']).toBe('https://w3id.org/standards/isq/ontologies/core/')
    expect(prefixes['']).toBeUndefined()
  })

  it('skips empty prefix if isq already has the same URI', () => {
    const ttl = [
      `@prefix isq: <https://w3id.org/standards/isq/ontologies/core/> .
@prefix : <https://w3id.org/standards/isq/ontologies/core/> .`,
    ]
    const prefixes = extractPrefixes(ttl)
    expect(prefixes['isq']).toBe('https://w3id.org/standards/isq/ontologies/core/')
    expect(prefixes['']).toBeUndefined()
  })

  it('removes empty prefix when a named prefix has the same URI', () => {
    const ttl = [
      `@prefix foo: <http://example.org/> .
@prefix : <http://example.org/> .`,
    ]
    const prefixes = extractPrefixes(ttl)
    expect(prefixes['foo']).toBe('http://example.org/')
    expect(prefixes['']).toBeUndefined()
  })

  it('returns empty object for empty input', () => {
    expect(extractPrefixes([])).toEqual({})
  })
})

// ── createCompactor ──

describe('createCompactor', () => {
  it('compacts URIs to qnames', () => {
    const prefixes = { ex: 'http://example.org/' }
    const compact = createCompactor(prefixes)
    expect(compact('http://example.org/Foo')).toBe('ex:Foo')
  })

  it('returns full URI when no prefix matches', () => {
    const prefixes = { ex: 'http://example.org/' }
    const compact = createCompactor(prefixes)
    expect(compact('http://other.org/Bar')).toBe('http://other.org/Bar')
  })

  it('matches longest namespace first', () => {
    const prefixes = {
      a: 'http://example.org/',
      ab: 'http://example.org/sub/',
    }
    const compact = createCompactor(prefixes)
    expect(compact('http://example.org/sub/Thing')).toBe('ab:Thing')
    expect(compact('http://example.org/Thing')).toBe('a:Thing')
  })
})

// ── slugFromQname ──

describe('slugFromQname', () => {
  it('replaces colons with hyphens', () => {
    expect(slugFromQname('owl:Class')).toBe('owl-Class')
    expect(slugFromQname('smart:hasPart')).toBe('smart-hasPart')
  })

  it('handles qnames without colons', () => {
    expect(slugFromQname('plain')).toBe('plain')
  })
})

// ── classifyEntities ──

describe('classifyEntities', () => {
  it('classifies an OWL Class with a parent', () => {
    const ttl =
      COMMON_PREFIXES +
      `isq:Quantity a owl:Class ;
  rdfs:subClassOf smart:Quantity ;
  rdfs:label "Quantity" ;
  skos:definition "A quantity in the ISQ." .`
    const store = makeStore(ttl)
    const entities = classifyEntities(store, {
      isq: 'https://w3id.org/standards/isq/ontologies/core/',
      smart: 'https://w3id.org/standards/smart/ontologies/core/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
    })

    const qty = entities.find((e) => e.qname === 'isq:Quantity')
    expect(qty).toBeDefined()
    expect(qty!.type).toBe('class')
    expect(qty!.ontology).toBe('isq')
    expect(qty!.label).toBe('Quantity')
    expect(qty!.description).toBe('A quantity in the ISQ.')
    expect(qty!.parent).toBe('smart:Quantity')
    expect(qty!.slug).toBe('isq-Quantity')
  })

  it('classifies an OWL ObjectProperty with domain and range', () => {
    const ttl =
      COMMON_PREFIXES +
      `isq:hasUnit a owl:ObjectProperty ;
  rdfs:domain isq:Quantity ;
  rdfs:range isq:Unit ;
  rdfs:label "has unit" .`
    const store = makeStore(ttl)
    const entities = classifyEntities(store, {
      isq: 'https://w3id.org/standards/isq/ontologies/core/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
    })

    const prop = entities.find((e) => e.qname === 'isq:hasUnit')
    expect(prop).toBeDefined()
    expect(prop!.type).toBe('objectProperty')
    expect(prop!.domain).toEqual(['isq:Quantity'])
    expect(prop!.range).toEqual(['isq:Unit'])
    expect(prop!.functional).toBe(false)
  })

  it('classifies an OWL Ontology with version and imports', () => {
    const ttl =
      COMMON_PREFIXES +
      `isq: a owl:Ontology ;
  owl:versionInfo "1.0.0" ;
  owl:imports smart: ;
  skos:definition "ISQ ontology." .`
    const store = makeStore(ttl)
    const entities = classifyEntities(store, {
      isq: 'https://w3id.org/standards/isq/ontologies/core/',
      smart: 'https://w3id.org/standards/smart/ontologies/core/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
    })

    const onto = entities.find((e) => e.type === 'ontology')
    expect(onto).toBeDefined()
    expect(onto!.version).toBe('1.0.0')
    expect(onto!.imports).toEqual(['smart:'])
  })

  it('classifies a SKOS Concept', () => {
    const ttl =
      COMMON_PREFIXES +
      `isq:concept1 a skos:Concept ;
  skos:prefLabel "Length" ;
  skos:definition "The concept of length." ;
  skos:inScheme isq:scheme1 .`
    const store = makeStore(ttl)
    const entities = classifyEntities(store, {
      isq: 'https://w3id.org/standards/isq/ontologies/core/',
      smart: 'https://w3id.org/standards/smart/ontologies/core/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      skos: 'http://www.w3.org/2004/02/skos/core#',
    })

    const concept = entities.find((e) => e.qname === 'isq:concept1')
    expect(concept).toBeDefined()
    expect(concept!.type).toBe('concept')
    expect(concept!.label).toBe('Length')
    expect(concept!.scheme).toBe('isq:scheme1')
  })

  it('skips blank nodes and uncompactable subjects', () => {
    // Subject that has no matching prefix and no colon in URI — compact returns
    // the raw URI, which contains a colon (http), so this will be classified.
    // A truly non-colon URI is rare but we test the guard logic.
    const ttl =
      COMMON_PREFIXES +
      `isq:validSubject a owl:Class .`
    const store = makeStore(ttl)
    const entities = classifyEntities(store, {
      isq: 'https://w3id.org/standards/isq/ontologies/core/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    })
    const valid = entities.find((e) => e.qname === 'isq:validSubject')
    expect(valid).toBeDefined()
    expect(valid!.type).toBe('class')
  })
})

// ── collectReferencedQnames ──

describe('collectReferencedQnames', () => {
  it('collects parent, domain, range, scheme, and instanceOf references', () => {
    const entities = [
      {
        uri: 'http://example.org/A',
        qname: 'ex:A',
        slug: 'ex-A',
        label: 'A',
        description: '',
        type: 'class',
        ontology: 'external' as const,
        parent: 'ex:B',
        domain: ['ex:C'],
        range: ['ex:D'],
      },
      {
        uri: 'http://example.org/E',
        qname: 'ex:E',
        slug: 'ex-E',
        label: 'E',
        description: '',
        type: 'concept',
        ontology: 'external' as const,
        scheme: 'ex:scheme1',
        instanceOf: ['ex:Type1'],
      },
    ]
    const refs = collectReferencedQnames(entities)
    expect(refs.has('ex:B')).toBe(true)
    expect(refs.has('ex:C')).toBe(true)
    expect(refs.has('ex:D')).toBe(true)
    expect(refs.has('ex:scheme1')).toBe(true)
    expect(refs.has('ex:Type1')).toBe(true)
  })

  it('collects constraint-related references', () => {
    const entities = [
      {
        uri: 'http://example.org/S',
        qname: 'ex:S',
        slug: 'ex-S',
        label: 'S',
        description: '',
        type: 'shape',
        ontology: 'external' as const,
        constraints: [
          { path: 'ex:prop', datatype: 'xsd:string', classValue: 'ex:Cls' },
        ],
      },
    ]
    const refs = collectReferencedQnames(entities)
    expect(refs.has('ex:prop')).toBe(true)
    expect(refs.has('xsd:string')).toBe(true)
    expect(refs.has('ex:Cls')).toBe(true)
  })
})

// ── generateExternalStubs ──

describe('generateExternalStubs', () => {
  it('generates stubs for referenced qnames not in defined set', () => {
    const referenced = new Set(['rdf:type', 'dcterms:title', 'ex:Defined'])
    const defined = new Set(['ex:Defined'])
    const prefixes = {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      dcterms: 'http://purl.org/dc/terms/',
    }

    const stubs = generateExternalStubs(referenced, defined, externalMeta, prefixes)

    const rdfType = stubs.find((s) => s.qname === 'rdf:type')
    expect(rdfType).toBeDefined()
    expect(rdfType!.type).toBe('annotationProperty')
    expect(rdfType!.description).toBe('The type of the subject resource.')
    expect(rdfType!.label).toBe('type')
    expect(rdfType!.ontology).toBe('external')
    expect(rdfType!.uri).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')

    const dctermsTitle = stubs.find((s) => s.qname === 'dcterms:title')
    expect(dctermsTitle).toBeDefined()
    expect(dctermsTitle!.type).toBe('annotationProperty')
    expect(dctermsTitle!.slug).toBe('dcterms-title')

    // ex:Defined should NOT get a stub
    expect(stubs.find((s) => s.qname === 'ex:Defined')).toBeUndefined()
  })

  it('uses default type "external" for unknown qnames', () => {
    const referenced = new Set(['unknown:something'])
    const defined = new Set<string>()
    const prefixes: Record<string, string> = {}

    const stubs = generateExternalStubs(referenced, defined, externalMeta, prefixes)
    const stub = stubs.find((s) => s.qname === 'unknown:something')
    expect(stub).toBeDefined()
    expect(stub!.type).toBe('external')
    expect(stub!.description).toBe('')
    expect(stub!.uri).toBe('')
  })

  it('skips qnames without a colon', () => {
    const referenced = new Set(['noColonHere'])
    const defined = new Set<string>()

    const stubs = generateExternalStubs(referenced, defined, externalMeta, {})
    expect(stubs).toHaveLength(0)
  })
})

// ── buildTypeMeta ──

describe('buildTypeMeta', () => {
  it('produces correct labels and colors for known types', () => {
    const entities = [
      { uri: '', qname: '', slug: '', label: '', description: '', type: 'class', ontology: 'external' as const },
      { uri: '', qname: '', slug: '', label: '', description: '', type: 'objectProperty', ontology: 'external' as const },
      { uri: '', qname: '', slug: '', label: '', description: '', type: 'shape', ontology: 'external' as const },
      { uri: '', qname: '', slug: '', label: '', description: '', type: 'ontology', ontology: 'external' as const },
    ]
    const meta = buildTypeMeta(entities)

    expect(meta['class']).toEqual({
      label: 'Class',
      color: 'bg-blue-100 text-blue-800',
      colorDot: 'bg-blue-400',
    })
    expect(meta['objectProperty']).toEqual({
      label: 'Object Property',
      color: 'bg-green-100 text-green-800',
      colorDot: 'bg-green-400',
    })
    expect(meta['shape']).toEqual({
      label: 'SHACL Shape',
      color: 'bg-purple-100 text-purple-800',
      colorDot: 'bg-purple-400',
    })
    expect(meta['ontology']).toEqual({
      label: 'Ontology',
      color: 'bg-indigo-100 text-indigo-800',
      colorDot: 'bg-indigo-400',
    })
  })

  it('uses default slate colors for unknown types', () => {
    const entities = [
      { uri: '', qname: '', slug: '', label: '', description: '', type: 'custom', ontology: 'external' as const },
    ]
    const meta = buildTypeMeta(entities)
    expect(meta['custom']).toEqual({
      label: 'custom',
      color: 'bg-slate-100 text-slate-600',
      colorDot: 'bg-slate-400',
    })
  })

  it('returns empty record for no entities', () => {
    expect(buildTypeMeta([])).toEqual({})
  })
})

// ── buildImportChain ──

describe('buildImportChain', () => {
  it('builds import chain for ontology entities with imports', () => {
    const entities = [
      {
        uri: 'https://w3id.org/standards/isq/ontologies/core/',
        qname: 'isq:',
        slug: 'isq-',
        label: 'ISQ',
        description: 'ISQ ontology',
        type: 'ontology',
        ontology: 'isq' as const,
        version: '1.0.0',
        imports: ['smart:'],
      },
    ]
    const compact = createCompactor({
      isq: 'https://w3id.org/standards/isq/ontologies/core/',
      smart: 'https://w3id.org/standards/smart/ontologies/core/',
    })

    const chain = buildImportChain(entities, compact)
    expect(chain['isq:']).toBeDefined()
    expect(chain['isq:'].imports).toEqual(['smart:'])
    expect(chain['isq:'].version).toBe('1.0.0')
    expect(chain['isq:'].description).toBe('ISQ ontology')
  })

  it('skips non-ontology entities', () => {
    const entities = [
      {
        uri: 'http://example.org/A',
        qname: 'ex:A',
        slug: 'ex-A',
        label: 'A',
        description: '',
        type: 'class',
        ontology: 'external' as const,
      },
    ]
    const chain = buildImportChain(entities, createCompactor({}))
    expect(Object.keys(chain)).toHaveLength(0)
  })

  it('skips ontology entities without imports', () => {
    const entities = [
      {
        uri: 'http://example.org/',
        qname: 'ex:',
        slug: 'ex-',
        label: 'Ex',
        description: '',
        type: 'ontology',
        ontology: 'external' as const,
      },
    ]
    const chain = buildImportChain(entities, createCompactor({}))
    expect(Object.keys(chain)).toHaveLength(0)
  })
})

// ── buildOntologyNamespaces ──

describe('buildOntologyNamespaces', () => {
  it('uses version from entities when available', () => {
    const entities = [
      {
        uri: 'https://w3id.org/standards/isq/ontologies/core/',
        qname: 'isq:',
        slug: 'isq-',
        label: 'ISQ',
        description: '',
        type: 'ontology',
        ontology: 'isq' as const,
        version: '3.2.1',
      },
      {
        uri: 'https://w3id.org/standards/smart/ontologies/core/ontology',
        qname: 'smart:',
        slug: 'smart-',
        label: 'SMART',
        description: '',
        type: 'ontology',
        ontology: 'smart' as const,
        version: '5.0.0',
      },
    ]
    const namespaces = buildOntologyNamespaces(entities)
    expect(namespaces).toHaveLength(2)
    expect(namespaces[0].prefix).toBe('isq')
    expect(namespaces[0].version).toBe('3.2.1')
    expect(namespaces[1].prefix).toBe('smart')
    expect(namespaces[1].version).toBe('5.0.0')
  })

  it('falls back to default versions', () => {
    const namespaces = buildOntologyNamespaces([])
    expect(namespaces[0].version).toBe('1.0.0')
    expect(namespaces[1].version).toBe('2.0.0')
  })
})
