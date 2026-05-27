<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ontologyEntities, ontologyPrefixes, ontologyTypeMeta, ontologyNamespaces, ontologyImportChain } from '../data/generated/ontology'
import { useTheme } from '../composables/useTheme'
import ClassTreeNode from '../components/ClassTreeNode.vue'

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

const allEntities = ontologyEntities as readonly Entity[]
const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>
const { isDark } = useTheme()

// ─── Ontology structure (data-driven) ────────────────────────────────────────

const primaryQname = Object.keys(ontologyImportChain)[0]
const primaryOntology = ontologyNamespaces.find(n => n.prefix === primaryQname?.split(':')[0])!
const importedQnames: readonly string[] = ontologyImportChain[primaryQname as keyof typeof ontologyImportChain]?.imports ?? []
const importedOntologies = importedQnames.map(iq => ontologyNamespaces.find(n => n.prefix === iq.split(':')[0])!)

// Namespace grouping: group all entities by their prefix
const namespaceGroups = computed(() => {
  const groups = new Map<string, { prefix: string; uri: string; entities: Entity[] }>()
  for (const ns of ontologyPrefixes) {
    const pfx = ns.prefix
    const entities = allEntities.filter(e => e.qname.startsWith(pfx + ':'))
    if (entities.length > 0) {
      groups.set(pfx, { prefix: pfx, uri: ns.uri, entities })
    }
  }
  return [...groups.values()].sort((a, b) => b.entities.length - a.entities.length)
})

// ─── Sections & state ─────────────────────────────────────────────────────────

type Section = 'overview' | 'namespaces' | 'az' | 'classes' | 'properties' | 'skos' | 'shapes' | 'individuals' | 'statistics'
const section = ref<Section>('overview')
const filter = ref('')
const filterOntology = ref<'all' | 'smart' | 'isq'>('isq')

const sections: { id: Section; label: string }[] = [
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

// ─── Computed entity lists ─────────────────────────────────────────────────────

function byOntology(entities: Entity[]) {
  if (filterOntology.value === 'all') return entities
  return entities.filter(e => e.ontology === filterOntology.value)
}

function matchesFilter(e: Entity) {
  if (!filter.value) return true
  const q = filter.value.toLowerCase()
  return e.label.toLowerCase().includes(q) || e.qname.toLowerCase().includes(q)
}

const classes = computed(() => byOntology(allEntities.filter(e => e.type === 'class')).filter(matchesFilter))
const allClasses = allEntities.filter(e => e.type === 'class' && e.ontology !== 'external')
const objProps = computed(() => byOntology(allEntities.filter(e => e.type === 'objectProperty')).filter(matchesFilter))
const dtProps = computed(() => byOntology(allEntities.filter(e => e.type === 'datatypeProperty')).filter(matchesFilter))
const annProps = computed(() => allEntities.filter(e => e.type === 'annotationProperty'))
const shapes = computed(() => byOntology(allEntities.filter(e => e.type === 'shape')).filter(matchesFilter))
const concepts = computed(() => byOntology(allEntities.filter(e => e.type === 'concept')).filter(matchesFilter))
const conceptSchemes = computed(() => allEntities.filter(e => e.type === 'conceptScheme'))
const individuals = computed(() => byOntology(allEntities.filter(e => e.type === 'individual')).filter(matchesFilter))
const ontologies = computed(() => allEntities.filter(e => e.type === 'ontology'))

const allProps = computed(() => [...objProps.value, ...dtProps.value])

// ─── Counts ────────────────────────────────────────────────────────────────────

function countBy(type: string, ontology: string) {
  return allEntities.filter(e => e.type === type && (ontology === 'all' || e.ontology === ontology)).length
}

// ─── Class hierarchy (recursive) ───────────────────────────────────────────────

const expandedNodes = ref(new Set<string>())

function toggleNode(qname: string) {
  const s = new Set(expandedNodes.value)
  if (s.has(qname)) s.delete(qname)
  else s.add(qname)
  expandedNodes.value = s
}

function isExpanded(qname: string) {
  return expandedNodes.value.has(qname)
}

const rootClasses = computed(() => allClasses.filter(c => !c.parent))
function childrenOf(parentQname: string) {
  return allClasses.filter(c => c.parent === parentQname)
}
function hasChildren(qname: string) {
  return allClasses.some(c => c.parent === qname)
}

function expandAll() {
  const s = new Set<string>()
  for (const c of allClasses) {
    if (hasChildren(c.qname)) s.add(c.qname)
  }
  expandedNodes.value = s
}

function collapseAll() {
  expandedNodes.value = new Set()
}

// ─── Ontology badge ────────────────────────────────────────────────────────────

function badgeColor(e: Entity) {
  if (e.ontology === 'smart') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
  if (e.ontology === 'isq') return 'bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400'
  return 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400'
}

// ─── Charts ────────────────────────────────────────────────────────────────

const typeChartRef = ref<HTMLCanvasElement | null>(null)
const ontoChartRef = ref<HTMLCanvasElement | null>(null)
let typeChart: InstanceType<typeof import('chart.js').Chart> | null = null
let ontoChart: InstanceType<typeof import('chart.js').Chart> | null = null

const chartColorMap: Record<string, string> = {
  class: '#3b82f6',
  objectProperty: '#22c55e',
  datatypeProperty: '#84cc16',
  annotationProperty: '#f59e0b',
  shape: '#a855f7',
  concept: '#14b8a6',
  conceptScheme: '#06b6d4',
  individual: '#f97316',
  ontology: '#6366f1',
  external: '#94a3b8',
}

async function renderCharts() {
  if (!typeChartRef.value || !ontoChartRef.value) return

  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  typeChart?.destroy()
  ontoChart?.destroy()

  const types = Object.keys(ontologyTypeMeta).filter(t => allEntities.some(e => e.type === t))
  const typeCounts = types.map(t => allEntities.filter(e => e.type === t).length)
  const typeLabels = types.map(t => ontologyTypeMeta[t as keyof typeof ontologyTypeMeta]?.label || t)
  const typeColors = types.map(t => chartColorMap[t] || '#94a3b8')

  typeChart = new Chart(typeChartRef.value, {
    type: 'bar',
    data: {
      labels: typeLabels,
      datasets: [{
        data: typeCounts,
        backgroundColor: typeColors.map(c => c + (isDark.value ? '66' : '33')),
        borderColor: typeColors.map(c => isDark.value ? c + 'cc' : c),
        borderWidth: 1.5,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 5, color: isDark.value ? '#a89ea6' : '#64748b' } },
        x: { ticks: { font: { size: 10 }, color: isDark.value ? '#a89ea6' : '#64748b' } },
      },
    },
  })

  const ontoLabels = ['isq', 'smart', 'external'].filter(o =>
    allEntities.some(e => e.ontology === o)
  )
  const ontoCounts = ontoLabels.map(o => allEntities.filter(e => e.ontology === o).length)
  const ontoColors = ontoLabels.map(o =>
    o === 'isq' ? '#3b82f6' : o === 'smart' ? '#10b981' : '#94a3b8'
  )

  ontoChart = new Chart(ontoChartRef.value, {
    type: 'doughnut',
    data: {
      labels: ontoLabels.map(o =>
        o === 'isq' ? 'ISO & IEC 80000' : o === 'smart' ? 'SMART Core' : 'External'
      ),
      datasets: [{
        data: ontoCounts,
        backgroundColor: ontoColors.map(c => c + (isDark.value ? 'bb' : '99')),
        borderColor: isDark.value ? '#1e0f18' : '#fff',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 16, color: isDark.value ? '#a89ea6' : '#374151' } },
      },
    },
  })
}

watch(section, async (s) => {
  if (s === 'statistics') {
    await nextTick()
    renderCharts()
  }
})

onMounted(() => {
  if (section.value === 'statistics') renderCharts()
})
</script>

<template>
  <div>
  <!-- Hero -->
  <section class="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950">
    <div class="absolute inset-0 hero-pattern" />
    <div class="grain-overlay absolute inset-0" />
    <div class="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 bg-emerald-500/10" />
    <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-emerald-400/20" />
    <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
    <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />
    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div class="max-w-3xl page-enter">
        <div class="flex items-center gap-2 text-xs text-emerald-300/60 mb-5">
          <router-link to="/" class="hover:text-emerald-200 transition-colors">Home</router-link>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </div>
        <div class="flex items-end gap-5 flex-wrap">
          <div>
            <div class="text-3xl mb-2">🧬</div>
            <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">ISO &amp; IEC 80000 Ontology</h1>
            <p class="mt-2 text-sm leading-relaxed max-w-xl text-emerald-300/80">
              The isq domain ontology extends the SMART Core Ontology with classes for quantities, units, and mathematical concepts per ISO &amp; IEC 80000.
            </p>
          </div>
          <div class="flex gap-2 ml-auto flex-shrink-0 mb-1">
            <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
              <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ allEntities.length }}</span>
              <span class="text-xs ml-1 text-emerald-300/70">entities</span>
            </div>
            <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
              <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ allClasses.length }}</span>
              <span class="text-xs ml-1 text-emerald-300/70">classes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
  </section>

  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

    <!-- Section navigation tabs -->
    <div class="mt-6 flex flex-wrap gap-3 items-center">
      <div class="flex gap-0.5 p-1 rounded-xl bg-slate-100/80 dark:bg-dark-700/80 border border-slate-200/60">
        <button v-for="s in sections" :key="s.id" @click="section = s.id"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="section === s.id ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
          {{ s.label }}
        </button>
      </div>
      <div class="flex gap-1 p-1 rounded-lg bg-slate-100/80 dark:bg-dark-700/80 border border-slate-200/60" v-if="['classes', 'properties', 'skos', 'shapes', 'individuals'].includes(section)">
        <button @click="filterOntology = 'isq'"
          class="px-3 py-1.5 rounded-md text-[10px] font-medium transition-all"
          :class="filterOntology === 'isq' ? 'bg-white dark:bg-dark-800 text-brand-700 dark:text-brand-400 shadow-sm dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
          ISO &amp; IEC 80000
        </button>
        <button @click="filterOntology = 'smart'"
          class="px-3 py-1.5 rounded-md text-[10px] font-medium transition-all"
          :class="filterOntology === 'smart' ? 'bg-white dark:bg-dark-800 text-emerald-700 dark:text-emerald-400 shadow-sm dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
          SMART Core
        </button>
        <button @click="filterOntology = 'all'"
          class="px-3 py-1.5 rounded-md text-[10px] font-medium transition-all"
          :class="filterOntology === 'all' ? 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-100 shadow-sm dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
          All
        </button>
      </div>
      <div class="relative max-w-xs flex-1" v-if="['classes', 'properties', 'az', 'shapes', 'individuals', 'skos'].includes(section)">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="filter" type="text" placeholder="Filter entities..." class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- OVERVIEW                                                              -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'overview'" class="mt-8 space-y-6">
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
            <div v-if="importedOntologies.length">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Imports</span>
              <div class="flex gap-1.5 mt-0.5">
                <router-link v-for="imp in importedOntologies" :key="imp.prefix"
                  :to="`/ontology/${allEntities.find(e => e.type === 'ontology' && e.ontology === imp.prefix)?.slug}`"
                  class="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono hover:bg-emerald-100 hover:text-emerald-800 transition-colors">
                  {{ imp.prefix }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div v-if="importedOntologies.length" class="mt-4 pt-4 border-t border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Imported Ontolog{{ importedOntologies.length > 1 ? 'ies' : 'y' }}</span>
          </div>
          <div class="space-y-2">
            <router-link v-for="imp in importedOntologies" :key="imp.prefix"
              :to="`/ontology/${allEntities.find(e => e.type === 'ontology' && e.ontology === imp.prefix)?.slug}`"
              class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 hover:bg-slate-100/80 dark:hover:bg-dark-600 transition-colors">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">{{ imp.prefix }}</span>
              <div>
                <span class="text-sm text-slate-700 dark:text-slate-200">{{ imp.title }}</span>
                <span class="text-xs text-slate-400 ml-2">v{{ imp.version }}</span>
              </div>
              <span class="text-xs text-slate-400 ml-auto truncate max-w-xs">{{ imp.description }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="(t, idx) in ['class', 'objectProperty', 'shape', 'concept']" :key="t" class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 text-center">
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ countBy(t, 'all') }}</div>
            <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{{ typeMeta[t]?.label || t }}</div>
          </div>
        </div>
        <div class="mt-4 grid sm:grid-cols-2 gap-4">
          <div class="px-4 py-3 rounded-xl bg-brand-50/50 border border-brand-200/40">
            <div class="text-xs font-semibold text-brand-700 mb-2">ISO &amp; IEC 80000</div>
            <div class="flex gap-3 text-xs text-slate-600">
              <span>{{ countBy('class', 'isq') }} classes</span>
              <span class="text-slate-300">·</span>
              <span>{{ countBy('objectProperty', 'isq') }} properties</span>
              <span class="text-slate-300">·</span>
              <span>{{ countBy('shape', 'isq') }} shapes</span>
            </div>
          </div>
          <div class="px-4 py-3 rounded-xl bg-emerald-50/50 border border-emerald-200/40">
            <div class="text-xs font-semibold text-emerald-700 mb-2">SMART Core</div>
            <div class="flex gap-3 text-xs text-slate-600">
              <span>{{ countBy('class', 'smart') }} classes</span>
              <span class="text-slate-300">·</span>
              <span>{{ countBy('objectProperty', 'smart') + countBy('datatypeProperty', 'smart') }} properties</span>
              <span class="text-slate-300">·</span>
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
          <!-- Imported ontologies -->
          <router-link v-for="imp in importedOntologies" :key="imp.prefix"
            :to="`/ontology/${allEntities.find(e => e.type === 'ontology' && e.ontology === imp.prefix)?.slug}`"
            class="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-emerald-50/40 border border-emerald-200/40 hover:bg-emerald-50/70 transition-colors">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 flex-shrink-0 mt-0.5">{{ imp.prefix }}</span>
            <div class="min-w-0">
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ imp.title }}</div>
              <code class="text-[10px] text-slate-500 font-mono break-all">{{ imp.uri }}</code>
              <p class="text-xs text-slate-500 mt-1">{{ imp.description }}</p>
            </div>
          </router-link>
          <!-- External namespace groups (non-ontology, non-primary namespaces) -->
          <div v-for="ns in namespaceGroups.filter(g => !ontologyNamespaces.find(n => n.prefix === g.prefix))" :key="ns.prefix"
            class="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5 font-mono">{{ ns.prefix }}</span>
            <div class="min-w-0">
              <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ ns.prefix }} ({{ ns.entities.length }} entities)</div>
              <code class="text-[10px] text-slate-500 font-mono break-all">{{ ns.uri }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Class hierarchy tree (recursive expandable) -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Class Hierarchy Tree</h3>
          <div class="flex gap-2">
            <button @click="expandAll" class="text-[10px] text-slate-500 hover:text-slate-700 font-medium">Expand all</button>
            <button @click="collapseAll" class="text-[10px] text-slate-500 hover:text-slate-700 font-medium">Collapse all</button>
          </div>
        </div>
        <div class="font-mono text-xs space-y-0.5">
          <template v-for="root in rootClasses" :key="root.qname">
            <ClassTreeNode
              :entity="root" :depth="0"
              :all-classes="allClasses"
              :expanded-nodes="expandedNodes"
              @toggle="toggleNode" />
          </template>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- NAMESPACES                                                            -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'namespaces'" class="mt-8 space-y-4">
      <div v-for="ns in namespaceGroups" :key="ns.prefix" class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300 font-mono">{{ ns.prefix }}</span>
          <code class="text-xs text-slate-500 font-mono break-all">{{ ns.uri }}</code>
          <span class="ml-auto text-xs text-slate-400">{{ ns.entities.length }} entities</span>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <router-link v-for="e in ns.entities" :key="e.qname" :to="`/ontology/${e.slug}`"
            class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors inline-flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full" :class="typeMeta[e.type]?.colorDot || 'bg-slate-300'"></span>
            {{ e.label }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- ENTITIES A-Z                                                          -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'az'" class="mt-8 space-y-6">
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">All Entities ({{ allEntities.length }})</h3>
        <div class="flex flex-wrap gap-1.5">
          <router-link v-for="e in [...allEntities].sort((a, b) => a.label.localeCompare(b.label))"
            :key="e.qname"
            :to="`/ontology/${e.slug}`"
            class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-brand-200 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="typeMeta[e.type]?.colorDot || 'bg-slate-300'"></span>
            {{ e.label }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- CLASSES                                                               -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'classes'" class="mt-8 space-y-4">
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
            <tr v-for="c in classes" :key="c.qname" class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
              <td class="px-4 py-2">
                <router-link :to="`/ontology/${c.slug}`" class="text-brand-600 hover:underline font-medium">{{ c.qname }}</router-link>
              </td>
              <td class="px-4 py-2 text-slate-600 max-w-md truncate">{{ c.description || '—' }}</td>
              <td class="px-4 py-2">
                <router-link v-if="c.parent" :to="`/ontology/${allEntities.find(e => e.qname === c.parent)?.slug}`" class="text-blue-600 hover:underline text-xs">{{ c.parent }}</router-link>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-4 py-2 text-center">
                <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded" :class="badgeColor(c)">{{ c.ontology }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- PROPERTIES                                                            -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'properties'" class="mt-8 space-y-4">
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
              <tr v-for="p in objProps" :key="p.qname" class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                <td class="px-3 py-2"><router-link :to="`/ontology/${p.slug}`" class="text-green-700 hover:underline font-medium">{{ p.qname }}</router-link></td>
                <td class="px-3 py-2 text-slate-600 max-w-xs truncate">{{ p.description || '—' }}</td>
                <td class="px-3 py-2">
                  <template v-for="(d, i) in p.domain" :key="d">
                    <router-link :to="`/ontology/${allEntities.find(e => e.qname === d)?.slug}`" class="text-blue-600 hover:underline">{{ d }}</router-link>
                    <span v-if="i < p.domain!.length - 1">, </span>
                  </template>
                  <span v-if="!p.domain?.length" class="text-slate-400">—</span>
                </td>
                <td class="px-3 py-2">
                  <template v-for="(r, i) in p.range" :key="r">
                    <router-link :to="`/ontology/${allEntities.find(e => e.qname === r)?.slug}`" class="text-blue-600 hover:underline">{{ r }}</router-link>
                    <span v-if="i < p.range!.length - 1">, </span>
                  </template>
                  <span v-if="!p.range?.length" class="text-slate-400">—</span>
                </td>
                <td class="px-3 py-2 text-center"><span class="text-[9px] font-semibold px-1.5 py-0.5 rounded" :class="badgeColor(p)">{{ p.ontology }}</span></td>
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
              <tr v-for="p in dtProps" :key="p.qname" class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                <td class="px-3 py-2"><router-link :to="`/ontology/${p.slug}`" class="text-lime-700 hover:underline font-medium">{{ p.qname }}</router-link></td>
                <td class="px-3 py-2 text-slate-600 max-w-xs truncate">{{ p.description || '—' }}</td>
                <td class="px-3 py-2">
                  <template v-for="(d, i) in p.domain" :key="d">
                    <router-link :to="`/ontology/${allEntities.find(e => e.qname === d)?.slug}`" class="text-blue-600 hover:underline">{{ d }}</router-link>
                    <span v-if="i < p.domain!.length - 1">, </span>
                  </template>
                  <span v-if="!p.domain?.length" class="text-slate-400">—</span>
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
          <router-link v-for="p in annProps" :key="p.qname" :to="`/ontology/${p.slug}`"
            class="text-[10px] font-medium px-2 py-1 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-700/50 text-slate-600 dark:text-slate-400 hover:border-amber-200 hover:text-amber-600 transition-colors">
            {{ p.qname }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- SKOS                                                                  -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'skos'" class="mt-8 space-y-6">
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
              <tr v-for="c in allEntities.filter(e => e.type === 'concept' && e.scheme === scheme.qname)" :key="c.qname" class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
                <td class="px-3 py-2">
                  <router-link :to="`/ontology/${c.slug}`" class="text-teal-700 hover:underline font-medium">{{ c.label }}</router-link>
                  <code class="ml-1 text-[9px] text-slate-400">{{ c.qname }}</code>
                </td>
                <td class="px-3 py-2 text-slate-600 max-w-sm">{{ c.description || '—' }}</td>
                <td class="px-3 py-2">
                  <template v-for="(t, i) in c.instanceOf" :key="t">
                    <router-link :to="`/ontology/${allEntities.find(e => e.qname === t)?.slug}`" class="text-blue-600 hover:underline">{{ t }}</router-link>
                    <span v-if="i < c.instanceOf!.length - 1">, </span>
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
    <div v-if="section === 'shapes'" class="mt-8 space-y-4">
      <div v-for="s in shapes" :key="s.qname" class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">Shape</span>
          <router-link :to="`/ontology/${s.slug}`" class="text-sm font-bold text-brand-600 hover:underline">{{ s.qname }}</router-link>
          <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded" :class="badgeColor(s)">{{ s.ontology }}</span>
        </div>
        <div class="text-xs text-slate-500 mb-3">
          <span v-if="s.targetClass">Target: <router-link :to="`/ontology/${allEntities.find(e => e.qname === s.targetClass)?.slug}`" class="text-blue-600 hover:underline">{{ s.targetClass }}</router-link></span>
          <span v-if="s.targetSubjectsOf">Subjects of: <router-link :to="`/ontology/${allEntities.find(e => e.qname === s.targetSubjectsOf)?.slug}`" class="text-blue-600 hover:underline">{{ s.targetSubjectsOf }}</router-link></span>
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
                  <router-link v-if="allEntities.find(e => e.qname === c.path)" :to="`/ontology/${allEntities.find(e => e.qname === c.path)!.slug}`" class="text-blue-600 hover:underline">{{ c.path }}</router-link>
                  <span v-else class="font-mono">{{ c.path }}</span>
                </td>
                <td class="px-3 py-2 text-center">{{ c.minCount ?? '—' }}</td>
                <td class="px-3 py-2 text-center">{{ c.maxCount ?? '—' }}</td>
                <td class="px-3 py-2">
                  <span v-if="c.datatype" class="italic">{{ c.datatype }}</span>
                  <router-link v-else-if="c.classValue" :to="`/ontology/${allEntities.find(e => e.qname === c.classValue)?.slug}`" class="text-blue-600 hover:underline">{{ c.classValue }}</router-link>
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
    <div v-if="section === 'individuals'" class="mt-8 space-y-4">
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
            <tr v-for="ind in individuals" :key="ind.qname" class="border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-dark-700/50">
              <td class="px-4 py-2">
                <router-link :to="`/ontology/${ind.slug}`" class="text-brand-600 hover:underline font-medium">{{ ind.label }}</router-link>
                <code class="ml-1 text-[9px] text-slate-400">{{ ind.qname }}</code>
              </td>
              <td class="px-4 py-2">
                <template v-for="(t, i) in ind.instanceOf" :key="t">
                  <router-link :to="`/ontology/${allEntities.find(e => e.qname === t)?.slug}`" class="text-blue-600 hover:underline">{{ t }}</router-link>
                  <span v-if="i < ind.instanceOf!.length - 1">, </span>
                </template>
              </td>
              <td class="px-4 py-2 text-center">
                <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded" :class="badgeColor(ind)">{{ ind.ontology }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- STATISTICS                                                            -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <div v-if="section === 'statistics'" class="mt-8 space-y-6">
      <!-- Entity type bar chart -->
      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Entity Distribution</h3>
        <div class="h-64">
          <canvas ref="typeChartRef"></canvas>
        </div>
        <div class="mt-4 grid sm:grid-cols-2 gap-3">
          <div v-for="(meta, type) in typeMeta" :key="type" class="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :class="meta.colorDot"></span>
            <span class="text-xs text-slate-700 dark:text-slate-300">{{ meta.label }}</span>
            <span class="ml-auto text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ allEntities.filter(e => e.type === type).length }}</span>
          </div>
        </div>
      </div>

      <!-- Ontology breakdown doughnut -->
      <div class="grid sm:grid-cols-2 gap-6">
        <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Ontology Breakdown</h3>
          <div class="h-56">
            <canvas ref="ontoChartRef"></canvas>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Summary</h3>
          <div class="space-y-3">
            <div v-for="onto in ontologyNamespaces" :key="onto.prefix"
              class="px-4 py-3 rounded-xl border"
              :class="onto.color === 'emerald' ? 'bg-emerald-50/50 border-emerald-200/40' : 'bg-brand-50/50 border-brand-200/40'">
              <div class="text-2xl font-bold" :class="onto.color === 'emerald' ? 'text-emerald-700' : 'text-brand-700'">{{ allEntities.filter(e => e.ontology === onto.prefix).length }}</div>
              <div class="text-[10px] font-semibold uppercase tracking-wider mt-1" :class="onto.color === 'emerald' ? 'text-emerald-600' : 'text-brand-600'">{{ onto.title }}</div>
            </div>
            <div class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60">
              <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ allEntities.length }}</div>
              <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Total Entities</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Namespaces Used ({{ ontologyPrefixes.length }})</h3>
        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          <div v-for="ns in ontologyPrefixes" :key="ns.prefix" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60">
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-600 text-slate-700 dark:text-slate-300 font-mono">{{ ns.prefix || ':' }}</span>
            <span class="text-xs text-slate-500 font-mono truncate">{{ ns.uri }}</span>
          </div>
        </div>
      </div>
    </div>

  </section>
  </div>
</template>
