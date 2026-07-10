<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  links: readonly { to: string; label: string }[]
  activePath: string
}>()

const open = ref(false)

function isActive(path: string): boolean {
  return props.activePath === path || props.activePath.startsWith(path + '/')
}
</script>

<template>
  <button
    @click="open = !open"
    class="lg:hidden p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
    :aria-expanded="open"
    aria-label="Menu"
  >
    <svg class="w-5 h-5 transition-transform duration-200" :class="open ? 'rotate-90' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path v-if="!open" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
      <path v-else stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  </button>

  <transition
    enter-active-class="transition-all duration-200 ease-out origin-top"
    leave-active-class="transition-all duration-150 ease-in origin-top"
    enter-from-class="opacity-0 scale-y-95 -translate-y-1"
    leave-to-class="opacity-0 scale-y-95 -translate-y-1"
  >
    <div v-if="open" class="lg:hidden pb-3 border-t border-slate-100 dark:border-dark-600 pt-2 space-y-1 absolute left-0 right-0 top-14 bg-white dark:bg-dark-900 shadow-lg">
      <a
        v-for="link in links"
        :key="link.to"
        :href="link.to"
        @click="open = false"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors mx-2"
        :class="isActive(link.to)
          ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700'"
      >
        {{ link.label }}
      </a>
    </div>
  </transition>
</template>
