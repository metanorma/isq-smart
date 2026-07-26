import { describe, it, expect, beforeEach } from 'vitest'
import { LanguageStore } from '../LanguageStore'
import { ENG, FRA } from '../Language'

describe('LanguageStore', () => {
  let store: LanguageStore

  beforeEach(() => {
    localStorage.clear()
    store = new LanguageStore()
  })

  it('returns English by default', () => {
    expect(store.get()).toBe(ENG)
  })

  it('stores and retrieves French', () => {
    store.set(FRA)
    expect(store.get()).toBe(FRA)
  })

  it('stores and retrieves English', () => {
    store.set(FRA)
    store.set(ENG)
    expect(store.get()).toBe(ENG)
  })

  it('falls back to English for unknown stored values', () => {
    localStorage.setItem('isq-lang', 'de')
    expect(store.get()).toBe(ENG)
  })

  it('falls back to English when storage is empty', () => {
    expect(store.get()).toBe(ENG)
  })
})
