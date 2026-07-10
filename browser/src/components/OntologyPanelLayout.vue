<script setup lang="ts">
import type { OntEntity, PropertyRow } from '../composables/useOntology'
import { relatedBadgeColor } from '../composables/useOntology'

defineProps<{
  classEntity?: OntEntity
  hierarchy: OntEntity[]
  shapes: OntEntity[]
  instanceIri: string
  instanceColor: string
  propertyTable: PropertyRow[]
  related: { qname: string; slug: string; link?: string }[]
}>()
</script>

<template>
  <div class="mb-12">
    <!-- Header -->
    <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-4">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
      Ontology
      <slot name="header-badges" />
    </h2>

    <div class="space-y-4">
      <!-- Class hierarchy -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Class Hierarchy</h3>
        </div>
        <div class="p-4">
          <div class="flex items-center gap-1.5 flex-wrap font-mono text-xs">
            <template v-for="(cls, i) in hierarchy" :key="cls.qname">
              <a
                v-if="i < hierarchy.length - 1"
                :href="`/ontology/${cls.slug}`"
                class="text-brand-600 dark:text-brand-400 hover:underline"
              >{{ cls.qname }}</a>
              <span v-else class="font-bold text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded" :class="instanceColor">{{ cls.qname }}</span>
              <svg v-if="i < hierarchy.length - 1" class="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </template>
          </div>
          <p v-if="classEntity?.description" class="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ classEntity.description }}</p>
        </div>
      </div>

      <!-- Instance IRI -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Instance IRI</h3>
        </div>
        <div class="p-4">
          <slot name="instance-iri">
            <code class="text-xs px-2 py-1 rounded break-all" :class="instanceColor">{{ instanceIri }}</code>
          </slot>
        </div>
      </div>

      <!-- Properties table -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60 flex items-center justify-between">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Properties</h3>
          <div class="flex items-center gap-1.5">
            <span v-for="shape in shapes" :key="shape.qname" class="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-800/40">
              <a :href="`/ontology/${shape.slug}`" class="hover:underline" @click.stop>{{ shape.qname }}</a>
            </span>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-dark-700/50 border-b border-slate-200/60 dark:border-dark-600/60">
                <th class="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400 w-48">Property</th>
                <th class="text-left px-4 py-2 font-semibold text-slate-500 dark:text-slate-400">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in propertyTable" :key="row.path" class="border-b border-slate-100/60 dark:border-dark-700/40 last:border-0 hover:bg-slate-50/30 dark:hover:bg-dark-700/30 transition-colors">
                <td class="px-4 py-2">
                  <a v-if="row.pathSlug" :href="`/ontology/${row.pathSlug}`" class="font-mono text-brand-600 dark:text-brand-400 hover:underline">{{ row.path }}</a>
                  <span v-else class="font-mono text-slate-600 dark:text-slate-400">{{ row.path }}</span>
                </td>
                <td class="px-4 py-2">
                  <div class="flex flex-wrap gap-1.5">
                    <template v-for="(v, vi) in row.values" :key="vi">
                      <a v-if="v.link && v.link.startsWith('http')" :href="v.link" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 text-brand-600 dark:text-brand-400 hover:underline transition-colors break-all">
                        {{ v.label.length > 80 ? v.label.slice(0, 77) + '…' : v.label }}
                        <svg class="w-2.5 h-2.5 flex-shrink-0 opacity-40" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                      <a
                        v-else-if="v.link"
                        :href="v.link"
                        class="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-dark-700 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >{{ v.label }}</a>
                      <span v-else class="text-slate-600 dark:text-slate-400">{{ v.label }}</span>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Related entities -->
      <div class="rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 overflow-hidden">
        <div class="px-4 py-2.5 bg-slate-50/80 dark:bg-dark-700/80 border-b border-slate-200/60 dark:border-dark-600/60">
          <h3 class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em]">Related Entities</h3>
        </div>
        <div class="p-4 flex flex-wrap gap-2">
          <!-- SHACL Shapes -->
          <a
            v-for="shape in shapes"
            :key="shape.qname"
            :href="`/ontology/${shape.slug}`"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors inline-flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {{ shape.qname }}
          </a>
          <!-- Dynamic related entities -->
          <a
            v-for="rel in related"
            :key="rel.qname"
            :href="rel.link ?? `/ontology/${rel.slug}`"
            class="text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors inline-flex items-center gap-1.5"
            :class="[relatedBadgeColor(rel.qname).border, relatedBadgeColor(rel.qname).bg, relatedBadgeColor(rel.qname).text, 'hover:opacity-80']"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="relatedBadgeColor(rel.qname).dot"></span>
            {{ rel.qname }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
