import { describe, it, expect } from 'vitest'
import { ENG, FRA, languageFromCode, defaultLanguage, ALL_LANGUAGES } from '../Language'

describe('Language', () => {
  it('ENG has correct properties', () => {
    expect(ENG.code).toBe('eng')
    expect(ENG.htmlLang).toBe('en')
    expect(ENG.displayName).toBe('English')
  })

  it('FRA has correct properties', () => {
    expect(FRA.code).toBe('fra')
    expect(FRA.htmlLang).toBe('fr')
    expect(FRA.displayName).toBe('Français')
  })

  it('ALL_LANGUAGES contains both languages', () => {
    expect(ALL_LANGUAGES).toHaveLength(2)
    expect(ALL_LANGUAGES).toContain(ENG)
    expect(ALL_LANGUAGES).toContain(FRA)
  })
})

describe('languageFromCode', () => {
  it('resolves eng to English', () => {
    expect(languageFromCode('eng')).toBe(ENG)
  })

  it('resolves fra to French', () => {
    expect(languageFromCode('fra')).toBe(FRA)
  })

  it('resolves en (ISO 639-1) to English', () => {
    expect(languageFromCode('en')).toBe(ENG)
  })

  it('resolves fr (ISO 639-1) to French', () => {
    expect(languageFromCode('fr')).toBe(FRA)
  })

  it('returns undefined for unknown codes', () => {
    expect(languageFromCode('de')).toBeUndefined()
    expect(languageFromCode('')).toBeUndefined()
  })
})

describe('defaultLanguage', () => {
  it('returns English as the default', () => {
    expect(defaultLanguage()).toBe(ENG)
  })
})
