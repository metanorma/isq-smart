<script setup lang="ts">
import { computed, ref } from 'vue'
import MathRenderer from './MathRenderer.vue'
import { useLocalFilter } from '../composables/useLocalFilter'
import { sectionLabel } from '../data/partKey'
import type { PartMeta, DomainEntry } from '../data/types'

const props = defineProps<{
  domainKey: 'quantities' | 'math'
  parts: PartMeta[]
  index: DomainEntry[]
  symbolCache: Record<string, string>
}>()

const isMath = computed(() => props.domainKey === 'math')

const selectedPart = ref('')

const partFiltered = computed(() =>
  selectedPart.value
    ? props.index.filter(e => e.p === selectedPart.value)
    : props.index,
)

const { searchQuery, filtered, visibleItems: visibleEntries, hasMore, showMore, clear, hl } = useLocalFilter(
  partFiltered,
  ['t', 'n', 's', 'u'],
)

function showAll() {
  selectedPart.value = ''
  clear()
}
</script>

<template>
  <div>
    <!-- Sticky search bar -->
    <section class="sticky top-14 z-20 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-dark-600/60 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3 py-3 flex-wrap">
          <div class="relative flex-1 min-w-[180px] max-w-md">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input v-model="searchQuery" type="text" placeholder="Search by name, symbol, unit..." class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-600 bg-slate-50/50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white dark:focus:bg-dark-700 transition-all" />
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 max-sm:w-full max-sm:overflow-x-scroll max-sm:-mx-4 max-sm:px-4">
            <button @click="selectedPart = ''" :class="!selectedPart ? 'bg-brand-600 text-white border-brand-500' : 'bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-brand-200 dark:hover:border-brand-700'" class="px-2.5 py-1 text-xs font-medium rounded-lg border transition-all">All</button>
            <button v-for="part in parts" :key="part.partKey" @click="selectedPart = part.partKey" :class="selectedPart === part.partKey ? 'bg-brand-600 text-white border-brand-500' : 'bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-brand-200 dark:hover:border-brand-700'" class="px-2.5 py-1 text-xs font-medium rounded-lg border transition-all">{{ part.parentPart ? sectionLabel(part.partKey) : part.partKey }}</button>
          </div>
          <button v-if="searchQuery || selectedPart" @click="showAll" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:bg-dark-700 transition-colors" title="Clear filters">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <span class="text-xs text-slate-400 tabular-nums ml-auto hidden sm:block">{{ filtered.length }} entries</span>
        </div>
      </div>
    </section>

    <!-- Entries -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="!searchQuery.trim() && !selectedPart" class="flex items-center gap-2 mb-3">
        <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 heading-serif">All entries</h3>
        <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60"></div>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{{ filtered.length }}</span>
      </div>

      <div v-if="searchQuery.trim() && filtered.length === 0" class="py-16 text-center">
        <p class="text-slate-500 text-sm font-medium">No entries match "{{ searchQuery }}"</p>
        <p class="text-slate-400 text-xs mt-1">Try a quantity name, symbol, or unit.</p>
      </div>

      <div v-else class="space-y-px">
        <a v-for="item in visibleEntries" :key="item.i" :href="`/quantities/part-${item.p}/${item.i}`" class="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-transparent dark:border-transparent hover:bg-white dark:hover:bg-dark-800/80 transition-colors">
          <div class="flex-shrink-0 w-16">
            <span class="font-mono text-[11px] font-semibold text-brand-700 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 px-2 py-0.5 rounded" v-html="hl(item.n)"></span>
          </div>
          <div class="flex-1 min-w-0 flex items-center gap-3">
            <span class="font-medium text-slate-800 dark:text-slate-200 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate" v-html="hl(item.t)"></span>
            <template v-if="item.s.length">
              <span class="text-slate-200 hidden sm:inline">|</span>
              <span class="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500">
                <span v-for="(sym, i) in item.s" :key="i" class="inline-flex items-center">
                  <MathRenderer :expression="sym" :cache="symbolCache" />
                  <span v-if="i < item.s.length - 1" class="text-slate-300 mr-0.5">,</span>
                </span>
              </span>
            </template>
          </div>
          <div class="flex-shrink-0 hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <template v-if="item.u.length">
              <span class="font-mono text-brand-600 font-medium inline-flex items-center gap-1">
                <template v-for="(usym, ui) in item.u" :key="ui">
                  <MathRenderer v-if="symbolCache[usym]" :expression="usym" :cache="symbolCache" />
                  <span v-else v-html="hl(usym)"></span>
                  <span v-if="ui < item.u.length - 1" class="text-slate-300">, </span>
                </template>
              </span>
              <span class="text-slate-200">·</span>
            </template>
            <span class="text-[10px] uppercase tracking-wider font-medium" :class="isMath ? 'text-violet-500/70' : 'text-brand-500/70'">{{ isMath ? sectionLabel(item.p) : item.p }}</span>
          </div>
          <svg class="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </a>
      </div>

      <div v-if="hasMore" class="mt-6 text-center">
        <button @click="showMore" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
          Show more
          <span class="text-xs text-slate-400">({{ filtered.length - visibleEntries.length }} remaining)</span>
        </button>
      </div>
    </section>
  </div>
</template>
