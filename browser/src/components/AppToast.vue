<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { message, visible } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="toast-enter"
      leave-active-class="toast-leave"
    >
      <div v-if="visible" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-dark-700 text-white text-sm font-medium shadow-xl shadow-slate-900/20 flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
          {{ message }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
