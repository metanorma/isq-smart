<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 600
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 translate-y-2"
    leave-to-class="opacity-0 translate-y-2"
  >
    <button
      v-if="visible"
      @click="scrollToTop"
      class="fixed bottom-6 right-6 z-30 w-10 h-10 rounded-full bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 shadow-lg shadow-slate-900/5 dark:shadow-black/20 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-brand-600/10 transition-all"
      aria-label="Back to top"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/></svg>
    </button>
  </transition>
</template>
