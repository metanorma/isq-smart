<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ontologyEntities, ontologyTypeMeta, ontologyPrefixes, ontologyNamespaces, ontologyImportChain } from '../data/generated/ontology'
import { toTurtle, toJsonLd, downloadFile } from '../composables/useRdfExport'

interface Entity {
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
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string }[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
  version?: string
  imports?: string[]
}

const props = defineProps<{ slug?: string }>()
const route = useRoute()

const slug = computed(() => (props.slug || route.params.slug) as string)

const allEntities = ontologyEntities as readonly Entity[]
const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>

const entity = computed<Entity | undefined>(() =>
  allEntities.find(e => e.slug === slug.value)
)

function findByQname(qname: string): Entity | undefined {
  return allEntities.find(e => e.qname === qname)
}

function linkTo(qname: string) {
  const e = findByQname(qname)
  if (e) return `/ontology/${e.slug}`
  return ''
}

// ─── Prev / Next navigation ─────────────────────────────────────────────────

const siblings = computed(() => {
  if (!entity.value) return { prev: undefined as Entity | undefined, next: undefined as Entity | undefined }
  const sameType = allEntities
    .filter(e => e.type === entity.value!.type && e.ontology !== 'external')
    .sort((a, b) => a.label.localeCompare(b.label))
  const idx = sameType.findIndex(e => e.qname === entity.value!.qname)
  return {
    prev: idx > 0 ? sameType[idx - 1] : undefined,
    next: idx < sameType.length - 1 ? sameType[idx + 1] : undefined,
  }
})

// ─── Class features ─────────────────────────────────────────────────────────

const subclasses = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  return allEntities.filter(e => e.type === 'class' && e.parent === entity.value!.qname)
})

const allDescendants = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  const result: Entity[] = []
  const queue = [entity.value.qname]
  const seen = new Set<string>()
  while (queue.length) {
    const qn = queue.shift()!
    if (seen.has(qn)) continue
    seen.add(qn)
    const children = allEntities.filter(e => e.type === 'class' && e.parent === qn)
    for (const c of children) {
      result.push(c)
      queue.push(c.qname)
    }
  }
  return result
})

const targetingShapes = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  return allEntities.filter(e => e.type === 'shape' && e.targetClass === entity.value!.qname)
})

const ancestors = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  const chain: Entity[] = []
  let current = entity.value
  let safety = 20
  while (safety-- > 0) {
    const pq = current.parent
    if (!pq) break
    const p = findByQname(pq)
    if (!p) break
    chain.push(p)
    current = p
  }
  return chain
})

// Inferred properties: properties whose domain includes any ancestor
const inferredProperties = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return [] as Entity[]
  const ancestorQnames = ancestors.value.map(a => a.qname)
  const allQnames = [entity.value.qname, ...ancestorQnames]
  const props = allEntities.filter(e =>
    (e.type === 'objectProperty' || e.type === 'datatypeProperty' || e.type === 'annotationProperty') &&
    e.domain?.some(d => allQnames.includes(d))
  )
  return props.filter(p => !p.domain?.includes(entity.value!.qname))
})

// Grouped usage: properties grouped by which ancestor (or self) they belong to
const groupedUsage = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return [] as { source: Entity; props: Entity[] }[]
  const chain = [entity.value, ...ancestors.value]
  return chain
    .map(cls => {
      const clsProps = allEntities.filter(e =>
        (e.type === 'objectProperty' || e.type === 'datatypeProperty' || e.type === 'annotationProperty') &&
        e.domain?.includes(cls.qname)
      )
      return { source: cls, props: clsProps }
    })
    .filter(g => g.props.length > 0)
})

// Instances: individuals whose instanceOf includes this class
const instances = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return []
  return allEntities.filter(e => e.type === 'individual' && e.instanceOf?.includes(entity.value!.qname))
})

// Properties that use this class in domain/range
const relatedProperties = computed(() => {
  if (!entity.value || entity.value.type !== 'class') return { domain: [] as Entity[], range: [] as Entity[] }
  const qn = entity.value.qname
  return {
    domain: allEntities.filter(e =>
      (e.type === 'objectProperty' || e.type === 'datatypeProperty' || e.type === 'annotationProperty') &&
      e.domain?.includes(qn)
    ),
    range: allEntities.filter(e =>
      (e.type === 'objectProperty' || e.type === 'datatypeProperty') &&
      e.range?.includes(qn)
    ),
  }
})

// ─── SKOS features ──────────────────────────────────────────────────────────

const schemeConcepts = computed(() => {
  if (!entity.value || entity.value.type !== 'conceptScheme') return []
  return allEntities.filter(e => e.type === 'concept' && e.scheme === entity.value!.qname)
})

const conceptShapes = computed(() => {
  if (!entity.value || entity.value.type !== 'concept') return []
  const io = entity.value.instanceOf || []
  return allEntities.filter(e => e.type === 'shape' && io.includes(e.targetClass || ''))
})

// ─── Ontology-specific (entity listing per type) ────────────────────────────

const ontologyClasses = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'class' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyObjProps = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'objectProperty' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyDtProps = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'datatypeProperty' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyAnnProps = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'annotationProperty' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyShapes = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'shape' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyConcepts = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'concept' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyConceptSchemes = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'conceptScheme' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyIndividuals = computed(() => {
  if (!entity.value || entity.value.type !== 'ontology') return []
  return allEntities.filter(e => e.type === 'individual' && e.qname.startsWith(entity.value!.qname.split(':')[0] + ':'))
})

const ontologyPrefix = computed(() => {
  if (!entity.value) return ''
  return entity.value.qname.split(':')[0]
})

const ontologyNs = computed(() => {
  return ontologyNamespaces.find(n => n.prefix === ontologyPrefix.value)
})

// ─── Where used ─────────────────────────────────────────────────────────────

const whereUsed = computed(() => {
  if (!entity.value) return []
  const qn = entity.value.qname
  const results: { entity: Entity; context: string }[] = []
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
    for (const c of (e.constraints || [])) {
      if (c.classValue === qn) results.push({ entity: e, context: 'shape constraint class' })
      if (c.hasValue === qn) results.push({ entity: e, context: 'shape constraint hasValue' })
    }
  }
  return results
})

// ─── RDF export ─────────────────────────────────────────────────────────────

const rdfFormat = ref<'turtle' | 'jsonld'>('turtle')
const turtleCode = computed(() => entity.value ? toTurtle(entity.value) : '')
const jsonldCode = computed(() => entity.value ? toJsonLd(entity.value) : '')

function handleDownload(format: 'turtle' | 'jsonld') {
  if (!entity.value) return
  const slug = entity.value.slug
  if (format === 'turtle') {
    downloadFile(turtleCode.value, `${slug}.ttl`, 'text/turtle')
  } else {
    downloadFile(jsonldCode.value, `${slug}.jsonld`, 'application/ld+json')
  }
}

// ─── Tab ────────────────────────────────────────────────────────────────────

const detailTab = ref<'overview' | 'rdf'>('overview')

const parentOntologyEntity = computed(() => {
  if (!entity.value || entity.value.type === 'ontology') return null
  return allEntities.find(e => e.type === 'ontology' && e.ontology === entity.value!.ontology)
})
</script>

<template>
  <div>
  <div v-if="!entity" class="p-8 text-center text-gray-500">
    <p class="text-xl">Entity not found</p>
    <p class="mt-2">No entity with slug "{{ slug }}"</p>
    <router-link to="/ontology" class="text-blue-600 hover:underline mt-4 inline-block">
      Back to Ontology
    </router-link>
  </div>

  <div v-else class="max-w-5xl mx-auto p-6 space-y-6">
    <!-- Breadcrumb + prev/next -->
    <div class="flex items-center justify-between">
      <nav class="flex items-center gap-2 text-sm text-gray-500">
        <router-link to="/ontology" class="hover:text-blue-600">Ontology</router-link>
        <span>/</span>
        <router-link v-if="parentOntologyEntity" :to="`/ontology/${parentOntologyEntity.slug}`" class="hover:text-blue-600">{{ entity.ontology }}</router-link>
        <span v-if="parentOntologyEntity">/</span>
        <span class="text-gray-900 font-medium">{{ entity.label }}</span>
      </nav>
      <div class="flex items-center gap-3 text-xs">
        <router-link v-if="siblings.prev" :to="`/ontology/${siblings.prev.slug}`"
          class="flex items-center gap-1 text-slate-500 hover:text-brand-600 transition-colors">
          <span>←</span> {{ siblings.prev.label }}
        </router-link>
        <span v-else class="text-slate-300">←</span>
        <router-link v-if="siblings.next" :to="`/ontology/${siblings.next.slug}`"
          class="flex items-center gap-1 text-slate-500 hover:text-brand-600 transition-colors">
          {{ siblings.next.label }} <span>→</span>
        </router-link>
        <span v-else class="text-slate-300">→</span>
      </div>
    </div>

    <div>
      <h1 class="text-2xl font-bold text-gray-900">{{ entity.label }}</h1>
      <div class="flex items-center gap-2 mt-1">
        <span :class="['inline-block px-2 py-0.5 rounded text-xs font-medium', typeMeta[entity.type]?.color || 'bg-gray-100 text-gray-800']">
          {{ typeMeta[entity.type]?.label || entity.type }}
        </span>
        <span v-if="entity.ontology !== 'external'" class="inline-block px-2 py-0.5 rounded text-xs font-medium"
          :class="entity.ontology === 'smart' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'">
          {{ entity.ontology }}
        </span>
        <code class="text-xs text-slate-400">{{ entity.qname }}</code>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="flex gap-1 p-1 rounded-lg bg-slate-100/80 dark:bg-dark-700/80 border border-slate-200/60 dark:border-dark-600/60 w-fit">
      <button @click="detailTab = 'overview'"
        class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
        :class="detailTab === 'overview' ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
        Overview
      </button>
      <button @click="detailTab = 'rdf'"
        class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
        :class="detailTab === 'rdf' ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'">
        RDF Source
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- OVERVIEW TAB                                                   -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <template v-if="detailTab === 'overview'">
      <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">URI</h3>
        <code class="text-sm break-all">{{ entity.uri }}</code>
      </div>

      <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Qualified Name</h3>
        <code class="text-sm">{{ entity.qname }}</code>
      </div>

      <div v-if="entity.description" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Definition</h3>
        <p class="text-gray-700 whitespace-pre-line">{{ entity.description }}</p>
      </div>

      <div v-if="entity.scopeNote" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Scope Note</h3>
        <p class="text-gray-700 whitespace-pre-line">{{ entity.scopeNote }}</p>
      </div>

      <div v-if="entity.example" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Example</h3>
        <p class="text-gray-700">{{ entity.example }}</p>
      </div>

      <div v-if="entity.altLabel" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Alternative Label</h3>
        <p class="text-gray-700">{{ entity.altLabel }}</p>
      </div>

      <div v-if="entity.seeAlso?.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">See Also</h3>
        <ul class="space-y-1">
          <li v-for="link in entity.seeAlso" :key="link">
            <a :href="link" target="_blank" rel="noopener" class="text-blue-600 hover:underline text-sm break-all">{{ link }}</a>
          </li>
        </ul>
      </div>

      <!-- ─── Class-specific ────────────────────────────────────────── -->
      <template v-if="entity.type === 'class'">
        <!-- Tree diagram -->
        <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Hierarchy</h3>
          <div class="font-mono text-xs space-y-0.5">
            <!-- Ancestors (reversed, root first) -->
            <div v-for="(a, i) in [...ancestors].reverse()" :key="'a-' + a.qname"
              :style="{ paddingLeft: `${i * 1.5}rem` }" class="flex items-center gap-1.5 text-slate-400">
              <span class="w-4 text-center">└</span>
              <router-link :to="`/ontology/${a.slug}`" class="hover:text-blue-600 hover:underline">{{ a.qname }}</router-link>
            </div>
            <!-- Self (highlighted) -->
            <div :style="{ paddingLeft: `${ancestors.length * 1.5}rem` }"
              class="flex items-center gap-1.5 py-1 px-2 -mx-2 rounded bg-brand-50/50 border border-brand-200/30">
              <span class="w-4 text-center font-bold text-brand-500">★</span>
              <span class="text-brand-700 font-bold">{{ entity.qname }}</span>
            </div>
            <!-- Children -->
            <div v-for="sc in subclasses" :key="'sc-' + sc.qname"
              :style="{ paddingLeft: `${(ancestors.length + 1) * 1.5}rem` }" class="flex items-center gap-1.5">
              <span class="w-4 text-center text-slate-300">└</span>
              <router-link :to="`/ontology/${sc.slug}`" class="text-blue-600 hover:underline">{{ sc.qname }}</router-link>
            </div>
          </div>
        </div>

        <!-- Inherited properties -->
        <div v-if="inferredProperties.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Inherited Properties ({{ inferredProperties.length }})
          </h3>
          <p class="text-xs text-slate-400 mb-3">Properties inherited from ancestor classes.</p>
          <div class="flex flex-wrap gap-1.5">
            <router-link v-for="p in inferredProperties" :key="p.qname" :to="`/ontology/${p.slug}`"
              class="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" :class="typeMeta[p.type]?.colorDot || 'bg-slate-300'"></span>
              {{ p.qname }}
            </router-link>
          </div>
        </div>

        <!-- Grouped usage table (Ontospy-style) -->
        <div v-if="groupedUsage.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Properties by Class ({{ relatedProperties.domain.length }})
          </h3>
          <div class="space-y-4">
            <div v-for="group in groupedUsage" :key="group.source.qname">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">From</span>
                <router-link :to="`/ontology/${group.source.slug}`" class="text-xs font-mono text-blue-600 hover:underline">{{ group.source.qname }}</router-link>
                <span class="text-[10px] text-slate-400">({{ group.props.length }})</span>
              </div>
              <div class="overflow-x-auto rounded-lg border border-slate-200/60">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="bg-slate-50/80 border-b border-slate-200/60">
                      <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Property</th>
                      <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Description</th>
                      <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Range</th>
                      <th class="text-center px-3 py-1.5 font-semibold text-slate-500">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in group.props" :key="p.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0">
                      <td class="px-3 py-1.5">
                        <router-link :to="`/ontology/${p.slug}`" class="text-green-700 hover:underline font-medium">{{ p.qname }}</router-link>
                      </td>
                      <td class="px-3 py-1.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ p.description || '—' }}</td>
                      <td class="px-3 py-1.5">
                        <template v-for="(r, i) in p.range" :key="r">
                          <router-link v-if="linkTo(r)" :to="linkTo(r)" class="text-blue-600 hover:underline">{{ r }}</router-link>
                          <span v-else class="text-slate-600 dark:text-slate-400">{{ r }}</span>
                          <span v-if="i < p.range!.length - 1">, </span>
                        </template>
                        <span v-if="!p.range?.length" class="text-slate-400">—</span>
                      </td>
                      <td class="px-3 py-1.5 text-center">
                        <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded" :class="typeMeta[p.type]?.color || 'bg-slate-100 text-slate-600'">{{ typeMeta[p.type]?.label || p.type }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct subclasses -->
        <div v-if="subclasses.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Direct Subclasses ({{ subclasses.length }})</h3>
          <ul class="space-y-1">
            <li v-for="sc in subclasses" :key="sc.qname">
              <router-link :to="`/ontology/${sc.slug}`" class="text-blue-600 hover:underline">{{ sc.qname }}</router-link>
              <span v-if="sc.description" class="text-gray-400 text-sm ml-2">— {{ sc.description.slice(0, 80) }}{{ sc.description.length > 80 ? '…' : '' }}</span>
            </li>
          </ul>
        </div>

        <!-- All descendants -->
        <div v-if="allDescendants.length > subclasses.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">All Descendants ({{ allDescendants.length }})</h3>
          <ul class="space-y-1">
            <li v-for="d in allDescendants" :key="d.qname">
              <router-link :to="`/ontology/${d.slug}`" class="text-blue-600 hover:underline">{{ d.qname }}</router-link>
              <span v-if="d.description" class="text-gray-400 text-sm ml-2">— {{ d.description.slice(0, 60) }}{{ d.description.length > 60 ? '…' : '' }}</span>
            </li>
          </ul>
        </div>

        <!-- SHACL Shapes targeting this class -->
        <div v-if="targetingShapes.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            SHACL Constraints ({{ targetingShapes.length }})
          </h3>
          <div v-for="s in targetingShapes" :key="s.qname" class="mb-4 last:mb-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">Shape</span>
              <router-link :to="`/ontology/${s.slug}`" class="text-sm font-bold text-brand-600 hover:underline">{{ s.qname }}</router-link>
            </div>
            <div v-if="s.constraints?.length" class="overflow-x-auto rounded-lg border border-slate-200/60">
              <table class="w-full text-xs">
                <thead>
                  <tr class="bg-slate-50/80 border-b border-slate-200/60">
                    <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Property</th>
                    <th class="text-center px-3 py-1.5 font-semibold text-slate-500">Min</th>
                    <th class="text-center px-3 py-1.5 font-semibold text-slate-500">Max</th>
                    <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Type / Class</th>
                    <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Node Kind</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(c, i) in s.constraints" :key="i" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0">
                    <td class="px-3 py-1.5">
                      <router-link v-if="linkTo(c.path)" :to="linkTo(c.path)" class="text-blue-600 hover:underline">{{ c.path }}</router-link>
                      <span v-else class="font-mono">{{ c.path }}</span>
                    </td>
                    <td class="px-3 py-1.5 text-center">{{ c.minCount ?? '—' }}</td>
                    <td class="px-3 py-1.5 text-center">{{ c.maxCount ?? '—' }}</td>
                    <td class="px-3 py-1.5">
                      <span v-if="c.datatype" class="italic">{{ c.datatype }}</span>
                      <router-link v-else-if="c.classValue && linkTo(c.classValue)" :to="linkTo(c.classValue)" class="text-blue-600 hover:underline">{{ c.classValue }}</router-link>
                      <span v-else-if="c.classValue">{{ c.classValue }}</span>
                      <span v-if="c.hasValue" class="text-slate-400 ml-1">= {{ c.hasValue }}</span>
                    </td>
                    <td class="px-3 py-1.5">{{ c.nodeKind || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Range usage -->
        <div v-if="relatedProperties.range.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">In Range Of</h3>
          <ul class="space-y-1">
            <li v-for="p in relatedProperties.range" :key="p.qname">
              <router-link :to="`/ontology/${p.slug}`" class="text-blue-600 hover:underline">{{ p.qname }}</router-link>
            </li>
          </ul>
        </div>

        <!-- Instances -->
        <div v-if="instances.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Instances ({{ instances.length }})</h3>
          <div class="flex flex-wrap gap-1.5">
            <router-link v-for="inst in instances" :key="inst.qname" :to="`/ontology/${inst.slug}`"
              class="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors inline-flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" :class="typeMeta[inst.type]?.colorDot || 'bg-slate-300'"></span>
              {{ inst.label }}
            </router-link>
          </div>
        </div>
      </template>

      <!-- ─── Property-specific ─────────────────────────────────────── -->
      <template v-if="entity.type === 'objectProperty' || entity.type === 'datatypeProperty'">
        <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Property Characteristics</h3>
          <table class="w-full text-sm">
            <tr v-if="entity.domain?.length">
              <td class="py-1 pr-4 font-medium text-gray-600 align-top w-32">Domain</td>
              <td>
                <template v-for="(d, i) in entity.domain" :key="d">
                  <router-link v-if="linkTo(d)" :to="linkTo(d)" class="text-blue-600 hover:underline">{{ d }}</router-link>
                  <span v-else class="text-gray-700">{{ d }}</span>
                  <span v-if="i < entity.domain.length - 1">, </span>
                </template>
              </td>
            </tr>
            <tr v-if="entity.range?.length">
              <td class="py-1 pr-4 font-medium text-gray-600 align-top w-32">Range</td>
              <td>
                <template v-for="(r, i) in entity.range" :key="r">
                  <router-link v-if="linkTo(r)" :to="linkTo(r)" class="text-blue-600 hover:underline">{{ r }}</router-link>
                  <span v-else class="text-gray-700">{{ r }}</span>
                  <span v-if="i < entity.range.length - 1">, </span>
                </template>
              </td>
            </tr>
            <tr v-if="entity.type === 'objectProperty'">
              <td class="py-1 pr-4 font-medium text-gray-600 w-32">Functional</td>
              <td>{{ entity.functional ? 'Yes' : 'No' }}</td>
            </tr>
          </table>
        </div>
      </template>

      <!-- ─── Shape-specific ────────────────────────────────────────── -->
      <template v-if="entity.type === 'shape'">
        <div v-if="entity.targetClass" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Target Class</h3>
          <router-link v-if="linkTo(entity.targetClass)" :to="linkTo(entity.targetClass)" class="text-blue-600 hover:underline">{{ entity.targetClass }}</router-link>
          <span v-else class="text-gray-700">{{ entity.targetClass }}</span>
        </div>

        <div v-if="entity.targetSubjectsOf" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Target Subjects Of</h3>
          <router-link v-if="linkTo(entity.targetSubjectsOf)" :to="linkTo(entity.targetSubjectsOf)" class="text-blue-600 hover:underline">{{ entity.targetSubjectsOf }}</router-link>
          <span v-else class="text-gray-700">{{ entity.targetSubjectsOf }}</span>
        </div>

        <div v-if="entity.targetObjectsOf" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Target Objects Of</h3>
          <router-link v-if="linkTo(entity.targetObjectsOf)" :to="linkTo(entity.targetObjectsOf)" class="text-blue-600 hover:underline">{{ entity.targetObjectsOf }}</router-link>
          <span v-else class="text-gray-700">{{ entity.targetObjectsOf }}</span>
        </div>

        <div v-if="entity.constraints?.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Shape Properties ({{ entity.constraints.length }})
          </h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="border-b bg-gray-50">
                  <th class="text-left py-2 px-3 font-semibold text-gray-600">Property</th>
                  <th class="text-center py-2 px-3 font-semibold text-gray-600">Min</th>
                  <th class="text-center py-2 px-3 font-semibold text-gray-600">Max</th>
                  <th class="text-left py-2 px-3 font-semibold text-gray-600">Type / Class</th>
                  <th class="text-left py-2 px-3 font-semibold text-gray-600">Node Kind</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(c, i) in entity.constraints" :key="i" class="border-b last:border-b-0">
                  <td class="py-2 px-3">
                    <router-link v-if="linkTo(c.path)" :to="linkTo(c.path)" class="text-blue-600 hover:underline">{{ c.path }}</router-link>
                    <span v-else class="text-gray-700">{{ c.path }}</span>
                  </td>
                  <td class="py-2 px-3 text-center">{{ c.minCount ?? '—' }}</td>
                  <td class="py-2 px-3 text-center">{{ c.maxCount ?? '—' }}</td>
                  <td class="py-2 px-3">
                    <span v-if="c.datatype" class="italic">{{ c.datatype }}</span>
                    <router-link v-else-if="c.classValue && linkTo(c.classValue)" :to="linkTo(c.classValue)" class="text-blue-600 hover:underline">{{ c.classValue }}</router-link>
                    <span v-else-if="c.classValue" class="text-gray-700">{{ c.classValue }}</span>
                    <span v-if="c.hasValue" class="text-gray-400 ml-1">= {{ c.hasValue }}</span>
                  </td>
                  <td class="py-2 px-3">{{ c.nodeKind || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- ─── Concept-specific ──────────────────────────────────────── -->
      <template v-if="entity.type === 'concept'">
        <div v-if="entity.scheme" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Concept Scheme</h3>
          <router-link :to="linkTo(entity.scheme)" class="text-blue-600 hover:underline">{{ entity.scheme }}</router-link>
        </div>
        <div v-if="entity.instanceOf?.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Instance Of</h3>
          <ul class="space-y-1">
            <li v-for="t of entity.instanceOf" :key="t">
              <router-link v-if="linkTo(t)" :to="linkTo(t)" class="text-blue-600 hover:underline">{{ t }}</router-link>
              <span v-else>{{ t }}</span>
            </li>
          </ul>
        </div>
        <div v-if="conceptShapes.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Related Shapes</h3>
          <ul class="space-y-1">
            <li v-for="s in conceptShapes" :key="s.qname">
              <router-link :to="`/ontology/${s.slug}`" class="text-blue-600 hover:underline">{{ s.qname }}</router-link>
            </li>
          </ul>
        </div>
      </template>

      <!-- ─── Concept Scheme-specific ────────────────────────────────── -->
      <template v-if="entity.type === 'conceptScheme'">
        <div v-if="schemeConcepts.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Concepts ({{ schemeConcepts.length }})</h3>
          <ul class="space-y-1">
            <li v-for="c in schemeConcepts" :key="c.qname">
              <router-link :to="`/ontology/${c.slug}`" class="text-blue-600 hover:underline">{{ c.qname }}</router-link>
              <span v-if="c.description" class="text-gray-400 text-sm ml-2">— {{ c.description.slice(0, 60) }}{{ c.description.length > 60 ? '…' : '' }}</span>
            </li>
          </ul>
        </div>
      </template>

      <!-- ─── Individual-specific ────────────────────────────────────── -->
      <template v-if="entity.type === 'individual'">
        <div v-if="entity.instanceOf?.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Instance Of</h3>
          <ul class="space-y-1">
            <li v-for="t of entity.instanceOf" :key="t">
              <router-link v-if="linkTo(t)" :to="linkTo(t)" class="text-blue-600 hover:underline">{{ t }}</router-link>
              <span v-else>{{ t }}</span>
            </li>
          </ul>
        </div>
      </template>

      <!-- ─── Ontology-specific ──────────────────────────────────────── -->
      <template v-if="entity.type === 'ontology'">
        <div v-if="entity.version" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Version</h3>
          <p class="text-gray-700">{{ entity.version }}</p>
        </div>
        <div v-if="entity.imports?.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Imports</h3>
          <ul class="space-y-1">
            <li v-for="imp of entity.imports" :key="imp">
              <router-link v-if="linkTo(imp)" :to="linkTo(imp)" class="text-blue-600 hover:underline">{{ imp }}</router-link>
              <span v-else class="text-gray-700">{{ imp }}</span>
            </li>
          </ul>
        </div>

        <!-- Namespace URI -->
        <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Namespace URI</h3>
          <code class="text-sm break-all">{{ ontologyNs?.uri || entity.uri }}</code>
        </div>

        <!-- Metrics -->
        <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Entity Summary</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-200/40 text-center">
              <div class="text-xl font-bold text-blue-700">{{ ontologyClasses.length }}</div>
              <div class="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Classes</div>
            </div>
            <div class="px-3 py-2 rounded-lg bg-green-50/50 border border-green-200/40 text-center">
              <div class="text-xl font-bold text-green-700">{{ ontologyObjProps.length + ontologyDtProps.length }}</div>
              <div class="text-[10px] font-semibold text-green-500 uppercase tracking-wider">Properties</div>
            </div>
            <div class="px-3 py-2 rounded-lg bg-purple-50/50 border border-purple-200/40 text-center">
              <div class="text-xl font-bold text-purple-700">{{ ontologyShapes.length }}</div>
              <div class="text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Shapes</div>
            </div>
            <div class="px-3 py-2 rounded-lg bg-orange-50/50 border border-orange-200/40 text-center">
              <div class="text-xl font-bold text-orange-700">{{ ontologyIndividuals.length }}</div>
              <div class="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">Individuals</div>
            </div>
          </div>
        </div>

        <!-- Classes -->
        <div v-if="ontologyClasses.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Classes ({{ ontologyClasses.length }})
          </h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200/60">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/60">
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Class</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Description</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Parent</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in ontologyClasses" :key="c.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                  <td class="px-3 py-1.5">
                    <router-link :to="`/ontology/${c.slug}`" class="text-brand-600 hover:underline font-medium">{{ c.qname }}</router-link>
                  </td>
                  <td class="px-3 py-1.5 text-slate-600 dark:text-slate-400 max-w-sm truncate">{{ c.description || '—' }}</td>
                  <td class="px-3 py-1.5">
                    <router-link v-if="c.parent && linkTo(c.parent)" :to="linkTo(c.parent)" class="text-blue-600 hover:underline">{{ c.parent }}</router-link>
                    <span v-else-if="c.parent">{{ c.parent }}</span>
                    <span v-else class="text-slate-400">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Object Properties -->
        <div v-if="ontologyObjProps.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Object Properties ({{ ontologyObjProps.length }})
          </h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200/60">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/60">
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Property</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Description</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Domain</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Range</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in ontologyObjProps" :key="p.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                  <td class="px-3 py-1.5">
                    <router-link :to="`/ontology/${p.slug}`" class="text-green-700 hover:underline font-medium">{{ p.qname }}</router-link>
                  </td>
                  <td class="px-3 py-1.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ p.description || '—' }}</td>
                  <td class="px-3 py-1.5">
                    <template v-for="(d, i) in p.domain" :key="d">
                      <router-link v-if="linkTo(d)" :to="linkTo(d)" class="text-blue-600 hover:underline">{{ d }}</router-link>
                      <span v-else>{{ d }}</span>
                      <span v-if="i < p.domain!.length - 1">, </span>
                    </template>
                    <span v-if="!p.domain?.length" class="text-slate-400">—</span>
                  </td>
                  <td class="px-3 py-1.5">
                    <template v-for="(r, i) in p.range" :key="r">
                      <router-link v-if="linkTo(r)" :to="linkTo(r)" class="text-blue-600 hover:underline">{{ r }}</router-link>
                      <span v-else>{{ r }}</span>
                      <span v-if="i < p.range!.length - 1">, </span>
                    </template>
                    <span v-if="!p.range?.length" class="text-slate-400">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Datatype Properties -->
        <div v-if="ontologyDtProps.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Datatype Properties ({{ ontologyDtProps.length }})
          </h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200/60">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/60">
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Property</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Description</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Domain</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Range</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in ontologyDtProps" :key="p.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                  <td class="px-3 py-1.5">
                    <router-link :to="`/ontology/${p.slug}`" class="text-lime-700 hover:underline font-medium">{{ p.qname }}</router-link>
                  </td>
                  <td class="px-3 py-1.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">{{ p.description || '—' }}</td>
                  <td class="px-3 py-1.5">
                    <template v-for="(d, i) in p.domain" :key="d">
                      <router-link v-if="linkTo(d)" :to="linkTo(d)" class="text-blue-600 hover:underline">{{ d }}</router-link>
                      <span v-else>{{ d }}</span>
                      <span v-if="i < p.domain!.length - 1">, </span>
                    </template>
                    <span v-if="!p.domain?.length" class="text-slate-400">—</span>
                  </td>
                  <td class="px-3 py-1.5 font-mono text-slate-500">{{ p.range?.join(', ') || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Annotation Properties -->
        <div v-if="ontologyAnnProps.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Annotation Properties ({{ ontologyAnnProps.length }})
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <router-link v-for="p in ontologyAnnProps" :key="p.qname" :to="`/ontology/${p.slug}`"
              class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-amber-200 hover:text-amber-600 transition-colors">
              {{ p.qname }}
            </router-link>
          </div>
        </div>

        <!-- SHACL Shapes -->
        <div v-if="ontologyShapes.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            SHACL Shapes ({{ ontologyShapes.length }})
          </h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200/60">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/60">
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Shape</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Target</th>
                  <th class="text-center px-3 py-1.5 font-semibold text-slate-500">Constraints</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in ontologyShapes" :key="s.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                  <td class="px-3 py-1.5">
                    <router-link :to="`/ontology/${s.slug}`" class="text-purple-700 hover:underline font-medium">{{ s.qname }}</router-link>
                  </td>
                  <td class="px-3 py-1.5">
                    <router-link v-if="s.targetClass && linkTo(s.targetClass)" :to="linkTo(s.targetClass)" class="text-blue-600 hover:underline">{{ s.targetClass }}</router-link>
                    <span v-else-if="s.targetClass">{{ s.targetClass }}</span>
                    <span v-else class="text-slate-400">—</span>
                  </td>
                  <td class="px-3 py-1.5 text-center tabular-nums">{{ s.constraints?.length || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Concept Schemes -->
        <div v-if="ontologyConceptSchemes.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Concept Schemes ({{ ontologyConceptSchemes.length }})
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <router-link v-for="s in ontologyConceptSchemes" :key="s.qname" :to="`/ontology/${s.slug}`"
              class="text-[10px] font-medium px-2 py-1 rounded-lg border border-cyan-200/60 bg-cyan-50/50 text-cyan-700 hover:border-cyan-300 hover:text-cyan-800 transition-colors">
              {{ s.qname }}
            </router-link>
          </div>
        </div>

        <!-- SKOS Concepts -->
        <div v-if="ontologyConcepts.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            SKOS Concepts ({{ ontologyConcepts.length }})
          </h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200/60">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/60">
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Concept</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Description</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Instance Of</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in ontologyConcepts" :key="c.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                  <td class="px-3 py-1.5">
                    <router-link :to="`/ontology/${c.slug}`" class="text-teal-700 hover:underline font-medium">{{ c.label }}</router-link>
                    <code class="ml-1 text-[9px] text-slate-400">{{ c.qname }}</code>
                  </td>
                  <td class="px-3 py-1.5 text-slate-600 dark:text-slate-400 max-w-sm truncate">{{ c.description || '—' }}</td>
                  <td class="px-3 py-1.5">
                    <template v-for="(t, i) in c.instanceOf" :key="t">
                      <router-link v-if="linkTo(t)" :to="linkTo(t)" class="text-blue-600 hover:underline">{{ t }}</router-link>
                      <span v-else>{{ t }}</span>
                      <span v-if="i < c.instanceOf!.length - 1">, </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Named Individuals -->
        <div v-if="ontologyIndividuals.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Named Individuals ({{ ontologyIndividuals.length }})
          </h3>
          <div class="overflow-x-auto rounded-lg border border-slate-200/60">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-200/60">
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Individual</th>
                  <th class="text-left px-3 py-1.5 font-semibold text-slate-500">Instance Of</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ind in ontologyIndividuals" :key="ind.qname" class="border-b border-slate-100 dark:border-dark-700/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                  <td class="px-3 py-1.5">
                    <router-link :to="`/ontology/${ind.slug}`" class="text-brand-600 hover:underline font-medium">{{ ind.label }}</router-link>
                    <code class="ml-1 text-[9px] text-slate-400">{{ ind.qname }}</code>
                  </td>
                  <td class="px-3 py-1.5">
                    <template v-for="(t, i) in ind.instanceOf" :key="t">
                      <router-link v-if="linkTo(t)" :to="linkTo(t)" class="text-blue-600 hover:underline">{{ t }}</router-link>
                      <span v-else>{{ t }}</span>
                      <span v-if="i < ind.instanceOf!.length - 1">, </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- Where Used (all entity types) -->
      <div v-if="whereUsed.length" class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Where Used ({{ whereUsed.length }})</h3>
        <ul class="space-y-1">
          <li v-for="wu in whereUsed" :key="`${wu.entity.qname}-${wu.context}`">
            <router-link :to="`/ontology/${wu.entity.slug}`" class="text-blue-600 hover:underline">{{ wu.entity.qname }}</router-link>
            <span class="text-gray-400 text-xs ml-2">via {{ wu.context }}</span>
          </li>
        </ul>
      </div>
    </template>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- RDF SOURCE TAB                                                 -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <template v-if="detailTab === 'rdf'">
      <div class="bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 rounded-lg p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex gap-1 p-1 rounded-lg bg-slate-100 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60">
            <button @click="rdfFormat = 'turtle'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              :class="rdfFormat === 'turtle' ? 'bg-white dark:bg-dark-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'">
              Turtle
            </button>
            <button @click="rdfFormat = 'jsonld'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              :class="rdfFormat === 'jsonld' ? 'bg-white dark:bg-dark-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'">
              JSON-LD
            </button>
          </div>
          <button @click="handleDownload(rdfFormat)"
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors">
            Download .{{ rdfFormat === 'turtle' ? 'ttl' : 'jsonld' }}
          </button>
        </div>
        <pre class="bg-slate-900 text-green-300 text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap"><code>{{ rdfFormat === 'turtle' ? turtleCode : jsonldCode }}</code></pre>
      </div>
    </template>
  </div>
  </div>
</template>
