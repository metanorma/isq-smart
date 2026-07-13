<script setup lang="ts">
import { asset } from '../lib/asset'
import { ref, computed, nextTick, watch } from 'vue'
import ClassTreeNode from './ClassTreeNode.vue'

interface Entity {
  uri: string
  qname: string
  slug: string
  label: string
  description: string
  ontology: string
  type: string
  parent?: string
}

const props = defineProps<{
  rootClasses: readonly Entity[]
  allClasses: readonly Entity[]
}>()

// All expandable class nodes (nodes that have at least one child)
const allExpandable = computed(() =>
  props.allClasses
    .filter(c => props.allClasses.some(cc => cc.parent === c.qname))
    .map(c => c.qname),
)

const treeExpanded = ref(new Set<string>())

function expandAll() {
  treeExpanded.value = new Set([...allExpandable.value])
}

function collapseAll() {
  treeExpanded.value = new Set()
}

// Re-render the tree when expanded set changes
const expandedNodesKey = ref(0)
watch(treeExpanded, async () => {
  await nextTick()
  expandedNodesKey.value++
})
</script>

<template>
  <div>
    <!-- Controls -->
    <div class="flex items-center gap-2 mb-4">
      <button
        @click="expandAll"
        class="text-xs px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 hover:border-slate-300 dark:hover:border-dark-500 transition-colors font-medium"
      >Expand all</button>
      <button
        @click="collapseAll"
        class="text-xs px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 hover:border-slate-300 dark:hover:border-dark-500 transition-colors font-medium"
      >Collapse all</button>
    </div>

    <!-- The tree -->
    <div id="class-tree-root" class="space-y-0.5" :key="expandedNodesKey">
      <ClassTreeNode
        v-for="root in rootClasses"
        :key="root.qname"
        :entity="root"
        :depth="0"
        :all-classes="allClasses"
        :expanded-nodes="treeExpanded"
      />
    </div>

    <!-- Download links -->
    <div class="mt-5 pt-4 border-t border-slate-100 dark:border-dark-700 flex items-center gap-2 flex-wrap">
      <a
        :href="asset('/ontology/full.ttl')"
        class="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 hover:text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40 dark:hover:bg-emerald-950/60 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
        Download complete ontology (Turtle)
      </a>
      <a
        :href="asset('/ontologies/isq.shacl.ttl')"
        class="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-700 dark:bg-dark-700 dark:text-slate-300 dark:border-dark-600 dark:hover:bg-dark-600 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
        SHACL shapes (Turtle)
      </a>
    </div>
  </div>
</template>
