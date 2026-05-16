<script setup lang="ts">
import type { PartMeta } from '../data/types'
import { accentGradient, accentShadow } from '../composables/useAccent'

const props = defineProps<{ part: PartMeta; size?: 'sm' | 'md' | 'lg' }>()

const sizeMap = { sm: 'w-10 h-10 text-lg', md: 'w-14 h-14 text-2xl', lg: 'w-16 h-16 text-3xl' }

function styles() {
  return {
    background: accentGradient(props.part),
    boxShadow: accentShadow(props.part),
  }
}
</script>

<template>
  <div :class="['rounded-xl flex items-center justify-center text-white leading-none flex-shrink-0', sizeMap[size ?? 'md']]" :style="styles()">
    {{ part.icon }}
  </div>
</template>
