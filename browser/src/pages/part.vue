<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getPartMeta, getPartEntryCount, isBilingual, getPartEditions, getText, getUnitName, getUnitSymbols, entryUrl, loadPartEntries, EntryModel } from '../data/index'
import MathRenderer from '../components/MathRenderer.vue'
import LanguageToggle from '../components/LanguageToggle.vue'
import ReferenceBadge from '../components/ReferenceBadge.vue'
import JsonLdActions from '../components/JsonLdActions.vue'
import PartIcon from '../components/PartIcon.vue'
import { accentGlow, accentColors, accentGradient, accentHeaderBg } from '../composables/useAccent'
import type { Entry } from '../data/types'

const route = useRoute()
const part = computed(() => route.params.part as string)
const domainRoute = computed(() =>
  route.path.startsWith('/math') ? 'math' : 'quantities'
)
const meta = computed(() => getPartMeta(part.value))
const bilingual = computed(() => isBilingual(part.value))
const editions = computed(() => getPartEditions(part.value))
const edition = computed(() => editions.value.join(', '))

const entries = ref<Entry[]>([])
const mathCache = ref<Record<string, string>>({})
const loading = ref(false)

const initialData = await loadPartEntries(part.value)
entries.value = initialData.entries
mathCache.value = initialData.mathCache

watch(part, async (newPart) => {
  loading.value = true
  const data = await loadPartEntries(newPart)
  entries.value = data.entries
  mathCache.value = data.mathCache
  loading.value = false
})

const lang = ref<'en' | 'fr' | 'both'>('en')
const filter = ref('')

const filtered = computed(() => {
  if (!filter.value.trim()) return entries.value
  const q = filter.value.toLowerCase()
  return entries.value.filter(e => {
    const name = getText(e, lang.value).toLowerCase()
    const syms = (e.symbols ?? []).join(' ').toLowerCase()
    const def = (e.def.en ?? '').toLowerCase()
    return name.includes(q) || syms.includes(q) || def.includes(q) || e.num.includes(q)
  })
})

interface SectionGroup {
  prefix: string
  entries: Entry[]
}

const sections = computed<SectionGroup[]>(() => {
  const groups: SectionGroup[] = []
  let currentPrefix = ''
  for (const entry of filtered.value) {
    const prefix = EntryModel.sectionGroup(entry)
    if (prefix !== currentPrefix) {
      groups.push({ prefix, entries: [entry] })
      currentPrefix = prefix
    } else {
      groups[groups.length - 1].entries.push(entry)
    }
  }
  return groups
})

const hasSections = computed(() => sections.value.length > 1)

function heroGlow() {
  return meta.value ? accentGlow(meta.value, 0.12, 140) : {}
}

function patternColor() {
  if (!meta.value) return 'rgba(255,255,255,0.03)'
  const { from } = accentColors(meta.value)
  return from + '08'
}

function sectionAccentStyle() {
  if (!meta.value) return {}
  return { background: accentGradient(meta.value, 120) }
}

function unitLabel(entry: Entry): string {
  if (entry._tag !== 'quantity') return ''
  const names = getUnitName(entry, lang.value)
  const syms = getUnitSymbols(entry)
  if (!names && !syms.length) return ''
  const parts = []
  if (syms.length) parts.push(syms.join(', '))
  if (names && names !== syms.join(', ')) parts.push(names)
  return parts.join(' · ')
}

function hl(text: string): string {
  const q = filter.value.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-amber-200/80 text-amber-900 rounded-sm px-0.5 -mx-0.5">$1</mark>')
}
</script>

<template>
  <div>
    <template v-if="meta">
      <!-- Part header -->
      <section class="relative overflow-hidden border-b border-slate-200/60" :style="meta ? accentHeaderBg(meta) : {}">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" :style="heroGlow()" />
        <div class="absolute inset-0 pointer-events-none part-hero-pattern" :style="{ '--accent-grid': patternColor() }" />

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 page-enter">
          <div class="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <router-link to="/" class="hover:text-brand-600 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link :to="domainRoute === 'math' ? '/math' : '/quantities'" class="hover:text-brand-600 transition-colors">{{ domainRoute === 'math' ? 'Math' : 'Quantities' }}</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <span class="text-slate-600 font-medium">{{ meta.parentPart ? `Part ${meta.parentPart} §${part.split('-')[1]}` : `Part ${part}` }}</span>
          </div>

          <div class="flex items-start gap-4">
            <PartIcon :part="meta" size="lg" />
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight heading-serif">
                {{ meta.parentPart ? `Part ${meta.parentPart} §${part.split('-')[1]}: ${meta.title}` : `Part ${part}: ${meta.title}` }}
              </h1>
              <p class="mt-1 text-slate-500 text-sm">{{ meta.description }}</p>
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span class="text-slate-500">{{ getPartEntryCount(part) }} entries</span>
                <span v-if="edition" class="text-slate-400">&middot; Edition {{ edition }}</span>
                <span v-if="bilingual" class="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">FR</span>
                <router-link :to="`/documents/part-${part.toString().split('-')[0]}`" class="text-brand-600 hover:text-brand-700 font-medium transition-colors">&rarr; About {{ meta.parentPart ? `Part ${meta.parentPart}` : 'this part' }}</router-link>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input v-model="filter" type="text" :placeholder="`Filter ${meta.title.toLowerCase()}...`" class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
            </div>
            <LanguageToggle v-if="bilingual" v-model="lang" />
            <ReferenceBadge :part="part" :edition="edition" :bilingual="bilingual" />
          </div>
        </div>
      </section>

      <!-- Entries -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div v-if="loading" class="space-y-2">
          <div v-for="i in 6" :key="i" class="rounded-xl border border-slate-200/80 bg-white p-4 flex items-start gap-4">
            <div class="w-16 h-5 bg-slate-100 rounded-lg animate-pulse" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
              <div class="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>

        <div v-else-if="filtered.length === 0" class="py-16 text-center">
          <p class="text-slate-500 text-sm">No entries match your filter</p>
        </div>

        <div v-else>
          <template v-for="(section, si) in sections" :key="section.prefix">
            <div v-if="hasSections" class="flex items-center gap-3 mt-6 mb-2" :class="si === 0 ? 'mt-0' : ''">
              <span class="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md text-white shadow-sm" :style="sectionAccentStyle()">{{ section.prefix }}</span>
              <span class="text-xs text-slate-400 truncate">{{ getText(section.entries[0], lang) }}</span>
              <div class="flex-1 h-px bg-slate-200/60" />
              <span class="text-[10px] text-slate-400 tabular-nums font-medium">{{ section.entries.length }}</span>
            </div>
            <div class="space-y-px">
              <router-link
                v-for="entry in section.entries"
                :key="entry.id"
                :to="entryUrl(part, entry.id)"
                class="group block rounded-lg border border-transparent bg-white px-4 py-2.5 sm:px-5 sm:py-3 hover:bg-white"
              >
                <div class="flex items-center gap-3 sm:gap-4">
                  <div class="flex-shrink-0 w-16 sm:w-20">
                    <span class="font-mono text-[11px] font-semibold text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded" v-html="hl(entry.num)" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-medium text-slate-900 text-sm group-hover:text-brand-600 transition-colors" v-html="hl(getText(entry, lang))" />
                      <template v-if="entry.symbols?.length">
                        <span v-for="(sym, i) in entry.symbols" :key="i" class="inline-flex items-center text-sm text-slate-500">
                          <MathRenderer :expression="sym" :cache="mathCache" />
                          <span v-if="i < entry.symbols!.length - 1" class="text-slate-300 mr-1">,</span>
                        </span>
                      </template>
                    </div>
                    <div class="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                      <template v-if="unitLabel(entry)">
                        <span class="font-mono text-brand-600 font-medium">{{ unitLabel(entry) }}</span>
                      </template>
                    </div>
                    <div v-if="entry.def?.en || entry.def?.fr" class="mt-0.5 text-xs text-slate-400 truncate">{{ EntryModel.shortDef(entry, 140, lang) }}</div>
                  </div>
                  <svg class="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
                </div>
              </router-link>
            </div>
          </template>
        </div>

        <div v-if="!loading" class="mt-6 text-center text-xs text-slate-400">
          {{ filtered.length }} of {{ entries.length }} entries
        </div>
      </section>
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 class="text-2xl font-bold text-slate-900 heading-serif">Part not found</h1>
      <router-link to="/" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        Back to Home
      </router-link>
    </div>
  </div>
</template>
