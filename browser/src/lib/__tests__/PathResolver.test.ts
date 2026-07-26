import { describe, it, expect } from 'vitest'
import { PathResolver } from '../PathResolver'

describe('PathResolver', () => {
  const resolver = new PathResolver('/isq-smart/')

  it('resolves a simple path', () => {
    expect(resolver.resolve('/quantities')).toBe('/isq-smart/quantities')
  })

  it('normalizes double slashes', () => {
    expect(resolver.resolve('//quantities')).toBe('/isq-smart/quantities')
  })

  it('resolves a quantities part URL', () => {
    expect(resolver.part('quantities', '3')).toBe('/isq-smart/quantities/part-3')
  })

  it('resolves a math part URL', () => {
    expect(resolver.part('math', '2-5')).toBe('/isq-smart/math/part-2-5')
  })

  it('resolves an entry URL', () => {
    expect(resolver.entry('quantities', '3', 't3-1.1')).toBe('/isq-smart/quantities/part-3/t3-1.1')
  })

  it('resolves a domain path', () => {
    expect(resolver.domainPath('math')).toBe('/isq-smart/math')
    expect(resolver.domainPath('quantities')).toBe('/isq-smart/quantities')
  })

  it('handles root base', () => {
    const root = new PathResolver('/')
    expect(root.resolve('/quantities')).toBe('/quantities')
  })

  it('handles empty path', () => {
    expect(resolver.resolve('')).toBe('/isq-smart/')
  })
})
