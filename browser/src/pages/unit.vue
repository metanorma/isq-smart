<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { units } from '../data/generated/unitsdb'
import { getPartMeta, partUrl, entryUrl } from '../data/PartRegistry'
import { symbolCache } from '../data/generated/domain-index'
import MathRenderer from '../components/MathRenderer.vue'
import UnitOntologyPanel from '../components/UnitOntologyPanel.vue'

const route = useRoute()
const slugParam = computed(() => route.params.slug as string)

interface EnrichedUnit {
  slug: string; name: string; symbols: string[]; quantityCount: number; parts: string[]
  sampleQuantities: { id: string; num: string; name: string; part: string }[]
  quantities: { id: string; num: string; name: string; part: string }[]
  nistId?: string; unitsmlId?: string
  refs?: { authority: string; uri: string; type: string }[]
  unitSystems?: string[]; scaleRef?: string; root?: boolean
  dimensionRef?: string; dimensionSlug?: string; quantityRefs?: string[]
}

const unit = computed(() => units.find(u => u.slug === slugParam.value) as EnrichedUnit | undefined)

const filter = ref('')

const filteredQuantities = computed(() => {
  if (!unit.value) return []
  if (!filter.value.trim()) return unit.value.quantities
  const q = filter.value.toLowerCase()
  return unit.value.quantities.filter(eq =>
    eq.name.toLowerCase().includes(q) || eq.num.includes(q)
  )
})

interface PartGroup {
  partKey: string
  meta: ReturnType<typeof getPartMeta>
  quantities: typeof units[0]['quantities']
}

const partGroups = computed<PartGroup[]>(() => {
  if (!unit.value) return []
  const map = new Map<string, typeof unit.value.quantities>()
  for (const eq of filteredQuantities.value) {
    if (!map.has(eq.part)) map.set(eq.part, [])
    map.get(eq.part)!.push(eq)
  }
  return Array.from(map.entries()).map(([pk, qs]) => ({
    partKey: pk,
    meta: getPartMeta(pk),
    quantities: qs,
  })).sort((a, b) => {
    const pa = a.partKey.includes('-') ? a.partKey.split('-').map(Number) : [Number(a.partKey), 0]
    const pb = b.partKey.includes('-') ? b.partKey.split('-').map(Number) : [Number(b.partKey), 0]
    return pa[0] !== pb[0] ? pa[0] - pb[0] : pa[1] - pb[1]
  })
})
</script>

<template>
  <div>
  <div v-if="unit">
    <section class="relative overflow-hidden border-b border-slate-200/60 dark:border-dark-600/60 bg-gradient-to-b from-slate-50/80 dark:from-dark-900/80 to-white dark:to-dark-950">
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/[0.04] dark:bg-teal-500/[0.02] rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 page-enter">
        <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-6">
          <router-link to="/" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</router-link>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          <router-link to="/units" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Units</router-link>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          <span class="text-slate-600 dark:text-slate-400 font-medium">{{ unit.name }}</span>
        </div>

        <div class="flex items-center gap-4">
          <span class="font-mono text-2xl font-semibold text-teal-700 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/40 px-4 py-2 rounded-xl inline-flex items-center justify-center"><MathRenderer v-if="symbolCache[unit.symbols[0]]" :expression="unit.symbols[0]" :cache="symbolCache" /><template v-else>{{ unit.symbols[0] || '—' }}</template></span>
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif">{{ unit.name }}</h1>
            <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>{{ unit.quantityCount }} quantities</span>
              <span class="text-slate-300 dark:text-slate-600">&middot;</span>
              <span>Parts {{ unit.parts.join(', ') }}</span>
              <template v-if="unit.symbols.length > 1">
                <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                <span class="inline-flex items-center gap-1">Also: <template v-for="(s, si) in unit.symbols.slice(1)" :key="si"><MathRenderer v-if="symbolCache[s]" :expression="s" :cache="symbolCache" /><template v-else>{{ s }}</template><span v-if="si < unit.symbols.length - 2" class="text-slate-300">, </span></template></span>
              </template>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[200px] max-w-sm">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="filter" type="text" placeholder="Filter quantities..." class="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm" />
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Ontology panel -->
      <UnitOntologyPanel :unit="unit" />

      <div v-if="filteredQuantities.length === 0" class="py-16 text-center">
        <p class="text-slate-500 dark:text-slate-400 text-sm">No quantities match your filter</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="group in partGroups" :key="group.partKey">
          <div class="flex items-center gap-3 mb-3">
            <router-link :to="partUrl(group.partKey)" class="flex items-center gap-2 group">
              <span class="text-base">{{ group.meta?.icon ?? '📐' }}</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors heading-serif">Part {{ group.partKey }}: {{ group.meta?.title }}</h3>
            </router-link>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{{ group.quantities.length }} quantities</span>
            <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
          </div>

          <div class="grid gap-px">
            <router-link
              v-for="eq in group.quantities"
              :key="eq.id"
              :to="entryUrl(eq.part, eq.id)"
              class="group flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3 bg-white dark:bg-dark-900 hover:bg-slate-50/50 dark:hover:bg-dark-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <span class="font-mono text-[11px] font-semibold text-brand-700 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 px-2 py-0.5 rounded flex-shrink-0">{{ eq.num }}</span>
              <span class="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">{{ eq.name }}</span>
              <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        {{ filteredQuantities.length }} of {{ unit.quantities.length }} quantities
      </div>
    </section>
  </div>

  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Unit Not Found</h1>
    <router-link to="/units" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
      Back to Units
    </router-link>
  </div>
  </div>
</template>
