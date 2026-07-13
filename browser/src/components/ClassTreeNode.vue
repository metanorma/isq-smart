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
  description?: string
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

// Recursively count all descendants for the badge
const descendantCount = computed(() => {
  let count = 0
  const stack = [...children.value]
  while (stack.length) {
    const node = stack.pop()!
    count++
    const kids = props.allClasses.filter(c => c.parent === node.qname)
    stack.push(...kids)
  }
  return count
})

function toggle() {
  if (!hasChildren.value) return
  const s = new Set(internalExpanded.value)
  if (s.has(props.entity.qname)) s.delete(props.entity.qname)
  else s.add(props.entity.qname)
  internalExpanded.value = s
}

// Color coding by ontology — left border accent + badge tint
const accentClasses = computed(() => {
  if (props.entity.ontology === 'isq') {
    return {
      border: 'border-l-brand-400 dark:border-l-brand-500',
      hoverBg: 'hover:bg-brand-50/50 dark:hover:bg-brand-950/20',
      badge: 'bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400',
      dot: 'bg-brand-400 dark:bg-brand-500',
    }
  }
  if (props.entity.ontology === 'smart') {
    return {
      border: 'border-l-emerald-400 dark:border-l-emerald-500',
      hoverBg: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
      badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      dot: 'bg-emerald-400 dark:bg-emerald-500',
    }
  }
  return {
    border: 'border-l-slate-300 dark:border-l-dark-500',
    hoverBg: 'hover:bg-slate-50/50 dark:hover:bg-dark-700/40',
    badge: 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400',
    dot: 'bg-slate-300 dark:bg-slate-500',
  }
})

const isRoot = computed(() => props.depth === 0)

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
    <div
      class="group flex items-center gap-2 px-2.5 py-1.5 rounded-md border-l-2 transition-colors duration-100"
      :class="[accentClasses.border, accentClasses.hoverBg]"
    >
      <!-- Expand/collapse chevron -->
      <button
        v-if="hasChildren"
        @click="toggle"
        class="w-4 h-4 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 transition-transform"
        :class="isExpanded ? 'rotate-90' : ''"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? 'Collapse' : 'Expand'"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <span v-else class="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <span class="w-1.5 h-1.5 rounded-full" :class="accentClasses.dot"></span>
      </span>

      <!-- Label link -->
      <a
        :href="asset(`/ontology/${entity.slug}`)"
        class="text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate"
      >{{ entity.label }}</a>

      <!-- QName badge -->
      <code
        class="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 hidden sm:inline-block"
        :class="accentClasses.badge"
      >{{ entity.qname }}</code>

      <!-- Type badge for root nodes -->
      <span
        v-if="isRoot"
        class="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-dark-700 dark:text-slate-400 flex-shrink-0"
      >root</span>

      <!-- Subclass count -->
      <span
        v-if="descendantCount > 0"
        class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-auto flex-shrink-0 tabular-nums whitespace-nowrap"
      >{{ children.length }} <span class="hidden sm:inline">sub{{ children.length > 1 ? 'classes' : 'class' }}</span><span v-if="descendantCount > children.length" class="text-slate-300 dark:text-dark-500"> ({{ descendantCount }} total)</span></span>
    </div>

    <!-- Children with left border indentation -->
    <template v-if="isExpanded">
      <div class="ml-2 border-l border-slate-200/60 dark:border-dark-600/60 pl-1">
        <ClassTreeNode
          v-for="child in children"
          :key="child.qname"
          :entity="child"
          :depth="depth + 1"
          :all-classes="allClasses"
          :expanded-nodes="internalExpanded"
        />
      </div>
    </template>
  </div>
</template>
