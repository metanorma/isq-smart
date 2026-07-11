import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import ThemeToggle from '../ThemeToggle.vue'
import { useTheme } from '../../composables/useTheme'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('renders a button element', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('has an aria-label describing theme switching', () => {
    const wrapper = mount(ThemeToggle)
    const label = wrapper.find('button').attributes('aria-label')
    expect(label).toBeTruthy()
    expect(label).toMatch(/light|dark/i)
  })

  it('toggles the dark class on document root when clicked', async () => {
    const { isDark } = useTheme()
    // Reset to a known light state
    isDark.value = false
    document.documentElement.classList.remove('dark')

    const wrapper = mount(ThemeToggle)
    await wrapper.find('button').trigger('click')

    // useTheme watch applies the class
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('reflects the toggled state in aria-label', async () => {
    const { isDark } = useTheme()
    isDark.value = false
    await new Promise(r => setTimeout(r, 0))

    const wrapper = mount(ThemeToggle)
    expect(wrapper.find('button').attributes('aria-label')).toMatch(/dark/i)

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-label')).toMatch(/light/i)
  })
})
