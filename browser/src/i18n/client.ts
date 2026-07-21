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

const enFlat = new Map<string, string>()
const frFlat = new Map<string, string>()

function flatten(obj: Record<string, unknown>, prefix = '') {
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'object' && v !== null) flatten(v as Record<string, unknown>, full)
    else if (typeof v === 'string') {
      if (prefix.startsWith('en')) enFlat.set(v, full)
      else if (prefix.startsWith('fr')) frFlat.set(full, v)
    }
  }
}
flatten(messages.en as unknown as Record<string, unknown>, 'en')
flatten(messages.fr as unknown as Record<string, unknown>, 'fr')

const enToFr = new Map<string, string>()
for (const [enText, key] of enFlat) {
  const frText = frFlat.get(key)
  if (frText && frText !== enText) enToFr.set(enText, frText)
}

function applyDataI18n(lang: Lang): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    if (!key) return
    const translated = lookup(lang, key)
    if (translated !== key) el.textContent = translated
  })
}

function applyTextMatching(lang: Lang): void {
  if (lang === 'en') return
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent?.trim()
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT
      if (node.parentElement?.closest('script, style, code, pre, kbd, input, textarea'))
        return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes: Text[] = []
  while (walker.nextNode()) nodes.push(walker.currentNode as Text)
  for (const node of nodes) {
    const original = node.textContent?.trim()
    if (!original) continue
    const translated = enToFr.get(original)
    if (translated) {
      const leading = node.textContent?.match(/^\s*/)?.[0] ?? ''
      const trailing = node.textContent?.match(/\s*$/)?.[0] ?? ''
      node.textContent = leading + translated + trailing
    }
  }
}

export function applyLanguage(lang: Lang, reload = false): void {
  if (reload) {
    setStoredLang(lang)
    window.location.reload()
    return
  }
  document.documentElement.lang = lang
  applyDataI18n(lang)
  applyTextMatching(lang)
  document.dispatchEvent(new CustomEvent('language-change', { detail: { lang } }))
}

export function initLanguage(): Lang {
  const lang = getStoredLang()
  if (lang !== DEFAULT_LANG) {
    document.documentElement.lang = lang
    requestAnimationFrame(() => {
      applyDataI18n(lang)
      applyTextMatching(lang)
    })
  }
  return lang
}
