<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { openSearch } from '../composables/useSearch'

const visible = ref(false)

function onKeyDown(e: KeyboardEvent) {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
    e.preventDefault()
    openSearch()
    hide()
  }
}

function hide() {
  if (visible.value) {
    visible.value = false
    localStorage.setItem('search-hint-seen', '1')
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  if (localStorage.getItem('search-hint-seen')) return
  const timer = setTimeout(() => { visible.value = true }, 2000)
  setTimeout(() => {
    clearTimeout(timer)
    hide()
  }, 6000)
})

onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 translate-y-3"
    leave-to-class="opacity-0 translate-y-3"
  >
    <div v-if="visible" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm shadow-xl shadow-slate-900/25">
        Press <kbd class="bg-white/15 px-2 py-0.5 rounded-md font-mono text-xs font-semibold mx-0.5">/</kbd> to search entries
      </div>
    </div>
  </transition>
</template>
