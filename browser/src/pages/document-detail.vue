<script setup lang="ts">
import { computed } from 'vue'
import { publicationDocuments, clauses, termEntries } from '../data/generated/iso80000'
import type { ClauseData, TermEntryData } from '../data/types'
import { getPartMeta, partUrl } from '../data/PartRegistry'

const props = defineProps<{ id: string }>()

const doc = computed(() => publicationDocuments.find(d => d.id === props.id))
const docClauses = computed(() => clauses.filter((c: ClauseData) => c.parentId === props.id))
const docTerms = computed(() => termEntries.filter((t: TermEntryData) => t.publicationDocument === props.id))
const meta = computed(() => doc.value ? getPartMeta(doc.value.partKey) : undefined)
</script>

<template>
  <div>
    <template v-if="doc">
      <!-- Breadcrumb -->
      <section class="border-b border-slate-200/60 bg-slate-50/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <router-link to="/" class="hover:text-brand-600 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link to="/ontology" class="hover:text-brand-600 transition-colors">SMART Model</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link to="/documents" class="hover:text-brand-600 transition-colors">Documents</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <span class="text-slate-600 font-medium">{{ doc.title }}</span>
          </div>
        </div>
      </section>

      <!-- Document header -->
      <section class="border-b border-slate-200/60 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-start gap-4">
            <div v-if="meta" class="text-3xl">{{ meta.icon }}</div>
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight heading-serif">{{ doc.title }}</h1>
              <div class="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                <span class="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded">Part {{ doc.partKey }}</span>
                <span>{{ doc.publisher }}</span>
                <span v-if="doc.edition">Edition {{ doc.edition }}</span>
                <span class="capitalize">{{ doc.publicationType.replace(/([A-Z])/g, ' $1').trim() }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
              <div class="text-2xl font-bold text-slate-900 tabular-nums">{{ docClauses.length }}</div>
              <div class="text-xs text-slate-500 mt-1">Clauses</div>
            </div>
            <div class="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
              <div class="text-2xl font-bold text-slate-900 tabular-nums">{{ docTerms.length }}</div>
              <div class="text-xs text-slate-500 mt-1">Terms</div>
            </div>
            <div class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-center">
              <div class="text-2xl font-bold text-emerald-700">{{ doc.partKey }}</div>
              <div class="text-xs text-emerald-600 mt-1">Part Key</div>
            </div>
          </div>

          <div class="mt-4">
            <router-link :to="partUrl(doc.partKey)" class="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
              Browse entries in Part {{ doc.partKey }} →
            </router-link>
          </div>
        </div>
      </section>

      <!-- Clauses -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-lg font-bold text-slate-900 tracking-tight heading-serif mb-4">Clauses</h2>
        <div v-if="docClauses.length" class="space-y-2">
          <router-link
            v-for="clause in docClauses"
            :key="clause.id"
            :to="`/documents/${doc.partKey}/sections`"
            class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200/60 bg-white hover:border-emerald-200 hover:shadow-sm transition-all"
          >
            <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">{{ clause.sectionNumber }}</span>
            <span class="text-sm text-slate-700 group-hover:text-emerald-600 transition-colors">{{ clause.title }}</span>
            <span class="ml-auto text-[10px] text-slate-400 capitalize px-2 py-0.5 bg-slate-50 rounded">{{ clause.bindingnessType }}</span>
            <svg class="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </router-link>
        </div>
        <div v-else class="text-sm text-slate-400 py-4">No clause data available.</div>
      </section>

      <!-- Terms -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 class="text-lg font-bold text-slate-900 tracking-tight heading-serif mb-4">Term Entries ({{ docTerms.length }})</h2>
        <div v-if="docTerms.length" class="space-y-px">
          <router-link
            v-for="term in docTerms"
            :key="term.id"
            :to="`/quantities/part-${term.partKey}/${term.id.replace('term-entry-', '')}`"
            class="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-transparent hover:bg-white transition-colors"
          >
            <span class="flex-shrink-0 w-16">
              <span class="font-mono text-[11px] font-semibold text-brand-700 bg-brand-50/80 px-2 py-0.5 rounded">{{ term.num }}</span>
            </span>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                {{ term.designations[0]?.designation?.en?.text ?? term.id }}
              </span>
              <template v-if="term.units?.length">
                <span class="text-slate-300 mx-2">·</span>
                <span class="font-mono text-xs text-brand-600">{{ term.units.map((u: { en: string; symbol?: string[] }) => u.symbol?.join('') ?? u.en).join(', ') }}</span>
              </template>
            </div>
            <span class="text-[10px] text-slate-400 capitalize px-2 py-0.5 bg-slate-50 rounded">{{ term.bindingnessType }}</span>
          </router-link>
        </div>
        <div v-else class="text-sm text-slate-400 py-4">No term entries available.</div>
      </section>
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 class="text-2xl font-bold text-slate-900 heading-serif">Document not found</h1>
      <p class="mt-2 text-slate-500 text-sm">No document with ID "{{ id }}" was found.</p>
      <router-link to="/documents" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        Back to Documents
      </router-link>
    </div>
  </div>
</template>
