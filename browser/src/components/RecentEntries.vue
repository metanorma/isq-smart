<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface RecentEntry {
  id: string
  num: string
  name: string
  partKey: string
  href: string
  ts: number
}

const recent = ref<RecentEntry[]>([])

onMounted(() => {
  try {
    recent.value = JSON.parse(localStorage.getItem('recent-entries') || '[]')
  } catch { recent.value = [] }
})
</script>

<template>
  <section v-if="recent.length" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 scroll-reveal">
    <div class="flex items-center gap-2 mb-3">
      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">Recently Viewed</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <a
        v-for="r in recent.slice(0, 8)"
        :key="r.id"
        :href="r.href"
        class="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-sm transition-all text-sm"
      >
        <span class="font-mono text-[11px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">{{ r.num }}</span>
        <span class="text-slate-600 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{{ r.name }}</span>
      </a>
    </div>
  </section>
</template>
