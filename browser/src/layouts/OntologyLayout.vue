<script setup lang="ts">
import { ref } from 'vue'
import OntologySidebar from '../components/OntologySidebar.vue'

const mobileExpanded = ref(false)
</script>

<template>
  <div>
    <!-- Mobile: horizontal toggle nav -->
    <div class="lg:hidden border-b border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 sticky top-14 z-20">
      <button @click="mobileExpanded = !mobileExpanded"
        class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        <span class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
          Ontology browser
        </span>
        <svg class="w-4 h-4 transition-transform" :class="mobileExpanded ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" d="M19 9l-7 7-7-7"/></svg>
      </button>
      <div v-if="mobileExpanded" class="h-[70vh] overflow-y-auto border-t border-slate-200/60 dark:border-dark-600/60">
        <OntologySidebar :mobile="true" />
      </div>
    </div>

    <!-- Desktop: sidebar + content -->
    <div class="hidden lg:flex">
      <OntologySidebar />
      <div class="flex-1 min-w-0">
        <router-view />
      </div>
    </div>

    <!-- Mobile content (no sidebar layout) -->
    <div class="lg:hidden">
      <router-view />
    </div>
  </div>
</template>
