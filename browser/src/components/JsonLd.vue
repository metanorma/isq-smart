<script lang="ts">
import { computed, defineComponent, h } from 'vue'

export default defineComponent({
  props: {
    data: { type: Object, required: true },
  },
  setup(props) {
    const json = computed(() => JSON.stringify(props.data, null, 2))
    return () => h('script', { type: 'application/ld+json', innerHTML: json.value })
  },
})
</script>
