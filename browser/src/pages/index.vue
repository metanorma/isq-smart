<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { getDomains, getPartsByDomain, partUrl, entryUrl } from '../data/PartRegistry'
import { partEntryCount, isBilingual } from '../data/index'
import { publicationDocuments } from '../data/generated/iso80000'
import { units, dimensions } from '../data/generated/unitsdb'
import { quantitiesIndex } from '../data/generated/domain-index'
import { generateIndexJsonLd } from '../data/jsonld'
import { accentGradient, accentColors } from '../composables/useAccent'
import JsonLd from '../components/JsonLd.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useTheme } from '../composables/useTheme'
import { useRecentEntries } from '../composables/useRecentEntries'

useScrollReveal()
const { isDark } = useTheme()
const { recent } = useRecentEntries()

const domains = getDomains()
const parts = getPartsByDomain('quantities')
const mathParts = getPartsByDomain('math')

const quantitiesCount = parts.reduce((s, p) => s + partEntryCount(p.partKey), 0)
const mathCount = mathParts.reduce((s, p) => s + partEntryCount(p.partKey), 0)
const totalDocs = publicationDocuments.length
const totalUnits = units.length
const totalDims = dimensions.length

const mainQtyParts = computed(() => {
  const seen = new Set<string>()
  return parts.filter(p => {
    const key = p.parentPart || p.partKey
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

const totalParts = computed(() => {
  const allParts = [...parts, ...mathParts]
  const mainParts = new Set(allParts.map(p => p.parentPart || p.partKey))
  return mainParts.size
})

const maxQtyCount = computed(() =>
  Math.max(...parts.map(p => partEntryCount(p.partKey)))
)

// Count-up animation
const statsRef = ref<HTMLElement>()
const qtyDisplay = ref(0)
const mathDisplay = ref(0)
const partsDisplay = ref(0)

onMounted(() => {
  if (!statsRef.value) return
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    const dur = 1400
    const qtyEnd = quantitiesCount
    const mathEnd = mathCount
    const partsEnd = totalParts.value
    const start = performance.now()
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1)
      const e = 1 - Math.pow(1 - p, 3)
      qtyDisplay.value = Math.round(qtyEnd * e)
      mathDisplay.value = Math.round(mathEnd * e)
      partsDisplay.value = Math.round(partsEnd * e)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, { threshold: 0.3 })
  observer.observe(statsRef.value)
})

const jsonLdData = computed(() => generateIndexJsonLd([...parts, ...mathParts]))

// Featured entries — hand-picked interesting quantities across parts
const featured = computed(() => {
  const ids = new Set(['t3-1.1', 't4-1.1', 't5-1.1', 't6-1.1', 't8-1.1', 't10-1.1', 't13-2'])
  return quantitiesIndex.filter(e => ids.has(e.i)).slice(0, 7)
})

const marqueeItems = computed(() => {
  const items: { text: string; sym?: string }[] = []
  for (const e of quantitiesIndex.slice(0, 80)) {
    items.push({ text: e.t, sym: e.s[0] })
  }
  return items
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-navy-950">
      <div class="absolute inset-0 hero-pattern" />
      <div class="grain-overlay absolute inset-0" />
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

      <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-brand-400/20" />
      <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
      <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div class="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          <div class="lg:col-span-3 page-enter">
            <!-- Logos -->
            <div class="flex items-center gap-3 mb-6">
              <img src="/img/logo-iso.svg" alt="ISO" class="h-7 w-auto rounded opacity-90" />
              <span class="text-white/30 text-xs">&amp;</span>
              <img src="/img/logo-iec.svg" alt="IEC" class="h-7 w-auto rounded opacity-90" />
            </div>

            <h1 class="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] heading-serif">
              ISO&nbsp;&amp;&nbsp;IEC&nbsp;80000
            </h1>
            <p class="mt-2 text-xl text-brand-200/90 font-medium heading-serif">Quantities and Units</p>
            <p class="mt-3 text-sm sm:text-base text-brand-300/60 leading-relaxed max-w-xl">
              The joint ISO and IEC international standard defining quantities, units, and mathematical notation used in science and engineering.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
              <router-link to="/quantities" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#fff] text-brand-900 text-sm font-semibold hover:bg-brand-50 transition-colors shadow-lg shadow-black/10">
                Browse Quantities
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
              </router-link>
              <router-link to="/math" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.1] border border-white/[0.15] text-white text-sm font-medium hover:bg-white/[0.15] transition-colors">
                Math Notation
              </router-link>
              <router-link to="/units" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 text-sm font-medium hover:bg-white/[0.1] hover:text-white/90 transition-colors">
                Units
              </router-link>
            </div>

            <div ref="statsRef" class="mt-6 flex flex-wrap gap-4 text-sm text-brand-300/50">
              <span><span class="text-white font-semibold tabular-nums">{{ qtyDisplay.toLocaleString() }}</span> quantities</span>
              <span><span class="text-white font-semibold tabular-nums">{{ mathDisplay.toLocaleString() }}</span> math terms</span>
              <span><span class="text-white font-semibold tabular-nums">{{ partsDisplay }}</span> parts</span>
            </div>
          </div>

          <!-- Featured entries panel -->
          <div class="lg:col-span-2 page-enter" style="animation-delay: 0.1s">
            <div class="rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm overflow-hidden">
              <div class="px-4 py-3 border-b border-white/[0.06]">
                <span class="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Featured entries</span>
              </div>
              <div class="divide-y divide-white/[0.04]">
                <router-link
                  v-for="entry in featured"
                  :key="entry.i"
                  :to="entryUrl(entry.p, entry.i)"
                  class="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.06] transition-colors"
                >
                  <span class="font-mono text-[10px] font-semibold text-brand-300/80 bg-white/[0.06] px-1.5 py-0.5 rounded flex-shrink-0">{{ entry.n }}</span>
                  <span class="text-sm text-white/80 group-hover:text-white transition-colors truncate flex-1">{{ entry.t }}</span>
                  <span v-if="entry.u.length" class="font-mono text-xs text-brand-300/60 flex-shrink-0">{{ entry.u[0] }}</span>
                </router-link>
              </div>
              <router-link to="/quantities" class="block px-4 py-2.5 text-[11px] text-brand-300/50 hover:text-brand-200 transition-colors border-t border-white/[0.06]">
                View all {{ quantitiesCount.toLocaleString() }} entries →
              </router-link>
            </div>
          </div>
        </div>

        <!-- Symbol marquee -->
        <div class="hero-marquee mt-10 overflow-hidden">
          <div class="hero-marquee-track">
            <template v-for="pass in 2" :key="pass">
              <span v-for="(item, i) in marqueeItems" :key="`${pass}-${i}`" class="inline-flex items-center gap-2 text-[11px] text-brand-300/30 whitespace-nowrap">
                <span v-if="item.sym" class="font-mono text-brand-400/25">{{ item.sym }}</span>
                <span>{{ item.text }}</span>
                <span class="text-brand-400/15">·</span>
              </span>
            </template>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
    </section>

    <!-- Recently viewed -->
    <section v-if="recent.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-reveal">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Recently Viewed</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <router-link
          v-for="r in recent.slice(0, 8)"
          :key="r.id"
          :to="r.href"
          class="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-sm"
        >
          <span class="font-mono text-[11px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">{{ r.num }}</span>
          <span class="text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ r.name }}</span>
        </router-link>
      </div>
    </section>

    <!-- About the standard -->
    <section class="bg-slate-50/50 dark:bg-dark-800/50 border-y border-slate-200/50 dark:border-dark-600/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 scroll-reveal">
        <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 heading-serif">What is it?</h3>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ISO 80000 &amp; IEC 80000 are the international standards that define <strong class="text-slate-800 dark:text-slate-100">quantities</strong>, <strong class="text-slate-800 dark:text-slate-100">units of measurement</strong>, and <strong class="text-slate-800 dark:text-slate-100">mathematical notation</strong> used across science, engineering, and commerce worldwide.
            </p>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 heading-serif">How to use</h3>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Browse by domain or part, search across all entries with <kbd class="text-[10px] bg-slate-200 dark:bg-dark-700 px-1 py-0.5 rounded font-mono">/</kbd>, navigate entries with arrow keys. Every entry has exportable citations and linked data.
            </p>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
              </div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 heading-serif">Linked data</h3>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Each entry includes <strong class="text-slate-800 dark:text-slate-100">JSON-LD</strong> structured data, RFC&nbsp;5141 URN identifiers, and machine-readable exports in BibTeX, RIS, and RDF&nbsp;Turtle formats.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Domain cards -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 scroll-reveal">
      <div class="grid sm:grid-cols-2 gap-4">
        <router-link
          v-for="d in domains"
          :key="d.key"
          :to="d.path"
          class="card-lift group block rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 overflow-hidden relative"
        >
          <div class="h-1 bg-gradient-to-r" :class="d.key === 'quantities' ? 'from-brand-500 to-brand-600' : 'from-violet-500 to-violet-600'" />
          <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" :class="d.key === 'quantities' ? 'bg-gradient-to-br from-brand-50/20 to-transparent' : 'bg-gradient-to-br from-violet-50/20 to-transparent'" />
          <div class="relative p-6">
            <div class="flex items-center gap-4">
              <div class="text-3xl">{{ d.icon }}</div>
              <div class="min-w-0">
                <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors heading-serif">{{ d.label }}</h3>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{{ d.description }}</p>
                <div class="mt-2 flex items-center gap-3 text-xs">
                  <span class="text-slate-600 dark:text-slate-300 font-semibold">{{ d.key === 'quantities' ? parts.length : mathParts.length }} parts</span>
                  <span class="text-slate-300">&middot;</span>
                  <span class="text-slate-600 dark:text-slate-300 font-semibold tabular-nums">{{ (d.key === 'quantities' ? quantitiesCount : mathCount).toLocaleString() }} entries</span>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Quantities distribution -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 scroll-reveal">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif">Entry Distribution</h2>
        <span class="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{{ quantitiesCount.toLocaleString() }} total</span>
      </div>
      <div class="space-y-1.5">
        <router-link
          v-for="part in mainQtyParts"
          :key="part.partKey"
          :to="partUrl(part.partKey)"
          class="group flex items-center gap-3 px-2 py-1.5 -mx-2 rounded-lg hover:bg-slate-50/80 dark:hover:bg-dark-700/50 transition-colors"
        >
          <span class="w-7 text-right text-xs text-slate-400 font-medium group-hover:text-slate-600 transition-colors flex-shrink-0">{{ part.icon }}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <div
                class="h-5 rounded-md transition-all duration-300"
                :class="isDark ? 'opacity-60 group-hover:opacity-80' : 'opacity-25 group-hover:opacity-40'"
                :style="{
                  width: `${Math.max(3, (partEntryCount(part.partKey) / maxQtyCount) * 100)}%`,
                  background: accentGradient(part),
                  boxShadow: isDark ? `0 0 12px ${accentColors(part).from}40, 0 0 4px ${accentColors(part).from}60` : undefined,
                  filter: isDark ? 'saturate(1.4) brightness(1.3)' : undefined,
                }"
              />
              <span
                class="text-xs font-mono tabular-nums font-medium transition-colors"
                :style="{
                  color: accentColors(part).from,
                  textShadow: isDark ? `0 0 8px ${accentColors(part).from}80` : undefined,
                }"
              >{{ partEntryCount(part.partKey) }}</span>
            </div>
          </div>
          <span class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[140px] hidden sm:block group-hover:text-slate-600 transition-colors">{{ part.title }}</span>
        </router-link>
      </div>
    </section>

    <!-- Quantities parts overview -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 scroll-reveal">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif">Quantities &amp; Units</h2>
          <p class="mt-0.5 text-slate-500 dark:text-slate-400 text-xs">Parts 3–13 — physical quantities and their measurement units</p>
        </div>
        <router-link to="/quantities" class="hidden sm:flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
          Browse all
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        <router-link
          v-for="part in mainQtyParts"
          :key="part.partKey"
          :to="partUrl(part.partKey)"
          class="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
        >
          <span class="text-base flex-shrink-0">{{ part.icon }}</span>
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ part.partKey }}</span>
              <span v-if="isBilingual(part.partKey)" class="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1 py-px rounded leading-none">FR</span>
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">{{ part.title }}</div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Math parts -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="flex items-center gap-2 mb-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif">Mathematical Notation</h2>
        <span class="text-xs text-slate-400 dark:text-slate-500 tabular-nums">{{ mathParts.length }} parts</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        <router-link
          v-for="part in mathParts"
          :key="part.partKey"
          :to="partUrl(part.partKey)"
          class="group flex flex-col px-3 py-2.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-sm transition-all text-center"
        >
          <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {{ part.partKey }}
          </div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ part.title }}</div>
        </router-link>
      </div>
    </section>

    <!-- Semantic Layer -->
    <section class="border-t border-slate-200/50 dark:border-dark-600/50 bg-slate-50/30 dark:bg-dark-800/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">Semantic Layer</h2>
        <div class="grid sm:grid-cols-2 gap-6">
          <router-link to="/documents" class="group block rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-lg bg-iec-100 flex items-center justify-center text-iec-600 text-sm font-bold">{{ totalDocs }}</div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors heading-serif">Documents</h3>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">ISO &amp; IEC 80000 parts with clauses, terms, and document structure.</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <div v-for="doc in publicationDocuments.slice(0, 4)" :key="doc.id" class="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400">
                {{ doc.partKey }}
              </div>
              <span v-if="publicationDocuments.length > 4" class="text-[10px] text-slate-400 dark:text-slate-500">+{{ publicationDocuments.length - 4 }}</span>
            </div>
          </router-link>

          <router-link to="/ontology" class="group block rounded-2xl border border-slate-200/80 dark:border-dark-600/80 bg-white dark:bg-dark-800 p-6 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 text-sm">OWL</div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors heading-serif">Ontology</h3>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Classes, properties, SHACL shapes, and SKOS concepts for ISO &amp; IEC 80000 quantities, units, and mathematical notation.</p>
          </router-link>
        </div>
      </div>
    </section>

    <JsonLd :data="jsonLdData" />
  </div>
</template>
