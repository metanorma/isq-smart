import { describe, it, expect } from 'vitest'
import { asset } from '../asset'

describe('asset', () => {
  it('resolves a simple path', () => {
    const result = asset('/img/logo.svg')
    expect(result).toMatch(/img\/logo\.svg$/)
  })

  it('handles path without leading slash', () => {
    expect(asset('img/logo.svg')).toBe(asset('/img/logo.svg'))
  })

  it('handles multiple leading slashes', () => {
    expect(asset('///img/logo.svg')).toBe(asset('/img/logo.svg'))
  })

  it('produces no double slashes in output', () => {
    const result = asset('/img/logo.svg')
    expect(result).not.toContain('//')
  })
})
