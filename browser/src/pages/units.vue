<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { units } from '../data/generated/unitsdb'
import { partUrl, entryUrl, getPartMeta } from '../data/PartRegistry'
import { symbolCache } from '../data/generated/domain-index'
import MathRenderer from '../components/MathRenderer.vue'

const route = useRoute()
const searchQuery = ref('')
const groupByPart = ref(false)

onMounted(() => {
  const q = route.query.q as string
  if (q) searchQuery.value = q
})

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return units
  const q = searchQuery.value.toLowerCase()
  return units.filter(u => {
    const nameStr = u.name.toLowerCase()
    const symStr = u.symbols.join(' ').toLowerCase()
    return nameStr.includes(q) || symStr.includes(q)
  })
})

interface PartGroup {
  partKey: string
  meta: ReturnType<typeof getPartMeta>
  units: typeof units
}

const partGroups = computed<PartGroup[]>(() => {
  if (!groupByPart.value) return []
  const map = new Map<string, typeof units>()
  for (const u of filtered.value) {
    const pk = u.parts[0]
    if (!map.has(pk)) map.set(pk, [])
    map.get(pk)!.push(u)
  }
  const groups: PartGroup[] = []
  for (const [pk, us] of map) {
    const meta = getPartMeta(pk)
    if (meta) groups.push({ partKey: pk, meta, units: us })
  }
  return groups.sort((a, b) => {
    const an = Number(a.partKey) || 999
    const bn = Number(b.partKey) || 999
    return an - bn
  })
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-teal-950 via-teal-900 to-cyan-950">
      <div class="absolute inset-0 hero-pattern" />
      <div class="grain-overlay absolute inset-0" />
      <div class="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 bg-teal-500/10" />
      <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-teal-400/20" />
      <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
      <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div class="max-w-3xl page-enter">
          <div class="flex items-center gap-2 text-xs text-teal-300/60 mb-5">
            <router-link to="/" class="hover:text-teal-200 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </div>
          <div class="flex items-end gap-5 flex-wrap">
            <div>
              <div class="text-3xl mb-2">📏</div>
              <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">Units</h1>
              <p class="mt-2 text-sm leading-relaxed max-w-xl text-teal-300/80">
                {{ units.length }} measurement units from ISO 80000 &amp; IEC 80000. Each unit is linked to the quantities it measures.
              </p>
            </div>
            <div class="flex gap-2 ml-auto flex-shrink-0 mb-1">
              <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ units.length }}</span>
                <span class="text-xs ml-1 text-teal-300/70">units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
    </section>

    <!-- Search bar -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-20 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input v-model="searchQuery" type="text" placeholder="Search by name or symbol..." class="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all shadow-sm" />
        </div>
        <button
          @click="groupByPart = !groupByPart"
          class="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl border transition-all"
          :class="groupByPart ? 'border-teal-300 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400' : 'border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-dark-500'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
          <span class="hidden sm:inline">Group by part</span>
        </button>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-4 text-xs text-slate-400 dark:text-slate-500 tabular-nums">{{ filtered.length }} units</div>

      <div v-if="filtered.length === 0" class="py-16 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">No units match your search</p>
      </div>

      <!-- Grouped view -->
      <template v-if="groupByPart && partGroups.length">
        <div v-for="group in partGroups" :key="group.partKey" class="mb-8">
          <div class="flex items-center gap-3 mb-3">
            <router-link :to="partUrl(group.partKey)" class="flex items-center gap-2 group">
              <span class="text-base">{{ group.meta?.icon ?? '📐' }}</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors heading-serif">Part {{ group.partKey }}: {{ group.meta?.title }}</h3>
            </router-link>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">{{ group.units.length }} units</span>
            <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
          </div>
          <div class="grid gap-2">
            <router-link
              v-for="unit in group.units"
              :key="unit.slug"
              :to="`/units/${unit.slug}`"
              class="group block px-5 py-3 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/70 dark:border-dark-600/60 hover:border-slate-300 dark:hover:border-dark-500 hover:shadow-sm transition-all"
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-24 text-center pt-0.5">
                  <span class="font-mono text-base font-medium text-teal-700 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg inline-flex items-center justify-center"><MathRenderer v-if="symbolCache[unit.symbols[0]]" :expression="unit.symbols[0]" :cache="symbolCache" /><template v-else>{{ unit.symbols[0] || '—' }}</template></span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-800 dark:text-slate-200 text-sm">{{ unit.name }}</span>
                    <span v-if="unit.symbols.length > 1" class="text-xs text-slate-400 dark:text-slate-500 font-mono inline-flex items-center gap-1"><template v-for="(s, si) in unit.symbols.slice(1)" :key="si"><MathRenderer v-if="symbolCache[s]" :expression="s" :cache="symbolCache" /><template v-else>{{ s }}</template><span v-if="si < unit.symbols.length - 2" class="text-slate-300">, </span></template></span>
                  </div>
                  <div class="mt-1 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                    <span>{{ unit.quantityCount }} quantities</span>
                    <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                    <span>Parts {{ unit.parts.join(', ') }}</span>
                  </div>
                  <div v-if="unit.sampleQuantities.length" class="mt-1.5 flex flex-wrap gap-1.5">
                    <router-link
                      v-for="sq in unit.sampleQuantities"
                      :key="sq.num"
                      :to="entryUrl(sq.part, sq.id)"
                      class="text-[10px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-950/60 px-1.5 py-0.5 rounded transition-colors"
                    >{{ sq.name }}</router-link>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
      </template>

      <!-- Flat list view -->
      <div v-else class="grid gap-2">
        <router-link
          v-for="unit in filtered"
          :key="unit.slug"
          :to="`/units/${unit.slug}`"
          class="group block px-5 py-3.5 rounded-xl bg-white dark:bg-dark-900 border border-slate-200/70 dark:border-dark-600/60 hover:border-slate-300 dark:hover:border-dark-500 hover:shadow-sm transition-all"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-24 text-center pt-0.5">
              <span class="font-mono text-base font-medium text-teal-700 dark:text-teal-400 bg-teal-50/60 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg inline-flex items-center justify-center"><MathRenderer v-if="symbolCache[unit.symbols[0]]" :expression="unit.symbols[0]" :cache="symbolCache" /><template v-else>{{ unit.symbols[0] || '—' }}</template></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-slate-800 dark:text-slate-200 text-sm">{{ unit.name }}</span>
                <span v-if="unit.symbols.length > 1" class="text-xs text-slate-400 dark:text-slate-500 inline-flex items-center gap-1"><template v-for="(s, si) in unit.symbols.slice(1)" :key="si"><MathRenderer v-if="symbolCache[s]" :expression="s" :cache="symbolCache" /><template v-else>{{ s }}</template><span v-if="si < unit.symbols.length - 2" class="text-slate-300">, </span></template></span>
              </div>
              <div class="mt-1 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                <span>{{ unit.quantityCount }} quantities</span>
                <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                <span>Parts {{ unit.parts.join(', ') }}</span>
              </div>
              <div v-if="unit.sampleQuantities.length" class="mt-1.5 flex flex-wrap gap-1.5">
                <router-link
                  v-for="sq in unit.sampleQuantities"
                  :key="sq.num"
                  :to="entryUrl(sq.part, sq.id)"
                  class="text-[10px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-950/60 px-1.5 py-0.5 rounded transition-colors"
                >{{ sq.name }}</router-link>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>
