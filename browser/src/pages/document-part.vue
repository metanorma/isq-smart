<script setup lang="ts">
import { computed } from 'vue'
import { partIntros, type PartIntro } from '../data/aboutParts'
import { getPartMeta, partUrl, partEntryCount } from '../data/index'
import { getAllParts } from '../data/PartRegistry'
import type { PartMeta } from '../data/types'

const props = defineProps<{ part: string }>()

const intro = computed<PartIntro | undefined>(() => partIntros[props.part])
const meta = computed<PartMeta | undefined>(() => {
  const direct = getPartMeta(props.part)
  if (direct) return direct
  // Parent parts like "2" and "11" have no direct entry — synthesize from sub-parts
  const sub = getAllParts().find(p => p.parentPart === props.part || p.partKey.startsWith(props.part + '-'))
  if (!sub) return undefined
  return {
    domain: sub.domain,
    partKey: props.part,
    title: sub.parentTitle ?? intro.value?.title ?? `Part ${props.part}`,
    description: intro.value?.scope ?? '',
    icon: sub.icon,
    accent: sub.accent,
    parentPart: undefined,
  }
})
const entryCount = computed(() => partEntryCount(props.part))
const browseUrl = computed(() => {
  const url = partUrl(props.part as any)
  if (url !== '/') return url
  return meta.value?.domain === 'math' ? '/math' : '/quantities'
})

const publisherBadge = computed(() => {
  if (!intro.value) return { bg: 'bg-brand-50 dark:bg-brand-950/50', text: 'text-brand-600 dark:text-brand-400' }
  return intro.value.publisher === 'IEC'
    ? { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' }
    : { bg: 'bg-brand-50 dark:bg-brand-950/50', text: 'text-brand-600 dark:text-brand-400' }
})
</script>

<template>
  <div v-if="intro && meta">
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-navy-950">
      <div class="absolute inset-0 hero-pattern" />
      <div class="grain-overlay absolute inset-0" />
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

      <div class="hero-float-1 absolute top-[15%] right-[18%] w-3 h-3 rounded-full bg-brand-400/20" />
      <div class="hero-float-2 absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-white/10" />

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 page-enter">
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 text-xs text-brand-300/60 mb-6">
            <router-link to="/" class="hover:text-brand-200 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link to="/documents" class="hover:text-brand-200 transition-colors">Documents</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <div class="text-3xl">{{ meta.icon }}</div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" :class="publisherBadge.bg + ' ' + publisherBadge.text">
                  {{ intro.publisher }}
                </span>
                <span class="text-xs text-brand-300/50">{{ intro.edition }}</span>
              </div>
              <h1 class="text-3xl sm:text-4xl font-bold text-white tracking-tight heading-serif leading-tight">
                Part {{ intro.partKey }}: {{ intro.title }}
              </h1>
            </div>
          </div>
          <p class="mt-3 text-sm text-brand-200/60 leading-relaxed">
            {{ intro.publisher === 'IEC' ? 'IEC' : 'ISO' }} 80000-{{ intro.partKey }}
            <template v-if="intro.bilingual"> · Bilingual EN/FR</template>
          </p>
        </div>
      </div>
      <div class="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 dark:from-dark-950 to-transparent z-10" />
    </section>

    <!-- Scope -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="max-w-3xl">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-4">Scope</h2>
        <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">{{ intro.scope }}</p>
      </div>
    </section>

    <!-- Key Highlights -->
    <section class="bg-slate-50/50 dark:bg-dark-900/50 border-y border-slate-200/50 dark:border-dark-600/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-6">What You'll Find</h2>
        <div class="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div v-for="(h, i) in intro.highlights" :key="i" class="p-4 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 dark:border-brand-700/60 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5">{{ i + 1 }}</div>
              <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ h }}</p>
            </div>
          </div>
        </div>
        <div v-if="intro.note" class="mt-6 p-4 rounded-xl bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200/40 dark:border-brand-800/40 max-w-3xl">
          <p class="text-xs text-brand-700/80 dark:text-brand-300/80 leading-relaxed">{{ intro.note }}</p>
        </div>
      </div>
    </section>

    <!-- Obtain the standard -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="max-w-3xl">
        <div class="p-6 rounded-2xl border" :class="intro.publisher === 'IEC' ? 'bg-red-50/30 dark:bg-red-950/10 border-red-200/50 dark:border-red-800/30' : 'bg-brand-50/30 dark:bg-brand-950/10 border-brand-200/50 dark:border-brand-800/30'">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <img v-if="intro.publisher === 'IEC'" src="/img/logo-iec.svg" alt="IEC" class="h-10 w-auto rounded" />
              <img v-else src="/img/logo-iso.svg" alt="ISO" class="h-10 w-auto rounded" />
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 heading-serif mb-1">Obtain the Standard</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Published by {{ intro.publisher === 'IEC' ? 'the International Electrotechnical Commission (IEC)' : 'the International Organization for Standardization (ISO)' }}.
                Edition {{ intro.edition }}.
                Developed by {{ intro.publisher === 'IEC' ? 'IEC/TC 25' : 'ISO/TC 12' }} — Quantities and units.
              </p>
              <div class="mt-4 flex flex-wrap gap-3">
                <a :href="intro.storeUrl" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors shadow-sm" :class="intro.publisher === 'IEC' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'">
                  {{ intro.publisher === 'IEC' ? 'IEC Webstore' : 'ISO Store' }}
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Browse entries -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif mb-1">Browse Entries</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ entryCount }} {{ meta.domain === 'math' ? 'symbols' : 'quantities' }} defined in Part {{ intro.partKey }}
          </p>
        </div>
        <router-link :to="browseUrl" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-600/25">
          View All Entries
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
        </router-link>
      </div>
    </section>

    <!-- All parts nav -->
    <section class="border-t border-slate-200/60 dark:border-dark-600/60 bg-slate-50/30 dark:bg-dark-900/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">All Parts</h3>
        <div class="flex flex-wrap gap-2">
          <router-link
            v-for="(_p, key) in partIntros"
            :key="key"
            :to="`/documents/part-${key}`"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="String(key) === props.part
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 text-slate-500 dark:text-slate-400 hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400'"
          >
            Part {{ key }}
          </router-link>
        </div>
      </div>
    </section>
  </div>

  <!-- 404 -->
  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif mb-2">Part Not Found</h1>
    <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">No introduction is available for this part yet.</p>
    <router-link to="/about" class="text-brand-600 dark:text-brand-400 text-sm font-medium hover:text-brand-700 dark:hover:text-brand-300">Back to Documents</router-link>
  </div>
</template>
