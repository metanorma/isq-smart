<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Entry, PartMeta } from '../data/types'
import {
  generateBibTeX, generateChicago, generateRis,
} from '../data/citation'
import { entryUrn } from '../data/urn'
import { generateEntryJsonLd, jsonLdToTurtle } from '../data/serialization'
import { entryUrl } from '../data'
import { downloadFile } from '../lib/download'
import { useToast } from '../composables/useToast'

const toast = useToast()

const props = defineProps<{
  entry: Entry
  meta: PartMeta
  edition: string
}>()

const activeTab = ref<'url' | 'bibtex' | 'chicago' | 'ris' | 'turtle'>('url')
const copied = ref(false)

const urn = computed(() => entryUrn(props.entry, props.meta.partKey, props.edition))
const url = computed(() => `https://iso80000.org${entryUrl(props.entry.partKey, props.entry.id)}`)

const bibtex = computed(() => generateBibTeX(props.entry, props.meta, props.edition))
const chicago = computed(() => generateChicago(props.entry, props.meta, props.edition))
const ris = computed(() => generateRis(props.entry, props.meta, props.edition))

const jsonLd = computed(() => generateEntryJsonLd(props.entry, props.meta, props.edition))
const turtle = computed(() => jsonLdToTurtle(jsonLd.value))

const activeContent = computed(() => {
  switch (activeTab.value) {
    case 'url': return `${url.value}\n${urn.value}`
    case 'bibtex': return bibtex.value
    case 'chicago': return chicago.value
    case 'ris': return ris.value
    case 'turtle': return turtle.value
  }
})

const activeFilename = computed(() => {
  const base = `iso80000-${props.entry.id}`
  switch (activeTab.value) {
    case 'url': return `${base}.txt`
    case 'bibtex': return `${base}.bib`
    case 'chicago': return `${base}.txt`
    case 'ris': return `${base}.ris`
    case 'turtle': return `${base}.ttl`
  }
})

function copyContent() {
  navigator.clipboard?.writeText(activeContent.value)
  copied.value = true
  toast.show(`${tabs.find(t => t.key === activeTab.value)?.label} citation copied`)
  setTimeout(() => { copied.value = false }, 1500)
}

function downloadContent() {
  downloadFile(activeContent.value, activeFilename.value, 'text/plain')
}

const tabs = [
  { key: 'url' as const, label: 'URL/URN' },
  { key: 'bibtex' as const, label: 'BibTeX' },
  { key: 'chicago' as const, label: 'Chicago' },
  { key: 'ris' as const, label: 'RIS' },
  { key: 'turtle' as const, label: 'Turtle' },
]
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 dark:border-dark-600/60 bg-white dark:bg-dark-900 overflow-hidden">
    <div class="flex items-center gap-1 px-3 pt-3 pb-1 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key; copied = false"
        class="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
        :class="activeTab === tab.key
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700'"
      >{{ tab.label }}</button>
      <div class="flex-1" />
      <button @click="copyContent" class="p-1.5 rounded-lg transition-all" :class="copied ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30'" :title="copied ? 'Copied!' : 'Copy'">
        <svg v-if="!copied" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
      </button>
      <button @click="downloadContent" class="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all" title="Download">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      </button>
    </div>
    <div class="px-3 pb-3">
      <pre class="text-xs font-mono leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-dark-800 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">{{ activeContent }}</pre>
    </div>
  </div>
</template>
