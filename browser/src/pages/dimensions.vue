<script setup lang="ts">
import { SiteConfig } from '../site.config'
import { ref, computed } from 'vue'
import { physicalDimensions } from '../data/generated/physical-dimensions'

const searchQuery = ref('')

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return physicalDimensions
  const q = searchQuery.value.toLowerCase()
  return physicalDimensions.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.shortName.includes(q) ||
    d.vectorNotation.toLowerCase().includes(q) ||
    d.unitsmlId.toLowerCase().includes(q)
  )
})

const dimlessCount = physicalDimensions.filter(d => d.dimensionless).length
const withIsoCount = physicalDimensions.filter(d => d.isoEntries.length > 0).length
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950">
      <div class="absolute inset-0 hero-pattern" />
      <div class="grain-overlay absolute inset-0" />
      <div class="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 bg-indigo-500/10" />
      <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-indigo-400/20" />
      <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
      <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div class="max-w-3xl page-enter">
          <div class="flex items-center gap-2 text-xs text-indigo-300/60 mb-5">
            <router-link to="/" class="hover:text-indigo-200 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </div>
          <div class="flex items-end gap-5 flex-wrap">
            <a href="https://www.unitsml.org" target="_blank" rel="noopener" class="group flex-shrink-0">
              <img :src="SiteConfig.asset('/img/unitsml-symbol.svg')" alt="UnitsML" class="h-10 w-auto" />
            </a>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">Dimensions</h1>
                <a href="https://www.unitsml.org" target="_blank" rel="noopener" class="group">
                  <img :src="SiteConfig.asset('/img/unitsml-text.svg')" alt="UnitsML" class="h-4 w-auto brightness-0 invert" />
                </a>
              </div>
              <p class="mt-2 text-sm leading-relaxed max-w-xl text-indigo-300/80">
                {{ physicalDimensions.length }} dimensional vectors. Each dimension defines a physical quantity's composition in base SI dimensions — length (L), mass (M), time (T), electric current (I), temperature (Θ), amount of substance (N), and luminous intensity (J).
              </p>
            </div>
            <div class="flex gap-2 ml-auto flex-shrink-0 mb-1">
              <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ physicalDimensions.length }}</span>
                <span class="text-xs ml-1 text-indigo-300/70">dimensions</span>
              </div>
              <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ withIsoCount }}</span>
                <span class="text-xs ml-1 text-indigo-300/70">linked to ISO 80000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
    </section>

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
        <router-link
          v-for="dim in filtered"
          :key="dim.nistId"
          :to="`/dimensions/${dim.slug}`"
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
              <template v-if="dim.isoEntries.length">
                <span>&middot;</span>
                <span class="text-indigo-600 dark:text-indigo-400 font-medium">{{ dim.isoEntries.length }} ISO 80000 quantit{{ dim.isoEntries.length === 1 ? 'y' : 'ies' }}</span>
              </template>
              <template v-if="dim.isoUnitSlugs.length">
                <span>&middot;</span>
                <span>{{ dim.isoUnitSlugs.length }} unit{{ dim.isoUnitSlugs.length === 1 ? '' : 's' }}</span>
              </template>
            </div>
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
        </router-link>
      </div>
    </section>
  </div>
</template>
