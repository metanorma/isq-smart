<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStoredLang, setStoredLang, applyLanguage, type Lang } from '../i18n/client'

const current = ref<Lang>('en')
const open = ref(false)

onMounted(() => {
  current.value = getStoredLang()
})

function toggle() {
  open.value = !open.value
}

function select(lang: Lang) {
  current.value = lang
  setStoredLang(lang)
  // Reload for reliable text-matching translation across the whole page
  window.location.reload()
}

const langs: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]
</script>

<template>
  <div class="relative" @mouseleave="open = false">
    <button
      @click="toggle"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors text-sm font-medium"
      aria-label="Language"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
      </svg>
      <span class="text-xs font-bold uppercase">{{ current }}</span>
      <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <div v-if="open" class="absolute right-0 top-full mt-1 min-w-[140px] rounded-xl border border-slate-200/60 dark:border-dark-600/60 bg-white dark:bg-dark-900 shadow-lg p-1 z-50">
      <button
        v-for="l in langs"
        :key="l.code"
        @click="select(l.code)"
        :class="[
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          current === l.code
            ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700'
        ]"
      >
        <span class="text-base">{{ l.flag }}</span>
        <span>{{ l.label }}</span>
        <svg v-if="current === l.code" class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
        </svg>
      </button>
    </div>
  </div>
</template>
