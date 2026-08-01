import { describe, it, expect } from 'vitest'
import { langValue } from '../langValue'

describe('langValue', () => {
  it('returns English value for en', () => {
    expect(langValue({ en: 'length', fr: 'longueur' }, 'en')).toBe('length')
  })

  it('returns French value for fr', () => {
    expect(langValue({ en: 'length', fr: 'longueur' }, 'fr')).toBe('longueur')
  })

  it('falls back to English when French is missing', () => {
    expect(langValue({ en: 'length' }, 'fr')).toBe('length')
  })

  it('returns empty string for undefined object', () => {
    expect(langValue(undefined, 'en')).toBe('')
  })

  it('returns empty string for undefined object with fr', () => {
    expect(langValue(undefined, 'fr')).toBe('')
  })
})
