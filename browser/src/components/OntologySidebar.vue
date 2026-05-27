<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ontologyEntities, ontologyTypeMeta, ontologyImportChain, ontologyNamespaces } from '../data/generated/ontology'
import { useOntologySidebar } from '../composables/useOntologySidebar'

interface Entity {
  qname: string
  slug: string
  label: string
  type: string
  ontology: string
  parent?: string
}

const route = useRoute()
const allEntities = ontologyEntities as readonly Entity[]
const typeMeta = ontologyTypeMeta as Record<string, { label: string; color: string; colorDot: string }>

const search = ref('')

const typeOrder = [
  { type: 'class', key: 'classes' },
  { type: 'objectProperty', key: 'objProps' },
  { type: 'datatypeProperty', key: 'dtProps' },
  { type: 'annotationProperty', key: 'annProps' },
  { type: 'concept', key: 'concepts' },
  { type: 'conceptScheme', key: 'schemes' },
  { type: 'shape', key: 'shapes' },
  { type: 'individual', key: 'individuals' },
]

const { collapsed, initCollapsed } = useOntologySidebar()

// Build ontology groups: primary first, then imports, then any others
const ontologyOrder = computed(() => {
  const primaryQname = Object.keys(ontologyImportChain)[0]
  const primaryPrefix = primaryQname?.split(':')[0]
  const importPrefixes = (ontologyImportChain[primaryQname as keyof typeof ontologyImportChain]?.imports ?? [])
    .map((iq: string) => iq.split(':')[0])

  const order = [primaryPrefix, ...importPrefixes]
  for (const e of allEntities) {
    if (e.type === 'ontology' && !order.includes(e.ontology)) {
      order.push(e.ontology)
    }
  }
  return order.filter(Boolean)
})

function allKeys(): string[] {
  const keys: string[] = []
  for (const prefix of ontologyOrder.value) {
    keys.push('ont-' + prefix)
    for (const to of typeOrder) {
      const count = allEntities.filter(e => e.type === to.type && e.ontology === prefix).length
      if (count > 0) keys.push(prefix + '-' + to.key)
    }
  }
  return keys
}

// Initialize collapsed state on first mount
initCollapsed(allKeys())

const expanded = ref(false)

function expandAll() {
  collapsed.value = new Set()
  expanded.value = true
}

function collapseAll() {
  collapsed.value = new Set(allKeys())
  expanded.value = false
}

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase()

  return ontologyOrder.value
    .map(prefix => {
      const ontEntity = allEntities.find(e => e.type === 'ontology' && e.ontology === prefix)
      const label = ontologyNamespaces.find(n => n.prefix === prefix)?.title || prefix

      const typeGroups = typeOrder
        .map(to => {
          let entities = allEntities.filter(e => e.type === to.type && e.ontology === prefix)
          if (q) {
            entities = entities.filter(e =>
              e.label.toLowerCase().includes(q) || e.qname.toLowerCase().includes(q)
            )
          }
          return { ...to, label: typeMeta[to.type]?.label || to.type, entities }
        })
        .filter(tg => tg.entities.length > 0)

      return { prefix, label, ontEntity, typeGroups }
    })
    .filter(g => g.typeGroups.length > 0 || g.ontEntity)
})

const searchResults = computed(() => {
  if (!search.value) return null
  const q = search.value.toLowerCase()
  return allEntities.filter(e =>
    e.ontology !== 'external' &&
    (e.label.toLowerCase().includes(q) || e.qname.toLowerCase().includes(q))
  )
})

function toggleGroup(key: string) {
  const s = new Set(collapsed.value)
  if (s.has(key)) s.delete(key)
  else s.add(key)
  collapsed.value = s
}

function isCollapsed(key: string) {
  return collapsed.value.has(key)
}

const activeSlug = computed(() => {
  const slug = route.params.slug as string | undefined
  return slug || ''
})

watch(activeSlug, (slug) => {
  if (!slug) return
  const entity = allEntities.find(e => e.slug === slug)
  if (!entity) return
  const s = new Set(collapsed.value)
  s.delete('ont-' + entity.ontology)
  const typeEntry = typeOrder.find(to => to.type === entity.type)
  if (typeEntry) s.delete(entity.ontology + '-' + typeEntry.key)
  collapsed.value = s
})

function ontLabel(prefix: string) {
  if (prefix === 'isq') return 'ISO & IEC 80000'
  if (prefix === 'smart') return 'SMART Core'
  return prefix
}
</script>

<template>
  <aside class="w-64 flex-shrink-0 border-r border-slate-200/60 dark:border-dark-600/60 bg-white/50 dark:bg-dark-900/50 overflow-y-auto h-[calc(100vh-3.5rem)] sticky top-14">
    <div class="p-3 space-y-2">
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="search" type="text" placeholder="Search entities..."
          class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
      </div>
      <div v-if="!search" class="flex gap-1">
        <button @click="expandAll" class="flex-1 px-2 py-1 rounded text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors">Expand all</button>
        <button @click="collapseAll" class="flex-1 px-2 py-1 rounded text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors">Collapse all</button>
      </div>
    </div>

    <!-- Search results (flat list) -->
    <div v-if="searchResults" class="px-3 pb-3 space-y-0.5">
      <div class="px-2 py-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}
      </div>
      <router-link
        v-for="e in searchResults" :key="e.qname"
        :to="`/ontology/${e.slug}`"
        class="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors"
        :class="activeSlug === e.slug
          ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 hover:text-slate-800 dark:hover:text-slate-200'"
      >
        <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="typeMeta[e.type]?.colorDot || 'bg-slate-300'"></span>
        <span class="truncate">{{ e.type === 'ontology' ? e.qname.replace(':', '') : e.label }}</span>
        <span class="ml-auto text-[9px] text-slate-400 dark:text-slate-600 flex-shrink-0">{{ e.ontology }}</span>
      </router-link>
    </div>

    <!-- Hierarchical grouping by ontology -->
    <div v-else class="px-3 pb-3 space-y-1">
      <div v-for="group in filteredGroups" :key="group.prefix">
        <!-- Ontology header -->
        <button @click="toggleGroup('ont-' + group.prefix)"
          class="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors"
          :class="group.prefix === 'isq'
            ? 'text-brand-600 dark:text-brand-400 hover:bg-brand-50/80 dark:hover:bg-brand-950/30'
            : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30'">
          <span>{{ ontLabel(group.prefix) }}</span>
          <span class="text-[8px] opacity-60">{{ isCollapsed('ont-' + group.prefix) ? '▶' : '▼' }}</span>
        </button>

        <div v-if="!isCollapsed('ont-' + group.prefix)">
          <!-- Ontology entity link -->
          <router-link v-if="group.ontEntity"
            :to="`/ontology/${group.ontEntity.slug}`"
            class="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ml-1"
            :class="activeSlug === group.ontEntity.slug
              ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
              : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700 hover:text-slate-800 dark:hover:text-slate-300'"
          >
            <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="typeMeta.ontology?.colorDot || 'bg-slate-300'"></span>
            <span class="truncate italic">{{ group.ontEntity.qname.replace(':', '') }}</span>
          </router-link>

          <!-- Type subgroups -->
          <div v-for="tg in group.typeGroups" :key="tg.key" class="ml-1">
            <button @click="toggleGroup(group.prefix + '-' + tg.key)"
              class="w-full flex items-center justify-between px-2 py-1 rounded-md text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:bg-slate-100/80 dark:hover:bg-dark-700/80 transition-colors">
              <span>{{ tg.label }}</span>
              <span class="flex items-center gap-1.5">
                <span class="text-[9px] text-slate-300 dark:text-slate-600 tabular-nums">{{ tg.entities.length }}</span>
                <span class="text-[8px] text-slate-300 dark:text-slate-600">{{ isCollapsed(group.prefix + '-' + tg.key) ? '▶' : '▼' }}</span>
              </span>
            </button>
            <div v-if="!isCollapsed(group.prefix + '-' + tg.key)" class="space-y-0.5 mt-0.5">
              <router-link
                v-for="e in tg.entities" :key="e.qname"
                :to="`/ontology/${e.slug}`"
                class="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-colors ml-2"
                :class="activeSlug === e.slug
                  ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 hover:text-slate-800 dark:hover:text-slate-200'"
              >
                <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="typeMeta[e.type]?.colorDot || 'bg-slate-300'"></span>
                <span class="truncate">{{ e.label }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
