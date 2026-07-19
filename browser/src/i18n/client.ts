import type { Lang } from './index'
import { messages } from './messages'

const STORAGE_KEY = 'isq-lang'
const DEFAULT_LANG: Lang = 'en'

export function getStoredLang(): Lang {
  if (typeof localStorage === 'undefined') return DEFAULT_LANG
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'fr' || stored === 'en' ? stored : DEFAULT_LANG
}

export function setStoredLang(lang: Lang): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang)
}

function lookup(lang: Lang, key: string): string {
  const parts = key.split('.')
  let result: unknown = (messages as Record<string, unknown>)[lang]
  for (const part of parts) {
    if (typeof result !== 'object' || result === null) return key
    result = (result as Record<string, unknown>)[part]
  }
  return typeof result === 'string' ? result : key
}

export function applyLanguage(lang: Lang): void {
  document.documentElement.lang = lang
  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]')
  elements.forEach((el) => {
    const key = el.dataset.i18n
    if (!key) return
    el.textContent = lookup(lang, key)
  })
  document.dispatchEvent(new CustomEvent('language-change', { detail: { lang } }))
}

export function initLanguage(): Lang {
  const lang = getStoredLang()
  applyLanguage(lang)
  return lang
}
