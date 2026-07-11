import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PartEntryList from '../PartEntryList.vue'
import part3Data from '../../data/generated/part-3'
import type { Entry } from '../../data/types'

const entries: Entry[] = (part3Data as unknown as Entry[]).slice(0, 10)

describe('PartEntryList', () => {
  it('renders entry rows as links', () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    const links = wrapper.findAll('a')
    expect(links.length).toBe(entries.length)
  })

  it('renders a filter input', () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('shows the entry num and name', () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    const text = wrapper.text()
    expect(text).toContain(entries[0].num)
    // The first entry is "length"
    expect(text).toContain('length')
  })

  it('narrowing the filter reduces visible entries', async () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    const beforeCount = wrapper.findAll('a').length
    expect(beforeCount).toBe(entries.length)

    // Search for "length" — should match at least the first entry
    await wrapper.find('input').setValue('length')

    const afterCount = wrapper.findAll('a').length
    expect(afterCount).toBeLessThanOrEqual(beforeCount)
    expect(afterCount).toBeGreaterThanOrEqual(1)
  })

  it('shows no-results message when filter matches nothing', async () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    await wrapper.find('input').setValue('zzzzzz_no_match')
    expect(wrapper.text()).toContain('No entries match')
  })

  it('shows the total entry count', () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    expect(wrapper.text()).toContain(`${entries.length} entries`)
  })

  it('renders links with correct href pattern', () => {
    const wrapper = mount(PartEntryList, {
      props: {
        entries,
        partKey: '3',
        mathCache: {},
        bilingual: false,
        metaTitle: 'Part 3: Space and Time',
        sectionAccentStyle: '',
      },
    })
    const firstLink = wrapper.findAll('a')[0]
    const href = firstLink.attributes('href')
    expect(href).toContain('part-3')
    expect(href).toContain(entries[0].id)
  })
})
