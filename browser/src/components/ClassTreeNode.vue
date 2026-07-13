<script setup lang="ts">
import { asset } from '../lib/asset'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

interface Entity {
  qname: string
  slug: string
  label: string
  ontology: string
  parent?: string
  type: string
}

const props = defineProps<{
  entity: Entity
  depth: number
  allClasses: readonly Entity[]
  expandedNodes?: Set<string>
}>()

const internalExpanded = ref(new Set<string>(props.expandedNodes ? [...props.expandedNodes] : []))

watch(() => props.expandedNodes, (val) => {
  if (val) internalExpanded.value = new Set([...val])
}, { deep: true })

const children = computed(() =>
  props.allClasses.filter(c => c.parent === props.entity.qname)
)

const hasChildren = computed(() => children.value.length > 0)
const isExpanded = computed(() => internalExpanded.value.has(props.entity.qname))

function toggle() {
  const s = new Set(internalExpanded.value)
  if (s.has(props.entity.qname)) s.delete(props.entity.qname)
  else s.add(props.entity.qname)
  internalExpanded.value = s
}

function badgeColor(e: Entity) {
  if (e.ontology === 'smart') return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
  if (e.ontology === 'isq') return 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
  return 'bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400'
}

// Listen for expand-all / collapse-all events from parent
function handleExpandAll() {
  const s = new Set<string>()
  for (const c of props.allClasses) {
    if (props.allClasses.some(cc => cc.parent === c.qname)) s.add(c.qname)
  }
  internalExpanded.value = s
}

function handleCollapseAll() {
  internalExpanded.value = new Set()
}

let rootEl: HTMLElement | null = null

onMounted(() => {
  rootEl = document.getElementById('class-tree-root')
  rootEl?.addEventListener('expand-all', handleExpandAll)
  rootEl?.addEventListener('collapse-all', handleCollapseAll)
})

onBeforeUnmount(() => {
  rootEl?.removeEventListener('expand-all', handleExpandAll)
  rootEl?.removeEventListener('collapse-all', handleCollapseAll)
})
</script>

<template>
  <div>
    <div class="flex items-center gap-1.5" :style="{ paddingLeft: `${depth * 1.25}rem` }">
      <button v-if="hasChildren" @click="toggle" class="w-4 h-4 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0">
        <span v-if="isExpanded">▼</span><span v-else>▶</span>
      </button>
      <span v-else class="w-4 h-4 flex items-center justify-center text-slate-200 dark:text-dark-600 flex-shrink-0">●</span>
      <span v-if="depth > 0" class="text-slate-300 dark:text-dark-600">└</span>
      <a :href="asset(`/ontology/${entity.slug}`)" class="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline">{{ entity.label }}</a>
      <span class="text-[9px] px-1.5 py-0.5 rounded flex-shrink-0" :class="badgeColor(entity)">{{ entity.ontology }}</span>
    </div>
    <template v-if="isExpanded">
      <ClassTreeNode
        v-for="child in children" :key="child.qname"
        :entity="child" :depth="depth + 1"
        :all-classes="allClasses"
        :expanded-nodes="internalExpanded" />
    </template>
  </div>
</template>
