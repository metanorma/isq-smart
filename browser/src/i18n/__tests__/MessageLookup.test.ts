import { describe, it, expect } from 'vitest'
import { MessageLookup } from '../MessageLookup'

describe('MessageLookup', () => {
  const messages = {
    en: {
      nav: { quantities: 'Quantities', math: 'Math' },
      label: { entries: 'entries' },
    },
    fr: {
      nav: { quantities: 'Grandeurs', math: 'Mathématiques' },
      label: { entries: 'entrées' },
    },
  }

  const lookup = new MessageLookup(messages)

  it('resolves a nested key for English', () => {
    expect(lookup.resolve({ htmlLang: 'en' }, 'nav.quantities')).toBe('Quantities')
  })

  it('resolves a nested key for French', () => {
    expect(lookup.resolve({ htmlLang: 'fr' }, 'nav.quantities')).toBe('Grandeurs')
  })

  it('returns the key itself when not found', () => {
    expect(lookup.resolve({ htmlLang: 'en' }, 'nav.nonexistent')).toBe('nav.nonexistent')
  })

  it('returns the key when the resolved value is not a string', () => {
    expect(lookup.resolve({ htmlLang: 'en' }, 'nav')).toBe('nav')
  })

  it('returns the key for an empty message map', () => {
    const sparse = new MessageLookup({ en: {}, fr: {} })
    expect(sparse.resolve({ htmlLang: 'en' }, 'anything')).toBe('anything')
  })

  it('has() returns true for existing keys', () => {
    expect(lookup.has({ htmlLang: 'en' }, 'nav.math')).toBe(true)
  })

  it('has() returns false for missing keys', () => {
    expect(lookup.has({ htmlLang: 'en' }, 'nav.nonexistent')).toBe(false)
  })

  it('resolves deeply nested keys', () => {
    const deep = new MessageLookup({
      en: { a: { b: { c: { d: 'deep' } } } },
      fr: {},
    })
    expect(deep.resolve({ htmlLang: 'en' }, 'a.b.c.d')).toBe('deep')
  })
})
