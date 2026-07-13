import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CitationBuilder from '../CitationBuilder.vue'
import type { Entry, PartMeta } from '../../data/types'

const meta: PartMeta = {
  domain: 'quantities',
  partKey: '3',
  title: 'Space and Time',
  description: '',
  icon: '🌌',
  accent: 'brand',
}

function mkEntry(): Entry {
  return {
    _tag: 'quantity' as const,
    partKey: '3',
    edition: '2019',
    id: '4-1',
    num: '4-1',
    designations: [{ designation: { en: { text: 'length' } } }],
    def: { en: 'Distance between two points' },
  }
}

describe('CitationBuilder', () => {
  it('renders tab buttons for all 5 formats', () => {
    const wrapper = mount(CitationBuilder, {
      props: { entry: mkEntry(), meta, edition: '2019' },
    })
    const buttons = wrapper.findAll('button')
    const labels = buttons.map(b => b.text())
    expect(labels.some(l => l.includes('URL/URN'))).toBe(true)
    expect(labels.some(l => l.includes('BibTeX'))).toBe(true)
    expect(labels.some(l => l.includes('Chicago'))).toBe(true)
    expect(labels.some(l => l.includes('RIS'))).toBe(true)
    expect(labels.some(l => l.includes('Turtle'))).toBe(true)
  })

  it('shows URL/URN content by default', () => {
    const wrapper = mount(CitationBuilder, {
      props: { entry: mkEntry(), meta, edition: '2019' },
    })
    expect(wrapper.text()).toContain('urn:iso:std:iso:80000')
  })

  it('switches to BibTeX when tab clicked', async () => {
    const wrapper = mount(CitationBuilder, {
      props: { entry: mkEntry(), meta, edition: '2019' },
    })
    const bibtexBtn = wrapper.findAll('button').find(b => b.text().includes('BibTeX'))
    await bibtexBtn!.trigger('click')
    expect(wrapper.text()).toContain('@standard')
  })

  it('switches to Chicago format', async () => {
    const wrapper = mount(CitationBuilder, {
      props: { entry: mkEntry(), meta, edition: '2019' },
    })
    const btn = wrapper.findAll('button').find(b => b.text().includes('Chicago'))
    await btn!.trigger('click')
    expect(wrapper.text()).toContain('ISO 80000')
  })

  it('switches to RIS format', async () => {
    const wrapper = mount(CitationBuilder, {
      props: { entry: mkEntry(), meta, edition: '2019' },
    })
    const btn = wrapper.findAll('button').find(b => b.text().includes('RIS'))
    await btn!.trigger('click')
    expect(wrapper.text()).toContain('TY  - STD')
  })

  it('switches to Turtle format', async () => {
    const wrapper = mount(CitationBuilder, {
      props: { entry: mkEntry(), meta, edition: '2019' },
    })
    const btn = wrapper.findAll('button').find(b => b.text().includes('Turtle'))
    await btn!.trigger('click')
    expect(wrapper.text()).toContain('@prefix')
  })
})
