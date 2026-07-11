import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UnitBrowser from '../UnitBrowser.vue'
import { units } from '../../data/generated/unitsdb'

// Use a small slice of real data for predictable tests
const sampleUnits = units.slice(0, 5)

// The flat list renders one <a> per unit plus additional <a> links
// for sampleQuantities inside each unit item.
function unitLinks(wrapper: ReturnType<typeof mount>): ReturnType<typeof wrapper.findAll> {
  // Top-level unit links are direct children of the grid container
  // They have href like /units/{slug}
  return wrapper.findAll('a').filter(a => {
    const href = a.attributes('href') ?? ''
    return href.startsWith('/units/')
  })
}

describe('UnitBrowser', () => {
  it('renders a search input', () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('renders unit items as links', () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    const links = unitLinks(wrapper)
    expect(links.length).toBe(sampleUnits.length)
  })

  it('renders the unit name in each item', () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    const text = wrapper.text()
    expect(text).toContain(sampleUnits[0].name)
  })

  it('shows the unit count', () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    expect(wrapper.text()).toContain(`${sampleUnits.length} units`)
  })

  it('filters units by name when searching', async () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    const beforeCount = unitLinks(wrapper).length
    expect(beforeCount).toBe(sampleUnits.length)

    // Search for the first unit's exact name
    await wrapper.find('input').setValue(sampleUnits[0].name)

    const afterLinks = unitLinks(wrapper)
    expect(afterLinks.length).toBeGreaterThanOrEqual(1)
    expect(afterLinks.length).toBeLessThanOrEqual(beforeCount)
  })

  it('filters units by symbol when searching', async () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    const sym = sampleUnits[0].symbols[0]
    await wrapper.find('input').setValue(sym)

    const links = unitLinks(wrapper)
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('shows no-results message when search matches nothing', async () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    await wrapper.find('input').setValue('zzzzzz_no_match')
    expect(wrapper.text()).toContain('No units match')
  })

  it('accepts initialQuery prop and pre-filters', () => {
    const query = sampleUnits[0].name
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits, initialQuery: query },
    })
    expect(wrapper.find('input').element.value).toBe(query)
  })

  it('toggles group-by-part view', async () => {
    const wrapper = mount(UnitBrowser, {
      props: { units: sampleUnits },
    })
    const buttons = wrapper.findAll('button')
    const groupBtn = buttons.find(b => b.text().includes('Group by part'))
    expect(groupBtn).toBeTruthy()

    await groupBtn!.trigger('click')

    // After toggling, the button has the active (teal) styling
    expect(groupBtn!.classes().some(c => c.includes('teal'))).toBe(true)
  })
})
