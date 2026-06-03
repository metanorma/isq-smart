import { ref, watch } from 'vue'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null
const isDark = ref(stored === 'dark' || (!stored && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

function apply(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? '#160a12' : '#E30613')
}

if (typeof document !== 'undefined') {
  apply(isDark.value)
}

watch(isDark, (v) => {
  apply(v)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', v ? 'dark' : 'light')
  }
})

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
