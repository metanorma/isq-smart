import { describe, it, expect } from 'vitest'
import { t, tMap, getLangFromPath, allKeys } from '../index'
import type { Lang } from '../index'

describe('i18n', () => {
  describe('t() translation function', () => {
    it('returns English string by default', () => {
      expect(t('nav.quantities')).toBe('Quantities')
    })

    it('returns French string when lang=fr', () => {
      expect(t('nav.quantities', 'fr')).toBe('Grandeurs')
    })

    it('returns English fallback when French key is missing', () => {
      expect(t('nav.math', 'fr')).toBe('Mathématiques')
    })

    it('returns key itself when translation is completely missing', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key')
    })

    it('handles nested keys', () => {
      expect(t('page.quantities.title')).toBe('Quantities')
      expect(t('page.quantities.title', 'fr')).toBe('Grandeurs')
    })
  })

  describe('tMap() multi-language lookup', () => {
    it('returns both en and fr for a key', () => {
      const map = tMap('nav.units')
      expect(map.en).toBe('Units')
      expect(map.fr).toBe('Unités')
    })
  })

  describe('getLangFromPath()', () => {
    it('returns "fr" for /fr/ paths', () => {
      expect(getLangFromPath('/fr/quantities')).toBe('fr')
      expect(getLangFromPath('/isq-smart/fr/quantities')).toBe('fr')
    })

    it('returns "en" for non-fr paths', () => {
      expect(getLangFromPath('/quantities')).toBe('en')
      expect(getLangFromPath('/isq-smart/quantities')).toBe('en')
    })

    it('returns "en" for root path', () => {
      expect(getLangFromPath('/')).toBe('en')
    })
  })

  describe('allKeys()', () => {
    it('returns a flat list of all translation keys', () => {
      const keys = allKeys()
      expect(keys).toContain('nav.quantities')
      expect(keys).toContain('nav.kinds')
      expect(keys).toContain('page.quantities.title')
      expect(keys).toContain('label.definition')
      expect(keys).toContain('footer.content')
    })

    it('every key resolves in both languages', () => {
      const keys = allKeys()
      for (const key of keys) {
        expect(t(key, 'en')).not.toBe(key)
        expect(t(key, 'fr')).not.toBe(key)
      }
    })
  })
})
