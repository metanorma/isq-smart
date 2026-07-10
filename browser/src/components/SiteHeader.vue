<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTheme } from '../composables/useTheme'
import { openSearch } from '../composables/useSearch'
import IsqLogo from './IsqLogo.vue'

const { toggle, isDark } = useTheme()
const mobileOpen = ref(false)
const scrolled = ref(false)
const currentPath = ref('')

function onScroll() {
  scrolled.value = window.scrollY > 10
}

function isActive(path: string): boolean {
  return currentPath.value === path || currentPath.value.startsWith(path + '/')
}

onMounted(() => {
  currentPath.value = window.location.pathname
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const coreLinks = [
  { to: '/quantities', label: 'Quantities' },
  { to: '/math', label: 'Math' },
  { to: '/units', label: 'Units' },
  { to: '/dimensions', label: 'Dimensions' },
]

const secondaryLinks = [
  { to: '/documents', label: 'Publications' },
  { to: '/ontology', label: 'Ontology' },
  { to: '/reference', label: 'Reference' },
  { to: '/about', label: 'About' },
]

const navLinks = [...coreLinks, ...secondaryLinks]
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b transition-colors duration-200"
    :class="scrolled
      ? 'bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-slate-200/80 dark:border-dark-600/80 shadow-sm'
      : 'bg-white dark:bg-dark-900 border-slate-200/60 dark:border-dark-600/60'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center h-14">
        <a href="/" class="flex items-center gap-3 group">
          <IsqLogo class="h-8 w-auto" />
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors hidden min-[1200px]:inline tracking-tight">International System of Quantities</span>
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors min-[1200px]:hidden tracking-tight">ISQ</span>
        </a>

        <div class="ml-auto flex items-center gap-1">
          <button @click="openSearch" class="lg:hidden p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors" aria-label="Search">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button @click="openSearch" class="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-dark-600 bg-slate-50/50 dark:bg-dark-800/50 text-slate-400 dark:text-slate-500 text-sm hover:border-slate-300 dark:hover:border-dark-500 hover:text-slate-500 dark:hover:text-slate-400 transition-all min-w-[200px]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span class="flex-1 text-left">Search entries…</span>
            <kbd class="text-[10px] bg-white dark:bg-dark-700 px-1.5 py-0.5 rounded-md text-slate-400 dark:text-slate-500 font-mono border border-slate-200 dark:border-dark-500">/</kbd>
          </button>

          <nav class="hidden md:flex items-center gap-1">
            <a
              v-for="link in coreLinks"
              :key="link.to"
              :href="link.to"
              class="px-3 py-1.5 rounded-lg text-xs transition-colors"
              :class="isActive(link.to)
                ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
                : 'text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-dark-700 font-medium'"
            >
              {{ link.label }}
            </a>
          </nav>

          <nav class="hidden lg:flex items-center gap-1">
            <a
              v-for="link in secondaryLinks"
              :key="link.to"
              :href="link.to"
              class="px-3 py-1.5 rounded-lg text-xs transition-colors"
              :class="isActive(link.to)
                ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
                : 'text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-dark-700 font-medium'"
            >
              {{ link.label }}
            </a>
          </nav>

          <button
            @click="toggle"
            class="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>

          <button
            @click="mobileOpen = !mobileOpen"
            class="lg:hidden p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
            :aria-expanded="mobileOpen"
            aria-label="Menu"
          >
            <svg class="w-5 h-5 transition-transform duration-200" :class="mobileOpen ? 'rotate-90' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path v-if="!mobileOpen" stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <transition
        enter-active-class="transition-all duration-200 ease-out origin-top"
        leave-active-class="transition-all duration-150 ease-in origin-top"
        enter-from-class="opacity-0 scale-y-95 -translate-y-1"
        leave-to-class="opacity-0 scale-y-95 -translate-y-1"
      >
        <div v-if="mobileOpen" class="lg:hidden pb-3 border-t border-slate-100 dark:border-dark-600 pt-2 space-y-1">
          <a
            v-for="link in navLinks"
            :key="link.to"
            :href="link.to"
            @click="mobileOpen = false"
            class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors"
            :class="isActive(link.to)
              ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700'"
          >
            {{ link.label }}
          </a>
        </div>
      </transition>
    </div>
  </header>
</template>
