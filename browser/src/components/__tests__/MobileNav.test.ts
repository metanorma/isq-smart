import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MobileNav from '../MobileNav.vue'

const links = [
  { to: '/quantities', label: 'Quantities' },
  { to: '/math', label: 'Math' },
  { to: '/units', label: 'Units' },
]

describe('MobileNav', () => {
  it('renders a hamburger button', () => {
    const wrapper = mount(MobileNav, {
      props: { links, activePath: '/quantities' },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBe('Menu')
  })

  it('does not show the menu initially', () => {
    const wrapper = mount(MobileNav, {
      props: { links, activePath: '/quantities' },
    })
    expect(wrapper.findAll('a').length).toBe(0)
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
  })

  it('toggles the menu open on button click', async () => {
    const wrapper = mount(MobileNav, {
      props: { links, activePath: '/quantities' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('a').length).toBe(3)
  })

  it('renders all links with correct hrefs when open', async () => {
    const wrapper = mount(MobileNav, {
      props: { links, activePath: '/quantities' },
    })
    await wrapper.find('button').trigger('click')

    const anchors = wrapper.findAll('a')
    expect(anchors[0].attributes('href')).toBe('/quantities')
    expect(anchors[0].text()).toBe('Quantities')
    expect(anchors[1].attributes('href')).toBe('/math')
    expect(anchors[1].text()).toBe('Math')
    expect(anchors[2].attributes('href')).toBe('/units')
    expect(anchors[2].text()).toBe('Units')
  })

  it('closes the menu when a link is clicked', async () => {
    const wrapper = mount(MobileNav, {
      props: { links, activePath: '/quantities' },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.findAll('a').length).toBe(3)

    await wrapper.findAll('a')[0].trigger('click')
    expect(wrapper.findAll('a').length).toBe(0)
  })

  it('applies active styling to the matching link', async () => {
    const wrapper = mount(MobileNav, {
      props: { links, activePath: '/quantities/part-3/t3-1.1' },
    })
    await wrapper.find('button').trigger('click')

    const activeLink = wrapper.findAll('a')[0]
    expect(activeLink.classes()).toContain('font-medium')
    expect(activeLink.classes().some(c => c.includes('brand'))).toBe(true)
  })
})
