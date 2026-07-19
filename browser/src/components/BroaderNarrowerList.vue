<script setup lang="ts">
import { computed } from 'vue'
import type { HierarchyEntry } from '../data/ontology'
import { asset } from '../lib/asset'

interface LinkedNode {
  id: string
  label: string
  isKind: boolean
}

const props = defineProps<{
  entryId: string
  hierarchy?: Record<string, HierarchyEntry>
  resolveLabel?: (id: string) => string | undefined
}>()

const broader = computed<LinkedNode[]>(() => {
  const node = props.hierarchy?.[props.entryId]
  if (!node) return []
  return (node.broader || [])
    .filter(id => id !== props.entryId)
    .map(id => ({
      id,
      label: props.resolveLabel?.(id) ?? id,
      isKind: id.startsWith('kind-'),
    }))
})

const narrower = computed<LinkedNode[]>(() => {
  const node = props.hierarchy?.[props.entryId]
  if (!node) return []
  return (node.narrower || [])
    .filter(id => id !== props.entryId)
    .map(id => ({
      id,
      label: props.resolveLabel?.(id) ?? id,
      isKind: id.startsWith('kind-'),
    }))
})

function href(id: string): string {
  if (id.startsWith('kind-')) return asset(`/kinds/${id.replace(/^kind-/, '')}`)
  return asset(`/quantities`)
}
</script>

<template>
  <div v-if="broader.length > 0 || narrower.length > 0" class="space-y-4">
    <div v-if="broader.length > 0">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Broader concepts</h4>
      <div class="flex flex-wrap gap-1.5">
        <a
          v-for="b in broader"
          :key="b.id"
          :href="href(b.id)"
          class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border transition-all"
          :class="b.isKind
            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100/60 dark:border-indigo-800/40 hover:border-indigo-300 dark:hover:border-indigo-700'
            : 'bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-dark-600/60 hover:border-slate-300 dark:hover:border-dark-500'"
        >
          <span class="text-xs">{{ b.isKind ? '◇' : '↑' }}</span>
          {{ b.label }}
        </a>
      </div>
    </div>
    <div v-if="narrower.length > 0">
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Narrower concepts</h4>
      <div class="flex flex-wrap gap-1.5">
        <a
          v-for="n in narrower"
          :key="n.id"
          :href="href(n.id)"
          class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-50 dark:bg-dark-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-dark-600/60 hover:border-slate-300 dark:hover:border-dark-500 transition-all"
        >
          <span class="text-xs">↓</span>
          {{ n.label }}
        </a>
      </div>
    </div>
  </div>
</template>
