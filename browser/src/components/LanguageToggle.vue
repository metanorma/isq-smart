<script setup lang="ts">
const lang = defineModel<'en' | 'fr' | 'both'>({ default: 'en' })
const opts: { key: 'en' | 'fr' | 'both'; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'fr', label: 'FR' },
  { key: 'both', label: 'EN + FR' },
]
</script>

<template>
  <div class="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
    <button
      v-for="o in opts"
      :key="o.key"
      @click="lang = o.key"
      :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200', lang === o.key ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25' : 'text-slate-500 hover:text-slate-700']"
    >{{ o.label }}</button>
  </div>
</template>
