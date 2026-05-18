<script setup lang="ts">
import { computed } from 'vue'
import { sections } from '../data/generated/sections'
import type { DocumentSection } from '../data/types'
import { getPartMeta } from '../data/PartRegistry'

const props = defineProps<{ partKey: string }>()

const meta = computed(() => getPartMeta(props.partKey))
const partSections = computed(() => sections.filter((s: DocumentSection) => s.partKey === props.partKey))

const typeLabels: Record<string, string> = {
  scope: 'Scope',
  'normative-references': 'Normative References',
  terms: 'Terms & Definitions',
  definitions: 'Definitions',
  foreword: 'Foreword',
  introduction: 'Introduction',
  bibliography: 'Bibliography',
  normative: 'Normative',
  informative: 'Informative',
}

const typeColors: Record<string, string> = {
  scope: 'bg-blue-50 text-blue-600',
  'normative-references': 'bg-purple-50 text-purple-600',
  terms: 'bg-emerald-50 text-emerald-600',
  definitions: 'bg-emerald-50 text-emerald-600',
  foreword: 'bg-slate-50 text-slate-600',
  introduction: 'bg-slate-50 text-slate-600',
  bibliography: 'bg-slate-50 text-slate-600',
  normative: 'bg-brand-50 text-brand-600',
  informative: 'bg-amber-50 text-amber-600',
}
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <section class="border-b border-slate-200/60 dark:border-dark-600/60 bg-slate-50/30 dark:bg-dark-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <router-link to="/" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</router-link>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          <span class="text-slate-600 dark:text-slate-300 font-medium">Part {{ partKey }} Sections</span>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-start gap-4 mb-8">
        <span v-if="meta" class="text-3xl">{{ meta.icon }}</span>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif">
            {{ meta ? `Part ${partKey}: ${meta.title}` : `Part ${partKey}` }} — Document Sections
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ partSections.length }} sections found</p>
        </div>
      </div>

      <div v-if="partSections.length" class="space-y-2">
        <router-link
          v-for="section in partSections"
          :key="section.id"
          :to="`/documents/${partKey}/${section.id}`"
          class="group flex items-center gap-4 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
        >
          <span class="text-xs font-medium px-2 py-0.5 rounded" :class="typeColors[section.clauseType] ?? 'bg-slate-50 text-slate-600'">
            {{ typeLabels[section.clauseType] ?? section.clauseType }}
          </span>
          <div class="flex-1 min-w-0">
            <span class="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ section.title || section.filename }}</span>
            <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{{ section.filename }}</div>
          </div>
          <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>

      <div v-else class="py-16 text-center">
        <p class="text-slate-500 dark:text-slate-400 text-sm">No document sections found for Part {{ partKey }}</p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Section data is discovered from AsciiDoc sources at build time.</p>
      </div>
    </section>
  </div>
</template>
