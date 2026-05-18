<script setup lang="ts">
import { computed } from 'vue'
import { publicationDocuments } from '../data/generated/iso80000'
import { getAllParts, getPartMeta } from '../data/PartRegistry'
import { partEntryCount } from '../data/index'
import { publisherOf } from '../data/jsonld'

interface DocEntry {
  partKey: string
  title: string
  edition?: string
  publisher: string
  publicationType: string
  clauseCount: number
  termCount: number
  id: string
  link: string
}

const docs = computed(() => {
  const topDocs = new Map<string, DocEntry>()

  // Add publicationDocuments with top-level (numeric-only) partKeys
  for (const d of publicationDocuments) {
    if (/^\d+$/.test(d.partKey)) {
      topDocs.set(d.partKey, { ...d, link: `/documents/part-${d.partKey}` })
    }
  }

  // Ensure all top-level parts from PartRegistry are represented
  for (const part of getAllParts()) {
    if (part.parentPart) continue
    // Skip sections (Part 2) and sub-parts (Part 11)
    if (part.partKey.includes('-')) continue
    if (!topDocs.has(part.partKey)) {
      topDocs.set(part.partKey, {
        partKey: part.partKey,
        title: part.title,
        publisher: publisherOf(part.partKey),
        publicationType: 'internationalStandard',
        clauseCount: 0,
        termCount: partEntryCount(part.partKey),
        id: `iso80000-${part.partKey}`,
        link: `/documents/part-${part.partKey}`,
      })
    }
  }

  // Add parent documents for sections/sub-parts (Part 2, Part 11) if not already present
  const parentParts = new Set<string>()
  for (const part of getAllParts()) {
    if (part.parentPart) parentParts.add(part.parentPart)
    if (part.partKey.includes('-')) parentParts.add(part.partKey.split('-')[0])
  }
  for (const pk of parentParts) {
    if (topDocs.has(pk)) continue
    const partMeta = getPartMeta(pk)
    // Aggregate term counts from all sub-parts
    const subParts = getAllParts().filter(p => p.parentPart === pk || p.partKey.startsWith(pk + '-'))
    const totalTerms = subParts.reduce((s, p) => s + partEntryCount(p.partKey), 0)
    const domain = subParts[0]?.domain === 'math' ? '/math' : '/quantities'
    const knownTitles: Record<string, string> = { '2': 'Mathematical Notation', '11': 'Characteristic Numbers' }
    topDocs.set(pk, {
      partKey: pk,
      title: partMeta?.title || knownTitles[pk] || `Part ${pk}`,
      publisher: publisherOf(pk),
      publicationType: 'internationalStandard',
      clauseCount: subParts.length,
      termCount: totalTerms,
      id: `iso80000-${pk}`,
      link: `/documents/part-${pk}`,
    })
  }

  // Sort by part key numerically
  return [...topDocs.values()].sort((a, b) => {
    const na = parseInt(a.partKey, 10)
    const nb = parseInt(b.partKey, 10)
    return na - nb
  })
})

const totalTerms = computed(() => docs.value.reduce((s, d) => s + d.termCount, 0))
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-sky-950 via-brand-900 to-indigo-950">
      <div class="absolute inset-0 hero-pattern" />
      <div class="grain-overlay absolute inset-0" />
      <div class="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 bg-brand-500/10" />
      <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-brand-400/20" />
      <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />
      <div class="hero-float-4 absolute top-[20%] left-[5%] w-16 h-16 rounded-full border border-white/[0.04]" />
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div class="max-w-3xl page-enter">
          <div class="flex items-center gap-2 text-xs text-brand-300/60 mb-5">
            <router-link to="/" class="hover:text-brand-200 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </div>
          <div class="flex items-end gap-5 flex-wrap">
            <div>
              <div class="text-3xl mb-2">📚</div>
              <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif">Publications</h1>
              <p class="mt-2 text-sm leading-relaxed max-w-xl text-brand-300/80">
                {{ docs.length }} parts of ISO &amp; IEC 80000, published by ISO and IEC. Each part is a separate international standard.
              </p>
            </div>
            <div class="flex gap-2 ml-auto flex-shrink-0 mb-1">
              <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ docs.length }}</span>
                <span class="text-xs ml-1 text-brand-300/70">parts</span>
              </div>
              <div class="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                <span class="text-lg font-bold text-white heading-serif tabular-nums">{{ totalTerms.toLocaleString() }}</span>
                <span class="text-xs ml-1 text-brand-300/70">entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="grid gap-3">
        <router-link
          v-for="doc in docs"
          :key="doc.partKey"
          :to="doc.link"
          class="group flex items-center gap-5 px-5 py-4 rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
        >
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400 text-sm font-bold">
            {{ doc.partKey }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ doc.title }}</span>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-dark-700 px-2 py-0.5 rounded">{{ doc.publisher }}</span>
            </div>
            <div class="mt-1 flex gap-4 text-xs text-slate-400 dark:text-slate-500">
              <span v-if="doc.edition">Edition {{ doc.edition }}</span>
              <span>{{ doc.clauseCount }} clauses</span>
              <span>{{ doc.termCount }} entries</span>
            </div>
          </div>
          <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>
    </section>
  </div>
</template>
