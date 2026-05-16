<script setup lang="ts">
import OntologySidebar from '../components/OntologySidebar.vue'
</script>

<template>
  <div class="flex">
    <OntologySidebar />
    <div class="flex-1 min-w-0">
      <router-view />
    </div>
  </div>
</template>
