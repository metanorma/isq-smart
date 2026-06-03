<script setup lang="ts">
import { SiteConfig } from '../site.config'
import { computed } from 'vue'
import { publicationDocuments, clauses } from '../data/generated/iso80000'
import { termEntries } from '../data/generated/iso80000-terms'
import type { ClauseData, TermEntryData } from '../data/types'
import { getPartMeta, getPartDocument, partUrl, publisherOf } from '../data/PartRegistry'

const props = defineProps<{ id: string }>()

const doc = computed(() => publicationDocuments.find(d => d.id === props.id))
const docClauses = computed(() => clauses.filter((c: ClauseData) => c.parentId === props.id))
const docTerms = computed(() => termEntries.filter((t: TermEntryData) => t.publicationDocument === props.id))
const meta = computed(() => doc.value ? getPartMeta(doc.value.partKey) : undefined)
const publisher = computed(() => doc.value ? publisherOf(doc.value.partKey) : 'ISO')
const partDoc = computed(() => doc.value ? getPartDocument(doc.value.partKey) : undefined)
const isIEC = computed(() => publisher.value === 'IEC')
</script>

<template>
  <div>
    <template v-if="doc">
      <!-- Breadcrumb -->
      <section class="border-b border-slate-200/60 dark:border-dark-600/60 bg-slate-50/30 dark:bg-dark-900/30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <router-link to="/" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link to="/documents" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Documents</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <span class="text-slate-600 dark:text-slate-300 font-medium">{{ doc.title }}</span>
          </div>
        </div>
      </section>

      <!-- Document header -->
      <section class="border-b border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900"
        :class="isIEC ? 'border-l-4 border-l-iec-500' : 'border-l-4 border-l-brand-500'"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border"
              :class="isIEC
                ? 'bg-iec-50 dark:bg-iec-950/50 border-iec-200/60 dark:border-iec-800/40'
                : 'bg-brand-50 dark:bg-brand-950/50 border-brand-200/60 dark:border-brand-800/40'"
            >
              <img
                :src="SiteConfig.asset(isIEC ? '/img/logo-iec.svg' : '/img/logo-iso.svg')"
                :alt="publisher"
                class="h-7 w-auto"
              />
            </div>
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif">{{ doc.title }}</h1>
              <div class="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span class="font-mono px-2 py-0.5 rounded"
                  :class="isIEC
                    ? 'text-iec-700 dark:text-iec-400 bg-iec-50 dark:bg-iec-950/40'
                    : 'text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'"
                >Part {{ doc.partKey }}</span>
                <span class="px-2 py-0.5 rounded font-medium"
                  :class="isIEC
                    ? 'text-iec-600 dark:text-iec-400 bg-iec-50 dark:bg-iec-950/40 border border-iec-200/60 dark:border-iec-800/40'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-dark-700'"
                >{{ publisher }}</span>
                <span v-if="doc.edition || partDoc?.edition">Edition {{ doc.edition || partDoc?.edition }}</span>
                <span class="capitalize">{{ doc.publicationType.replace(/([A-Z])/g, ' $1').trim() }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div class="px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 text-center">
              <div class="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{{ docTerms.length }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Terms</div>
            </div>
            <div class="px-4 py-3 rounded-xl border text-center"
              :class="isIEC
                ? 'bg-iec-50 dark:bg-iec-950/30 border-iec-200/60 dark:border-iec-800/40'
                : 'bg-brand-50 dark:bg-brand-950/30 border-brand-200/60 dark:border-brand-800/40'"
            >
              <div class="text-2xl font-bold tabular-nums"
                :class="isIEC ? 'text-iec-700 dark:text-iec-400' : 'text-brand-700 dark:text-brand-400'"
              >{{ doc.partKey }}</div>
              <div class="text-xs mt-1"
                :class="isIEC ? 'text-iec-600 dark:text-iec-400' : 'text-brand-600 dark:text-brand-400'"
              >Part Key</div>
            </div>
            <div v-if="partDoc?.storeUrl" class="hidden sm:block px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 text-center">
              <a :href="partDoc.storeUrl" target="_blank" rel="noopener"
                class="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >Official store &nearr;</a>
              <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">Publisher</div>
            </div>
          </div>

          <div class="mt-4">
            <router-link :to="partUrl(doc.partKey)" class="text-sm font-medium transition-colors"
              :class="isIEC ? 'text-iec-600 dark:text-iec-400 hover:text-iec-700 dark:hover:text-iec-300' : 'text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300'"
            >
              Browse entries in Part {{ doc.partKey }} &rarr;
            </router-link>
          </div>
        </div>
      </section>

      <!-- Clauses -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-4">Clauses</h2>
        <div v-if="docClauses.length" class="space-y-2">
          <router-link
            v-for="clause in docClauses"
            :key="clause.id"
            :to="`/documents/${doc.partKey}/sections`"
            class="group flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:shadow-sm transition-all"
            :class="isIEC ? 'hover:border-iec-200 dark:hover:border-iec-700' : 'hover:border-brand-200 dark:hover:border-brand-700'"
          >
            <span class="text-xs font-semibold px-2 py-0.5 rounded font-mono"
              :class="isIEC
                ? 'text-iec-600 dark:text-iec-400 bg-iec-50 dark:bg-iec-950/40'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'"
            >{{ clause.sectionNumber }}</span>
            <span class="text-sm text-slate-700 dark:text-slate-300 transition-colors"
              :class="isIEC ? 'group-hover:text-iec-600 dark:group-hover:text-iec-400' : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'"
            >{{ clause.title }}</span>
            <span class="ml-auto text-[10px] text-slate-400 dark:text-slate-500 capitalize px-2 py-0.5 bg-slate-50 dark:bg-dark-700 rounded">{{ clause.bindingnessType }}</span>
            <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 transition-all flex-shrink-0"
              :class="isIEC ? 'group-hover:text-iec-500 dark:group-hover:text-iec-400' : 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400'"
              fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </router-link>
        </div>
        <div v-else class="text-sm text-slate-400 dark:text-slate-500 py-4">No clause data available.</div>
      </section>

      <!-- Terms -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-4">Term Entries ({{ docTerms.length }})</h2>
        <div v-if="docTerms.length" class="space-y-px">
          <router-link
            v-for="term in docTerms"
            :key="term.id"
            :to="`/quantities/part-${term.partKey}/${term.id.replace('term-entry-', '')}`"
            class="group flex items-center gap-3 px-4 py-2.5 rounded-lg border border-transparent dark:border-transparent hover:bg-white dark:hover:bg-dark-800/80 transition-colors"
          >
            <span class="flex-shrink-0 w-16">
              <span class="font-mono text-[11px] font-semibold px-2 py-0.5 rounded"
                :class="isIEC
                  ? 'text-iec-700 dark:text-iec-400 bg-iec-50/80 dark:bg-iec-950/40'
                  : 'text-brand-700 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/40'"
              >{{ term.num }}</span>
            </span>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {{ term.designations[0]?.designation?.en?.text ?? term.id }}
              </span>
              <template v-if="term.units?.length">
                <span class="text-slate-300 dark:text-slate-600 mx-2">&middot;</span>
                <span class="font-mono text-xs text-brand-600">{{ term.units.map((u: { en: string; symbol?: string[] }) => u.symbol?.join('') ?? u.en).join(', ') }}</span>
              </template>
            </div>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 capitalize px-2 py-0.5 bg-slate-50 dark:bg-dark-700 rounded">{{ term.bindingnessType }}</span>
          </router-link>
        </div>
        <div v-else class="text-sm text-slate-400 dark:text-slate-500 py-4">No term entries available.</div>
      </section>
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Document not found</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400 text-sm">No document with ID "{{ id }}" was found.</p>
      <router-link to="/documents" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        Back to Documents
      </router-link>
    </div>
  </div>
</template>
