<script setup lang="ts">
import { asset } from '../lib/asset'
import { ref, computed, watch, nextTick } from 'vue'
import ClassTreeNode from './ClassTreeNode.vue'
import OntologyCharts from './OntologyCharts.vue'

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
  constraints?: { path: string; minCount?: number; maxCount?: number; datatype?: string; nodeKind?: string; classValue?: string; hasValue?: string; uniqueLang?: boolean }[]
  scheme?: string
  instanceOf?: string[]
  topConcepts?: string[]
  version?: string
  imports?: string[]
  isPartOf?: string[]
  identifier?: string
}

interface NamespaceGroup {
  prefix: string
  uri: string
  entities: Entity[]
}

interface OntoNamespace {
  prefix: string
  uri: string
  title: string
  description: string
  color: string
  version: string
}

interface PrefixEntry {
  prefix: string
  uri: string
}

interface TypeMeta {
  label: string
  color: string
  colorDot: string
}

interface ImportedOntology {
  prefix: string
  uri: string
  title: string
  description: string
  version: string
}

const props = defineProps<{
  allEntities: readonly Entity[]
  allClasses: readonly Entity[]
  classes: readonly Entity[]
  objProps: readonly Entity[]
  dtProps: readonly Entity[]
  annProps: readonly Entity[]
  shapes: readonly Entity[]
  concepts: readonly Entity[]
  conceptSchemes: readonly Entity[]
  individuals: readonly Entity[]
  ontologies: readonly Entity[]
  rootClasses: readonly Entity[]
  namespaceGroups: NamespaceGroup[]
  ontologyPrefixes: readonly PrefixEntry[]
  ontologyNamespaces: readonly OntoNamespace[]
  typeMeta: Record<string, TypeMeta>
  primaryOntology: OntoNamespace
  importedOntologies: ImportedOntology[]
  chartTypeLabels: string[]
  chartTypeCounts: number[]
  chartTypeColors: string[]
  ontoDisplayLabels: string[]
  ontoCounts: number[]
  ontoColors: string[]
}>()

// --- Tab switching ---
const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'namespaces', label: 'Namespaces' },
  { id: 'az', label: 'Entities A-Z' },
  { id: 'classes', label: 'Classes' },
  { id: 'properties', label: 'Properties' },
  { id: 'skos', label: 'SKOS' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'individuals', label: 'Individuals' },
  { id: 'statistics', label: 'Statistics' },
]

const filterableSections = ['classes', 'properties', 'az', 'shapes', 'individuals', 'skos']
const ontologyFilterSections = ['classes', 'properties', 'skos', 'shapes', 'individuals']

const activeTab = ref('overview')

const showFilter = computed(() => filterableSections.includes(activeTab.value))
const showOntologyFilter = computed(() => ontologyFilterSections.includes(activeTab.value))
const showCharts = computed(() => activeTab.value === 'statistics')

// --- Entity text filter ---
const searchQuery = ref('')

// --- Ontology filter ---
const ontologyFilter = ref<'isq' | 'smart' | 'all'>('isq')

function isEntityVisible(e: Entity): boolean {
  // Ontology filter
  if (ontologyFilter.value !== 'all' && e.ontology !== ontologyFilter.value) return false
  // Text filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    return e.label.toLowerCase().includes(q) || e.qname.toLowerCase().includes(q)
  }
  return true
}

// Filtered entity collections for reactive rendering
const filteredNamespaceGroups = computed(() =>
  props.namespaceGroups.map(g => ({
    ...g,
    entities: g.entities.filter(isEntityVisible),
  })),
)

const filteredAzEntities = computed(() =>
  [...props.allEntities].sort((a, b) => a.label.localeCompare(b.label)).filter(isEntityVisible),
)

const filteredClasses = computed(() => props.classes.filter(isEntityVisible))
const filteredObjProps = computed(() => props.objProps.filter(isEntityVisible))
const filteredDtProps = computed(() => props.dtProps.filter(isEntityVisible))
const filteredShapes = computed(() => props.shapes.filter(isEntityVisible))
const filteredIndividuals = computed(() => props.individuals.filter(isEntityVisible))

// --- Helpers ---
function countBy(type: string, ontology: string) {
  return props.allEntities.filter(e => e.type === type && (ontology === 'all' || e.ontology === ontology)).length
}

function badgeColor(e: Entity) {
  if (e.ontology === 'smart') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
  if (e.ontology === 'isq') return 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400'
  return 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400'
}

function ontologySlug(prefix: string) {
  return props.allEntities.find(e => e.type === 'ontology' && e.ontology === prefix)?.slug
}

function entitySlug(qname: string | undefined) {
  if (!qname) return undefined
  return props.allEntities.find(e => e.qname === qname)?.slug
}

// All expandable class nodes for expand-all default
const allExpandable = computed(() => props.allClasses.filter(c => props.allClasses.some(cc => cc.parent === c.qname)).map(c => c.qname))

// --- Class tree expand/collapse ---
const treeExpanded = ref(new Set<string>())

function expandAll() {
  treeExpanded.value = new Set([...allExpandable.value])
}

function collapseAll() {
  treeExpanded.value = new Set()
}

// Sync the expanded set into ClassTreeNode via expandedNodes prop change
const expandedNodesKey = ref(0)
watch(treeExpanded, async () => {
  await nextTick()
  expandedNodesKey.value++
})
</script>

<template>
  <div>
    <!-- Section navigation tabs -->
    <div class="mt-6 flex flex-wrap gap-3 items-center">
      <div class="flex gap-0.5 p-1 rounded-xl bg-slate-100/80 dark:bg-dark-700/80 border border-slate-200/60">
        <button
          v-for="s in sections"
          :key="s.id"
          @click="activeTab = s.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            activeTab === s.id
              ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-none'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
        >{{ s.label }}</button>
      </div>
      <div
        v-show="showOntologyFilter"
        class="flex gap-1 p-1 rounded-lg bg-slate-100/80 dark:bg-dark-700/80 border border-slate-200/60"
      >
        <button
          @click="ontologyFilter = 'isq'"
          :class="[
            'px-3 py-1.5 rounded-md text-[10px] font-medium transition-all',
            ontologyFilter === 'isq'
              ? 'bg-white dark:bg-dark-800 text-brand-700 dark:text-brand-400 shadow-sm dark:shadow-none'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
        >ISO &amp; IEC 80000</button>
        <button
          @click="ontologyFilter = 'smart'"
          :class="[
            'px-3 py-1.5 rounded-md text-[10px] font-medium transition-all',
            ontologyFilter === 'smart'
              ? 'bg-white dark:bg-dark-800 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-none'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
        >SMART Core</button>
        <button
          @click="ontologyFilter = 'all'"
          :class="[
            'px-3 py-1.5 rounded-md text-[10px] font-medium transition-all',
            ontologyFilter === 'all'
              ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-none'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
        >All</button>
      </div>
      <div v-show="showFilter" class="relative max-w-xs flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter entities..."
          class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
        />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- OVERVIEW                                                              -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'overview'" data-section="overview" class="mt-8 space-y-6">
      <!-- Primary ontology card -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600">isq</span>
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 heading-serif">{{ primaryOntology.title }}</h2>
        </div>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">URI</span>
            <code class="block mt-0.5 text-xs text-slate-700 dark:text-slate-300 font-mono break-all">{{ primaryOntology.uri }}</code>
          </div>
          <div>
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
            <p class="mt-0.5 text-slate-600">{{ primaryOntology.description }}</p>
          </div>
          <div class="flex gap-6">
            <div>
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Version</span>
              <code class="text-xs text-slate-700 dark:text-slate-300 font-mono">{{ primaryOntology.version }}</code>
            </div>
            <div v-if="importedOntologies.length > 0">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Imports</span>
              <div class="flex gap-1.5 mt-0.5">
                <a
                  v-for="imp in importedOntologies"
                  :key="imp.prefix"
                  :href="asset(`/ontology/${ontologySlug(imp.prefix)}`)"
                  class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                >{{ imp.prefix }}</a>
              </div>
            </div>
          </div>
        </div>
        <div v-if="importedOntologies.length > 0" class="mt-4 pt-4 border-t border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Imported Ontolog{{ importedOntologies.length > 1 ? 'ies' : 'y' }}</span>
          </div>
          <div class="space-y-2">
            <a
              v-for="imp in importedOntologies"
              :key="imp.prefix"
              :href="asset(`/ontology/${ontologySlug(imp.prefix)}`)"
              class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 hover:bg-slate-100/80 dark:hover:bg-dark-600 transition-colors"
            >
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">{{ imp.prefix }}</span>
              <div>
                <span class="text-sm text-slate-700 dark:text-slate-200">{{ imp.title }}</span>
                <span class="text-xs text-slate-400 ml-2">v{{ imp.version }}</span>
              </div>
              <span class="text-xs text-slate-400 ml-auto truncate max-w-xs">{{ imp.description }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="t in ['class', 'objectProperty', 'shape', 'concept']" :key="t" class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 text-center">
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ countBy(t, 'all') }}</div>
            <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{{ typeMeta[t]?.label || t }}</div>
          </div>
        </div>
        <div class="mt-4 grid sm:grid-cols-2 gap-4">
          <div class="px-4 py-3 rounded-xl bg-brand-50/50 border border-brand-200/40">
            <div class="text-xs font-semibold text-brand-700 mb-2">ISO &amp; IEC 80000</div>
            <div class="flex gap-3 text-xs text-slate-600">
              <span>{{ countBy('class', 'isq') }} classes</span>
              <span class="text-slate-300">&middot;</span>
              <span>{{ countBy('objectProperty', 'isq') }} properties</span>
              <span class="text-slate-300">&middot;</span>
              <span>{{ countBy('shape', 'isq') }} shapes</span>
            </div>
          </div>
          <div class="px-4 py-3 rounded-xl bg-emerald-50/50 border border-emerald-200/40">
            <div class="text-xs font-semibold text-emerald-700 mb-2">SMART Core</div>
            <div class="flex gap-3 text-xs text-slate-600">
              <span>{{ countBy('class', 'smart') }} classes</span>
              <span class="text-slate-300">&middot;</span>
              <span>{{ countBy('objectProperty', 'smart') + countBy('datatypeProperty', 'smart') }} properties</span>
              <span class="text-slate-300">&middot;</span>
              <span>{{ countBy('shape', 'smart') }} shapes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Namespaces -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Namespace Declarations</h3>
        <div class="overflow-x-auto rounded-lg border border-slate-200/60">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-3 py-2 font-semibold text-slate-500">PREFIX</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">URI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ns in ontologyPrefixes" :key="ns.prefix" class="border-b border-slate-100/60 last:border-0">
                <td class="px-3 py-2"><span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300 font-mono">{{ ns.prefix || ':' }}</span></td>
                <td class="px-3 py-2 font-mono text-slate-600 break-all">{{ ns.uri }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Imported / utilized vocabularies -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 heading-serif mb-1">Utilized Vocabularies</h2>
        <p class="text-sm text-slate-500 mb-4">Ontologies and vocabularies referenced by the ISO &amp; IEC 80000 domain ontology.</p>
        <div class="space-y-3">
          <a
            v-for="imp in importedOntologies"
            :key="imp.prefix"
            :href="asset(`/ontology/${ontologySlug(imp.prefix)}`)"
            class="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200/40 hover:bg-emerald-50/70 transition-colors"
          >
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5">{{ imp.prefix }}</span>
            <div class="min-w-0">
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ imp.title }}</div>
              <code class="text-[10px] text-slate-500 font-mono break-all">{{ imp.uri }}</code>
              <p class="text-xs text-slate-500 mt-1">{{ imp.description }}</p>
            </div>
          </a>
          <div
            v-for="ns in namespaceGroups.filter(g => !ontologyNamespaces.find(n => n.prefix === g.prefix))"
            :key="ns.prefix"
            class="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60"
          >
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5 font-mono">{{ ns.prefix }}</span>
            <div class="min-w-0">
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ ns.prefix }} ({{ ns.entities.length }} entities)</div>
              <code class="text-[10px] text-slate-500 font-mono break-all">{{ ns.uri }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Class hierarchy diagram (interactive visual tree) -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-start justify-between gap-4 mb-1 flex-wrap">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 heading-serif">Class Hierarchy</h2>
            <p class="text-sm text-slate-500 mt-0.5">Explore the full class tree — click nodes to expand or collapse subclasses.</p>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button @click="expandAll" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 hover:border-slate-300 dark:hover:border-dark-500 transition-colors font-medium">Expand all</button>
            <button @click="collapseAll" class="text-xs px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 hover:border-slate-300 dark:hover:border-dark-500 transition-colors font-medium">Collapse all</button>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-4 mt-3 mb-4 pb-4 border-b border-slate-100 dark:border-dark-700">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm border-l-2 border-brand-400 dark:border-brand-500 bg-brand-50/50 dark:bg-brand-950/20"></span>
            <span class="text-[11px] text-slate-500">ISO &amp; IEC 80000 (isq)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm border-l-2 border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"></span>
            <span class="text-[11px] text-slate-500">SMART Core (smart)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm border-l-2 border-slate-300 dark:border-dark-500 bg-slate-50/50 dark:bg-dark-700/40"></span>
            <span class="text-[11px] text-slate-500">External</span>
          </div>
          <div class="flex items-center gap-1.5 ml-auto">
            <span class="text-[11px] text-slate-400">{{ rootClasses.length }} root class{{ rootClasses.length > 1 ? 'es' : '' }}</span>
            <span class="text-slate-300 dark:text-dark-600">&middot;</span>
            <span class="text-[11px] text-slate-400">{{ allClasses.length }} total</span>
          </div>
        </div>

        <!-- The tree -->
        <div id="class-tree-root" class="space-y-0.5" :key="expandedNodesKey">
          <ClassTreeNode
            v-for="root in rootClasses"
            :key="root.qname"
            :entity="root"
            :depth="0"
            :all-classes="allClasses"
            :expanded-nodes="treeExpanded"
          />
        </div>

        <!-- Download link -->
        <div class="mt-5 pt-4 border-t border-slate-100 dark:border-dark-700 flex items-center gap-2 flex-wrap">
          <a
            :href="asset('/ontology/full.ttl')"
            class="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 dark:hover:bg-emerald-950/60 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download complete ontology (Turtle)
          </a>
          <a
            :href="asset('/ontologies/isq.shacl.ttl')"
            class="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-700 dark:bg-dark-700 dark:text-slate-300 dark:border-dark-600 dark:hover:bg-dark-600 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            SHACL shapes (Turtle)
          </a>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- NAMESPACES                                                            -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'namespaces'" data-section="namespaces" class="mt-8 space-y-4">
      <div v-for="ns in filteredNamespaceGroups" :key="ns.prefix" class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300 font-mono">{{ ns.prefix }}</span>
          <code class="text-xs text-slate-500 font-mono break-all">{{ ns.uri }}</code>
          <span class="ml-auto text-xs text-slate-400">{{ ns.entities.length }} entities</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <a
            v-for="e in ns.entities"
            :key="e.qname"
            :href="asset(`/ontology/${e.slug}`)"
            class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', typeMeta[e.type]?.colorDot || 'bg-slate-300']"></span>
            {{ e.label }}
          </a>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- ENTITIES A-Z                                                          -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'az'" data-section="az" class="mt-8 space-y-6">
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">All Entities ({{ allEntities.length }})</h3>
        <div class="flex flex-wrap gap-1.5">
          <a
            v-for="e in filteredAzEntities"
            :key="e.qname"
            :href="asset(`/ontology/${e.slug}`)"
            class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
          >
            <span :class="['w-1.5 h-1.5 rounded-full', typeMeta[e.type]?.colorDot || 'bg-slate-300']"></span>
            {{ e.label }}
          </a>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- CLASSES                                                               -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'classes'" data-section="classes" class="mt-8 space-y-4">
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
              <th class="text-left px-4 py-2 font-semibold text-slate-500 text-xs">Class</th>
              <th class="text-left px-4 py-2 font-semibold text-slate-500 text-xs">Description</th>
              <th class="text-left px-4 py-2 font-semibold text-slate-500 text-xs">Parent</th>
              <th class="text-center px-4 py-2 font-semibold text-slate-500 text-xs">Ontology</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in filteredClasses"
              :key="c.qname"
              class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50"
            >
              <td class="px-4 py-2">
                <a :href="asset(`/ontology/${c.slug}`)" class="text-brand-600 hover:underline font-medium">{{ c.qname }}</a>
              </td>
              <td class="px-4 py-2 text-slate-600 max-w-md truncate">{{ c.description || '—' }}</td>
              <td class="px-4 py-2">
                <a v-if="c.parent" :href="asset(`/ontology/${entitySlug(c.parent)}`)" class="text-blue-600 hover:underline text-xs">{{ c.parent }}</a>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-2 text-center">
                <span :class="['text-[9px] font-semibold px-1.5 py-0.5 rounded', badgeColor(c)]">{{ c.ontology }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- PROPERTIES                                                            -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'properties'" data-section="properties" class="mt-8 space-y-4">
      <!-- Object properties -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Object Properties ({{ objProps.length }})</h3>
        <div class="overflow-x-auto rounded-lg border border-slate-200/60">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Property</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Description</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Domain</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Range</th>
                <th class="text-center px-3 py-2 font-semibold text-slate-500">Ont.</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in filteredObjProps"
                :key="p.qname"
                class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50"
              >
                <td class="px-3 py-2"><a :href="asset(`/ontology/${p.slug}`)" class="text-green-700 hover:underline font-medium">{{ p.qname }}</a></td>
                <td class="px-3 py-2 text-slate-600 max-w-xs truncate">{{ p.description || '—' }}</td>
                <td class="px-3 py-2">
                  <template v-if="p.domain?.length">
                    <template v-for="(d, i) in p.domain" :key="i">
                      <a :href="asset(`/ontology/${entitySlug(d)}`)" class="text-blue-600 hover:underline">{{ d }}</a>
                      <span v-if="i < p.domain.length - 1">, </span>
                    </template>
                  </template>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-3 py-2">
                  <template v-if="p.range?.length">
                    <template v-for="(r, i) in p.range" :key="i">
                      <a :href="asset(`/ontology/${entitySlug(r)}`)" class="text-blue-600 hover:underline">{{ r }}</a>
                      <span v-if="i < p.range.length - 1">, </span>
                    </template>
                  </template>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-3 py-2 text-center"><span :class="['text-[9px] font-semibold px-1.5 py-0.5 rounded', badgeColor(p)]">{{ p.ontology }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Datatype properties -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Datatype Properties ({{ dtProps.length }})</h3>
        <div class="overflow-x-auto rounded-lg border border-slate-200/60">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Property</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Description</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Domain</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Range</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in filteredDtProps"
                :key="p.qname"
                class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50"
              >
                <td class="px-3 py-2"><a :href="asset(`/ontology/${p.slug}`)" class="text-lime-700 hover:underline font-medium">{{ p.qname }}</a></td>
                <td class="px-3 py-2 text-slate-600 max-w-xs truncate">{{ p.description || '—' }}</td>
                <td class="px-3 py-2">
                  <template v-if="p.domain?.length">
                    <template v-for="(d, i) in p.domain" :key="i">
                      <a :href="asset(`/ontology/${entitySlug(d)}`)" class="text-blue-600 hover:underline">{{ d }}</a>
                      <span v-if="i < p.domain.length - 1">, </span>
                    </template>
                  </template>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td class="px-3 py-2 font-mono text-slate-500">{{ p.range?.join(', ') || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Annotation properties -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">Annotation Properties ({{ annProps.length }})</h3>
        <div class="flex flex-wrap gap-1.5">
          <a
            v-for="p in annProps"
            :key="p.qname"
            :href="asset(`/ontology/${p.slug}`)"
            class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-amber-200 hover:text-amber-600 transition-colors"
          >{{ p.qname }}</a>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- SKOS                                                                  -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'skos'" data-section="skos" class="mt-8 space-y-6">
      <div v-for="scheme in conceptSchemes" :key="scheme.qname" class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600">Scheme</span>
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ scheme.label }}</h3>
        </div>
        <code class="text-xs text-slate-500 block mb-3">{{ scheme.uri }}</code>
        <div class="overflow-x-auto rounded-lg border border-slate-200/60">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Concept</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Description</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Instance Of</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in allEntities.filter(e => e.type === 'concept' && e.scheme === scheme.qname)"
                :key="c.qname"
                class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50"
                v-show="isEntityVisible(c)"
              >
                <td class="px-3 py-2">
                  <a :href="asset(`/ontology/${c.slug}`)" class="text-teal-700 hover:underline font-medium">{{ c.label }}</a>
                  <code class="ml-1 text-[9px] text-slate-400">{{ c.qname }}</code>
                </td>
                <td class="px-3 py-2 text-slate-600 max-w-sm">{{ c.description || '—' }}</td>
                <td class="px-3 py-2">
                  <template v-if="c.instanceOf?.length">
                    <template v-for="(t, i) in c.instanceOf" :key="i">
                      <a :href="asset(`/ontology/${entitySlug(t)}`)" class="text-blue-600 hover:underline">{{ t }}</a>
                      <span v-if="i < c.instanceOf.length - 1">, </span>
                    </template>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- SHAPES                                                                -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'shapes'" data-section="shapes" class="mt-8 space-y-4">
      <div
        v-for="s in filteredShapes"
        :key="s.qname"
        class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6"
      >
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">Shape</span>
          <a :href="asset(`/ontology/${s.slug}`)" class="text-sm font-bold text-brand-600 hover:underline">{{ s.qname }}</a>
          <span :class="['text-[9px] font-semibold px-1.5 py-0.5 rounded', badgeColor(s)]">{{ s.ontology }}</span>
        </div>
        <div class="text-xs text-slate-500 mb-3">
          <span v-if="s.targetClass">Target: <a :href="asset(`/ontology/${entitySlug(s.targetClass)}`)" class="text-blue-600 hover:underline">{{ s.targetClass }}</a></span>
          <span v-if="s.targetSubjectsOf">Subjects of: <a :href="asset(`/ontology/${entitySlug(s.targetSubjectsOf)}`)" class="text-blue-600 hover:underline">{{ s.targetSubjectsOf }}</a></span>
          <span v-if="s.targetObjectsOf">Objects of: {{ s.targetObjectsOf }}</span>
        </div>
        <div v-if="s.constraints?.length" class="overflow-x-auto rounded-lg border border-slate-200/60">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Property</th>
                <th class="text-center px-3 py-2 font-semibold text-slate-500">Min</th>
                <th class="text-center px-3 py-2 font-semibold text-slate-500">Max</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Type / Class</th>
                <th class="text-left px-3 py-2 font-semibold text-slate-500">Node Kind</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, i) in s.constraints" :key="i" class="border-b border-slate-100/60 last:border-0">
                <td class="px-3 py-2">
                  <a v-if="entitySlug(c.path)" :href="asset(`/ontology/${entitySlug(c.path)}`)" class="text-blue-600 hover:underline">{{ c.path }}</a>
                  <span v-else class="font-mono">{{ c.path }}</span>
                </td>
                <td class="px-3 py-2 text-center">{{ c.minCount ?? '—' }}</td>
                <td class="px-3 py-2 text-center">{{ c.maxCount ?? '—' }}</td>
                <td class="px-3 py-2">
                  <span v-if="c.datatype" class="italic">{{ c.datatype }}</span>
                  <a v-if="!c.datatype && c.classValue" :href="asset(`/ontology/${entitySlug(c.classValue)}`)" class="text-blue-600 hover:underline">{{ c.classValue }}</a>
                  <span v-if="c.hasValue" class="text-slate-400 ml-1">= {{ c.hasValue }}</span>
                </td>
                <td class="px-3 py-2">{{ c.nodeKind || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- INDIVIDUALS                                                           -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'individuals'" data-section="individuals" class="mt-8 space-y-4">
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-dark-800/80 border-b border-slate-200/60 dark:border-dark-600/60">
              <th class="text-left px-4 py-2 font-semibold text-slate-500 text-xs">Individual</th>
              <th class="text-left px-4 py-2 font-semibold text-slate-500 text-xs">Instance Of</th>
              <th class="text-center px-4 py-2 font-semibold text-slate-500 text-xs">Ontology</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ind in filteredIndividuals"
              :key="ind.qname"
              class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50"
            >
              <td class="px-4 py-2">
                <a :href="asset(`/ontology/${ind.slug}`)" class="text-brand-600 hover:underline font-medium">{{ ind.label }}</a>
                <code class="ml-1 text-[9px] text-slate-400">{{ ind.qname }}</code>
              </td>
              <td class="px-4 py-2">
                <template v-if="ind.instanceOf?.length">
                  <template v-for="(t, i) in ind.instanceOf" :key="i">
                    <a :href="asset(`/ontology/${entitySlug(t)}`)" class="text-blue-600 hover:underline">{{ t }}</a>
                    <span v-if="i < ind.instanceOf.length - 1">, </span>
                  </template>
                </template>
              </td>
              <td class="px-4 py-2 text-center">
                <span :class="['text-[9px] font-semibold px-1.5 py-0.5 rounded', badgeColor(ind)]">{{ ind.ontology }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- STATISTICS                                                            -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-show="activeTab === 'statistics'" data-section="statistics" class="mt-8 space-y-6">
      <OntologyCharts
        v-if="showCharts"
        :type-labels="chartTypeLabels"
        :type-counts="chartTypeCounts"
        :type-colors="chartTypeColors"
        :onto-labels="ontoDisplayLabels"
        :onto-counts="ontoCounts"
        :onto-colors="ontoColors"
      />

      <!-- Entity type legend grid -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Type Breakdown</h3>
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <div
            v-for="(meta, type) in typeMeta"
            :key="type"
            class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60"
          >
            <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', meta.colorDot]"></span>
            <span class="text-xs text-slate-700 dark:text-slate-300">{{ meta.label }}</span>
            <span class="ml-auto text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ allEntities.filter(e => e.type === type).length }}</span>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Summary</h3>
          <div class="space-y-3">
            <div
              v-for="onto in ontologyNamespaces"
              :key="onto.prefix"
              :class="['px-4 py-3 rounded-xl border', onto.color === 'emerald' ? 'bg-emerald-50/50 border-emerald-200/40' : 'bg-brand-50/50 border-brand-200/40']"
            >
              <div :class="['text-2xl font-bold', onto.color === 'emerald' ? 'text-emerald-700' : 'text-brand-700']">{{ allEntities.filter(e => e.ontology === onto.prefix).length }}</div>
              <div :class="['text-[10px] font-semibold uppercase tracking-wider mt-1', onto.color === 'emerald' ? 'text-emerald-600' : 'text-brand-600']">{{ onto.title }}</div>
            </div>
            <div class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60">
              <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ allEntities.length }}</div>
              <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Entities</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Namespaces used -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Namespaces Used ({{ ontologyPrefixes.length }})</h3>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          <div
            v-for="ns in ontologyPrefixes"
            :key="ns.prefix"
            class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60"
          >
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-600 text-slate-700 dark:text-slate-300 font-mono">{{ ns.prefix || ':' }}</span>
            <span class="text-xs text-slate-500 font-mono truncate">{{ ns.uri }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
