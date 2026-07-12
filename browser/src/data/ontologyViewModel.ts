/**
 * The full shape of an ontology entity. The generated `OntologyEntity` type
 * is a union of 200+ literal object types (one per entity), which TypeScript
 * cannot narrow for optional property access. This interface describes the
 * superset of all possible fields, matching the shape used by lib/rdf.ts
 * and the .astro pages.
 */
export interface OntologyEntityData {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  ontology: string
  type: string
  scopeNote?: string
  example?: string
  altLabel?: string
  seeAlso?: string[]
  parent?: string
  domain?: string[]
  range?: string[]
  functional?: boolean
  targetClass?: string
  targetSubjectsOf?: string
  targetObjectsOf?: string
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string; uniqueLang?: boolean }[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
  version?: string
  imports?: string[]
  isPartOf?: string[]
  identifier?: string
}

/**
 * A reference to another ontology entity, with the context in which it
 * references the subject entity. Used in the "Where Used" section.
 */
export interface WhereUsedEntry {
  entity: OntologyEntityData
  context: string
}

/**
 * A group of properties that share a common domain class. Used in the
 * "Properties by Class" grouped-usage table on class detail pages.
 */
export interface GroupedUsageEntry {
  source: OntologyEntityData
  props: OntologyEntityData[]
}

/**
 * Properties that reference a class in their domain or range.
 * Used in the "In Range Of" section and the grouped-usage header count.
 */
export interface RelatedProperties {
  domain: OntologyEntityData[]
  range: OntologyEntityData[]
}

/**
 * Entities scoped to a specific ontology prefix, grouped by type.
 * Used on ontology detail pages to list all members of that ontology.
 */
export interface OntologyScoped {
  classes: OntologyEntityData[]
  objectProperties: OntologyEntityData[]
  datatypeProperties: OntologyEntityData[]
  annotationProperties: OntologyEntityData[]
  concepts: OntologyEntityData[]
  conceptSchemes: OntologyEntityData[]
  shapes: OntologyEntityData[]
  individuals: OntologyEntityData[]
}

/**
 * A resolved view of a single ontology entity, with all derived data
 * pre-computed via indexed lookups rather than repeated linear scans.
 *
 * This is a pure data object — no DOM, no Astro, no Vue. The consuming
 * .astro page destructures these fields directly into its template.
 */
export interface OntologyEntityView {
  entity: OntologyEntityData
  ancestors: OntologyEntityData[]
  subclasses: OntologyEntityData[]
  allDescendants: OntologyEntityData[]
  targetingShapes: OntologyEntityData[]
  relatedProperties: RelatedProperties
  groupedUsage: GroupedUsageEntry[]
  inferredProperties: OntologyEntityData[]
  instances: OntologyEntityData[]
  whereUsed: WhereUsedEntry[]
  schemeConcepts: OntologyEntityData[]
  conceptShapes: OntologyEntityData[]
  ontologyScoped: OntologyScoped
  parentOntologyEntity: OntologyEntityData | undefined
  siblings: { prev: OntologyEntityData | undefined; next: OntologyEntityData | undefined }
}

// ── Internal index ──

/**
 * A pre-built index over all ontology entities, keyed by qname, type,
 * and parent. Built once, used for all lookups in resolveOntologyEntityView.
 */
interface EntityIndex {
  byQname: Map<string, OntologyEntityData>
  byType: Map<string, OntologyEntityData[]>
  childrenByParent: Map<string, OntologyEntityData[]>
  instancesByClass: Map<string, OntologyEntityData[]>
  shapesByTargetClass: Map<string, OntologyEntityData[]>
  conceptsByScheme: Map<string, OntologyEntityData[]>
  propertiesByDomain: Map<string, OntologyEntityData[]>
  propertiesByRange: Map<string, OntologyEntityData[]>
  entitiesByPrefix: Map<string, OntologyEntityData[]>
}

const PROPERTY_TYPES = new Set(['objectProperty', 'datatypeProperty', 'annotationProperty'])

function buildIndex(allEntities: readonly OntologyEntityData[]): EntityIndex {
  const byQname = new Map<string, OntologyEntityData>()
  const byType = new Map<string, OntologyEntityData[]>()
  const childrenByParent = new Map<string, OntologyEntityData[]>()
  const instancesByClass = new Map<string, OntologyEntityData[]>()
  const shapesByTargetClass = new Map<string, OntologyEntityData[]>()
  const conceptsByScheme = new Map<string, OntologyEntityData[]>()
  const propertiesByDomain = new Map<string, OntologyEntityData[]>()
  const propertiesByRange = new Map<string, OntologyEntityData[]>()
  const entitiesByPrefix = new Map<string, OntologyEntityData[]>()

  for (const e of allEntities) {
    byQname.set(e.qname, e)

    // by type
    const typeList = byType.get(e.type)
    if (typeList) typeList.push(e)
    else byType.set(e.type, [e])

    // children by parent (classes only, matching original filter)
    if (e.type === 'class' && e.parent) {
      const list = childrenByParent.get(e.parent)
      if (list) list.push(e)
      else childrenByParent.set(e.parent, [e])
    }

    // instances by class
    if (e.type === 'individual' && e.instanceOf) {
      for (const cls of e.instanceOf) {
        const list = instancesByClass.get(cls)
        if (list) list.push(e)
        else instancesByClass.set(cls, [e])
      }
    }

    // shapes by target class
    if (e.type === 'shape' && e.targetClass) {
      const list = shapesByTargetClass.get(e.targetClass)
      if (list) list.push(e)
      else shapesByTargetClass.set(e.targetClass, [e])
    }

    // concepts by scheme
    if (e.type === 'concept' && e.scheme) {
      const list = conceptsByScheme.get(e.scheme)
      if (list) list.push(e)
      else conceptsByScheme.set(e.scheme, [e])
    }

    // properties by domain
    if (PROPERTY_TYPES.has(e.type) && e.domain) {
      for (const d of e.domain) {
        const list = propertiesByDomain.get(d)
        if (list) list.push(e)
        else propertiesByDomain.set(d, [e])
      }
    }

    // properties by range (objectProperty + datatypeProperty only)
    if ((e.type === 'objectProperty' || e.type === 'datatypeProperty') && e.range) {
      for (const r of e.range) {
        const list = propertiesByRange.get(r)
        if (list) list.push(e)
        else propertiesByRange.set(r, [e])
      }
    }

    // by prefix
    const prefix = e.qname.split(':')[0]
    const prefixList = entitiesByPrefix.get(prefix)
    if (prefixList) prefixList.push(e)
    else entitiesByPrefix.set(prefix, [e])
  }

  return {
    byQname,
    byType,
    childrenByParent,
    instancesByClass,
    shapesByTargetClass,
    conceptsByScheme,
    propertiesByDomain,
    propertiesByRange,
    entitiesByPrefix,
  }
}

// ── Resolution functions ──

function resolveAncestors(
  entity: OntologyEntityData,
  index: EntityIndex,
): OntologyEntityData[] {
  if (entity.type !== 'class') return []
  const chain: OntologyEntityData[] = []
  let current = entity
  let safety = 20
  while (safety-- > 0) {
    const pq = current.parent
    if (!pq) break
    const p = index.byQname.get(pq)
    if (!p) break
    chain.push(p)
    current = p
  }
  return chain
}

function resolveAllDescendants(
  entity: OntologyEntityData,
  index: EntityIndex,
): OntologyEntityData[] {
  if (entity.type !== 'class') return []
  const result: OntologyEntityData[] = []
  const queue = [entity.qname]
  const seen = new Set<string>()
  while (queue.length) {
    const qn = queue.shift()!
    if (seen.has(qn)) continue
    seen.add(qn)
    const children = index.childrenByParent.get(qn) || []
    for (const c of children) {
      result.push(c)
      queue.push(c.qname)
    }
  }
  return result
}

function resolveInferredProperties(
  entity: OntologyEntityData,
  ancestors: OntologyEntityData[],
  index: EntityIndex,
): OntologyEntityData[] {
  if (entity.type !== 'class') return []
  const ancestorQnames = ancestors.map(a => a.qname)
  const allQnames = [entity.qname, ...ancestorQnames]
  const props: OntologyEntityData[] = []
  for (const qn of allQnames) {
    const list = index.propertiesByDomain.get(qn)
    if (list) {
      for (const p of list) {
        if (!props.includes(p)) props.push(p)
      }
    }
  }
  // Filter out properties whose domain directly includes this entity
  // (those are shown in groupedUsage, not in inherited)
  return props.filter(p => !p.domain?.includes(entity.qname))
}

function resolveGroupedUsage(
  entity: OntologyEntityData,
  ancestors: OntologyEntityData[],
  index: EntityIndex,
): GroupedUsageEntry[] {
  if (entity.type !== 'class') return []
  const chain = [entity, ...ancestors]
  return chain
    .map(cls => {
      const clsProps = index.propertiesByDomain.get(cls.qname) || []
      return { source: cls, props: clsProps }
    })
    .filter(g => g.props.length > 0)
}

function resolveWhereUsed(
  entity: OntologyEntityData,
  allEntities: readonly OntologyEntityData[],
): WhereUsedEntry[] {
  const qn = entity.qname
  const results: WhereUsedEntry[] = []
  for (const e of allEntities) {
    if (e.qname === qn) continue
    if (e.parent === qn) results.push({ entity: e, context: 'subClassOf' })
    if (e.domain?.includes(qn)) results.push({ entity: e, context: 'domain' })
    if (e.range?.includes(qn)) results.push({ entity: e, context: 'range' })
    if (e.targetClass === qn) results.push({ entity: e, context: 'targetClass' })
    if (e.targetSubjectsOf === qn) results.push({ entity: e, context: 'targetSubjectsOf' })
    if (e.targetObjectsOf === qn) results.push({ entity: e, context: 'targetObjectsOf' })
    if (e.scheme === qn) results.push({ entity: e, context: 'inScheme' })
    if (e.instanceOf?.includes(qn)) results.push({ entity: e, context: 'type' })
    if (e.isPartOf?.includes(qn)) results.push({ entity: e, context: 'isPartOf' })
    for (const c of (e.constraints || [])) {
      if (c.classValue === qn) results.push({ entity: e, context: 'shape constraint class' })
      if (c.hasValue === qn) results.push({ entity: e, context: 'shape constraint hasValue' })
    }
  }
  return results
}

function resolveConceptShapes(entity: OntologyEntityData, index: EntityIndex): OntologyEntityData[] {
  if (entity.type !== 'concept') return []
  const io = entity.instanceOf || []
  const shapes = index.byType.get('shape') || []
  return shapes.filter(e => io.includes(e.targetClass || ''))
}

function resolveOntologyScoped(
  entity: OntologyEntityData,
  index: EntityIndex,
): OntologyScoped {
  const empty: OntologyScoped = {
    classes: [],
    objectProperties: [],
    datatypeProperties: [],
    annotationProperties: [],
    concepts: [],
    conceptSchemes: [],
    shapes: [],
    individuals: [],
  }
  if (entity.type !== 'ontology') return empty

  const prefix = entity.qname.split(':')[0]
  const scoped = index.entitiesByPrefix.get(prefix) || []

  return {
    classes: scoped.filter(e => e.type === 'class'),
    objectProperties: scoped.filter(e => e.type === 'objectProperty'),
    datatypeProperties: scoped.filter(e => e.type === 'datatypeProperty'),
    annotationProperties: scoped.filter(e => e.type === 'annotationProperty'),
    concepts: scoped.filter(e => e.type === 'concept'),
    conceptSchemes: scoped.filter(e => e.type === 'conceptScheme'),
    shapes: scoped.filter(e => e.type === 'shape'),
    individuals: scoped.filter(e => e.type === 'individual'),
  }
}

function resolveSiblings(
  entity: OntologyEntityData,
  index: EntityIndex,
): { prev: OntologyEntityData | undefined; next: OntologyEntityData | undefined } {
  const sameType = (index.byType.get(entity.type) || [])
    .filter(e => e.ontology !== 'external')
    .sort((a, b) => a.label.localeCompare(b.label))
  const idx = sameType.findIndex(e => e.qname === entity.qname)
  return {
    prev: idx > 0 ? sameType[idx - 1] : undefined,
    next: idx < sameType.length - 1 ? sameType[idx + 1] : undefined,
  }
}

function resolveParentOntologyEntity(
  entity: OntologyEntityData,
  index: EntityIndex,
): OntologyEntityData | undefined {
  if (entity.type === 'ontology') return undefined
  const ontologies = index.byType.get('ontology') || []
  return ontologies.find(e => e.ontology === entity.ontology)
}

// ── Public API ──

/**
 * Resolve all derived views for a single ontology entity in one pass.
 *
 * Internally builds an index (by qname, type, parent, domain, range, etc.)
 * once, then uses O(1) map lookups instead of the 18+ linear scans the
 * original frontmatter performed.
 *
 * @param entity    The entity to resolve views for.
 * @param allEntities  All ontology entities (from generated/ontology.ts).
 * @returns An OntologyEntityView with all pre-computed derived data.
 */
export function resolveOntologyEntityView(
  entity: OntologyEntityData,
  allEntities: readonly OntologyEntityData[],
): OntologyEntityView {
  const index = buildIndex(allEntities)

  const ancestors = resolveAncestors(entity, index)
  const subclasses = entity.type === 'class'
    ? (index.childrenByParent.get(entity.qname) || [])
    : []
  const allDescendants = resolveAllDescendants(entity, index)
  const targetingShapes = entity.type === 'class'
    ? (index.shapesByTargetClass.get(entity.qname) || [])
    : []
  const instances = entity.type === 'class'
    ? (index.instancesByClass.get(entity.qname) || [])
    : []
  const schemeConcepts = entity.type === 'conceptScheme'
    ? (index.conceptsByScheme.get(entity.qname) || [])
    : []
  const inferredProperties = resolveInferredProperties(entity, ancestors, index)
  const groupedUsage = resolveGroupedUsage(entity, ancestors, index)

  const relatedProperties: RelatedProperties = entity.type === 'class'
    ? {
        domain: index.propertiesByDomain.get(entity.qname) || [],
        range: index.propertiesByRange.get(entity.qname) || [],
      }
    : { domain: [], range: [] }

  const whereUsed = resolveWhereUsed(entity, allEntities)
  const conceptShapes = resolveConceptShapes(entity, index)
  const ontologyScoped = resolveOntologyScoped(entity, index)
  const parentOntologyEntity = resolveParentOntologyEntity(entity, index)
  const siblings = resolveSiblings(entity, index)

  return {
    entity,
    ancestors,
    subclasses,
    allDescendants,
    targetingShapes,
    relatedProperties,
    groupedUsage,
    inferredProperties,
    instances,
    whereUsed,
    schemeConcepts,
    conceptShapes,
    ontologyScoped,
    parentOntologyEntity,
    siblings,
  }
}
