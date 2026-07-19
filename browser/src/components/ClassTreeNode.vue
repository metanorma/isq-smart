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

const accentClasses = computed(() => {
  if (props.entity.ontology === 'isq') {
    return {
      box: 'bg-brand-50/60 dark:bg-brand-950/20 border-brand-200/70 dark:border-brand-800/40',
      text: 'text-brand-700 dark:text-brand-300',
      badge: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400',
      connector: 'border-brand-300/50 dark:border-brand-700/40',
      hoverBorder: 'hover:border-brand-400 dark:hover:border-brand-600',
    }
  }
  if (props.entity.ontology === 'smart') {
    return {
      box: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      connector: 'border-emerald-300/50 dark:border-emerald-700/40',
      hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    }
  }
  return {
    box: 'bg-slate-50/60 dark:bg-dark-800/40 border-slate-200/70 dark:border-dark-600/40',
    text: 'text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-400',
    connector: 'border-slate-200/60 dark:border-dark-600/40',
    hoverBorder: 'hover:border-slate-300 dark:hover:border-dark-500',
  }
})

const isRoot = computed(() => props.depth === 0)

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
  <div class="class-tree-node">
    <!-- Node box -->
    <div class="flex items-stretch">
      <!-- Connector lines for non-root nodes -->
      <template v-if="!isRoot">
        <div class="w-6 flex items-start justify-center pt-3 flex-shrink-0">
          <div class="w-full h-3 border-t-2" :class="accentClasses.connector"></div>
        </div>
      </template>

      <!-- The actual node -->
      <div
        class="flex-1 min-w-0 rounded-lg border-2 px-3 py-2 transition-all duration-150 cursor-pointer group"
        :class="[accentClasses.box, accentClasses.hoverBorder, hasChildren ? '' : 'cursor-default']"
        @click="hasChildren && toggle()"
      >
        <div class="flex items-center gap-2">
          <!-- Expand/collapse chevron -->
          <svg
            v-if="hasChildren"
            class="w-4 h-4 flex-shrink-0 transition-transform duration-200"
            :class="[accentClasses.text, isExpanded ? 'rotate-90' : '']"
            fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span v-else class="w-4 h-4 flex items-center justify-center flex-shrink-0">
            <span class="w-2 h-2 rounded-full" :class="accentClasses.badge"></span>
          </span>

          <!-- Label link -->
          <a
            :href="asset(`/ontology/${entity.slug}`)"
            class="text-sm font-semibold hover:underline truncate"
            :class="accentClasses.text"
            @click.stop
          >{{ entity.label }}</a>

          <!-- QName badge -->
          <code
            class="text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0 hidden sm:inline-block"
            :class="accentClasses.badge"
          >{{ entity.qname }}</code>

          <!-- Root badge -->
          <span
            v-if="isRoot"
            class="text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 dark:bg-dark-700 dark:text-slate-400 flex-shrink-0"
          >ROOT</span>

          <!-- Subclass count -->
          <span
            v-if="descendantCount > 0"
            class="text-xs font-semibold ml-auto flex-shrink-0 tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded-full"
            :class="accentClasses.badge"
          >{{ children.length }} direct<span v-if="descendantCount > children.length" class="opacity-60"> / {{ descendantCount }} total</span></span>
        </div>

        <!-- Description (compact) -->
        <p
          v-if="entity.description && isRoot"
          class="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-1 pl-6"
        >{{ entity.description }}</p>
      </div>
    </div>

    <!-- Children with vertical connector -->
    <template v-if="isExpanded && children.length > 0">
      <div class="flex">
        <div class="w-6 flex justify-center flex-shrink-0" :class="isRoot ? '' : 'ml-6'">
          <div class="w-0.5 bg-gradient-to-b from-transparent via-current to-transparent opacity-20" :class="accentClasses.text"></div>
        </div>
        <div class="flex-1 space-y-2 pt-2">
          <ClassTreeNode
            v-for="child in children"
            :key="child.qname"
            :entity="child"
            :depth="depth + 1"
            :all-classes="allClasses"
            :expanded-nodes="internalExpanded"
          />
        </div>
      </div>
    </template>
  </div>
</template>
