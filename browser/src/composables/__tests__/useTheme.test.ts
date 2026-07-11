import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTheme } from '../useTheme'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('useTheme', () => {
  it('exposes isDark ref and toggle function', () => {
    const { isDark, toggle } = useTheme()
    expect(typeof isDark.value).toBe('boolean')
    expect(typeof toggle).toBe('function')
  })

  it('toggle flips isDark value', () => {
    const { isDark, toggle } = useTheme()
    const before = isDark.value
    toggle()
    expect(isDark.value).toBe(!before)
  })

  it('persists choice to localStorage after toggle', async () => {
    const { toggle } = useTheme()
    toggle()
    await nextTick()
    expect(['dark', 'light']).toContain(localStorage.getItem('theme'))
  })
})
