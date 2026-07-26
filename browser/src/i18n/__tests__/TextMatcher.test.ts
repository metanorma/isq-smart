import { describe, it, expect } from 'vitest'
import { TextMatcher, buildTextMatcher } from '../TextMatcher'
import { ENG, FRA } from '../Language'

describe('TextMatcher', () => {
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

  const matcher = buildTextMatcher(messages)

  it('returns null for English (no translation needed)', () => {
    expect(matcher.translateText('Quantities', ENG)).toBeNull()
  })

  it('translates exact match to French', () => {
    expect(matcher.translateText('Quantities', FRA)).toBe('Grandeurs')
  })

  it('preserves leading whitespace', () => {
    expect(matcher.translateText('  Quantities', FRA)).toBe('  Grandeurs')
  })

  it('preserves trailing whitespace', () => {
    expect(matcher.translateText('Quantities  ', FRA)).toBe('Grandeurs  ')
  })

  it('preserves both leading and trailing whitespace', () => {
    expect(matcher.translateText('\t Quantities \n', FRA)).toBe('\t Grandeurs \n')
  })

  it('returns null when no match is found', () => {
    expect(matcher.translateText('Unknown text', FRA)).toBeNull()
  })

  it('handles multi-word phrases', () => {
    const phraseMessages = {
      en: { greeting: 'Hello world' },
      fr: { greeting: 'Bonjour le monde' },
    }
    const m = buildTextMatcher(phraseMessages)
    expect(m.translateText('Hello world', FRA)).toBe('Bonjour le monde')
  })
})

describe('buildTextMatcher', () => {
  it('skips entries where en and fr are identical', () => {
    const messages = {
      en: { same: 'ISO', different: 'Units' },
      fr: { same: 'ISO', different: 'Unités' },
    }
    const matcher = buildTextMatcher(messages)
    expect(matcher.translateText('ISO', FRA)).toBeNull()
    expect(matcher.translateText('Units', FRA)).toBe('Unités')
  })
})
