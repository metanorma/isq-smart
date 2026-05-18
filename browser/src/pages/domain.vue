<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getDomain, getPartsByDomain, getPartEntryCount, isBilingual, partUrl, entryUrl } from '../data/index'
import MathRenderer from '../components/MathRenderer.vue'
import { quantitiesIndex, mathIndex, symbolCache } from '../data/generated/domain-index'

const route = useRoute()
const domainKey = computed<'quantities' | 'math'>(() =>
  route.path.startsWith('/math') ? 'math' : 'quantities'
)
const domain = computed(() => getDomain(domainKey.value))
const parts = computed(() => getPartsByDomain(domainKey.value))
const totalEntries = computed(() =>
  parts.value.reduce((sum, p) => sum + getPartEntryCount(p.partKey), 0)
)

const isMath = computed(() => domainKey.value === 'math')

const index = computed(() =>
  isMath.value ? mathIndex : quantitiesIndex
)

const searchQuery = ref('')
const selectedPart = ref('')
const showCount = ref(60)

const notableIds = new Set([
  't3-1.1', 't4-1', 't5-1.1', 't6-1.1', 't8-1.1', 't9-1', 't9-2', 't10-1.1', 't13-2',
  't2-5.1', 't2-5.2', 't2-5.3',
])

const notableEntries = computed(() => {
  if (isMath.value) return []
  return index.value.filter(e => notableIds.has(e.i)).slice(0, 12)
})

const isBrowsing = computed(() => !searchQuery.value.trim() && !selectedPart.value)

const filtered = computed(() => {
  let entries = index.value

  if (selectedPart.value) {
    entries = entries.filter(e => e.p === selectedPart.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    entries = entries.filter(e =>
      e.t.toLowerCase().includes(q) ||
      e.s.join(' ').toLowerCase().includes(q) ||
      e.n.includes(q) ||
      e.u.join(' ').toLowerCase().includes(q)
    )
  }

  return entries
})

const visibleEntries = computed(() => filtered.value.slice(0, showCount.value))
const hasMore = computed(() => showCount.value < filtered.value.length)

watch(selectedPart, () => { showCount.value = 60 })
watch(searchQuery, () => { showCount.value = 60 })

function showAll() {
  selectedPart.value = ''
  searchQuery.value = ''
}

function hl(text: string): string {
  const q = searchQuery.value.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  return text.replace(re, '<mark class="bg-amber-200/80 text-amber-900 rounded-sm px-0.5 -mx-0.5">$1</mark>')
}
</script>

<template>
  <div>
    <template v-if="domain">
      <!-- Domain hero -->
      <section class="relative overflow-hidden" :class="isMath ? 'bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-950' : 'bg-gradient-to-br from-brand-950 via-brand-900 to-navy-950'">
        <div class="absolute inset-0 hero-pattern" />
        <div class="grain-overlay absolute inset-0" />
        <div class="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" :class="isMath ? 'bg-violet-500/10' : 'bg-brand-500/10'" />

        <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full" :class="isMath ? 'bg-violet-400/20' : 'bg-brand-400/20'" />
        <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
        <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />

        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div class="max-w-3xl page-enter">
            <div class="flex items-center gap-2 text-xs mb-5" :class="isMath ? 'text-violet-300/60' : 'text-brand-300/60'">
              <router-link to="/" class="hover:text-brand-200 transition-colors">Home</router-link>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </div>

            <div class="flex items-end gap-5 flex-wrap">
              <div>
                <div class="text-3xl mb-2">{{ domain.icon }}</div>
                <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">
                  {{ domain.label }}
                </h1>
                <p class="mt-2 text-sm leading-relaxed max-w-xl" :class="isMath ? 'text-violet-300/80' : 'text-brand-300/80'">
                  {{ domain.description }}
                </p>
              </div>
              <div class="flex gap-2 ml-auto flex-shrink-0 mb-1">
                <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  <span class="text-lg font-bold text-white heading-serif">{{ parts.length }}</span>
                  <span class="text-xs ml-1" :class="isMath ? 'text-violet-300/70' : 'text-brand-300/70'">parts</span>
                </div>
                <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ totalEntries.toLocaleString() }}</span>
                  <span class="text-xs ml-1" :class="isMath ? 'text-violet-300/70' : 'text-brand-300/70'">entries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
      </section>

      <!-- Part navigation strip -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10 mb-6">
        <div v-if="!isMath" class="flex items-center gap-2 mb-3">
          <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
          <router-link to="/dimensions" class="text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
            View by dimension
          </router-link>
          <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          <router-link
            v-for="part in parts"
            :key="part.partKey"
            :to="partUrl(part.partKey)"
            class="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
          >
            <span class="text-base">{{ part.icon }}</span>
            <div class="min-w-0">
              <div class="flex items-center gap-1">
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ part.parentPart ? `§${part.partKey.split('-')[1]}` : part.partKey }}</span>
                <span v-if="isBilingual(part.partKey)" class="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1 py-px rounded leading-none">FR</span>
              </div>
              <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ part.title }}</div>
              <div class="text-[9px] text-slate-400 dark:text-slate-500 tabular-nums">{{ getPartEntryCount(part.partKey) }} entries</div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- Sticky search bar -->
      <section class="sticky top-14 z-20 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-dark-600/60 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3 py-3">
            <div class="relative flex-1 min-w-[180px] max-w-md">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input v-model="searchQuery" type="text" placeholder="Search by name, symbol, unit..." class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-600 bg-slate-50/50 dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white dark:focus:bg-dark-700 transition-all" />
            </div>
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              <button
                @click="selectedPart = ''"
                class="px-2.5 py-1 text-xs font-medium rounded-lg border transition-all"
                :class="!selectedPart ? 'bg-brand-600 text-white border-brand-500' : 'bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-brand-200 dark:hover:border-brand-700'"
              >All</button>
              <button
                v-for="part in parts"
                :key="part.partKey"
                @click="selectedPart = part.partKey"
                class="px-2.5 py-1 text-xs font-medium rounded-lg border transition-all"
                :class="selectedPart === part.partKey ? 'bg-brand-600 text-white border-brand-500' : 'bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-brand-200 dark:hover:border-brand-700'"
              >{{ part.parentPart ? `§${part.partKey.split('-')[1]}` : part.partKey }}</button>
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
        <!-- Notable entries -->
        <div v-if="isBrowsing && notableEntries.length" class="mb-8">
          <div class="flex items-center gap-2 mb-3">
            <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 heading-serif">Notable entries</h3>
            <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
            <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ notableEntries.length }} highlighted</span>
          </div>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <router-link
              v-for="item in notableEntries"
              :key="item.i"
              :to="entryUrl(item.p, item.i)"
              class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
            >
              <span class="font-mono text-[11px] font-semibold text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded flex-shrink-0">{{ item.n }}</span>
              <div class="min-w-0">
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate block">{{ item.t }}</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500">{{ item.p }}<span v-if="item.u.length"> &middot; {{ item.u[0] }}</span></span>
              </div>
            </router-link>
          </div>
        </div>

        <div v-if="isBrowsing" class="flex items-center gap-2 mb-3">
          <h3 class="text-xs font-bold text-slate-900 dark:text-slate-100 heading-serif">All entries</h3>
          <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
          <span class="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{{ filtered.length }}</span>
        </div>

        <!-- Empty state -->
        <div v-if="searchQuery.trim() && filtered.length === 0" class="py-16 text-center">
          <p class="text-slate-500 text-sm font-medium">No entries match "{{ searchQuery }}"</p>
          <p class="text-slate-400 text-xs mt-1">Try a quantity name, symbol, or unit.</p>
        </div>

        <!-- Entry rows -->
        <div v-else class="space-y-px">
          <router-link
            v-for="item in visibleEntries"
            :key="item.i"
            :to="entryUrl(item.p, item.i)"
            class="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-transparent dark:border-transparent hover:bg-white dark:hover:bg-dark-800/80 transition-colors"
          >
            <div class="flex-shrink-0 w-16">
              <span class="font-mono text-[11px] font-semibold text-brand-700 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 px-2 py-0.5 rounded" v-html="hl(item.n)" />
            </div>
            <div class="flex-1 min-w-0 flex items-center gap-3">
              <span class="font-medium text-slate-800 dark:text-slate-200 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate" v-html="hl(item.t)" />
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
                <span class="font-mono text-brand-600 font-medium" v-html="hl(item.u.join(', '))" />
                <span class="text-slate-200">&middot;</span>
              </template>
              <span class="text-[10px] uppercase tracking-wider font-medium" :class="isMath ? 'text-violet-500/70' : 'text-brand-500/70'">{{ isMath && item.p.includes('-') ? `§${item.p.split('-')[1]}` : item.p }}</span>
            </div>
            <svg class="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </router-link>
        </div>

        <!-- Show more -->
        <div v-if="hasMore" class="mt-6 text-center">
          <button @click="showCount += 60" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
            Show more
            <span class="text-xs text-slate-400">({{ filtered.length - showCount }} remaining)</span>
          </button>
        </div>
      </section>
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Domain not found</h1>
      <router-link to="/" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        Back to Home
      </router-link>
    </div>
  </div>
</template>
