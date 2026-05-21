<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
    <div class="text-6xl mb-4">404</div>
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 heading-serif">Page not found</h1>
    <p class="mt-2 text-slate-500 dark:text-slate-400 text-sm">No page exists at <code class="font-mono text-sm bg-slate-100 dark:bg-dark-700 px-2 py-0.5 rounded">{{ route.path }}</code></p>
    <router-link to="/" class="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
      Back to Home
    </router-link>
  </div>
</template>
