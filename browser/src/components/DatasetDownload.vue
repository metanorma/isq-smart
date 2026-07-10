<script setup lang="ts">
import { DataLoader } from '../data/DataLoader'
import { getAllParts } from '../data/PartRegistry'
import { jsonLdToTurtle } from '../data/serialization'
import { NS, tagToClass, partQname, entryQname } from '../data/ontologyConfig'
import { useToast } from '../composables/useToast'

const { show: showToast } = useToast()

async function downloadDataset(format: 'jsonld' | 'turtle') {
  const parts = getAllParts().filter(p => !p.parentPart && !p.partKey.includes('-'))
  const allEntries: Record<string, string>[] = []
  for (const part of parts) {
    try {
      const data = await DataLoader.loadPart(part.partKey)
      for (const entry of data.entries) {
        allEntries.push({
          '@id': entryQname(entry.id),
          '@type': tagToClass(entry._tag),
          'dcterms:identifier': entry.num,
          'skosxl:prefLabel': entry.designations[0]?.designation.en?.text ?? '',
          'skos:definition': entry.def?.en ?? '',
          'dcterms:isPartOf': partQname(part.partKey),
        })
      }
    } catch { /* skip missing parts */ }
  }

  const context = {
    '@context': {
      '@vocab': NS.core.uri,
      dcterms: 'http://purl.org/dc/terms/',
      skos: 'http://www.w3.org/2004/02/skos/core#',
      skosxl: 'http://www.w3.org/2008/05/skos-xl#',
      [NS.core.prefix]: 'https://w3id.org/standards/isq/',
    },
    '@graph': allEntries,
  }

  let content: string
  let filename: string
  let mime: string

  if (format === 'turtle') {
    content = jsonLdToTurtle(context as Record<string, unknown>)
    filename = 'iso80000-entries.ttl'
    mime = 'text/turtle'
  } else {
    content = JSON.stringify(context, null, 2)
    filename = 'iso80000-entries.jsonld'
    mime = 'application/ld+json'
  }

  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  showToast(`Downloaded ${filename}`)
}
</script>

<template>
  <div class="grid sm:grid-cols-2 gap-4">
    <button
      @click="downloadDataset('jsonld')"
      class="group flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-left"
    >
      <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      </div>
      <div>
        <div class="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">JSON-LD</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">Complete entry dataset as JSON-LD with UnitsML vocabulary context</div>
      </div>
    </button>
    <button
      @click="downloadDataset('turtle')"
      class="group flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-left"
    >
      <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      </div>
      <div>
        <div class="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">RDF Turtle</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">Complete entry dataset as RDF Turtle with SKOS-XL and Dublin Core terms</div>
      </div>
    </button>
  </div>
</template>
