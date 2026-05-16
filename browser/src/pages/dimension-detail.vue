<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { physicalDimensions } from '../data/generated/physical-dimensions'
import { entryUrl } from '../data/PartRegistry'
import { quantitiesIndex, symbolCache } from '../data/generated/domain-index'
import DimensionOntologyPanel from '../components/DimensionOntologyPanel.vue'

const route = useRoute()
const slug = computed(() => route.params.part as string)

const dim = computed(() => physicalDimensions.find(d => d.slug === slug.value))

const BASE_DIM_META: Record<string, { name: string; color: string }> = {
  L: { name: 'Length', color: 'sky' },
  M: { name: 'Mass', color: 'amber' },
  T: { name: 'Time', color: 'violet' },
  I: { name: 'Electric Current', color: 'orange' },
  'Θ': { name: 'Temperature', color: 'rose' },
  N: { name: 'Amount of Substance', color: 'emerald' },
  J: { name: 'Luminous Intensity', color: 'yellow' },
  'φ': { name: 'Plane Angle', color: 'cyan' },
}

function baseMeta(sym: string) {
  return BASE_DIM_META[sym] ?? { name: sym, color: 'slate' }
}

// Find ISO entries linked to this dimension
const isoEntries = computed(() => {
  if (!dim.value) return []
  return dim.value.isoEntries.map(e => {
    // Find full entry from quantitiesIndex for richer data
    const idx = quantitiesIndex.find(q => q.i === e.id)
    return {
      ...e,
      symbols: idx?.s ?? [],
      unitSymbols: idx?.u ?? [],
    }
  })
})
</script>

<template>
  <div>
    <template v-if="dim">
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
              <router-link to="/dimensions" class="hover:text-indigo-200 transition-colors">Dimensions</router-link>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </div>

            <div class="flex items-end gap-5 flex-wrap">
              <a href="https://www.unitsml.org" target="_blank" rel="noopener" class="group flex-shrink-0">
                <img src="/img/unitsml-symbol.svg" alt="UnitsML" class="h-10 w-auto" />
              </a>
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">{{ dim.name }}</h1>
                  <a href="https://www.unitsml.org" target="_blank" rel="noopener" class="group">
                    <img src="/img/unitsml-text.svg" alt="UnitsML" class="h-4 w-auto brightness-0 invert" />
                  </a>
                </div>
                <p class="mt-1 text-sm text-indigo-300/60">
                  Dimension vector
                  <template v-if="!dim.dimensionless">
                    <span class="font-mono text-white/80 ml-1">{{ dim.vectorNotation }}</span>
                  </template>
                  <span v-else class="text-emerald-300/80 ml-1">dimensionless</span>
                  <span class="mx-1.5 text-indigo-400/30">&middot;</span>
                  <span class="font-mono">{{ dim.unitsmlId }}</span>
                </p>
              </div>

              <div class="flex gap-2 ml-auto flex-shrink-0 mb-1">
                <div v-if="dim.isoEntries.length" class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ dim.isoEntries.length }}</span>
                  <span class="text-xs ml-1 text-indigo-300/70">ISO 80000</span>
                </div>
                <div v-if="dim.isoUnitSlugs.length" class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ dim.isoUnitSlugs.length }}</span>
                  <span class="text-xs ml-1 text-indigo-300/70">units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
      </section>

      <!-- Dimension vector breakdown -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 mb-6">
        <div v-if="dim.vector.length" class="rounded-xl bg-white dark:bg-dark-900 border border-slate-200/70 dark:border-dark-600/60 p-5">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">Base dimension composition</h3>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="comp in dim.vector"
              :key="comp.base"
              class="flex items-center gap-2 px-4 py-2.5 rounded-lg border"
              :class="{
                'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800': baseMeta(comp.base).color === 'sky',
                'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800': baseMeta(comp.base).color === 'amber',
                'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800': baseMeta(comp.base).color === 'violet',
                'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800': baseMeta(comp.base).color === 'orange',
                'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800': baseMeta(comp.base).color === 'rose',
                'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800': baseMeta(comp.base).color === 'emerald',
                'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800': baseMeta(comp.base).color === 'yellow',
                'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800': baseMeta(comp.base).color === 'cyan',
                'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700': baseMeta(comp.base).color === 'slate',
              }"
            >
              <span class="font-mono text-xl font-bold">{{ comp.base }}</span>
              <div>
                <div class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ baseMeta(comp.base).name }}</div>
                <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400">power = {{ comp.power }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Ontology panel -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <DimensionOntologyPanel :dim="dim" />
      </section>

      <!-- Linked ISO 80000 quantities -->
      <section v-if="isoEntries.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">ISO 80000 quantities with this dimension</h3>
          <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-600/60" />
          <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ isoEntries.length }} quantit{{ isoEntries.length === 1 ? 'y' : 'ies' }}</span>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <router-link
            v-for="entry in isoEntries"
            :key="entry.id"
            :to="entryUrl(entry.part, entry.id)"
            class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all"
          >
            <span class="font-mono text-[11px] font-semibold text-brand-700 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 px-2 py-0.5 rounded flex-shrink-0">{{ entry.num }}</span>
            <div class="min-w-0">
              <span class="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate block">{{ entry.name }}</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500">
                Part {{ entry.part }}
                <template v-if="entry.unitSymbols.length"> &middot; {{ entry.unitSymbols.join(', ') }}</template>
              </span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Linked units -->
      <section v-if="dim.isoUnitSlugs.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Units with this dimension</h3>
          <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-600/60" />
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            v-for="uslug in dim.isoUnitSlugs"
            :key="uslug"
            :to="`/units/${uslug}`"
            class="group px-3 py-2 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-sm transition-all text-sm"
          >
            <span class="font-medium text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{{ uslug.replace(/-/g, ' ') }}</span>
          </router-link>
        </div>
      </section>

      <!-- UnitsML quantities -->
      <section v-if="dim.linkedQuantities.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center gap-2 mb-4">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">UnitsML quantities</h3>
          <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-600/60" />
          <span class="text-[10px] font-medium text-indigo-500/60 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">UnitsML</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="qn in dim.linkedQuantities"
            :key="qn"
            class="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 text-xs font-medium text-slate-700 dark:text-slate-300"
          >{{ qn.replace(/_/g, ' ') }}</span>
        </div>
      </section>

    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div class="text-4xl mb-4">📐</div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Dimension not found</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">"{{ slug }}" is not a valid physical dimension.</p>
      <router-link to="/dimensions" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        View all dimensions
      </router-link>
    </div>
  </div>
</template>
