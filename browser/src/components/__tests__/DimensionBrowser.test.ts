import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DimensionBrowser from '../DimensionBrowser.vue'
import { physicalDimensions } from '../../data/generated/physical-dimensions'

// Use a small slice of real data for predictable tests
const sampleDims = physicalDimensions.slice(0, 5)

describe('DimensionBrowser', () => {
  it('renders a search input', () => {
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders dimension items as links', () => {
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    const links = wrapper.findAll('a')
    expect(links.length).toBe(sampleDims.length)
  })

  it('renders the dimension name', () => {
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    expect(wrapper.text()).toContain(sampleDims[0].name)
  })

  it('renders the vector notation for non-dimensionless entries', () => {
    const nonDimless = sampleDims.find(d => !d.dimensionless)!
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: [nonDimless] },
    })
    expect(wrapper.text()).toContain(nonDimless.vectorNotation)
  })

  it('renders dimless label for dimensionless entries', () => {
    const dimless = physicalDimensions.find(d => d.dimensionless)
    if (!dimless) return // skip if no dimensionless entries in data
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: [dimless] },
    })
    expect(wrapper.text()).toContain('dimless')
  })

  it('filters dimensions by name when searching', async () => {
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    const beforeCount = wrapper.findAll('a').length
    expect(beforeCount).toBe(sampleDims.length)

    await wrapper.find('input').setValue(sampleDims[0].name)

    const afterLinks = wrapper.findAll('a')
    expect(afterLinks.length).toBeGreaterThanOrEqual(1)
    expect(afterLinks.length).toBeLessThanOrEqual(beforeCount)
  })

  it('filters by vector notation when searching', async () => {
    const nonDimless = sampleDims.find(d => !d.dimensionless)!
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    await wrapper.find('input').setValue(nonDimless.vectorNotation)

    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('shows no-results message when search matches nothing', async () => {
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    await wrapper.find('input').setValue('zzzzzz_no_match')
    expect(wrapper.text()).toContain('No dimensions match')
  })

  it('renders unitsml identifier', () => {
    const wrapper = mount(DimensionBrowser, {
      props: { dimensions: sampleDims },
    })
    expect(wrapper.text()).toContain(sampleDims[0].unitsmlId)
  })
})
