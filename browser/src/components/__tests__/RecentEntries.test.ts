import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import RecentEntries from '../RecentEntries.vue'

describe('RecentEntries', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders nothing when localStorage is empty', () => {
    const wrapper = mount(RecentEntries)
    expect(wrapper.find('section').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })

  it('renders entry links when localStorage has entries', async () => {
    const entries = [
      { id: 't3-1.1', num: '3-1.1', name: 'length', partKey: '3', href: '/quantities/part-3/t3-1.1', ts: Date.now() },
      { id: 't4-1', num: '4-1', name: 'mass', partKey: '4', href: '/quantities/part-4/t4-1', ts: Date.now() },
    ]
    localStorage.setItem('recent-entries', JSON.stringify(entries))

    const wrapper = mount(RecentEntries)
    // onMounted reads localStorage, so trigger reactivity
    await wrapper.vm.$nextTick()

    const links = wrapper.findAll('a')
    expect(links.length).toBe(2)
    expect(links[0].attributes('href')).toBe('/quantities/part-3/t3-1.1')
    expect(links[1].attributes('href')).toBe('/quantities/part-4/t4-1')
  })

  it('shows num and name for each entry', async () => {
    const entries = [
      { id: 't3-1.1', num: '3-1.1', name: 'length', partKey: '3', href: '/quantities/part-3/t3-1.1', ts: Date.now() },
    ]
    localStorage.setItem('recent-entries', JSON.stringify(entries))

    const wrapper = mount(RecentEntries)
    await wrapper.vm.$nextTick()

    const text = wrapper.text()
    expect(text).toContain('3-1.1')
    expect(text).toContain('length')
  })

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem('recent-entries', '{invalid json')
    const wrapper = mount(RecentEntries)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('limits display to 8 entries', async () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({
      id: `t3-${i}`,
      num: `3-${i}`,
      name: `entry-${i}`,
      partKey: '3',
      href: `/quantities/part-3/t3-${i}`,
      ts: Date.now(),
    }))
    localStorage.setItem('recent-entries', JSON.stringify(entries))

    const wrapper = mount(RecentEntries)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('a').length).toBe(8)
  })
})
