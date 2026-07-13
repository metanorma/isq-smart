import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { Parser, Store } from 'n3'
import type { BuildPaths } from './types'
import {
  extractPrefixes,
  createCompactor,
  classifyEntities,
  collectReferencedQnames,
  generateExternalStubs,
  buildTypeMeta,
  buildImportChain,
  buildOntologyNamespaces,
} from './ontology-extract'
import { externalMeta } from './external-vocabulary'

export function ontologyDataPlugin(paths: BuildPaths): Plugin {
  const { ontologySrcDir: ontoDir, ontologyRefDir: refDir, generatedDir: genDir } = paths

  function generateOntologyData() {
    // ── Collect TTL file paths ──
    const ttlFiles = [
      resolve(refDir, 'ontologies/core-ontology.ttl'),
      resolve(refDir, 'ontologies/external/vocabulary.ttl'),
      resolve(refDir, 'schemas/shacl/core-ontology.shacl.ttl'),
      resolve(refDir, 'schemas/shacl/annotation-ontology.shacl.ttl'),
      resolve(refDir, 'schemas/shacl/terminology-model.shacl.ttl'),
      ...readdirSync(resolve(refDir, 'taxonomies'))
        .filter((f) => f.endsWith('.ttl'))
        .map((f) => resolve(refDir, 'taxonomies', f)),
      resolve(ontoDir, 'isq.ttl'),
      resolve(ontoDir, 'isq.shacl.ttl'),
    ]

    // ── Read files, extract prefixes, build RDF store ──
    const store = new Store()
    const parser = new Parser()
    const ttlContents: string[] = []

    for (const file of ttlFiles) {
      if (!existsSync(file)) continue
      const content = readFileSync(file, 'utf-8')
      ttlContents.push(content)
      const quads = parser.parse(content)
      store.addQuads(quads)
    }

    const allPrefixes = extractPrefixes(ttlContents)
    const compact = createCompactor(allPrefixes)

    // ── Classify entities and generate stubs ──
    const entities = classifyEntities(store, allPrefixes)
    const definedQnames = new Set(entities.map((e) => e.qname))
    const referencedQnames = collectReferencedQnames(entities)
    const stubs = generateExternalStubs(referencedQnames, definedQnames, externalMeta, allPrefixes)
    entities.push(...stubs)

    // ── Build derived data ──
    const prefixes = Object.entries(allPrefixes).map(([prefix, uri]) => ({ prefix, uri }))
    const importChain = buildImportChain(entities, compact)
    const typeMeta = buildTypeMeta(entities)
    const ontologyNamespaces = buildOntologyNamespaces(entities)

    // ── Write output ──
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
        + `export type OntologyEntity = typeof ontologyEntities[number]\n`,
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
