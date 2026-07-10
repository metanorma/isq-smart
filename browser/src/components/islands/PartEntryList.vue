<script setup lang="ts">
import { ref, computed } from 'vue'
import MathRenderer from '../MathRenderer.vue'
import LanguageToggle from '../LanguageToggle.vue'
import ReferenceBadge from '../ReferenceBadge.vue'
import { entryUrl, EntryModel } from '../../data/index'
import type { Entry, Lang } from '../../data/types'

const props = defineProps<{
  entries: Entry[]
  partKey: string
  mathCache: Record<string, string>
  bilingual: boolean
  metaTitle: string
  sectionAccentStyle: string
}>()

const filter = ref('')
const lang = ref<'en' | 'fr' | 'both'>('en')

const filtered = computed(() => {
  if (!filter.value.trim()) return props.entries
  const q = filter.value.toLowerCase()
  return props.entries.filter(e => {
    const name = EntryModel.name(e, lang.value).toLowerCase()
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

const hasSections = computed(() => sections.value.some(s => s.entries.length > 1))

function stripStem(text: string): string {
  return text.replace(/stem:\[([^\]]+)\]/g, (_, expr) => expr.replace(/^"|"$/g, ''))
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
    <!-- Controls -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[200px] max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input v-model="filter" type="text" :placeholder="`Filter ${metaTitle.toLowerCase()}...`" class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all" />
      </div>
      <LanguageToggle v-if="bilingual" v-model="lang" />
      <ReferenceBadge :part="partKey" :bilingual="bilingual" />
    </div>

    <!-- Entries -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div v-if="filtered.length === 0" class="py-16 text-center">
        <p class="text-slate-500 dark:text-slate-400 text-sm">No entries match your filter</p>
      </div>

      <div v-else>
        <template v-for="(section, si) in sections" :key="section.prefix">
          <div v-if="hasSections" class="flex items-center gap-3 mt-6 mb-2" :class="si === 0 ? 'mt-0' : ''">
            <span class="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md text-white shadow-sm" :style="sectionAccentStyle">{{ section.prefix }}</span>
            <span class="text-xs text-slate-400 dark:text-slate-500 truncate">{{ EntryModel.name(section.entries[0], lang) }}</span>
            <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
            <span class="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums font-medium">{{ section.entries.length }}</span>
          </div>
          <div class="space-y-px">
            <a
              v-for="entry in section.entries"
              :key="entry.id"
              :href="entryUrl(partKey, entry.id)"
              class="group block rounded-lg border border-transparent dark:border-transparent bg-white dark:bg-dark-800/50 px-4 py-2.5 sm:px-5 sm:py-3 hover:bg-white dark:hover:bg-dark-800"
            >
              <div class="flex items-center gap-3 sm:gap-4">
                <div class="flex-shrink-0 w-16 sm:w-20">
                  <span class="font-mono text-[11px] font-semibold text-brand-700 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40 px-2 py-0.5 rounded" v-html="hl(entry.num)" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-slate-900 dark:text-slate-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" v-html="hl(EntryModel.plainName(entry, lang))" />
                    <template v-if="entry.symbols?.length">
                      <span v-for="(sym, i) in entry.symbols" :key="i" class="inline-flex items-center text-sm text-slate-500">
                        <MathRenderer :expression="sym" :cache="mathCache" />
                        <span v-if="i < entry.symbols!.length - 1" class="text-slate-300 mr-1">,</span>
                      </span>
                    </template>
                  </div>
                  <div class="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                    <template v-if="entry._tag === 'quantity' && EntryModel.unitSymbols(entry).length">
                      <template v-for="(us, usi) in EntryModel.unitSymbols(entry)" :key="usi">
                        <MathRenderer :expression="stripStem(us)" :cache="mathCache" class="text-brand-600 font-medium" />
                        <span v-if="usi < EntryModel.unitSymbols(entry).length - 1" class="text-slate-300">,</span>
                      </template>
                      <template v-if="EntryModel.unitName(entry, lang)">
                        <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                        <span class="truncate">{{ EntryModel.unitName(entry, lang) }}</span>
                      </template>
                    </template>
                  </div>
                  <div v-if="entry.def?.en || entry.def?.fr" class="mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate">{{ EntryModel.shortDef(entry, 140, lang) }}</div>
                </div>
                <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
              </div>
            </a>
          </div>
        </template>
      </div>

      <div class="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        {{ filtered.length }} of {{ entries.length }} entries
      </div>
    </section>
  </div>
</template>
