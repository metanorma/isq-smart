<script setup lang="ts">
import { computed } from 'vue'
import { partUrl, EntryModel, getPartEntryCount } from '../data/index'
import MathRenderer from '../components/MathRenderer.vue'
import LanguageToggle from '../components/LanguageToggle.vue'
import JsonLd from '../components/JsonLd.vue'
import ReferenceBadge from '../components/ReferenceBadge.vue'
import JsonLdActions from '../components/JsonLdActions.vue'
import CitationBuilder from '../components/CitationBuilder.vue'
import PartIcon from '../components/PartIcon.vue'
import EntryOntologyPanel from '../components/EntryOntologyPanel.vue'
import { accentGlow, accentGradient, accentColors, accentHeaderBg } from '../composables/useAccent'
import { useEntryPage } from '../composables/useEntryPage'

const {
  partParam, idParam, domainRoute,
  meta, bilingual, editions, edition,
  entries, mathCache, latexCache, loading, initialPromise,
  lang, entry, jsonLdData, dualUrn,
  siblings, sectionEntries, sectionLabel,
  referencedBy, unitLink,
  def, rem, showBoth, activeLang, renderedName, desText, stripStem,
  handleDefClick,
} = useEntryPage()

await initialPromise

function symbolGlow() {
  if (!meta.value) return {}
  const { from } = accentColors(meta.value)
  return { boxShadow: `0 0 32px ${from}18, 0 0 64px ${from}0a` }
}

function heroGlow() {
  return meta.value ? accentGlow(meta.value, 0.05, 180) : {}
}

function defAccent() {
  if (!meta.value) return { background: accentGradient({ accent: 'blue', partKey: '0', domain: 'quantities', title: '', description: '', icon: '' }) }
  return { background: accentGradient(meta.value, 160) }
}

function showcasePattern() {
  if (!meta.value) return {}
  const { from } = accentColors(meta.value)
  return {
    backgroundImage: `radial-gradient(circle 1px at center, ${from}08 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  }
}
</script>

<template>
  <div>
    <template v-if="meta">
      <!-- Breadcrumb -->
      <section class="border-b border-slate-200/60 dark:border-dark-600/60 bg-slate-50/30 dark:bg-dark-800/30">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <router-link to="/" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link :to="domainRoute === 'math' ? '/math' : '/quantities'" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{{ domainRoute === 'math' ? 'Math' : 'Quantities' }}</router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <router-link :to="partUrl(partParam)" class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5">
              <PartIcon v-if="meta" :part="meta" size="sm" class="!w-5 !h-5 !text-[10px] !rounded" />
              {{ meta && meta.parentPart ? `Part ${meta.parentPart} §${partParam.split('-')[1]}` : `Part ${partParam}` }}
            </router-link>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            <span v-if="entry" class="text-slate-600 dark:text-slate-300 font-mono font-medium">{{ entry.num }}</span>
          </div>
        </div>
      </section>

      <!-- Part context -->
      <section v-if="meta" class="border-b border-slate-200/40 dark:border-dark-600/40" :style="accentHeaderBg(meta)">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div class="flex items-center gap-3">
            <router-link :to="partUrl(partParam)" class="group flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              <PartIcon :part="meta" size="sm" class="!w-7 !h-7 !text-sm !rounded-lg" />
              <span>
                <span class="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ meta.parentPart ? `Part ${meta.parentPart} §${partParam.split('-')[1]}` : `Part ${partParam}` }}: {{ meta.title }}</span>
                <span class="text-slate-400 dark:text-slate-500 mx-1">·</span>
                <span class="tabular-nums">{{ getPartEntryCount(partParam) }} entries</span>
              </span>
            </router-link>
          </div>
        </div>
      </section>

      <!-- Loading -->
      <section v-if="loading || !entry" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="animate-pulse space-y-8">
          <div class="flex items-center gap-3">
            <div class="w-20 h-8 bg-slate-100 dark:bg-dark-700 rounded-lg" />
            <div class="h-8 bg-slate-100 dark:bg-dark-700 rounded w-2/3" />
          </div>
          <div class="h-28 bg-slate-100 dark:bg-dark-700 rounded-2xl" />
          <div class="h-20 bg-slate-100 dark:bg-dark-700 rounded-2xl w-1/2" />
        </div>
      </section>

      <!-- Entry content -->
      <section v-else class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 page-enter">
        <div class="absolute top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none -z-10" :style="heroGlow()" />
        <div class="accent-orb w-[300px] h-[300px] -top-20 -left-32 -z-10" :style="{ background: meta ? accentColors(meta).from + '08' : 'transparent' }" />
        <div class="accent-orb w-[200px] h-[200px] bottom-40 right-0 -z-10" style="animation-delay: -3s" :style="{ background: meta ? accentColors(meta).from + '06' : 'transparent' }" />

        <!-- Top bar -->
        <div class="flex items-center gap-3 mb-8">
          <LanguageToggle v-if="bilingual" v-model="lang" />
          <span class="text-xs text-slate-400 dark:text-slate-500 ml-auto font-mono tabular-nums">{{ siblings.idx }} / {{ siblings.total }}</span>
        </div>

        <!-- In this section -->
        <div v-if="sectionEntries.length > 1" class="mb-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Section {{ sectionLabel }}</span>
            <span class="text-[10px] text-slate-300 dark:text-slate-600 tabular-nums">{{ sectionEntries.length }} entries</span>
          </div>
          <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <router-link
              v-for="se in sectionEntries"
              :key="se.id"
              :to="`${partUrl(partParam)}/${se.id}`"
              class="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-all"
              :class="se.id === entry.id
                ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                : 'bg-white dark:bg-dark-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-brand-200 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-400'"
            >
              <span class="font-mono font-medium">{{ se.num }}</span>
              <span class="max-w-[120px] truncate hidden sm:inline">{{ EntryModel.name(se, activeLang()) }}</span>
            </router-link>
          </div>
        </div>

        <!-- Header -->
        <header class="mb-10">
          <div class="flex items-start gap-4 flex-wrap">
            <span class="font-mono text-sm font-bold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 border border-brand-100/60 dark:border-brand-800/40 px-3 py-1.5 rounded-lg mt-1">{{ entry.num }}</span>
            <div class="min-w-0 flex-1">
              <template v-if="showBoth() && EntryModel.name(entry, 'fr') && EntryModel.name(entry, 'en') !== EntryModel.name(entry, 'fr')">
                <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif leading-tight" v-html="renderedName(entry, 'en')" />
                  <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif leading-tight" v-html="renderedName(entry, 'fr')" />
                </div>
              </template>
              <h1 v-else class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight heading-serif leading-tight" v-html="renderedName(entry, activeLang())" />
            </div>
          </div>

          <!-- Identifiers -->
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <ReferenceBadge :part="partParam" :edition="edition" :entry-num="entry.num" :bilingual="bilingual" />
            <JsonLdActions v-if="jsonLdData" :data="jsonLdData" :filename="`iso80000-${entry.id}.jsonld`" />
          </div>

          <!-- Citation builder -->
          <div class="mt-3">
            <CitationBuilder :entry="entry" :meta="meta" :edition="edition" />
          </div>

          <!-- ISQ URNs -->
          <div v-if="dualUrn" class="mt-4 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-slate-50/50 dark:bg-dark-800/50 p-3">
            <div class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">ISQ Identifiers</div>
            <div class="grid sm:grid-cols-2 gap-2">
              <div>
                <div class="text-[10px] font-semibold text-brand-600 dark:text-brand-400 mb-0.5">ISO</div>
                <code class="text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all block bg-white dark:bg-dark-700 px-2 py-1.5 rounded">{{ dualUrn.iso }}</code>
              </div>
              <div>
                <div class="text-[10px] font-semibold text-teal-600 dark:text-teal-400 mb-0.5">IEC</div>
                <code class="text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all block bg-white dark:bg-dark-700 px-2 py-1.5 rounded">{{ dualUrn.iec }}</code>
              </div>
            </div>
          </div>

          <!-- Designations -->
          <div v-if="entry.designations.length > 1 || bilingual" class="mt-6">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Designations</span>
              <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
            </div>
            <div class="flex flex-wrap gap-2">
              <div v-for="(des, i) in entry.designations" :key="i" class="px-3 py-2 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 text-sm">
                <div v-if="des.designation.en" class="flex items-baseline gap-2">
                  <span class="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded flex-shrink-0">EN</span>
                  <span class="text-slate-800 dark:text-slate-200" v-html="desText(des.designation.en.text)" />
                </div>
                <div v-if="des.designation.fr" class="flex items-baseline gap-2 mt-1">
                  <span class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded flex-shrink-0">FR</span>
                  <span class="text-slate-800 dark:text-slate-200" v-html="desText(des.designation.fr.text)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Symbol showcase -->
          <div v-if="entry.symbols?.length" class="mt-8">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Symbol</span>
              <div class="flex-1 h-px bg-slate-200/60 dark:bg-dark-700/60" />
            </div>
            <div class="relative rounded-2xl border border-slate-200/50 dark:border-dark-600/50 overflow-hidden group/symbol">
              <div class="absolute inset-0 pointer-events-none" :style="showcasePattern()" />
              <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-slate-200/30 dark:ring-dark-600/30 group-hover/symbol:ring-brand-200/40 dark:group-hover/symbol:ring-brand-700/40 transition-all duration-500 pointer-events-none" />
              <div class="bg-gradient-to-br from-slate-50/80 dark:from-dark-800/80 via-white dark:via-dark-800 to-slate-50/50 dark:to-dark-800/80 p-6 sm:p-8">
                <div class="relative flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
                  <div
                    v-for="(sym, i) in entry.symbols"
                    :key="i"
                    class="symbol-card px-7 sm:px-10 py-4 sm:py-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/50 dark:border-dark-600/50 text-2xl sm:text-3xl shadow-sm hover:shadow-lg transition-all duration-300"
                    :style="symbolGlow()"
                  >
                    <MathRenderer :expression="sym" :cache="mathCache" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Notation systems -->
            <div v-if="entry.symbols?.length" class="mt-3">
              <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-3">Notation systems</div>
              <div class="grid gap-2">
                <div v-for="(sym, i) in entry.symbols" :key="i" class="flex items-baseline gap-4 px-4 py-2 rounded-lg bg-slate-50/70 dark:bg-dark-800/70 border border-slate-200/50 dark:border-dark-600/50 text-sm">
                  <div class="flex-shrink-0 w-20 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">AsciiMath</div>
                  <code class="font-mono text-slate-700 dark:text-slate-300 text-[13px]">{{ sym }}</code>
                </div>
                <template v-for="(sym, i) in entry.symbols" :key="'l'+i">
                  <div v-if="latexCache[sym]" class="flex items-baseline gap-4 px-4 py-2 rounded-lg bg-slate-50/70 dark:bg-dark-800/70 border border-slate-200/50 dark:border-dark-600/50 text-sm">
                    <div class="flex-shrink-0 w-20 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">LaTeX</div>
                    <code class="font-mono text-slate-700 dark:text-slate-300 text-[13px]">{{ latexCache[sym] }}</code>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </header>

        <!-- Definition -->
        <div class="mb-12">
          <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.351.026.622.31.802.677L12 21l2.652-5.227c.18-.366.451-.65.802-.677a42.377 42.377 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
            Definition
          </h2>
          <div class="relative rounded-2xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 overflow-hidden shadow-sm group/def">
            <div class="absolute left-0 inset-y-0 w-1.5 transition-all duration-300 group-hover/def:w-2" :style="defAccent()" />
            <div class="p-6 sm:p-8 pl-7 sm:pl-9">
              <div v-if="showBoth() && entry.def?.fr" class="grid sm:grid-cols-2 gap-8">
                <div>
                  <div class="text-[10px] font-semibold text-brand-600 uppercase tracking-[0.12em] mb-2.5">EN</div>
                  <div class="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px] sm:text-base" v-html="def(entry, 'en')" @click="handleDefClick" />
                </div>
                <div class="sm:border-l sm:pl-8 sm:border-slate-200/60 dark:sm:border-dark-600/60">
                  <div class="text-[10px] font-semibold text-amber-600 uppercase tracking-[0.12em] mb-2.5">FR</div>
                  <div class="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px] sm:text-base" v-html="def(entry, 'fr')" @click="handleDefClick" />
                </div>
              </div>
              <div v-else class="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px] sm:text-base" v-html="def(entry, activeLang())" @click="handleDefClick" />
            </div>
          </div>
        </div>

        <!-- Units (only for quantity entries) -->
        <div v-if="entry._tag === 'quantity' && entry.units?.length" class="mb-12">
          <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
            Units
          </h2>
          <div class="grid gap-3">
            <router-link
              v-for="(unit, i) in entry.units"
              :key="i"
              :to="unitLink(unit.en)"
              class="group/unit flex items-center gap-5 p-5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all"
            >
              <div class="font-mono text-brand-700 text-xl sm:text-2xl font-medium min-w-[4rem] text-center px-3 py-2 rounded-lg bg-brand-50/50 border border-brand-100/40 group-hover/unit:bg-brand-100/60 transition-colors">
                <template v-if="unit.symbol?.length">
                  <template v-for="(usym, ui) in unit.symbol" :key="ui">
                    <MathRenderer :expression="stripStem(usym)" :cache="mathCache" />
                    <span v-if="ui < unit.symbol.length - 1" class="text-brand-400 mx-1">·</span>
                  </template>
                </template>
                <span v-else>—</span>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover/unit:text-brand-600 dark:group-hover/unit:text-brand-400 transition-colors">{{ showBoth() && unit.fr ? `${unit.en} / ${unit.fr}` : (unit[activeLang()] ?? unit.en) }}</div>
                <div class="text-xs text-slate-400 mt-0.5">
                  <span class="text-brand-500">View related quantities →</span>
                </div>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Remarks -->
        <div v-if="rem(entry) || (showBoth() && rem(entry, 'fr'))" class="mb-12">
          <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
            Remarks
          </h2>
          <div class="relative rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-700/30 overflow-hidden">
            <div class="absolute left-0 inset-y-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700" />
            <div class="p-6 sm:p-8 pl-7 sm:pl-9">
              <div v-if="showBoth() && rem(entry, 'fr')" class="grid sm:grid-cols-2 gap-8">
                <div>
                  <div class="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-[0.12em] mb-2.5">EN</div>
                  <div class="text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] sm:text-base" v-html="rem(entry, 'en')" @click="handleDefClick" />
                </div>
                <div class="sm:border-l sm:pl-8 sm:border-amber-200/40 dark:sm:border-amber-700/30">
                  <div class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-[0.12em] mb-2.5">FR</div>
                  <div class="text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] sm:text-base" v-html="rem(entry, 'fr')" @click="handleDefClick" />
                </div>
              </div>
              <div v-else class="text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] sm:text-base" v-html="rem(entry, activeLang())" @click="handleDefClick" />
            </div>
          </div>
        </div>

        <!-- Referenced by -->
        <div v-if="referencedBy.length" class="mb-12">
          <h2 class="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em] mb-4">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.06a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374"/></svg>
            Referenced by
          </h2>
          <div class="flex flex-wrap gap-2">
            <router-link
              v-for="ref in referencedBy"
              :key="ref.id"
              :to="ref.href"
              class="group flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-sm"
            >
              <span class="font-medium text-slate-700 group-hover:text-brand-600 transition-colors">{{ ref.name }}</span>
            </router-link>
          </div>
        </div>

        <!-- Ontology -->
        <EntryOntologyPanel :entry="entry" :part-param="partParam" />

        <!-- Sibling navigation -->
        <nav class="mt-16 pt-8 border-t border-slate-200/60 dark:border-dark-600/60">
          <div class="hidden sm:flex items-center justify-center gap-3 text-[10px] text-slate-300 mb-4">
            <span class="flex items-center gap-1"><kbd class="bg-slate-100 dark:bg-dark-700 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-dark-600">k</kbd> Previous</span>
            <span class="flex items-center gap-1"><kbd class="bg-slate-100 dark:bg-dark-700 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-dark-600">j</kbd> Next</span>
            <span class="flex items-center gap-1"><kbd class="bg-slate-100 dark:bg-dark-700 px-1.5 py-0.5 rounded font-mono border border-slate-200 dark:border-dark-600">esc</kbd> Back to part</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <router-link
              v-if="siblings.prev"
              :to="`${partUrl(partParam)}/${siblings.prev.id}`"
              class="group flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200/70 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all max-w-[45%]"
            >
              <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M15 19l-7-7 7-7"/></svg>
              <div class="min-w-0">
                <div class="font-mono text-xs text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ siblings.prev.num }}</div>
                <div class="hidden sm:block truncate text-xs text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors mt-0.5">{{ EntryModel.name(siblings.prev, activeLang()) }}</div>
              </div>
            </router-link>
            <div v-else />

            <router-link
              v-if="siblings.next"
              :to="`${partUrl(partParam)}/${siblings.next.id}`"
              class="group flex items-center gap-3 px-5 py-4 rounded-xl border border-slate-200/70 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-right max-w-[45%]"
            >
              <div class="min-w-0">
                <div class="font-mono text-xs text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ siblings.next.num }}</div>
                <div class="hidden sm:block truncate text-xs text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors mt-0.5">{{ EntryModel.name(siblings.next, activeLang()) }}</div>
              </div>
              <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M9 5l7 7-7 7"/></svg>
            </router-link>
            <div v-else />
          </div>
        </nav>
      </section>

      <JsonLd v-if="jsonLdData" :data="jsonLdData" />
    </template>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Entry not found</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400 text-sm">No entry with ID "{{ idParam }}" in Part {{ partParam }}.</p>
      <router-link :to="partUrl(partParam)" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
        Back to Part {{ partParam }}
      </router-link>
    </div>
  </div>
</template>
