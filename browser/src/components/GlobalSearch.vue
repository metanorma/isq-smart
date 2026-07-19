<script setup lang="ts">
import { watch, nextTick, ref, onMounted, onUnmounted } from 'vue'
import { searchOpen, searchQuery, searchDomain, searchResults, performSearch, closeSearch, matchLabel, openSearch } from '../composables/useSearch'
import type { SearchResult } from '../composables/useSearch'
import { entryUrl } from '../data'

const input = ref<HTMLInputElement>()

const domainOpts: { key: 'all' | 'quantities' | 'math'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'quantities', label: 'Quantities' },
  { key: 'math', label: 'Math' },
]
const activeIndex = ref(-1)

function onOpenEvent() { openSearch() }
onMounted(() => window.addEventListener('open-search', onOpenEvent))
onUnmounted(() => window.removeEventListener('open-search', onOpenEvent))

watch(searchOpen, async (v) => {
  if (v) {
    activeIndex.value = -1
    searchDomain.value = 'all'
    await nextTick()
    input.value?.focus()
  }
})

watch(searchQuery, (q) => {
  activeIndex.value = -1
  performSearch(q)
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { closeSearch(); return }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, searchResults.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, -1)
  } else if (e.key === 'Enter' && activeIndex.value >= 0 && searchResults.value[activeIndex.value]) {
    e.preventDefault()
    const r = searchResults.value[activeIndex.value]
    window.location.href = entryUrl(r.partKey, r.id)
    closeSearch()
  }
}

function go() { closeSearch() }

function highlight(text: string, query: string): string {
  if (!query) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  return text.replace(re, '<mark class="bg-amber-200/80 dark:bg-amber-700/50 text-amber-900 dark:text-amber-200 rounded-sm px-0.5 -mx-0.5">$1</mark>')
}

function getEntryName(r: SearchResult): string {
  return r.name || r.num
}
</script>

<template>
  <Teleport to="body">
    <div v-if="searchOpen" class="search-overlay fixed inset-0 z-50" @keydown="onKey" @click.self="closeSearch">
      <div class="absolute inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md" @click="closeSearch" />

      <div class="search-modal relative max-w-2xl mx-auto bg-white dark:bg-dark-900 rounded-2xl shadow-2xl shadow-brand-950/20 overflow-hidden border border-slate-200/50 dark:border-dark-600/50 sm:mt-[10vh] sm:mx-4 fixed sm:relative inset-0 sm:inset-auto rounded-none sm:rounded-2xl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-dark-600">
          <svg class="w-5 h-5 text-brand-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input ref="input" v-model="searchQuery" type="text" placeholder="Search quantities, symbols, definitions, units..." class="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-200" />
          <kbd class="text-xs bg-slate-100 dark:bg-dark-800 px-1.5 py-0.5 rounded-md text-slate-400 dark:text-slate-500 font-mono border border-slate-200 dark:border-dark-600 flex-shrink-0 hidden sm:inline">ESC</kbd>
          <button @click="closeSearch" class="sm:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="sm:max-h-[60vh] max-h-[calc(100vh-80px)] overflow-y-auto search-results-scroll">
          <!-- Domain filter tabs -->
          <div class="flex items-center gap-1 px-5 py-2 border-b border-slate-100 dark:border-dark-600 bg-slate-50/50 dark:bg-dark-800/50">
            <button
              v-for="d in domainOpts"
              :key="d.key"
              @click="searchDomain = d.key; performSearch(searchQuery)"
              :class="['px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200', searchDomain === d.key ? 'bg-white dark:bg-dark-700 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/80 dark:border-dark-500' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300']"
            >{{ d.label }}</button>
          </div>
          <div v-if="searchQuery && searchResults.length === 0" class="px-5 py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            <p>No results found for "{{ searchQuery }}"</p>
            <p class="mt-1 text-xs text-slate-300 dark:text-slate-600">Try searching for a quantity name, symbol, or unit</p>
          </div>
          <div v-if="!searchQuery" class="px-5 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            <div class="hidden sm:flex items-center justify-center gap-4 text-xs">
              <span class="flex items-center gap-1"><kbd class="bg-slate-100 dark:bg-dark-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-dark-600">↑↓</kbd> Navigate</span>
              <span class="flex items-center gap-1"><kbd class="bg-slate-100 dark:bg-dark-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-dark-600">↵</kbd> Open</span>
              <span class="flex items-center gap-1"><kbd class="bg-slate-100 dark:bg-dark-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-dark-600">esc</kbd> Close</span>
            </div>
            <p class="sm:hidden text-xs">Type to search across all entries</p>
          </div>
          <div v-for="(r, idx) in searchResults" :key="r.id" class="entry-link" :class="{ 'bg-brand-50/70 dark:bg-brand-950/30': idx === activeIndex }">
            <a :href="entryUrl(r.partKey, r.id)" @click="go" class="flex items-start gap-3.5 px-5 py-3.5 transition-colors">
              <span class="flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-mono font-semibold border transition-colors" :class="idx === activeIndex ? 'bg-brand-600 text-white border-brand-500' : r.partDomain === 'math' ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800' : 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 border-brand-100 dark:border-brand-800'">{{ r.partKey }}</span>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" :class="{ 'text-brand-700 dark:text-brand-400': idx === activeIndex }" v-html="highlight(getEntryName(r), searchQuery)" />
                <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span class="font-mono text-brand-600 dark:text-brand-400 font-medium" v-html="highlight(r.num, searchQuery)" />
                  <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                  <span class="text-xs font-semibold uppercase tracking-wider" :class="r.partDomain === 'math' ? 'text-violet-500 dark:text-violet-400' : 'text-brand-500 dark:text-brand-400'">{{ r.partDomain }}</span>
                  <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                  <span>{{ r.partTitle }}</span>
                  <template v-if="r.matchField">
                    <span class="text-slate-300 dark:text-slate-600">&middot;</span>
                    <span class="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-700/40">in {{ matchLabel(r.matchField) }}</span>
                  </template>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
