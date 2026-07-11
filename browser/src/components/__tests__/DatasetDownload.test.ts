import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DatasetDownload from '../DatasetDownload.vue'

describe('DatasetDownload', () => {
  let createdAnchors: { click: ReturnType<typeof vi.fn> }[]

  beforeEach(() => {
    createdAnchors = []

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })

    // Override HTMLElement.prototype.click for <a> elements so we can
    // detect the download without infinite recursion from spying on
    // document.createElement.
    const proto = HTMLAnchorElement.prototype
    const origClick = proto.click
    proto.click = vi.fn(function (this: HTMLAnchorElement) {
      createdAnchors.push({ click: this.click as ReturnType<typeof vi.fn> })
    }) as typeof origClick
    // Store for restore
    ;(proto as unknown as { _origClick: typeof origClick })._origClick = origClick
  })

  afterEach(() => {
    const proto = HTMLAnchorElement.prototype as HTMLAnchorElement & { _origClick?: () => void }
    if (proto._origClick) {
      proto.click = proto._origClick
      delete proto._origClick
    }
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders two download buttons', () => {
    const wrapper = mount(DatasetDownload)
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(2)
  })

  it('renders a JSON-LD download button', () => {
    const wrapper = mount(DatasetDownload)
    expect(wrapper.text()).toContain('JSON-LD')
  })

  it('renders an RDF Turtle download button', () => {
    const wrapper = mount(DatasetDownload)
    expect(wrapper.text()).toContain('RDF Turtle')
  })

  it('JSON-LD button click triggers download', async () => {
    const wrapper = mount(DatasetDownload)
    const buttons = wrapper.findAll('button')
    const jsonldBtn = buttons.find(b => b.text().includes('JSON-LD'))!
    await jsonldBtn.trigger('click')
    // Allow async downloadDataset to resolve
    await vi.dynamicImportSettled()

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
    expect(createdAnchors.length).toBeGreaterThanOrEqual(1)
  })

  it('Turtle button click triggers download', async () => {
    const wrapper = mount(DatasetDownload)
    const buttons = wrapper.findAll('button')
    const turtleBtn = buttons.find(b => b.text().includes('RDF Turtle'))!
    await turtleBtn.trigger('click')
    await vi.dynamicImportSettled()

    expect(URL.createObjectURL).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
    expect(createdAnchors.length).toBeGreaterThanOrEqual(1)
  })
})
