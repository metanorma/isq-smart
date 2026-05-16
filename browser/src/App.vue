<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import DefaultLayout from './layouts/Default.vue'
import { openSearch, searchOpen } from './composables/useSearch'

function onGlobalKey(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
  if (e.key === '/' && !searchOpen.value) {
    e.preventDefault()
    openSearch()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <DefaultLayout>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" :key="$route.path" />
        <template #fallback>
          <div class="flex items-center justify-center py-32">
            <div class="flex flex-col items-center gap-4">
              <div class="w-8 h-8 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
              <span class="text-sm text-slate-400">Loading…</span>
            </div>
          </div>
        </template>
      </Suspense>
    </router-view>
  </DefaultLayout>
</template>
