<script setup lang="ts">
import { toRef } from 'vue'
import { useLocalFilter } from '../composables/useLocalFilter'

interface DimVector { base: string; power: number }
interface IsoEntry { id: string; num: string; name: string; part: string }
interface PhysicalDimension {
  nistId: string
  unitsmlId: string
  slug: string
  name: string
  shortName: string
  dimensionless: boolean
  vector: DimVector[]
  vectorNotation: string
  isoEntries: IsoEntry[]
  isoUnitSlugs: string[]
}

const props = defineProps<{
  dimensions: PhysicalDimension[]
}>()

const { searchQuery, filtered } = useLocalFilter(
  toRef(props, 'dimensions'),
  ['name', 'slug', 'vectorNotation'],
)
</script>

<template>
  <div>
    <!-- Search bar -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 mb-6">
      <div class="relative max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Search dimensions..." class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm" />
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="filtered.length === 0" class="py-16 text-center">
        <p class="text-slate-500 dark:text-slate-400 text-sm">No dimensions match your search</p>
      </div>

      <div class="grid gap-2">
        <a
          v-for="dim in filtered"
          :key="dim.nistId"
          :href="`/dimensions/${dim.slug}`"
          class="group flex items-center gap-4 px-5 py-3.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/70 dark:border-dark-600/60 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all"
        >
          <!-- Dimension vector -->
          <div class="flex-shrink-0 w-28 text-center">
            <span class="font-mono text-sm font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg whitespace-nowrap">
              <template v-if="dim.dimensionless">
                <span class="text-indigo-500/60">dimless</span>
              </template>
              <template v-else>
                {{ dim.vectorNotation }}
              </template>
            </span>
          </div>

          <!-- Name + identifiers -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ dim.name }}</span>
              <span v-if="dim.dimensionless" class="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-px rounded leading-none">dimensionless</span>
            </div>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              <span class="font-mono">{{ dim.unitsmlId }}</span>
            </div>
          </div>

          <!-- Stats — right-aligned -->
          <div class="hidden sm:flex items-center gap-3 flex-shrink-0 text-xs">
            <span v-if="dim.isoEntries.length" class="text-indigo-600 dark:text-indigo-400 font-medium">{{ dim.isoEntries.length }} ISQ quantit{{ dim.isoEntries.length === 1 ? 'y' : 'ies' }}</span>
            <span v-if="dim.isoUnitSlugs.length" class="text-slate-500 dark:text-slate-400">{{ dim.isoUnitSlugs.length }} unit{{ dim.isoUnitSlugs.length === 1 ? '' : 's' }}</span>
          </div>

          <!-- Vector breakdown -->
          <div v-if="!dim.dimensionless && dim.vector.length" class="hidden lg:flex items-center gap-1.5 flex-shrink-0">
            <span
              v-for="comp in dim.vector"
              :key="comp.base"
              class="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold font-mono"
              :class="comp.power !== 0 ? 'bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300' : 'bg-slate-50 dark:bg-dark-800 text-slate-400 dark:text-slate-600'"
            >
              {{ comp.base }}<sup class="text-[8px] -mt-1">{{ comp.power !== 1 ? comp.power : '' }}</sup>
            </span>
          </div>

          <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </a>
      </div>
    </section>
  </div>
</template>
