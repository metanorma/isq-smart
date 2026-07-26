import { ENG, FRA } from './Language'
import type { Language } from './Language'

const STORAGE_KEY = 'isq-lang'

const byHtmlLang = new Map<string, Language>([
  ['en', ENG],
  ['fr', FRA],
])

export class LanguageStore {
  get(): Language {
    if (typeof localStorage === 'undefined') return ENG
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (byHtmlLang.get(stored) ?? ENG) : ENG
  }

  set(lang: Language): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang.htmlLang)
    }
  }
}

export function createLanguageStore(): LanguageStore {
  return new LanguageStore()
}
