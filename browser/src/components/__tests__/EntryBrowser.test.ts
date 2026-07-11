import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EntryBrowser from '../EntryBrowser.vue'
import { quantitiesIndex, symbolCache } from '../../data/generated/domain-index'
import { getPartsByDomain } from '../../data/PartRegistry'
import type { DomainEntry, PartMeta } from '../../data/types'

const parts: PartMeta[] = getPartsByDomain('quantities').filter(p => !p.parentPart)

// Use a small slice of real data for predictable tests
const index: DomainEntry[] = quantitiesIndex.slice(0, 10)

describe('EntryBrowser', () => {
  it('renders a search input', () => {
    const wrapper = mount(EntryBrowser, {
      props: { domainKey: 'quantities', parts, index, symbolCache },
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders part filter buttons', () => {
    const wrapper = mount(EntryBrowser, {
      props: { domainKey: 'quantities', parts, index, symbolCache },
    })
    const buttons = wrapper.findAll('button')
    // At minimum, the "All" button plus part buttons
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    expect(buttons[0].text()).toBe('All')
  })

  it('renders entry links initially', () => {
    const wrapper = mount(EntryBrowser, {
      props: { domainKey: 'quantities', parts, index, symbolCache },
    })
    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThan(0)
  })

  it('filters entries when typing in the search box', async () => {
    const wrapper = mount(EntryBrowser, {
      props: { domainKey: 'quantities', parts, index, symbolCache },
    })
    const beforeCount = wrapper.findAll('a').length
    expect(beforeCount).toBeGreaterThan(1)

    // The first 10 entries of part 3 all have num starting with "3-1."
    // so search for something very specific that exists in the fixture
    const firstEntry = index[0]
    const searchInput = wrapper.find('input')
    await searchInput.setValue(firstEntry.t)

    const afterCount = wrapper.findAll('a').length
    expect(afterCount).toBeLessThanOrEqual(beforeCount)
    expect(afterCount).toBeGreaterThanOrEqual(1)
  })

  it('shows no-results message when search matches nothing', async () => {
    const wrapper = mount(EntryBrowser, {
      props: { domainKey: 'quantities', parts, index, symbolCache },
    })
    await wrapper.find('input').setValue('zzzzzzzz_not_found')
    expect(wrapper.text()).toContain('No entries match')
  })

  it('filters by part when a part button is clicked', async () => {
    // Use entries from multiple parts
    const multiPartIndex: DomainEntry[] = [
      ...quantitiesIndex.filter(e => e.p === '3').slice(0, 3),
      ...quantitiesIndex.filter(e => e.p === '4').slice(0, 3),
    ]
    const wrapper = mount(EntryBrowser, {
      props: { domainKey: 'quantities', parts, index: multiPartIndex, symbolCache },
    })

    const beforeCount = wrapper.findAll('a').length
    expect(beforeCount).toBe(6)

    // Find the "4" part button (not "All")
    const partButtons = wrapper.findAll('button')
    const part4Button = partButtons.find(b => b.text() === '4')
    expect(part4Button).toBeTruthy()
    await part4Button!.trigger('click')

    const afterCount = wrapper.findAll('a').length
    expect(afterCount).toBe(3)
    // All visible entries should be from part 4
    const hrefs = wrapper.findAll('a').map(a => a.attributes('href'))
    hrefs.forEach(href => {
      expect(href).toContain('/part-4/')
    })
  })
})
