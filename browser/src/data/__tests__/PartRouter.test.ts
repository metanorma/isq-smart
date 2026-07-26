import { describe, it, expect } from 'vitest'
import { PartRouter } from '../PartRouter'

const BASE = import.meta.env.BASE_URL ?? '/'

describe('PartRouter', () => {
  it('generates URL for a quantities part', () => {
    expect(PartRouter.partUrl('3')).toBe(`${BASE}quantities/part-3`.replace(/\/{2,}/g, '/'))
  })

  it('generates URL for a math part', () => {
    expect(PartRouter.partUrl('2-5')).toBe(`${BASE}math/part-2-5`.replace(/\/{2,}/g, '/'))
  })

  it('generates URL for an entry within a part', () => {
    expect(PartRouter.entryUrl('3', 't3-1.1')).toBe(`${BASE}quantities/part-3/t3-1.1`.replace(/\/{2,}/g, '/'))
  })

  it('generates URL for a math entry', () => {
    expect(PartRouter.entryUrl('2-5', 't2-5.1')).toBe(`${BASE}math/part-2-5/t2-5.1`.replace(/\/{2,}/g, '/'))
  })

  it('returns root for unknown part', () => {
    expect(PartRouter.partUrl('999' as never)).toBe('/')
  })

  it('resolves domain path for quantities', () => {
    const expected = `${BASE}quantities`.replace(/\/{2,}/g, '/')
    expect(PartRouter.domainPath('quantities')).toBe(expected)
  })

  it('resolves domain path for math', () => {
    const expected = `${BASE}math`.replace(/\/{2,}/g, '/')
    expect(PartRouter.domainPath('math')).toBe(expected)
  })
})
