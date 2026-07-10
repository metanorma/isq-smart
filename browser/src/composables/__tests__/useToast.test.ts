import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '../useToast'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

import { afterEach } from 'vitest'

describe('useToast', () => {
  it('starts hidden with an empty message', () => {
    const { message, visible } = useToast()
    expect(message.value).toBe('')
    expect(visible.value).toBe(false)
  })

  it('shows the message when show() is called', () => {
    const { message, visible, show } = useToast()
    show('Copied!')
    expect(message.value).toBe('Copied!')
    expect(visible.value).toBe(true)
  })

  it('hides after the default 2000ms duration', () => {
    const { visible, show } = useToast()
    show('Hello')
    expect(visible.value).toBe(true)
    vi.advanceTimersByTime(2000)
    expect(visible.value).toBe(false)
  })

  it('accepts a custom duration', () => {
    const { visible, show } = useToast()
    show('Hello', 500)
    vi.advanceTimersByTime(499)
    expect(visible.value).toBe(true)
    vi.advanceTimersByTime(1)
    expect(visible.value).toBe(false)
  })

  it('reschedules when shown again before the timer fires', () => {
    const { message, visible, show } = useToast()
    show('First')
    vi.advanceTimersByTime(1500)
    show('Second')
    vi.advanceTimersByTime(1500)
    expect(visible.value).toBe(true)
    expect(message.value).toBe('Second')
    vi.advanceTimersByTime(500)
    expect(visible.value).toBe(false)
  })
})
