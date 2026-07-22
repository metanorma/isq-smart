<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { OntologyGroup } from '../data/ontology/OntologyTree'
import { asset } from '../lib/asset'

const props = defineProps<{
  tree: OntologyGroup[]
}>()

const expanded = ref<Set<string>>(new Set())
const search = ref('')
const activeSlug = ref<string>('')

function deriveActiveSlug() {
  const match = window.location.pathname.match(/\/ontology\/([^/?#]+)/)
  activeSlug.value = match ? decodeURIComponent(match[1]) : ''
}

function onAfterSwap() {
  deriveActiveSlug()
}

onMounted(() => {
  deriveActiveSlug()
  document.addEventListener('astro:after-swap', onAfterSwap)
})

onBeforeUnmount(() => {
  document.removeEventListener('astro:after-swap', onAfterSwap)
})

function toggle(key: string) {
  if (expanded.value.has(key)) expanded.value.delete(key)
  else expanded.value.add(key)
  expanded.value = new Set(expanded.value)
}

function isExpanded(key: string): boolean {
  if (search.value) return true
  return expanded.value.has(key)
}

const filteredTree = computed(() => {
  if (!search.value) return props.tree
  const q = search.value.toLowerCase()
  return props.tree
    .map(group => ({
      ...group,
      groups: group.groups
        .map(g => ({
          ...g,
          entities: g.entities.filter(
            e => e.label.toLowerCase().includes(q) || e.qname.toLowerCase().includes(q)
          ),
        }))
        .filter(g => g.entities.length > 0),
    }))
    .filter(g => g.groups.length > 0)
})

function isActive(slug: string): boolean {
  return activeSlug.value === slug
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Search -->
    <div class="p-3 border-b border-slate-200/60 dark:border-dark-600/60">
      <input
        v-model="search"
        type="text"
        placeholder="Filter ontology…"
        class="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-dark-600/60 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-brand-300 dark:focus:border-brand-700"
      />
    </div>

    <!-- Tree -->
    <nav class="flex-1 overflow-y-auto p-2 space-y-1">
      <template v-for="group in filteredTree" :key="group.prefix">
        <button
          @click="toggle(`ont-${group.prefix}`)"
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
        >
          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-90': isExpanded(`ont-${group.prefix}`) }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          <span class="flex-1 text-left">{{ group.label }}</span>
          <span class="text-[10px] font-mono text-slate-400">{{ group.totalCount }}</span>
        </button>

        <div v-if="isExpanded(`ont-${group.prefix}`)" class="ml-3 space-y-0.5">
          <template v-for="tg in group.groups" :key="`${group.prefix}-${tg.type}`">
            <button
              @click="toggle(`type-${group.prefix}-${tg.type}`)"
              class="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
            >
              <svg class="w-3 h-3 transition-transform opacity-60" :class="{ 'rotate-90': isExpanded(`type-${group.prefix}-${tg.type}`) }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              <span class="flex-1 text-left">{{ tg.label }}</span>
              <span class="text-[10px] font-mono text-slate-400">{{ tg.entities.length }}</span>
            </button>

            <div v-if="isExpanded(`type-${group.prefix}-${tg.type}`)" class="ml-4 space-y-0.5">
              <a
                v-for="e in tg.entities"
                :key="e.slug"
                :href="asset(`/ontology/${e.slug}`)"
                :class="[
                  'block px-2 py-1 rounded-lg text-xs transition-colors',
                  isActive(e.slug)
                    ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 hover:text-brand-600 dark:hover:text-brand-400'
                ]"
                :title="e.qname"
              >
                {{ e.label }}
              </a>
            </div>
          </template>
        </div>
      </template>
    </nav>
  </div>
</template>
