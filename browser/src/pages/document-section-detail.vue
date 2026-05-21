<script setup lang="ts">
import { computed } from 'vue'
import { sections } from '../data/generated/sections'
import type { DocumentSection } from '../data/types'
import { getPartMeta } from '../data/PartRegistry'

const props = defineProps<{ partKey: string; sectionId: string }>()

const meta = computed(() => getPartMeta(props.partKey))
const section = computed(() => sections.find((s: DocumentSection) => s.id === props.sectionId))
const partSections = computed(() => sections.filter((s: DocumentSection) => s.partKey === props.partKey))

const sectionIndex = computed(() => {
  if (!section.value) return -1
  return partSections.value.findIndex(s => s.id === props.sectionId)
})
const prevSection = computed(() => sectionIndex.value > 0 ? partSections.value[sectionIndex.value - 1] : null)
const nextSection = computed(() => sectionIndex.value < partSections.value.length - 1 ? partSections.value[sectionIndex.value + 1] : null)
</script>

<template>
  <div>
    <template v-if="section">
      <!-- Breadcrumb -->
      <section class="border-b border-slate-200/60 dark:border-dark-600/60 bg-slate-50/30 dark:bg-dark-900/30">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <router-link to="/" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link to="/documents" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Documents</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link :to="`/documents/${partKey}/sections`" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Part {{ partKey }}</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <span class="text-slate-600 dark:text-slate-300 font-medium">{{ section.title || section.filename }}</span>
          </div>
        </div>
      </section>

      <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-2">{{ section.title || section.filename }}</h1>
        <div class="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-8">
          <span class="capitalize px-2 py-0.5 bg-slate-50 dark:bg-dark-700 rounded">{{ section.clauseType }}</span>
          <span>{{ section.filename }}</span>
        </div>

        <!-- AsciiDoc content -->
        <div class="rounded-2xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
          <div class="p-6 sm:p-8">
            <pre class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">{{ section.content }}</pre>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-8 flex items-center justify-between gap-4">
          <router-link
            v-if="prevSection"
            :to="`/documents/${partKey}/sections/${prevSection.id}`"
            class="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-sm"
          >
            <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M15 19l-7-7 7-7"/></svg>
            <span class="text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ prevSection.title || prevSection.filename }}</span>
          </router-link>
          <div v-else />

          <router-link
            v-if="nextSection"
            :to="`/documents/${partKey}/sections/${nextSection.id}`"
            class="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/70 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-sm"
          >
            <span class="text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ nextSection.title || nextSection.filename }}</span>
            <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </router-link>
          <div v-else />
        </nav>
      </section>
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Section not found</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400 text-sm">No section with ID "{{ sectionId }}" was found in Part {{ partKey }}.</p>
      <router-link :to="`/documents/${partKey}/sections`" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        Back to Part {{ partKey }} Sections
      </router-link>
    </div>
  </div>
</template>
